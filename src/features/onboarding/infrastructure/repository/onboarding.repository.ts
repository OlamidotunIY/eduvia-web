import type { CompleteOnboardingInput, IOnboardingRepository } from "@/shared/domain";
import { onboardingApi } from "../rest/onboarding.api";

export class OnboardingRepository implements IOnboardingRepository {
  async complete(input: CompleteOnboardingInput): Promise<unknown> {
    return onboardingApi.complete(input);
  }
}

export const onboardingRepository = new OnboardingRepository();
