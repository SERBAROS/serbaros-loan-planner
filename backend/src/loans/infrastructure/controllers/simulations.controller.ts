import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../shared/decorators/current-user-id.decorator';

import { CreateSimulationUseCase } from '../../application/use-cases/create-simulation.use-case';
import { ListSimulationsUseCase } from '../../application/use-cases/list-simulations.use-case';
import { GetSimulationDetailUseCase } from '../../application/use-cases/get-simulation-detail.use-case';
import { UpdateSimulationUseCase } from '../../application/use-cases/update-simulation.use-case';
import { DeleteSimulationUseCase } from '../../application/use-cases/delete-simulation.use-case';

import { SimulationRequestDto } from '../../application/dtos/simulation-request.dto';
import { toAbonoDefinitions } from '../../application/dtos/abono-definition.mapper';

@Controller('loans/:loanId/simulations')
@UseGuards(JwtAuthGuard)
export class SimulationsController {
  constructor(
    private readonly createSimulationUseCase: CreateSimulationUseCase,
    private readonly listSimulationsUseCase: ListSimulationsUseCase,
    private readonly getSimulationDetailUseCase: GetSimulationDetailUseCase,
    private readonly updateSimulationUseCase: UpdateSimulationUseCase,
    private readonly deleteSimulationUseCase: DeleteSimulationUseCase,
  ) {}

  @Get()
  list(@CurrentUserId() userId: number, @Param('loanId', ParseIntPipe) loanId: number) {
    return this.listSimulationsUseCase.execute(loanId, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUserId() userId: number, @Param('loanId', ParseIntPipe) loanId: number, @Body() dto: SimulationRequestDto) {
    return this.createSimulationUseCase.execute(loanId, userId, {
      ...dto,
      compromisosAdicionales: toAbonoDefinitions(dto.compromisosAdicionales),
    });
  }

  @Get(':id')
  getOne(
    @CurrentUserId() userId: number,
    @Param('loanId', ParseIntPipe) loanId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.getSimulationDetailUseCase.execute(loanId, id, userId);
  }

  @Put(':id')
  update(
    @CurrentUserId() userId: number,
    @Param('loanId', ParseIntPipe) loanId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SimulationRequestDto,
  ) {
    return this.updateSimulationUseCase.execute(loanId, id, userId, {
      ...dto,
      compromisosAdicionales: toAbonoDefinitions(dto.compromisosAdicionales),
    });
  }

  @Delete(':id')
  remove(
    @CurrentUserId() userId: number,
    @Param('loanId', ParseIntPipe) loanId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deleteSimulationUseCase.execute(loanId, id, userId);
  }
}
