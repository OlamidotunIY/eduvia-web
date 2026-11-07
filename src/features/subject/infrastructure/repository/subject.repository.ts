import {
  OrganizationSubjectRecord,
  PlatformSubject,
} from "@/shared/domain";
import type { CreateSubjectDto, UpdateSubjectDto } from "@/shared/api/generated";
import { subjectApi } from "../rest/subject.api";

export class SubjectRepository {
  async listOrganizationSubjects(
    organizationId: string,
  ): Promise<OrganizationSubjectRecord[]> {
    const value = await subjectApi.listOrganizationSubjects(organizationId);
    if (!Array.isArray(value))
      throw new Error("The API returned an invalid subject response.");
    return value.map((item) => this.toOrganizationSubject(item));
  }

  async listPlatformSubjects(): Promise<PlatformSubject[]> {
    const value = await subjectApi.listPlatformSubjects();
    if (!Array.isArray(value))
      throw new Error("The API returned an invalid platform subject response.");
    return value.map((item) => this.toPlatformSubject(item));
  }

  async create(
    organizationId: string,
    input: CreateSubjectDto,
  ): Promise<void> {
    await subjectApi.create(organizationId, input);
  }

  async update(
    organizationId: string,
    subjectId: string,
    input: UpdateSubjectDto,
  ): Promise<void> {
    await subjectApi.update(organizationId, subjectId, input);
  }

  private toOrganizationSubject(value: unknown): OrganizationSubjectRecord {
    const subject = this.record(value, "organization subject");
    return new OrganizationSubjectRecord({
      id: this.requiredString(subject, "id"),
      orgId: this.requiredString(subject, "orgId"),
      name: this.requiredString(subject, "name"),
      platformSubjectId: this.optionalString(subject, "platformSubjectId"),
      description: this.optionalString(subject, "description"),
      isActive: Boolean(subject.isActive),
      createdAt: this.requiredString(subject, "createdAt"),
    });
  }

  private toPlatformSubject(value: unknown): PlatformSubject {
    const subject = this.record(value, "platform subject");
    return new PlatformSubject({
      id: this.requiredString(subject, "id"),
      name: this.requiredString(subject, "name"),
      shortCode: this.requiredString(subject, "shortCode"),
      description: this.optionalString(subject, "description"),
      isActive: Boolean(subject.isActive),
    });
  }

  private record(value: unknown, name: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`The API returned an invalid ${name}.`);
    }
    return value as Record<string, unknown>;
  }

  private requiredString(value: Record<string, unknown>, key: string): string {
    const field = value[key];
    if (typeof field !== "string")
      throw new Error(`The API response is missing ${key}.`);
    return field;
  }

  private optionalString(
    value: Record<string, unknown>,
    key: string,
  ): string | null {
    const field = value[key];
    return typeof field === "string" ? field : null;
  }
}

export const subjectRepository = new SubjectRepository();
