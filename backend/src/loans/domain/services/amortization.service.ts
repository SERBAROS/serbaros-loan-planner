/**
 * Servicio de dominio: cálculo del plan de pagos / amortización de un crédito.
 * Sin dependencias de ningún framework — es el núcleo de negocio puro.
 *
 * Fórmulas base (réplica del Excel original "plan_pagos_sb.xlsx"):
 *
 *   Tasa Mensual   = (1+TEA)^(1/12) - 1
 *   Interés(n)     = IF(INT(SaldoInicial(n))<1, 0, SaldoInicial(n) * TasaMensual)
 *   Capital(n)     = IF(INT(SaldoInicial(n))<1, 0, Cuota - Interés(n))
 *   SaldoFinal(n)  = IF(INT(Interés(n))<1, 0, SaldoInicial(n) - Capital(n) - AbonoExtra(n))
 *   Fecha(n)       = Fecha(n-1) + 30 días
 *
 * IMPORTANTE: "Valor de la cuota" es un dato de ENTRADA opcional (no una
 * fórmula): si no se especifica, se usa el PMT teórico como sugerencia; si
 * se especifica, se usa tal cual, y el número de cuotas reales hasta saldar
 * el crédito puede diferir del solicitado.
 *
 * SISTEMA DE ABONOS (unificado): en vez de campos fijos con meses
 * hardcodeados (como "primas en junio/diciembre"), cualquier abono extra se
 * define con uno de 3 tipos:
 *   - PUNTUAL: un monto en una cuota o fecha específica, una sola vez.
 *   - RECURRENTE: un monto que se repite cada N meses/años desde una fecha
 *     de inicio, indefinidamente o hasta una fecha límite opcional.
 *   - GRUPO_RECURRENTE: varios RECURRENTE agrupados bajo un nombre (ej. para
 *     recrear "primas cada 6 meses + cesantías cada 12 meses" como un solo
 *     compromiso con nombre propio).
 *
 * La resolución de fecha→cuota es determinística: cada cuota cae exactamente
 * 30 días después de la anterior, así que un abono recurrente/puntual por
 * fecha se aplica en la PRIMERA cuota cuya fecha sea igual o posterior a la
 * fecha objetivo (ventana (fechaCuotaAnterior, fechaCuotaActual]).
 */

export type UnidadPeriodo = 'MESES' | 'ANIOS';

export interface AbonoPuntual {
  id?: string;
  tipo: 'PUNTUAL';
  monto: number;
  numeroCuota?: number;
  fecha?: string;
}

export interface AbonoRecurrente {
  id?: string;
  tipo: 'RECURRENTE';
  monto: number;
  cada: number;
  unidad: UnidadPeriodo;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface AbonoGrupoRecurrenteItem {
  monto: number;
  cada: number;
  unidad: UnidadPeriodo;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface AbonoGrupoRecurrente {
  id?: string;
  tipo: 'GRUPO_RECURRENTE';
  nombre: string;
  items: AbonoGrupoRecurrenteItem[];
}

export type AbonoDefinition = AbonoPuntual | AbonoRecurrente | AbonoGrupoRecurrente;

export interface AbonoCapital {
  numeroCuota: number;
  monto: number;
}

export interface CalcularPlanPagosInput {
  monto: number;
  tasaEfectivaAnual: number;
  numeroCuotas: number;
  mesInicioAmortizacion: string | Date;
  valorCuotaManual?: number | null;
  abonos?: AbonoDefinition[];
  numeroCuotaInicial?: number;
  maxFilas?: number;
}

export interface FilaAmortizacion {
  numeroCuota: number;
  saldoInicial: number;
  interes: number;
  capital: number;
  cuota: number;
  abonoExtra: number;
  saldoFinal: number;
  fecha: string;
}

export interface SaldoAnual {
  cuota: number;
  fecha: string;
  interesAcumulado: number;
}

export interface ResumenPlanPagos {
  monto: number;
  tasaEfectivaAnual: number;
  tasaMensual: number;
  numeroCuotasSolicitadas: number;
  numeroCuotasReales: number;
  numeroCuotaInicial: number;
  valorCuotaTeorica: number;
  valorCuota: number;
  esCuotaManual: boolean;
  mesInicioAmortizacion: string;
  totalIntereses: number;
  totalCapital: number;
  totalAbonosExtra: number;
  totalPagado: number;
}

export interface PlanPagos {
  resumen: ResumenPlanPagos;
  tabla: FilaAmortizacion[];
  saldosAnuales: SaldoAnual[];
}

export class SaldoNuncaSeAmortizaError extends Error {
  constructor() {
    super(
      'El valor de la cuota es menor o igual al interés del primer periodo: el saldo nunca se amortiza. Aumenta la cuota.',
    );
    this.name = 'SaldoNuncaSeAmortizaError';
  }
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const originalDay = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const daysInTargetMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(originalDay, daysInTargetMonth));
  return d;
}

interface RecurrenteResuelto {
  monto: number;
  periodoMeses: number;
  nextTarget: Date;
  fechaFin: Date | null;
}

interface PuntualPorFechaResuelto {
  monto: number;
  fecha: Date;
  consumido: boolean;
}

export class AmortizationDomainService {
  static tasaMensual(tasaEfectivaAnual: number): number {
    return Math.pow(1 + tasaEfectivaAnual, 1 / 12) - 1;
  }

