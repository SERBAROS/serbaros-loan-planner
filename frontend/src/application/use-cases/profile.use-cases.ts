import { UserProfile, UserProfileRepositoryPort } from '../../domain/ports/user-profile-repository.port';

export class GetProfileUseCase {
  constructor(private readonly repo: UserProfileRepositoryPort) {}
  execute(): Promise<UserProfile> {
    return this.repo.get();
  }
}

export class UpdateProfileUseCase {
  constructor(private readonly repo: UserProfileRepositoryPort) {}
  execute(nombre: string | null): Promise<UserProfile> {
    return this.repo.update(nombre);
  }
}
