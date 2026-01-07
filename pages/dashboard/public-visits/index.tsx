import { useEffect } from 'react';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useClientLogs } from '../../../src/domains/client-logs/hooks/useClientLogs';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole } from '../../../src/shared/types';
import { VisitType } from '../../../src/domains/client-logs/types';
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
    fetchPublicClientLogs,
    clearError,
  } = useClientLogs();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && (currentUser.role === UserRole.CONSULTANT || currentUser.role === UserRole.SUPERVISOR)) {
      fetchPublicClientLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.role]);

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
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    </PrivateRoute>
  );
}

