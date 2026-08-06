import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';

export interface ProfileResult {
  id: number;
  email: string;
  nombre: string | null;
}

@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: number): Promise<ProfileResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return { id: user.id as number, email: user.email, nombre: user.nombre };
  }
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: number, nombre: string | null): Promise<ProfileResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const cleaned = nombre?.trim() || null;
    await this.userRepository.updateNombre(userId, cleaned);
    return { id: userId, email: user.email, nombre: cleaned };
  }
}
