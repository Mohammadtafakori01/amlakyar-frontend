import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  FiPlus,
  FiEdit2,
  FiEye,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiX,
  FiTrash2,
  FiShare2,
  FiGlobe,
} from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import { usePropertyFiles } from '../../../src/domains/property-files/hooks/usePropertyFiles';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { useEstates } from '../../../src/domains/estates/hooks/useEstates';
import { UserRole } from '../../../src/shared/types';
import {
  PropertyFileZone,
  PropertyTransactionType,
  PropertyBuildingType,
  PropertyFileFilters,
} from '../../../src/domains/property-files/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import {
  canEditFile,
  canDeleteFile,
  canShareInternal,
  canShareExternal,
  canShareFromPersonal,
  canShareFromPersonalToExternal,
  canCreateFile,
  getAvailableZones,
} from '../../../src/shared/utils/rbacUtils';
import { formatToPersianDate } from '../../../src/shared/utils/dateUtils';
import { formatPrice } from '../../../src/shared/utils/numberUtils';

const zoneLabels: Record<PropertyFileZone, string> = {
  [PropertyFileZone.OFFICE_MASTER]: 'زونکن املاک',
  [PropertyFileZone.INTERNAL_COOPERATION]: 'تعاون داخلی',
  [PropertyFileZone.EXTERNAL_NETWORK]: 'تعاون خارجی',
  [PropertyFileZone.PERSONAL]: 'فایل شخصی',
};

const transactionTypeLabels: Record<PropertyTransactionType, string> = {
  [PropertyTransactionType.SALE]: 'فروش',
  [PropertyTransactionType.RENT]: 'اجاره',
  [PropertyTransactionType.MORTGAGE]: 'رهن',
  [PropertyTransactionType.PARTNERSHIP]: 'مشارکت',
  [PropertyTransactionType.EXCHANGE]: 'معاوضه',
};

const buildingTypeLabels: Record<PropertyBuildingType, string> = {
  [PropertyBuildingType.VILLA]: 'ویلا',
  [PropertyBuildingType.APARTMENT]: 'آپارتمان',
  [PropertyBuildingType.COMMERCIAL]: 'تجاری',
  [PropertyBuildingType.OUTSIDE]: 'بیرونی',
  [PropertyBuildingType.OLD]: 'قدیمی',
  [PropertyBuildingType.OFFICE]: 'اداری',
  [PropertyBuildingType.SHOP]: 'مغازه',
  [PropertyBuildingType.REAL_ESTATE]: 'مستغلات',
};

