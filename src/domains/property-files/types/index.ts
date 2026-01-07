// Property Files Enums
export enum PropertyFileZone {
  OFFICE_MASTER = 'OFFICE_MASTER',
  INTERNAL_COOPERATION = 'INTERNAL_COOPERATION',
  EXTERNAL_NETWORK = 'EXTERNAL_NETWORK',
  PERSONAL = 'PERSONAL',
}

export enum PropertyTransactionType {
  SALE = 'SALE',
  RENT = 'RENT',
  MORTGAGE = 'MORTGAGE',
  PARTNERSHIP = 'PARTNERSHIP',
  EXCHANGE = 'EXCHANGE',
}

export enum PropertyBuildingType {
  VILLA = 'VILLA',
  APARTMENT = 'APARTMENT',
  COMMERCIAL = 'COMMERCIAL',
  OUTSIDE = 'OUTSIDE',
  OLD = 'OLD',
  OFFICE = 'OFFICE',
  SHOP = 'SHOP',
  REAL_ESTATE = 'REAL_ESTATE',
}

export enum PropertyDirection {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
}

export enum VisitType {
  PHONE = 'PHONE',
  IN_PERSON = 'IN_PERSON',
}

export enum PropertyFilePriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum PropertyFileStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

// Floor Details Interface
export interface FloorDetails {
  floorNumber: number;
  title?: string;
  area?: number;
  bedrooms?: number;
  phone?: boolean;
  kitchen?: boolean;
  openKitchen?: boolean;
  bathroom?: number;
  flooring?: string;
  parking?: boolean;
  storage?: boolean;
  fireplace?: boolean;
  cooler?: boolean;
  fanCoil?: boolean;
  chiller?: boolean;
  package?: boolean;
}

// Property File Interface
export interface PropertyFile {
  id: string;
  uniqueCode: string;
  zone: PropertyFileZone;
  owner: string;
  region: string;
  phone?: string;
  date: string;
  address: string;
  transactionType: PropertyTransactionType;
  buildingType: PropertyBuildingType;
  direction?: PropertyDirection;
  floors?: FloorDetails[];
  unit?: string;
  totalPrice?: number;
  unitPrice?: number;
  mortgagePrice?: number;
  unitsPerFloor?: number;
  totalFloors?: number;
  totalArea?: number;
  renovated?: number;
  landArea?: number;
  density?: string;
  length?: number;
  width?: number;
  yard?: number;
  backyard?: number;
  basement?: number;
  servantRoom?: number;
  porch?: number;
  residential: boolean;
  vacant: boolean;
  rentStatus: boolean;
  buildingAge?: number;
  facade?: string;
  informationSource?: string;
  ownerResidence?: string;
  documentStatus?: string;
  description?: string;
  // Building-level equipment
  heating?: boolean;
  elevator?: boolean;
  sauna?: boolean;
  jacuzzi?: boolean;
  pool?: boolean;
  videoIntercom?: boolean;
  remoteDoor?: boolean;
  // New fields from backend
  tags?: string[];
  priority?: PropertyFilePriority;
  status?: PropertyFileStatus;
  expiryDate?: string;
  attachments?: string[];
  deletedAt?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  estate: {
    id: string;
    establishmentName: string;
  };
  sharedFromEstate?: {
    id: string;
    establishmentName: string;
  };
  isSharedInternally: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreatePropertyFileRequest {
  uniqueCode?: string;
  zone: PropertyFileZone;
  owner: string;
  region: string;
  phone?: string;
  date: string;
  address: string;
  transactionType: PropertyTransactionType;
  buildingType: PropertyBuildingType;
  direction?: PropertyDirection;
  floors?: FloorDetails[];
  unit?: string;
  totalPrice?: number;
  unitPrice?: number;
  mortgagePrice?: number;
  unitsPerFloor?: number;
  totalFloors?: number;
  totalArea?: number;
  renovated?: number;
  landArea?: number;
  density?: string;
  length?: number;
  width?: number;
  yard?: number;
  backyard?: number;
  basement?: number;
  servantRoom?: number;
  porch?: number;
  residential?: boolean;
  vacant?: boolean;
  rentStatus?: boolean;
  buildingAge?: number;
  facade?: string;
  informationSource?: string;
  ownerResidence?: string;
  documentStatus?: string;
  description?: string;
  // Building-level equipment
  heating?: boolean;
  elevator?: boolean;
  sauna?: boolean;
  jacuzzi?: boolean;
  pool?: boolean;
  videoIntercom?: boolean;
  remoteDoor?: boolean;
  // Additional features
  hasServantRoom?: boolean;
  hasYard?: boolean;
  hasPorch?: boolean;
  // New fields
  tags?: string[];
  priority?: PropertyFilePriority;
  status?: PropertyFileStatus;
  expiryDate?: string;
  attachments?: string[];
}

export interface UpdatePropertyFileRequest extends Partial<CreatePropertyFileRequest> {}

export interface PropertyFileFilters {
  page?: number;
  limit?: number;
  zone?: PropertyFileZone;
  transactionType?: PropertyTransactionType;
  buildingType?: PropertyBuildingType;
  estateId?: string;
  search?: string;
  // Advanced filters
  minPrice?: number;
  maxPrice?: number;
  minMortgagePrice?: number;
  maxMortgagePrice?: number;
  minArea?: number;
  maxArea?: number;
  fromDate?: string;
  toDate?: string;
  region?: string;
}

export interface ShareExternalRequest {
  targetEstateId: string;
}

export interface BulkOperationRequest {
  fileIds: string[];
  operation: 'DELETE' | 'SHARE_INTERNAL';
  targetEstateId?: string; // For SHARE_INTERNAL
}

export interface PropertyFileAuditLog {
  id: string;
  propertyFileId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SHARE_INTERNAL' | 'SHARE_EXTERNAL' | 'SHARE_FROM_PERSONAL' | 'RESTORE';
  changedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: string;
}

export interface PropertyFileStatistics {
  totalFiles: number;
  filesByZone: Record<PropertyFileZone, number>;
  filesByTransactionType: Record<PropertyTransactionType, number>;
  filesByBuildingType: Record<PropertyBuildingType, number>;
  averagePrice: number;
  recentFilesCount: number; // Last 30 days
}

// Response Types
export interface PropertyFilesResponse {
  data: PropertyFile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// State Types
export interface PropertyFilesState {
  propertyFiles: PropertyFile[];
  selectedFile: PropertyFile | null;
  filters: PropertyFileFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
  auditLogs: PropertyFileAuditLog[];
  statistics: PropertyFileStatistics | null;
}

