import { BadRequestException } from '@nestjs/common';
import { AbonoDefinition } from '../../domain/services/amortization.service';
import { AbonoDefinitionDto } from './abono-definition.dto';

export function toAbonoDefinition(dto: AbonoDefinitionDto): AbonoDefinition {
  if (dto.tipo === 'PUNTUAL') {
    return { id: dto.id, tipo: 'PUNTUAL', monto: dto.monto as number, numeroCuota: dto.numeroCuota, fecha: dto.fecha };
  }
  if (dto.tipo === 'RECURRENTE') {
    return {
      id: dto.id,
      tipo: 'RECURRENTE',
      monto: dto.monto as number,
      cada: dto.cada as number,
      unidad: dto.unidad as 'MESES' | 'ANIOS',
      fechaInicio: dto.fechaInicio as string,
      fechaFin: dto.fechaFin,
    };
  }
  if (dto.tipo === 'GRUPO_RECURRENTE') {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Un grupo recurrente debe tener al menos un abono.');
    }
    return {
      id: dto.id,
      tipo: 'GRUPO_RECURRENTE',
      nombre: dto.nombre ?? 'Grupo',
      items: dto.items.map((i) => ({ monto: i.monto, cada: i.cada, unidad: i.unidad, fechaInicio: i.fechaInicio, fechaFin: i.fechaFin })),
    };
  }
  throw new BadRequestException('Tipo de abono desconocido.');
}

export function toAbonoDefinitions(dtos?: AbonoDefinitionDto[]): AbonoDefinition[] {
  return (dtos ?? []).map(toAbonoDefinition);
}
