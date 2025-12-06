import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../app/store';
import {
  createPropertyAd,
  updatePropertyAd,
  deletePropertyAd,
  fetchPropertyAdById,
  searchPropertyAds,
  findMyAds,
  uploadImages,
  deleteImage,
  fetchAllStates,
  fetchStateById,
  createState,
  updateState,
  deleteState,
  fetchAllCities,
  fetchCityById,
  fetchNeighborhoodsByCity,
  createCity,
  updateCity,
  deleteCity,
  fetchNeighborhoodById,
  createNeighborhood,
  updateNeighborhood,
  deleteNeighborhood,
  setSelectedPropertyAd,
  setFilters,
  clearError,
  clearNeighborhoods,
} from '../store/propertyAdsSlice';
import {
  CreatePropertyAdRequest,
  UpdatePropertyAdRequest,
  PropertyAdFilters,
  CreateStateRequest,
  UpdateStateRequest,
  CreateCityRequest,
  UpdateCityRequest,
  CreateNeighborhoodRequest,
  UpdateNeighborhoodRequest,
} from '../types';

export const usePropertyAds = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.propertyAds);

  return {
    // State
    propertyAds: state.propertyAds,
    selectedPropertyAd: state.selectedPropertyAd,
    filters: state.filters,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    states: state.states,
    cities: state.cities,
    neighborhoods: state.neighborhoods,
    isLoadingStates: state.isLoadingStates,
    isLoadingCities: state.isLoadingCities,
    isLoadingNeighborhoods: state.isLoadingNeighborhoods,

    // Actions
    createPropertyAd: useCallback(
      (data: CreatePropertyAdRequest) => dispatch(createPropertyAd(data)),
      [dispatch]
    ),
    updatePropertyAd: useCallback(
      (id: string, data: UpdatePropertyAdRequest) => dispatch(updatePropertyAd({ id, data })),
      [dispatch]
    ),
    deletePropertyAd: useCallback((id: string) => dispatch(deletePropertyAd(id)), [dispatch]),
    fetchPropertyAdById: useCallback((id: string) => dispatch(fetchPropertyAdById(id)), [dispatch]),
    searchPropertyAds: useCallback(
      (filters?: PropertyAdFilters) => dispatch(searchPropertyAds(filters)),
      [dispatch]
    ),
    findMyAds: useCallback(
      (filters?: PropertyAdFilters) => dispatch(findMyAds(filters)),
      [dispatch]
    ),
    uploadImages: useCallback(
      (id: string, images: File[]) => dispatch(uploadImages({ id, images })),
      [dispatch]
    ),
    deleteImage: useCallback(
      (id: string, imageId: string) => dispatch(deleteImage({ id, imageId })),
      [dispatch]
    ),
    // Location Management - States
    fetchAllStates: useCallback(() => dispatch(fetchAllStates()), [dispatch]),
    fetchStateById: useCallback((stateId: string) => dispatch(fetchStateById(stateId)), [dispatch]),
    createState: useCallback((data: CreateStateRequest) => dispatch(createState(data)), [dispatch]),
    updateState: useCallback(
      (stateId: string, data: UpdateStateRequest) => dispatch(updateState({ stateId, data })),
      [dispatch]
    ),
    deleteState: useCallback((stateId: string) => dispatch(deleteState(stateId)), [dispatch]),
    // Location Management - Cities
    fetchAllCities: useCallback(() => dispatch(fetchAllCities()), [dispatch]),
    fetchCityById: useCallback((cityId: string) => dispatch(fetchCityById(cityId)), [dispatch]),
    fetchNeighborhoodsByCity: useCallback(
      (cityId: string) => dispatch(fetchNeighborhoodsByCity(cityId)),
      [dispatch]
    ),
    createCity: useCallback((data: CreateCityRequest) => dispatch(createCity(data)), [dispatch]),
    updateCity: useCallback(
      (cityId: string, data: UpdateCityRequest) => dispatch(updateCity({ cityId, data })),
      [dispatch]
    ),
    deleteCity: useCallback((cityId: string) => dispatch(deleteCity(cityId)), [dispatch]),
    // Location Management - Neighborhoods
    fetchNeighborhoodById: useCallback(
      (neighborhoodId: string) => dispatch(fetchNeighborhoodById(neighborhoodId)),
      [dispatch]
    ),
    createNeighborhood: useCallback(
      (data: CreateNeighborhoodRequest) => dispatch(createNeighborhood(data)),
      [dispatch]
    ),
    updateNeighborhood: useCallback(
      (neighborhoodId: string, data: UpdateNeighborhoodRequest) =>
        dispatch(updateNeighborhood({ neighborhoodId, data })),
      [dispatch]
    ),
    deleteNeighborhood: useCallback(
      (neighborhoodId: string) => dispatch(deleteNeighborhood(neighborhoodId)),
      [dispatch]
    ),
    setSelectedPropertyAd: useCallback(
      (ad: typeof state.selectedPropertyAd) => dispatch(setSelectedPropertyAd(ad)),
      [dispatch]
    ),
    setFilters: useCallback((filters: PropertyAdFilters) => dispatch(setFilters(filters)), [dispatch]),
    clearError: useCallback(() => dispatch(clearError()), [dispatch]),
    clearNeighborhoods: useCallback(() => dispatch(clearNeighborhoods()), [dispatch]),
  };
};
