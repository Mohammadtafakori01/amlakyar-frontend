import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useUsers } from '../../../src/domains/users/hooks/useUsers';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole, CreateUserRequest, UpdateUserRequest, UserFilters, CreateStaffRequest } from '../../../src/shared/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import { validatePhoneNumber, validateNationalId, validatePassword } from '../../../src/shared/utils/validation';
import { AppDispatch } from '../../../src/app/store';
import { fetchUsers as fetchUsersThunk } from '../../../src/domains/users/store/usersSlice';

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    users,
    pagination,
    createUser,
    createStaff,
    updateUser,
    deleteUser,
    isLoading,
    error,
    selectedUser,
    setSelectedUser,
    filters,
    setFilters,
  } = useUsers();
  const { user: currentUser } = useAuth();
  const isMaster = currentUser?.role === UserRole.MASTER;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isSupervisor = currentUser?.role === UserRole.SUPERVISOR;
  const allowedRoles = useMemo(() => {
    if (isMaster) {
      return [
        UserRole.CUSTOMER,
        UserRole.CONSULTANT,
        UserRole.SECRETARY,
        UserRole.SUPERVISOR,
        UserRole.ADMIN,
        UserRole.MASTER,
      ];
    }
    if (isAdmin) {
      return [UserRole.SUPERVISOR, UserRole.SECRETARY, UserRole.CONSULTANT];
    }
    if (isSupervisor) {
      return [UserRole.CONSULTANT];
    }
    return [];
  }, [isMaster, isAdmin, isSupervisor]);
  const defaultCreateRole = allowedRoles[0] ?? UserRole.CONSULTANT;
  const canCreate = allowedRoles.length > 0;
  const canEditUser = (targetRole: UserRole) => {
    if (isMaster) {
      return true;
    }
    if (isAdmin) {
      return [UserRole.SUPERVISOR, UserRole.SECRETARY, UserRole.CONSULTANT].includes(targetRole);
    }
    if (isSupervisor) {
      return targetRole === UserRole.CONSULTANT;
    }
    return false;
  };

  const buildScopedFilters = useCallback(
    (baseFilters?: UserFilters) => {
      if (!isMaster && currentUser?.estateId) {
        return { ...(baseFilters || {}), estateId: currentUser.estateId };
      }
      return { ...(baseFilters || {}) };
    },
    [isMaster, currentUser?.estateId]
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const hasFetched = useRef(false);
  
  const [formData, setFormData] = useState<CreateUserRequest & { isActive?: boolean; isApproved?: boolean }>({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    nationalId: '',
    password: '',
    role: UserRole.CUSTOMER,
    isActive: true,
    isApproved: true,
  });
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const [localFilters, setLocalFilters] = useState<UserFilters>(() =>
    buildScopedFilters({
      role: filters?.role,
      estateId: filters?.estateId,
    })
  );

  useEffect(() => {
    // Only fetch once on mount to prevent infinite loops
    if (!hasFetched.current && currentUser) {
      hasFetched.current = true;
      const scoped = buildScopedFilters(filters);
      setLocalFilters(scoped);
      dispatch(fetchUsersThunk({ ...scoped, page: 1, limit: pageSize }));
      setFilters(scoped);
    }
  }, [dispatch, currentUser, filters, setFilters, buildScopedFilters, pageSize]);

  // Fetch users when page or pageSize changes
  useEffect(() => {
    if (hasFetched.current && currentUser) {
      const scoped = buildScopedFilters(filters);
      dispatch(fetchUsersThunk({ ...scoped, page: currentPage, limit: pageSize }));
    }
  }, [currentPage, pageSize, dispatch, filters, buildScopedFilters, currentUser]);

  useEffect(() => {
    if (!isMaster && currentUser?.estateId) {
      setLocalFilters((prev) => {
        if (prev.estateId === currentUser.estateId) {
          return prev;
        }
        return { ...prev, estateId: currentUser.estateId };
      });
    }
  }, [currentUser?.estateId, isMaster]);

  // Sync currentPage with pagination.page from API response
  useEffect(() => {
    if (pagination && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [pagination?.page]);

  useEffect(() => {
    if (!isEdit) {
      setFormData((prev) => ({
        ...prev,
        role: defaultCreateRole,
      }));
    }
  }, [defaultCreateRole, isEdit]);

  const handleApplyFilters = () => {
    const scoped = buildScopedFilters(localFilters);
    setFilters(scoped);
    setCurrentPage(1); // Reset to first page when filters change
    dispatch(fetchUsersThunk({ ...scoped, page: 1, limit: pageSize }));
  };

  const handleClearFilters = () => {
    const reset = buildScopedFilters({});
    setLocalFilters(reset);
    setFilters(reset);
    setCurrentPage(1); // Reset to first page when clearing filters
    dispatch(fetchUsersThunk({ ...reset, page: 1, limit: pageSize }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleOpenDialog = (user?: any) => {
    if (user) {
      if (!canEditUser(user.role) && user.id !== currentUser?.id) {
        setSnackbar({ open: true, message: 'اجازه ویرایش این نقش را ندارید', severity: 'error' });
        return;
      }
      setIsEdit(true);
      setSelectedUser(user);
      setFormData({
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalId: user.nationalId,
        password: '',
        role: user.role,
        estateId: user.estateId,
        isActive: user.isActive,
        isApproved: user.isApproved,
      });
    } else {
      setIsEdit(false);
      setSelectedUser(null);
      setFormData({
        phoneNumber: '',
        firstName: '',
        lastName: '',
        nationalId: '',
        password: '',
        role: defaultCreateRole,
        isActive: true,
        isApproved: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    if (!validatePhoneNumber(formData.phoneNumber) || 
        !validateNationalId(formData.nationalId)) {
      setSnackbar({ open: true, message: 'لطفا اطلاعات را به درستی وارد کنید', severity: 'error' });
      return;
    }
    
    // Validate password rules
    // For Master creating regular users, password is required
    // For Admin/Supervisor creating staff, password is optional
    if (!isEdit && isMaster && !validatePassword(formData.password)) {
      setSnackbar({ open: true, message: 'رمز عبور باید حداقل 6 کاراکتر باشد', severity: 'error' });
      return;
    }
    // If password is provided, validate it (for both create and update)
    if (formData.password && !validatePassword(formData.password)) {
      setSnackbar({ open: true, message: 'رمز عبور باید حداقل 6 کاراکتر باشد', severity: 'error' });
      return;
    }
    
    if (!isMaster && !allowedRoles.includes(formData.role)) {
      setSnackbar({ open: true, message: 'انتخاب این نقش برای شما مجاز نیست', severity: 'error' });
      return;
    }

    try {
      if (isEdit && selectedUser) {
        const updateData: UpdateUserRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          nationalId: formData.nationalId,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        // Note: isActive, isApproved, and estateId are not supported in PATCH /api/users/:id
        // These fields should be updated via separate endpoints if needed
        await updateUser(selectedUser.id, updateData);
        setSnackbar({ open: true, message: 'کاربر با موفقیت به‌روزرسانی شد', severity: 'success' });
      } else {
        if (isMaster) {
          const createData: CreateUserRequest = {
            phoneNumber: formData.phoneNumber,
            firstName: formData.firstName,
            lastName: formData.lastName,
            nationalId: formData.nationalId,
            password: formData.password,
            role: formData.role,
          };
          if (formData.estateId) {
            createData.estateId = formData.estateId;
          }
          await createUser(createData);
          setSnackbar({ open: true, message: 'کاربر با موفقیت ایجاد شد', severity: 'success' });
        } else {
          // For Supervisor/Admin creating staff, include their estateId
          // This ensures the new user is properly linked to the creator's estate
          const staffPayload: CreateStaffRequest = {
            phoneNumber: formData.phoneNumber,
            firstName: formData.firstName,
            lastName: formData.lastName,
            nationalId: formData.nationalId,
            ...(formData.password && { password: formData.password }), // Only include password if provided
            role: formData.role as CreateStaffRequest['role'],
            ...(currentUser?.estateId && { estateId: currentUser.estateId }), // Include estateId for Supervisor/Admin
          };
          await createStaff(staffPayload);
          setSnackbar({ open: true, message: 'پرسنل با موفقیت ایجاد شد', severity: 'success' });
        }
      }
      handleCloseDialog();
      const scoped = buildScopedFilters(localFilters);
      dispatch(fetchUsersThunk({ ...scoped, page: currentPage, limit: pageSize }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطا در انجام عملیات';
      const message = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      try {
        await deleteUser(userId);
        setSnackbar({ open: true, message: 'کاربر با موفقیت حذف شد', severity: 'success' });
        const scoped = buildScopedFilters(localFilters);
        dispatch(fetchUsersThunk({ ...scoped, page: currentPage, limit: pageSize }));
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'خطا در حذف کاربر';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
    }
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

  // Check if user has missing relationships
  const hasMissingRelationship = (user: any): boolean => {
    // CONSULTANTs should have parentId and estateId
    if (user.role === UserRole.CONSULTANT && (!user.parentId || !user.estateId)) {
      return true;
    }
    // SECRETARYs and SUPERVISORs should have estateId
    if ([UserRole.SECRETARY, UserRole.SUPERVISOR].includes(user.role) && !user.estateId) {
      return true;
    }
    return false;
  };

  const allRoles = [
    UserRole.CUSTOMER,
    UserRole.CONSULTANT,
    UserRole.SECRETARY,
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
    UserRole.MASTER,
  ];

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MASTER, UserRole.SUPERVISOR]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">مدیریت کاربران</h1>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
                >
                  <FiFilter /> فیلترها
                </button>
                {canCreate && (
                  <button
                    onClick={() => handleOpenDialog()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
                  >
                    <FiPlus />
                    {isMaster ? 'افزودن کاربر' : 'افزودن پرسنل'}
                  </button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نقش</label>
                    <select
                      value={localFilters.role || ''}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, role: (e.target.value as UserRole) || undefined })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">همه</option>
                      {allRoles.map((role) => (
                        <option key={role} value={role}>
                          {getRoleLabel(role)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isMaster && (
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">شناسه املاک</label>
                      <input
                        type="text"
                        value={localFilters.estateId || ''}
                        onChange={(e) => setLocalFilters({ ...localFilters, estateId: e.target.value || undefined })}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="UUID"
                      />
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      اعمال فیلتر
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    >
                      پاک کردن
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isMaster && (
              <div className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
                لیست کاربران تنها به املاک شما محدود شده است و نقش‌های مجاز به صورت خودکار اعمال می‌شوند.
              </div>
            )}
            {isSupervisor && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                به عنوان ناظر فقط می‌توانید برای ملک خود مشاور جدید ایجاد کنید.
              </div>
            )}

            <ErrorDisplay error={error} />

            {isLoading ? (
              <Loading />
            ) : users.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                کاربری یافت نشد.
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
                      {(currentUser?.role === UserRole.MASTER || currentUser?.role === UserRole.ADMIN) && (
                        <>
                          <th className="px-4 py-3">املاک</th>
                          <th className="px-4 py-3">والد</th>
                        </>
                      )}
                      <th className="px-4 py-3">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const missingRelationship = hasMissingRelationship(user);
                      return (
                        <tr 
                        key={user.id} 
                        className={`border-t border-gray-100 hover:bg-gray-50 ${missingRelationship ? 'bg-amber-50/30' : ''}`}
                        title={missingRelationship ? 'این کاربر رابطه‌های لازم (parentId یا estateId) را ندارد' : ''}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {user.firstName} {user.lastName}
                            {missingRelationship && (
                              <span className="text-xs text-amber-600" title="رابطه‌های ناقص">
                                ⚠️
                              </span>
                            )}
                          </div>
                        </td>
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
                        {(currentUser?.role === UserRole.MASTER || currentUser?.role === UserRole.ADMIN) && (
                          <>
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
                          </>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {(canEditUser(user.role) || user.id === currentUser?.id) && (
                              <button
                                onClick={() => handleOpenDialog(user)}
                                className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                              >
                                <FiEdit2 />
                              </button>
                            )}
                            {currentUser?.role === UserRole.MASTER && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="rounded-full border border-gray-200 p-2 text-red-600 hover:border-red-200 hover:text-red-700"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    نمایش {((pagination.page - 1) * pagination.limit) + 1} تا {Math.min(pagination.page * pagination.limit, pagination.total)} از {pagination.total} کاربر
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="rounded-xl border border-gray-200 px-3 py-1 text-sm text-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-xs text-gray-500">در هر صفحه</span>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevious || isLoading}
                      className={`flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        !pagination.hasPrevious || isLoading
                          ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                      }`}
                    >
                      <FiChevronRight className="text-lg" />
                      قبلی
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isLoading}
                            className={`min-w-[40px] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              currentPage === pageNum
                                ? 'border-primary-500 bg-primary-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                            } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext || isLoading}
                      className={`flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        !pagination.hasNext || isLoading
                          ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-600'
                      }`}
                    >
                      بعدی
                      <FiChevronLeft className="text-lg" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {openDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-xl rounded-2xl bg-white p-6 text-right shadow-2xl">
                  <h3 className="text-xl font-semibold text-gray-900">{isEdit ? 'ویرایش کاربر' : 'افزودن کاربر'}</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">نام</label>
                      <input
                        type="text"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">نام خانوادگی</label>
                      <input
                        type="text"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                      <label className="mb-1 block text-sm font-medium text-gray-600">نقش</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        {allowedRoles.map((role) => (
                          <option key={role} value={role}>
                            {getRoleLabel(role)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">رمز عبور</label>
                      <input
                        type="password"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={isEdit ? 'در صورت خالی بودن بدون تغییر' : 'حداقل 6 کاراکتر'}
                      />
                    </div>
                    {currentUser?.role === UserRole.MASTER && (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">شناسه املاک (اختیاری)</label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          value={formData.estateId || ''}
                          onChange={(e) => setFormData({ ...formData, estateId: e.target.value || undefined })}
                          placeholder="UUID"
                        />
                      </div>
                    )}
                    {isEdit && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={formData.isActive ?? true}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          />
                          فعال
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={formData.isApproved ?? true}
                            onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                          />
                          تایید شده
                        </label>
                      </div>
                    )}
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
                      {isEdit ? 'ذخیره' : 'ایجاد'}
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

