import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/security/jwt-token.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { PreferenciasController } from './infrastructure/controllers/preferencias.controller';
import { ProfileController } from './infrastructure/controllers/profile.controller';

import { USER_REPOSITORY } from './domain/ports/user-repository.port';
import { PASSWORD_HASHER } from './domain/ports/password-hasher.port';
import { TOKEN_SERVICE } from './domain/ports/token-service.port';

import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { GetPreferenciasUseCase, UpdatePreferenciasUseCase } from './application/use-cases/manage-preferencias.use-case';
import { GetProfileUseCase, UpdateProfileUseCase } from './application/use-cases/manage-profile.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController, PreferenciasController, ProfileController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    GetPreferenciasUseCase,
    UpdatePreferenciasUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
