import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiArrowRight, FiEdit2, FiTrash2, FiImage, FiMapPin, FiPhone, FiHome, FiDollarSign } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import { usePropertyAds } from '../../../src/domains/property-ads/hooks/usePropertyAds';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { AdType, AdStatus } from '../../../src/domains/property-ads/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import DepositRentConverter from '../../../src/shared/components/property-ads/DepositRentConverter';

const adTypeLabels: Record<AdType, string> = {
  [AdType.RESIDENTIAL_SALE]: 'فروش مسکونی',
  [AdType.RESIDENTIAL_RENT]: 'اجاره مسکونی',
  [AdType.COMMERCIAL_SALE]: 'فروش اداری و تجاری',
  [AdType.COMMERCIAL_RENT]: 'اجاره اداری و تجاری',
  [AdType.SHORT_TERM_RENT]: 'اجاره کوتاه مدت',
  [AdType.CONSTRUCTION_PROJECT]: 'پروژه‌های ساختمانی',
};

const statusLabels: Record<AdStatus, string> = {
  [AdStatus.DRAFT]: 'پیش‌نویس',
  [AdStatus.PUBLISHED]: 'منتشر شده',
  [AdStatus.ARCHIVED]: 'بایگانی شده',
};

const statusColors: Record<AdStatus, string> = {
  [AdStatus.DRAFT]: 'border-amber-200 bg-amber-50 text-amber-700',
  [AdStatus.PUBLISHED]: 'border-green-200 bg-green-50 text-green-700',
  [AdStatus.ARCHIVED]: 'border-gray-200 bg-gray-50 text-gray-500',
};

