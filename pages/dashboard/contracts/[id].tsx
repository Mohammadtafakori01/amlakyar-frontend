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
import { formatToPersianDate } from '../../../src/shared/utils/dateUtils';
import { formatPrice } from '../../../src/shared/utils/numberUtils';

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
                <button
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-200 hover:text-primary-600"
                >
                  <FiEdit2 />
                  ویرایش
                </button>
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
                    <p className="mt-1 text-sm text-gray-800">{contract.contractDate ? formatToPersianDate(contract.contractDate) : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">تاریخ شروع</label>
                    <p className="mt-1 text-sm text-gray-800">{contract.startDate ? formatToPersianDate(contract.startDate) : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">تاریخ پایان</label>
                    <p className="mt-1 text-sm text-gray-800">{contract.endDate ? formatToPersianDate(contract.endDate) : '-'}</p>
                  </div>
                  {contract.registrationArea && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">حوزه ثبتی</label>
                      <p className="mt-1 text-sm text-gray-800">{contract.registrationArea}</p>
                    </div>
                  )}
                  {contract.witness1Name && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">شاهد اول</label>
                      <p className="mt-1 text-sm text-gray-800">{contract.witness1Name}</p>
                    </div>
                  )}
                  {contract.witness2Name && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">شاهد دوم</label>
                      <p className="mt-1 text-sm text-gray-800">{contract.witness2Name}</p>
                    </div>
                  )}
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
                          {contract.rentalAmount ? `${formatPrice(contract.rentalAmount)} ریال` : 'تعیین نشده'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">مبلغ ودیعه</label>
                        <p className="mt-1 text-sm text-gray-800">
                          {contract.depositAmount ? `${formatPrice(contract.depositAmount)} ریال` : 'تعیین نشده'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">مبلغ خرید</label>
                      <p className="mt-1 text-sm text-gray-800">
                        {contract.purchaseAmount ? `${formatPrice(contract.purchaseAmount)} ریال` : 'تعیین نشده'}
                      </p>
                    </div>
                  )}
                  {!contract.rentalAmount && !contract.depositAmount && !contract.purchaseAmount && (
                    <p className="text-sm text-gray-500 italic">اطلاعات مالی ثبت نشده است</p>
                  )}
                </div>
              </div>

              {/* Estate Information */}
              {contract.estate && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">اطلاعات املاک</h2>
                  <div className="space-y-4">
                    {contract.estate.establishmentName && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">نام موسسه</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.estate.establishmentName}</p>
                      </div>
                    )}
                    {contract.estate.guildId && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شماره نظام صنفی</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.estate.guildId}</p>
                      </div>
                    )}
                    {contract.estate.fixedPhone && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">تلفن ثابت</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.estate.fixedPhone}</p>
                      </div>
                    )}
                    {contract.estate.address && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">آدرس</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.estate.address}</p>
                      </div>
                    )}
                    {contract.estate.status && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">وضعیت</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.estate.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Created By Information */}
              {contract.createdBy && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">ایجاد کننده</h2>
                  <div className="space-y-4">
                    {contract.createdBy.firstName && contract.createdBy.lastName && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">نام و نام خانوادگی</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.createdBy.firstName} {contract.createdBy.lastName}</p>
                      </div>
                    )}
                    {contract.createdBy.phoneNumber && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شماره تماس</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.createdBy.phoneNumber}</p>
                      </div>
                    )}
                    {contract.createdBy.nationalId && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">کد ملی</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.createdBy.nationalId}</p>
                      </div>
                    )}
                    {contract.createdBy.role && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">نقش</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.createdBy.role}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Parties */}
              {Array.isArray(contract.parties) && contract.parties.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">طرفین قرارداد</h2>
                  <div className="space-y-4">
                    {contract.parties.map((party: any, index: number) => (
                      <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between border-b border-gray-300 pb-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {party.firstName && party.lastName
                              ? `${party.firstName} ${party.lastName}`
                              : party.companyName || `طرف قرارداد ${index + 1}`}
                          </h3>
                          <div className="flex gap-2">
                            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                              {party.partyType === 'LANDLORD' ? 'موجر' : 'مستاجر'}
                            </span>
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                              {party.partyRole === 'PRINCIPAL' ? 'اصلی' : party.partyRole === 'REPRESENTATIVE' ? 'نماینده' : 'وکیل'}
                            </span>
                            {party.entityType && (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                {party.entityType === 'NATURAL' ? 'حقیقی' : 'حقوقی'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {party.entityType === 'NATURAL' ? (
                            <>
                              {party.firstName && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">نام</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.firstName}</p>
                                </div>
                              )}
                              {party.lastName && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">نام خانوادگی</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.lastName}</p>
                                </div>
                              )}
                              {party.nationalId && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">کد ملی</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.nationalId}</p>
                                </div>
                              )}
                              {party.idCardNumber && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">شماره شناسنامه</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.idCardNumber}</p>
                                </div>
                              )}
                              {party.childOf && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">نام پدر</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.childOf}</p>
                                </div>
                              )}
                              {party.birthDate && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">تاریخ تولد</label>
                                  <p className="mt-1 text-sm text-gray-800">{formatToPersianDate(party.birthDate)}</p>
                                </div>
                              )}
                              {party.issuedFrom && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">محل صدور</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.issuedFrom}</p>
                                </div>
                              )}
                              {party.phone && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">شماره تماس</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.phone}</p>
                                </div>
                              )}
                              {party.postalCode && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">کد پستی</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.postalCode}</p>
                                </div>
                              )}
                              {party.address && (
                                <div className="md:col-span-2 lg:col-span-3">
                                  <label className="text-xs font-semibold text-gray-600">آدرس</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.address}</p>
                                </div>
                              )}
                              {party.resident && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">ساکن</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.resident}</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {party.companyName && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">نام شرکت</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.companyName}</p>
                                </div>
                              )}
                              {party.companyNationalId && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">شناسه ملی شرکت</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.companyNationalId}</p>
                                </div>
                              )}
                              {party.registrationNumber && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">شماره ثبت</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.registrationNumber}</p>
                                </div>
                              )}
                              {party.officialGazette && (
                                <div className="md:col-span-2 lg:col-span-3">
                                  <label className="text-xs font-semibold text-gray-600">روزنامه رسمی</label>
                                  <p className="mt-1 text-sm text-gray-800">{party.officialGazette}</p>
                                </div>
                              )}
                            </>
                          )}
                          {party.shareType && party.shareValue !== undefined && (
                            <div>
                              <label className="text-xs font-semibold text-gray-600">سهم</label>
                              <p className="mt-1 text-sm text-gray-800">
                                {party.shareValue} {party.shareType === 'DANG' ? 'دانگ' : 'درصد'}
                              </p>
                            </div>
                          )}
                          {party.partyRole !== 'PRINCIPAL' && party.principalParty && (
                            <div className="md:col-span-2 lg:col-span-3">
                              <label className="text-xs font-semibold text-gray-600">طرف اصیل</label>
                              <p className="mt-1 text-sm text-gray-800">
                                {party.principalParty.firstName && party.principalParty.lastName
                                  ? `${party.principalParty.firstName} ${party.principalParty.lastName}`
                                  : party.principalParty.companyName || '-'}
                              </p>
                            </div>
                          )}
                          {party.relationshipType && (
                            <div>
                              <label className="text-xs font-semibold text-gray-600">نوع رابطه</label>
                              <p className="mt-1 text-sm text-gray-800">
                                {party.relationshipType === 'ATTORNEY' ? 'وکالت' :
                                 party.relationshipType === 'MANAGEMENT' ? 'مدیریت' :
                                 party.relationshipType === 'GUARDIAN' ? 'ولی' : 'سایر'}
                              </p>
                            </div>
                          )}
                          {party.relationshipDocumentNumber && (
                            <div>
                              <label className="text-xs font-semibold text-gray-600">شماره مدرک رابطه</label>
                              <p className="mt-1 text-sm text-gray-800">{party.relationshipDocumentNumber}</p>
                            </div>
                          )}
                          {party.relationshipDocumentDate && (
                            <div>
                              <label className="text-xs font-semibold text-gray-600">تاریخ مدرک رابطه</label>
                              <p className="mt-1 text-sm text-gray-800">{formatToPersianDate(party.relationshipDocumentDate)}</p>
                            </div>
                          )}
                          {party.authorityType && (
                            <div>
                              <label className="text-xs font-semibold text-gray-600">نوع اختیار</label>
                              <p className="mt-1 text-sm text-gray-800">{party.authorityType}</p>
                            </div>
                          )}
                          {party.authorityDocumentNumber && (
                            <div>
                              <label className="text-xs font-semibold text-gray-600">شماره مدرک اختیار</label>
                              <p className="mt-1 text-sm text-gray-800">{party.authorityDocumentNumber}</p>
                            </div>
                          )}
                          {party.authorityDocumentDate && (
                            <div>
                              <label className="text-xs font-semibold text-gray-600">تاریخ مدرک اختیار</label>
                              <p className="mt-1 text-sm text-gray-800">{formatToPersianDate(party.authorityDocumentDate)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Details */}
              {contract.propertyDetails && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">جزئیات ملک</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-semibold text-gray-600">آدرس</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.address}</p>
                      </div>
                    )}
                    {contract.propertyDetails.postalCode && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">کد پستی</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.postalCode}</p>
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
                    {contract.propertyDetails.registrationNumber && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شماره ثبت</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.registrationNumber}</p>
                      </div>
                    )}
                    {contract.propertyDetails.subRegistrationNumber && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شماره ثبت فرعی</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.subRegistrationNumber}</p>
                      </div>
                    )}
                    {contract.propertyDetails.mainRegistrationNumber && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شماره ثبت اصلی</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.mainRegistrationNumber}</p>
                      </div>
                    )}
                    {contract.propertyDetails.section && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">بخش</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.section}</p>
                      </div>
                    )}
                    {contract.propertyDetails.ownershipDocumentType && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">نوع سند مالکیت</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.ownershipDocumentType}</p>
                      </div>
                    )}
                    {contract.propertyDetails.ownershipDocumentSerial && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">سریال سند مالکیت</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.ownershipDocumentSerial}</p>
                      </div>
                    )}
                    {contract.propertyDetails.ownershipDocumentOwner && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">مالک سند</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.ownershipDocumentOwner}</p>
                      </div>
                    )}
                    {contract.propertyDetails.ownershipDocumentPage && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">صفحه سند</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.ownershipDocumentPage}</p>
                      </div>
                    )}
                    {contract.propertyDetails.ownershipDocumentBook && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">دفتر سند</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.ownershipDocumentBook}</p>
                      </div>
                    )}
                    {contract.propertyDetails.propertyShareType && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">نوع سهم</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.propertyShareType}</p>
                      </div>
                    )}
                    {contract.propertyDetails.uniqueDocumentId && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شناسه یکتای سند</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.uniqueDocumentId}</p>
                      </div>
                    )}
                    {contract.propertyDetails.storageCount !== undefined && contract.propertyDetails.storageCount !== null && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">تعداد انباری</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.storageCount}</p>
                      </div>
                    )}
                    {contract.propertyDetails.storageNumbers && contract.propertyDetails.storageNumbers.length > 0 && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شماره انباری‌ها</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.storageNumbers.join(', ')}</p>
                      </div>
                    )}
                    {contract.propertyDetails.parkingCount !== undefined && contract.propertyDetails.parkingCount !== null && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">تعداد پارکینگ</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.parkingCount}</p>
                      </div>
                    )}
                    {contract.propertyDetails.parkingNumbers && contract.propertyDetails.parkingNumbers.length > 0 && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شماره پارکینگ‌ها</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.parkingNumbers.join(', ')}</p>
                      </div>
                    )}
                    {contract.propertyDetails.bedroomCount !== undefined && contract.propertyDetails.bedroomCount !== null && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">تعداد اتاق خواب</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.bedroomCount}</p>
                      </div>
                    )}
                    {contract.propertyDetails.bedroomArea && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">مساحت اتاق خواب</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.bedroomArea} متر مربع</p>
                      </div>
                    )}
                    {contract.propertyDetails.heatingStatus && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">وضعیت شوفاژ</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.heatingStatus}</p>
                      </div>
                    )}
                    {contract.propertyDetails.coolerType && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">نوع کولر</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.coolerType}</p>
                      </div>
                    )}
                    {contract.propertyDetails.phoneNumber && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">شماره تلفن</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.phoneNumber}</p>
                      </div>
                    )}
                    {contract.propertyDetails.phoneStatus && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">وضعیت تلفن</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.phoneStatus}</p>
                      </div>
                    )}
                    {contract.propertyDetails.utilityType && (
                      <>
                        {contract.propertyDetails.utilityType.electricity && (
                          <div>
                            <label className="text-sm font-semibold text-gray-600">برق</label>
                            <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.utilityType.electricity}</p>
                          </div>
                        )}
                        {contract.propertyDetails.utilityType.water && (
                          <div>
                            <label className="text-sm font-semibold text-gray-600">آب</label>
                            <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.utilityType.water}</p>
                          </div>
                        )}
                        {contract.propertyDetails.utilityType.gas && (
                          <div>
                            <label className="text-sm font-semibold text-gray-600">گاز</label>
                            <p className="mt-1 text-sm text-gray-800">{contract.propertyDetails.utilityType.gas}</p>
                          </div>
                        )}
                      </>
                    )}
                    {contract.propertyDetails.amenities && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">امکانات</label>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                          {contract.propertyDetails.amenities.flooring && (
                            <div className="rounded-lg bg-gray-50 p-2">
                              <span className="text-xs font-semibold text-gray-600">کفپوش:</span>
                              <span className="mr-1 text-xs text-gray-800">{contract.propertyDetails.amenities.flooring}</span>
                            </div>
                          )}
                          {contract.propertyDetails.amenities.bathroom && (
                            <div className="rounded-lg bg-gray-50 p-2">
                              <span className="text-xs font-semibold text-gray-600">سرویس بهداشتی:</span>
                              <span className="mr-1 text-xs text-gray-800">{contract.propertyDetails.amenities.bathroom}</span>
                            </div>
                          )}
                          {contract.propertyDetails.amenities.hood !== undefined && (
                            <div className="rounded-lg bg-gray-50 p-2">
                              <span className="text-xs font-semibold text-gray-600">هود:</span>
                              <span className="mr-1 text-xs text-gray-800">{contract.propertyDetails.amenities.hood ? 'دارد' : 'ندارد'}</span>
                            </div>
                          )}
                          {contract.propertyDetails.amenities.videoIntercom !== undefined && (
                            <div className="rounded-lg bg-gray-50 p-2">
                              <span className="text-xs font-semibold text-gray-600">اینترکام تصویری:</span>
                              <span className="mr-1 text-xs text-gray-800">{contract.propertyDetails.amenities.videoIntercom ? 'دارد' : 'ندارد'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terms */}
              {contract.terms && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">شرایط قرارداد</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contract.terms.usagePurpose && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">کاربری</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.terms.usagePurpose}</p>
                      </div>
                    )}
                    {contract.terms.occupantCount !== undefined && contract.terms.occupantCount !== null && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">تعداد ساکنین</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.terms.occupantCount}</p>
                      </div>
                    )}
                    {contract.terms.deliveryDate && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">تاریخ تحویل</label>
                        <p className="mt-1 text-sm text-gray-800">{formatToPersianDate(contract.terms.deliveryDate)}</p>
                      </div>
                    )}
                    {contract.terms.dailyDelayPenalty && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">جریمه روزانه تأخیر</label>
                        <p className="mt-1 text-sm text-gray-800">{formatPrice(contract.terms.dailyDelayPenalty)} ریال</p>
                      </div>
                    )}
                    {contract.terms.dailyOccupancyPenalty && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">جریمه روزانه تصرف</label>
                        <p className="mt-1 text-sm text-gray-800">{formatPrice(contract.terms.dailyOccupancyPenalty)} ریال</p>
                      </div>
                    )}
                    {contract.terms.deliveryDelayPenalty && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">جریمه تأخیر تحویل</label>
                        <p className="mt-1 text-sm text-gray-800">{formatPrice(contract.terms.deliveryDelayPenalty)} ریال</p>
                      </div>
                    )}
                    {contract.terms.rentPaymentDeadline && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">مهلت پرداخت اجاره</label>
                        <p className="mt-1 text-sm text-gray-800">{contract.terms.rentPaymentDeadline}</p>
                      </div>
                    )}
                    {contract.terms.renewalConditions && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-semibold text-gray-600">شرایط تمدید</label>
                        <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{contract.terms.renewalConditions}</p>
                      </div>
                    )}
                    {contract.terms.customTerms && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-semibold text-gray-600">توضیحات</label>
                        <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{contract.terms.customTerms}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Entries */}
              {Array.isArray(contract.paymentEntries) && contract.paymentEntries.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">روش‌های پرداخت</h2>
                  <div className="space-y-4">
                    {contract.paymentEntries.map((payment: any, index: number) => {
                      const getPaymentTypeLabel = (type: string) => {
                        const labels: Record<string, string> = {
                          'MORTGAGE': 'رهن',
                          'RENTAL_PAYMENT': 'پرداخت اجاره',
                          'DOWN_PAYMENT': 'پیش‌پرداخت',
                          'BILL_OF_SALE': 'قبض رسید',
                        };
                        return labels[type] || type;
                      };

                      const getPaymentMethodLabel = (method: string) => {
                        const labels: Record<string, string> = {
                          'CASH': 'نقد',
                          'CHECK': 'چک',
                          'CARD_TO_CARD': 'کارت به کارت',
                          'SHABA': 'شبا',
                          'ACCOUNT_TO_ACCOUNT': 'حساب به حساب',
                        };
                        return labels[method] || method;
                      };

                      return (
                        <div key={payment.id || index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="mb-3 flex items-center justify-between border-b border-gray-300 pb-2">
                            <h3 className="text-base font-semibold text-gray-900">
                              پرداخت {index + 1}
                            </h3>
                            <div className="flex gap-2">
                              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                                {getPaymentTypeLabel(payment.paymentType)}
                              </span>
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                {getPaymentMethodLabel(payment.paymentMethod)}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600">مبلغ</label>
                              <p className="mt-1 text-sm text-gray-800">{formatPrice(payment.amount)} ریال</p>
                            </div>
                            {payment.checkNumber && (
                              <div>
                                <label className="text-xs font-semibold text-gray-600">شماره چک</label>
                                <p className="mt-1 text-sm text-gray-800">{payment.checkNumber}</p>
                              </div>
                            )}
                            {payment.bankName && (
                              <div>
                                <label className="text-xs font-semibold text-gray-600">نام بانک</label>
                                <p className="mt-1 text-sm text-gray-800">{payment.bankName}</p>
                              </div>
                            )}
                            {payment.branchName && (
                              <div>
                                <label className="text-xs font-semibold text-gray-600">نام شعبه</label>
                                <p className="mt-1 text-sm text-gray-800">{payment.branchName}</p>
                              </div>
                            )}
                            {payment.accountNumber && (
                              <div>
                                <label className="text-xs font-semibold text-gray-600">شماره حساب</label>
                                <p className="mt-1 text-sm text-gray-800">{payment.accountNumber}</p>
                              </div>
                            )}
                            {payment.shabaNumber && (
                              <div>
                                <label className="text-xs font-semibold text-gray-600">شماره شبا</label>
                                <p className="mt-1 text-sm text-gray-800">{payment.shabaNumber}</p>
                              </div>
                            )}
                            {payment.cardNumber && (
                              <div>
                                <label className="text-xs font-semibold text-gray-600">شماره کارت</label>
                                <p className="mt-1 text-sm text-gray-800">{payment.cardNumber}</p>
                              </div>
                            )}
                            {payment.description && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <label className="text-xs font-semibold text-gray-600">توضیحات</label>
                                <p className="mt-1 text-sm text-gray-800">{payment.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Amenities Boolean Fields */}
              {(contract.propertyDetails?.amenities?.meetingHall !== undefined || contract.propertyDetails?.amenities?.club !== undefined || contract.propertyDetails?.amenities?.amphitheater !== undefined || 
                contract.propertyDetails?.amenities?.security !== undefined || contract.propertyDetails?.amenities?.balcony !== undefined || contract.propertyDetails?.amenities?.hood !== undefined || 
                contract.propertyDetails?.amenities?.janitorial !== undefined || contract.propertyDetails?.amenities?.lobby !== undefined || contract.propertyDetails?.amenities?.terrace !== undefined || 
                contract.propertyDetails?.amenities?.videoIntercom !== undefined || contract.propertyDetails?.amenities?.remoteParkingGate !== undefined || 
                contract.propertyDetails?.amenities?.tableGas !== undefined || contract.propertyDetails?.amenities?.centralAntenna !== undefined) && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">امکانات ساختمان</h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {contract.propertyDetails?.amenities?.meetingHall !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.meetingHall ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">سالن اجتماعات</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.club !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.club ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">باشگاه</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.amphitheater !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.amphitheater ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">آمفی تئاتر</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.security !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.security ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">امنیت</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.balcony !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.balcony ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">بالکن</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.hood !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.hood ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">هود</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.janitorial !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.janitorial ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">سرایدار</span>
                      </div>
                    )}    
                    {contract.propertyDetails?.amenities?.lobby !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.lobby ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">لابی</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.terrace !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.terrace ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">تراس</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.videoIntercom !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.videoIntercom ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">آیفون تصویری</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.remoteParkingGate !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.remoteParkingGate ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">گیت پارکینگ ریموت</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.tableGas !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.tableGas ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">گاز رومیزی</span>
                      </div>
                    )}
                    {contract.propertyDetails?.amenities?.centralAntenna !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded ${contract.propertyDetails?.amenities?.centralAntenna ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm text-gray-800">آنتن مرکزی</span>
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

