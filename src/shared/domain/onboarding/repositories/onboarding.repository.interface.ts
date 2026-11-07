import type { CompleteUserOnboardingDto } from "@/shared/api/generated";

export interface IOnboardingRepository {
  complete(input: CompleteUserOnboardingDto): Promise<unknown>;
}
