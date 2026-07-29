import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  MinLength,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AbonoDefinitionDto } from './abono-definition.dto';
import { IsCurrencyCode } from './is-currency-code.validator';

export class LoanRequestDto {
  @IsString()
  @MinLength(1, { message: 'El nombre del préstamo es obligatorio.' })
  nombre!: string;

  @IsNumber()
  @IsPositive({ message: 'El monto debe ser mayor a 0.' })
  monto!: number;

  @IsNumber()
  @Min(0, { message: 'La tasa efectiva anual debe ser un número válido.' })
  tasaEfectivaAnual!: number;

  @IsNumber()
  @IsPositive({ message: 'El número de cuotas debe ser mayor a 0.' })
  numeroCuotas!: number;

  @IsDateString({}, { message: 'La fecha de inicio de amortización es inválida.' })
  mesInicioAmortizacion!: string;

  @IsOptional()
  @IsNumber()
  valorCuotaManual?: number | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbonoDefinitionDto)
  compromisosCuotaExtraordinaria?: AbonoDefinitionDto[];

  @IsOptional()
  @IsIn(['NUEVO', 'EN_EJECUCION'], { message: 'El estado debe ser NUEVO o EN_EJECUCION.' })
  estado?: 'NUEVO' | 'EN_EJECUCION';

  @IsOptional()
  @IsInt({ message: 'El número de cuota inicial debe ser un entero.' })
  @Min(1, { message: 'El número de cuota inicial debe ser mayor a 0.' })
  numeroCuotaInicial?: number;

  @IsOptional()
  @IsCurrencyCode()
  moneda?: string;
}
