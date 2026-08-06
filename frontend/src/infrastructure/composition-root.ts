import { HttpAuthRepository } from './http/http-auth-repository';
import { HttpLoanRepository } from './http/http-loan-repository';
import { HttpSimulationRepository } from './http/http-simulation-repository';
import { HttpRealPaymentRepository } from './http/http-real-payment-repository';
import { HttpLoanExportRepository } from './http/http-loan-export-repository';
import { HttpUserPreferencesRepository } from './http/http-user-preferences-repository';
import { LocalStorageSessionRepository } from './storage/local-storage-session.repository';

import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import {
  CreateLoanUseCase,
  DeleteLoanUseCase,
  GetLoanUseCase,
  ListLoansUseCase,
  SimulateLoanUseCase,
  UpdateLoanUseCase,
} from '../application/use-cases/loan.use-cases';
import {
  CreateSimulationUseCase,
  DeleteSimulationUseCase,
  GetSimulationUseCase,
  ListSimulationsUseCase,
  UpdateSimulationUseCase,
} from '../application/use-cases/simulation.use-cases';
import {
  CreateRealPaymentUseCase,
  DeleteRealPaymentUseCase,
  GetRealPaymentPlanUseCase,
  UpdateRealPaymentUseCase,
} from '../application/use-cases/real-payment.use-cases';
import { ExportLoanUseCase } from '../application/use-cases/export-loan.use-case';
import { GetPreferenciasUseCase, UpdatePreferenciasUseCase } from '../application/use-cases/preferencias.use-cases';

// Adaptadores concretos (los únicos que saben que existe fetch/localStorage)
const sessionStorage = new LocalStorageSessionRepository();
const authRepository = new HttpAuthRepository();
const loanRepository = new HttpLoanRepository(() => sessionStorage.load()?.token ?? null);
const simulationRepository = new HttpSimulationRepository(() => sessionStorage.load()?.token ?? null);
const realPaymentRepository = new HttpRealPaymentRepository(() => sessionStorage.load()?.token ?? null);
const loanExportRepository = new HttpLoanExportRepository(() => sessionStorage.load()?.token ?? null);
const userPreferencesRepository = new HttpUserPreferencesRepository(() => sessionStorage.load()?.token ?? null);

// Casos de uso ya cableados con sus dependencias — esto es lo que consume
// la capa de presentación (React), sin saber nada de cómo están implementados.
export const composition = {
  sessionStorage,
  loginUseCase: new LoginUseCase(authRepository, sessionStorage),
  registerUseCase: new RegisterUseCase(authRepository, sessionStorage),
  logoutUseCase: new LogoutUseCase(sessionStorage),
  listLoansUseCase: new ListLoansUseCase(loanRepository),
  getLoanUseCase: new GetLoanUseCase(loanRepository),
  createLoanUseCase: new CreateLoanUseCase(loanRepository),
  updateLoanUseCase: new UpdateLoanUseCase(loanRepository),
  deleteLoanUseCase: new DeleteLoanUseCase(loanRepository),
  simulateLoanUseCase: new SimulateLoanUseCase(loanRepository),
  listSimulationsUseCase: new ListSimulationsUseCase(simulationRepository),
  getSimulationUseCase: new GetSimulationUseCase(simulationRepository),
  createSimulationUseCase: new CreateSimulationUseCase(simulationRepository),
  updateSimulationUseCase: new UpdateSimulationUseCase(simulationRepository),
  deleteSimulationUseCase: new DeleteSimulationUseCase(simulationRepository),
  getRealPaymentPlanUseCase: new GetRealPaymentPlanUseCase(realPaymentRepository),
  createRealPaymentUseCase: new CreateRealPaymentUseCase(realPaymentRepository),
  updateRealPaymentUseCase: new UpdateRealPaymentUseCase(realPaymentRepository),
  deleteRealPaymentUseCase: new DeleteRealPaymentUseCase(realPaymentRepository),
  exportLoanUseCase: new ExportLoanUseCase(loanExportRepository),
  getPreferenciasUseCase: new GetPreferenciasUseCase(userPreferencesRepository),
  updatePreferenciasUseCase: new UpdatePreferenciasUseCase(userPreferencesRepository),
};