  static valorCuotaTeorica(monto: number, tasaMensual: number, numeroCuotas: number): number {
    if (tasaMensual === 0) return monto / numeroCuotas;
    const factor = Math.pow(1 + tasaMensual, numeroCuotas);
    return (monto * tasaMensual * factor) / (factor - 1);
  }

  private static excelInt(value: number): number {
    return Math.trunc(value);
  }

  private static sumarDias(fecha: Date, dias: number): Date {
    const d = new Date(fecha);
    d.setUTCDate(d.getUTCDate() + dias);
    return d;
  }

  private static round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  private static periodoEnMeses(cada: number, unidad: UnidadPeriodo): number {
    return unidad === 'ANIOS' ? cada * 12 : cada;
  }

  private static prepararAbonos(abonos: AbonoDefinition[]): {
    puntualPorCuota: Map<number, number>;
    puntualPorFecha: PuntualPorFechaResuelto[];
    recurrentes: RecurrenteResuelto[];
  } {
    const puntualPorCuota = new Map<number, number>();
    const puntualPorFecha: PuntualPorFechaResuelto[] = [];
    const recurrentes: RecurrenteResuelto[] = [];

    const agregarRecurrente = (monto: number, cada: number, unidad: UnidadPeriodo, fechaInicio: string, fechaFin?: string | null) => {
      if (!(monto > 0)) throw new Error('El monto de un abono recurrente debe ser mayor a 0.');
      if (!(cada > 0) || !Number.isInteger(cada)) {
        throw new Error('La periodicidad de un abono recurrente debe ser un entero mayor a 0.');
      }
      if (!fechaInicio || isNaN(Date.parse(fechaInicio))) {
        throw new Error('La fecha de inicio de un abono recurrente es inválida.');
      }
      recurrentes.push({
        monto,
        periodoMeses: this.periodoEnMeses(cada, unidad),
        nextTarget: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
      });
    };

    for (const abono of abonos) {
      if (abono.tipo === 'PUNTUAL') {
        if (!(abono.monto > 0)) throw new Error('El monto de un abono puntual debe ser mayor a 0.');
        const tieneCuota = abono.numeroCuota != null;
        const tieneFecha = !!abono.fecha;
        if (tieneCuota === tieneFecha) {
          throw new Error('Un abono puntual debe indicar exactamente uno: número de cuota o fecha.');
        }
        if (tieneCuota) {
          if (!(abono.numeroCuota! > 0) || !Number.isInteger(abono.numeroCuota)) {
            throw new Error('El número de cuota de un abono puntual debe ser un entero mayor a 0.');
          }
          puntualPorCuota.set(abono.numeroCuota!, (puntualPorCuota.get(abono.numeroCuota!) ?? 0) + abono.monto);
        } else {
          if (isNaN(Date.parse(abono.fecha!))) throw new Error('La fecha de un abono puntual es inválida.');
          puntualPorFecha.push({ monto: abono.monto, fecha: new Date(abono.fecha!), consumido: false });
        }
      } else if (abono.tipo === 'RECURRENTE') {
        agregarRecurrente(abono.monto, abono.cada, abono.unidad, abono.fechaInicio, abono.fechaFin);
      } else if (abono.tipo === 'GRUPO_RECURRENTE') {
        for (const item of abono.items) {
          agregarRecurrente(item.monto, item.cada, item.unidad, item.fechaInicio, item.fechaFin);
        }
      }
    }

    return { puntualPorCuota, puntualPorFecha, recurrentes };
  }

  private static resolverAbonoExtra(
    numeroCuotaAbsoluto: number,
    fechaCuota: Date,
    fechaAnterior: Date | null,
    estado: ReturnType<typeof AmortizationDomainService.prepararAbonos>,
  ): number {
    let total = estado.puntualPorCuota.get(numeroCuotaAbsoluto) ?? 0;

    for (const p of estado.puntualPorFecha) {
      if (p.consumido) continue;
      const enVentana = fechaAnterior === null ? p.fecha <= fechaCuota : p.fecha > fechaAnterior && p.fecha <= fechaCuota;
      if (enVentana) {
        total += p.monto;
        p.consumido = true;
      }
    }

    for (const r of estado.recurrentes) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (r.fechaFin && r.nextTarget > r.fechaFin) break;
        const enVentana = fechaAnterior === null ? r.nextTarget <= fechaCuota : r.nextTarget > fechaAnterior && r.nextTarget <= fechaCuota;
        if (!enVentana) break;
        total += r.monto;
        r.nextTarget = addMonths(r.nextTarget, r.periodoMeses);
      }
    }

