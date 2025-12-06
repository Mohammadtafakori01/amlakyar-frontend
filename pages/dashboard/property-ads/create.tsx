import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiArrowRight, FiSave, FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { usePropertyAds } from '../../../src/domains/property-ads/hooks/usePropertyAds';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { createPropertyAd as createPropertyAdThunk, uploadImages as uploadImagesThunk } from '../../../src/domains/property-ads/store/propertyAdsSlice';
import {
  AdType,
  AdStatus,
  AdvertiserType,
  Orientation,
  CreatePropertyAdRequest,
} from '../../../src/domains/property-ads/types';
import { UserRole } from '../../../src/shared/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';

const adTypeLabels: Record<AdType, string> = {
  [AdType.RESIDENTIAL_SALE]: 'فروش مسکونی',
  [AdType.RESIDENTIAL_RENT]: 'اجاره مسکونی',
  [AdType.COMMERCIAL_SALE]: 'فروش اداری و تجاری',
  [AdType.COMMERCIAL_RENT]: 'اجاره اداری و تجاری',
  [AdType.SHORT_TERM_RENT]: 'اجاره کوتاه مدت',
  [AdType.CONSTRUCTION_PROJECT]: 'پروژه‌های ساختمانی',
};

const orientationLabels: Record<Orientation, string> = {
  [Orientation.NORTH]: 'شمالی',
  [Orientation.SOUTH]: 'جنوبی',
  [Orientation.EAST]: 'شرقی',
  [Orientation.WEST]: 'غربی',
};

