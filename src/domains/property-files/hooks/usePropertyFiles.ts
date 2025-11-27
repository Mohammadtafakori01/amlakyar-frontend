import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import {
  fetchPropertyFiles,
  fetchPropertyFileById,
  createPropertyFile,
  updatePropertyFile,
  deletePropertyFile,
  shareInternal,
  shareExternal,
  shareFromPersonal,
  shareFromPersonalToExternal,
  restorePropertyFile,
  fetchDeletedPropertyFiles,
  fetchAuditLogs,
  bulkOperations,
  fetchStatistics,
  setSelectedFile,
  setFilters,
  clearError,
  clearAuditLogs,
  resetState,
} from '../store/propertyFilesSlice';
import {
  PropertyFileFilters,
  CreatePropertyFileRequest,
  UpdatePropertyFileRequest,
  ShareExternalRequest,
  BulkOperationRequest,
} from '../types';

export const usePropertyFiles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const propertyFiles = useSelector((state: RootState) => state.propertyFiles);

  const fetchPropertyFilesAction = useCallback(
    (filters?: PropertyFileFilters) => dispatch(fetchPropertyFiles(filters)),
    [dispatch]
  );

  const fetchPropertyFileByIdAction = useCallback(
    (id: string) => dispatch(fetchPropertyFileById(id)),
    [dispatch]
  );

  const createPropertyFileAction = useCallback(
    (data: CreatePropertyFileRequest) => dispatch(createPropertyFile(data)),
    [dispatch]
  );

  const updatePropertyFileAction = useCallback(
    (id: string, data: UpdatePropertyFileRequest) => dispatch(updatePropertyFile({ id, data })),
    [dispatch]
  );

  const deletePropertyFileAction = useCallback(
    (id: string) => dispatch(deletePropertyFile(id)),
    [dispatch]
  );

  const shareInternalAction = useCallback(
    (id: string) => dispatch(shareInternal(id)),
    [dispatch]
  );

  const shareExternalAction = useCallback(
    (id: string, data: ShareExternalRequest) => dispatch(shareExternal({ id, data })),
    [dispatch]
  );

  const shareFromPersonalAction = useCallback(
    (id: string) => dispatch(shareFromPersonal(id)),
    [dispatch]
  );

  const shareFromPersonalToExternalAction = useCallback(
    (id: string, data: ShareExternalRequest) => dispatch(shareFromPersonalToExternal({ id, data })),
    [dispatch]
  );

  const restorePropertyFileAction = useCallback(
    (id: string) => dispatch(restorePropertyFile(id)),
    [dispatch]
  );

  const fetchDeletedPropertyFilesAction = useCallback(
    (filters?: PropertyFileFilters) => dispatch(fetchDeletedPropertyFiles(filters)),
    [dispatch]
  );

  const fetchAuditLogsAction = useCallback(
    (id: string) => dispatch(fetchAuditLogs(id)),
    [dispatch]
  );

  const bulkOperationsAction = useCallback(
    (data: BulkOperationRequest) => dispatch(bulkOperations(data)),
    [dispatch]
  );

  const fetchStatisticsAction = useCallback(
    () => dispatch(fetchStatistics()),
    [dispatch]
  );

  const setSelectedFileAction = useCallback(
    (file: any) => dispatch(setSelectedFile(file)),
    [dispatch]
  );

  const setFiltersAction = useCallback(
    (filters: PropertyFileFilters) => dispatch(setFilters(filters)),
    [dispatch]
  );

  const clearErrorAction = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  const clearAuditLogsAction = useCallback(
    () => dispatch(clearAuditLogs()),
    [dispatch]
  );

  const resetStateAction = useCallback(
    () => dispatch(resetState()),
    [dispatch]
  );

  return {
    ...propertyFiles,
    fetchPropertyFiles: fetchPropertyFilesAction,
    fetchPropertyFileById: fetchPropertyFileByIdAction,
    createPropertyFile: createPropertyFileAction,
    updatePropertyFile: updatePropertyFileAction,
    deletePropertyFile: deletePropertyFileAction,
    shareInternal: shareInternalAction,
    shareExternal: shareExternalAction,
    shareFromPersonal: shareFromPersonalAction,
    shareFromPersonalToExternal: shareFromPersonalToExternalAction,
    restorePropertyFile: restorePropertyFileAction,
    fetchDeletedPropertyFiles: fetchDeletedPropertyFilesAction,
    fetchAuditLogs: fetchAuditLogsAction,
    bulkOperations: bulkOperationsAction,
    fetchStatistics: fetchStatisticsAction,
    setSelectedFile: setSelectedFileAction,
    setFilters: setFiltersAction,
    clearError: clearErrorAction,
    clearAuditLogs: clearAuditLogsAction,
    resetState: resetStateAction,
  };
};

