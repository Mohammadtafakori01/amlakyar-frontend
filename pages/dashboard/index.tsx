import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import DashboardLayout from '../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../src/shared/components/guards/PrivateRoute';
import { useAuth } from '../../src/domains/auth/hooks/useAuth';
import { useProfile } from '../../src/domains/profile/hooks/useProfile';
import { UserRole } from '../../src/shared/types';
import Loading from '../../src/shared/components/common/Loading';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { profile, fetchProfile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (isAuthenticated && user && !profile && !profileLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, user, profile, profileLoading, fetchProfile]);

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

  return (
    <PrivateRoute>
      <DashboardLayout>
        {profileLoading ? (
          <Loading />
        ) : (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'right', direction: 'rtl' }}>
              {getWelcomeMessage(user.role)}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {user.firstName} {user.lastName} - {getRoleLabel(user.role)}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'right', direction: 'rtl' }}>
                      اطلاعات کاربری
                    </Typography>
                    {profile && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          نام: {profile.firstName} {profile.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          شماره موبایل: {profile.phoneNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          کد ملی: {profile.nationalId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          نقش: {getRoleLabel(profile.role)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'right', direction: 'rtl' }}>
                      دسترسی‌ها
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {user.role === UserRole.CUSTOMER && (
                        <Typography variant="body2" color="text.secondary">
                          شما به عنوان مشتری می‌توانید پروفایل خود را مشاهده کنید.
                        </Typography>
                      )}
                      {user.role === UserRole.CONSULTANT && (
                        <Typography variant="body2" color="text.secondary">
                          شما به عنوان مشاور می‌توانید پروفایل خود را مشاهده کنید.
                        </Typography>
                      )}
                      {user.role === UserRole.SECRETARY && (
                        <Typography variant="body2" color="text.secondary">
                          شما به عنوان منشی می‌توانید پروفایل خود را مشاهده کنید.
                        </Typography>
                      )}
                      {user.role === UserRole.SUPERVISOR && (
                        <Typography variant="body2" color="text.secondary">
                          شما می‌توانید مشاوران را ثبت و مدیریت کنید.
                        </Typography>
                      )}
                      {user.role === UserRole.ADMIN && (
                        <Typography variant="body2" color="text.secondary">
                          شما می‌توانید اعضای املاک را ثبت و مدیریت کنید.
                        </Typography>
                      )}
                      {user.role === UserRole.MASTER && (
                        <Typography variant="body2" color="text.secondary">
                          شما دسترسی کامل به تمام بخش‌های سیستم دارید.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DashboardLayout>
    </PrivateRoute>
  );
}

