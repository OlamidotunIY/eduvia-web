import type { AuthSession } from '../entities/auth-session.entity'
import type { CurrentUserBootstrap } from '../entities/current-user.entity'
import type {
  EmailRegistration,
  RegistrationStart,
  LoginCredentials,
  RegistrationStatus,
  VerifyEmailCode,
} from '../value-objects/auth-inputs'

export abstract class IAuthRepository {
  abstract login(credentials: LoginCredentials): Promise<AuthSession>
  abstract startEmailRegistration(input: EmailRegistration): Promise<RegistrationStart>
  abstract getRegistrationStatus(
    registrationRequestId: string,
    registrationContinuation: string,
  ): Promise<RegistrationStatus>
  abstract verifyEmail(input: VerifyEmailCode): Promise<AuthSession>
  abstract resendVerification(email: string): Promise<void>
  abstract exchangeGoogle(code: string): Promise<AuthSession>
  abstract refresh(sessionId: string, refreshToken: string): Promise<AuthSession>
  abstract logout(): Promise<void>
  abstract getMe(): Promise<CurrentUserBootstrap>
}
