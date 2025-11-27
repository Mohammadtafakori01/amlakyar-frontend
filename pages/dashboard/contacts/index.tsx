import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiPhone, FiUser } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useContacts } from '../../../src/domains/contacts/hooks/useContacts';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole } from '../../../src/shared/types';
import { canAccessContacts } from '../../../src/shared/utils/rbacUtils';
import { CreateContactRequest, UpdateContactRequest } from '../../../src/domains/contacts/types';
import { validatePhoneNumber } from '../../../src/shared/utils/validation';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';

export default function ContactsPage() {
  const {
    contacts,
    isLoading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    clearError,
  } = useContacts();
  const { user: currentUser } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'estate' | 'personal'>('all');
  const [formData, setFormData] = useState<Partial<CreateContactRequest>>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    isEstateContact: false,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (currentUser && canAccessContacts(currentUser.role)) {
      fetchContacts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const handleOpenModal = (contactId?: string) => {
    if (contactId) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        setEditingContact(contactId);
        setFormData({
          firstName: contact.firstName,
          lastName: contact.lastName,
          phoneNumber: contact.phoneNumber,
          isEstateContact: contact.isEstateContact,
        });
      }
    } else {
      setEditingContact(null);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        isEstateContact: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      isEstateContact: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      setSnackbar({ open: true, message: 'لطفاً فیلدهای الزامی را پر کنید', severity: 'error' });
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setSnackbar({ open: true, message: 'شماره تلفن معتبر نیست', severity: 'error' });
      return;
    }

    // اگر مخاطب املاک است، باید شناسه آژانس ارسال شود
    if (formData.isEstateContact) {
      if (!currentUser?.estateId) {
        setSnackbar({ open: true, message: 'برای دفترچه تلفن املاک، شناسه آژانس الزامی است', severity: 'error' });
        return;
      }
    }

    // آماده‌سازی داده‌ها برای ارسال
    const submitData = {
      ...formData,
      // اگر مخاطب املاک است، estateId را اضافه کن
      ...(formData.isEstateContact && currentUser?.estateId ? { estateId: currentUser.estateId } : {}),
      // اگر مخاطب شخصی است، estateId را حذف کن
      ...(!formData.isEstateContact ? { estateId: undefined } : {}),
    };

    try {
      if (editingContact) {
        await updateContact(editingContact, submitData as UpdateContactRequest);
        setSnackbar({ open: true, message: 'مخاطب با موفقیت ویرایش شد', severity: 'success' });
      } else {
        await createContact(submitData as CreateContactRequest);
        setSnackbar({ open: true, message: 'مخاطب با موفقیت ایجاد شد', severity: 'success' });
      }
      handleCloseModal();
      fetchContacts();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در ذخیره مخاطب', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این مخاطب اطمینان دارید؟')) {
      return;
    }

    try {
      await deleteContact(id);
      setSnackbar({ open: true, message: 'مخاطب با موفقیت حذف شد', severity: 'success' });
      fetchContacts();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در حذف مخاطب', severity: 'error' });
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (activeTab === 'estate') return contact.isEstateContact;
    if (activeTab === 'personal') return !contact.isEstateContact;
    return true;
  });

  if (!currentUser || !canAccessContacts(currentUser.role)) {
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
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.SECRETARY, UserRole.CONSULTANT]}>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">دفترچه تلفن</h1>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                <span>افزودن مخاطب</span>
              </button>
            </div>

            {error && <ErrorDisplay error={error} />}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-1 flex gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setActiveTab('estate')}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'estate'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                املاک
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'personal'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                شخصی
              </button>
            </div>

            {/* Contacts List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {isLoading ? (
                <Loading />
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">مخاطبی یافت نشد</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نام</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">شماره تماس</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">نوع</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {contact.firstName} {contact.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm">{contact.phoneNumber}</td>
                          <td className="px-4 py-3 text-sm">
                            {contact.isEstateContact ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">املاک</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">شخصی</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenModal(contact.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="ویرایش"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(contact.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingContact ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام خانوادگی <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                  {currentUser?.role === UserRole.ADMIN && (
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isEstateContact}
                          onChange={(e) => setFormData({ ...formData, isEstateContact: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>مخاطب املاک</span>
                      </label>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {editingContact ? 'ویرایش' : 'افزودن'}
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

