import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSave } from 'react-icons/fi';
import DashboardLayout from '../../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../../src/shared/components/guards/PrivateRoute';
import { usePropertyFiles } from '../../../../src/domains/property-files/hooks/usePropertyFiles';
import { useAuth } from '../../../../src/domains/auth/hooks/useAuth';
import {
  PropertyFileZone,
  PropertyTransactionType,
  PropertyBuildingType,
  PropertyDirection,
  UpdatePropertyFileRequest,
} from '../../../../src/domains/property-files/types';
import Loading from '../../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../../src/shared/components/common/ErrorDisplay';
import PersianDatePicker from '../../../../src/shared/components/common/PersianDatePicker';
import { canEditFile } from '../../../../src/shared/utils/rbacUtils';

// Reuse labels from create page
const zoneLabels: Record<PropertyFileZone, string> = {
  [PropertyFileZone.OFFICE_MASTER]: 'زونکن املاک',
  [PropertyFileZone.INTERNAL_COOPERATION]: 'تعاون داخلی',
  [PropertyFileZone.EXTERNAL_NETWORK]: 'تعاون خارجی',
  [PropertyFileZone.PERSONAL]: 'فایل شخصی',
};

const transactionTypeLabels: Record<PropertyTransactionType, string> = {
  [PropertyTransactionType.SALE]: 'فروش',
  [PropertyTransactionType.RENT]: 'اجاره',
  [PropertyTransactionType.MORTGAGE]: 'رهن',
  [PropertyTransactionType.PARTNERSHIP]: 'مشارکت',
  [PropertyTransactionType.EXCHANGE]: 'معاوضه',
};

const buildingTypeLabels: Record<PropertyBuildingType, string> = {
  [PropertyBuildingType.VILLA]: 'ویلا',
  [PropertyBuildingType.APARTMENT]: 'آپارتمان',
  [PropertyBuildingType.COMMERCIAL]: 'تجاری',
  [PropertyBuildingType.OUTSIDE]: 'بیرونی',
  [PropertyBuildingType.OLD]: 'قدیمی',
  [PropertyBuildingType.OFFICE]: 'اداری',
  [PropertyBuildingType.SHOP]: 'مغازه',
};

