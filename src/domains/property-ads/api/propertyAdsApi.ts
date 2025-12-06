import apiClient from '../../../shared/api/client';
import {
  PropertyAd,
  CreatePropertyAdRequest,
  UpdatePropertyAdRequest,
  PropertyAdFilters,
  PropertyAdImage,
  State,
  City,
  Neighborhood,
  CreateStateRequest,
  UpdateStateRequest,
  CreateCityRequest,
  UpdateCityRequest,
  CreateNeighborhoodRequest,
  UpdateNeighborhoodRequest,
} from '../types';
import { PaginatedResponse } from '../../../shared/types';

export const propertyAdsApi = {
  // Create Property Ad
  createPropertyAd: async (data: CreatePropertyAdRequest): Promise<PropertyAd> => {
    const response = await apiClient.post<PropertyAd>('/property-ads', data);
    // Ensure images always returns an array (field might not exist in response)
    return {
      ...response.data,
      images: response.data.images || [],
    };
  },

  // Update Property Ad
  updatePropertyAd: async (id: string, data: UpdatePropertyAdRequest): Promise<PropertyAd> => {
    const response = await apiClient.patch<PropertyAd>(`/property-ads/${id}`, data);
    // Ensure images always returns an array (field might not exist in response)
    return {
      ...response.data,
      images: response.data.images || [],
    };
  },

  // Delete Property Ad
  deletePropertyAd: async (id: string): Promise<void> => {
    await apiClient.delete(`/property-ads/${id}`);
  },

  // Get Property Ad by ID
  getPropertyAdById: async (id: string): Promise<PropertyAd> => {
    const response = await apiClient.get<PropertyAd>(`/property-ads/${id}`);
    // Ensure images always returns an array (field might not exist in response)
    return {
      ...response.data,
      images: response.data.images || [],
    };
  },

  // Search Property Ads
  searchPropertyAds: async (filters?: PropertyAdFilters): Promise<PaginatedResponse<PropertyAd>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.adType) params.append('adType', filters.adType);
    if (filters?.subcategory) params.append('subcategory', filters.subcategory);
    if (filters?.stateId) params.append('stateId', filters.stateId);
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minDepositValue) params.append('minDepositValue', filters.minDepositValue.toString());
    if (filters?.maxDepositValue) params.append('maxDepositValue', filters.maxDepositValue.toString());
    if (filters?.minArea) params.append('minArea', filters.minArea.toString());
    if (filters?.maxArea) params.append('maxArea', filters.maxArea.toString());
    if (filters?.rooms) params.append('rooms', filters.rooms.toString());
    if (filters?.hasElevator !== undefined) params.append('hasElevator', filters.hasElevator.toString());
    if (filters?.hasParking !== undefined) params.append('hasParking', filters.hasParking.toString());
    if (filters?.hasStorage !== undefined) params.append('hasStorage', filters.hasStorage.toString());
    if (filters?.hasBalcony !== undefined) params.append('hasBalcony', filters.hasBalcony.toString());
    if (filters?.orientation) params.append('orientation', filters.orientation);
    if (filters?.latitude) params.append('latitude', filters.latitude.toString());
    if (filters?.longitude) params.append('longitude', filters.longitude.toString());
    if (filters?.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/property-ads?${queryString}` : '/property-ads';
    const response = await apiClient.get<PaginatedResponse<PropertyAd>>(url);
    // Ensure all ads have images as an array (field might not exist in response)
    return {
      ...response.data,
      data: (response.data.data || []).map((ad) => ({
        ...ad,
        images: ad.images || [],
      })),
    };
  },

  // Find My Ads (authenticated user's ads)
  findMyAds: async (filters?: PropertyAdFilters): Promise<PaginatedResponse<PropertyAd>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.adType) params.append('adType', filters.adType);
    if (filters?.subcategory) params.append('subcategory', filters.subcategory);
    if (filters?.stateId) params.append('stateId', filters.stateId);
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minDepositValue) params.append('minDepositValue', filters.minDepositValue.toString());
    if (filters?.maxDepositValue) params.append('maxDepositValue', filters.maxDepositValue.toString());
    if (filters?.minArea) params.append('minArea', filters.minArea.toString());
    if (filters?.maxArea) params.append('maxArea', filters.maxArea.toString());
    if (filters?.rooms) params.append('rooms', filters.rooms.toString());
    if (filters?.hasElevator !== undefined) params.append('hasElevator', filters.hasElevator.toString());
    if (filters?.hasParking !== undefined) params.append('hasParking', filters.hasParking.toString());
    if (filters?.hasStorage !== undefined) params.append('hasStorage', filters.hasStorage.toString());
    if (filters?.hasBalcony !== undefined) params.append('hasBalcony', filters.hasBalcony.toString());
    if (filters?.orientation) params.append('orientation', filters.orientation);
    if (filters?.latitude) params.append('latitude', filters.latitude.toString());
    if (filters?.longitude) params.append('longitude', filters.longitude.toString());
    if (filters?.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/property-ads/my-ads?${queryString}` : '/property-ads/my-ads';
    const response = await apiClient.get<PaginatedResponse<PropertyAd>>(url);
    // Ensure all ads have images as an array (field might not exist in response)
    return {
      ...response.data,
      data: (response.data.data || []).map((ad) => ({
        ...ad,
        images: ad.images || [],
      })),
    };
  },

  // Upload Images
  uploadImages: async (id: string, images: File[]): Promise<PropertyAdImage[]> => {
    if (!images || images.length === 0) {
      throw new Error('No images provided for upload');
    }

    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('images', image);
    });

    // Create a new axios request config without the default Content-Type
    // Browser will automatically set Content-Type with boundary for FormData
    const response = await apiClient.post<PropertyAdImage[]>(`/property-ads/${id}/images`, formData);
    return response.data;
  },

  // Delete Image
  deleteImage: async (id: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/property-ads/${id}/images/${imageId}`);
  },

  // Location Management - States
  getAllStates: async (): Promise<State[]> => {
    const response = await apiClient.get<State[]>('/property-ads/states');
    return response.data;
  },

  getStateById: async (stateId: string): Promise<State> => {
    const response = await apiClient.get<State>(`/property-ads/states/${stateId}`);
    return response.data;
  },

  createState: async (data: CreateStateRequest): Promise<State> => {
    const response = await apiClient.post<State>('/property-ads/states', data);
    return response.data;
  },

  updateState: async (stateId: string, data: UpdateStateRequest): Promise<State> => {
    const response = await apiClient.patch<State>(`/property-ads/states/${stateId}`, data);
    return response.data;
  },

  deleteState: async (stateId: string): Promise<void> => {
    await apiClient.delete(`/property-ads/states/${stateId}`);
  },

  // Location Management - Cities
  getAllCities: async (): Promise<City[]> => {
    const response = await apiClient.get<City[]>('/property-ads/cities');
    return response.data;
  },

  getCityById: async (cityId: string): Promise<City> => {
    const response = await apiClient.get<City>(`/property-ads/cities/${cityId}`);
    return response.data;
  },

  createCity: async (data: CreateCityRequest): Promise<City> => {
    const response = await apiClient.post<City>('/property-ads/cities', data);
    return response.data;
  },

  updateCity: async (cityId: string, data: UpdateCityRequest): Promise<City> => {
    const response = await apiClient.patch<City>(`/property-ads/cities/${cityId}`, data);
    return response.data;
  },

  deleteCity: async (cityId: string): Promise<void> => {
    await apiClient.delete(`/property-ads/cities/${cityId}`);
  },

  // Location Management - Neighborhoods
  getNeighborhoodsByCity: async (cityId: string): Promise<Neighborhood[]> => {
    const response = await apiClient.get<Neighborhood[]>(`/property-ads/cities/${cityId}/neighborhoods`);
    return response.data;
  },

  getNeighborhoodById: async (neighborhoodId: string): Promise<Neighborhood> => {
    const response = await apiClient.get<Neighborhood>(`/property-ads/neighborhoods/${neighborhoodId}`);
    return response.data;
  },

  createNeighborhood: async (data: CreateNeighborhoodRequest): Promise<Neighborhood> => {
    const response = await apiClient.post<Neighborhood>('/property-ads/neighborhoods', data);
    return response.data;
  },

  updateNeighborhood: async (neighborhoodId: string, data: UpdateNeighborhoodRequest): Promise<Neighborhood> => {
    const response = await apiClient.patch<Neighborhood>(`/property-ads/neighborhoods/${neighborhoodId}`, data);
    return response.data;
  },

  deleteNeighborhood: async (neighborhoodId: string): Promise<void> => {
    await apiClient.delete(`/property-ads/neighborhoods/${neighborhoodId}`);
  },
};