export default function CreatePropertyAdPage() {
  const router = useRouter();
  const {
    createPropertyAd,
    uploadImages,
    isLoading,
    error,
    states,
    cities,
    neighborhoods,
    isLoadingStates,
    isLoadingCities,
    isLoadingNeighborhoods,
    fetchAllStates,
    fetchAllCities,
    fetchNeighborhoodsByCity,
    clearError,
    selectedPropertyAd,
  } = usePropertyAds();
  const { user: currentUser } = useAuth();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<Partial<CreatePropertyAdRequest>>({
    adType: AdType.RESIDENTIAL_SALE,
    subcategory: '',
    title: '',
    description: '',
    stateId: '',
    cityId: '',
    neighborhoodId: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    areaSqm: undefined,
    rooms: undefined,
    buildingAge: undefined,
    floor: '',
    totalFloors: undefined,
    unitsPerFloor: undefined,
    orientation: undefined,
    totalPrice: undefined,
    depositValue: undefined,
    minDepositValue: undefined,
    maxDepositValue: undefined,
    monthlyRent: undefined,
    isPriceConvertible: false,
    hasElevator: undefined,
    hasParking: undefined,
    parkingCount: undefined,
    hasStorage: undefined,
    storageArea: undefined,
    hasBalcony: undefined,
    heatingCoolingSystem: '',
    otherFeatures: [],
    deedType: '',
    status: AdStatus.DRAFT,
    advertiserType: AdvertiserType.PERSONAL,
    contactNumber: '',
    virtualTourUrl: null,
  });

  const [currentFeature, setCurrentFeature] = useState('');

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    fetchAllStates();
    fetchAllCities();
  }, [fetchAllStates, fetchAllCities]);

  useEffect(() => {
    if (formData.cityId) {
      fetchNeighborhoodsByCity(formData.cityId);
    }
  }, [formData.cityId, fetchNeighborhoodsByCity]);

  // Filter cities based on selected state
  const filteredCities = formData.stateId
    ? cities.filter((city) => city.stateId === formData.stateId)
    : cities;

  const isSaleAd = formData.adType === AdType.RESIDENTIAL_SALE || 
                   formData.adType === AdType.COMMERCIAL_SALE || 
                   formData.adType === AdType.CONSTRUCTION_PROJECT;
  const isRentAd = formData.adType === AdType.RESIDENTIAL_RENT || 
                   formData.adType === AdType.COMMERCIAL_RENT || 
                   formData.adType === AdType.SHORT_TERM_RENT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.stateId || !formData.cityId || !formData.neighborhoodId || !formData.areaSqm || !formData.contactNumber) {
      setSnackbar({ open: true, message: 'لطفا فیلدهای الزامی را پر کنید', severity: 'error' });
      return;
    }

    try {
      const result = await createPropertyAd(formData as CreatePropertyAdRequest);
      
      // Check if the result is a fulfilled action
      if (createPropertyAdThunk.fulfilled.match(result)) {
        const createdAd = result.payload;
        
        // Upload images if any
        if (imageFiles.length > 0 && createdAd?.id) {
          try {
            console.log('Uploading images:', imageFiles.length, 'files for ad:', createdAd.id);
            const uploadResult = await uploadImages(createdAd.id, imageFiles);
            // Check if upload was successful
            if (uploadImagesThunk.fulfilled.match(uploadResult)) {
              console.log('Images uploaded successfully:', uploadResult.payload);
              setSnackbar({ open: true, message: 'آگهی و تصاویر با موفقیت ایجاد شد', severity: 'success' });
            } else {
              const errorMsg = uploadResult.payload && typeof uploadResult.payload === 'string' 
                ? uploadResult.payload 
                : 'خطا در آپلود تصاویر';
              console.error('Image upload failed:', uploadResult);
              setSnackbar({ open: true, message: `آگهی ایجاد شد ولی ${errorMsg}`, severity: 'warning' });
            }
          } catch (imgError: any) {
            console.error('Error uploading images:', imgError);
            setSnackbar({ open: true, message: 'آگهی ایجاد شد ولی خطا در آپلود تصاویر: ' + (imgError.message || 'خطای نامشخص'), severity: 'warning' });
          }
        } else {
          if (imageFiles.length === 0) {
            console.log('No images to upload');
          }
          setSnackbar({ open: true, message: 'آگهی با موفقیت ایجاد شد', severity: 'success' });
        }
        
        setTimeout(() => {
          if (createdAd?.id) {
            router.push(`/dashboard/property-ads/${createdAd.id}`);
          } else {
            router.push('/dashboard/property-ads');
          }
        }, 1500);
      } else {
        // Handle rejected action
        const errorMsg = result.payload && typeof result.payload === 'string' ? result.payload : 'خطا در ایجاد آگهی';
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در ایجاد آگهی';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + imageFiles.length > 10) {
        setSnackbar({ open: true, message: 'حداکثر 10 تصویر می‌توانید آپلود کنید', severity: 'error' });
        return;
      }
      setImageFiles([...imageFiles, ...files]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (currentFeature.trim() && !formData.otherFeatures?.includes(currentFeature.trim())) {
      setFormData({
        ...formData,
        otherFeatures: [...(formData.otherFeatures || []), currentFeature.trim()],
      });
      setCurrentFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData({
      ...formData,
      otherFeatures: formData.otherFeatures?.filter((f) => f !== feature) || [],
    });
  };

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">ایجاد آگهی جدید</h1>
              <button
                onClick={() => router.push('/dashboard/property-ads')}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
              >
                <FiArrowRight />
                بازگشت
              </button>
            </div>

            <ErrorDisplay error={error} />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">اطلاعات پایه</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      نوع آگهی <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.adType}
                      onChange={(e) => setFormData({ ...formData, adType: e.target.value as AdType })}
                      required
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      {Object.entries(adTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      زیردسته <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      required
                      placeholder="مثال: آپارتمان، خانه، ویلا"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      عنوان <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="مثال: آپارتمان 120 متری در منطقه 1"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      توضیحات <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      placeholder="توضیحات کامل ملک"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">موقعیت</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      استان <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.stateId}
                      onChange={(e) => setFormData({ ...formData, stateId: e.target.value, cityId: '', neighborhoodId: '' })}
                      required
                      disabled={isLoadingStates}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
                    >
                      <option value="">انتخاب استان</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      شهر <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.cityId}
                      onChange={(e) => setFormData({ ...formData, cityId: e.target.value, neighborhoodId: '' })}
                      required
                      disabled={!formData.stateId || isLoadingCities}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
                    >
                      <option value="">انتخاب شهر</option>
                      {filteredCities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      محله <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.neighborhoodId}
                      onChange={(e) => setFormData({ ...formData, neighborhoodId: e.target.value })}
                      required
                      disabled={!formData.cityId || isLoadingNeighborhoods}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
                    >
                      <option value="">انتخاب محله</option>
                      {neighborhoods.map((neighborhood) => (
                        <option key={neighborhood.id} value={neighborhood.id}>
                          {neighborhood.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">آدرس</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="آدرس کامل ملک"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">عرض جغرافیایی</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="35.6892"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">طول جغرافیایی</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="51.3890"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">جزئیات ملک</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      متراژ (متر مربع) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.areaSqm || ''}
                      onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value ? parseInt(e.target.value) : undefined })}
                      required
                      min="1"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد اتاق</label>
                    <input
                      type="number"
                      value={formData.rooms || ''}
                      onChange={(e) => setFormData({ ...formData, rooms: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="0"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">سن بنا (سال)</label>
                    <input
                      type="number"
                      value={formData.buildingAge || ''}
                      onChange={(e) => setFormData({ ...formData, buildingAge: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="0"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">طبقه</label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="مثال: اول، دوم"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد طبقات</label>
                    <input
                      type="number"
                      value={formData.totalFloors || ''}
                      onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="1"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">واحد در هر طبقه</label>
                    <input
                      type="number"
                      value={formData.unitsPerFloor || ''}
                      onChange={(e) => setFormData({ ...formData, unitsPerFloor: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="1"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">جهت</label>
                    <select
                      value={formData.orientation || ''}
                      onChange={(e) => setFormData({ ...formData, orientation: (e.target.value as Orientation) || undefined })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">انتخاب کنید</option>
                      {Object.entries(orientationLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">قیمت</h2>
                {isSaleAd && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">قیمت کل (ریال)</label>
                      <input
                        type="number"
                        value={formData.totalPrice || ''}
                        onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                )}
                {isRentAd && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {!formData.isPriceConvertible ? (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-600">رهن (ریال)</label>
                          <input
                            type="number"
                            value={formData.depositValue || ''}
                            onChange={(e) => setFormData({ ...formData, depositValue: e.target.value ? parseInt(e.target.value) : undefined })}
                            min="0"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-600">اجاره ماهانه (ریال)</label>
                          <input
                            type="number"
                            value={formData.monthlyRent || ''}
                            onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value ? parseInt(e.target.value) : undefined })}
                            min="0"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-600">حداقل رهن (ریال)</label>
                          <input
                            type="number"
                            value={formData.minDepositValue || ''}
                            onChange={(e) => setFormData({ ...formData, minDepositValue: e.target.value ? parseInt(e.target.value) : undefined })}
                            min="0"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-600">حداکثر رهن (ریال)</label>
                          <input
                            type="number"
                            value={formData.maxDepositValue || ''}
                            onChange={(e) => setFormData({ ...formData, maxDepositValue: e.target.value ? parseInt(e.target.value) : undefined })}
                            min="0"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-600">رهن پیش‌فرض (ریال)</label>
                          <input
                            type="number"
                            value={formData.depositValue || ''}
                            onChange={(e) => setFormData({ ...formData, depositValue: e.target.value ? parseInt(e.target.value) : undefined })}
                            min="0"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            placeholder="مقدار پیش‌فرض رهن"
                          />
                          <p className="mt-1 text-xs text-gray-500">مقدار رهن که به صورت پیش‌فرض نمایش داده می‌شود</p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-600">اجاره ماهانه پیش‌فرض (ریال)</label>
                          <input
                            type="number"
                            value={formData.monthlyRent || ''}
                            onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value ? parseInt(e.target.value) : undefined })}
                            min="0"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            placeholder="اجاره وقتی رهن در حداکثر است"
                          />
                          <p className="mt-1 text-xs text-gray-500">اجاره ماهانه وقتی رهن در حداکثر مقدار است</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPriceConvertible}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          // When enabling convertible: keep depositValue and monthlyRent
                          setFormData({ 
                            ...formData, 
                            isPriceConvertible: true
                          });
                        } else {
                          // When disabling convertible: clear minDepositValue and maxDepositValue
                          setFormData({ 
                            ...formData, 
                            isPriceConvertible: false,
                            minDepositValue: undefined,
                            maxDepositValue: undefined
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-600">قیمت قابل تبدیل</span>
                  </label>
                  {formData.isPriceConvertible && (
                    <p className="mt-2 text-xs text-gray-500">
                      نرخ تبدیل: هر ۱۰۰ میلیون رهن = ۳ میلیون اجاره ماهانه
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">امکانات</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasElevator || false}
                        onChange={(e) => setFormData({ ...formData, hasElevator: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-600">آسانسور</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasParking || false}
                        onChange={(e) => {
                          setFormData({ ...formData, hasParking: e.target.checked });
                          if (!e.target.checked) {
                            setFormData((prev) => ({ ...prev, parkingCount: undefined }));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-600">پارکینگ</span>
                    </label>
                    {formData.hasParking && (
                      <input
                        type="number"
                        value={formData.parkingCount || ''}
                        onChange={(e) => setFormData({ ...formData, parkingCount: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="1"
                        placeholder="تعداد پارکینگ"
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasStorage || false}
                        onChange={(e) => {
                          setFormData({ ...formData, hasStorage: e.target.checked });
                          if (!e.target.checked) {
                            setFormData((prev) => ({ ...prev, storageArea: undefined }));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-600">انباری</span>
                    </label>
                    {formData.hasStorage && (
                      <input
                        type="number"
                        value={formData.storageArea || ''}
                        onChange={(e) => setFormData({ ...formData, storageArea: e.target.value ? parseFloat(e.target.value) : undefined })}
                        min="0"
                        step="0.1"
                        placeholder="متراژ انباری"
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasBalcony || false}
                        onChange={(e) => setFormData({ ...formData, hasBalcony: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-600">بالکن</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">سیستم گرمایش و سرمایش</label>
                    <input
                      type="text"
                      value={formData.heatingCoolingSystem}
                      onChange={(e) => setFormData({ ...formData, heatingCoolingSystem: e.target.value })}
                      placeholder="مثال: پکیج، کولر گازی"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نوع سند</label>
                    <input
                      type="text"
                      value={formData.deedType}
                      onChange={(e) => setFormData({ ...formData, deedType: e.target.value })}
                      placeholder="مثال: تک برگ"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">سایر امکانات</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                        placeholder="مثال: استخر، سونا"
                        className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                      >
                        <FiPlus />
                      </button>
                    </div>
                    {formData.otherFeatures && formData.otherFeatures.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.otherFeatures.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(feature)}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact and Status */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">اطلاعات تماس و وضعیت</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      شماره تماس <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      required
                      pattern="09[0-9]{9}"
                      placeholder="09123456789"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نوع آگهی‌دهنده</label>
                    <select
                      value={formData.advertiserType}
                      onChange={(e) => setFormData({ ...formData, advertiserType: e.target.value as AdvertiserType })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value={AdvertiserType.PERSONAL}>شخصی</option>
                      <option value={AdvertiserType.ESTATE_AGENT}>مشاور املاک</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">وضعیت</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AdStatus })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value={AdStatus.DRAFT}>پیش‌نویس</option>
                      <option value={AdStatus.PUBLISHED}>منتشر شده</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">لینک تور مجازی</label>
                    <input
                      type="url"
                      value={formData.virtualTourUrl || ''}
                      onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value || null })}
                      placeholder="https://example.com/tour"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">تصاویر</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-600">
                      آپلود تصاویر (حداکثر 10 تصویر، هر تصویر حداکثر 5 مگابایت)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="h-32 w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute left-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loading /> : <FiSave />}
                  ذخیره
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/property-ads')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  <FiArrowRight />
                  انصراف
                </button>
              </div>
            </form>

            {snackbar.open && (
              <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4">
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm shadow-lg ${
                    snackbar.severity === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : snackbar.severity === 'warning'
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {snackbar.message}
                </div>
              </div>
            )}
          </div>
        </DashboardLayout>
      </RoleGuard>
    </PrivateRoute>
  );
}
