import type { IOnboardingRepository } from "@/shared/domain";
import type { CompleteUserOnboardingDto } from "@/shared/api/generated";
import { onboardingApi } from "../rest/onboarding.api";

export class OnboardingRepository implements IOnboardingRepository {
  async complete(input: CompleteUserOnboardingDto): Promise<unknown> {
    return onboardingApi.complete(input);
  }
}

export const onboardingRepository = new OnboardingRepository();
