import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { AppDispatch } from '../../../src/app/store';
import { useDispatch } from 'react-redux';
import { registerConsultant, getConsultants } from '../../../src/domains/auth/store/authSlice';
import { UserRole } from '../../../src/shared/types';
import Loading from '../../../src/shared/components/common/Loading';
import { validatePhoneNumber, validateNationalId } from '../../../src/shared/utils/validation';

export default function ConsultantsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [consultants, setConsultants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    loadConsultants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConsultants = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(getConsultants());
      if (getConsultants.fulfilled.match(result)) {
        // Ensure we always have an array, even if API returns an object
        const payload = result.payload;
        if (Array.isArray(payload)) {
          setConsultants(payload);
        } else if (payload && typeof payload === 'object') {
          // Handle case where API returns { consultants: [...] } or { data: [...] }
          setConsultants(payload.consultants || payload.data || []);
        } else {
          setConsultants([]);
        }
      }
    } catch (error) {
      console.error('Error loading consultants:', error);
      setConsultants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      firstName: '',
      lastName: '',
      nationalId: '',
      phoneNumber: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!validatePhoneNumber(formData.phoneNumber) || !validateNationalId(formData.nationalId)) {
      setSnackbar({ open: true, message: 'لطفا اطلاعات را به درستی وارد کنید', severity: 'error' });
      return;
    }

    try {
      // Include estateId from current user (Supervisor) to ensure consultant is linked to their estate
      const requestData = {
        ...formData,
        ...(user?.estateId && { estateId: user.estateId }),
      };
      const result = await dispatch(registerConsultant(requestData));
      if (registerConsultant.fulfilled.match(result)) {
        setSnackbar({ open: true, message: 'مشاور با موفقیت ثبت شد', severity: 'success' });
        handleCloseDialog();
        loadConsultants();
      } else {
        setSnackbar({ open: true, message: result.payload as string || 'خطا در ثبت مشاور', severity: 'error' });
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'خطا در ثبت مشاور', severity: 'error' });
    }
  };

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.SUPERVISOR]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">مدیریت مشاوران</h1>
              <button
                onClick={handleOpenDialog}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700"
              >
                <FiPlus className="text-lg" />
                ثبت مشاور جدید
              </button>
            </div>

            {isLoading ? (
              <Loading />
            ) : !Array.isArray(consultants) || consultants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                مشاوری ثبت نشده است.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="min-w-full text-right">
                  <thead>
                    <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                      <th className="px-4 py-3">نام</th>
                      <th className="px-4 py-3">شماره موبایل</th>
                      <th className="px-4 py-3">کد ملی</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultants.map((consultant: any) => (
                      <tr key={consultant.id} className="border-t border-gray-100 text-sm text-gray-700 hover:bg-gray-50">
                        <td className="px-4 py-3">{consultant.firstName} {consultant.lastName}</td>
                        <td className="px-4 py-3">{consultant.phoneNumber}</td>
                        <td className="px-4 py-3">{consultant.nationalId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {openDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-right shadow-2xl">
                  <h3 className="text-xl font-semibold text-gray-900">ثبت مشاور جدید</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">نام</label>
                    <input
                        type="text"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">نام خانوادگی</label>
                    <input
                        type="text"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">کد ملی</label>
                    <input
                        type="text"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">شماره موبایل</label>
                    <input
                        type="text"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        maxLength={11}
                        placeholder="09123456789"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={handleCloseDialog}
                      className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      ثبت
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
          </div>
        </DashboardLayout>
      </RoleGuard>
    </PrivateRoute>
  );
}

