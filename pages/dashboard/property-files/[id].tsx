import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiEdit2, FiTrash2, FiArrowRight } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import { usePropertyFiles } from '../../../src/domains/property-files/hooks/usePropertyFiles';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { canEditFile, canDeleteFile } from '../../../src/shared/utils/rbacUtils';
import { PropertyTransactionType } from '../../../src/domains/property-files/types';
import { formatToPersianDate } from '../../../src/shared/utils/dateUtils';
import { formatPrice } from '../../../src/shared/utils/numberUtils';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';

const zoneLabels: Record<string, string> = {
  OFFICE_MASTER: 'زونکن املاک',
  INTERNAL_COOPERATION: 'تعاون داخلی',
  EXTERNAL_NETWORK: 'تعاون خارجی',
  PERSONAL: 'فایل شخصی',
};

const transactionTypeLabels: Record<string, string> = {
  SALE: 'فروش',
  RENT: 'اجاره',
  MORTGAGE: 'رهن',
  PARTNERSHIP: 'مشارکت',
  EXCHANGE: 'معاوضه',
};

const buildingTypeLabels: Record<string, string> = {
  VILLA: 'ویلا',
  APARTMENT: 'آپارتمان',
  COMMERCIAL: 'تجاری',
  OUTSIDE: 'بیرونی',
  OLD: 'کلنگی',
  OFFICE: 'اداری',
  SHOP: 'مغازه',
};

