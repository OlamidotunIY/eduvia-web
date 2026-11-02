export interface LoginCredentials {
  email: string
  password: string
}

export interface EmailRegistration extends LoginCredentials {
  firstName: string
  lastName: string
  timezone: string
}

export interface VerifyEmailCode {
  email: string
  code: string
}

export interface RegistrationStart {
  registrationRequestId: string
  registrationContinuation: string
}

export interface RegistrationStatus {
  registrationRequestId: string
  status: string
  nextAction: 'wait' | 'verify_email' | 'exchange_google_oauth' | 'sign_in'
  session?: import('../entities/auth-session.entity').AuthSession
}
