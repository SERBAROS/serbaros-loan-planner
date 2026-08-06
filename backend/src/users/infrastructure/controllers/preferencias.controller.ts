import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../shared/decorators/current-user-id.decorator';
import { GetPreferenciasUseCase, UpdatePreferenciasUseCase } from '../../application/use-cases/manage-preferencias.use-case';
import { PreferenciasRequestDto } from '../../application/dtos/preferencias-request.dto';

@Controller('users/me/preferencias')
@UseGuards(JwtAuthGuard)
export class PreferenciasController {
  constructor(
    private readonly getPreferenciasUseCase: GetPreferenciasUseCase,
    private readonly updatePreferenciasUseCase: UpdatePreferenciasUseCase,
  ) {}

  @Get()
  get(@CurrentUserId() userId: number) {
    return this.getPreferenciasUseCase.execute(userId);
  }

  @Put()
  update(@CurrentUserId() userId: number, @Body() dto: PreferenciasRequestDto) {
    return this.updatePreferenciasUseCase.execute(userId, dto.temaDefecto, dto.monedaDefecto);
  }
}
