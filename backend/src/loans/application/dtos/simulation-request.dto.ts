import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, MinLength, IsString, ValidateNested } from 'class-validator';
import { AbonoDefinitionDto } from './abono-definition.dto';

export class SimulationRequestDto {
  @IsString()
  @MinLength(1, { message: 'El nombre de la simulación es obligatorio.' })
  nombre!: string;

  @IsOptional()
  @IsNumber()
  valorCuotaManual?: number | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbonoDefinitionDto)
  compromisosAdicionales?: AbonoDefinitionDto[];
}
