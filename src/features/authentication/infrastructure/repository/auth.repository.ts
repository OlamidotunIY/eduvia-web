import {
  AuthSession,
  type CurrentUserBootstrap,
  type OrganizationPermission,
  type EmailRegistration,
  IAuthRepository,
  type LoginCredentials,
  type RegistrationStart,
  type RegistrationStatus,
  type VerifyEmailCode,
} from "@/shared/domain";
import type { LoginDto, RegisterEmailDto, VerifyOtpDto } from "@/shared/api/generated";
import { authApi } from "../rest/auth.api";

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials | LoginDto): Promise<AuthSession> {
    return AuthSession.fromApi(this.asRecord(await authApi.login(credentials)));
  }

  async startEmailRegistration(
    input: EmailRegistration | RegisterEmailDto,
  ): Promise<RegistrationStart> {
    const payload = this.asRecord(
      await authApi.startEmailRegistration({
        ...input,
        timezone: input.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    );
    return {
      registrationRequestId: this.readString(payload, "registrationRequestId"),
      registrationContinuation: this.readString(payload, "registrationContinuation"),
    };
  }

  async getRegistrationStatus(
    registrationRequestId: string,
    registrationContinuation: string,
  ): Promise<RegistrationStatus> {
    return this.toRegistrationStatus(
      await authApi.getRegistrationStatus(
        registrationRequestId,
        registrationContinuation,
      ),
    );
  }

  async verifyEmail(input: VerifyEmailCode | VerifyOtpDto): Promise<AuthSession> {
    return AuthSession.fromApi(this.asRecord(await authApi.verifyEmail(input)));
  }

  async resendVerification(email: string): Promise<void> {
    await authApi.resendVerification(email);
  }

  async exchangeGoogle(code: string): Promise<AuthSession> {
    return AuthSession.fromApi(this.asRecord(await authApi.exchangeGoogle(code)));
  }

  async refresh(sessionId: string, refreshToken: string): Promise<AuthSession> {
    return AuthSession.fromApi(
      this.asRecord(await authApi.refresh({ sessionId, refreshToken })),
    );
  }

  async logout(): Promise<void> {
    await authApi.logout();
  }

  async getMe(): Promise<CurrentUserBootstrap> {
    const payload = this.asRecord(await authApi.getMe());
    const user = this.asRecord(payload.user);
    const role = user.userType;
    if (!this.isEduviaRole(role))
      throw new Error("The API returned an invalid Eduvia user role.");

    return {
      user: {
        id: this.readString(user, "id"),
        email: this.readString(user, "email"),
        firstName: this.readString(user, "firstName"),
        lastName: this.readString(user, "lastName"),
        image: typeof user.image === "string" ? user.image : null,
        userType: role,
        onboardingStatus: this.readString(user, "onboardingStatus"),
        emailVerified: Boolean(user.emailVerified),
        timezone: this.readString(user, "timezone"),
      },
      activeOrganization: this.toActiveOrganization(payload.activeOrganization),
      organizations: Array.isArray(payload.organizations)
        ? payload.organizations.map((item) => this.toOrganizationMembership(item))
        : [],
    };
  }

  private toRegistrationStatus(value: unknown): RegistrationStatus {
    const payload = this.asRecord(value);
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
        : AuthSession.fromApi(this.asRecord(payload.session));
    return {
      registrationRequestId: this.readString(payload, "registrationRequestId"),
      status: this.readString(payload, "status"),
      nextAction,
      session,
    };
  }

  private toActiveOrganization(
    value: unknown,
  ): CurrentUserBootstrap["activeOrganization"] {
    if (value === null || value === undefined) return null;
    const organization = this.asRecord(value);
    return {
      id: this.readString(organization, "id"),
      name: this.readString(organization, "name"),
      slug: this.readString(organization, "slug"),
      role: this.readString(organization, "role"),
      roleId: this.readNullableString(organization, "roleId"),
      roleName: this.readString(organization, "roleName"),
      permissions: this.readStringArray<OrganizationPermission>(organization, "permissions"),
      memberCount: this.readNumber(organization, "memberCount"),
    };
  }

  private toOrganizationMembership(
    value: unknown,
  ): CurrentUserBootstrap["organizations"][number] {
    const organization = this.asRecord(value);
    return {
      id: this.readString(organization, "id"),
      name: this.readString(organization, "name"),
      slug: this.readString(organization, "slug"),
      role: this.readString(organization, "role"),
      status: this.readString(organization, "status"),
      memberCount: this.readNumber(organization, "memberCount"),
    };
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("The API returned an invalid response.");
    }
    return value as Record<string, unknown>;
  }

  private readString(payload: Record<string, unknown>, key: string): string {
    const value = payload[key];
    if (typeof value !== "string")
      throw new Error(`The API response is missing ${key}.`);
    return value;
  }

  private readNumber(payload: Record<string, unknown>, key: string): number {
    const value = payload[key];
    if (typeof value !== "number")
      throw new Error(`The API response is missing ${key}.`);
    return value;
  }

  private readNullableString(payload: Record<string, unknown>, key: string): string | null {
    const value = payload[key];
    return typeof value === "string" ? value : null;
  }

  private readStringArray<T extends string>(payload: Record<string, unknown>, key: string): T[] {
    const value = payload[key];
    return Array.isArray(value) && value.every((item) => typeof item === "string")
      ? (value as T[])
      : [];
  }

  private isEduviaRole(
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
}

export const authRepository = new AuthRepository();
