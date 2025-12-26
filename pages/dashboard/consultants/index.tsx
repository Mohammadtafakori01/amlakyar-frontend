import { useEffect, useState } from 'react';
import { FiPlus, FiEye, FiEyeOff, FiEdit2, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { AppDispatch } from '../../../src/app/store';
import { useDispatch } from 'react-redux';
import { registerConsultant, getConsultants } from '../../../src/domains/auth/store/authSlice';
import { useUsers } from '../../../src/domains/users/hooks/useUsers';
import { UserRole } from '../../../src/shared/types';
import Loading from '../../../src/shared/components/common/Loading';
import { validatePhoneNumber, validateNationalId, validatePassword } from '../../../src/shared/utils/validation';

export default function ConsultantsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { updateUser, deleteUser } = useUsers();
  const [consultants, setConsultants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<any | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    phoneNumber: '',
    password: '',
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

  const handleOpenDialog = (consultant?: any) => {
    if (consultant) {
      setIsEdit(true);
      setSelectedConsultant(consultant);
      setFormData({
        firstName: consultant.firstName || '',
        lastName: consultant.lastName || '',
        nationalId: consultant.nationalId || '',
        phoneNumber: consultant.phoneNumber || '',
        password: '',
      });
    } else {
      setIsEdit(false);
      setSelectedConsultant(null);
      setFormData({
        firstName: '',
        lastName: '',
        nationalId: '',
        phoneNumber: '',
        password: '',
      });
    }
    setShowPassword(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEdit(false);
    setSelectedConsultant(null);
  };

  const handleOpenDeleteDialog = (consultant: any) => {
    setSelectedConsultant(consultant);
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedConsultant(null);
  };

  const handleSubmit = async () => {
    if (!validatePhoneNumber(formData.phoneNumber) || !validateNationalId(formData.nationalId)) {
      setSnackbar({ open: true, message: 'لطفا اطلاعات را به درستی وارد کنید', severity: 'error' });
      return;
    }

    // Password is required for create, optional for update
    if (!isEdit && !validatePassword(formData.password)) {
      setSnackbar({ open: true, message: 'لطفا اطلاعات را به درستی وارد کنید', severity: 'error' });
      return;
    }

    try {
      if (isEdit && selectedConsultant) {
        // Update consultant
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          nationalId: formData.nationalId,
          phoneNumber: formData.phoneNumber,
        };
        
        // Only include password if it's provided
        if (formData.password && formData.password.trim() !== '') {
          if (!validatePassword(formData.password)) {
            setSnackbar({ open: true, message: 'رمز عبور باید حداقل 6 کاراکتر باشد', severity: 'error' });
            return;
          }
          updateData.password = formData.password;
        }

        await updateUser(selectedConsultant.id, updateData);
        setSnackbar({ open: true, message: 'مشاور با موفقیت به‌روزرسانی شد', severity: 'success' });
        handleCloseDialog();
        loadConsultants();
      } else {
        // Create consultant
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
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || (isEdit ? 'خطا در به‌روزرسانی مشاور' : 'خطا در ثبت مشاور');
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedConsultant) return;

    try {
      await deleteUser(selectedConsultant.id);
      setSnackbar({ open: true, message: 'مشاور با موفقیت حذف شد', severity: 'success' });
      handleCloseDeleteDialog();
      loadConsultants();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در حذف مشاور';
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      setSnackbar({ open: true, message, severity: 'error' });
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
                      <th className="px-4 py-3">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultants.map((consultant: any) => (
                      <tr key={consultant.id} className="border-t border-gray-100 text-sm text-gray-700 hover:bg-gray-50">
                        <td className="px-4 py-3">{consultant.firstName} {consultant.lastName}</td>
                        <td className="px-4 py-3">{consultant.phoneNumber}</td>
                        <td className="px-4 py-3">{consultant.nationalId}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDialog(consultant)}
                              className="flex items-center justify-center rounded-lg p-2 text-primary-600 hover:bg-primary-50 transition"
                              title="ویرایش"
                            >
                              <FiEdit2 className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteDialog(consultant)}
                              className="flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
                              title="حذف"
                            >
                              <FiTrash2 className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {openDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-right shadow-2xl">
                  <h3 className="text-xl font-semibold text-gray-900">{isEdit ? 'ویرایش مشاور' : 'ثبت مشاور جدید'}</h3>
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
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">
                        رمز عبور {isEdit && <span className="text-gray-400 text-xs">(اختیاری - در صورت تغییر)</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full rounded-2xl border border-gray-200 px-4 py-2 pr-12 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder={isEdit ? 'در صورت تغییر رمز عبور وارد کنید' : 'حداقل 6 کاراکتر'}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                        </button>
                      </div>
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
                      {isEdit ? 'ذخیره تغییرات' : 'ثبت'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {deleteDialog && selectedConsultant && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 text-right shadow-2xl">
                  <h3 className="text-xl font-semibold text-gray-900">حذف مشاور</h3>
                  <p className="mt-4 text-sm text-gray-600">
                    آیا از حذف مشاور <strong>{selectedConsultant.firstName} {selectedConsultant.lastName}</strong> اطمینان دارید؟
                    <br />
                    <span className="text-red-600">این عملیات غیرقابل بازگشت است.</span>
                  </p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={handleCloseDeleteDialog}
                      className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      حذف
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

