import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiHome, FiMap } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { usePropertyAds } from '../../../src/domains/property-ads/hooks/usePropertyAds';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { State, City, Neighborhood } from '../../../src/domains/property-ads/types';
import { UserRole } from '../../../src/shared/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';

type TabType = 'states' | 'cities' | 'neighborhoods';

export default function LocationsPage() {
  const {
    states,
    cities,
    neighborhoods,
    isLoadingStates,
    isLoadingCities,
    isLoadingNeighborhoods,
    isLoading,
    error,
    fetchAllStates,
    fetchAllCities,
    createState,
    updateState,
    deleteState,
    createCity,
    updateCity,
    deleteCity,
    fetchNeighborhoodsByCity,
    createNeighborhood,
    updateNeighborhood,
    deleteNeighborhood,
    clearError,
  } = usePropertyAds();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('states');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null);
  const [selectedCityForNeighborhood, setSelectedCityForNeighborhood] = useState<string>('');

  // Form states
  const [stateName, setStateName] = useState('');
  const [cityName, setCityName] = useState('');
  const [cityStateId, setCityStateId] = useState('');
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const [neighborhoodCityId, setNeighborhoodCityId] = useState('');

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    fetchAllStates();
    fetchAllCities();
  }, [fetchAllStates, fetchAllCities]);

  useEffect(() => {
    if (selectedCityForNeighborhood) {
      fetchNeighborhoodsByCity(selectedCityForNeighborhood);
    }
  }, [selectedCityForNeighborhood, fetchNeighborhoodsByCity]);

  const handleCreateState = async () => {
    if (!stateName.trim()) {
      setSnackbar({ open: true, message: 'لطفا نام استان را وارد کنید', severity: 'error' });
      return;
    }

    try {
      await createState({ name: stateName.trim() }).unwrap();
      setSnackbar({ open: true, message: 'استان با موفقیت ایجاد شد', severity: 'success' });
      closeStateModal();
      fetchAllStates();
      fetchAllCities();
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'خطا در ایجاد استان';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleUpdateState = async () => {
    if (!editingState || !stateName.trim()) {
      return;
    }

    try {
      await updateState(editingState.id, { name: stateName.trim() }).unwrap();
      setSnackbar({ open: true, message: 'استان با موفقیت به‌روزرسانی شد', severity: 'success' });
      closeStateModal();
      fetchAllStates();
      fetchAllCities();
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'خطا در به‌روزرسانی استان';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteState = async (stateId: string) => {
    const state = states.find((s) => s.id === stateId);
    if (state?.cities && state.cities.length > 0) {
      setSnackbar({ open: true, message: 'نمی‌توان استان دارای شهر را حذف کرد', severity: 'error' });
      return;
    }

    if (!window.confirm('آیا از حذف این استان اطمینان دارید؟')) {
      return;
    }

    try {
      await deleteState(stateId);
      setSnackbar({ open: true, message: 'استان با موفقیت حذف شد', severity: 'success' });
      fetchAllStates();
      fetchAllCities();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در حذف استان', severity: 'error' });
    }
  };

  const handleCreateCity = async () => {
    if (!cityName.trim() || !cityStateId) {
      setSnackbar({ open: true, message: 'لطفا نام شهر و استان را انتخاب کنید', severity: 'error' });
      return;
    }

    try {
      await createCity({ name: cityName.trim(), stateId: cityStateId }).unwrap();
      setSnackbar({ open: true, message: 'شهر با موفقیت ایجاد شد', severity: 'success' });
      closeCityModal();
      fetchAllCities();
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'خطا در ایجاد شهر';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleUpdateCity = async () => {
    if (!editingCity || !cityName.trim() || !cityStateId) {
      return;
    }

    try {
      await updateCity(editingCity.id, { name: cityName.trim(), stateId: cityStateId }).unwrap();
      setSnackbar({ open: true, message: 'شهر با موفقیت به‌روزرسانی شد', severity: 'success' });
      closeCityModal();
      fetchAllCities();
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'خطا در به‌روزرسانی شهر';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    if (city?.neighborhoods && city.neighborhoods.length > 0) {
      setSnackbar({ open: true, message: 'نمی‌توان شهر دارای محله را حذف کرد', severity: 'error' });
      return;
    }

    if (!window.confirm('آیا از حذف این شهر اطمینان دارید؟')) {
      return;
    }

    try {
      await deleteCity(cityId);
      setSnackbar({ open: true, message: 'شهر با موفقیت حذف شد', severity: 'success' });
      fetchAllCities();
      if (selectedCityForNeighborhood === cityId) {
        setSelectedCityForNeighborhood('');
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در حذف شهر', severity: 'error' });
    }
  };

  const handleCreateNeighborhood = async () => {
    if (!neighborhoodName.trim() || !neighborhoodCityId) {
      setSnackbar({ open: true, message: 'لطفا نام محله و شهر را انتخاب کنید', severity: 'error' });
      return;
    }

    try {
      await createNeighborhood({ name: neighborhoodName.trim(), cityId: neighborhoodCityId }).unwrap();
      setSnackbar({ open: true, message: 'محله با موفقیت ایجاد شد', severity: 'success' });
      closeNeighborhoodModal();
      if (selectedCityForNeighborhood) {
        fetchNeighborhoodsByCity(selectedCityForNeighborhood);
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'خطا در ایجاد محله';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleUpdateNeighborhood = async () => {
    if (!editingNeighborhood || !neighborhoodName.trim() || !neighborhoodCityId) {
      return;
    }

    try {
      await updateNeighborhood(editingNeighborhood.id, {
        name: neighborhoodName.trim(),
        cityId: neighborhoodCityId,
      }).unwrap();
      setSnackbar({ open: true, message: 'محله با موفقیت به‌روزرسانی شد', severity: 'success' });
      closeNeighborhoodModal();
      if (selectedCityForNeighborhood) {
        fetchNeighborhoodsByCity(selectedCityForNeighborhood);
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'خطا در به‌روزرسانی محله';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteNeighborhood = async (neighborhoodId: string) => {
    if (!window.confirm('آیا از حذف این محله اطمینان دارید؟')) {
      return;
    }

    try {
      await deleteNeighborhood(neighborhoodId);
      setSnackbar({ open: true, message: 'محله با موفقیت حذف شد', severity: 'success' });
      if (selectedCityForNeighborhood) {
        fetchNeighborhoodsByCity(selectedCityForNeighborhood);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در حذف محله', severity: 'error' });
    }
  };

  const openStateEditModal = (state: State) => {
    setEditingState(state);
    setStateName(state.name);
    setShowStateModal(true);
  };

  const openCityEditModal = (city: City) => {
    setEditingCity(city);
    setCityName(city.name);
    setCityStateId(city.stateId);
    setShowCityModal(true);
  };

  const openNeighborhoodEditModal = (neighborhood: Neighborhood) => {
    setEditingNeighborhood(neighborhood);
    setNeighborhoodName(neighborhood.name);
    setNeighborhoodCityId(neighborhood.cityId);
    setShowNeighborhoodModal(true);
  };

  const closeStateModal = () => {
    setShowStateModal(false);
    setEditingState(null);
    setStateName('');
  };

  const closeCityModal = () => {
    setShowCityModal(false);
    setEditingCity(null);
    setCityName('');
    setCityStateId('');
  };

  const closeNeighborhoodModal = () => {
    setShowNeighborhoodModal(false);
    setEditingNeighborhood(null);
    setNeighborhoodName('');
    setNeighborhoodCityId('');
  };

  const displayedNeighborhoods = selectedCityForNeighborhood
    ? neighborhoods.filter((n) => n.cityId === selectedCityForNeighborhood)
    : [];

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.MASTER]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">مدیریت موقعیت‌ها</h1>
            </div>

            <ErrorDisplay error={error} />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('states')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'states'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiMap className="inline ml-2" />
                استان‌ها
              </button>
              <button
                onClick={() => setActiveTab('cities')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'cities'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiHome className="inline ml-2" />
                شهرها
              </button>
              <button
                onClick={() => setActiveTab('neighborhoods')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'neighborhoods'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiMapPin className="inline ml-2" />
                محله‌ها
              </button>
            </div>

            {/* States Tab */}
            {activeTab === 'states' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      closeStateModal();
                      setShowStateModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
                  >
                    <FiPlus />
                    افزودن استان
                  </button>
                </div>

                {isLoadingStates ? (
                  <Loading />
                ) : states.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">استانی یافت نشد.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <table className="min-w-full text-right text-sm text-gray-800">
                      <thead>
                        <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                          <th className="px-4 py-3">نام استان</th>
                          <th className="px-4 py-3">تعداد شهرها</th>
                          <th className="px-4 py-3">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {states.map((state) => (
                          <tr key={state.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold">{state.name}</td>
                            <td className="px-4 py-3">{state.cities?.length || 0}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openStateEditModal(state)}
                                  className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                                  title="ویرایش"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteState(state.id)}
                                  className="rounded-full border border-red-200 p-2 text-red-600 hover:border-red-300 hover:bg-red-50"
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
            )}

            {/* Cities Tab */}
            {activeTab === 'cities' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      closeCityModal();
                      setShowCityModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
                  >
                    <FiPlus />
                    افزودن شهر
                  </button>
                </div>

                {isLoadingCities ? (
                  <Loading />
                ) : cities.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">شهری یافت نشد.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <table className="min-w-full text-right text-sm text-gray-800">
                      <thead>
                        <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                          <th className="px-4 py-3">نام شهر</th>
                          <th className="px-4 py-3">استان</th>
                          <th className="px-4 py-3">تعداد محله‌ها</th>
                          <th className="px-4 py-3">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cities.map((city) => (
                          <tr key={city.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold">{city.name}</td>
                            <td className="px-4 py-3">{city.state?.name || '-'}</td>
                            <td className="px-4 py-3">{city.neighborhoods?.length || 0}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openCityEditModal(city)}
                                  className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                                  title="ویرایش"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCity(city.id)}
                                  className="rounded-full border border-red-200 p-2 text-red-600 hover:border-red-300 hover:bg-red-50"
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
            )}

            {/* Neighborhoods Tab */}
            {activeTab === 'neighborhoods' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-semibold text-gray-600">فیلتر بر اساس شهر</label>
                    <select
                      value={selectedCityForNeighborhood}
                      onChange={(e) => setSelectedCityForNeighborhood(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">همه شهرها</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name} ({city.state?.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      closeNeighborhoodModal();
                      setShowNeighborhoodModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
                  >
                    <FiPlus />
                    افزودن محله
                  </button>
                </div>

                {isLoadingNeighborhoods ? (
                  <Loading />
                ) : displayedNeighborhoods.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">
                      {selectedCityForNeighborhood ? 'محله‌ای برای این شهر یافت نشد.' : 'لطفا یک شهر انتخاب کنید یا محله جدید ایجاد کنید.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <table className="min-w-full text-right text-sm text-gray-800">
                      <thead>
                        <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                          <th className="px-4 py-3">نام محله</th>
                          <th className="px-4 py-3">شهر</th>
                          <th className="px-4 py-3">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedNeighborhoods.map((neighborhood) => {
                          const city = cities.find((c) => c.id === neighborhood.cityId);
                          return (
                            <tr key={neighborhood.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 font-semibold">{neighborhood.name}</td>
                              <td className="px-4 py-3">{city?.name || '-'}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openNeighborhoodEditModal(neighborhood)}
                                    className="rounded-full border border-gray-200 p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                                    title="ویرایش"
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNeighborhood(neighborhood.id)}
                                    className="rounded-full border border-red-200 p-2 text-red-600 hover:border-red-300 hover:bg-red-50"
                                    title="حذف"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* State Modal */}
            {showStateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    {editingState ? 'ویرایش استان' : 'افزودن استان'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">نام استان</label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="مثال: تهران"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingState ? handleUpdateState : handleCreateState}
                        disabled={isLoading || !stateName.trim()}
                        className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        {editingState ? 'به‌روزرسانی' : 'ایجاد'}
                      </button>
                      <button
                        onClick={closeStateModal}
                        className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* City Modal */}
            {showCityModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">{editingCity ? 'ویرایش شهر' : 'افزودن شهر'}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">نام شهر</label>
                      <input
                        type="text"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="مثال: تهران"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">استان</label>
                      <select
                        value={cityStateId}
                        onChange={(e) => setCityStateId(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        <option value="">انتخاب استان</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingCity ? handleUpdateCity : handleCreateCity}
                        disabled={isLoading || !cityName.trim() || !cityStateId}
                        className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        {editingCity ? 'به‌روزرسانی' : 'ایجاد'}
                      </button>
                      <button
                        onClick={closeCityModal}
                        className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Neighborhood Modal */}
            {showNeighborhoodModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    {editingNeighborhood ? 'ویرایش محله' : 'افزودن محله'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">نام محله</label>
                      <input
                        type="text"
                        value={neighborhoodName}
                        onChange={(e) => setNeighborhoodName(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="مثال: ونک"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">شهر</label>
                      <select
                        value={neighborhoodCityId}
                        onChange={(e) => setNeighborhoodCityId(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        <option value="">انتخاب شهر</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name} ({city.state?.name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingNeighborhood ? handleUpdateNeighborhood : handleCreateNeighborhood}
                        disabled={isLoading || !neighborhoodName.trim() || !neighborhoodCityId}
                        className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        {editingNeighborhood ? 'به‌روزرسانی' : 'ایجاد'}
                      </button>
                      <button
                        onClick={closeNeighborhoodModal}
                        className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        انصراف
                      </button>
                    </div>
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
