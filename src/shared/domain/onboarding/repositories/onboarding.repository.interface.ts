import type { CompleteOnboardingInput } from '../entities/onboarding.entity';

export interface IOnboardingRepository {
  complete(input: CompleteOnboardingInput): Promise<unknown>;
}
