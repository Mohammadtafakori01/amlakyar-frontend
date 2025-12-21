import { useEffect } from 'react';
import DashboardLayout from '../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../src/shared/components/guards/PrivateRoute';
import { useProfile } from '../../src/domains/profile/hooks/useProfile';
import { useAuth } from '../../src/domains/auth/hooks/useAuth';
import Loading from '../../src/shared/components/common/Loading';
import ErrorDisplay from '../../src/shared/components/common/ErrorDisplay';
import { UserRole } from '../../src/shared/types';

export default function ProfilePage() {
  const { profile, fetchProfile, isLoading, error } = useProfile();
  const { user } = useAuth();

  useEffect(() => {
    if (!profile && !isLoading) {
      fetchProfile();
    }
  }, [profile, isLoading, fetchProfile]);

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.CUSTOMER]: 'مشتری',
      [UserRole.CONSULTANT]: 'مشاور',
      [UserRole.SECRETARY]: 'منشی',
      [UserRole.SUPERVISOR]: 'سرپرست',
      [UserRole.ADMIN]: 'مدیر',
      [UserRole.MASTER]: 'مستر',
    };
    return labels[role] || role;
  };

  if (isLoading) {
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
        <div className="w-full text-right">
          <h1 className="text-2xl font-bold mb-6 text-right">
            پروفایل کاربری
          </h1>

          <ErrorDisplay error={error} />

          {profile && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شماره موبایل
                  </label>
                  <input
                    type="text"
                    value={profile.phoneNumber}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کد ملی
                  </label>
                  <input
                    type="text"
                    value={profile.nationalId}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نقش
                  </label>
                  <input
                    type="text"
                    value={getRoleLabel(profile.role)}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وضعیت
                  </label>
                  <input
                    type="text"
                    value={profile.isActive ? 'فعال' : 'غیرفعال'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-right"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </PrivateRoute>
  );
}

