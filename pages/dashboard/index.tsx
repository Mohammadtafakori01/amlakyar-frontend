import { useEffect, useRef } from 'react';
import DashboardLayout from '../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../src/shared/components/guards/PrivateRoute';
import { useAuth } from '../../src/domains/auth/hooks/useAuth';
import { useProfile } from '../../src/domains/profile/hooks/useProfile';
import { UserRole, EstateStatus } from '../../src/shared/types';
import Loading from '../../src/shared/components/common/Loading';
import { useEstates } from '../../src/domains/estates/hooks/useEstates';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { profile, fetchProfile, isLoading: profileLoading } = useProfile();
  const {
    currentEstate,
    isCurrentEstateLoading,
    fetchCurrentEstate,
  } = useEstates();
  const estateFetchRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && !profile && !profileLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, user, profile, profileLoading, fetchProfile]);

  useEffect(() => {
    if (user?.estateId && estateFetchRef.current !== user.estateId) {
      estateFetchRef.current = user.estateId;
      fetchCurrentEstate(user.estateId);
    }
  }, [user?.estateId, fetchCurrentEstate]);

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

  const getWelcomeMessage = (role: UserRole): string => {
    const messages: Record<UserRole, string> = {
      [UserRole.CUSTOMER]: 'به پنل مشتری خوش آمدید',
      [UserRole.CONSULTANT]: 'به پنل مشاور خوش آمدید',
      [UserRole.SECRETARY]: 'به پنل منشی خوش آمدید',
      [UserRole.SUPERVISOR]: 'به پنل ناظر خوش آمدید',
      [UserRole.ADMIN]: 'به پنل مدیر املاک خوش آمدید',
      [UserRole.MASTER]: 'به پنل مستر سیستم خوش آمدید',
    };
    return messages[role] || 'به داشبورد خوش آمدید';
  };

  const pillClass = (tone: 'success' | 'warning' | 'error' | 'neutral') => {
    const map: Record<typeof tone, string> = {
      success: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-amber-100 text-amber-700 border-amber-200',
      error: 'bg-red-100 text-red-700 border-red-200',
      neutral: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${map[tone]}`;
  };

  const estateStatusLabel = () => {
    const userData = profile || user;
    if (currentEstate?.status === EstateStatus.APPROVED || userData?.isApproved) return { label: 'تایید شده', tone: 'success' as const };
    if (currentEstate?.status === EstateStatus.REJECTED) return { label: 'رد شده', tone: 'error' as const };
    return { label: 'در انتظار تایید', tone: 'warning' as const };
  };

  const accessMessages: Record<UserRole, string> = {
    [UserRole.CUSTOMER]: 'شما به عنوان مشتری می‌توانید پروفایل خود را مشاهده کنید.',
    [UserRole.CONSULTANT]: 'شما به عنوان مشاور می‌توانید پروفایل خود را مشاهده کنید.',
    [UserRole.SECRETARY]: 'شما به عنوان منشی می‌توانید پروفایل خود را مشاهده کنید.',
    [UserRole.SUPERVISOR]: 'شما می‌توانید مشاوران را ثبت و مدیریت کنید.',
    [UserRole.ADMIN]: 'شما می‌توانید اعضای املاک را ثبت و مدیریت کنید.',
    [UserRole.MASTER]: 'شما دسترسی کامل به تمام بخش‌های سیستم دارید.',
  };

  return (
    <PrivateRoute>
      <DashboardLayout>
        {profileLoading ? (
          <Loading />
        ) : !profile && !user ? (
          <div className="space-y-6 text-right">
            <p className="text-gray-500">در حال بارگذاری اطلاعات کاربر...</p>
          </div>
        ) : (
          <div className="space-y-6 text-right">
            <div>
              {(() => {
                const userData = profile || user;
                if (!userData) return null;
                return (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900">{getWelcomeMessage(userData.role)}</h1>
                    <p className="mt-1 text-gray-500">
                      {userData.firstName} {userData.lastName} - {getRoleLabel(userData.role)}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <span className={pillClass(userData.isActive ? 'success' : 'neutral')}>
                        {userData.isActive ? 'حساب فعال' : 'حساب غیرفعال'}
                      </span>
                      <span className={pillClass(estateStatusLabel().tone)}>{estateStatusLabel().label}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800">اطلاعات کاربری</h2>
                {profile ? (
                  <dl className="mt-4 space-y-2 text-sm text-gray-600">
                    <div>
                      <dt className="font-medium text-gray-800">نام</dt>
                      <dd>{profile.firstName} {profile.lastName}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-800">شماره موبایل</dt>
                      <dd>{profile.phoneNumber}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-800">کد ملی</dt>
                      <dd>{profile.nationalId}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-800">نقش</dt>
                      <dd>{getRoleLabel(profile.role)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">اطلاعات پروفایل در دسترس نیست.</p>
                )}
              </div>

              {(() => {
                const userData = profile || user;
                if (!userData) return null;
                return (
                  <>
                    {userData.estateId && (
                      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800">وضعیت املاک شما</h2>
                        {isCurrentEstateLoading && !currentEstate ? (
                          <Loading />
                        ) : currentEstate ? (
                          <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <span className={pillClass(estateStatusLabel().tone)}>{estateStatusLabel().label}</span>
                            <p>نام واحد: {currentEstate.establishmentName}</p>
                            <p>شناسه صنفی: {currentEstate.guildId}</p>
                            <p>تلفن ثابت: {currentEstate.fixedPhone}</p>
                            <p>آدرس: {currentEstate.address}</p>
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-gray-500">اطلاعاتی برای املاک شما یافت نشد.</p>
                        )}

                        {userData.role === UserRole.ADMIN && currentEstate?.status === EstateStatus.PENDING && (
                          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            درخواست ثبت املاک شما در انتظار تایید مستر است. به محض تایید، دسترسی کامل فعال می‌شود.
                          </div>
                        )}

                        {userData.role === UserRole.ADMIN && currentEstate?.status === EstateStatus.REJECTED && (
                          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 space-y-2">
                            <p>درخواست ثبت املاک شما رد شده است.</p>
                            {currentEstate.rejectionReason && <p>علت رد: {currentEstate.rejectionReason}</p>}
                            <p>لطفا پس از اصلاح اطلاعات دوباره اقدام کنید یا با پشتیبانی تماس بگیرید.</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h2 className="text-xl font-semibold text-gray-800">دسترسی‌ها</h2>
                      <p className="mt-3 text-sm text-gray-600">{accessMessages[userData.role] || 'دسترسی‌های شما در حال بارگذاری است...'}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </DashboardLayout>
    </PrivateRoute>
  );
}

