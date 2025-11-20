import { Estate, EstateFilters, RejectEstateRequest } from '../../../shared/types';

export interface EstatesState {
  estates: Estate[];
  pendingEstates: Estate[];
  approvedEstates: Estate[];
  selectedEstate: Estate | null;
  currentEstate: Estate | null;
  filters: EstateFilters;
  isLoading: boolean;
  isPendingLoading: boolean;
  isApprovedLoading: boolean;
  isCurrentEstateLoading: boolean;
  error: string | null;
  pendingEstatesError: string | null;
  approvedEstatesError: string | null;
  currentEstateError: string | null;
}

export type {
  Estate,
  EstateFilters,
  RejectEstateRequest,
};


