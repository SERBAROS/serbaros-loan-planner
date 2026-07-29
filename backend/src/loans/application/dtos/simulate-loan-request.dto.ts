import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator';
import { AbonoDefinitionDto } from './abono-definition.dto';

export class SimulateLoanRequestDto {
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
  @IsInt({ message: 'El número de cuota inicial debe ser un entero.' })
  @Min(1, { message: 'El número de cuota inicial debe ser mayor a 0.' })
  numeroCuotaInicial?: number;
}
