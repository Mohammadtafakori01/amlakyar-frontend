import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiArrowRight, FiImage, FiMapPin, FiPhone, FiHome, FiDollarSign, FiChevronLeft, FiChevronRight, FiArrowRightCircle } from 'react-icons/fi';
import CustomerLayout from '../../../../src/shared/components/Layout/CustomerLayout';
import PrivateRoute from '../../../../src/shared/components/guards/PrivateRoute';
import { usePropertyAds } from '../../../../src/domains/property-ads/hooks/usePropertyAds';
import { useAuth } from '../../../../src/domains/auth/hooks/useAuth';
import { AdType, AdStatus } from '../../../../src/domains/property-ads/types';
import { UserRole } from '../../../../src/shared/types';
import Loading from '../../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../../src/shared/components/common/ErrorDisplay';
import DepositRentConverter from '../../../../src/shared/components/property-ads/DepositRentConverter';

const adTypeLabels: Record<AdType, string> = {
  [AdType.RESIDENTIAL_SALE]: 'فروش مسکونی',
  [AdType.RESIDENTIAL_RENT]: 'اجاره مسکونی',
  [AdType.COMMERCIAL_SALE]: 'فروش اداری و تجاری',
  [AdType.COMMERCIAL_RENT]: 'اجاره اداری و تجاری',
  [AdType.SHORT_TERM_RENT]: 'اجاره کوتاه مدت',
  [AdType.CONSTRUCTION_PROJECT]: 'پروژه‌های ساختمانی',
};

