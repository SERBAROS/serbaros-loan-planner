import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { LoanOrmEntity } from './infrastructure/persistence/loan.orm-entity';
import { TypeOrmLoanRepository } from './infrastructure/persistence/typeorm-loan.repository';
import { SimulationOrmEntity } from './infrastructure/persistence/simulation.orm-entity';
import { TypeOrmSimulationRepository } from './infrastructure/persistence/typeorm-simulation.repository';
import { RealPaymentOrmEntity } from './infrastructure/persistence/real-payment.orm-entity';
import { TypeOrmRealPaymentRepository } from './infrastructure/persistence/typeorm-real-payment.repository';
import { LoansController } from './infrastructure/controllers/loans.controller';
import { SimulationsController } from './infrastructure/controllers/simulations.controller';
import { RealPaymentsController } from './infrastructure/controllers/real-payments.controller';
import { LoanExportController } from './infrastructure/controllers/loan-export.controller';
import { ExcelJsLoanExporter } from './infrastructure/export/excel-loan-exporter';
import { PdfKitLoanExporter } from './infrastructure/export/pdf-loan-exporter';

import { LOAN_REPOSITORY } from './domain/ports/loan-repository.port';
import { SIMULATION_REPOSITORY } from './domain/ports/simulation-repository.port';
import { REAL_PAYMENT_REPOSITORY } from './domain/ports/real-payment-repository.port';
import { EXCEL_EXPORTER } from './domain/ports/excel-exporter.port';
import { PDF_EXPORTER } from './domain/ports/pdf-exporter.port';

import { CreateLoanUseCase } from './application/use-cases/create-loan.use-case';
import { ListLoansUseCase } from './application/use-cases/list-loans.use-case';
import { GetLoanDetailUseCase } from './application/use-cases/get-loan-detail.use-case';
import { UpdateLoanUseCase } from './application/use-cases/update-loan.use-case';
import { DeleteLoanUseCase } from './application/use-cases/delete-loan.use-case';
import { SimulateLoanUseCase } from './application/use-cases/simulate-loan.use-case';
import { CreateSimulationUseCase } from './application/use-cases/create-simulation.use-case';
import { ListSimulationsUseCase } from './application/use-cases/list-simulations.use-case';
import { GetSimulationDetailUseCase } from './application/use-cases/get-simulation-detail.use-case';
import { UpdateSimulationUseCase } from './application/use-cases/update-simulation.use-case';
import { DeleteSimulationUseCase } from './application/use-cases/delete-simulation.use-case';
import { CreateRealPaymentUseCase } from './application/use-cases/create-real-payment.use-case';
import { GetRealPaymentPlanUseCase } from './application/use-cases/get-real-payment-plan.use-case';
import { UpdateRealPaymentUseCase } from './application/use-cases/update-real-payment.use-case';
import { DeleteRealPaymentUseCase } from './application/use-cases/delete-real-payment.use-case';
import { BuildLoanExportDataUseCase } from './application/use-cases/build-loan-export-data.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([LoanOrmEntity, SimulationOrmEntity, RealPaymentOrmEntity]), UsersModule],
  controllers: [LoansController, SimulationsController, RealPaymentsController, LoanExportController],
  providers: [
    CreateLoanUseCase,
    ListLoansUseCase,
    GetLoanDetailUseCase,
    UpdateLoanUseCase,
    DeleteLoanUseCase,
    SimulateLoanUseCase,
    CreateSimulationUseCase,
    ListSimulationsUseCase,
    GetSimulationDetailUseCase,
    UpdateSimulationUseCase,
    DeleteSimulationUseCase,
    CreateRealPaymentUseCase,
    GetRealPaymentPlanUseCase,
    UpdateRealPaymentUseCase,
    DeleteRealPaymentUseCase,
    BuildLoanExportDataUseCase,
    { provide: LOAN_REPOSITORY, useClass: TypeOrmLoanRepository },
    { provide: SIMULATION_REPOSITORY, useClass: TypeOrmSimulationRepository },
    { provide: REAL_PAYMENT_REPOSITORY, useClass: TypeOrmRealPaymentRepository },
    { provide: EXCEL_EXPORTER, useClass: ExcelJsLoanExporter },
    { provide: PDF_EXPORTER, useClass: PdfKitLoanExporter },
  ],
})
export class LoansModule {}
