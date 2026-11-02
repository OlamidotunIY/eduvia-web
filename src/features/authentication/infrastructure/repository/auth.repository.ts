import {
  AuthSession,
  type CurrentUserBootstrap,
  type EmailRegistration,
  IAuthRepository,
  type LoginCredentials,
  type RegistrationStart,
  type RegistrationStatus,
  type VerifyEmailCode,
} from "@/shared/domain";
import { authApi } from "../rest/auth.api";

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return AuthSession.fromApi(asRecord(await authApi.login(credentials)));
  }

  async startEmailRegistration(
    input: EmailRegistration,
  ): Promise<RegistrationStart> {
    const payload = asRecord(await authApi.startEmailRegistration(input));
    return {
      registrationRequestId: readString(payload, "registrationRequestId"),
      registrationContinuation: readString(payload, "registrationContinuation"),
    };
  }

  async getRegistrationStatus(
    registrationRequestId: string,
    registrationContinuation: string,
  ): Promise<RegistrationStatus> {
    return toRegistrationStatus(
      await authApi.getRegistrationStatus(
        registrationRequestId,
        registrationContinuation,
      ),
    );
  }

  async verifyEmail(input: VerifyEmailCode): Promise<AuthSession> {
    return AuthSession.fromApi(asRecord(await authApi.verifyEmail(input)));
  }

  async resendVerification(email: string): Promise<void> {
    await authApi.resendVerification(email);
  }

  async exchangeGoogle(code: string): Promise<AuthSession> {
    return AuthSession.fromApi(asRecord(await authApi.exchangeGoogle(code)));
  }

  async refresh(sessionId: string, refreshToken: string): Promise<AuthSession> {
    return AuthSession.fromApi(
      asRecord(await authApi.refresh({ sessionId, refreshToken })),
    );
  }

  async logout(): Promise<void> {
    await authApi.logout();
  }

  async getMe(): Promise<CurrentUserBootstrap> {
    const payload = asRecord(await authApi.getMe());
    const user = asRecord(payload.user);
    const role = user.userType;
    if (!isEduviaRole(role))
      throw new Error("The API returned an invalid Eduvia user role.");

    return {
      user: {
        id: readString(user, "id"),
        email: readString(user, "email"),
        firstName: readString(user, "firstName"),
        lastName: readString(user, "lastName"),
        image: typeof user.image === "string" ? user.image : null,
        userType: role,
        onboardingStatus: readString(user, "onboardingStatus"),
        emailVerified: Boolean(user.emailVerified),
        timezone: readString(user, "timezone"),
      },
      activeOrganization: toActiveOrganization(payload.activeOrganization),
      organizations: Array.isArray(payload.organizations)
        ? payload.organizations.map(toOrganizationMembership)
        : [],
    };
  }
}

export const authRepository = new AuthRepository();

function toRegistrationStatus(value: unknown): RegistrationStatus {
  const payload = asRecord(value);
  const nextAction = payload.nextAction;
  if (
    nextAction !== "wait" &&
    nextAction !== "verify_email" &&
    nextAction !== "exchange_google_oauth" &&
    nextAction !== "sign_in"
  ) {
    throw new Error("The API returned an invalid registration status.");
  }
  const session =
    payload.session === undefined
      ? undefined
      : AuthSession.fromApi(asRecord(payload.session));
  return {
    registrationRequestId: readString(payload, "registrationRequestId"),
    status: readString(payload, "status"),
    nextAction,
    session,
  };
}

function toActiveOrganization(
  value: unknown,
): CurrentUserBootstrap["activeOrganization"] {
  if (value === null || value === undefined) return null;
  const organization = asRecord(value);
  return {
    id: readString(organization, "id"),
    name: readString(organization, "name"),
    slug: readString(organization, "slug"),
    role: readString(organization, "role"),
    memberCount: readNumber(organization, "memberCount"),
  };
}

function toOrganizationMembership(
  value: unknown,
): CurrentUserBootstrap["organizations"][number] {
  const organization = asRecord(value);
  return {
    id: readString(organization, "id"),
    name: readString(organization, "name"),
    slug: readString(organization, "slug"),
    role: readString(organization, "role"),
    status: readString(organization, "status"),
    memberCount: readNumber(organization, "memberCount"),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The API returned an invalid response.");
  }
  return value as Record<string, unknown>;
}

function readString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  if (typeof value !== "string")
    throw new Error(`The API response is missing ${key}.`);
  return value;
}

function readNumber(payload: Record<string, unknown>, key: string): number {
  const value = payload[key];
  if (typeof value !== "number")
    throw new Error(`The API response is missing ${key}.`);
  return value;
}

function isEduviaRole(
  value: unknown,
): value is CurrentUserBootstrap["user"]["userType"] {
  return (
    value === "pending" ||
    value === "teacher" ||
    value === "parent" ||
    value === "student" ||
    value === "admin"
  );
}
