import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../shared/decorators/current-user-id.decorator';
import { GetProfileUseCase, UpdateProfileUseCase } from '../../application/use-cases/manage-profile.use-case';
import { ProfileRequestDto } from '../../application/dtos/profile-request.dto';

@Controller('users/me/perfil')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Get()
  get(@CurrentUserId() userId: number) {
    return this.getProfileUseCase.execute(userId);
  }

  @Put()
  update(@CurrentUserId() userId: number, @Body() dto: ProfileRequestDto) {
    return this.updateProfileUseCase.execute(userId, dto.nombre ?? null);
  }
}
