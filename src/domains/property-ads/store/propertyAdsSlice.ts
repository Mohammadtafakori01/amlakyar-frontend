import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { propertyAdsApi } from '../api/propertyAdsApi';
import {
  PropertyAdsState,
  PropertyAd,
  CreatePropertyAdRequest,
  UpdatePropertyAdRequest,
  PropertyAdFilters,
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

const initialState: PropertyAdsState = {
  propertyAds: [],
  selectedPropertyAd: null,
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,
  states: [],
  cities: [],
  neighborhoods: [],
  isLoadingStates: false,
  isLoadingCities: false,
  isLoadingNeighborhoods: false,
};

// Async thunks
export const createPropertyAd = createAsyncThunk(
  'propertyAds/createPropertyAd',
  async (data: CreatePropertyAdRequest, { rejectWithValue }) => {
    try {
      const propertyAd = await propertyAdsApi.createPropertyAd(data);
      return propertyAd;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ایجاد آگهی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updatePropertyAd = createAsyncThunk(
  'propertyAds/updatePropertyAd',
  async ({ id, data }: { id: string; data: UpdatePropertyAdRequest }, { rejectWithValue }) => {
    try {
      const propertyAd = await propertyAdsApi.updatePropertyAd(id, data);
      return propertyAd;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌روزرسانی آگهی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const deletePropertyAd = createAsyncThunk(
  'propertyAds/deletePropertyAd',
  async (id: string, { rejectWithValue }) => {
    try {
      await propertyAdsApi.deletePropertyAd(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در حذف آگهی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchPropertyAdById = createAsyncThunk(
  'propertyAds/fetchPropertyAdById',
  async (id: string, { rejectWithValue }) => {
    try {
      const propertyAd = await propertyAdsApi.getPropertyAdById(id);
      return propertyAd;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت اطلاعات آگهی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const searchPropertyAds = createAsyncThunk(
  'propertyAds/searchPropertyAds',
  async (filters: PropertyAdFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await propertyAdsApi.searchPropertyAds(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در جستجوی آگهی‌ها');
      return rejectWithValue(errorMsg);
    }
  }
);

export const findMyAds = createAsyncThunk(
  'propertyAds/findMyAds',
  async (filters: PropertyAdFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await propertyAdsApi.findMyAds(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت آگهی‌های من');
      return rejectWithValue(errorMsg);
    }
  }
);

export const uploadImages = createAsyncThunk(
  'propertyAds/uploadImages',
  async ({ id, images }: { id: string; images: File[] }, { rejectWithValue }) => {
    try {
      const uploadedImages = await propertyAdsApi.uploadImages(id, images);
      return { id, images: uploadedImages };
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در آپلود تصاویر');
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteImage = createAsyncThunk(
  'propertyAds/deleteImage',
  async ({ id, imageId }: { id: string; imageId: string }, { rejectWithValue }) => {
    try {
      await propertyAdsApi.deleteImage(id, imageId);
      return { id, imageId };
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در حذف تصویر');
      return rejectWithValue(errorMsg);
    }
  }
);

// Location Management - States
export const fetchAllStates = createAsyncThunk(
  'propertyAds/fetchAllStates',
  async (_, { rejectWithValue }) => {
    try {
      const states = await propertyAdsApi.getAllStates();
      return states;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت لیست استان‌ها');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchStateById = createAsyncThunk(
  'propertyAds/fetchStateById',
  async (stateId: string, { rejectWithValue }) => {
    try {
      const state = await propertyAdsApi.getStateById(stateId);
      return state;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت اطلاعات استان');
      return rejectWithValue(errorMsg);
    }
  }
);

export const createState = createAsyncThunk(
  'propertyAds/createState',
  async (data: CreateStateRequest, { rejectWithValue }) => {
    try {
      const state = await propertyAdsApi.createState(data);
      return state;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ایجاد استان');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateState = createAsyncThunk(
  'propertyAds/updateState',
  async ({ stateId, data }: { stateId: string; data: UpdateStateRequest }, { rejectWithValue }) => {
    try {
      const state = await propertyAdsApi.updateState(stateId, data);
      return state;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌روزرسانی استان');
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteState = createAsyncThunk(
  'propertyAds/deleteState',
  async (stateId: string, { rejectWithValue }) => {
    try {
      await propertyAdsApi.deleteState(stateId);
      return stateId;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در حذف استان');
      return rejectWithValue(errorMsg);
    }
  }
);

// Location Management - Cities
export const fetchAllCities = createAsyncThunk(
  'propertyAds/fetchAllCities',
  async (_, { rejectWithValue }) => {
    try {
      const cities = await propertyAdsApi.getAllCities();
      return cities;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت لیست شهرها');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchCityById = createAsyncThunk(
  'propertyAds/fetchCityById',
  async (cityId: string, { rejectWithValue }) => {
    try {
      const city = await propertyAdsApi.getCityById(cityId);
      return city;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت اطلاعات شهر');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchNeighborhoodsByCity = createAsyncThunk(
  'propertyAds/fetchNeighborhoodsByCity',
  async (cityId: string, { rejectWithValue }) => {
    try {
      const neighborhoods = await propertyAdsApi.getNeighborhoodsByCity(cityId);
      return { cityId, neighborhoods };
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت لیست محله‌ها');
      return rejectWithValue(errorMsg);
    }
  }
);

export const createCity = createAsyncThunk(
  'propertyAds/createCity',
  async (data: CreateCityRequest, { rejectWithValue }) => {
    try {
      const city = await propertyAdsApi.createCity(data);
      return city;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ایجاد شهر');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateCity = createAsyncThunk(
  'propertyAds/updateCity',
  async ({ cityId, data }: { cityId: string; data: UpdateCityRequest }, { rejectWithValue }) => {
    try {
      const city = await propertyAdsApi.updateCity(cityId, data);
      return city;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌روزرسانی شهر');
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteCity = createAsyncThunk(
  'propertyAds/deleteCity',
  async (cityId: string, { rejectWithValue }) => {
    try {
      await propertyAdsApi.deleteCity(cityId);
      return cityId;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در حذف شهر');
      return rejectWithValue(errorMsg);
    }
  }
);

// Location Management - Neighborhoods
export const fetchNeighborhoodById = createAsyncThunk(
  'propertyAds/fetchNeighborhoodById',
  async (neighborhoodId: string, { rejectWithValue }) => {
    try {
      const neighborhood = await propertyAdsApi.getNeighborhoodById(neighborhoodId);
      return neighborhood;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت اطلاعات محله');
      return rejectWithValue(errorMsg);
    }
  }
);

export const createNeighborhood = createAsyncThunk(
  'propertyAds/createNeighborhood',
  async (data: CreateNeighborhoodRequest, { rejectWithValue }) => {
    try {
      const neighborhood = await propertyAdsApi.createNeighborhood(data);
      return neighborhood;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ایجاد محله');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateNeighborhood = createAsyncThunk(
  'propertyAds/updateNeighborhood',
  async ({ neighborhoodId, data }: { neighborhoodId: string; data: UpdateNeighborhoodRequest }, { rejectWithValue }) => {
    try {
      const neighborhood = await propertyAdsApi.updateNeighborhood(neighborhoodId, data);
      return neighborhood;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌روزرسانی محله');
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteNeighborhood = createAsyncThunk(
  'propertyAds/deleteNeighborhood',
  async (neighborhoodId: string, { rejectWithValue }) => {
    try {
      await propertyAdsApi.deleteNeighborhood(neighborhoodId);
      return neighborhoodId;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در حذف محله');
      return rejectWithValue(errorMsg);
    }
  }
);

const propertyAdsSlice = createSlice({
  name: 'propertyAds',
  initialState,
  reducers: {
    setSelectedPropertyAd: (state, action: PayloadAction<PropertyAd | null>) => {
      state.selectedPropertyAd = action.payload;
    },
    setFilters: (state, action: PayloadAction<PropertyAdFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearNeighborhoods: (state) => {
      state.neighborhoods = [];
    },
  },
  extraReducers: (builder) => {
    // Create Property Ad
    builder
      .addCase(createPropertyAd.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPropertyAd.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure images always returns an array
        const propertyAd = {
          ...action.payload,
          images: action.payload.images || []
        };
        state.propertyAds.push(propertyAd);
        state.selectedPropertyAd = propertyAd;
        state.error = null;
      })
      .addCase(createPropertyAd.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Property Ad
    builder
      .addCase(updatePropertyAd.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePropertyAd.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure images always returns an array
        const propertyAd = {
          ...action.payload,
          images: action.payload.images || []
        };
        const index = state.propertyAds.findIndex((ad) => ad.id === action.payload.id);
        if (index !== -1) {
          state.propertyAds[index] = propertyAd;
        }
        if (state.selectedPropertyAd?.id === action.payload.id) {
          state.selectedPropertyAd = propertyAd;
        }
        state.error = null;
      })
      .addCase(updatePropertyAd.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Property Ad
    builder
      .addCase(deletePropertyAd.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePropertyAd.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyAds = state.propertyAds.filter((ad) => ad.id !== action.payload);
        if (state.selectedPropertyAd?.id === action.payload) {
          state.selectedPropertyAd = null;
        }
        state.error = null;
      })
      .addCase(deletePropertyAd.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Property Ad By ID
    builder
      .addCase(fetchPropertyAdById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyAdById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure images always returns an array
        state.selectedPropertyAd = {
          ...action.payload,
          images: action.payload.images || []
        };
        state.error = null;
      })
      .addCase(fetchPropertyAdById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Property Ads
    builder
      .addCase(searchPropertyAds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchPropertyAds.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure all ads have images as an array (defaults to [] if missing)
        state.propertyAds = (action.payload.data || []).map(ad => ({
          ...ad,
          images: ad.images || []
        }));
        state.pagination = action.payload.meta;
        state.error = null;
      })
      .addCase(searchPropertyAds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Find My Ads
    builder
      .addCase(findMyAds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(findMyAds.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure all ads have images as an array (defaults to [] if missing)
        state.propertyAds = (action.payload.data || []).map(ad => ({
          ...ad,
          images: ad.images || []
        }));
        state.pagination = action.payload.meta;
        state.error = null;
      })
      .addCase(findMyAds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload Images
    builder
      .addCase(uploadImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadImages.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selectedPropertyAd?.id === action.payload.id) {
          if (!state.selectedPropertyAd.images) {
            state.selectedPropertyAd.images = [];
          }
          state.selectedPropertyAd.images = [...state.selectedPropertyAd.images, ...action.payload.images];
        }
        const adIndex = state.propertyAds.findIndex((ad) => ad.id === action.payload.id);
        if (adIndex !== -1) {
          if (!state.propertyAds[adIndex].images) {
            state.propertyAds[adIndex].images = [];
          }
          state.propertyAds[adIndex].images = [...state.propertyAds[adIndex].images, ...action.payload.images];
        }
        state.error = null;
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Image
    builder
      .addCase(deleteImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selectedPropertyAd?.id === action.payload.id) {
          state.selectedPropertyAd.images = state.selectedPropertyAd.images?.filter(
            (img) => img.id !== action.payload.imageId
          );
        }
        const adIndex = state.propertyAds.findIndex((ad) => ad.id === action.payload.id);
        if (adIndex !== -1 && state.propertyAds[adIndex].images) {
          state.propertyAds[adIndex].images = state.propertyAds[adIndex].images?.filter(
            (img) => img.id !== action.payload.imageId
          );
        }
        state.error = null;
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch All States
    builder
      .addCase(fetchAllStates.pending, (state) => {
        state.isLoadingStates = true;
        state.error = null;
      })
      .addCase(fetchAllStates.fulfilled, (state, action) => {
        state.isLoadingStates = false;
        state.states = action.payload;
        state.error = null;
      })
      .addCase(fetchAllStates.rejected, (state, action) => {
        state.isLoadingStates = false;
        state.error = action.payload as string;
      });

    // Create State
    builder
      .addCase(createState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.states.push(action.payload);
        state.error = null;
      })
      .addCase(createState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update State
    builder
      .addCase(updateState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateState.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.states.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.states[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete State
    builder
      .addCase(deleteState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.states = state.states.filter((s) => s.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch All Cities
    builder
      .addCase(fetchAllCities.pending, (state) => {
        state.isLoadingCities = true;
        state.error = null;
      })
      .addCase(fetchAllCities.fulfilled, (state, action) => {
        state.isLoadingCities = false;
        state.cities = action.payload;
        state.error = null;
      })
      .addCase(fetchAllCities.rejected, (state, action) => {
        state.isLoadingCities = false;
        state.error = action.payload as string;
      });

    // Fetch Neighborhoods By City
    builder
      .addCase(fetchNeighborhoodsByCity.pending, (state) => {
        state.isLoadingNeighborhoods = true;
        state.error = null;
      })
      .addCase(fetchNeighborhoodsByCity.fulfilled, (state, action) => {
        state.isLoadingNeighborhoods = false;
        state.neighborhoods = action.payload.neighborhoods;
        state.error = null;
      })
      .addCase(fetchNeighborhoodsByCity.rejected, (state, action) => {
        state.isLoadingNeighborhoods = false;
        state.error = action.payload as string;
      });

    // Create City
    builder
      .addCase(createCity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cities.push(action.payload);
        // Update state's cities array if state exists
        const stateIndex = state.states.findIndex((s) => s.id === action.payload.stateId);
        if (stateIndex !== -1 && state.states[stateIndex].cities) {
          state.states[stateIndex].cities!.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createCity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update City
    builder
      .addCase(updateCity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cities.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete City
    builder
      .addCase(deleteCity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cities = state.cities.filter((c) => c.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Neighborhood
    builder
      .addCase(createNeighborhood.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNeighborhood.fulfilled, (state, action) => {
        state.isLoading = false;
        state.neighborhoods.push(action.payload);
        // Update city's neighborhoods array if city exists
        const cityIndex = state.cities.findIndex((c) => c.id === action.payload.cityId);
        if (cityIndex !== -1 && state.cities[cityIndex].neighborhoods) {
          state.cities[cityIndex].neighborhoods!.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createNeighborhood.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Neighborhood
    builder
      .addCase(updateNeighborhood.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNeighborhood.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.neighborhoods.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.neighborhoods[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateNeighborhood.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Neighborhood
    builder
      .addCase(deleteNeighborhood.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNeighborhood.fulfilled, (state, action) => {
        state.isLoading = false;
        state.neighborhoods = state.neighborhoods.filter((n) => n.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteNeighborhood.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedPropertyAd, setFilters, clearError, clearNeighborhoods } = propertyAdsSlice.actions;
export default propertyAdsSlice.reducer;