export default function CustomerPropertyAdDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const {
    selectedPropertyAd,
    isLoading,
    error,
    fetchPropertyAdById,
  } = usePropertyAds();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPropertyAdById(id);
    }
  }, [id, fetchPropertyAdById]);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    const baseUrl = process.env.NODE_ENV === 'development'
      ? '/api'
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');
    return `${baseUrl}/${imagePath}`;
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  if (isLoading) {
    return (
      <PrivateRoute>
        {user?.role === UserRole.CUSTOMER ? (
          <CustomerLayout>
            <Loading />
          </CustomerLayout>
        ) : (
          <div>Access Denied</div>
        )}
      </PrivateRoute>
    );
  }

  if (!selectedPropertyAd || selectedPropertyAd.status !== AdStatus.PUBLISHED) {
    return (
      <PrivateRoute>
        {user?.role === UserRole.CUSTOMER ? (
          <CustomerLayout>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center">
                <p className="text-lg font-medium text-gray-600">آگهی یافت نشد</p>
                <button
                  onClick={() => router.push('/dashboard/property-ads/customer')}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  <FiArrowRight />
                  بازگشت به لیست آگهی‌ها
                </button>
              </div>
            </div>
          </CustomerLayout>
        ) : (
          <div>Access Denied</div>
        )}
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

  const images = ad.images || [];
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <PrivateRoute>
      {user?.role === UserRole.CUSTOMER ? (
        <CustomerLayout>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => router.push('/dashboard/property-ads/customer')}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <FiArrowRight />
                بازگشت به لیست آگهی‌ها
              </button>

              <ErrorDisplay error={error} />

              {/* Images Gallery - Divar Style */}
              {images.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <div className="relative aspect-video w-full bg-gray-100">
                    {currentImage && getImageUrl(currentImage.filePath) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getImageUrl(currentImage.filePath)!}
                        alt={ad.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FiImage className="text-6xl text-gray-400" />
                      </div>
                    )}
                    
                    {/* Image Navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                        >
                          <FiChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                        >
                          <FiChevronRight className="w-6 h-6" />
                        </button>
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? 'w-8 bg-white'
                                  : 'w-2 bg-white/50 hover:bg-white/75'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Strip */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-4 border-t border-gray-200">
                      {images.map((image, index) => {
                        const thumbUrl = getImageUrl(image.filePath);
                        return (
                          <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentImageIndex
                                ? 'border-primary-600'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {thumbUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={thumbUrl}
                                alt={`تصویر ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                <FiImage className="text-gray-400" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title and Category */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                      <span className="inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-800">
                        {adTypeLabels[ad.adType]}
                      </span>
                    </div>
                    <h1 className="mb-4 text-3xl font-bold text-gray-900">{ad.title}</h1>
                    
                    {/* Location */}
                    {ad.city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMapPin className="w-5 h-5" />
                        <span>
                          {ad.city.name}
                          {ad.neighborhood && ` - ${ad.neighborhood.name}`}
                          {ad.address && ` - ${ad.address}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">توضیحات</h2>
                    <p className="whitespace-pre-line text-gray-700 leading-relaxed">{ad.description}</p>
                  </div>

                  {/* Deposit-Rent Converter */}
                  {isRentAd && ad.isPriceConvertible && ad.minDepositValue && ad.maxDepositValue && (
                    <DepositRentConverter
                      minDeposit={ad.minDepositValue}
                      maxDeposit={ad.maxDepositValue}
                      monthlyRent={ad.monthlyRent}
                      initialDeposit={ad.depositValue}
                      isPriceConvertible={ad.isPriceConvertible}
                    />
                  )}

                  {/* Property Details */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">جزئیات ملک</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-600">متراژ:</span>
                        <p className="text-lg font-medium text-gray-900">{ad.areaSqm} متر مربع</p>
                      </div>
                      {ad.rooms !== undefined && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600">تعداد اتاق:</span>
                          <p className="text-lg font-medium text-gray-900">{ad.rooms}</p>
                        </div>
                      )}
                      {ad.buildingAge !== undefined && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600">سن بنا:</span>
                          <p className="text-lg font-medium text-gray-900">{ad.buildingAge} سال</p>
                        </div>
                      )}
                      {ad.floor && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600">طبقه:</span>
                          <p className="text-lg font-medium text-gray-900">{ad.floor}</p>
                        </div>
                      )}
                      {ad.totalFloors !== undefined && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600">تعداد طبقات:</span>
                          <p className="text-lg font-medium text-gray-900">{ad.totalFloors}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">امکانات</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {ad.hasElevator !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${ad.hasElevator ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-700">آسانسور: {ad.hasElevator ? 'دارد' : 'ندارد'}</span>
                        </div>
                      )}
                      {ad.hasParking !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${ad.hasParking ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-700">
                            پارکینگ: {ad.hasParking ? `دارد ${ad.parkingCount ? `(${ad.parkingCount} عدد)` : ''}` : 'ندارد'}
                          </span>
                        </div>
                      )}
                      {ad.hasStorage !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${ad.hasStorage ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-700">
                            انباری: {ad.hasStorage ? (ad.storageArea ? `${ad.storageArea} متر` : 'دارد') : 'ندارد'}
                          </span>
                        </div>
                      )}
                      {ad.hasBalcony !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${ad.hasBalcony ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-700">بالکن: {ad.hasBalcony ? 'دارد' : 'ندارد'}</span>
                        </div>
                      )}
                      {ad.heatingCoolingSystem && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600">سیستم گرمایش و سرمایش:</span>
                          <p className="text-gray-700">{ad.heatingCoolingSystem}</p>
                        </div>
                      )}
                      {ad.deedType && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600">نوع سند:</span>
                          <p className="text-gray-700">{ad.deedType}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar - Price and Contact */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    {/* Price Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-2 text-gray-600">
                        <FiDollarSign className="w-5 h-5" />
                        <span className="text-sm font-semibold">قیمت</span>
                      </div>
                      {isSaleAd && ad.totalPrice && (
                        <div>
                          <p className="text-3xl font-bold text-gray-900">{formatPrice(ad.totalPrice)}</p>
                          <p className="mt-1 text-sm text-gray-500">ریال</p>
                          {ad.pricePerSqm && (
                            <p className="mt-2 text-sm text-gray-600">
                              قیمت هر متر: {formatPrice(ad.pricePerSqm)} ریال
                            </p>
                          )}
                        </div>
                      )}
                      {isRentAd && (
                        <div className="space-y-3">
                          {!ad.isPriceConvertible && (
                            <>
                              {ad.depositValue && (
                                <div>
                                  <p className="text-sm text-gray-600">رهن:</p>
                                  <p className="text-2xl font-bold text-gray-900">{formatPrice(ad.depositValue)}</p>
                                  <p className="text-xs text-gray-500">ریال</p>
                                </div>
                              )}
                              {ad.monthlyRent && (
                                <div>
                                  <p className="text-sm text-gray-600">اجاره:</p>
                                  <p className="text-2xl font-bold text-gray-900">{formatPrice(ad.monthlyRent)}</p>
                                  <p className="text-xs text-gray-500">ریال در ماه</p>
                                </div>
                              )}
                            </>
                          )}
                          {ad.isPriceConvertible && ad.minDepositValue && ad.maxDepositValue && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">محدوده رهن:</p>
                              <p className="text-xl font-bold text-gray-900">
                                {formatPrice(ad.minDepositValue)} - {formatPrice(ad.maxDepositValue)}
                              </p>
                              <p className="text-xs text-gray-500">ریال</p>
                              {ad.monthlyRent && (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600">اجاره:</p>
                                  <p className="text-2xl font-bold text-gray-900">{formatPrice(ad.monthlyRent)}</p>
                                  <p className="text-xs text-gray-500">ریال در ماه</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {ad.isPriceConvertible && (
                        <p className="mt-3 text-sm font-medium text-green-600">قیمت قابل تبدیل است</p>
                      )}
                    </div>

                    {/* Contact Card */}
                    {ad.contactNumber && (
                      <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <FiPhone className="w-5 h-5 text-primary-600" />
                          <span className="font-semibold text-primary-900">تماس با آگهی‌دهنده</span>
                        </div>
                        <a
                          href={`tel:${ad.contactNumber}`}
                          className="block w-full rounded-xl bg-primary-600 px-4 py-3 text-center text-lg font-bold text-white hover:bg-primary-700 transition-colors"
                        >
                          {ad.contactNumber}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CustomerLayout>
      ) : (
        <div>Access Denied</div>
      )}
    </PrivateRoute>
  );
}
