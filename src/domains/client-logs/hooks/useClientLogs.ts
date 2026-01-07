import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import {
  fetchClientLogs,
  fetchClientLogById,
  fetchPublicClientLogs,
  createClientLog,
  updateClientLog,
  deleteClientLog,
  shareClientLog,
  setSelectedLog,
  clearError,
  resetState,
} from '../store/clientLogsSlice';
import {
  CreateClientLogRequest,
  UpdateClientLogRequest,
  PublicClientLogsFilters,
} from '../types';

export const useClientLogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const clientLogs = useSelector((state: RootState) => state.clientLogs);

  const fetchClientLogsAction = useCallback(
    () => dispatch(fetchClientLogs()),
    [dispatch]
  );

  const fetchClientLogByIdAction = useCallback(
    (id: string) => dispatch(fetchClientLogById(id)),
    [dispatch]
  );

  const fetchPublicClientLogsAction = useCallback(
    (filters?: PublicClientLogsFilters) => dispatch(fetchPublicClientLogs(filters)),
    [dispatch]
  );

  const createClientLogAction = useCallback(
    (data: CreateClientLogRequest) => dispatch(createClientLog(data)),
    [dispatch]
  );

  const updateClientLogAction = useCallback(
    (id: string, data: UpdateClientLogRequest) => dispatch(updateClientLog({ id, data })),
    [dispatch]
  );

  const deleteClientLogAction = useCallback(
    (id: string) => dispatch(deleteClientLog(id)),
    [dispatch]
  );

  const shareClientLogAction = useCallback(
    (id: string) => dispatch(shareClientLog(id)),
    [dispatch]
  );

  const setSelectedLogAction = useCallback(
    (log: any) => dispatch(setSelectedLog(log)),
    [dispatch]
  );

  const clearErrorAction = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  const resetStateAction = useCallback(
    () => dispatch(resetState()),
    [dispatch]
  );

  return {
    ...clientLogs,
    fetchClientLogs: fetchClientLogsAction,
    fetchClientLogById: fetchClientLogByIdAction,
    fetchPublicClientLogs: fetchPublicClientLogsAction,
    createClientLog: createClientLogAction,
    updateClientLog: updateClientLogAction,
    deleteClientLog: deleteClientLogAction,
    shareClientLog: shareClientLogAction,
    setSelectedLog: setSelectedLogAction,
    clearError: clearErrorAction,
    resetState: resetStateAction,
  };
};

