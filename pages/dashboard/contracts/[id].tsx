import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { FiArrowRight, FiEdit2, FiDownload } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useContracts } from '../../../src/domains/contracts/hooks/useContracts';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole } from '../../../src/shared/types';
import { ContractType, ContractStatus } from '../../../src/domains/contracts/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import { contractsApi } from '../../../src/domains/contracts/api/contractsApi';
import { downloadPdf } from '../../../src/shared/utils/downloadUtils';

export default function ContractDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { fetchContractById, selectedContract, isLoading, error } = useContracts();
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isDownloading, setIsDownloading] = useState(false);
  const hasFetched = useRef<string | null>(null);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    const contractId = id && typeof id === 'string' ? id : null;
    
    // Only fetch if:
    // 1. We have a valid ID
    // 2. We haven't fetched this ID yet, OR the selectedContract doesn't match the current ID
    if (contractId && (hasFetched.current !== contractId || (selectedContract && selectedContract.id !== contractId))) {
      hasFetched.current = contractId;
      fetchContractById(contractId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id to avoid loops; fetchContractById and selectedContract are intentionally excluded

  const getContractTypeLabel = (type: ContractType): string => {
    return type === ContractType.RENTAL ? 'اجاره‌نامه' : 'مبایعه‌نامه';
  };

  const getStatusLabel = (status: ContractStatus): string => {
    const labels: Record<ContractStatus, string> = {
      [ContractStatus.DRAFT]: 'پیش‌نویس',
      [ContractStatus.SIGNED]: 'امضا شده',
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

  const handleDownloadPdf = async () => {
    if (!contract.id) return;

    setIsDownloading(true);
    try {
      const blob = await contractsApi.downloadContractPdf(contract.id);
      
      // Extract filename from content-disposition header or use default
      const filename = contract.contractNumber 
        ? `contract_${contract.contractNumber}.pdf`
        : `contract_${contract.id}.pdf`;
      
      // Use the download utility that handles both web and Android
      await downloadPdf(blob, filename);
      
      setSnackbar({ open: true, message: 'فایل PDF با موفقیت دانلود شد', severity: 'success' });
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      const errorMessage = err.response?.data?.message || err.message || 'خطا در دانلود فایل PDF';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <PrivateRoute>
        <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
          <DashboardLayout>
            <Loading />
          </DashboardLayout>
        </RoleGuard>
      </PrivateRoute>
    );
  }

  if (error || !selectedContract) {
    return (
      <PrivateRoute>
        <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
          <DashboardLayout>
            <div className="space-y-6 text-right">
              <ErrorDisplay error={error || 'قرارداد یافت نشد'} />
              <button
                onClick={() => router.push('/dashboard/contracts')}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <FiArrowRight />
                بازگشت به لیست قراردادها
              </button>
            </div>
          </DashboardLayout>
        </RoleGuard>
      </PrivateRoute>
    );
  }

  const contract = selectedContract;

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">جزئیات قرارداد</h1>
                <p className="mt-1 text-sm text-gray-500">شماره قرارداد: {contract.contractNumber}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiDownload />
                  {isDownloading ? 'در حال دانلود...' : 'دانلود PDF'}
                </button>
                {contract.status === ContractStatus.DRAFT && (
                  <button
                    onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-200 hover:text-primary-600"
                  >
                    <FiEdit2 />
                    ویرایش
                  </button>
                )}
                <button
                  onClick={() => router.push('/dashboard/contracts')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  <FiArrowRight />
                  بازگشت
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Basic Information */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">اطلاعات پایه</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">نوع قرارداد</label>
                    <p className="mt-1 text-sm text-gray-800">{getContractTypeLabel(contract.type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">وضعیت</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(contract.status)}`}>
                        {getStatusLabel(contract.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">تاریخ قرارداد</label>
                    <p className="mt-1 text-sm text-gray-800">{contract.contractDate || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">تاریخ شروع</label>
                    <p className="mt-1 text-sm text-gray-800">{contract.startDate || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">تاریخ پایان</label>
                    <p className="mt-1 text-sm text-gray-800">{contract.endDate || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">اطلاعات مالی</h2>
                <div className="space-y-4">
                  {contract.type === ContractType.RENTAL ? (
                    <>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">مبلغ اجاره</label>
                        <p className="mt-1 text-sm text-gray-800">
                          {contract.rentalAmount ? `${contract.rentalAmount.toLocaleString('fa-IR')} تومان` : 'تعیین نشده'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">مبلغ ودیعه</label>
                        <p className="mt-1 text-sm text-gray-800">
                          {contract.depositAmount ? `${contract.depositAmount.toLocaleString('fa-IR')} تومان` : 'تعیین نشده'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">مبلغ خرید</label>
                      <p className="mt-1 text-sm text-gray-800">
                        {contract.purchaseAmount ? `${contract.purchaseAmount.toLocaleString('fa-IR')} تومان` : 'تعیین نشده'}
                      </p>
                    </div>
                  )}
                  {!contract.rentalAmount && !contract.depositAmount && !contract.purchaseAmount && (
                    <p className="text-sm text-gray-500 italic">اطلاعات مالی ثبت نشده است</p>
                  )}
                </div>
              </div>

              {/* Parties */}
              {Array.isArray(contract.parties) && contract.parties.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">طرفین قرارداد</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-right text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">نام</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">نوع</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">کد ملی</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">نقش</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contract.parties.map((party: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="px-4 py-3">
                              {party.firstName && party.lastName
                                ? `${party.firstName} ${party.lastName}`
                                : party.companyName || '-'}
                            </td>
                            <td className="px-4 py-3">{party.partyType === 'LANDLORD' ? 'موجر' : 'مستاجر'}</td>
                            <td className="px-4 py-3">{party.nationalId || party.companyNationalId || '-'}</td>
                            <td className="px-4 py-3">{party.partyRole === 'PRINCIPAL' ? 'اصلی' : party.partyRole === 'REPRESENTATIVE' ? 'نماینده' : 'وکیل'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Property Details */}
              {contract.propertyDetails && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">جزئیات ملک</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {contract.propertyDetails.propertyType && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">نوع ملک</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.propertyType}</p>
                      </div>
                    )}
                    {contract.propertyDetails.usageType && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">نوع کاربری</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.usageType}</p>
                      </div>
                    )}
                    {contract.propertyDetails.address && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-600">آدرس</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.address}</p>
                      </div>
                    )}
                    {contract.propertyDetails.area && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">مساحت</label>
                        <p className="mt-1 text-sm text-gray-800">
                          {contract.propertyDetails.area} {contract.propertyDetails.areaUnit || 'متر مربع'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terms */}
              {contract.terms && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">شرایط قرارداد</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {contract.terms.evictionNoticeDays && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">روزهای اخطار تخلیه</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.terms.evictionNoticeDays} روز</p>
                      </div>
                    )}
                    {contract.terms.usagePurpose && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">هدف استفاده</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.terms.usagePurpose}</p>
                      </div>
                    )}
                    {contract.terms.customTerms && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-600">شرایط خاص</label>
                        <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{contract.terms.customTerms}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
      </RoleGuard>
    </PrivateRoute>
  );
}

