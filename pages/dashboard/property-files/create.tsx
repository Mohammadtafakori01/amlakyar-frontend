import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FiArrowRight, FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import { usePropertyFiles } from '../../../src/domains/property-files/hooks/usePropertyFiles';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import {
  PropertyFileZone,
  PropertyTransactionType,
  PropertyBuildingType,
  PropertyDirection,
  FloorDetails,
  CreatePropertyFileRequest,
} from '../../../src/domains/property-files/types';
import { getAvailableZones } from '../../../src/shared/utils/rbacUtils';
import { getCurrentDate } from '../../../src/shared/utils/dateUtils';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';

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

const directionLabels: Record<PropertyDirection, string> = {
  [PropertyDirection.NORTH]: 'شمالی',
  [PropertyDirection.SOUTH]: 'جنوبی',
  [PropertyDirection.EAST]: 'شرقی',
  [PropertyDirection.WEST]: 'غربی',
};

export default function CreatePropertyFilePage() {
  const router = useRouter();
  const { createPropertyFile, isLoading, error, clearError } = usePropertyFiles();
  const { user: currentUser } = useAuth();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState<Partial<CreatePropertyFileRequest>>({
    uniqueCode: undefined,
    zone: undefined,
    owner: '',
    region: '',
    phone: '',
    date: getCurrentDate(),
    address: '',
    transactionType: PropertyTransactionType.SALE,
    buildingType: PropertyBuildingType.APARTMENT,
    direction: undefined,
    floors: [],
    unit: '',
    totalPrice: undefined,
    unitPrice: undefined,
    mortgagePrice: undefined,
    unitsPerFloor: undefined,
    totalFloors: undefined,
    totalArea: undefined,
    renovated: undefined,
    landArea: undefined,
    density: '',
    length: undefined,
    width: undefined,
    yard: undefined,
    backyard: undefined,
    basement: undefined,
    servantRoom: undefined,
    porch: undefined,
    residential: true,
    vacant: false,
    rentStatus: false,
    buildingAge: undefined,
    facade: '',
    informationSource: '',
    ownerResidence: '',
    documentStatus: '',
    description: '',
    heating: false,
    elevator: false,
    sauna: false,
    jacuzzi: false,
    pool: false,
    videoIntercom: false,
    remoteDoor: false,
  });

  const [currentFloor, setCurrentFloor] = useState<Partial<FloorDetails>>({
    floorNumber: 1,
    title: '',
    area: undefined,
    bedrooms: undefined,
    phone: false,
    kitchen: false,
    openKitchen: false,
    bathroom: undefined,
    flooring: '',
    parking: false,
    storage: false,
    fireplace: false,
    cooler: false,
    fanCoil: false,
    chiller: false,
    package: false,
  });

  const availableZones = useMemo(() => {
    return currentUser ? getAvailableZones(currentUser.role) : [];
  }, [currentUser]);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    if (availableZones.length === 1) {
      setFormData((prev) => ({ ...prev, zone: availableZones[0] }));
    }
  }, [availableZones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.zone || !formData.owner || !formData.region || !formData.date || !formData.address) {
      setSnackbar({ open: true, message: 'لطفاً فیلدهای الزامی را پر کنید', severity: 'error' });
      return;
    }

    try {
      // Remove empty uniqueCode to let backend generate it automatically
      const submitData = { ...formData };
      if (!submitData.uniqueCode || (typeof submitData.uniqueCode === 'string' && submitData.uniqueCode.trim() === '')) {
        delete submitData.uniqueCode;
      }
      await createPropertyFile(submitData as CreatePropertyFileRequest);
      setSnackbar({ open: true, message: 'فایل با موفقیت ایجاد شد', severity: 'success' });
      setTimeout(() => {
        router.push('/dashboard/property-files');
      }, 1500);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در ایجاد فایل', severity: 'error' });
    }
  };

  const addFloor = () => {
    if (!currentFloor.floorNumber) {
      setSnackbar({ open: true, message: 'لطفاً شماره طبقه را وارد کنید', severity: 'error' });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      floors: [...(prev.floors || []), currentFloor as FloorDetails],
    }));
    setCurrentFloor({
      floorNumber: (formData.floors?.length || 0) + 2,
      title: '',
      area: undefined,
      bedrooms: undefined,
      phone: false,
      kitchen: false,
      openKitchen: false,
      bathroom: undefined,
      flooring: '',
      parking: false,
      storage: false,
      fireplace: false,
      cooler: false,
      fanCoil: false,
      chiller: false,
      package: false,
    });
  };

  const removeFloor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      floors: prev.floors?.filter((_, i) => i !== index) || [],
    }));
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">ایجاد فایل ملکی جدید</h1>
            <button
              onClick={() => router.push('/dashboard/property-files')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              انصراف
            </button>
          </div>

          {error && <ErrorDisplay error={error} />}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">اطلاعات پایه</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کد یکتا <span className="text-gray-500 text-xs">(اختیاری - در صورت عدم وارد کردن به صورت خودکار تولید می‌شود)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.uniqueCode || ''}
                    onChange={(e) => setFormData({ ...formData, uniqueCode: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="خالی بگذارید تا به صورت خودکار تولید شود"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    زونکن <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.zone || ''}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value as PropertyFileZone })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">انتخاب کنید...</option>
                    {availableZones.map((zone) => (
                      <option key={zone} value={zone}>{zoneLabels[zone]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام مالک <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    منطقه <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاریخ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    آدرس <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Transaction and Building Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">اطلاعات معامله و ساختمان</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع معامله <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.transactionType}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as PropertyTransactionType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {Object.entries(transactionTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع ساختمان <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.buildingType}
                    onChange={(e) => setFormData({ ...formData, buildingType: e.target.value as PropertyBuildingType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {Object.entries(buildingTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">جهت</label>
                  <select
                    value={formData.direction || ''}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value as PropertyDirection || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">انتخاب کنید...</option>
                    {Object.entries(directionLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">واحد</label>
                  <input
                    type="text"
                    value={formData.unit}
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
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">جزئیات اضافی</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">تراکم</label>
                  <input
                    type="text"
                    value={formData.density}
                    onChange={(e) => setFormData({ ...formData, density: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">طول (متر)</label>
                  <input
                    type="number"
                    value={formData.length || ''}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عرض (متر)</label>
                  <input
                    type="number"
                    value={formData.width || ''}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">زیرزمین (متراژ)</label>
                  <input
                    type="number"
                    value={formData.basement || ''}
                    onChange={(e) => setFormData({ ...formData, basement: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سن بنا (سال)</label>
                  <input
                    type="number"
                    value={formData.buildingAge || ''}
                    onChange={(e) => setFormData({ ...formData, buildingAge: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.residential}
                    onChange={(e) => setFormData({ ...formData, residential: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>مسکونی</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="vacant-rent"
                      checked={formData.vacant && !formData.rentStatus}
                      onChange={() => setFormData({ ...formData, vacant: true, rentStatus: false })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>تخلیه</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="vacant-rent"
                      checked={formData.rentStatus && !formData.vacant}
                      onChange={() => setFormData({ ...formData, rentStatus: true, vacant: false })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>در اجاره</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="vacant-rent"
                      checked={!formData.vacant && !formData.rentStatus}
                      onChange={() => setFormData({ ...formData, vacant: false, rentStatus: false })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>هیچکدام</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نما</label>
                  <input
                    type="text"
                    value={formData.facade}
                    onChange={(e) => setFormData({ ...formData, facade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">منبع اطلاعاتی</label>
                  <input
                    type="text"
                    value={formData.informationSource}
                    onChange={(e) => setFormData({ ...formData, informationSource: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">محل سکونت مالک</label>
                  <input
                    type="text"
                    value={formData.ownerResidence}
                    onChange={(e) => setFormData({ ...formData, ownerResidence: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت سند</label>
                  <input
                    type="text"
                    value={formData.documentStatus}
                    onChange={(e) => setFormData({ ...formData, documentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
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

            {/* Floors */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">اطلاعات طبقات</h2>
              
              {/* Basic Floor Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">شماره طبقه *</label>
                  <input
                    type="number"
                    value={currentFloor.floorNumber || ''}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, floorNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
                  <input
                    type="text"
                    value={currentFloor.title || ''}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">زیربنا (متر مربع)</label>
                  <input
                    type="number"
                    value={currentFloor.area || ''}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, area: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تعداد خواب</label>
                  <input
                    type="number"
                    value={currentFloor.bedrooms || ''}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تعداد سرویس</label>
                  <input
                    type="number"
                    value={currentFloor.bathroom || ''}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, bathroom: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">کف پوش</label>
                  <input
                    type="text"
                    value={currentFloor.flooring || ''}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, flooring: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Boolean Fields - Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.phone || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, phone: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">تلفن</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.kitchen || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, kitchen: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">آشپزخانه</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.openKitchen || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, openKitchen: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">آشپزخانه اوپن</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.parking || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, parking: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">پارکینگ</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.storage || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, storage: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">انباری</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.fireplace || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, fireplace: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">شومینه</span>
                </label>
              </div>

              {/* Equipment - Row 2 (Unit/Floor level) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.cooler || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, cooler: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">کولر</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.fanCoil || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, fanCoil: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">فن کوئل</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.chiller || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, chiller: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">چیلر</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentFloor.package || false}
                    onChange={(e) => setCurrentFloor({ ...currentFloor, package: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">پکیج</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addFloor}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>افزودن طبقه</span>
                </button>
              </div>

              {formData.floors && formData.floors.length > 0 && (
                <div className="space-y-2">
                  {formData.floors.map((floor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">طبقه {floor.floorNumber}: {floor.title || 'بدون عنوان'}</span>
                        {floor.area && <span className="text-gray-600 mr-2"> - {floor.area} متر مربع</span>}
                        {floor.bedrooms && <span className="text-gray-600 mr-2"> - {floor.bedrooms} خواب</span>}
                        {floor.bathroom && <span className="text-gray-600 mr-2"> - {floor.bathroom} سرویس</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFloor(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loading /> : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>ذخیره</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/property-files')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>

        {/* Snackbar */}
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

