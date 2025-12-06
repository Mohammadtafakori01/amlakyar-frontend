import { useCallback, useEffect, useState, useRef } from 'react';
import { FiCheck, FiRefreshCw, FiX, FiUsers, FiEdit2, FiTrash2, FiChevronRight, FiChevronLeft, FiFilter, FiPlus } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import Loading from '../../../src/shared/components/common/Loading';
import { useEstates } from '../../../src/domains/estates/hooks/useEstates';
import { EstateStatus, UserRole, User, UpdateEstateRequest, Estate, CreateEstateByMasterRequest, SetEstateStatusRequest } from '../../../src/shared/types';
import { estatesApi } from '../../../src/domains/estates/api/estatesApi';
import { validatePhoneNumber, validateNationalId, validatePassword, validateGuildId, validateFixedPhone, validateRequiredText } from '../../../src/shared/utils/validation';

const Spinner = ({ size = 16 }: { size?: number }) => (
  <span
    className="inline-block animate-spin rounded-full border-2 border-white border-t-transparent"
    style={{ width: size, height: size }}
  />
);

const statusBadge = (status: EstateStatus) => {
  if (status === EstateStatus.APPROVED) {
    return { label: 'تایید شده', classes: 'bg-green-100 text-green-700 border-green-200' };
  }
  if (status === EstateStatus.REJECTED) {
    return { label: 'رد شده', classes: 'bg-red-100 text-red-700 border-red-200' };
  }
  return { label: 'در انتظار تایید', classes: 'bg-amber-100 text-amber-700 border-amber-200' };
};

