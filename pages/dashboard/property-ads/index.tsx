import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiEdit2, FiEye, FiFilter, FiChevronRight, FiChevronLeft, FiSearch, FiX, FiTrash2, FiImage } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { usePropertyAds } from '../../../src/domains/property-ads/hooks/usePropertyAds';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { AdType, AdStatus, PropertyAdFilters } from '../../../src/domains/property-ads/types';
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

export default function PropertyAdsPage() {
  const router = useRouter();
  const {
    propertyAds,
    pagination,
    isLoading,
    error,
    states,
    cities,
    isLoadingStates,
    isLoadingCities,
    filters,
    setFilters,
    findMyAds,
    deletePropertyAd,
    fetchAllStates,
    fetchAllCities,
  } = usePropertyAds();
  const { user: currentUser } = useAuth();

  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const hasFetched = useRef(false);
  const [searchInput, setSearchInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [localFilters, setLocalFilters] = useState<PropertyAdFilters>({
    adType: filters?.adType,
    stateId: filters?.stateId,
    cityId: filters?.cityId,
    minPrice: filters?.minPrice,
    maxPrice: filters?.maxPrice,
    minArea: filters?.minArea,
    maxArea: filters?.maxArea,
    rooms: filters?.rooms,
    hasElevator: filters?.hasElevator,
    hasParking: filters?.hasParking,
    status: filters?.status,
  });

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    if (!hasFetched.current && currentUser) {
      hasFetched.current = true;
      fetchAllStates();
      fetchAllCities();
      findMyAds({ ...localFilters, page: 1, limit: pageSize });
      setFilters(localFilters);
    }
  }, [currentUser, localFilters, setFilters, pageSize, fetchAllStates, fetchAllCities, findMyAds]);

  useEffect(() => {
    if (hasFetched.current && currentUser) {
      findMyAds({ ...filters, page: currentPage, limit: pageSize });
    }
  }, [currentPage, pageSize, filters, currentUser, findMyAds]);

  useEffect(() => {
    if (pagination && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.page]);

  const handleApplyFilters = () => {
    setFilters(localFilters);
    setCurrentPage(1);
    findMyAds({ ...localFilters, page: 1, limit: pageSize });
  };

  const handleClearFilters = () => {
    const reset: PropertyAdFilters = {};
    setLocalFilters(reset);
    setFilters(reset);
    setCurrentPage(1);
    findMyAds({ ...reset, page: 1, limit: pageSize });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    if (!searchInput.trim()) {
      return;
    }
    const searchFilters = { ...filters, search: searchInput.trim(), page: 1 };
    setFilters(searchFilters);
    setCurrentPage(1);
    findMyAds(searchFilters);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const clearedFilters = { ...filters };
    delete clearedFilters.search;
    setFilters(clearedFilters);
    setShowSearch(false);
    findMyAds({ ...clearedFilters, page: currentPage, limit: pageSize });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeletePropertyAd = async (adId: string) => {
    if (!window.confirm('آیا از حذف این آگهی اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
      return;
    }

    try {
      await deletePropertyAd(adId);
      setSnackbar({ open: true, message: 'آگهی با موفقیت حذف شد', severity: 'success' });
      // Refresh the list
      findMyAds({ ...filters, page: currentPage, limit: pageSize });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در حذف آگهی';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    const baseUrl = process.env.NODE_ENV === 'development'
      ? '/api'
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');
    return `${baseUrl}/${imagePath}`;
  };

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">مدیریت آگهی‌های املاک</h1>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (showSearch) {
                      if (searchInput) {
                        handleClearSearch();
                      } else {
                        setShowSearch(false);
                      }
                    } else {
                      setShowSearch(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                >
                  <FiSearch /> جستجو
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                >
                  <FiFilter /> فیلترها
                </button>
                <button
                  onClick={() => router.push('/dashboard/property-ads/create')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
                >
                  <FiPlus />
                  ایجاد آگهی جدید
                </button>
              </div>
            </div>

            {showSearch && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">جستجو</label>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      placeholder="عنوان، توضیحات..."
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      disabled={!searchInput.trim() || isLoading}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSearch />
                      جستجو
                    </button>
                    {filters.search && (
                      <button
                        onClick={handleClearSearch}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      >
                        <FiX />
                        پاک کردن
                      </button>
                    )}
                  </div>
                </div>
                {filters.search && (
                  <div className="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800">
                    در حال نمایش نتایج جستجو برای: &quot;{filters.search}&quot;
                  </div>
                )}
              </div>
            )}

            {showFilters && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نوع آگهی</label>
                    <select
                      value={localFilters.adType || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, adType: (e.target.value as AdType) || undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">همه</option>
                      {Object.entries(adTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">استان</label>
                    <select
                      value={localFilters.stateId || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, stateId: e.target.value || undefined, cityId: undefined })
                      }
                      disabled={isLoadingStates}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
                    >
                      <option value="">همه</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">شهر</label>
                    <select
                      value={localFilters.cityId || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, cityId: e.target.value || undefined })
                      }
                      disabled={isLoadingCities}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
                    >
                      <option value="">همه</option>
                      {cities
                        .filter((city) => !localFilters.stateId || city.stateId === localFilters.stateId)
                        .map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">وضعیت</label>
                    <select
                      value={localFilters.status || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, status: (e.target.value as AdStatus) || undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">همه</option>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">حداقل قیمت (ریال)</label>
                    <input
                      type="number"
                      value={localFilters.minPrice || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, minPrice: e.target.value ? parseInt(e.target.value) : undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">حداکثر قیمت (ریال)</label>
                    <input
                      type="number"
                      value={localFilters.maxPrice || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">حداقل متراژ</label>
                    <input
                      type="number"
                      value={localFilters.minArea || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, minArea: e.target.value ? parseInt(e.target.value) : undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">حداکثر متراژ</label>
                    <input
                      type="number"
                      value={localFilters.maxArea || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, maxArea: e.target.value ? parseInt(e.target.value) : undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      اعمال فیلتر
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    >
                      پاک کردن
                    </button>
                  </div>
                </div>
              </div>
            )}

            <ErrorDisplay error={error} />

            {isLoading ? (
              <Loading />
            ) : !Array.isArray(propertyAds) || propertyAds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <FiImage className="mx-auto mb-4 text-6xl text-gray-300" />
                <p className="text-sm text-gray-500">آگهی‌ای یافت نشد.</p>
                <button
                  onClick={() => router.push('/dashboard/property-ads/create')}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  <FiPlus />
                  ایجاد آگهی جدید
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {propertyAds.map((ad) => {
                    const primaryImage = ad.images?.find((img) => img.isPrimary) || ad.images?.[0];
                    const imageUrl = getImageUrl(primaryImage?.filePath);
                    return (
                      <div
                        key={ad.id}
                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                      >
                        {imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imageUrl}
                            alt={ad.title}
                            className="h-48 w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center bg-gray-100">
                            <FiImage className="text-4xl text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{ad.title}</h3>
                            <span className={`ml-2 inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${statusColors[ad.status]}`}>
                              {statusLabels[ad.status]}
                            </span>
                          </div>
                          <p className="mb-2 text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                          <div className="mb-3 space-y-1 text-sm text-gray-700">
                            <div>
                              <span className="font-semibold">نوع:</span> {adTypeLabels[ad.adType]}
                            </div>
                            {ad.state && (
                              <div>
                                <span className="font-semibold">استان:</span> {ad.state.name}
                              </div>
                            )}
                            {ad.city && (
                              <div>
                                <span className="font-semibold">شهر:</span> {ad.city.name}
                                {ad.neighborhood && ` - ${ad.neighborhood.name}`}
                              </div>
                            )}
                            <div>
                              <span className="font-semibold">متراژ:</span> {ad.areaSqm} متر مربع
                            </div>
                            {ad.totalPrice && (
                              <div>
                                <span className="font-semibold">قیمت:</span> {formatPrice(ad.totalPrice)} ریال
                              </div>
                            )}
                            {ad.depositValue && ad.monthlyRent && (
                              <div>
                                <span className="font-semibold">رهن:</span> {formatPrice(ad.depositValue)} ریال
                                {' | '}
                                <span className="font-semibold">اجاره:</span> {formatPrice(ad.monthlyRent)} ریال
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/property-ads/${ad.id}`)}
                              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary-200 hover:text-primary-600"
                            >
                              <FiEye className="inline ml-1" />
                              مشاهده
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/property-ads/${ad.id}/edit`)}
                              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary-200 hover:text-primary-600"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeletePropertyAd(ad.id)}
                              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:border-red-300 hover:bg-red-50"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        نمایش {((pagination.page - 1) * pagination.limit) + 1} تا {Math.min(pagination.page * pagination.limit, pagination.total)} از {pagination.total} آگهی
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="rounded-xl border border-gray-200 px-3 py-1 text-sm text-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-xs text-gray-500">در هر صفحه</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevious || isLoading}
                        className={`flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                          !pagination.hasPrevious || isLoading
                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                        }`}
                      >
                        <FiChevronRight className="text-lg" />
                        قبلی
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isLoading}
                              className={`min-w-[40px] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                currentPage === pageNum
                                  ? 'border-primary-500 bg-primary-600 text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                              } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNext || isLoading}
                        className={`flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                          !pagination.hasNext || isLoading
                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                        }`}
                      >
                        بعدی
                        <FiChevronLeft className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

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
      </RoleGuard>
    </PrivateRoute>
  );
}
