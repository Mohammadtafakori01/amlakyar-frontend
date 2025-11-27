import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import {
  fetchEstates,
  fetchEstateById,
  fetchCurrentEstate,
  fetchPendingEstates,
  fetchApprovedEstates,
  approveEstate,
  rejectEstate,
  updateEstate,
  deleteEstate,
  createEstateByMaster,
  setEstateStatus,
  setEstateFilters,
  clearEstatesError,
  clearCurrentEstate,
} from '../store/estatesSlice';
import { EstateFilters, UpdateEstateRequest, CreateEstateByMasterRequest, SetEstateStatusRequest } from '../types';

export const useEstates = () => {
  const dispatch = useDispatch<AppDispatch>();
  const estatesState = useSelector((state: RootState) => state.estates);

  const fetchEstatesAction = useCallback(
    (filters?: EstateFilters) => dispatch(fetchEstates(filters)),
    [dispatch]
  );

  const fetchEstateByIdAction = useCallback(
    (estateId: string) => dispatch(fetchEstateById(estateId)),
    [dispatch]
  );

  const fetchCurrentEstateAction = useCallback(
    (estateId: string) => dispatch(fetchCurrentEstate(estateId)),
    [dispatch]
  );

  const fetchPendingEstatesAction = useCallback(
    () => dispatch(fetchPendingEstates()),
    [dispatch]
  );

  const fetchApprovedEstatesAction = useCallback(
    () => dispatch(fetchApprovedEstates()),
    [dispatch]
  );

  const approveEstateAction = useCallback(
    (estateId: string) => dispatch(approveEstate(estateId)),
    [dispatch]
  );

  const rejectEstateAction = useCallback(
    (estateId: string, reason?: string) => dispatch(rejectEstate({ estateId, payload: reason ? { reason } : undefined })),
    [dispatch]
  );

  const updateEstateAction = useCallback(
    (id: string, data: UpdateEstateRequest) => dispatch(updateEstate({ id, data })),
    [dispatch]
  );

  const deleteEstateAction = useCallback(
    (id: string) => dispatch(deleteEstate(id)),
    [dispatch]
  );

  const createEstateByMasterAction = useCallback(
    (data: CreateEstateByMasterRequest) => dispatch(createEstateByMaster(data)),
    [dispatch]
  );

  const setEstateStatusAction = useCallback(
    (id: string, data: SetEstateStatusRequest) => dispatch(setEstateStatus({ id, data })),
    [dispatch]
  );

  const setFiltersAction = useCallback(
    (filters: EstateFilters) => dispatch(setEstateFilters(filters)),
    [dispatch]
  );

  const clearErrorAction = useCallback(
    () => dispatch(clearEstatesError()),
    [dispatch]
  );

  const clearCurrentEstateAction = useCallback(
    () => dispatch(clearCurrentEstate()),
    [dispatch]
  );

  return {
    ...estatesState,
    fetchEstates: fetchEstatesAction,
    fetchEstateById: fetchEstateByIdAction,
    fetchCurrentEstate: fetchCurrentEstateAction,
    fetchPendingEstates: fetchPendingEstatesAction,
    fetchApprovedEstates: fetchApprovedEstatesAction,
    approveEstate: approveEstateAction,
    rejectEstate: rejectEstateAction,
    updateEstate: updateEstateAction,
    deleteEstate: deleteEstateAction,
    createEstateByMaster: createEstateByMasterAction,
    setEstateStatus: setEstateStatusAction,
    setFilters: setFiltersAction,
    clearError: clearErrorAction,
    clearCurrentEstate: clearCurrentEstateAction,
  };
};