export default function EstatesManagementPage() {
  const {
    estates,
    pagination,
    pendingEstates,
    approvedEstates,
    isLoading,
    isPendingLoading,
    isApprovedLoading,
    isUpdating,
    isDeleting,
    isCreating,
    isSettingStatus,
    pendingEstatesError,
    approvedEstatesError,
    error,
    filters,
    fetchEstates,
    fetchPendingEstates,
    fetchApprovedEstates,
    approveEstate,
    rejectEstate,
    updateEstate,
    deleteEstate,
    createEstateByMaster,
    setEstateStatus,
    setFilters,
  } = useEstates();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [membersDialog, setMembersDialog] = useState<{
    open: boolean;
    estateId: string | null;
    estateName: string;
  }>({
    open: false,
    estateId: null,
    estateName: '',
  });
  const [members, setMembers] = useState<User[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<EstateStatus | 'ALL'>('ALL');
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    estate: Estate | null;
    formData: UpdateEstateRequest;
    originalData?: UpdateEstateRequest;
  }>({
    open: false,
    estate: null,
    formData: {},
    originalData: {},
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    estateId: string | null;
    estateName: string;
  }>({
    open: false,
    estateId: null,
    estateName: '',
  });
  const [createDialog, setCreateDialog] = useState<{
    open: boolean;
    formData: CreateEstateByMasterRequest;
  }>({
    open: false,
    formData: {
      guildId: '',
      establishmentName: '',
      fixedPhone: '',
      address: '',
      admin: {
        phoneNumber: '',
        firstName: '',
        lastName: '',
        nationalId: '',
        password: '',
      },
      autoApprove: false,
    },
  });
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    estateId: string | null;
    estateName: string;
    currentStatus: EstateStatus;
    newStatus: EstateStatus;
    reason: string;
  }>({
    open: false,
    estateId: null,
    estateName: '',
    currentStatus: EstateStatus.PENDING,
    newStatus: EstateStatus.APPROVED,
    reason: '',
  });
  const hasFetched = useRef(false);

  const refreshPending = useCallback(() => {
    fetchPendingEstates();
  }, [fetchPendingEstates]);

  const refreshApproved = useCallback(() => {
    fetchApprovedEstates();
  }, [fetchApprovedEstates]);

  // Initial fetch for main estates list
  useEffect(() => {
    if (!hasFetched.current) {
      fetchEstates({ page: 1, limit: pageSize, status: statusFilter !== 'ALL' ? statusFilter : undefined });
      hasFetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch when page, pageSize, or status filter changes
  useEffect(() => {
    if (hasFetched.current) {
      fetchEstates({ page: currentPage, limit: pageSize, status: statusFilter !== 'ALL' ? statusFilter : undefined });
    }
  }, [currentPage, pageSize, statusFilter, fetchEstates]);

  // Sync currentPage with pagination.page from API response
  useEffect(() => {
    if (pagination && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.page]);

  useEffect(() => {
    refreshPending();
    refreshApproved();
  }, [refreshPending, refreshApproved]);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Legacy approve/reject handlers (kept for backward compatibility)
  const handleApprove = async (estateId: string) => {
    setApprovingId(estateId);
    try {
      await setEstateStatus(estateId, { status: EstateStatus.APPROVED }).unwrap();
      setSnackbar({ open: true, message: 'املاکی با موفقیت تایید شد', severity: 'success' });
      fetchEstates({ page: currentPage, limit: pageSize, status: statusFilter !== 'ALL' ? statusFilter : undefined });
      refreshPending();
      refreshApproved();
    } catch (err: any) {
      const message = err?.message || 'خطا در تایید املاکی';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setApprovingId(null);
    }
  };

  const handleStatusChangeOpen = (estate: Estate) => {
    setStatusDialog({
      open: true,
      estateId: estate.id,
      estateName: estate.establishmentName,
      currentStatus: estate.status,
      newStatus: estate.status === EstateStatus.APPROVED ? EstateStatus.REJECTED : EstateStatus.APPROVED,
      reason: '',
    });
  };

  const handleStatusChangeClose = () => {
    setStatusDialog({
      open: false,
      estateId: null,
      estateName: '',
      currentStatus: EstateStatus.PENDING,
      newStatus: EstateStatus.APPROVED,
      reason: '',
    });
  };

  const handleStatusChangeSubmit = async () => {
    if (!statusDialog.estateId) return;
    try {
      const data: SetEstateStatusRequest = {
        status: statusDialog.newStatus,
        reason: statusDialog.reason.trim() || undefined,
      };
      await setEstateStatus(statusDialog.estateId, data).unwrap();
      const statusLabel = statusDialog.newStatus === EstateStatus.APPROVED ? 'تایید' : statusDialog.newStatus === EstateStatus.REJECTED ? 'رد' : 'در انتظار تایید';
      setSnackbar({ open: true, message: `املاکی با موفقیت ${statusLabel} شد`, severity: 'success' });
      fetchEstates({ page: currentPage, limit: pageSize, status: statusFilter !== 'ALL' ? statusFilter : undefined });
      refreshPending();
      refreshApproved();
      handleStatusChangeClose();
    } catch (err: any) {
      const message = err?.message || 'خطا در تغییر وضعیت املاکی';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleCreateOpen = () => {
    setCreateDialog({
      open: true,
      formData: {
        guildId: '',
        establishmentName: '',
        fixedPhone: '',
        address: '',
        admin: {
          phoneNumber: '',
          firstName: '',
          lastName: '',
          nationalId: '',
          password: '',
        },
        autoApprove: false,
      },
    });
  };

  const handleCreateClose = () => {
    setCreateDialog({
      open: false,
      formData: {
        guildId: '',
        establishmentName: '',
        fixedPhone: '',
        address: '',
        admin: {
          phoneNumber: '',
          firstName: '',
          lastName: '',
          nationalId: '',
          password: '',
        },
        autoApprove: false,
      },
    });
  };

  const handleCreateSubmit = async () => {
    const { formData } = createDialog;
    
    // Validation
    if (!validateGuildId(formData.guildId)) {
      setSnackbar({ open: true, message: 'شناسه صنفی باید 6 تا 12 رقم باشد', severity: 'error' });
      return;
    }
    if (!validateRequiredText(formData.establishmentName)) {
      setSnackbar({ open: true, message: 'نام واحد باید حداقل 3 کاراکتر باشد', severity: 'error' });
      return;
    }
    if (!validateFixedPhone(formData.fixedPhone)) {
      setSnackbar({ open: true, message: 'تلفن ثابت باید با 0 شروع شده و 11 رقم باشد', severity: 'error' });
      return;
    }
    if (!validateRequiredText(formData.address)) {
      setSnackbar({ open: true, message: 'آدرس باید حداقل 3 کاراکتر باشد', severity: 'error' });
      return;
    }
    if (!validatePhoneNumber(formData.admin.phoneNumber)) {
      setSnackbar({ open: true, message: 'شماره موبایل مدیر باید با 09 شروع شده و 11 رقم باشد', severity: 'error' });
      return;
    }
    if (!validateRequiredText(formData.admin.firstName)) {
      setSnackbar({ open: true, message: 'نام مدیر باید حداقل 3 کاراکتر باشد', severity: 'error' });
      return;
    }
    if (!validateRequiredText(formData.admin.lastName)) {
      setSnackbar({ open: true, message: 'نام خانوادگی مدیر باید حداقل 3 کاراکتر باشد', severity: 'error' });
      return;
    }
    if (!validateNationalId(formData.admin.nationalId)) {
      setSnackbar({ open: true, message: 'کد ملی باید 10 رقم باشد', severity: 'error' });
      return;
    }
    if (!validatePassword(formData.admin.password)) {
      setSnackbar({ open: true, message: 'رمز عبور باید حداقل 6 کاراکتر باشد', severity: 'error' });
      return;
    }

    try {
      await createEstateByMaster(formData).unwrap();
      setSnackbar({ open: true, message: 'املاکی با موفقیت ایجاد شد', severity: 'success' });
      fetchEstates({ page: 1, limit: pageSize, status: statusFilter !== 'ALL' ? statusFilter : undefined });
      setCurrentPage(1);
      refreshPending();
      refreshApproved();
      handleCreateClose();
    } catch (err: any) {
      const message = err?.message || 'خطا در ایجاد املاکی';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleMembersOpen = async (estateId: string, estateName: string) => {
    setMembersDialog({ open: true, estateId, estateName });
    setMembersLoading(true);
    setMembersError(null);
    try {
      const estateMembers = await estatesApi.getEstateMembers(estateId);
      setMembers(estateMembers);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'خطا در دریافت لیست اعضا';
      setMembersError(message);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleMembersClose = () => {
    setMembersDialog({ open: false, estateId: null, estateName: '' });
    setMembers([]);
    setMembersError(null);
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.CUSTOMER]: 'مشتری',
      [UserRole.CONSULTANT]: 'مشاور',
      [UserRole.SECRETARY]: 'منشی',
      [UserRole.SUPERVISOR]: 'ناظر',
      [UserRole.ADMIN]: 'مدیر',
      [UserRole.MASTER]: 'مستر',
    };
    return labels[role] || role;
  };

  const handleEditOpen = (estate: Estate) => {
    const formData = {
      establishmentName: estate.establishmentName,
      address: estate.address,
      guildId: estate.guildId,
      fixedPhone: estate.fixedPhone,
    };
    setEditDialog({
      open: true,
      estate,
      formData,
      originalData: formData, // Store original data for comparison
    });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, estate: null, formData: {}, originalData: {} });
  };

  const handleEditSubmit = async () => {
    if (!editDialog.estate || !editDialog.originalData) return;
    try {
      // Get only changed fields
      const changedFields = getChangedFields(editDialog.originalData, editDialog.formData);
      
      // If no fields changed, show message and return
      if (Object.keys(changedFields).length === 0) {
        setSnackbar({ open: true, message: 'هیچ تغییری اعمال نشده است', severity: 'error' });
        return;
      }
      
      await updateEstate(editDialog.estate.id, changedFields).unwrap();
      setSnackbar({ open: true, message: 'املاکی با موفقیت به‌روزرسانی شد', severity: 'success' });
      fetchEstates({ page: currentPage, limit: pageSize, status: statusFilter !== 'ALL' ? statusFilter : undefined });
      refreshPending();
      refreshApproved();
      handleEditClose();
    } catch (err: any) {
      const message = err?.message || 'خطا در به‌روزرسانی املاکی';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleDeleteOpen = (estateId: string, estateName: string) => {
    setDeleteDialog({ open: true, estateId, estateName });
  };

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, estateId: null, estateName: '' });
  };

  const handleDeleteSubmit = async () => {
    if (!deleteDialog.estateId) return;
    try {
      await deleteEstate(deleteDialog.estateId).unwrap();
      setSnackbar({ open: true, message: 'املاکی با موفقیت حذف شد', severity: 'success' });
      fetchEstates({ page: currentPage, limit: pageSize, status: statusFilter !== 'ALL' ? statusFilter : undefined });
      refreshPending();
      refreshApproved();
      handleDeleteClose();
    } catch (err: any) {
      const message = err?.message || 'خطا در حذف املاکی';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleStatusFilterChange = (status: EstateStatus | 'ALL') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const InfoCard = ({ title, value, description }: { title: string; value: number; description: string }) => (
    <div className="flex-1 rounded-2xl border border-gray-100 bg-white px-6 py-4 text-right shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );

  const TableWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">{children}</div>
  );

  const tableHeadClass = 'px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-50';
  const tableCellClass = 'px-4 py-3 text-sm text-gray-700 border-t border-gray-100';

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.MASTER]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مدیریت املاکی‌ها</h1>
              <div className="mt-3 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
                پس از تایید هر املاکی، مدیر آن فعال می‌شود و پیامک خوشامد ارسال می‌گردد.
              </div>
            </div>

            <ErrorDisplay error={error} />

            <div className="flex flex-col gap-3 md:flex-row">
              <InfoCard title="در انتظار تایید" value={pendingEstates.length} description="درخواست‌های جدید" />
              <InfoCard title="تایید شده" value={approvedEstates.length} description="املاکی‌های فعال" />
              <InfoCard title="کل املاکی‌ها" value={pagination?.total || 0} description="مجموع" />
            </div>

            {/* Main CRUD Section */}
            <section className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">لیست املاکی‌ها</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCreateOpen}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <FiPlus /> ایجاد املاکی جدید
                  </button>
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
                    <FiFilter className="text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => handleStatusFilterChange(e.target.value as EstateStatus | 'ALL')}
                      className="border-0 bg-transparent text-sm font-semibold text-gray-700 focus:outline-none"
                    >
                      <option value="ALL">همه وضعیت‌ها</option>
                      <option value={EstateStatus.PENDING}>در انتظار تایید</option>
                      <option value={EstateStatus.APPROVED}>تایید شده</option>
                      <option value={EstateStatus.REJECTED}>رد شده</option>
                    </select>
                  </div>
                  <button
                    onClick={() => fetchEstates({ page: currentPage, limit: pageSize, status: statusFilter !== 'ALL' ? statusFilter : undefined })}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                  >
                    <FiRefreshCw /> به‌روزرسانی
                  </button>
                </div>
              </div>

              {isLoading ? (
                <Loading />
              ) : estates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                  املاکی یافت نشد.
                </div>
              ) : (
                <>
                  <TableWrapper>
                    <table className="min-w-full text-right">
                      <thead>
                        <tr>
                          <th className={tableHeadClass}>نام واحد</th>
                          <th className={tableHeadClass}>شناسه صنفی</th>
                          <th className={tableHeadClass}>آدرس</th>
                          <th className={tableHeadClass}>تلفن ثابت</th>
                          <th className={tableHeadClass}>مدیر</th>
                          <th className={tableHeadClass}>وضعیت</th>
                          <th className={tableHeadClass}>عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estates.map((estate) => {
                          const { label, classes } = statusBadge(estate.status);
                          return (
                            <tr key={estate.id} className="hover:bg-gray-50">
                              <td className={tableCellClass}>{estate.establishmentName}</td>
                              <td className={tableCellClass}>{estate.guildId}</td>
                              <td className={tableCellClass}>{estate.address}</td>
                              <td className={tableCellClass}>{estate.fixedPhone}</td>
                              <td className={tableCellClass}>
                                {estate.admin ? `${estate.admin.firstName} ${estate.admin.lastName}` : '—'}
                              </td>
                              <td className={tableCellClass}>
                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
                                  {label}
                                </span>
                              </td>
                              <td className={`${tableCellClass} min-w-[200px]`}>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleEditOpen(estate)}
                                    disabled={isUpdating}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-200 px-3 py-2 text-sm font-semibold text-primary-600 transition hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50"
                                  >
                                    <FiEdit2 /> ویرایش
                                  </button>
                                  <button
                                    onClick={() => handleStatusChangeOpen(estate)}
                                    disabled={isSettingStatus}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50"
                                  >
                                    <FiCheck /> تغییر وضعیت
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOpen(estate.id, estate.establishmentName)}
                                    disabled={isDeleting}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <FiTrash2 /> حذف
                                  </button>
                                  <button
                                    onClick={() => handleMembersOpen(estate.id, estate.establishmentName)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                                  >
                                    <FiUsers /> اعضا
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </TableWrapper>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-gray-600">
                        نمایش {((currentPage - 1) * pageSize) + 1} تا {Math.min(currentPage * pageSize, pagination.total)} از {pagination.total} املاکی
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 focus:border-primary-500 focus:outline-none"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={!pagination.hasPrevious}
                          className="rounded-2xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-primary-200 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronRight />
                        </button>
                        <span className="text-sm font-semibold text-gray-700">
                          صفحه {currentPage} از {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                          disabled={!pagination.hasNext}
                          className="rounded-2xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-primary-200 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronLeft />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">درخواست‌های املاکی در انتظار تایید</h2>
                <div className="flex gap-2">
                  <button
                    onClick={refreshPending}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                  >
                    <FiRefreshCw /> به‌روزرسانی
                  </button>
                </div>
              </div>

              <ErrorDisplay error={pendingEstatesError} />

              {isPendingLoading ? (
                <Loading />
              ) : pendingEstates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                  درخواستی یافت نشد.
                </div>
              ) : (
                <TableWrapper>
                  <table className="min-w-full text-right">
                    <thead>
                      <tr>
                        <th className={tableHeadClass}>نام واحد</th>
                        <th className={tableHeadClass}>شناسه صنفی</th>
                        <th className={tableHeadClass}>مدیر</th>
                        <th className={tableHeadClass}>شماره مدیر</th>
                        <th className={tableHeadClass}>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingEstates.map((estate) => (
                        <tr key={estate.id} className="hover:bg-gray-50">
                          <td className={tableCellClass}>{estate.establishmentName}</td>
                          <td className={tableCellClass}>{estate.guildId}</td>
                          <td className={tableCellClass}>
                            {estate.admin ? `${estate.admin.firstName} ${estate.admin.lastName}` : '—'}
                          </td>
                          <td className={tableCellClass}>{estate.admin?.phoneNumber || '—'}</td>
                          <td className={`${tableCellClass} min-w-[200px]`}>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleStatusChangeOpen(estate)}
                                disabled={isSettingStatus}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50"
                              >
                                <FiCheck /> تغییر وضعیت
                              </button>
                              <button
                                onClick={() => handleMembersOpen(estate.id, estate.establishmentName)}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary-200 px-3 py-2 text-sm font-semibold text-primary-600 transition hover:border-primary-300 hover:bg-primary-50"
                              >
                                <FiUsers /> اعضا
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrapper>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">املاکی‌های تایید شده</h2>
                <button
                  onClick={refreshApproved}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                >
                  <FiRefreshCw /> به‌روزرسانی
                </button>
              </div>

              <ErrorDisplay error={approvedEstatesError} />

              {isApprovedLoading ? (
                <Loading />
              ) : approvedEstates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                  املاکی تایید شده وجود ندارد.
                </div>
              ) : (
                <TableWrapper>
                  <table className="min-w-full text-right">
                    <thead>
                      <tr>
                        <th className={tableHeadClass}>نام واحد</th>
                        <th className={tableHeadClass}>شناسه صنفی</th>
                        <th className={tableHeadClass}>مدیر</th>
                        <th className={tableHeadClass}>شماره مدیر</th>
                        <th className={tableHeadClass}>وضعیت</th>
                        <th className={tableHeadClass}>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedEstates.map((estate) => {
                        const { label, classes } = statusBadge(estate.status);
                        return (
                          <tr key={estate.id} className="hover:bg-gray-50">
                            <td className={tableCellClass}>{estate.establishmentName}</td>
                            <td className={tableCellClass}>{estate.guildId}</td>
                            <td className={tableCellClass}>
                              {estate.admin ? `${estate.admin.firstName} ${estate.admin.lastName}` : '—'}
                            </td>
                            <td className={tableCellClass}>{estate.admin?.phoneNumber || '—'}</td>
                            <td className={tableCellClass}>
                              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
                                {label}
                              </span>
                            </td>
                            <td className={tableCellClass}>
                              <button
                                onClick={() => handleMembersOpen(estate.id, estate.establishmentName)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-200 px-3 py-2 text-sm font-semibold text-primary-600 transition hover:border-primary-300 hover:bg-primary-50"
                              >
                                <FiUsers /> اعضا
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableWrapper>
              )}
            </section>
          </div>

          {/* Create Estate Dialog */}
          {createDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 overflow-y-auto py-8">
              <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-right shadow-2xl my-auto">
                <h3 className="text-xl font-semibold text-gray-900">ایجاد املاکی جدید</h3>
                <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">شناسه صنفی *</label>
                    <input
                      type="text"
                      value={createDialog.formData.guildId}
                      onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, guildId: e.target.value } }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">نام واحد *</label>
                    <input
                      type="text"
                      value={createDialog.formData.establishmentName}
                      onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, establishmentName: e.target.value } }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="دفتر املاک جدید"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">تلفن ثابت *</label>
                    <input
                      type="text"
                      value={createDialog.formData.fixedPhone}
                      onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, fixedPhone: e.target.value } }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="02112345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">آدرس *</label>
                    <textarea
                      value={createDialog.formData.address}
                      onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, address: e.target.value } }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      rows={3}
                      placeholder="تهران، خیابان ولیعصر"
                    />
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">اطلاعات مدیر</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">شماره موبایل *</label>
                        <input
                          type="text"
                          value={createDialog.formData.admin.phoneNumber}
                          onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, admin: { ...prev.formData.admin, phoneNumber: e.target.value } } }))}
                          className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          placeholder="09123456789"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">نام *</label>
                          <input
                            type="text"
                            value={createDialog.formData.admin.firstName}
                            onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, admin: { ...prev.formData.admin, firstName: e.target.value } } }))}
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            placeholder="علی"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">نام خانوادگی *</label>
                          <input
                            type="text"
                            value={createDialog.formData.admin.lastName}
                            onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, admin: { ...prev.formData.admin, lastName: e.target.value } } }))}
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            placeholder="احمدی"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">کد ملی *</label>
                        <input
                          type="text"
                          value={createDialog.formData.admin.nationalId}
                          onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, admin: { ...prev.formData.admin, nationalId: e.target.value } } }))}
                          className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          placeholder="1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">رمز عبور *</label>
                        <input
                          type="password"
                          value={createDialog.formData.admin.password}
                          onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, admin: { ...prev.formData.admin, password: e.target.value } } }))}
                          className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          placeholder="حداقل 6 کاراکتر"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoApprove"
                      checked={createDialog.formData.autoApprove}
                      onChange={(e) => setCreateDialog((prev) => ({ ...prev, formData: { ...prev.formData, autoApprove: e.target.checked } }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="autoApprove" className="text-sm font-semibold text-gray-700">
                      تایید خودکار املاکی و مدیر
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleCreateClose}
                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                    disabled={isCreating}
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleCreateSubmit}
                    className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
                    disabled={isCreating}
                  >
                    {isCreating ? <Spinner /> : 'ایجاد املاکی'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Change Dialog */}
          {statusDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-right shadow-2xl">
                <h3 className="text-xl font-semibold text-gray-900">تغییر وضعیت املاکی: {statusDialog.estateName}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  وضعیت فعلی: <span className="font-semibold">{statusBadge(statusDialog.currentStatus).label}</span>
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">وضعیت جدید *</label>
                  <select
                    value={statusDialog.newStatus}
                    onChange={(e) => setStatusDialog((prev) => ({ ...prev, newStatus: e.target.value as EstateStatus }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value={EstateStatus.PENDING}>در انتظار تایید</option>
                    <option value={EstateStatus.APPROVED}>تایید شده</option>
                    <option value={EstateStatus.REJECTED}>رد شده</option>
                  </select>
                </div>
                {statusDialog.newStatus === EstateStatus.REJECTED && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">علت رد (اختیاری)</label>
                    <textarea
                      value={statusDialog.reason}
                      onChange={(e) => setStatusDialog((prev) => ({ ...prev, reason: e.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      rows={3}
                      placeholder="مثلاً مدارک ناقص است..."
                    />
                  </div>
                )}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleStatusChangeClose}
                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                    disabled={isSettingStatus}
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleStatusChangeSubmit}
                    className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                      statusDialog.newStatus === EstateStatus.APPROVED
                        ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                        : statusDialog.newStatus === EstateStatus.REJECTED
                        ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                        : 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300'
                    }`}
                    disabled={isSettingStatus}
                  >
                    {isSettingStatus ? <Spinner /> : `تغییر به ${statusBadge(statusDialog.newStatus).label}`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {membersDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
              <div className="w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white shadow-2xl flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      اعضای املاکی: {membersDialog.estateName}
                    </h3>
                    <button
                      onClick={handleMembersClose}
                      className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  {membersLoading ? (
                    <Loading />
                  ) : membersError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-sm text-red-800">
                      {membersError}
                    </div>
                  ) : members.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                      عضوی یافت نشد.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <table className="min-w-full text-right text-sm text-gray-800">
                        <thead>
                          <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                            <th className="px-4 py-3">نام</th>
                            <th className="px-4 py-3">شماره موبایل</th>
                            <th className="px-4 py-3">کد ملی</th>
                            <th className="px-4 py-3">نقش</th>
                            <th className="px-4 py-3">وضعیت</th>
                            <th className="px-4 py-3">تایید شده</th>
                            <th className="px-4 py-3">املاک</th>
                            <th className="px-4 py-3">والد</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((user) => (
                            <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                              <td className="px-4 py-3">{user.phoneNumber}</td>
                              <td className="px-4 py-3">{user.nationalId}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                                  {getRoleLabel(user.role)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                    user.isActive
                                      ? 'border-green-200 bg-green-50 text-green-700'
                                      : 'border-gray-200 bg-gray-50 text-gray-500'
                                  }`}
                                >
                                  {user.isActive ? 'فعال' : 'غیرفعال'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                    user.isApproved
                                      ? 'border-green-200 bg-green-50 text-green-700'
                                      : 'border-amber-200 bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {user.isApproved ? 'بله' : 'خیر'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {user.estateId ? (
                                  user.estate ? (
                                    <div className="text-sm text-gray-700">{user.estate.establishmentName}</div>
                                  ) : (
                                    <span className="text-xs text-gray-500">املاک موجود است</span>
                                  )
                                ) : (
                                  <span className="text-xs text-red-600 font-semibold">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {user.parentId ? (
                                  <span className="text-xs text-gray-500">والد موجود است (ID: {user.parentId})</span>
                                ) : (
                                  <span className="text-xs text-red-600 font-semibold">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit Dialog */}
          {editDialog.open && editDialog.estate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-right shadow-2xl">
                <h3 className="text-xl font-semibold text-gray-900">ویرایش املاکی: {editDialog.estate.establishmentName}</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">نام واحد</label>
                    <input
                      type="text"
                      value={editDialog.formData.establishmentName || ''}
                      onChange={(e) => setEditDialog((prev) => ({ ...prev, formData: { ...prev.formData, establishmentName: e.target.value } }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="نام واحد"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">شناسه صنفی</label>
                    <input
                      type="text"
                      value={editDialog.formData.guildId || ''}
                      onChange={(e) => setEditDialog((prev) => ({ ...prev, formData: { ...prev.formData, guildId: e.target.value } }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="شناسه صنفی"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">آدرس</label>
                    <textarea
                      value={editDialog.formData.address || ''}
                      onChange={(e) => setEditDialog((prev) => ({ ...prev, formData: { ...prev.formData, address: e.target.value } }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      rows={3}
                      placeholder="آدرس"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">تلفن ثابت</label>
                    <input
                      type="text"
                      value={editDialog.formData.fixedPhone || ''}
                      onChange={(e) => setEditDialog((prev) => ({ ...prev, formData: { ...prev.formData, fixedPhone: e.target.value } }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="تلفن ثابت"
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleEditClose}
                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                    disabled={isUpdating}
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Spinner /> : 'ذخیره تغییرات'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {deleteDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-right shadow-2xl">
                <h3 className="text-xl font-semibold text-gray-900">حذف املاکی</h3>
                <p className="mt-2 text-sm text-gray-500">
                  آیا از حذف املاکی <strong>{deleteDialog.estateName}</strong> اطمینان دارید؟
                </p>
                <p className="mt-2 text-xs text-red-600">
                  توجه: در صورت وجود اعضای فعال، حذف امکان‌پذیر نیست.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleDeleteClose}
                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                    disabled={isDeleting}
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleDeleteSubmit}
                    className="flex-1 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Spinner /> : 'حذف'}
                  </button>
                </div>
              </div>
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
        </DashboardLayout>
      </RoleGuard>
    </PrivateRoute>
  );
}
