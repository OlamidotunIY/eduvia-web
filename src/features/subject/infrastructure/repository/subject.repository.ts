import type {
  OrganizationSubjectInput,
  OrganizationSubjectRecord,
  PlatformSubject,
} from "@/shared/domain";
import { subjectApi } from "../rest/subject.api";

export class SubjectRepository {
  async listOrganizationSubjects(
    organizationId: string,
  ): Promise<OrganizationSubjectRecord[]> {
    const value = await subjectApi.listOrganizationSubjects(organizationId);
    if (!Array.isArray(value))
      throw new Error("The API returned an invalid subject response.");
    return value.map(toOrganizationSubject);
  }

  async listPlatformSubjects(): Promise<PlatformSubject[]> {
    const value = await subjectApi.listPlatformSubjects();
    if (!Array.isArray(value))
      throw new Error("The API returned an invalid platform subject response.");
    return value.map(toPlatformSubject);
  }

  async create(
    organizationId: string,
    input: OrganizationSubjectInput,
  ): Promise<void> {
    await subjectApi.create(organizationId, input);
  }

  async update(
    organizationId: string,
    subjectId: string,
    input: OrganizationSubjectInput,
  ): Promise<void> {
    await subjectApi.update(organizationId, subjectId, input);
  }
}

export const subjectRepository = new SubjectRepository();

function toOrganizationSubject(value: unknown): OrganizationSubjectRecord {
  const subject = record(value, "organization subject");
  return {
    id: requiredString(subject, "id"),
    orgId: requiredString(subject, "orgId"),
    name: requiredString(subject, "name"),
    platformSubjectId: optionalString(subject, "platformSubjectId"),
    description: optionalString(subject, "description"),
    isActive: Boolean(subject.isActive),
    createdAt: requiredString(subject, "createdAt"),
  };
}

function toPlatformSubject(value: unknown): PlatformSubject {
  const subject = record(value, "platform subject");
  return {
    id: requiredString(subject, "id"),
    name: requiredString(subject, "name"),
    shortCode: requiredString(subject, "shortCode"),
    description: optionalString(subject, "description"),
    isActive: Boolean(subject.isActive),
  };
}

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`The API returned an invalid ${name}.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: Record<string, unknown>, key: string): string {
  if (typeof value[key] !== "string") {
    throw new Error(`The API response is missing ${key}.`);
  }
  return value[key];
}

function optionalString(
  value: Record<string, unknown>,
  key: string,
): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}
