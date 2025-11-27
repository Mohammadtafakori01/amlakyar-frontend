import { Estate, EstateFilters, RejectEstateRequest, UpdateEstateRequest, CreateEstateByMasterRequest, SetEstateStatusRequest, PaginationMeta } from '../../../shared/types';

export interface EstatesState {
  estates: Estate[];
  pendingEstates: Estate[];
  approvedEstates: Estate[];
  selectedEstate: Estate | null;
  currentEstate: Estate | null;
  filters: EstateFilters;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isPendingLoading: boolean;
  isApprovedLoading: boolean;
  isCurrentEstateLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  isSettingStatus: boolean;
  error: string | null;
  pendingEstatesError: string | null;
  approvedEstatesError: string | null;
  currentEstateError: string | null;
}

export type {
  Estate,
  EstateFilters,
  RejectEstateRequest,
  UpdateEstateRequest,
  CreateEstateByMasterRequest,
  SetEstateStatusRequest,
};