export default function PropertyFileDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { selectedFile, fetchPropertyFileById, deletePropertyFile, isLoading, error } = usePropertyFiles();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPropertyFileById(id);
    }
  }, [id, fetchPropertyFileById]);

  const handleDelete = async () => {
    if (!selectedFile || !window.confirm('آیا از حذف این فایل اطمینان دارید؟')) {
      return;
    }

    try {
      await deletePropertyFile(selectedFile.id);
      router.push('/dashboard/property-files');
    } catch (err: any) {
      alert(err.message || 'خطا در حذف فایل');
    }
  };

  if (isLoading || !selectedFile) {
    return (
      <PrivateRoute>
        <DashboardLayout>
          <Loading />
        </DashboardLayout>
      </PrivateRoute>
    );
  }

  const canEdit = currentUser ? canEditFile(currentUser.role, selectedFile, currentUser.id, currentUser.estateId) : false;
  const canDelete = currentUser ? canDeleteFile(currentUser.role, selectedFile, currentUser.id, currentUser.estateId) : false;

  return (
    <PrivateRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard/property-files')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <FiArrowRight className="w-5 h-5" />
              <span>بازگشت به لیست</span>
            </button>
            <div className="flex gap-2">
              {canEdit && (
                <button
                  onClick={() => router.push(`/dashboard/property-files/edit/${selectedFile.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FiEdit2 className="w-5 h-5" />
                  <span>ویرایش</span>
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <FiTrash2 className="w-5 h-5" />
                  <span>حذف</span>
                </button>
              )}
            </div>
          </div>

          {error && <ErrorDisplay error={error} />}

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h1 className="text-2xl font-bold">جزئیات فایل ملکی</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">کد یکتا</label>
                <p className="text-lg font-semibold">{selectedFile.uniqueCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">زونکن</label>
                <p className="text-lg">{zoneLabels[selectedFile.zone]}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">مالک</label>
                <p className="text-lg">{selectedFile.owner}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">منطقه</label>
                <p className="text-lg">{selectedFile.region}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">شماره تماس</label>
                <p className="text-lg">{selectedFile.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">تاریخ</label>
                <p className="text-lg">{formatToPersianDate(selectedFile.date)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">آدرس</label>
                <p className="text-lg">{selectedFile.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">نوع معامله</label>
                <p className="text-lg">{transactionTypeLabels[selectedFile.transactionType]}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">مورد آگهی</label>
                <p className="text-lg">{buildingTypeLabels[selectedFile.buildingType]}</p>
              </div>
              {selectedFile.direction && (
                <div>
                  <label className="text-sm font-medium text-gray-500">جهت ساختمان</label>
                  <p className="text-lg">
                    {selectedFile.direction === 'NORTH' ? 'شمالی' :
                     selectedFile.direction === 'SOUTH' ? 'جنوبی' :
                     selectedFile.direction === 'EAST' ? 'شرقی' :
                     selectedFile.direction === 'WEST' ? 'غربی' : selectedFile.direction}
                  </p>
                </div>
              )}
              {selectedFile.unit && (
                <div>
                  <label className="text-sm font-medium text-gray-500">شماره واحد</label>
                  <p className="text-lg">{selectedFile.unit}</p>
                </div>
              )}
              {selectedFile.transactionType === PropertyTransactionType.MORTGAGE ? (
                <>
                  {selectedFile.mortgagePrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">رهن</label>
                      <p className="text-lg">{formatPrice(selectedFile.mortgagePrice)} ریال</p>
                    </div>
                  )}
                  {selectedFile.totalPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">اجاره</label>
                      <p className="text-lg">{formatPrice(selectedFile.totalPrice)} ریال</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {selectedFile.totalPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">قیمت کل</label>
                      <p className="text-lg">{formatPrice(selectedFile.totalPrice)} ریال</p>
                    </div>
                  )}
                  {selectedFile.unitPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">قیمت متری</label>
                      <p className="text-lg">{formatPrice(selectedFile.unitPrice)} ریال</p>
                    </div>
                  )}
                </>
              )}
              {selectedFile.unitsPerFloor && (
                <div>
                  <label className="text-sm font-medium text-gray-500">تعداد واحد در هر طبقه</label>
                  <p className="text-lg">{selectedFile.unitsPerFloor}</p>
                </div>
              )}
              {selectedFile.totalFloors && (
                <div>
                  <label className="text-sm font-medium text-gray-500">تعداد طبقات</label>
                  <p className="text-lg">{selectedFile.totalFloors}</p>
                </div>
              )}
              {selectedFile.totalArea && (
                <div>
                  <label className="text-sm font-medium text-gray-500">زیربنا کلی</label>
                  <p className="text-lg">{selectedFile.totalArea} متر مربع</p>
                </div>
              )}
              {selectedFile.landArea && (
                <div>
                  <label className="text-sm font-medium text-gray-500">مساحت زمین ساختمان</label>
                  <p className="text-lg">{selectedFile.landArea} متر مربع</p>
                </div>
              )}
              {selectedFile.buildingAge && (
                <div>
                  <label className="text-sm font-medium text-gray-500">سن بنا</label>
                  <p className="text-lg">{selectedFile.buildingAge} سال</p>
                </div>
              )}
              {selectedFile.facade && (
                <div>
                  <label className="text-sm font-medium text-gray-500">نما</label>
                  <p className="text-lg">{selectedFile.facade}</p>
                </div>
              )}
              {selectedFile.documentStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-500">وضعیت سند</label>
                  <p className="text-lg">{selectedFile.documentStatus}</p>
                </div>
              )}
            </div>

            {/* Building-level Equipment */}
            {(selectedFile.heating || selectedFile.elevator || selectedFile.sauna || selectedFile.jacuzzi || selectedFile.pool || selectedFile.videoIntercom || selectedFile.remoteDoor) && (
              <div>
                <h2 className="text-xl font-semibold mb-4">تجهیزات ساختمان</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.heating && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">شوفاژ</span>}
                  {selectedFile.elevator && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">آسانسور</span>}
                  {selectedFile.sauna && <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">سونا</span>}
                  {selectedFile.jacuzzi && <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">جکوزی</span>}
                  {selectedFile.pool && <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">استخر</span>}
                  {selectedFile.videoIntercom && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">آیفون تصویری</span>}
                  {selectedFile.remoteDoor && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">درب ریموت</span>}
                </div>
              </div>
            )}

            {/* Additional Features */}
            {((selectedFile as any).hasServantRoom || (selectedFile as any).hasYard || (selectedFile as any).hasPorch) && (
              <div>
                <h2 className="text-xl font-semibold mb-4">امکانات اضافی</h2>
                <div className="flex flex-wrap gap-2">
                  {(selectedFile as any).hasServantRoom && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">سرایداری</span>}
                  {(selectedFile as any).hasYard && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">حیاط</span>}
                  {(selectedFile as any).hasPorch && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">پاسیو</span>}
                </div>
              </div>
            )}

            {selectedFile.floors && selectedFile.floors.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">اطلاعات طبقات</h2>
                <div className="space-y-4">
                  {selectedFile.floors.map((floor, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-lg mb-3">طبقه {floor.floorNumber}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {floor.area && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">زیربنا: </span>
                            <span className="text-sm">{floor.area} متر مربع</span>
                          </div>
                        )}
                        {floor.bedrooms && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">تعداد خواب: </span>
                            <span className="text-sm">{floor.bedrooms}</span>
                          </div>
                        )}
                        {floor.bathroom && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">تعداد سرویس: </span>
                            <span className="text-sm">{floor.bathroom}</span>
                          </div>
                        )}
                        {floor.flooring && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">کف پوش: </span>
                            <span className="text-sm">{floor.flooring}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {floor.phone && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">تلفن</span>}
                          {floor.kitchen && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">آشپزخانه</span>}
                          {floor.openKitchen && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">آشپزخانه اوپن</span>}
                          {floor.parking && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">پارکینگ</span>}
                          {floor.storage && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">انباری</span>}
                          {floor.fireplace && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">شومینه</span>}
                          {floor.cooler && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">کولر</span>}
                          {floor.fanCoil && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">فن کوئل</span>}
                          {floor.chiller && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">چیلر</span>}
                          {floor.package && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">پکیج</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedFile.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">توضیحات</label>
                <p className="text-lg">{selectedFile.description}</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </PrivateRoute>
  );
}

