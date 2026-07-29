import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../shared/decorators/current-user-id.decorator';

import { CreateLoanUseCase } from '../../application/use-cases/create-loan.use-case';
import { ListLoansUseCase } from '../../application/use-cases/list-loans.use-case';
import { GetLoanDetailUseCase } from '../../application/use-cases/get-loan-detail.use-case';
import { UpdateLoanUseCase } from '../../application/use-cases/update-loan.use-case';
import { DeleteLoanUseCase } from '../../application/use-cases/delete-loan.use-case';
import { SimulateLoanUseCase } from '../../application/use-cases/simulate-loan.use-case';

import { LoanRequestDto } from '../../application/dtos/loan-request.dto';
import { SimulateLoanRequestDto } from '../../application/dtos/simulate-loan-request.dto';
import { toAbonoDefinitions } from '../../application/dtos/abono-definition.mapper';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(
    private readonly createLoanUseCase: CreateLoanUseCase,
    private readonly listLoansUseCase: ListLoansUseCase,
    private readonly getLoanDetailUseCase: GetLoanDetailUseCase,
    private readonly updateLoanUseCase: UpdateLoanUseCase,
    private readonly deleteLoanUseCase: DeleteLoanUseCase,
    private readonly simulateLoanUseCase: SimulateLoanUseCase,
  ) {}

  @Get()
  list(@CurrentUserId() userId: number) {
    return this.listLoansUseCase.execute(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUserId() userId: number, @Body() dto: LoanRequestDto) {
    return this.createLoanUseCase.execute(userId, {
      ...dto,
      compromisosCuotaExtraordinaria: toAbonoDefinitions(dto.compromisosCuotaExtraordinaria),
    });
  }

  // Nota: se declara antes de ":id" para que "simulate" no se interprete como un id.
  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  simulate(@Body() dto: SimulateLoanRequestDto) {
    return this.simulateLoanUseCase.execute({
      ...dto,
      compromisosCuotaExtraordinaria: toAbonoDefinitions(dto.compromisosCuotaExtraordinaria),
    });
  }

  @Get(':id')
  getOne(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.getLoanDetailUseCase.execute(id, userId);
  }

  @Put(':id')
  update(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number, @Body() dto: LoanRequestDto) {
    return this.updateLoanUseCase.execute(id, userId, {
      ...dto,
      compromisosCuotaExtraordinaria: toAbonoDefinitions(dto.compromisosCuotaExtraordinaria),
    });
  }

  @Delete(':id')
  remove(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.deleteLoanUseCase.execute(id, userId);
  }
}
