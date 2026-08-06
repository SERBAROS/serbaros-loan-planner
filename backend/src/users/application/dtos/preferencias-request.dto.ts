import { IsIn, IsString } from 'class-validator';

export class PreferenciasRequestDto {
  @IsIn(['azul', 'oscuro', 'claro'], { message: 'El tema debe ser azul, oscuro o claro.' })
  temaDefecto!: 'azul' | 'oscuro' | 'claro';

  @IsString()
  monedaDefecto!: string;
}
