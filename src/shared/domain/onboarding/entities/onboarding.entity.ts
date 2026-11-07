import type { EduviaRole } from '../../auth';

export interface CompleteOnboardingInput {
  userType: Extract<EduviaRole, 'teacher' | 'parent'>;
  firstName: string;
  lastName: string;
  timezone: string;
}
