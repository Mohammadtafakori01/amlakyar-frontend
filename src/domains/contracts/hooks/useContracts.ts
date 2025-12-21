import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import {
  createContractStep1,
  addParty,
  createContractStep2,
  updateProperty,
  updateTerms,
  saveDraft,
  finalizeContract,
  createContractFull,
  fetchContracts,
  fetchArchive,
  searchContracts,
  fetchContractById,
  updateContract,
  updateContractStatus,
  deleteContract,
  setSelectedContract,
  setFilters,
  clearError,
  clearSearch,
} from '../store/contractsSlice';
import {
  CreateContractStep1Request,
  AddPartyRequest,
  CreateContractStep2Request,
  UpdatePropertyRequest,
  UpdateTermsRequest,
  SaveDraftRequest,
  CreateContractFullRequest,
  UpdateContractRequest,
  UpdateContractStatusRequest,
  ContractFilters,
  ArchiveContractsDto,
} from '../types';

export const useContracts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const contracts = useSelector((state: RootState) => state.contracts);

  return {
    ...contracts,
    createContractStep1: (data: CreateContractStep1Request) => dispatch(createContractStep1(data)),
    addParty: (contractId: string, data: AddPartyRequest) => dispatch(addParty({ contractId, data })),
    createContractStep2: (contractId: string, data: CreateContractStep2Request) => dispatch(createContractStep2({ contractId, data })),
    updateProperty: (contractId: string, data: UpdatePropertyRequest) => dispatch(updateProperty({ contractId, data })),
    updateTerms: (contractId: string, data: UpdateTermsRequest) => dispatch(updateTerms({ contractId, data })),
    saveDraft: (contractId: string, data: SaveDraftRequest) => dispatch(saveDraft({ contractId, data })),
    finalizeContract: (contractId: string) => dispatch(finalizeContract(contractId)),
    createContractFull: (data: CreateContractFullRequest) => dispatch(createContractFull(data)),
    fetchContracts: (filters?: ContractFilters) => dispatch(fetchContracts(filters)),
    fetchArchive: (filters: ArchiveContractsDto) => dispatch(fetchArchive(filters)),
    searchContracts: (query: string) => dispatch(searchContracts(query)),
    fetchContractById: (id: string) => dispatch(fetchContractById(id)),
    updateContract: (id: string, data: UpdateContractRequest) => dispatch(updateContract({ id, data })),
    updateContractStatus: (id: string, data: UpdateContractStatusRequest) => dispatch(updateContractStatus({ id, data })),
    deleteContract: (id: string) => dispatch(deleteContract(id)),
    setSelectedContract: (contract: any) => dispatch(setSelectedContract(contract)),
    setFilters: (filters: ContractFilters) => dispatch(setFilters(filters)),
    clearError: () => dispatch(clearError()),
    clearSearch: () => dispatch(clearSearch()),
  };
};


