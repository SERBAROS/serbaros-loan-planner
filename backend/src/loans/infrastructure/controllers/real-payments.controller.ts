import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../shared/decorators/current-user-id.decorator';

import { CreateRealPaymentUseCase } from '../../application/use-cases/create-real-payment.use-case';
import { GetRealPaymentPlanUseCase } from '../../application/use-cases/get-real-payment-plan.use-case';
import { UpdateRealPaymentUseCase } from '../../application/use-cases/update-real-payment.use-case';
import { DeleteRealPaymentUseCase } from '../../application/use-cases/delete-real-payment.use-case';

import { RealPaymentRequestDto } from '../../application/dtos/real-payment-request.dto';

@Controller('loans/:loanId/real-payments')
@UseGuards(JwtAuthGuard)
export class RealPaymentsController {
  constructor(
    private readonly createRealPaymentUseCase: CreateRealPaymentUseCase,
    private readonly getRealPaymentPlanUseCase: GetRealPaymentPlanUseCase,
    private readonly updateRealPaymentUseCase: UpdateRealPaymentUseCase,
    private readonly deleteRealPaymentUseCase: DeleteRealPaymentUseCase,
  ) {}

  // Devuelve el ledger de pagos reales + el plan "real" ya calculado
  // (saldo/tabla/resumen) y su comparación contra la estimación base.
  @Get()
  get(@CurrentUserId() userId: number, @Param('loanId', ParseIntPipe) loanId: number) {
    return this.getRealPaymentPlanUseCase.execute(loanId, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUserId() userId: number, @Param('loanId', ParseIntPipe) loanId: number, @Body() dto: RealPaymentRequestDto) {
    return this.createRealPaymentUseCase.execute(loanId, userId, dto);
  }

  @Put(':id')
  update(
    @CurrentUserId() userId: number,
    @Param('loanId', ParseIntPipe) loanId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RealPaymentRequestDto,
  ) {
    return this.updateRealPaymentUseCase.execute(loanId, id, userId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUserId() userId: number,
    @Param('loanId', ParseIntPipe) loanId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deleteRealPaymentUseCase.execute(loanId, id, userId);
  }
}
