import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FiArrowRight, FiArrowLeft, FiSave, FiPlus, FiTrash2, FiLayers, FiMaximize2, FiHome, FiDroplet } from 'react-icons/fi';
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
import { UserRole } from '../../../src/shared/types';
import { getCurrentDate } from '../../../src/shared/utils/dateUtils';
import { generateUniqueCodeWithCounter } from '../../../src/shared/utils/uniqueCodeGenerator';
import { sanitizePropertyFileData } from '../../../src/shared/utils/dataSanitizer';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';
import PersianDatePicker from '../../../src/shared/components/common/PersianDatePicker';

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
  [PropertyBuildingType.OLD]: 'کلنگی',
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | string[]>>({});
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
    hasServantRoom: false,
    hasYard: false,
    hasPorch: false,
  });

  const [currentFloor, setCurrentFloor] = useState<Partial<FloorDetails>>({
    floorNumber: 1,
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
    if (!currentUser) return [];
    
    // If user is not MASTER or ADMIN, only show PERSONAL zone when creating
    if (currentUser.role !== UserRole.MASTER && currentUser.role !== UserRole.ADMIN) {
      return [PropertyFileZone.PERSONAL];
    }
    
    // For MASTER and ADMIN, show all available zones
    return getAvailableZones(currentUser.role);
  }, [currentUser]);

  // Format number with thousand separators
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse formatted number back to number
  const parseFormattedNumber = (str: string): number | undefined => {
    const cleaned = str.replace(/,/g, '');
    if (!cleaned) return undefined;
    const num = Number(cleaned);
    return isNaN(num) ? undefined : num;
  };

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

  // Auto-calculate totalPrice when totalArea and unitPrice are provided
  useEffect(() => {
    if (formData.totalArea && formData.unitPrice && formData.transactionType !== PropertyTransactionType.MORTGAGE) {
      const calculatedTotal = formData.totalArea * formData.unitPrice;
      setFormData((prev) => ({ ...prev, totalPrice: calculatedTotal }));
    }
  }, [formData.totalArea, formData.unitPrice, formData.transactionType]);

  // Check if currentFloor has any data (except floorNumber)
  const hasFloorData = (): boolean => {
    return !!(
      (currentFloor.area !== undefined && currentFloor.area !== null) ||
      (currentFloor.bedrooms !== undefined && currentFloor.bedrooms !== null) ||
      (currentFloor.bathroom !== undefined && currentFloor.bathroom !== null) ||
      (currentFloor.flooring && currentFloor.flooring.trim() !== '') ||
      currentFloor.phone ||
      currentFloor.kitchen ||
      currentFloor.openKitchen ||
      currentFloor.parking ||
      currentFloor.storage ||
      currentFloor.fireplace ||
      currentFloor.cooler ||
      currentFloor.fanCoil ||
      currentFloor.chiller ||
      currentFloor.package
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.zone || !formData.owner || !formData.region || !formData.date || !formData.address) {
      setSnackbar({ open: true, message: 'لطفاً فیلدهای الزامی را پر کنید', severity: 'error' });
      return;
    }

    // Auto-add floor if there's data in currentFloor (except floorNumber)
    if (hasFloorData()) {
      const floorNumber = currentFloor.floorNumber || (formData.floors?.length || 0) + 1;
      // Create floor object directly
      const newFloor: FloorDetails = {
        floorNumber: Number(floorNumber),
        area: currentFloor.area !== undefined && currentFloor.area !== null 
          ? Number(currentFloor.area) 
          : undefined,
        bedrooms: currentFloor.bedrooms !== undefined && currentFloor.bedrooms !== null 
          ? Number(currentFloor.bedrooms) 
          : undefined,
        bathroom: currentFloor.bathroom !== undefined && currentFloor.bathroom !== null 
          ? Number(currentFloor.bathroom) 
          : undefined,
        flooring: currentFloor.flooring && currentFloor.flooring.trim() !== '' 
          ? currentFloor.flooring.trim() 
          : undefined,
        phone: Boolean(currentFloor.phone || false),
        kitchen: Boolean(currentFloor.kitchen || false),
        openKitchen: Boolean(currentFloor.openKitchen || false),
        parking: Boolean(currentFloor.parking || false),
        storage: Boolean(currentFloor.storage || false),
        fireplace: Boolean(currentFloor.fireplace || false),
        cooler: Boolean(currentFloor.cooler || false),
        fanCoil: Boolean(currentFloor.fanCoil || false),
        chiller: Boolean(currentFloor.chiller || false),
        package: Boolean(currentFloor.package || false),
      };
      // Add floor to formData and clear currentFloor
      const updatedFloors = [...(formData.floors || []), newFloor];
      setFormData((prev) => ({
        ...prev,
        floors: updatedFloors,
      }));
      setCurrentFloor({
        floorNumber: updatedFloors.length + 1,
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
      // Show success message
      setSnackbar({ 
        open: true, 
        message: `طبقه ${floorNumber} به صورت خودکار اضافه شد`, 
        severity: 'success' 
      });
      // Submit with updated floors
      submitFormData(updatedFloors);
      return;
    }

    // If no floor data, submit normally
    submitFormData();
  };

  const submitFormData = async (floorsOverride?: FloorDetails[]) => {
    // Clear previous errors
    setFieldErrors({});
    
    try {
      // Generate unique code if not provided
      const submitData = { ...formData };
      if (!submitData.uniqueCode || (typeof submitData.uniqueCode === 'string' && submitData.uniqueCode.trim() === '')) {
        submitData.uniqueCode = generateUniqueCodeWithCounter();
      }
      // Ensure floors is always included (even if empty array)
      submitData.floors = floorsOverride || submitData.floors || [];
      // Sanitize data before sending
      const sanitizedData = sanitizePropertyFileData(submitData);
      
      console.log('=== SUBMITTING DATA (CREATE) ===');
      console.log('Sanitized data:', sanitizedData);
      
      // Use unwrap() to throw error if rejected
      const response = await createPropertyFile(sanitizedData as CreatePropertyFileRequest).unwrap();
      
      console.log('=== SUCCESS (CREATE) ===');
      console.log('Response:', response);
      
      // Only show success and redirect if we get here (no error thrown)
      setSnackbar({ open: true, message: 'فایل با موفقیت ایجاد شد', severity: 'success' });
      setTimeout(() => {
        router.push('/dashboard/property-files');
      }, 1500);
    } catch (err: any) {
      console.log('=== ERROR CAUGHT (CREATE) ===');
      console.log('Error object:', err);
      console.log('Error type:', typeof err);
      console.log('Error response:', err.response);
      console.log('Error response status:', err.response?.status);
      console.log('Error response data:', err.response?.data);
      
      // Handle Redux thunk rejectWithValue - error might be the error object itself
      const errorData = err.response?.data || err;
      
      // Parse validation errors - check for new structure first (errors object)
      const errors: Record<string, string | string[]> = {};
      
      if (errorData?.errors) {
        console.log('Using new errors structure');
        // New structure: { errors: { field: [messages] } }
        Object.keys(errorData.errors).forEach((field) => {
          const messages = errorData.errors[field];
          if (Array.isArray(messages) && messages.length > 0) {
            // Handle nested fields like "floors.0.floorNumber"
            // Store all messages as array, or single message as string
            errors[field] = messages.length === 1 ? messages[0] : messages;
          } else if (typeof messages === 'string') {
            errors[field] = messages;
          }
        });
      } else if (errorData?.message) {
        console.log('Using old message structure');
        // Old structure: { message: string | string[] }
        const messages = Array.isArray(errorData.message) 
          ? errorData.message 
          : [errorData.message];
        
        messages.forEach((msg: string) => {
          // Map error messages to field names
          if (msg.includes('تلفن') || msg.toLowerCase().includes('phone')) {
            errors.phone = msg;
          } else if (msg.includes('مالک') || msg.toLowerCase().includes('owner')) {
            errors.owner = msg;
          } else if (msg.includes('منطقه') || msg.toLowerCase().includes('region')) {
            errors.region = msg;
          } else if (msg.includes('آدرس') || msg.toLowerCase().includes('address')) {
            errors.address = msg;
          } else if (msg.includes('قیمت') || msg.toLowerCase().includes('price')) {
            if (msg.includes('کل') || msg.toLowerCase().includes('total')) {
              errors.totalPrice = msg;
            } else if (msg.includes('متری') || msg.toLowerCase().includes('unit')) {
              errors.unitPrice = msg;
            }
          } else if (msg.includes('مساحت') || msg.toLowerCase().includes('area')) {
            if (msg.includes('زمین') || msg.toLowerCase().includes('land')) {
              errors.landArea = msg;
            } else {
              errors.totalArea = msg;
            }
          }
        });
      }
      
      if (Object.keys(errors).length > 0) {
        // Set field errors
        setFieldErrors(errors);
        console.log('Field errors set:', errors);
        
        // Scroll to first error after a short delay to ensure DOM is updated
        setTimeout(() => {
          const firstErrorField = Object.keys(errors)[0];
          console.log('First error field:', firstErrorField);
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          console.log('Found element:', element);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        // Show a general error message at the top
        setSnackbar({ 
          open: true, 
          message: 'لطفاً خطاهای اعتبارسنجی را برطرف کنید', 
          severity: 'error' 
        });
      } else {
        console.log('No field errors found, showing snackbar');
        setSnackbar({ open: true, message: err.message || 'خطا در ایجاد فایل', severity: 'error' });
      }
      
      // IMPORTANT: Don't redirect on error - keep form open with data
      console.log('=== ERROR HANDLING COMPLETE (CREATE) - NO REDIRECT ===');
      // Return early to prevent any further execution
      return;
    }
  };

  const addFloor = () => {
    if (!currentFloor.floorNumber) {
      setSnackbar({ open: true, message: 'لطفاً شماره طبقه را وارد کنید', severity: 'error' });
      return;
    }
    // Create a clean floor object with all fields
    const newFloor: FloorDetails = {
      floorNumber: Number(currentFloor.floorNumber),
      area: currentFloor.area !== undefined && currentFloor.area !== null 
        ? Number(currentFloor.area) 
        : undefined,
      bedrooms: currentFloor.bedrooms !== undefined && currentFloor.bedrooms !== null 
        ? Number(currentFloor.bedrooms) 
        : undefined,
      bathroom: currentFloor.bathroom !== undefined && currentFloor.bathroom !== null 
        ? Number(currentFloor.bathroom) 
        : undefined,
      flooring: currentFloor.flooring && currentFloor.flooring.trim() !== '' 
        ? currentFloor.flooring.trim() 
        : undefined,
      phone: Boolean(currentFloor.phone || false),
      kitchen: Boolean(currentFloor.kitchen || false),
      openKitchen: Boolean(currentFloor.openKitchen || false),
      parking: Boolean(currentFloor.parking || false),
      storage: Boolean(currentFloor.storage || false),
      fireplace: Boolean(currentFloor.fireplace || false),
      cooler: Boolean(currentFloor.cooler || false),
      fanCoil: Boolean(currentFloor.fanCoil || false),
      chiller: Boolean(currentFloor.chiller || false),
      package: Boolean(currentFloor.package || false),
    };
    setFormData((prev) => {
      const newFloors = [...(prev.floors || []), newFloor];
      // Show success message
      setSnackbar({ 
        open: true, 
        message: `طبقه ${newFloor.floorNumber} با موفقیت اضافه شد`, 
        severity: 'success' 
      });
      // Update currentFloor with the new length
      setCurrentFloor({
        floorNumber: newFloors.length + 1,
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
      return {
        ...prev,
        floors: newFloors,
      };
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

          {error && (
            <ErrorDisplay 
              error={typeof error === 'string' ? error : 'خطای نامشخص'}
            />
          )}

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
                    name="owner"
                    value={formData.owner}
                    onChange={(e) => {
                      setFormData({ ...formData, owner: e.target.value });
                      if (fieldErrors.owner) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.owner;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      fieldErrors.owner 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                    required
                  />
                  {fieldErrors.owner && (
                    <div className="mt-1">
                      {Array.isArray(fieldErrors.owner) ? (
                        fieldErrors.owner.map((msg, idx) => (
                          <p key={idx} className="text-sm text-red-600">{msg}</p>
                        ))
                      ) : (
                        <p className="text-sm text-red-600">{fieldErrors.owner}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    منطقه <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={(e) => {
                      setFormData({ ...formData, region: e.target.value });
                      if (fieldErrors.region) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.region;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      fieldErrors.region 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                    required
                  />
                  {fieldErrors.region && (
                    <div className="mt-1">
                      {Array.isArray(fieldErrors.region) ? (
                        fieldErrors.region.map((msg, idx) => (
                          <p key={idx} className="text-sm text-red-600">{msg}</p>
                        ))
                      ) : (
                        <p className="text-sm text-red-600">{fieldErrors.region}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      // Clear error when user starts typing
                      if (fieldErrors.phone) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.phone;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="09123456789"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      fieldErrors.phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <div className="mt-1">
                      {Array.isArray(fieldErrors.phone) ? (
                        fieldErrors.phone.map((msg, idx) => (
                          <p key={idx} className="text-sm text-red-600">{msg}</p>
                        ))
                      ) : (
                        <p className="text-sm text-red-600">{fieldErrors.phone}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاریخ <span className="text-red-500">*</span>
                  </label>
                  <PersianDatePicker
                    value={formData.date}
                    onChange={(value) => setFormData({ ...formData, date: value })}
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
                    مورد آگهی <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.buildingType}
                    onChange={(e) => setFormData({ ...formData, buildingType: e.target.value as PropertyBuildingType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {Object.entries(buildingTypeLabels)
                      .filter(([value]) => value !== PropertyBuildingType.OUTSIDE)
                      .map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">جهت ساختمان</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">شماره واحد</label>
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


                {formData.transactionType === PropertyTransactionType.MORTGAGE ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رهن (ریال)</label>
                      <input
                        type="text"
                        value={formatNumber(formData.mortgagePrice)}
                        onChange={(e) => {
                          const parsed = parseFormattedNumber(e.target.value);
                          setFormData({ ...formData, mortgagePrice: parsed });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اجاره (ریال)</label>
                      <input
                        type="text"
                        value={formatNumber(formData.totalPrice)}
                        onChange={(e) => {
                          const parsed = parseFormattedNumber(e.target.value);
                          setFormData({ ...formData, totalPrice: parsed });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">زیربنا کلی (متر مربع)</label>
                      <input
                        type="number"
                        value={formData.totalArea || ''}
                        onChange={(e) => setFormData({ ...formData, totalArea: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">قیمت متری (ریال)</label>
                      <input
                        type="text"
                        value={formatNumber(formData.unitPrice)}
                        onChange={(e) => {
                          const parsed = parseFormattedNumber(e.target.value);
                          setFormData({ ...formData, unitPrice: parsed });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">قیمت کل (ریال)</label>
                      <input
                        type="text"
                        value={formatNumber(formData.totalPrice)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">مساحت زمین ساختمان (متر مربع)</label>
                  <input
                    type="number"
                    value={formData.landArea || ''}
                    onChange={(e) => setFormData({ ...formData, landArea: e.target.value ? Number(e.target.value) : undefined })}
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
                  <select
                    name="facade"
                    value={formData.facade || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, facade: e.target.value || undefined });
                      if (fieldErrors.facade) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.facade;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      fieldErrors.facade 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                  >
                    <option value="">انتخاب کنید...</option>
                    <option value="سنگی">سنگی</option>
                    <option value="آجر">آجر</option>
                    <option value="کامپوزیت">کامپوزیت</option>
                    <option value="سیمانی">سیمانی</option>
                    <option value="نما ترکیبی">نما ترکیبی</option>
                    <option value="سایر">سایر</option>
                  </select>
                  {fieldErrors.facade && (
                    <div className="mt-1">
                      {Array.isArray(fieldErrors.facade) ? (
                        fieldErrors.facade.map((msg, idx) => (
                          <p key={idx} className="text-sm text-red-600">{msg}</p>
                        ))
                      ) : (
                        <p className="text-sm text-red-600">{fieldErrors.facade}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت سند</label>
                  <select
                    name="documentStatus"
                    value={formData.documentStatus || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, documentStatus: e.target.value || undefined });
                      if (fieldErrors.documentStatus) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.documentStatus;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      fieldErrors.documentStatus 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                  >
                    <option value="">انتخاب کنید...</option>
                    <option value="شخصی">شخصی</option>
                    <option value="اوقاف">اوقاف</option>
                    <option value="بنیاد">بنیاد</option>
                    <option value="سایر">سایر</option>
                  </select>
                  {fieldErrors.documentStatus && (
                    <div className="mt-1">
                      {Array.isArray(fieldErrors.documentStatus) ? (
                        fieldErrors.documentStatus.map((msg, idx) => (
                          <p key={idx} className="text-sm text-red-600">{msg}</p>
                        ))
                      ) : (
                        <p className="text-sm text-red-600">{fieldErrors.documentStatus}</p>
                      )}
                    </div>
                  )}
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

              {/* Additional Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">امکانات اضافی</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasServantRoom || false}
                      onChange={(e) => setFormData({ ...formData, hasServantRoom: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">سرایداری</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasYard || false}
                      onChange={(e) => setFormData({ ...formData, hasYard: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">حیاط</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasPorch || false}
                      onChange={(e) => setFormData({ ...formData, hasPorch: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">پاسیو</span>
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

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={addFloor}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg font-medium text-base"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>افزودن طبقه به لیست</span>
                </button>
              </div>

              {formData.floors && formData.floors.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiLayers className="w-5 h-5 text-primary-600" />
                    <span>طبقات اضافه شده ({formData.floors.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {formData.floors.map((floor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800 text-lg">طبقه {floor.floorNumber}</span>
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            {floor.area && (
                              <span className="flex items-center gap-1">
                                <FiMaximize2 className="w-4 h-4" />
                                {floor.area} متر مربع
                              </span>
                            )}
                            {floor.bedrooms && (
                              <span className="flex items-center gap-1">
                                <FiHome className="w-4 h-4" />
                                {floor.bedrooms} خواب
                              </span>
                            )}
                            {floor.bathroom && (
                              <span className="flex items-center gap-1">
                                <FiDroplet className="w-4 h-4" />
                                {floor.bathroom} سرویس
                              </span>
                            )}
                            {floor.flooring && (
                              <span className="flex items-center gap-1">
                                <FiLayers className="w-4 h-4" />
                                {floor.flooring}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {floor.phone && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">تلفن</span>}
                            {floor.kitchen && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">آشپزخانه</span>}
                            {floor.openKitchen && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">آشپزخانه اوپن</span>}
                            {floor.parking && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">پارکینگ</span>}
                            {floor.storage && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">انباری</span>}
                            {floor.fireplace && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">شومینه</span>}
                            {floor.cooler && <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs">کولر</span>}
                            {floor.fanCoil && <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">فن کوئل</span>}
                            {floor.chiller && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">چیلر</span>}
                            {floor.package && <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">پکیج</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            removeFloor(index);
                            setSnackbar({ open: true, message: `طبقه ${floor.floorNumber} حذف شد`, severity: 'success' });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                          title="حذف طبقه"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
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