export default function PropertyAdDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const {
    selectedPropertyAd,
    isLoading,
    error,
    fetchPropertyAdById,
    deletePropertyAd,
    deleteImage,
  } = usePropertyAds();
  const { user: currentUser } = useAuth();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPropertyAdById(id);
    }
  }, [id, fetchPropertyAdById]);

  const handleDelete = async () => {
    if (!selectedPropertyAd || !window.confirm('آیا از حذف این آگهی اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
      return;
    }

    try {
      await deletePropertyAd(selectedPropertyAd.id);
      setSnackbar({ open: true, message: 'آگهی با موفقیت حذف شد', severity: 'success' });
      setTimeout(() => {
        router.push('/dashboard/property-ads');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در حذف آگهی';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!selectedPropertyAd || !window.confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
      return;
    }

    try {
      await deleteImage(selectedPropertyAd.id, imageId);
      setSnackbar({ open: true, message: 'تصویر با موفقیت حذف شد', severity: 'success' });
      // Refresh the ad
      fetchPropertyAdById(selectedPropertyAd.id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در حذف تصویر';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    const baseUrl = process.env.NODE_ENV === 'development'
      ? '/api'
      : (process.env.NEXT_PUBLIC_API_URL || 'https://api.amlakyarr.com');
    return `${baseUrl}/${imagePath}`;
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  if (isLoading) {
    return (
      <PrivateRoute>
        <DashboardLayout>
          <Loading />
        </DashboardLayout>
      </PrivateRoute>
    );
  }

  if (!selectedPropertyAd) {
    return (
      <PrivateRoute>
        <DashboardLayout>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm text-gray-500">آگهی یافت نشد.</p>
            <button
              onClick={() => router.push('/dashboard/property-ads')}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <FiArrowRight />
              بازگشت
            </button>
          </div>
        </DashboardLayout>
      </PrivateRoute>
    );
  }

  const ad = selectedPropertyAd;
  const isSaleAd = ad.adType === AdType.RESIDENTIAL_SALE || 
                   ad.adType === AdType.COMMERCIAL_SALE || 
                   ad.adType === AdType.CONSTRUCTION_PROJECT;
  const isRentAd = ad.adType === AdType.RESIDENTIAL_RENT || 
                   ad.adType === AdType.COMMERCIAL_RENT || 
                   ad.adType === AdType.SHORT_TERM_RENT;

  return (
    <PrivateRoute>
      <DashboardLayout>
        <div className="space-y-6 text-right">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">جزئیات آگهی</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/dashboard/property-ads/${ad.id}/edit`)}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
              >
                <FiEdit2 />
                ویرایش
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
              >
                <FiTrash2 />
                حذف
              </button>
                <button
                  onClick={() => router.push('/dashboard/property-ads')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                >
                  <FiArrowRight />
                  بازگشت
                </button>
              </div>
            </div>

            <ErrorDisplay error={error} />

            {/* Images */}
            {ad.images && ad.images.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">تصاویر</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {ad.images.map((image) => {
                    const imageUrl = getImageUrl(image.filePath);
                    return (
                      <div key={image.id} className="relative group">
                        {image.isPrimary && (
                          <span className="absolute top-2 left-2 z-10 rounded-full bg-primary-600 px-2 py-1 text-xs font-semibold text-white">
                            اصلی
                          </span>
                        )}
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={ad.title}
                            className="h-48 w-full rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-100">
                            <FiImage className="text-4xl text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="absolute bottom-2 left-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{ad.title}</h2>
                <span className={`ml-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[ad.status]}`}>
                  {statusLabels[ad.status]}
                </span>
              </div>
              <p className="mb-4 text-gray-700">{ad.description}</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FiHome className="text-primary-600" />
                  <span className="font-semibold">نوع آگهی:</span>
                  <span>{adTypeLabels[ad.adType]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FiHome className="text-primary-600" />
                  <span className="font-semibold">زیردسته:</span>
                  <span>{ad.subcategory}</span>
                </div>
                {ad.state && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiMapPin className="text-primary-600" />
                    <span className="font-semibold">استان:</span>
                    <span>{ad.state.name}</span>
                  </div>
                )}
                {ad.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiMapPin className="text-primary-600" />
                    <span className="font-semibold">شهر:</span>
                    <span>{ad.city.name}</span>
                    {ad.neighborhood && <span> - {ad.neighborhood.name}</span>}
                  </div>
                )}
                {ad.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiMapPin className="text-primary-600" />
                    <span className="font-semibold">آدرس:</span>
                    <span>{ad.address}</span>
                  </div>
                )}
                {ad.contactNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiPhone className="text-primary-600" />
                    <span className="font-semibold">شماره تماس:</span>
                    <span>{ad.contactNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">جزئیات ملک</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <span className="text-sm font-semibold text-gray-600">متراژ:</span>
                  <span className="mr-2 text-gray-700">{ad.areaSqm} متر مربع</span>
                </div>
                {ad.rooms !== undefined && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">تعداد اتاق:</span>
                    <span className="mr-2 text-gray-700">{ad.rooms}</span>
                  </div>
                )}
                {ad.buildingAge !== undefined && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">سن بنا:</span>
                    <span className="mr-2 text-gray-700">{ad.buildingAge} سال</span>
                  </div>
                )}
                {ad.floor && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">طبقه:</span>
                    <span className="mr-2 text-gray-700">{ad.floor}</span>
                  </div>
                )}
                {ad.totalFloors !== undefined && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">تعداد طبقات:</span>
                    <span className="mr-2 text-gray-700">{ad.totalFloors}</span>
                  </div>
                )}
                {ad.unitsPerFloor !== undefined && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">واحد در هر طبقه:</span>
                    <span className="mr-2 text-gray-700">{ad.unitsPerFloor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                <FiDollarSign />
                قیمت
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {isSaleAd && ad.totalPrice && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">قیمت کل:</span>
                    <span className="mr-2 text-lg font-bold text-primary-600">{formatPrice(ad.totalPrice)} ریال</span>
                  </div>
                )}
                {isSaleAd && ad.pricePerSqm && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">قیمت هر متر:</span>
                    <span className="mr-2 text-lg font-bold text-primary-600">{formatPrice(ad.pricePerSqm)} ریال</span>
                  </div>
                )}
                {isRentAd && !ad.isPriceConvertible && ad.depositValue && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">رهن:</span>
                    <span className="mr-2 text-lg font-bold text-primary-600">{formatPrice(ad.depositValue)} ریال</span>
                  </div>
                )}
                {isRentAd && !ad.isPriceConvertible && ad.monthlyRent && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">اجاره ماهانه:</span>
                    <span className="mr-2 text-lg font-bold text-primary-600">{formatPrice(ad.monthlyRent)} ریال</span>
                  </div>
                )}
                {isRentAd && ad.isPriceConvertible && ad.minDepositValue && ad.maxDepositValue && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-gray-600">محدوده رهن:</span>
                    <span className="mr-2 text-lg font-bold text-primary-600">
                      {formatPrice(ad.minDepositValue)} - {formatPrice(ad.maxDepositValue)} ریال
                    </span>
                    <p className="mt-1 text-sm font-medium text-green-600">قیمت قابل تبدیل است</p>
                  </div>
                )}
              </div>
              
              {/* Deposit Range Slider for Convertible Price */}
              {ad.isPriceConvertible && 
               isRentAd && 
               ad.minDepositValue && 
               ad.maxDepositValue && 
               typeof ad.minDepositValue === 'number' && 
               typeof ad.maxDepositValue === 'number' && 
               ad.minDepositValue > 0 && 
               ad.maxDepositValue > 0 && (
                <div className="mt-6">
                  <DepositRentConverter
                    minDeposit={ad.minDepositValue}
                    maxDeposit={ad.maxDepositValue}
                    monthlyRent={ad.monthlyRent}
                    initialDeposit={ad.depositValue}
                    isPriceConvertible={ad.isPriceConvertible}
                  />
                </div>
              )}
            </div>

            {/* Features */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">امکانات</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {ad.hasElevator !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ad.hasElevator ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">آسانسور: {ad.hasElevator ? 'دارد' : 'ندارد'}</span>
                  </div>
                )}
                {ad.hasParking !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ad.hasParking ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">
                      پارکینگ: {ad.hasParking ? `دارد ${ad.parkingCount ? `(${ad.parkingCount} عدد)` : ''}` : 'ندارد'}
                    </span>
                  </div>
                )}
                {ad.hasStorage !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ad.hasStorage ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">
                      انباری: {ad.hasStorage ? (ad.storageArea ? `${ad.storageArea} متر` : 'دارد') : 'ندارد'}
                    </span>
                  </div>
                )}
                {ad.hasBalcony !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ad.hasBalcony ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">بالکن: {ad.hasBalcony ? 'دارد' : 'ندارد'}</span>
                  </div>
                )}
                {ad.heatingCoolingSystem && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">سیستم گرمایش و سرمایش:</span>
                    <span className="mr-2 text-sm text-gray-700">{ad.heatingCoolingSystem}</span>
                  </div>
                )}
                {ad.deedType && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">نوع سند:</span>
                    <span className="mr-2 text-sm text-gray-700">{ad.deedType}</span>
                  </div>
                )}
                {ad.otherFeatures && ad.otherFeatures.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-gray-600">سایر امکانات:</span>
                    <div className="flex flex-wrap gap-2">
                      {ad.otherFeatures.map((feature, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">اطلاعات زمانی</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-semibold text-gray-600">تاریخ ایجاد:</span>
                  <span className="mr-2 text-sm text-gray-700">
                    {new Date(ad.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                {ad.publishedAt && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">تاریخ انتشار:</span>
                    <span className="mr-2 text-sm text-gray-700">
                      {new Date(ad.publishedAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {snackbar.open && (
              <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4">
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm shadow-lg ${
                    snackbar.severity === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {snackbar.message}
                </div>
              </div>
            )}
          </div>
        </DashboardLayout>
      </PrivateRoute>
    );
  }
