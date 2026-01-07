import { useEffect, useState } from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useClientLogs } from '../../../src/domains/client-logs/hooks/useClientLogs';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole } from '../../../src/shared/types';
import { VisitType, PublicClientLogsFilters } from '../../../src/domains/client-logs/types';
import { formatPersianDateTime } from '../../../src/shared/utils/dateUtils';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';

const visitTypeLabels: Record<VisitType, string> = {
  [VisitType.PHONE]: 'تماس تلفنی',
  [VisitType.IN_PERSON]: 'حضوری',
};

export default function PublicVisitsPage() {
  const {
    clientLogs,
    isLoading,
    error,
    pagination,
    fetchPublicClientLogs,
    clearError,
  } = useClientLogs();
  const { user: currentUser } = useAuth();

  const [filters, setFilters] = useState<PublicClientLogsFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType | ''>('');

  useEffect(() => {
    if (currentUser && (currentUser.role === UserRole.CONSULTANT || currentUser.role === UserRole.SUPERVISOR)) {
      const fetchFilters: PublicClientLogsFilters = {
        page: filters.page,
        limit: filters.limit,
      };
      if (selectedVisitType) {
        fetchFilters.visitType = selectedVisitType as VisitType;
      }
      fetchPublicClientLogs(fetchFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.role, filters.page, filters.limit, selectedVisitType]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setFilters({ ...filters, page: newPage });
    }
  };

  const handleVisitTypeFilter = (visitType: VisitType | '') => {
    setSelectedVisitType(visitType);
    setFilters({ ...filters, page: 1 }); // Reset to first page when filter changes
  };

  if (!currentUser || (currentUser.role !== UserRole.CONSULTANT && currentUser.role !== UserRole.SUPERVISOR)) {
    return (
      <PrivateRoute>
        <DashboardLayout>
          <div className="p-8 text-center text-gray-500">شما دسترسی به این بخش را ندارید</div>
        </DashboardLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.CONSULTANT, UserRole.SUPERVISOR]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">مشاهده مراجعات</h1>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">فیلتر بر اساس نوع مراجعه:</label>
                <select
                  value={selectedVisitType}
                  onChange={(e) => handleVisitTypeFilter(e.target.value as VisitType | '')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">همه</option>
                  {Object.entries(visitTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <ErrorDisplay error={error} />}

            {/* Logs List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {isLoading ? (
                <Loading />
              ) : clientLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg mb-2">مراجعه‌ای برای نمایش وجود ندارد</p>
                  <p className="text-sm text-gray-400">مراجعاتی که توسط مدیر به اشتراک عمومی گذاشته شده‌اند در اینجا نمایش داده می‌شوند.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نام مشتری</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">شماره تماس</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نیاز ملکی</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نوع مراجعه</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">زمان مراجعه</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">ثبت کننده</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">املاک</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clientLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{log.clientName}</td>
                          <td className="px-4 py-3 text-sm">{log.phoneNumber}</td>
                          <td className="px-4 py-3 text-sm">{log.propertyNeed || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              log.visitType === VisitType.PHONE
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {visitTypeLabels[log.visitType]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{formatPersianDateTime(log.visitTime)}</td>
                          <td className="px-4 py-3 text-sm">
                            {log.createdBy.firstName} {log.createdBy.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {log.estate.establishmentName}
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      صفحه {pagination.page} از {pagination.totalPages} ({pagination.total} مورد)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page >= pagination.totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    </PrivateRoute>
  );
}

