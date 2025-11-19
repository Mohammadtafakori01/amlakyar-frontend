import { User } from '../../../shared/types';

export interface ProfileState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
}

export type { User };

