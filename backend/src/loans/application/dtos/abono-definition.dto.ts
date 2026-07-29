import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength, ValidateNested } from 'class-validator';

export class AbonoGrupoItemDto {
  @IsNumber()
  @IsPositive({ message: 'El monto de cada abono del grupo debe ser mayor a 0.' })
  monto!: number;

  @IsInt({ message: 'La periodicidad debe ser un entero.' })
  @Min(1, { message: 'La periodicidad debe ser mayor a 0.' })
  cada!: number;

  @IsIn(['MESES', 'ANIOS'], { message: 'La unidad debe ser MESES o ANIOS.' })
  unidad!: 'MESES' | 'ANIOS';

  @IsString()
  fechaInicio!: string;

  @IsOptional()
  @IsString()
  fechaFin?: string | null;
}

export class AbonoDefinitionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsIn(['PUNTUAL', 'RECURRENTE', 'GRUPO_RECURRENTE'], {
    message: 'El tipo de abono debe ser PUNTUAL, RECURRENTE o GRUPO_RECURRENTE.',
  })
  tipo!: 'PUNTUAL' | 'RECURRENTE' | 'GRUPO_RECURRENTE';

  // PUNTUAL y RECURRENTE
  @IsOptional()
  @IsNumber()
  monto?: number;

  // PUNTUAL
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroCuota?: number;

  @IsOptional()
  @IsString()
  fecha?: string;

  // RECURRENTE
  @IsOptional()
  @IsInt()
  @Min(1)
  cada?: number;

  @IsOptional()
  @IsIn(['MESES', 'ANIOS'])
  unidad?: 'MESES' | 'ANIOS';

  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  fechaFin?: string | null;

  // GRUPO_RECURRENTE
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbonoGrupoItemDto)
  items?: AbonoGrupoItemDto[];
}