export default function EditPropertyFilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { selectedFile, fetchPropertyFileById, updatePropertyFile, isLoading, error, clearError } = usePropertyFiles();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState<Partial<UpdatePropertyFileRequest>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPropertyFileById(id);
    }
  }, [id, fetchPropertyFileById]);

  useEffect(() => {
    if (selectedFile) {
      setFormData({
        owner: selectedFile.owner,
        region: selectedFile.region,
        phone: selectedFile.phone,
        date: selectedFile.date,
        address: selectedFile.address,
        transactionType: selectedFile.transactionType,
        buildingType: selectedFile.buildingType,
        direction: selectedFile.direction,
        unit: selectedFile.unit,
        totalPrice: selectedFile.totalPrice,
        unitPrice: selectedFile.unitPrice,
        mortgagePrice: selectedFile.mortgagePrice,
        unitsPerFloor: selectedFile.unitsPerFloor,
        totalFloors: selectedFile.totalFloors,
        totalArea: selectedFile.totalArea,
        renovated: selectedFile.renovated,
        landArea: selectedFile.landArea,
        density: selectedFile.density,
        length: selectedFile.length,
        width: selectedFile.width,
        yard: selectedFile.yard,
        backyard: selectedFile.backyard,
        basement: selectedFile.basement,
        servantRoom: selectedFile.servantRoom,
        porch: selectedFile.porch,
        residential: selectedFile.residential,
        vacant: selectedFile.vacant,
        rentStatus: selectedFile.rentStatus,
        buildingAge: selectedFile.buildingAge,
        facade: selectedFile.facade,
        informationSource: selectedFile.informationSource,
        ownerResidence: selectedFile.ownerResidence,
        documentStatus: selectedFile.documentStatus,
        description: selectedFile.description,
        heating: selectedFile.heating,
        elevator: selectedFile.elevator,
        sauna: selectedFile.sauna,
        jacuzzi: selectedFile.jacuzzi,
        pool: selectedFile.pool,
        videoIntercom: selectedFile.videoIntercom,
        remoteDoor: selectedFile.remoteDoor,
        floors: selectedFile.floors,
      });
    }
  }, [selectedFile]);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== 'string') return;
    clearError();

    try {
      await updatePropertyFile(id, formData);
      setSnackbar({ open: true, message: 'فایل با موفقیت ویرایش شد', severity: 'success' });
      setTimeout(() => {
        router.push(`/dashboard/property-files/${id}`);
      }, 1500);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در ویرایش فایل', severity: 'error' });
    }
  };

  // Check if user can edit this file
  const canEdit = currentUser && selectedFile 
    ? canEditFile(currentUser.role, selectedFile, currentUser.id, currentUser.estateId)
    : false;

  // Redirect if user cannot edit
  useEffect(() => {
    if (selectedFile && currentUser && !canEdit) {
      setSnackbar({ 
        open: true, 
        message: 'شما دسترسی ویرایش این فایل را ندارید', 
        severity: 'error' 
      });
      setTimeout(() => {
        router.push(`/dashboard/property-files/${id}`);
      }, 2000);
    }
  }, [selectedFile, currentUser, canEdit, id, router]);

  if (isLoading || !selectedFile) {
    return (
      <PrivateRoute>
        <DashboardLayout>
          <Loading />
        </DashboardLayout>
      </PrivateRoute>
    );
  }

  if (!canEdit) {
    return (
      <PrivateRoute>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              شما دسترسی ویرایش این فایل را ندارید. در حال انتقال به صفحه جزئیات...
            </div>
          </div>
        </DashboardLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">ویرایش فایل ملکی</h1>

          {error && <ErrorDisplay error={error} />}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نام مالک</label>
                <input
                  type="text"
                  value={formData.owner || ''}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">منطقه</label>
                <input
                  type="text"
                  value={formData.region || ''}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ</label>
                <PersianDatePicker
                  value={formData.date || ''}
                  onChange={(value) => setFormData({ ...formData, date: value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">آدرس</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع معامله</label>
                <select
                  value={formData.transactionType || ''}
                  onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as PropertyTransactionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(transactionTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع ساختمان</label>
                <select
                  value={formData.buildingType || ''}
                  onChange={(e) => setFormData({ ...formData, buildingType: e.target.value as PropertyBuildingType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(buildingTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">واحد</label>
                <input
                  type="text"
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تعداد واحد در هر طبقه</label>
                <input
                  type="number"
                  value={formData.unitsPerFloor || ''}
                  onChange={(e) => setFormData({ ...formData, unitsPerFloor: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تعداد طبقات</label>
                <input
                  type="number"
                  value={formData.totalFloors || ''}
                  onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">زیربنا کلی (متر مربع)</label>
                <input
                  type="number"
                  value={formData.totalArea || ''}
                  onChange={(e) => setFormData({ ...formData, totalArea: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {formData.transactionType === PropertyTransactionType.MORTGAGE ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رهن (ریال)</label>
                    <input
                      type="number"
                      value={formData.mortgagePrice || ''}
                      onChange={(e) => setFormData({ ...formData, mortgagePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اجاره (ریال)</label>
                    <input
                      type="number"
                      value={formData.totalPrice || ''}
                      onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">قیمت کل (ریال)</label>
                    <input
                      type="number"
                      value={formData.totalPrice || ''}
                      onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">قیمت متری (ریال)</label>
                    <input
                      type="number"
                      value={formData.unitPrice || ''}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اصلاحی (متر)</label>
                <input
                  type="number"
                  value={formData.renovated || ''}
                  onChange={(e) => setFormData({ ...formData, renovated: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مساحت زمین (متر مربع)</label>
                <input
                  type="number"
                  value={formData.landArea || ''}
                  onChange={(e) => setFormData({ ...formData, landArea: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">حیاط (متر)</label>
                <input
                  type="number"
                  value={formData.yard || ''}
                  onChange={(e) => setFormData({ ...formData, yard: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">حیاط خلوت (متر)</label>
                <input
                  type="number"
                  value={formData.backyard || ''}
                  onChange={(e) => setFormData({ ...formData, backyard: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">زیرزمین (متر)</label>
                <input
                  type="number"
                  value={formData.basement || ''}
                  onChange={(e) => setFormData({ ...formData, basement: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سرویس مستخدم (متر)</label>
                <input
                  type="number"
                  value={formData.servantRoom || ''}
                  onChange={(e) => setFormData({ ...formData, servantRoom: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">پاسیو (متر)</label>
                <input
                  type="number"
                  value={formData.porch || ''}
                  onChange={(e) => setFormData({ ...formData, porch: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Building-level Equipment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">تجهیزات ساختمان</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.heating || false}
                      onChange={(e) => setFormData({ ...formData, heating: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">شوفاژ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.elevator || false}
                      onChange={(e) => setFormData({ ...formData, elevator: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">آسانسور</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sauna || false}
                      onChange={(e) => setFormData({ ...formData, sauna: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">سونا</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.jacuzzi || false}
                      onChange={(e) => setFormData({ ...formData, jacuzzi: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">جکوزی</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.pool || false}
                      onChange={(e) => setFormData({ ...formData, pool: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">استخر</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.videoIntercom || false}
                      onChange={(e) => setFormData({ ...formData, videoIntercom: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">آیفون تصویری</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.remoteDoor || false}
                      onChange={(e) => setFormData({ ...formData, remoteDoor: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">درب ریموت</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <FiSave className="w-5 h-5" />
                <span>ذخیره تغییرات</span>
              </button>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/property-files/${id}`)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>

        {snackbar.open && (
          <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 rounded-lg shadow-lg z-50 ${
            snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {snackbar.message}
          </div>
        )}
      </DashboardLayout>
    </PrivateRoute>
  );
}

