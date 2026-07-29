export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenServicePort {
  sign(userId: number): string;
  verify(token: string): { userId: number };
}
