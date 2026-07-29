import { IsDateString, IsInt, IsNumber, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class RealPaymentRequestDto {
  @IsInt({ message: 'El número de cuota debe ser un entero.' })
  @Min(1, { message: 'El número de cuota debe ser mayor a 0.' })
  numeroCuota!: number;

  @IsNumber()
  @IsPositive({ message: 'El monto debe ser mayor a 0.' })
  monto!: number;

  @IsString()
  @MinLength(1, { message: 'El concepto es obligatorio (ej. "Abono voluntario", "Prima").' })
  concepto!: string;

  @IsDateString({}, { message: 'La fecha de pago es inválida.' })
  fechaPago!: string;
}