export default function PropertyFilesPage() {
  const router = useRouter();
  const {
    propertyFiles,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    fetchPropertyFiles,
    deletePropertyFile,
    shareInternal,
    shareExternal,
    shareFromPersonal,
    shareFromPersonalToExternal,
    clearError,
  } = usePropertyFiles();
  const { user: currentUser } = useAuth();
  const { fetchApprovedEstates, approvedEstates, isApprovedLoading, approvedEstatesError } = useEstates();

  const [activeTab, setActiveTab] = useState<PropertyFileZone | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState<string | null>(null);
  const [targetEstateId, setTargetEstateId] = useState('');
  const [estates, setEstates] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  const availableZones = useMemo(() => {
    if (!currentUser) return [];
    return getAvailableZones(currentUser.role);
  }, [currentUser]);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    if (currentUser && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const loadData = async () => {
        const activeZone = activeTab === 'ALL' ? undefined : activeTab;
        await fetchPropertyFiles({
          zone: activeZone,
          page: 1,
          limit: 10,
        });
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    if (hasLoadedRef.current && currentUser) {
      const loadData = async () => {
        const activeZone = activeTab === 'ALL' ? undefined : activeTab;
        await fetchPropertyFiles({
          zone: activeZone,
          transactionType: filters.transactionType,
          buildingType: filters.buildingType,
          page: 1,
          limit: 10,
        });
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters.transactionType, filters.buildingType]);

  useEffect(() => {
    // Fetch approved estates when modal opens for users who can share externally
    if (showShareModal && (currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPERVISOR)) {
      fetchApprovedEstates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showShareModal, currentUser?.role]);

  useEffect(() => {
    // Filter out current user's estate from the list
    if (approvedEstates && currentUser?.estateId) {
      setEstates(approvedEstates.filter((e: any) => e.id !== currentUser.estateId));
    } else if (approvedEstates && !currentUser?.estateId) {
      // If user doesn't have estateId, show all approved estates
      setEstates(approvedEstates);
    }
  }, [approvedEstates, currentUser?.estateId]);

  const handleSearch = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      const activeZone = activeTab === 'ALL' ? undefined : activeTab;
      fetchPropertyFiles({
        zone: activeZone,
        search: value || undefined,
        page: 1,
        limit: 10,
        transactionType: filters.transactionType,
        buildingType: filters.buildingType,
      });
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters.transactionType, filters.buildingType]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    handleSearch(value);
  };

  const handlePageChange = (newPage: number) => {
    const activeZone = activeTab === 'ALL' ? undefined : activeTab;
    fetchPropertyFiles({
      ...filters,
      zone: activeZone,
      search: searchInput || undefined,
      page: newPage,
      limit: 10,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این فایل اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
      return;
    }

    try {
      await deletePropertyFile(id);
      setSnackbar({ open: true, message: 'فایل با موفقیت حذف شد', severity: 'success' });
      const activeZone = activeTab === 'ALL' ? undefined : activeTab;
      fetchPropertyFiles({
        ...filters,
        zone: activeZone,
        search: searchInput || undefined,
        page: pagination?.page || 1,
        limit: 10,
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در حذف فایل', severity: 'error' });
    }
  };

  const handleShareInternal = async (id: string) => {
    if (!window.confirm('آیا می‌خواهید این فایل را به‌صورت داخلی به‌اشتراک بگذارید؟')) {
      return;
    }

    try {
      await shareInternal(id);
      setSnackbar({ open: true, message: 'فایل با موفقیت به‌اشتراک گذاشته شد', severity: 'success' });
      const activeZone = activeTab === 'ALL' ? undefined : activeTab;
      fetchPropertyFiles({
        ...filters,
        zone: activeZone,
        search: searchInput || undefined,
        page: pagination?.page || 1,
        limit: 10,
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در به‌اشتراک‌گذاری', severity: 'error' });
    }
  };

  const handleShareExternal = async () => {
    if (!selectedFileForShare || !targetEstateId) {
      setSnackbar({ open: true, message: 'لطفاً آژانس مقصد را انتخاب کنید', severity: 'error' });
      return;
    }

    try {
      // بررسی اینکه آیا فایل شخصی است و باید از shareFromPersonalToExternal استفاده کنیم
      const file = propertyFiles.find((f) => f.id === selectedFileForShare);
      if (file && file.zone === PropertyFileZone.PERSONAL && currentUser?.role === UserRole.SUPERVISOR) {
        await shareFromPersonalToExternal(selectedFileForShare, { targetEstateId });
      } else if (file && file.zone === PropertyFileZone.PERSONAL && currentUser?.role === UserRole.ADMIN) {
        // برای ADMIN، فایل‌های شخصی هم می‌توانند با shareExternal به‌اشتراک گذاشته شوند
        // اما بهتر است از shareFromPersonalToExternal استفاده کنیم
        await shareFromPersonalToExternal(selectedFileForShare, { targetEstateId });
      } else {
        await shareExternal(selectedFileForShare, { targetEstateId });
      }
      setSnackbar({ open: true, message: 'فایل با موفقیت به‌اشتراک گذاشته شد', severity: 'success' });
      setShowShareModal(false);
      setSelectedFileForShare(null);
      setTargetEstateId('');
      const activeZone = activeTab === 'ALL' ? undefined : activeTab;
      fetchPropertyFiles({
        ...filters,
        zone: activeZone,
        search: searchInput || undefined,
        page: pagination?.page || 1,
        limit: 10,
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در به‌اشتراک‌گذاری', severity: 'error' });
    }
  };

  const handleShareFromPersonal = async (id: string) => {
    if (!window.confirm('آیا می‌خواهید این فایل شخصی را به زونکن تعاون داخلی منتقل کنید؟')) {
      return;
    }

    try {
      await shareFromPersonal(id);
      setSnackbar({ open: true, message: 'فایل با موفقیت به زونکن تعاون منتقل شد', severity: 'success' });
      const activeZone = activeTab === 'ALL' ? undefined : activeTab;
      fetchPropertyFiles({
        ...filters,
        zone: activeZone,
        search: searchInput || undefined,
        page: pagination?.page || 1,
        limit: 10,
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در به‌اشتراک‌گذاری', severity: 'error' });
    }
  };

  const handleApplyFilters = () => {
    const activeZone = activeTab === 'ALL' ? undefined : activeTab;
    fetchPropertyFiles({
      ...filters,
      zone: activeZone,
      search: searchInput || undefined,
      page: 1,
      limit: 10,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setSearchInput('');
    const activeZone = activeTab === 'ALL' ? undefined : activeTab;
    fetchPropertyFiles({
      zone: activeZone,
      page: 1,
      limit: 10,
    });
    setShowFilters(false);
  };

  const filteredFiles = useMemo(() => {
    if (activeTab === 'ALL') return propertyFiles;
    return propertyFiles.filter((f) => f.zone === activeTab);
  }, [propertyFiles, activeTab]);

  if (isLoading && !propertyFiles.length) {
    return (
      <PrivateRoute>
        <DashboardLayout>
          <Loading />
        </DashboardLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">فایل‌های ملکی</h1>
            {currentUser && availableZones.some(zone => canCreateFile(currentUser.role, zone)) && (
              <button
                onClick={() => router.push('/dashboard/property-files/create')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                <span>ایجاد فایل جدید</span>
              </button>
            )}
          </div>

          {error && <ErrorDisplay error={error} />}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              همه
            </button>
            {availableZones.map((zone) => (
              <button
                key={zone}
                onClick={() => setActiveTab(zone)}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  activeTab === zone
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {zoneLabels[zone]}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 items-center">
            <div className="flex-1 relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در مالک، آدرس، کد یکتا..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="w-5 h-5" />
              <span>فیلتر</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع معامله</label>
                  <select
                    value={filters.transactionType || ''}
                    onChange={(e) => setFilters({ ...filters, transactionType: e.target.value as PropertyTransactionType || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">همه</option>
                    {Object.entries(transactionTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع ساختمان</label>
                  <select
                    value={filters.buildingType || ''}
                    onChange={(e) => setFilters({ ...filters, buildingType: e.target.value as PropertyBuildingType || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">همه</option>
                    {Object.entries(buildingTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {filters.transactionType === PropertyTransactionType.MORTGAGE && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">حداقل رهن (ریال)</label>
                    <input
                      type="number"
                      value={filters.minMortgagePrice || ''}
                      onChange={(e) => setFilters({ ...filters, minMortgagePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">حداکثر رهن (ریال)</label>
                    <input
                      type="number"
                      value={filters.maxMortgagePrice || ''}
                      onChange={(e) => setFilters({ ...filters, maxMortgagePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  اعمال فیلتر
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  پاک کردن
                </button>
              </div>
            </div>
          )}

          {/* Files List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <Loading />
            ) : filteredFiles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                فایلی یافت نشد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">کد یکتا</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">مالک</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">منطقه</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نوع معامله</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">قیمت</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">تاریخ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{file.uniqueCode}</td>
                        <td className="px-4 py-3 text-sm">{file.owner}</td>
                        <td className="px-4 py-3 text-sm">{file.region}</td>
                        <td className="px-4 py-3 text-sm">{transactionTypeLabels[file.transactionType]}</td>
                        <td className="px-4 py-3 text-sm">
                          {file.totalPrice ? formatPrice(file.totalPrice) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">{formatToPersianDate(file.date)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/property-files/${file.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="مشاهده"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            {currentUser && canEditFile(currentUser.role, file, currentUser.id, currentUser.estateId) && (
                              <button
                                onClick={() => router.push(`/dashboard/property-files/edit/${file.id}`)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="ویرایش"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                            )}
                            {currentUser && canShareInternal(currentUser.role, file) && (
                              <button
                                onClick={() => handleShareInternal(file.id)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="به‌اشتراک‌گذاری داخلی"
                              >
                                <FiShare2 className="w-4 h-4" />
                              </button>
                            )}
                            {currentUser && canShareExternal(currentUser.role, file, currentUser.id) && (
                              <button
                                onClick={() => {
                                  setSelectedFileForShare(file.id);
                                  setShowShareModal(true);
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="به‌اشتراک‌گذاری خارجی"
                              >
                                <FiGlobe className="w-4 h-4" />
                              </button>
                            )}
                            {currentUser && canShareFromPersonal(currentUser.role, file, currentUser.id) && (
                              <button
                                onClick={() => handleShareFromPersonal(file.id)}
                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="انتقال به تعاون داخلی"
                              >
                                <FiShare2 className="w-4 h-4" />
                              </button>
                            )}
                            {currentUser && canShareFromPersonalToExternal(currentUser.role, file, currentUser.id) && (
                              <button
                                onClick={() => {
                                  setSelectedFileForShare(file.id);
                                  setShowShareModal(true);
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="به‌اشتراک‌گذاری خارجی از فایل شخصی"
                              >
                                <FiGlobe className="w-4 h-4" />
                              </button>
                            )}
                            {currentUser && canDeleteFile(currentUser.role, file, currentUser.id, currentUser.estateId) && (
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  نمایش {((pagination.page - 1) * pagination.limit) + 1} تا {Math.min(pagination.page * pagination.limit, pagination.total)} از {pagination.total}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevious}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm">
                    صفحه {pagination.page} از {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">به‌اشتراک‌گذاری خارجی</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">انتخاب آژانس</label>
                  {isApprovedLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-gray-500">
                      در حال بارگذاری آژانس‌ها...
                    </div>
                  ) : approvedEstatesError ? (
                    <div className="w-full px-3 py-2 border border-red-300 rounded-lg text-center text-red-600 bg-red-50">
                      خطا در دریافت لیست آژانس‌ها: {approvedEstatesError}
                    </div>
                  ) : (
                    <select
                      value={targetEstateId}
                      onChange={(e) => setTargetEstateId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={isApprovedLoading || estates.length === 0}
                    >
                      <option value="">انتخاب کنید...</option>
                      {estates.map((estate) => (
                        <option key={estate.id} value={estate.id}>{estate.establishmentName}</option>
                      ))}
                    </select>
                  )}
                  {!isApprovedLoading && !approvedEstatesError && estates.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500">هیچ آژانس تایید شده‌ای یافت نشد</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareExternal}
                    disabled={isApprovedLoading || !targetEstateId}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    به‌اشتراک بگذار
                  </button>
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setSelectedFileForShare(null);
                      setTargetEstateId('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar */}
        {snackbar.open && (
          <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 rounded-lg shadow-lg z-50 ${
            snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <span>{snackbar.message}</span>
              <button onClick={() => setSnackbar({ ...snackbar, open: false })}>
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PrivateRoute>
  );
}

