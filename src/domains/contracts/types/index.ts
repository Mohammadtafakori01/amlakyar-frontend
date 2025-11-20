// Contract Enums
export enum ContractType {
  RENTAL = 'RENTAL',
  PURCHASE = 'PURCHASE',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum PartyType {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
}

export enum PartyRole {
  PRINCIPAL = 'PRINCIPAL',
  REPRESENTATIVE = 'REPRESENTATIVE',
  ATTORNEY = 'ATTORNEY',
}

export enum PartyEntityType {
  NATURAL = 'NATURAL',
  LEGAL = 'LEGAL',
}

export enum ShareType {
  DANG = 'DANG',
  PERCENTAGE = 'PERCENTAGE',
}

export enum RelationshipType {
  ATTORNEY = 'ATTORNEY',
  MANAGEMENT = 'MANAGEMENT',
  GUARDIAN = 'GUARDIAN',
  OTHER = 'OTHER',
}

// Contract Party Types
export interface NaturalPerson {
  firstName: string;
  lastName: string;
  nationalId: string;
}

export interface LegalPerson {
  companyName: string;
  registrationNumber?: string;
  companyNationalId: string;
  officialGazette?: string;
}

export interface PartyRelationship {
  principalPartyId: string;
  relationshipType: RelationshipType;
  relationshipDocumentNumber: string;
  relationshipDocumentDate: string;
}

export interface ContractParty {
  id?: string;
  partyType: PartyType;
  partyRole: PartyRole;
  entityType: PartyEntityType;
  shareType: ShareType;
  shareValue: number;
  // Natural person fields
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  // Legal person fields
  companyName?: string;
  registrationNumber?: string;
  companyNationalId?: string;
  officialGazette?: string;
  // Relationship fields (for representative/attorney)
  principalPartyId?: string;
  relationshipType?: RelationshipType;
  relationshipDocumentNumber?: string;
  relationshipDocumentDate?: string;
  // Related party (for display)
  principalParty?: ContractParty;
}

// Property Details
export interface PropertyAmenities {
  flooring?: string;
  bathroom?: string;
  water?: string;
  meetingHall?: boolean;
  club?: boolean;
  waterCommons?: boolean;
  hotWaterSystem?: string;
  ventilationSystem?: string;
}

export interface PropertyDetails {
  propertyType?: string;
  usageType?: string;
  address?: string;
  postalCode?: string;
  registrationNumber?: string;
  subRegistrationNumber?: string;
  mainRegistrationNumber?: string;
  section?: string;
  area?: number;
  areaUnit?: string;
  ownershipDocumentType?: string;
  ownershipDocumentSerial?: string;
  ownershipDocumentOwner?: string;
  storageCount?: number;
  storageNumbers?: string[];
  parkingCount?: number;
  parkingNumbers?: string[];
  amenities?: PropertyAmenities;
}

// Contract Terms
export interface ContractTerms {
  evictionNoticeDays?: number;
  dailyPenaltyAmount?: number;
  dailyDelayPenalty?: number;
  dailyOccupancyPenalty?: number;
  deliveryDate?: string;
  deliveryDelayPenalty?: number;
  usagePurpose?: string;
  occupantCount?: number;
  customTerms?: string;
}

// Contract Model
export interface Contract {
  id: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  contractDate: string;
  startDate: string;
  endDate: string;
  rentalAmount?: number;
  depositAmount?: number;
  parties?: ContractParty[];
  propertyDetails?: PropertyDetails;
  terms?: ContractTerms;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateContractStep1Request {
  type: ContractType;
}

export interface AddPartyRequest {
  partyType: PartyType;
  partyRole: PartyRole;
  entityType: PartyEntityType;
  shareType: ShareType;
  shareValue: number;
  // Natural person
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  // Legal person
  companyName?: string;
  registrationNumber?: string;
  companyNationalId?: string;
  officialGazette?: string;
  // Relationship
  principalPartyId?: string;
  relationshipType?: RelationshipType;
  relationshipDocumentNumber?: string;
  relationshipDocumentDate?: string;
}

export interface CreateContractStep2Request {
  parties: AddPartyRequest[];
}

export interface UpdatePropertyRequest extends PropertyDetails {}

export interface UpdateTermsRequest extends ContractTerms {}

export interface SaveDraftRequest {
  contractDate?: string;
  startDate?: string;
  endDate?: string;
  rentalAmount?: number;
  depositAmount?: number;
}

export interface CreateContractFullRequest {
  type: ContractType;
  contractDate?: string;
  startDate?: string;
  endDate?: string;
  rentalAmount?: number;
  depositAmount?: number;
  parties?: {
    parties: AddPartyRequest[];
  };
  propertyDetails?: PropertyDetails;
  terms?: ContractTerms;
}

export interface UpdateContractRequest {
  contractDate?: string;
  startDate?: string;
  endDate?: string;
  rentalAmount?: number;
  depositAmount?: number;
}

export interface UpdateContractStatusRequest {
  status: ContractStatus;
}

// Filter Types
export interface ContractFilters {
  type?: ContractType;
  status?: ContractStatus;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContractsState {
  contracts: Contract[];
  selectedContract: Contract | null;
  filters: ContractFilters;
  pagination: any | null;
  isLoading: boolean;
  error: string | null;
  searchResults: Contract[];
  isSearching: boolean;
  searchQuery: string | null;
}

