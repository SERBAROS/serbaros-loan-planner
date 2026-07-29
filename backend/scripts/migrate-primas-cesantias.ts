/**
 * Script de migración única: convierte los préstamos existentes que
 * todavía tengan las columnas legadas `cuota_primas` / `cuota_cesantias`
 * (y los abonos puntuales en el viejo `abonos_capital`) al nuevo modelo
 * unificado `compromisos_cuota_extraordinaria`.
 *
 * - cuota_primas (>0)    -> abono recurrente cada 6 meses desde el 1 de
 *                           junio del año de inicio del préstamo.
 * - cuota_cesantias (>0) -> abono recurrente cada 12 meses desde el 1 de
 *                           febrero del año de inicio del préstamo.
 *   Ambos se agrupan como un solo "Compromiso cuota extraordinaria" tipo
 *   GRUPO_RECURRENTE llamado "Prestaciones sociales (migrado)".
 * - abonos_capital (viejo, [{numeroCuota, monto}]) -> se preservan como
 *   abonos PUNTUAL dentro del mismo arreglo de compromisos.
 *
 * Uso:
 *   node dist/scripts/migrate-primas-cesantias.js
 * (requiere las mismas variables de entorno DB_* que la app — ver .env)
 *
 * Es seguro ejecutarlo más de una vez: si un préstamo ya no tiene las
 * columnas legadas (o ya fueron migradas a null/0), simplemente se omite.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'serbaros_loan_planner',
    password: process.env.DB_PASSWORD || 'serbaros_loan_planner',
    database: process.env.DB_DATABASE || 'serbaros_loan_planner',
  });

  try {
    const [columns] = await connection.query<any[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'loans'`,
      [process.env.DB_DATABASE || 'serbaros_loan_planner'],
    );
    const columnNames = new Set((columns as any[]).map((c) => c.COLUMN_NAME));

    if (!columnNames.has('cuota_primas') && !columnNames.has('cuota_cesantias') && !columnNames.has('abonos_capital')) {
      console.log('No hay columnas legadas que migrar (cuota_primas/cuota_cesantias/abonos_capital no existen). Nada que hacer.');
      return;
    }

    if (!columnNames.has('compromisos_cuota_extraordinaria')) {
      console.log('Creando la columna compromisos_cuota_extraordinaria (aún no existía)...');
      await connection.query(`ALTER TABLE loans ADD COLUMN compromisos_cuota_extraordinaria TEXT NULL`);
    }

    const selectCols = ['id', 'mes_inicio_amortizacion', 'compromisos_cuota_extraordinaria'];
    if (columnNames.has('cuota_primas')) selectCols.push('cuota_primas');
    if (columnNames.has('cuota_cesantias')) selectCols.push('cuota_cesantias');
    if (columnNames.has('abonos_capital')) selectCols.push('abonos_capital');

    const [rows] = await connection.query<any[]>(`SELECT ${selectCols.join(', ')} FROM loans`);

    let migrados = 0;
    for (const row of rows as any[]) {
      const compromisos: any[] = [];

      const cuotaPrimas = Number(row.cuota_primas ?? 0);
      const cuotaCesantias = Number(row.cuota_cesantias ?? 0);

      if (cuotaPrimas > 0 || cuotaCesantias > 0) {
        const anio = new Date(row.mes_inicio_amortizacion).getUTCFullYear();
        const items = [];
        if (cuotaPrimas > 0) {
          items.push({ monto: cuotaPrimas, cada: 6, unidad: 'MESES', fechaInicio: `${anio}-06-01`, fechaFin: null });
        }
        if (cuotaCesantias > 0) {
          items.push({ monto: cuotaCesantias, cada: 12, unidad: 'MESES', fechaInicio: `${anio}-02-01`, fechaFin: null });
        }
        compromisos.push({
          id: `migrado-prestaciones-${row.id}`,
          tipo: 'GRUPO_RECURRENTE',
          nombre: 'Prestaciones sociales (migrado)',
          items,
        });
      }

      const abonosViejos: Array<{ numeroCuota: number; monto: number }> = row.abonos_capital
        ? typeof row.abonos_capital === 'string'
          ? JSON.parse(row.abonos_capital)
          : row.abonos_capital
        : [];
      for (const abono of abonosViejos) {
        compromisos.push({
          id: `migrado-puntual-${row.id}-${abono.numeroCuota}`,
          tipo: 'PUNTUAL',
          monto: abono.monto,
          numeroCuota: abono.numeroCuota,
        });
      }

      if (compromisos.length === 0) continue;

      const existentes = row.compromisos_cuota_extraordinaria
        ? typeof row.compromisos_cuota_extraordinaria === 'string'
          ? JSON.parse(row.compromisos_cuota_extraordinaria)
          : row.compromisos_cuota_extraordinaria
        : [];

      const combinados = [...existentes, ...compromisos];

      await connection.query(`UPDATE loans SET compromisos_cuota_extraordinaria = ? WHERE id = ?`, [
        JSON.stringify(combinados),
        row.id,
      ]);
      migrados++;
      console.log(`Préstamo ${row.id}: migrado (${compromisos.length} compromiso(s) agregado(s)).`);
    }

    console.log(`\nListo. ${migrados} préstamo(s) migrado(s) de ${(rows as any[]).length} revisado(s).`);
    console.log('Las columnas legadas (cuota_primas, cuota_cesantias, abonos_capital) ya no las usa la app —');
    console.log('se eliminarán solas la próxima vez que arranque el backend (TypeORM synchronize).');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Error en la migración:', err);
  process.exit(1);
});
