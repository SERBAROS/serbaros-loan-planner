import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { LoansModule } from './loans/loans.module';
import { UserOrmEntity } from './users/infrastructure/persistence/user.orm-entity';
import { LoanOrmEntity } from './loans/infrastructure/persistence/loan.orm-entity';
import { SimulationOrmEntity } from './loans/infrastructure/persistence/simulation.orm-entity';
import { RealPaymentOrmEntity } from './loans/infrastructure/persistence/real-payment.orm-entity';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'serbaros_loan_planner'),
        password: config.get<string>('DB_PASSWORD', 'serbaros_loan_planner'),
        database: config.get<string>('DB_DATABASE', 'serbaros_loan_planner'),
        entities: [UserOrmEntity, LoanOrmEntity, SimulationOrmEntity, RealPaymentOrmEntity],
        // true simplifica el primer despliegue (crea las tablas solo); en un
        // entorno productivo real se recomienda desactivarlo y usar migraciones.
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
    UsersModule,
    LoansModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
