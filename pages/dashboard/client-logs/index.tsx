import { useEffect, useState } from 'react';
import { FiPlus, FiPhone, FiUser, FiShare2, FiEdit2, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useClientLogs } from '../../../src/domains/client-logs/hooks/useClientLogs';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole } from '../../../src/shared/types';
import { canAccessClientLogs } from '../../../src/shared/utils/rbacUtils';
import { VisitType, CreateClientLogRequest, UpdateClientLogRequest, ClientLog } from '../../../src/domains/client-logs/types';
import { validatePhoneNumber } from '../../../src/shared/utils/validation';
import { formatPersianDateTime } from '../../../src/shared/utils/dateUtils';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';

const visitTypeLabels: Record<VisitType, string> = {
  [VisitType.PHONE]: 'تماس تلفنی',
  [VisitType.IN_PERSON]: 'حضوری',
};

export default function ClientLogsPage() {
  const {
    clientLogs,
    isLoading,
    error,
    fetchClientLogs,
    createClientLog,
    updateClientLog,
    deleteClientLog,
    shareClientLog,
    clearError,
  } = useClientLogs();
  const { user: currentUser } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLogForShare, setSelectedLogForShare] = useState<string | null>(null);
  const [selectedLogForDelete, setSelectedLogForDelete] = useState<ClientLog | null>(null);
  const [selectedLogForEdit, setSelectedLogForEdit] = useState<ClientLog | null>(null);
  const [formData, setFormData] = useState<Partial<CreateClientLogRequest>>({
    clientName: '',
    phoneNumber: '',
    propertyNeed: '',
    visitTime: new Date().toISOString().slice(0, 16),
    visitType: VisitType.PHONE,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (currentUser && canAccessClientLogs(currentUser.role)) {
      fetchClientLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const handleOpenModal = () => {
    setIsEditMode(false);
    setSelectedLogForEdit(null);
    setFormData({
      clientName: '',
      phoneNumber: '',
      propertyNeed: '',
      visitTime: new Date().toISOString().slice(0, 16),
      visitType: VisitType.PHONE,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (log: ClientLog) => {
    setIsEditMode(true);
    setSelectedLogForEdit(log);
    setFormData({
      clientName: log.clientName,
      phoneNumber: log.phoneNumber,
      propertyNeed: log.propertyNeed || '',
      visitTime: new Date(log.visitTime).toISOString().slice(0, 16),
      visitType: log.visitType,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedLogForEdit(null);
    setFormData({
      clientName: '',
      phoneNumber: '',
      propertyNeed: '',
      visitTime: new Date().toISOString().slice(0, 16),
      visitType: VisitType.PHONE,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.clientName || !formData.phoneNumber || !formData.visitTime) {
      setSnackbar({ open: true, message: 'لطفاً فیلدهای الزامی را پر کنید', severity: 'error' });
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setSnackbar({ open: true, message: 'شماره تلفن معتبر نیست', severity: 'error' });
      return;
    }

    try {
      if (isEditMode && selectedLogForEdit) {
        const updateData: UpdateClientLogRequest = {
          clientName: formData.clientName,
          phoneNumber: formData.phoneNumber,
          propertyNeed: formData.propertyNeed,
          visitTime: new Date(formData.visitTime).toISOString(),
          visitType: formData.visitType!,
        };
        await updateClientLog(selectedLogForEdit.id, updateData);
        setSnackbar({ open: true, message: 'مراجعه با موفقیت به‌روزرسانی شد', severity: 'success' });
      } else {
        await createClientLog({
          clientName: formData.clientName,
          phoneNumber: formData.phoneNumber,
          propertyNeed: formData.propertyNeed,
          visitTime: new Date(formData.visitTime).toISOString(),
          visitType: formData.visitType!,
        });
        setSnackbar({ open: true, message: 'مراجعه با موفقیت ثبت شد', severity: 'success' });
      }
      handleCloseModal();
      fetchClientLogs();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || (isEditMode ? 'خطا در به‌روزرسانی مراجعه' : 'خطا در ثبت مراجعه'), severity: 'error' });
    }
  };

  const handleOpenDeleteModal = (log: ClientLog) => {
    setSelectedLogForDelete(log);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedLogForDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLogForDelete) return;
    
    try {
      await deleteClientLog(selectedLogForDelete.id);
      setSnackbar({ open: true, message: 'مراجعه با موفقیت حذف شد', severity: 'success' });
      handleCloseDeleteModal();
      fetchClientLogs();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در حذف مراجعه', severity: 'error' });
    }
  };

  const handleOpenShareModal = (logId: string) => {
    setSelectedLogForShare(logId);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSelectedLogForShare(null);
  };

  const handleConfirmShare = async () => {
    if (!selectedLogForShare) return;
    
    try {
      await shareClientLog(selectedLogForShare);
      setSnackbar({ open: true, message: 'مراجعه با موفقیت به اشتراک گذاشته شد', severity: 'success' });
      handleCloseShareModal();
      fetchClientLogs();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در اشتراک‌گذاری مراجعه', severity: 'error' });
    }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const canEdit = isAdmin || currentUser?.role === UserRole.SECRETARY;
  const canDelete = isAdmin;

  if (!currentUser || !canAccessClientLogs(currentUser.role)) {
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
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SECRETARY]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">ثبت مراجعات</h1>
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                <span>ثبت مراجعه جدید</span>
              </button>
            </div>

            {error && <ErrorDisplay error={error} />}

            {/* Logs List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {isLoading ? (
                <Loading />
              ) : clientLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">مراجعه‌ای ثبت نشده است</div>
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
                        {(canEdit || canDelete || isAdmin) && (
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">عملیات</th>
                        )}
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
                          {(canEdit || canDelete || isAdmin) && (
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                {canEdit && (
                                  <button
                                    onClick={() => handleOpenEditModal(log)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="ویرایش مراجعه"
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                    <span>ویرایش</span>
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleOpenDeleteModal(log)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    title="حذف مراجعه"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                    <span>حذف</span>
                                  </button>
                                )}
                                {isAdmin && (
                                  <>
                                    {!log.isPublic ? (
                                      <button
                                        onClick={() => handleOpenShareModal(log.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                                        title="اشتراک‌گذاری با مشاوران و سرپرستان"
                                      >
                                        <FiShare2 className="w-4 h-4" />
                                        <span>اشتراک‌گذاری</span>
                                      </button>
                                    ) : (
                                      <span className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg">
                                        عمومی
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{isEditMode ? 'ویرایش مراجعه' : 'ثبت مراجعه جدید'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام مشتری <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره تماس <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="09123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نیاز ملکی</label>
                    <textarea
                      value={formData.propertyNeed}
                      onChange={(e) => setFormData({ ...formData, propertyNeed: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع مراجعه <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.visitType}
                      onChange={(e) => setFormData({ ...formData, visitType: e.target.value as VisitType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {Object.entries(visitTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      زمان مراجعه <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.visitTime}
                      onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {isEditMode ? 'ذخیره تغییرات' : 'ثبت'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedLogForDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <FiTrash2 className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center mb-4">حذف مراجعه</h2>
                <p className="text-gray-600 text-center mb-6">
                  آیا از حذف مراجعه <strong>{selectedLogForDelete.clientName}</strong> مطمئن هستید؟
                </p>
                <p className="text-sm text-gray-500 text-center mb-6">
                  این عمل غیرقابل بازگشت است و تمام اطلاعات این مراجعه حذف خواهد شد.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    بله، حذف شود
                  </button>
                  <button
                    onClick={handleCloseDeleteModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Share Confirmation Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiShare2 className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center mb-4">اشتراک‌گذاری مراجعه</h2>
                <p className="text-gray-600 text-center mb-6">
                  آیا می‌خواهید این مراجعه را با مشاوران و سرپرستان به اشتراک عمومی بگذارید؟
                </p>
                <p className="text-sm text-gray-500 text-center mb-6">
                  پس از اشتراک‌گذاری، این مراجعه در بخش "مشاهده مراجعات" برای مشاوران و سرپرستان قابل مشاهده خواهد بود.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmShare}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    بله، اشتراک‌گذاری
                  </button>
                  <button
                    onClick={handleCloseShareModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Snackbar */}
          {snackbar.open && (
            <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 rounded-lg shadow-lg z-50 ${
              snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {snackbar.message}
            </div>
          )}
        </DashboardLayout>
      </RoleGuard>
    </PrivateRoute>
  );
}