    return total;
  }

  static calcular(input: CalcularPlanPagosInput): PlanPagos {
    const {
      monto,
      tasaEfectivaAnual,
      numeroCuotas,
      mesInicioAmortizacion,
      valorCuotaManual = null,
      abonos = [],
      numeroCuotaInicial = 1,
      maxFilas = 1000,
    } = input;

    if (!(monto > 0)) throw new Error('El monto del préstamo debe ser mayor a 0');
    if (!(tasaEfectivaAnual >= 0)) throw new Error('La tasa efectiva anual debe ser mayor o igual a 0');
    if (!(numeroCuotas > 0)) throw new Error('El número de cuotas debe ser mayor a 0');
    if (!mesInicioAmortizacion) throw new Error('Debe indicar el mes de inicio de amortización');
    if (!(numeroCuotaInicial > 0) || !Number.isInteger(numeroCuotaInicial)) {
      throw new Error('El número de cuota inicial debe ser un entero mayor a 0.');
    }

    const estadoAbonos = this.prepararAbonos(abonos);

    const tasaMes = this.tasaMensual(tasaEfectivaAnual);
    const cuotaTeorica = this.valorCuotaTeorica(monto, tasaMes, numeroCuotas);
    const cuota = valorCuotaManual != null && valorCuotaManual > 0 ? valorCuotaManual : cuotaTeorica;

    if (cuota <= monto * tasaMes) {
      throw new SaldoNuncaSeAmortizaError();
    }

    const fechaInicio = new Date(mesInicioAmortizacion);
    const tabla: FilaAmortizacion[] = [];
    let saldoFechaAnterior: Date | null = null;
    let n = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      n++;
      const numeroCuotaAbsoluto = numeroCuotaInicial + n - 1;
      const saldoInicial = n === 1 ? monto : tabla[n - 2].saldoFinal;
      const fechaCuota: Date = n === 1 ? fechaInicio : this.sumarDias(saldoFechaAnterior as Date, 30);

      const interes = this.excelInt(saldoInicial) < 1 ? 0 : saldoInicial * tasaMes;
      const capital = this.excelInt(saldoInicial) < 1 ? 0 : cuota - interes;

      const abonoExtra =
        this.excelInt(interes) < 1
          ? 0
          : this.resolverAbonoExtra(numeroCuotaAbsoluto, fechaCuota, n === 1 ? null : saldoFechaAnterior, estadoAbonos);

      const saldoFinal = this.excelInt(interes) < 1 ? 0 : saldoInicial - capital - abonoExtra;

      tabla.push({
        numeroCuota: numeroCuotaAbsoluto,
        saldoInicial: this.round2(saldoInicial),
        interes: this.round2(interes),
        capital: this.round2(capital),
        cuota: this.round2(cuota),
        abonoExtra: this.round2(abonoExtra),
        saldoFinal: this.round2(saldoFinal),
        fecha: fechaCuota.toISOString().slice(0, 10),
      });

      saldoFechaAnterior = fechaCuota;

      if (saldoFinal <= 0 || this.excelInt(interes) < 1) break;
      if (n >= maxFilas) break;
    }

    const cuotasReales = tabla.length;

    const saldosAnuales: SaldoAnual[] = [];
    for (let k = 12; k <= cuotasReales; k += 12) {
      const sumaIntereses = tabla.slice(0, k).reduce((acc, f) => acc + f.interes, 0);
      saldosAnuales.push({
        cuota: tabla[k - 1].numeroCuota,
        fecha: tabla[k - 1].fecha,
        interesAcumulado: this.round2(sumaIntereses),
      });
    }

    const totalIntereses = this.round2(tabla.reduce((acc, f) => acc + f.interes, 0));
    const totalCapital = this.round2(tabla.reduce((acc, f) => acc + f.capital, 0));
    const totalAbonosExtra = this.round2(tabla.reduce((acc, f) => acc + f.abonoExtra, 0));
    const totalPagado = this.round2(tabla.reduce((acc, f) => acc + f.cuota + f.abonoExtra, 0));

    return {
      resumen: {
        monto: this.round2(monto),
        tasaEfectivaAnual,
        tasaMensual: tasaMes,
        numeroCuotasSolicitadas: numeroCuotas,
        numeroCuotasReales: cuotasReales,
        numeroCuotaInicial,
        valorCuotaTeorica: this.round2(cuotaTeorica),
        valorCuota: this.round2(cuota),
        esCuotaManual: valorCuotaManual != null && valorCuotaManual > 0,
        mesInicioAmortizacion: fechaInicio.toISOString().slice(0, 10),
        totalIntereses,
        totalCapital,
        totalAbonosExtra,
        totalPagado,
      },
      tabla,
      saldosAnuales,
    };
  }
}
