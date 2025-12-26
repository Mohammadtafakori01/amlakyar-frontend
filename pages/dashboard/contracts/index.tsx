import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { FiPlus, FiEdit2, FiEye, FiFilter, FiChevronRight, FiChevronLeft, FiSearch, FiX, FiFileText, FiTrash2, FiArchive } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useContracts } from '../../../src/domains/contracts/hooks/useContracts';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole } from '../../../src/shared/types';
import { ContractType, ContractStatus, ContractFilters, ArchiveContractsDto } from '../../../src/domains/contracts/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import { AppDispatch } from '../../../src/app/store';
import { fetchContracts as fetchContractsThunk, fetchArchive as fetchArchiveThunk } from '../../../src/domains/contracts/store/contractsSlice';
import { formatToPersianDate, formatToGregorianDate } from '../../../src/shared/utils/dateUtils';
import PersianDatePicker from '../../../src/shared/components/common/PersianDatePicker';

export default function ContractsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {
    contracts,
    pagination,
    isLoading,
    error,
    selectedContract,
    filters,
    setFilters,
    searchContracts,
    clearSearch,
    searchResults,
    isSearching,
    searchQuery,
    deleteContract,
    fetchArchive,
  } = useContracts();
  const { user: currentUser } = useAuth();

  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const hasFetched = useRef(false);
  const [searchInput, setSearchInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [activeTab, setActiveTab] = useState<'contracts' | 'archive'>('contracts');
  const [archiveFilters, setArchiveFilters] = useState<ArchiveContractsDto>({
    contractDate: '',
    contractNumber: '',
    name: '',
    lastname: '',
    page: 1,
    limit: 10,
  });
  const [archiveContracts, setArchiveContracts] = useState<any[]>([]);
  const [archivePagination, setArchivePagination] = useState<any>(null);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [archiveCurrentPage, setArchiveCurrentPage] = useState(1);
  const [archivePageSize, setArchivePageSize] = useState(10);
  const archiveHasSearched = useRef(false);

  const [localFilters, setLocalFilters] = useState<ContractFilters>({
    type: filters?.type,
    status: filters?.status,
    year: filters?.year,
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
      setLocalFilters(filters);
      dispatch(fetchContractsThunk({ ...filters, page: 1, limit: pageSize }));
      setFilters(filters);
    }
  }, [dispatch, currentUser, filters, setFilters, pageSize]);

  useEffect(() => {
    if (hasFetched.current && currentUser) {
      dispatch(fetchContractsThunk({ ...filters, page: currentPage, limit: pageSize }));
    }
  }, [currentPage, pageSize, dispatch, filters, currentUser]);

  useEffect(() => {
    if (pagination && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.page]);

  const handleApplyFilters = () => {
    setFilters(localFilters);
    setCurrentPage(1);
    dispatch(fetchContractsThunk({ ...localFilters, page: 1, limit: pageSize }));
  };

  const handleClearFilters = () => {
    const reset: ContractFilters = {};
    setLocalFilters(reset);
    setFilters(reset);
    setCurrentPage(1);
    dispatch(fetchContractsThunk({ ...reset, page: 1, limit: pageSize }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      return;
    }
    await searchContracts(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    clearSearch();
    setShowSearch(false);
    const scoped = { ...localFilters };
    dispatch(fetchContractsThunk({ ...scoped, page: currentPage, limit: pageSize }));
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!window.confirm('آیا از حذف این قرارداد اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
      return;
    }

    try {
      await deleteContract(contractId);
      setSnackbar({ open: true, message: 'قرارداد با موفقیت حذف شد', severity: 'success' });
      // Refresh the list
      dispatch(fetchContractsThunk({ ...filters, page: currentPage, limit: pageSize }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در حذف قرارداد';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleArchiveSearch = async (resetPage: boolean = false) => {
    // Validate that at least one filter is provided
    if (!archiveFilters.contractDate && !archiveFilters.contractNumber && !archiveFilters.name && !archiveFilters.lastname) {
      setSnackbar({ open: true, message: 'لطفاً حداقل یکی از فیلترها را وارد کنید', severity: 'error' });
      return;
    }

    const page = resetPage ? 1 : archiveCurrentPage;
    if (resetPage) {
      setArchiveCurrentPage(1);
    }

    archiveHasSearched.current = true;
    setIsLoadingArchive(true);
    try {
      // Convert Persian date to Gregorian format for API
      const gregorianDate = archiveFilters.contractDate ? formatToGregorianDate(archiveFilters.contractDate) : undefined;
      
      const result = await fetchArchive({
        contractDate: gregorianDate || undefined,
        contractNumber: archiveFilters.contractNumber || undefined,
        name: archiveFilters.name || undefined,
        lastname: archiveFilters.lastname || undefined,
        page,
        limit: archivePageSize,
      });
      
      // Check if the action was fulfilled
      if (fetchArchiveThunk.fulfilled.match(result)) {
        // The payload is the PaginatedResponse: { data: Contract[], meta: PaginationMeta }
        // Based on the Redux slice, result.payload should be the response object
        const response = result.payload as { data?: any[]; meta?: any };
        
        // Extract data and meta from the response
        const contracts = response?.data && Array.isArray(response.data) ? response.data : [];
        const pagination = response?.meta || null;
        
        setArchiveContracts(contracts);
        setArchivePagination(pagination);
      } else {
        // Rejected or other state
        setArchiveContracts([]);
        setArchivePagination(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در بارگذاری بایگانی';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setArchiveContracts([]);
      setArchivePagination(null);
    } finally {
      setIsLoadingArchive(false);
    }
  };

  const handleArchivePageChange = (newPage: number) => {
    setArchiveCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArchivePageSizeChange = (newSize: number) => {
    setArchivePageSize(newSize);
    setArchiveCurrentPage(1);
  };

  useEffect(() => {
    // Trigger search when page or pageSize changes (only if we have active filters and have already searched)
    if (archiveHasSearched.current && (archiveFilters.contractDate || archiveFilters.contractNumber || archiveFilters.name || archiveFilters.lastname)) {
      handleArchiveSearch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveCurrentPage, archivePageSize]);

  const getContractTypeLabel = (type: ContractType): string => {
    return type === ContractType.RENTAL ? 'اجاره‌نامه' : 'مبایعه‌نامه';
  };

  const getStatusLabel = (status: ContractStatus): string => {
    const labels: Record<ContractStatus, string> = {
      [ContractStatus.DRAFT]: 'پیش‌نویس',
      [ContractStatus.SIGNED]: 'ثبت شده',
      [ContractStatus.EXPIRED]: 'منقضی شده',
      [ContractStatus.TERMINATED]: 'فسخ شده',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: ContractStatus): string => {
    const colors: Record<ContractStatus, string> = {
      [ContractStatus.DRAFT]: 'border-amber-200 bg-amber-50 text-amber-700',
      [ContractStatus.SIGNED]: 'border-green-200 bg-green-50 text-green-700',
      [ContractStatus.EXPIRED]: 'border-gray-200 bg-gray-50 text-gray-500',
      [ContractStatus.TERMINATED]: 'border-red-200 bg-red-50 text-red-700',
    };
    return colors[status] || 'border-gray-200 bg-gray-50 text-gray-500';
  };

  const currentYear = new Date().getFullYear();
  const persianYear = currentYear - 621; // Approximate conversion

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">مدیریت قراردادها</h1>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (showSearch) {
                      if (searchQuery) {
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
                  onClick={() => router.push('/dashboard/contracts/create')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
                >
                  <FiPlus />
                  ثبت قرارداد جدید
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
                      placeholder="شماره قرارداد، نام طرفین، آدرس ملک..."
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      disabled={!searchInput.trim() || isSearching}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSearch />
                      جستجو
                    </button>
                    {searchQuery && (
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
                {searchQuery && (
                  <div className="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800">
                    در حال نمایش نتایج جستجو برای: &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}

            {showFilters && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نوع قرارداد</label>
                    <select
                      value={localFilters.type || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, type: (e.target.value as ContractType) || undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">همه</option>
                      <option value={ContractType.RENTAL}>اجاره‌نامه</option>
                      <option value={ContractType.PURCHASE}>مبایعه‌نامه</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">وضعیت</label>
                    <select
                      value={localFilters.status || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, status: (e.target.value as ContractStatus) || undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">همه</option>
                      <option value={ContractStatus.DRAFT}>پیش‌نویس</option>
                      <option value={ContractStatus.SIGNED}>ثبت شده</option>
                      <option value={ContractStatus.EXPIRED}>منقضی شده</option>
                      <option value={ContractStatus.TERMINATED}>فسخ شده</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">سال</label>
                    <input
                      type="number"
                      value={localFilters.year || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, year: e.target.value ? parseInt(e.target.value) : undefined })
                      }
                      placeholder={`${persianYear}`}
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

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab('contracts');
                  archiveHasSearched.current = false;
                  // Reload contracts when switching back from archive tab
                  setCurrentPage(1);
                  dispatch(fetchContractsThunk({ ...filters, page: 1, limit: pageSize }));
                }}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'contracts'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                قراردادها
              </button>
              <button
                onClick={() => {
                  setActiveTab('archive');
                  archiveHasSearched.current = false;
                }}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'archive'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiArchive className="inline ml-2" />
                بایگانی
              </button>
            </div>

            <ErrorDisplay error={error} />

            {activeTab === 'archive' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ قرارداد</label>
                      <PersianDatePicker
                        value={archiveFilters.contractDate || ''}
                        onChange={(value) => setArchiveFilters({ ...archiveFilters, contractDate: value })}
                        placeholder="انتخاب تاریخ"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">شماره قرارداد</label>
                      <input
                        type="text"
                        value={archiveFilters.contractNumber || ''}
                        onChange={(e) => setArchiveFilters({ ...archiveFilters, contractNumber: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="مثال: R-EST-2024-001"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">نام</label>
                      <input
                        type="text"
                        value={archiveFilters.name || ''}
                        onChange={(e) => setArchiveFilters({ ...archiveFilters, name: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="نام یا نام شرکت"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">نام خانوادگی</label>
                      <input
                        type="text"
                        value={archiveFilters.lastname || ''}
                        onChange={(e) => setArchiveFilters({ ...archiveFilters, lastname: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="نام خانوادگی"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleArchiveSearch(true)}
                        disabled={isLoadingArchive}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSearch /> جستجو
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    توجه: حداقل یکی از فیلترها باید وارد شود
                  </div>
                </div>

                {isLoadingArchive ? (
                  <Loading />
                ) : !Array.isArray(archiveContracts) || archiveContracts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                    قراردادی در بایگانی یافت نشد.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <table className="min-w-full text-right text-sm text-gray-800">
                        <thead>
                          <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                            <th className="px-4 py-3">شماره قرارداد</th>
                            <th className="px-4 py-3">نام املاک</th>
                            <th className="px-4 py-3">شناسه یکتای املاک</th>
                            <th className="px-4 py-3">نوع</th>
                            <th className="px-4 py-3">وضعیت</th>
                            <th className="px-4 py-3">تاریخ قرارداد</th>
                            <th className="px-4 py-3">عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(archiveContracts) ? archiveContracts : []).map((contract) => (
                            <tr key={contract.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 font-semibold">{contract.contractNumber}</td>
                              <td className="px-4 py-3">{contract.estate?.establishmentName || '—'}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{(contract.estate as any)?.uniqueId || contract.estate?.guildId || contract.estate?.id || '—'}</td>
                              <td className="px-4 py-3">{getContractTypeLabel(contract.type)}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(contract.status)}`}>
                                  {getStatusLabel(contract.status)}
                                </span>
                              </td>
                              <td className="px-4 py-3">{formatToPersianDate(contract.contractDate)}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                                    className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                                    title="مشاهده جزئیات"
                                  >
                                    <FiEye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {archivePagination && (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            نمایش {((archivePagination.page - 1) * archivePagination.limit) + 1} تا {Math.min(archivePagination.page * archivePagination.limit, archivePagination.total)} از {archivePagination.total} قرارداد
                          </span>
                          <select
                            value={archivePageSize}
                            onChange={(e) => handleArchivePageSizeChange(Number(e.target.value))}
                            className="rounded-xl border border-gray-200 px-3 py-1 text-sm text-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span className="text-xs text-gray-500">در هر صفحه</span>
                        </div>
                        {archivePagination.totalPages > 1 && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleArchivePageChange(archiveCurrentPage - 1)}
                              disabled={!archivePagination.hasPrevious || isLoadingArchive}
                              className={`flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                !archivePagination.hasPrevious || isLoadingArchive
                                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                              }`}
                            >
                              <FiChevronRight className="text-lg" />
                              قبلی
                            </button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, archivePagination.totalPages) }, (_, i) => {
                                let pageNum;
                                if (archivePagination.totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (archiveCurrentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (archiveCurrentPage >= archivePagination.totalPages - 2) {
                                  pageNum = archivePagination.totalPages - 4 + i;
                                } else {
                                  pageNum = archiveCurrentPage - 2 + i;
                                }
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handleArchivePageChange(pageNum)}
                                    disabled={isLoadingArchive}
                                    className={`min-w-[40px] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                      archiveCurrentPage === pageNum
                                        ? 'border-primary-500 bg-primary-600 text-white'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                                    } ${isLoadingArchive ? 'cursor-not-allowed opacity-50' : ''}`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                            </div>
                            <button
                              onClick={() => handleArchivePageChange(archiveCurrentPage + 1)}
                              disabled={!archivePagination.hasNext || isLoadingArchive}
                              className={`flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                !archivePagination.hasNext || isLoadingArchive
                                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                              }`}
                            >
                              بعدی
                              <FiChevronLeft className="text-lg" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (isLoading || isSearching) ? (
              <Loading />
              ) : searchQuery ? (
              !Array.isArray(searchResults) || searchResults.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                  نتیجه‌ای یافت نشد.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <table className="min-w-full text-right text-sm text-gray-800">
                    <thead>
                      <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                        <th className="px-4 py-3">شماره قرارداد</th>
                        <th className="px-4 py-3">نام املاک</th>
                        <th className="px-4 py-3">شناسه یکتای املاک</th>
                        <th className="px-4 py-3">نوع</th>
                        <th className="px-4 py-3">وضعیت</th>
                        <th className="px-4 py-3">تاریخ قرارداد</th>
                        <th className="px-4 py-3">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(searchResults) ? searchResults : []).map((contract) => (
                        <tr key={contract.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{contract.contractNumber}</td>
                          <td className="px-4 py-3">{(contract as any).estate?.establishmentName || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{((contract as any).estate as any)?.uniqueId || (contract as any).estate?.guildId || (contract as any).estate?.id || '—'}</td>
                          <td className="px-4 py-3">{getContractTypeLabel(contract.type)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(contract.status)}`}>
                              {getStatusLabel(contract.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">{formatToPersianDate(contract.contractDate)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                                className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                                title="مشاهده جزئیات"
                              >
                                <FiEye />
                              </button>
                              {(!(currentUser?.role === UserRole.SUPERVISOR && contract.status === ContractStatus.SIGNED)) && (
                                <>
                                  <button
                                    onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
                                    className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                                    title="ویرایش"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteContract(contract.id)}
                                    className="rounded-full border border-red-200 p-2 text-red-600 hover:border-red-300 hover:bg-red-50"
                                    title="حذف"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : !Array.isArray(contracts) || contracts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <FiFileText className="mx-auto mb-4 text-6xl text-gray-300" />
                <p className="text-sm text-gray-500">قراردادی یافت نشد.</p>
                <button
                  onClick={() => router.push('/dashboard/contracts/create')}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  <FiPlus />
                  ثبت قرارداد جدید
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="min-w-full text-right text-sm text-gray-800">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                      <th className="px-4 py-3">شماره قرارداد</th>
                      <th className="px-4 py-3">نام املاک</th>
                      <th className="px-4 py-3">شناسه یکتای املاک</th>
                      <th className="px-4 py-3">نوع</th>
                      <th className="px-4 py-3">وضعیت</th>
                      <th className="px-4 py-3">تاریخ قرارداد</th>
                      <th className="px-4 py-3">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(contracts) ? contracts : []).map((contract) => (
                      <tr key={contract.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold">{contract.contractNumber}</td>
                        <td className="px-4 py-3">{(contract as any).estate?.establishmentName || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{((contract as any).estate as any)?.uniqueId || (contract as any).estate?.guildId || (contract as any).estate?.id || '—'}</td>
                        <td className="px-4 py-3">{getContractTypeLabel(contract.type)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(contract.status)}`}>
                            {getStatusLabel(contract.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatToPersianDate(contract.contractDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                              className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                              title="مشاهده جزئیات"
                            >
                              <FiEye />
                            </button>
                            {(!(currentUser?.role === UserRole.SUPERVISOR && contract.status === ContractStatus.SIGNED)) && (
                              <>
                                <button
                                  onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
                                  className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                                  title="ویرایش"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleDeleteContract(contract.id)}
                                  className="rounded-full border border-red-200 p-2 text-red-600 hover:border-red-300 hover:bg-red-50"
                                  title="حذف"
                                >
                                  <FiTrash2 />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!searchQuery && pagination && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    نمایش {((pagination.page - 1) * pagination.limit) + 1} تا {Math.min(pagination.page * pagination.limit, pagination.total)} از {pagination.total} قرارداد
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
                {pagination.totalPages > 1 && (
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
                )}
              </div>
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


