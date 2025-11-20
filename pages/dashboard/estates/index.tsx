import { useCallback, useEffect, useState } from 'react';
import { FiCheck, FiRefreshCw, FiX, FiUsers } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import Loading from '../../../src/shared/components/common/Loading';
import { useEstates } from '../../../src/domains/estates/hooks/useEstates';
import { EstateStatus, UserRole, User } from '../../../src/shared/types';
import { estatesApi } from '../../../src/domains/estates/api/estatesApi';

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
    pendingEstates,
    approvedEstates,
    isPendingLoading,
    isApprovedLoading,
    pendingEstatesError,
    approvedEstatesError,
    error,
    fetchPendingEstates,
    fetchApprovedEstates,
    approveEstate,
    rejectEstate,
  } = useEstates();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    estateId: string | null;
    estateName: string;
    reason: string;
  }>({
    open: false,
    estateId: null,
    estateName: '',
    reason: '',
  });
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
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

  const refreshPending = useCallback(() => {
    fetchPendingEstates();
  }, [fetchPendingEstates]);

  const refreshApproved = useCallback(() => {
    fetchApprovedEstates();
  }, [fetchApprovedEstates]);

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

  const handleApprove = async (estateId: string) => {
    setApprovingId(estateId);
    try {
      await approveEstate(estateId).unwrap();
      setSnackbar({ open: true, message: 'املاکی با موفقیت تایید شد', severity: 'success' });
      refreshPending();
      refreshApproved();
    } catch (err: any) {
      const message = err?.message || 'خطا در تایید املاکی';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectOpen = (estateId: string, estateName: string) => {
    setRejectDialog({ open: true, estateId, estateName, reason: '' });
  };

  const handleRejectClose = () => {
    setRejectDialog({ open: false, estateId: null, estateName: '', reason: '' });
  };

  const handleRejectSubmit = async () => {
    if (!rejectDialog.estateId) {
      return;
    }
    setRejectSubmitting(true);
    try {
      const reason = rejectDialog.reason.trim() || undefined;
      await rejectEstate(rejectDialog.estateId, reason).unwrap();
      setSnackbar({ open: true, message: 'املاکی با موفقیت رد شد', severity: 'success' });
      refreshPending();
      refreshApproved();
      handleRejectClose();
    } catch (err: any) {
      const message = err?.message || 'خطا در رد املاکی';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setRejectSubmitting(false);
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
            </div>

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
                                onClick={() => handleApprove(estate.id)}
                                disabled={approvingId === estate.id}
                                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-white transition ${
                                  approvingId === estate.id ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'
                                }`}
                              >
                                {approvingId === estate.id ? <Spinner size={18} /> : <FiCheck />}
                                تایید املاکی
                              </button>
                              <button
                                onClick={() => handleRejectOpen(estate.id, estate.establishmentName)}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                              >
                                <FiX /> رد املاکی
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

          {rejectDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-right shadow-2xl">
                <h3 className="text-xl font-semibold text-gray-900">رد درخواست املاکی {rejectDialog.estateName}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  می‌توانید علت رد شدن درخواست را وارد کنید تا برای مدیر املاکی ارسال شود.
                </p>
                <textarea
                  className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  rows={4}
                  value={rejectDialog.reason}
                  onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="مثلاً مدارک آپلود شده ناقص است..."
                />
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleRejectClose}
                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                    disabled={rejectSubmitting}
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    className="flex-1 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    disabled={rejectSubmitting}
                  >
                    {rejectSubmitting ? <Spinner /> : 'ثبت رد املاکی'}
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
                                  user.parent ? (
                                    <div className="text-sm text-gray-700">
                                      {user.parent.firstName} {user.parent.lastName}
                                      <span className="text-xs text-gray-500 block mt-1">
                                        ({getRoleLabel(user.parent.role)})
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-500">والد موجود است</span>
                                  )
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
