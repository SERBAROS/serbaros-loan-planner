import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TemaId, User } from '../../domain/entities/user.entity';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/ports/user-repository.port';

export interface PreferenciasResult {
  temaDefecto: TemaId;
  monedaDefecto: string;
}

@Injectable()
export class GetPreferenciasUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: number): Promise<PreferenciasResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return { temaDefecto: user.temaDefecto, monedaDefecto: user.monedaDefecto };
  }
}

@Injectable()
export class UpdatePreferenciasUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: number, temaDefecto: TemaId, monedaDefecto: string): Promise<PreferenciasResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    // Reutiliza las validaciones de la entidad (tema válido, moneda ISO 4217)
    // sin persistir nada más del usuario — construir una instancia solo valida.
    const validado = new User({
      email: user.email,
      passwordHash: user.passwordHash,
      nombre: user.nombre,
      temaDefecto,
      monedaDefecto,
    });

    await this.userRepository.updatePreferencias(userId, validado.temaDefecto, validado.monedaDefecto);
    return { temaDefecto: validado.temaDefecto, monedaDefecto: validado.monedaDefecto };
  }
}
