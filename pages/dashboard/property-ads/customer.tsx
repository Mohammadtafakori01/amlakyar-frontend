import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { FiSearch, FiFilter, FiChevronRight, FiChevronLeft, FiImage, FiMapPin, FiPhone } from 'react-icons/fi';
import CustomerLayout from '../../../src/shared/components/Layout/CustomerLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
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

export default function CustomerPropertyAdsPage() {
  const router = useRouter();
  const {
    propertyAds,
    pagination,
    isLoading,
    error,
    cities,
    isLoadingCities,
    filters,
    setFilters,
    searchPropertyAds,
    fetchAllCities,
  } = usePropertyAds();
  const { user } = useAuth();

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const hasFetched = useRef(false);
  const [searchInput, setSearchInput] = useState('');
  const [localFilters, setLocalFilters] = useState<PropertyAdFilters>({
    adType: filters?.adType,
    cityId: filters?.cityId,
    minPrice: filters?.minPrice,
    maxPrice: filters?.maxPrice,
    minArea: filters?.minArea,
    maxArea: filters?.maxArea,
    rooms: filters?.rooms,
    hasElevator: filters?.hasElevator,
    hasParking: filters?.hasParking,
  });

  // Initialize with PUBLISHED status filter for customers
  useEffect(() => {
    if (!hasFetched.current && user) {
      hasFetched.current = true;
      fetchAllCities();
      // For customers, we only show published ads
      const initialFilters: PropertyAdFilters = {
        ...localFilters,
        page: 1,
        limit: pageSize,
        // Note: status filter should be handled by backend or we filter client-side
      };
      searchPropertyAds(initialFilters);
      setFilters(localFilters);
    }
  }, [user, localFilters, setFilters, pageSize, fetchAllCities, searchPropertyAds]);

  useEffect(() => {
    if (hasFetched.current && user) {
      searchPropertyAds({ ...filters, page: currentPage, limit: pageSize });
    }
  }, [currentPage, pageSize, filters, user, searchPropertyAds]);

  useEffect(() => {
    if (pagination && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [pagination, currentPage]);

  const handleApplyFilters = () => {
    setFilters(localFilters);
    setCurrentPage(1);
    searchPropertyAds({ ...localFilters, page: 1, limit: pageSize });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const reset: PropertyAdFilters = {};
    setLocalFilters(reset);
    setFilters(reset);
    setCurrentPage(1);
    searchPropertyAds({ ...reset, page: 1, limit: pageSize });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    const searchFilters = { ...filters, search: searchInput.trim() || undefined, page: 1 };
    setFilters(searchFilters);
    setCurrentPage(1);
    searchPropertyAds(searchFilters);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const clearedFilters = { ...filters };
    delete clearedFilters.search;
    setFilters(clearedFilters);
    searchPropertyAds({ ...clearedFilters, page: currentPage, limit: pageSize });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
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
      : (process.env.NEXT_PUBLIC_API_URL || 'https://api.amlakyarr.com/');
    return `${baseUrl}/${imagePath}`;
  };

  // Filter only published ads client-side if needed
  const publishedAds = propertyAds?.filter(ad => ad.status === AdStatus.PUBLISHED) || [];

  return (
    <PrivateRoute>
      {user?.role === UserRole.CUSTOMER ? (
        <CustomerLayout>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Large Search Bar - Divar Style */}
            <div className="mb-6">
              <div className="relative">
                <input
                  data-search-input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="جستجو در آگهی‌ها..."
                  className="w-full rounded-2xl border-2 border-gray-300 bg-white pr-14 pl-4 py-4 text-lg text-right placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 shadow-sm"
                />
                <button
                  onClick={handleSearch}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <FiSearch className="w-6 h-6" />
                </button>
                {filters.search && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute left-16 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filters - Divar Style */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => {
                  setLocalFilters({ ...localFilters, adType: undefined });
                  setFilters({ ...filters, adType: undefined });
                  setCurrentPage(1);
                  searchPropertyAds({ ...filters, adType: undefined, page: 1, limit: pageSize });
                }}
                className={`flex-shrink-0 rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                  !filters.adType
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                همه
              </button>
              {Object.entries(adTypeLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setLocalFilters({ ...localFilters, adType: value as AdType });
                    setFilters({ ...filters, adType: value as AdType });
                    setCurrentPage(1);
                    searchPropertyAds({ ...filters, adType: value as AdType, page: 1, limit: pageSize });
                  }}
                  className={`flex-shrink-0 rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                    filters.adType === value
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Advanced Filters Toggle */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FiFilter />
                فیلترها
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">شهر</label>
                    <select
                      value={localFilters.cityId || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, cityId: e.target.value || undefined })
                      }
                      disabled={isLoadingCities}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
                    >
                      <option value="">همه شهرها</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
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
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد اتاق</label>
                    <input
                      type="number"
                      value={localFilters.rooms || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, rooms: e.target.value ? parseInt(e.target.value) : undefined })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    اعمال فیلتر
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  >
                    پاک کردن
                  </button>
                </div>
              </div>
            )}

            <ErrorDisplay error={error} />

            {/* Property Ads Grid - Divar Style */}
            {isLoading ? (
              <Loading />
            ) : publishedAds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center">
                <FiImage className="mx-auto mb-4 text-6xl text-gray-300" />
                <p className="text-lg font-medium text-gray-600">آگهی‌ای یافت نشد</p>
                <p className="mt-2 text-sm text-gray-500">لطفاً فیلترها را تغییر دهید یا دوباره جستجو کنید</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {publishedAds.map((ad) => {
                    const primaryImage = ad.images?.find((img) => img.isPrimary) || ad.images?.[0];
                    const imageUrl = getImageUrl(primaryImage?.filePath);
                    const isSaleAd = ad.adType === AdType.RESIDENTIAL_SALE || 
                                     ad.adType === AdType.COMMERCIAL_SALE || 
                                     ad.adType === AdType.CONSTRUCTION_PROJECT;
                    const isRentAd = ad.adType === AdType.RESIDENTIAL_RENT || 
                                     ad.adType === AdType.COMMERCIAL_RENT || 
                                     ad.adType === AdType.SHORT_TERM_RENT;

                    return (
                      <div
                        key={ad.id}
                        onClick={() => router.push(`/dashboard/property-ads/${ad.id}/customer-view`)}
                        className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                      >
                        {/* Image */}
                        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                          {imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={imageUrl}
                              alt={ad.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.png';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FiImage className="text-4xl text-gray-400" />
                            </div>
                          )}
                          {/* Category Badge */}
                          <div className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
                            {adTypeLabels[ad.adType]}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {ad.title}
                          </h3>
                          
                          {/* Location */}
                          {ad.city && (
                            <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
                              <FiMapPin className="w-4 h-4" />
                              <span>{ad.city.name}</span>
                              {ad.neighborhood && <span> - {ad.neighborhood.name}</span>}
                            </div>
                          )}

                          {/* Features */}
                          <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-600">
                            <span>{ad.areaSqm} متر</span>
                            {ad.rooms && <span>• {ad.rooms} خواب</span>}
                            {ad.hasParking && <span>• پارکینگ</span>}
                            {ad.hasElevator && <span>• آسانسور</span>}
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                            {isSaleAd && ad.totalPrice && (
                              <div className="text-left">
                                <p className="text-lg font-bold text-gray-900">
                                  {formatPrice(ad.totalPrice)}
                                </p>
                                <p className="text-xs text-gray-500">ریال</p>
                              </div>
                            )}
                            {isRentAd && ad.monthlyRent && (
                              <div className="text-left">
                                <p className="text-lg font-bold text-gray-900">
                                  {formatPrice(ad.monthlyRent)}
                                </p>
                                <p className="text-xs text-gray-500">اجاره</p>
                              </div>
                            )}
                            {ad.contactNumber && (
                              <div className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-primary-600">
                                <FiPhone className="w-4 h-4" />
                                <span className="text-xs font-medium">تماس</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600">
                      نمایش {((pagination.page - 1) * pagination.limit) + 1} تا{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} از{' '}
                      {pagination.total} آگهی
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
          </div>
        </CustomerLayout>
      ) : (
        <div>Access Denied</div>
      )}
    </PrivateRoute>
  );
}
