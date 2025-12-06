// Property Ad Enums
export enum AdType {
  RESIDENTIAL_SALE = 'RESIDENTIAL_SALE',
  RESIDENTIAL_RENT = 'RESIDENTIAL_RENT',
  COMMERCIAL_SALE = 'COMMERCIAL_SALE',
  COMMERCIAL_RENT = 'COMMERCIAL_RENT',
  SHORT_TERM_RENT = 'SHORT_TERM_RENT',
  CONSTRUCTION_PROJECT = 'CONSTRUCTION_PROJECT',
}

export enum AdStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AdvertiserType {
  PERSONAL = 'PERSONAL',
  ESTATE_AGENT = 'ESTATE_AGENT',
}

export enum Orientation {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
}

// Location Types
export interface State {
  id: string;
  name: string;
  cities?: City[];
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  stateId: string;
  state?: State;
  neighborhoods?: Neighborhood[];
  createdAt: string;
  updatedAt: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
  city?: City;
  createdAt: string;
  updatedAt: string;
}

// Image Types
export interface PropertyAdImage {
  id: string;
  propertyAdId: string;
  filePath: string;
  fileName: string;
  order: number;
  isPrimary: boolean;
  createdAt: string;
}

// Property Ad Model
export interface PropertyAd {
  id: string;
  adType: AdType;
  subcategory: string;
  title: string;
  description: string;
  stateId: string;
  cityId: string;
  neighborhoodId: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  areaSqm: number;
  rooms?: number;
  buildingAge?: number;
  floor?: string;
  totalFloors?: number;
  unitsPerFloor?: number;
  orientation?: Orientation;
  // Pricing fields
  totalPrice?: number; // For sale ads
  depositValue?: number; // For rent ads
  minDepositValue?: number; // Minimum deposit (رهن) when isPriceConvertible is true
  maxDepositValue?: number; // Maximum deposit (رهن) when isPriceConvertible is true
  monthlyRent?: number; // For rent ads
  pricePerSqm?: number; // Calculated automatically
  isPriceConvertible?: boolean;
  // Features
  hasElevator?: boolean;
  hasParking?: boolean;
  parkingCount?: number;
  hasStorage?: boolean;
  storageArea?: number;
  hasBalcony?: boolean;
  heatingCoolingSystem?: string;
  otherFeatures?: string[];
  deedType?: string;
  // Status and metadata
  status: AdStatus;
  advertiserType: AdvertiserType;
  contactNumber: string;
  virtualTourUrl?: string | null;
  // Relations
  state?: State;
  city?: City;
  neighborhood?: Neighborhood;
  images?: PropertyAdImage[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Request Types
export interface CreatePropertyAdRequest {
  adType: AdType;
  subcategory: string;
  title: string;
  description: string;
  stateId: string;
  cityId: string;
  neighborhoodId: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  areaSqm: number;
  rooms?: number;
  buildingAge?: number;
  floor?: string;
  totalFloors?: number;
  unitsPerFloor?: number;
  orientation?: Orientation;
  totalPrice?: number;
  depositValue?: number;
  minDepositValue?: number;
  maxDepositValue?: number;
  monthlyRent?: number;
  isPriceConvertible?: boolean;
  hasElevator?: boolean;
  hasParking?: boolean;
  parkingCount?: number;
  hasStorage?: boolean;
  storageArea?: number;
  hasBalcony?: boolean;
  heatingCoolingSystem?: string;
  otherFeatures?: string[];
  deedType?: string;
  status?: AdStatus;
  advertiserType?: AdvertiserType;
  contactNumber: string;
  virtualTourUrl?: string | null;
}

export interface UpdatePropertyAdRequest {
  adType?: AdType;
  subcategory?: string;
  title?: string;
  description?: string;
  stateId?: string;
  cityId?: string;
  neighborhoodId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  areaSqm?: number;
  rooms?: number;
  buildingAge?: number;
  floor?: string;
  totalFloors?: number;
  unitsPerFloor?: number;
  orientation?: Orientation;
  totalPrice?: number;
  depositValue?: number;
  minDepositValue?: number;
  maxDepositValue?: number;
  monthlyRent?: number;
  isPriceConvertible?: boolean;
  hasElevator?: boolean;
  hasParking?: boolean;
  parkingCount?: number;
  hasStorage?: boolean;
  storageArea?: number;
  hasBalcony?: boolean;
  heatingCoolingSystem?: string;
  otherFeatures?: string[];
  deedType?: string;
  status?: AdStatus;
  advertiserType?: AdvertiserType;
  contactNumber?: string;
  virtualTourUrl?: string;
}

// Filter Types
export interface PropertyAdFilters {
  page?: number;
  limit?: number;
  adType?: AdType;
  subcategory?: string;
  stateId?: string;
  cityId?: string;
  neighborhoodId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDepositValue?: number;
  maxDepositValue?: number;
  minArea?: number;
  maxArea?: number;
  rooms?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasStorage?: boolean;
  hasBalcony?: boolean;
  orientation?: Orientation;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  search?: string;
  status?: AdStatus;
}

// Create State Request (MASTER only)
export interface CreateStateRequest {
  name: string;
}

// Update State Request (MASTER only)
export interface UpdateStateRequest {
  name?: string;
}

// Create City Request (MASTER only)
export interface CreateCityRequest {
  name: string;
  stateId: string;
}

// Update City Request (MASTER only)
export interface UpdateCityRequest {
  name?: string;
  stateId?: string;
}

// Create Neighborhood Request (MASTER only)
export interface CreateNeighborhoodRequest {
  name: string;
  cityId: string;
}

// Update Neighborhood Request (MASTER only)
export interface UpdateNeighborhoodRequest {
  name?: string;
  cityId?: string;
}

// State Types
export interface PropertyAdsState {
  propertyAds: PropertyAd[];
  selectedPropertyAd: PropertyAd | null;
  filters: PropertyAdFilters;
  pagination: any | null;
  isLoading: boolean;
  error: string | null;
  // Location data
  states: State[];
  cities: City[];
  neighborhoods: Neighborhood[];
  isLoadingStates: boolean;
  isLoadingCities: boolean;
  isLoadingNeighborhoods: boolean;
}
