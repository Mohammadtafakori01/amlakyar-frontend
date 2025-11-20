import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiArrowRight, FiArrowLeft, FiSave, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../src/shared/components/guards/RoleGuard';
import { useContracts } from '../../../src/domains/contracts/hooks/useContracts';
import { useAuth } from '../../../src/domains/auth/hooks/useAuth';
import { UserRole } from '../../../src/shared/types';
import {
  ContractType,
  ContractStatus,
  PartyType,
  PartyRole,
  PartyEntityType,
  ShareType,
  RelationshipType,
  AddPartyRequest,
  SaveDraftRequest,
} from '../../../src/domains/contracts/types';
import Loading from '../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../src/shared/components/common/ErrorDisplay';

type Step = 1 | 2 | 3 | 4 | 5;

export default function CreateContractPage() {
  const router = useRouter();
  const { createContractStep1, createContractStep2, updateProperty, updateTerms, saveDraft, finalizeContract, selectedContract, fetchContractById, isLoading, error } = useContracts();
  const { user: currentUser } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [contractId, setContractId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Step 1: Contract Type
  const [contractType, setContractType] = useState<ContractType>(ContractType.RENTAL);

  // Step 2: Parties
  const [parties, setParties] = useState<AddPartyRequest[]>([]);
  const [currentParty, setCurrentParty] = useState<Partial<AddPartyRequest>>({
    partyType: PartyType.LANDLORD,
    partyRole: PartyRole.PRINCIPAL,
    entityType: PartyEntityType.NATURAL,
    shareType: ShareType.DANG,
    shareValue: 0,
  });

  // Step 3: Property Details
  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: '',
    usageType: '',
    address: '',
    postalCode: '',
    registrationNumber: '',
    subRegistrationNumber: '',
    mainRegistrationNumber: '',
    section: '',
    area: '',
    areaUnit: 'متر مربع',
    ownershipDocumentType: '',
    ownershipDocumentSerial: '',
    ownershipDocumentOwner: '',
    storageCount: '',
    storageNumbers: [] as string[],
    parkingCount: '',
    parkingNumbers: [] as string[],
    amenities: {
      flooring: '',
      bathroom: '',
      water: '',
      meetingHall: false,
      club: false,
      waterCommons: false,
      hotWaterSystem: '',
      ventilationSystem: '',
    },
  });

  // Step 4: Terms
  const [terms, setTerms] = useState({
    evictionNoticeDays: '',
    dailyPenaltyAmount: '',
    dailyDelayPenalty: '',
    dailyOccupancyPenalty: '',
    deliveryDate: '',
    deliveryDelayPenalty: '',
    usagePurpose: '',
    occupantCount: '',
    customTerms: '',
  });

  // Step 5: Finalize
  const [draftData, setDraftData] = useState({
    contractDate: '',
    startDate: '',
    endDate: '',
    rentalAmount: '',
    depositAmount: '',
  });

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  useEffect(() => {
    if (selectedContract && selectedContract.id) {
      console.log('Setting contractId from selectedContract:', selectedContract.id);
      setContractId(selectedContract.id);
    }
  }, [selectedContract]);
  
  // Fallback: if contractId is null but selectedContract exists, use it
  useEffect(() => {
    if (!contractId && selectedContract) {
      // Check if it's a property object (has contractId or contract.id) or a contract object
      const contractIdFromSelected = (selectedContract as any).contractId || (selectedContract as any).contract?.id || selectedContract.id;
      if (contractIdFromSelected) {
        console.log('Fallback: Setting contractId from selectedContract:', contractIdFromSelected);
        setContractId(contractIdFromSelected);
      }
    }
  }, [contractId, selectedContract]);
  
  // Helper function to get the current contractId (with fallback to selectedContract)
  const getCurrentContractId = (): string | null => {
    // Always prefer the local contractId state - this is the source of truth
    if (contractId) {
      console.log('getCurrentContractId: Using local contractId:', contractId);
      return contractId;
    }
    
    // If selectedContract exists, check if it's a contract, property, or terms object
    if (selectedContract) {
      // If it has a contract property (property/terms object), use contract.id
      if ((selectedContract as any).contract?.id) {
        const id = (selectedContract as any).contract.id;
        console.log('getCurrentContractId: Using contract.id from selectedContract:', id);
        return id;
      }
      // If it has a contractId property (property/terms object), use that
      if ((selectedContract as any).contractId) {
        const id = (selectedContract as any).contractId;
        console.log('getCurrentContractId: Using contractId from selectedContract:', id);
        return id;
      }
      // Otherwise, assume it's a contract object and use id
      if (selectedContract.id) {
        console.log('getCurrentContractId: Using id from selectedContract:', selectedContract.id);
        // NOTE: This should be safe now since we fixed Redux slice to extract contract from property/terms
        return selectedContract.id;
      }
    }
    console.warn('getCurrentContractId: No contractId found');
    return null;
  };

  const handleStep1Submit = async () => {
    try {
      console.log('Creating contract step 1 with type:', contractType);
      const result = await createContractStep1({ type: contractType });
      // Check if the action was fulfilled
      if (result && 'type' in result) {
        if (result.type.endsWith('/fulfilled')) {
          const contract = (result as any).payload;
          console.log('Contract created successfully:', contract);
          if (contract && contract.id) {
            setContractId(contract.id);
            setCurrentStep(2);
            setSnackbar({ open: true, message: 'قرارداد با موفقیت ایجاد شد', severity: 'success' });
          } else {
            console.error('Contract created but no ID found:', contract);
            setSnackbar({ open: true, message: 'قرارداد ایجاد شد اما شناسه دریافت نشد', severity: 'error' });
          }
        } else if (result.type.endsWith('/rejected')) {
          const errorMessage = (result as any).payload || 'خطا در ایجاد قرارداد';
          console.error('Contract creation rejected:', errorMessage);
          setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
      } else {
        console.error('Unexpected result format:', result);
        setSnackbar({ open: true, message: 'خطا در ایجاد قرارداد', severity: 'error' });
      }
    } catch (err: any) {
      console.error('Error in handleStep1Submit:', err);
      setSnackbar({ open: true, message: err.message || 'خطا در ایجاد قرارداد', severity: 'error' });
    }
  };

  const handleAddParty = () => {
    if (!currentParty.partyType || !currentParty.partyRole || !currentParty.entityType || !currentParty.shareType || !currentParty.shareValue) {
      setSnackbar({ open: true, message: 'لطفا تمام فیلدهای الزامی را پر کنید', severity: 'error' });
      return;
    }

    // Validate natural person
    if (currentParty.entityType === PartyEntityType.NATURAL) {
      if (!currentParty.firstName || !currentParty.lastName || !currentParty.nationalId) {
        setSnackbar({ open: true, message: 'لطفا اطلاعات شخص حقیقی را کامل کنید', severity: 'error' });
        return;
      }
      if (currentParty.nationalId.length !== 10) {
        setSnackbar({ open: true, message: 'کد ملی باید 10 رقم باشد', severity: 'error' });
        return;
      }
    }

    // Validate legal person
    if (currentParty.entityType === PartyEntityType.LEGAL) {
      if (!currentParty.companyName || !currentParty.companyNationalId) {
        setSnackbar({ open: true, message: 'لطفا اطلاعات شخص حقوقی را کامل کنید', severity: 'error' });
        return;
      }
      if (currentParty.companyNationalId.length !== 11) {
        setSnackbar({ open: true, message: 'شناسه ملی شرکت باید 11 رقم باشد', severity: 'error' });
        return;
      }
    }

    // Validate representative/attorney
    if (currentParty.partyRole !== PartyRole.PRINCIPAL) {
      if (!currentParty.principalPartyId || !currentParty.relationshipType || !currentParty.relationshipDocumentNumber || !currentParty.relationshipDocumentDate) {
        setSnackbar({ open: true, message: 'لطفا اطلاعات نماینده/وکیل را کامل کنید', severity: 'error' });
        return;
      }
    }

    setParties([...parties, currentParty as AddPartyRequest]);
    setCurrentParty({
      partyType: PartyType.LANDLORD,
      partyRole: PartyRole.PRINCIPAL,
      entityType: PartyEntityType.NATURAL,
      shareType: ShareType.DANG,
      shareValue: 0,
    });
  };

  const handleRemoveParty = (index: number) => {
    setParties(parties.filter((_, i) => i !== index));
  };

  const handleStep2Submit = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد ایجاد نشده است. لطفا از مرحله 1 شروع کنید.', severity: 'error' });
      return;
    }
    
    if (parties.length === 0) {
      setSnackbar({ open: true, message: 'حداقل یک طرف قرارداد باید اضافه شود', severity: 'error' });
      return;
    }

    // Validate shares
    const landlordParties = parties.filter(p => p.partyType === PartyType.LANDLORD);
    const tenantParties = parties.filter(p => p.partyType === PartyType.TENANT);

    if (landlordParties.length > 0) {
      const landlordShareType = landlordParties[0].shareType;
      const landlordTotal = landlordParties.reduce((sum, p) => sum + p.shareValue, 0);
      const expectedTotal = landlordShareType === ShareType.DANG ? 6 : 100;
      if (landlordTotal !== expectedTotal) {
        setSnackbar({ open: true, message: `مجموع سهم موجرین باید ${expectedTotal} ${landlordShareType === ShareType.DANG ? 'دانگ' : 'درصد'} باشد`, severity: 'error' });
        return;
      }
    }

    if (tenantParties.length > 0) {
      const tenantShareType = tenantParties[0].shareType;
      const tenantTotal = tenantParties.reduce((sum, p) => sum + p.shareValue, 0);
      const expectedTotal = tenantShareType === ShareType.DANG ? 6 : 100;
      if (tenantTotal !== expectedTotal) {
        setSnackbar({ open: true, message: `مجموع سهم مستاجرین باید ${expectedTotal} ${tenantShareType === ShareType.DANG ? 'دانگ' : 'درصد'} باشد`, severity: 'error' });
        return;
      }
    }

    try {
      console.log('Submitting step 2 with contractId:', currentContractId);
      
      // Verify contract exists before proceeding
      try {
        await fetchContractById(currentContractId);
        console.log('Contract verified for step 2');
      } catch (verifyErr: any) {
        console.error('Contract verification failed in step 2:', verifyErr);
        const errorMsg = verifyErr.response?.data?.message || verifyErr.message || 'قرارداد یافت نشد';
        setSnackbar({ open: true, message: `خطا: ${errorMsg}. لطفا از مرحله 1 شروع کنید.`, severity: 'error' });
        return;
      }
      
      await createContractStep2(currentContractId, { parties });
      setCurrentStep(3);
      setSnackbar({ open: true, message: 'طرفین قرارداد با موفقیت ثبت شدند', severity: 'success' });
    } catch (err: any) {
      console.error('Error in step 2:', err);
      const errorMessage = err.response?.data?.message || err.message || 'خطا در ثبت طرفین';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleStep3Submit = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد ایجاد نشده است. لطفا از مرحله 1 شروع کنید.', severity: 'error' });
      return;
    }

    // Validate required fields
    if (!propertyDetails.propertyType || !propertyDetails.propertyType.trim()) {
      setSnackbar({ open: true, message: 'نوع ملک الزامی است', severity: 'error' });
      return;
    }
    if (!propertyDetails.usageType || !propertyDetails.usageType.trim()) {
      setSnackbar({ open: true, message: 'نوع کاربری الزامی است', severity: 'error' });
      return;
    }
    if (!propertyDetails.address || !propertyDetails.address.trim()) {
      setSnackbar({ open: true, message: 'آدرس الزامی است', severity: 'error' });
      return;
    }
    if (!propertyDetails.area || parseFloat(propertyDetails.area) <= 0) {
      setSnackbar({ open: true, message: 'مساحت باید یک عدد مثبت باشد', severity: 'error' });
      return;
    }

    try {
      console.log('Submitting step 3 with contractId:', currentContractId);
      
      // Verify contract exists before proceeding
      try {
        await fetchContractById(currentContractId);
        console.log('Contract verified for step 3');
      } catch (verifyErr: any) {
        console.error('Contract verification failed in step 3:', verifyErr);
        const errorMsg = verifyErr.response?.data?.message || verifyErr.message || 'قرارداد یافت نشد';
        setSnackbar({ open: true, message: `خطا: ${errorMsg}. لطفا از مرحله 1 شروع کنید.`, severity: 'error' });
        return;
      }
      
      const propertyData: any = {
        propertyType: propertyDetails.propertyType.trim(),
        usageType: propertyDetails.usageType.trim(),
        address: propertyDetails.address.trim(),
        area: parseFloat(propertyDetails.area),
        areaUnit: propertyDetails.areaUnit || undefined,
        postalCode: propertyDetails.postalCode?.trim() || undefined,
        registrationNumber: propertyDetails.registrationNumber?.trim() || undefined,
        subRegistrationNumber: propertyDetails.subRegistrationNumber?.trim() || undefined,
        mainRegistrationNumber: propertyDetails.mainRegistrationNumber?.trim() || undefined,
        section: propertyDetails.section?.trim() || undefined,
        ownershipDocumentType: propertyDetails.ownershipDocumentType?.trim() || undefined,
        ownershipDocumentSerial: propertyDetails.ownershipDocumentSerial?.trim() || undefined,
        ownershipDocumentOwner: propertyDetails.ownershipDocumentOwner?.trim() || undefined,
        storageCount: propertyDetails.storageCount ? parseInt(propertyDetails.storageCount) : undefined,
        storageNumbers: propertyDetails.storageNumbers?.length > 0 ? propertyDetails.storageNumbers : undefined,
        parkingCount: propertyDetails.parkingCount ? parseInt(propertyDetails.parkingCount) : undefined,
        parkingNumbers: propertyDetails.parkingNumbers?.length > 0 ? propertyDetails.parkingNumbers : undefined,
        amenities: propertyDetails.amenities || undefined,
      };
      const result = await updateProperty(currentContractId, propertyData);
      // The response is a property object, not a contract object
      // Extract the contract ID from the response (it has contractId or contract.id)
      const propertyResponse = result as any;
      const responseContractId = propertyResponse?.contractId || propertyResponse?.contract?.id;
      console.log('Property update response:', propertyResponse);
      console.log('Extracted contractId from response:', responseContractId);
      console.log('Current contractId:', currentContractId);
      
      // CRITICAL: Always update contractId from the response to ensure we have the correct one
      // The property response has the correct contractId, we must use it
      if (responseContractId) {
        if (responseContractId !== currentContractId) {
          console.log('Updating contractId from property response:', responseContractId, '(was:', currentContractId, ')');
        }
        // Always set it, even if it's the same, to ensure consistency
        setContractId(responseContractId);
      } else {
        console.warn('No contractId found in property response, keeping current:', currentContractId);
      }
      setCurrentStep(4);
      setSnackbar({ open: true, message: 'جزئیات ملک با موفقیت ثبت شد', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در ثبت جزئیات ملک', severity: 'error' });
    }
  };

  const handleStep4Submit = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد ایجاد نشده است. لطفا از مرحله 1 شروع کنید.', severity: 'error' });
      return;
    }

    try {
      console.log('Submitting step 4 with contractId:', currentContractId);
      
      // First, verify the contract exists
      try {
        console.log('Verifying contract exists...');
        await fetchContractById(currentContractId);
        console.log('Contract verified, proceeding with update');
      } catch (verifyErr: any) {
        console.error('Contract verification failed:', verifyErr);
        const errorMsg = verifyErr.response?.data?.message || verifyErr.message || 'قرارداد یافت نشد';
        setSnackbar({ open: true, message: `خطا: ${errorMsg}. لطفا از مرحله 1 شروع کنید.`, severity: 'error' });
        return;
      }
      
      const termsData: any = {
        evictionNoticeDays: terms.evictionNoticeDays ? parseInt(terms.evictionNoticeDays) : undefined,
        dailyPenaltyAmount: terms.dailyPenaltyAmount ? parseFloat(terms.dailyPenaltyAmount) : undefined,
        dailyDelayPenalty: terms.dailyDelayPenalty ? parseFloat(terms.dailyDelayPenalty) : undefined,
        dailyOccupancyPenalty: terms.dailyOccupancyPenalty ? parseFloat(terms.dailyOccupancyPenalty) : undefined,
        deliveryDate: terms.deliveryDate || undefined,
        deliveryDelayPenalty: terms.deliveryDelayPenalty ? parseFloat(terms.deliveryDelayPenalty) : undefined,
        usagePurpose: terms.usagePurpose || undefined,
        occupantCount: terms.occupantCount ? parseInt(terms.occupantCount) : undefined,
        customTerms: terms.customTerms || undefined,
      };
      const result = await updateTerms(currentContractId, termsData);
      console.log('Terms update response:', result);
      
      // The response is a terms object, not a contract object
      // Extract the contract ID from the response (it has contractId or contract.id)
      const termsResponse = result as any;
      const responseContractId = termsResponse?.contractId || termsResponse?.contract?.id;
      console.log('Extracted contractId from terms response:', responseContractId);
      console.log('Current contractId:', currentContractId);
      
      // CRITICAL: Always update contractId from the response to ensure we have the correct one
      // The terms response has the correct contractId, we must use it
      if (responseContractId) {
        if (responseContractId !== currentContractId) {
          console.log('Updating contractId from terms response:', responseContractId, '(was:', currentContractId, ')');
        }
        // Always set it, even if it's the same, to ensure consistency
        setContractId(responseContractId);
      } else {
        console.warn('No contractId found in terms response, keeping current:', currentContractId);
      }
      
      setCurrentStep(5);
      setSnackbar({ open: true, message: 'شرایط قرارداد با موفقیت ثبت شد', severity: 'success' });
    } catch (err: any) {
      console.error('Error in step 4:', err);
      const errorMessage = err.response?.data?.message || err.message || 'خطا در ثبت شرایط';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSaveDraft = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد ایجاد نشده است. لطفا از مرحله 1 شروع کنید.', severity: 'error' });
      return;
    }

    try {
      const draft: SaveDraftRequest = {
        contractDate: draftData.contractDate || undefined,
        startDate: draftData.startDate || undefined,
        endDate: draftData.endDate || undefined,
        rentalAmount: draftData.rentalAmount ? parseFloat(draftData.rentalAmount) : undefined,
        depositAmount: draftData.depositAmount ? parseFloat(draftData.depositAmount) : undefined,
      };
      await saveDraft(currentContractId, draft);
      setSnackbar({ open: true, message: 'پیش‌نویس با موفقیت ذخیره شد', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در ذخیره پیش‌نویس', severity: 'error' });
    }
  };

  const handleFinalize = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد ایجاد نشده است. لطفا از مرحله 1 شروع کنید.', severity: 'error' });
      return;
    }

    try {
      console.log('Finalizing contract with contractId:', currentContractId);
      
      // Verify contract exists before finalizing
      try {
        await fetchContractById(currentContractId);
        console.log('Contract verified for finalize');
      } catch (verifyErr: any) {
        console.error('Contract verification failed in finalize:', verifyErr);
        const errorMsg = verifyErr.response?.data?.message || verifyErr.message || 'قرارداد یافت نشد';
        setSnackbar({ open: true, message: `خطا: ${errorMsg}. لطفا از مرحله 1 شروع کنید.`, severity: 'error' });
        return;
      }
      
      // IMPORTANT: Save financial data before finalizing
      // The finalizeContract endpoint doesn't accept financial data, so we need to save it first
      const draft: SaveDraftRequest = {
        contractDate: draftData.contractDate || undefined,
        startDate: draftData.startDate || undefined,
        endDate: draftData.endDate || undefined,
        rentalAmount: draftData.rentalAmount ? parseFloat(draftData.rentalAmount) : undefined,
        depositAmount: draftData.depositAmount ? parseFloat(draftData.depositAmount) : undefined,
      };
      
      // Only update if there's data to save
      const hasFinancialData = draft.rentalAmount || draft.depositAmount || draft.contractDate || draft.startDate || draft.endDate;
      if (hasFinancialData) {
        console.log('Saving financial data before finalizing...');
        await saveDraft(currentContractId, draft);
        console.log('Financial data saved successfully');
      }
      
      const result = await finalizeContract(currentContractId);
      console.log('Finalize response:', result);
      
      // The response might be a contract object or have nested structure
      // Extract contract ID if needed
      const responseContractId = (result as any)?.id || (result as any)?.contractId || (result as any)?.contract?.id;
      if (responseContractId && responseContractId !== currentContractId) {
        console.log('Contract ID from finalize response:', responseContractId);
        setContractId(responseContractId);
      }
      
      setSnackbar({ open: true, message: 'قرارداد با موفقیت نهایی شد', severity: 'success' });
      setTimeout(() => {
        router.push('/dashboard/contracts');
      }, 2000);
    } catch (err: any) {
      console.error('Error in finalize:', err);
      const errorMessage = err.response?.data?.message || err.message || 'خطا در نهایی‌سازی قرارداد';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">مرحله 1: انتخاب نوع قرارداد</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">نوع قرارداد</label>
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value as ContractType)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value={ContractType.RENTAL}>اجاره‌نامه</option>
            <option value={ContractType.PURCHASE}>مبایعه‌نامه</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const landlordParties = parties.filter(p => p.partyType === PartyType.LANDLORD);
    const tenantParties = parties.filter(p => p.partyType === PartyType.TENANT);
    const principalParties = parties.filter(p => p.partyRole === PartyRole.PRINCIPAL);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">مرحله 2: ثبت طرفین قرارداد</h2>
        
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">افزودن طرف قرارداد</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">نوع طرف</label>
              <select
                value={currentParty.partyType || ''}
                onChange={(e) => setCurrentParty({ ...currentParty, partyType: e.target.value as PartyType })}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value={PartyType.LANDLORD}>موجر</option>
                <option value={PartyType.TENANT}>مستاجر</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">نقش</label>
              <select
                value={currentParty.partyRole || ''}
                onChange={(e) => setCurrentParty({ ...currentParty, partyRole: e.target.value as PartyRole })}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value={PartyRole.PRINCIPAL}>اصیل</option>
                <option value={PartyRole.REPRESENTATIVE}>نماینده</option>
                <option value={PartyRole.ATTORNEY}>وکیل</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">نوع شخصیت</label>
              <select
                value={currentParty.entityType || ''}
                onChange={(e) => setCurrentParty({ ...currentParty, entityType: e.target.value as PartyEntityType })}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value={PartyEntityType.NATURAL}>حقیقی</option>
                <option value={PartyEntityType.LEGAL}>حقوقی</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">نوع سهم</label>
              <select
                value={currentParty.shareType || ''}
                onChange={(e) => setCurrentParty({ ...currentParty, shareType: e.target.value as ShareType })}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value={ShareType.DANG}>دانگ</option>
                <option value={ShareType.PERCENTAGE}>درصد</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">مقدار سهم</label>
              <input
                type="number"
                value={currentParty.shareValue || ''}
                onChange={(e) => setCurrentParty({ ...currentParty, shareValue: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          {currentParty.entityType === PartyEntityType.NATURAL ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">نام</label>
                  <input
                    type="text"
                    value={currentParty.firstName || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, firstName: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">نام خانوادگی</label>
                  <input
                    type="text"
                    value={currentParty.lastName || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, lastName: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">کد ملی</label>
                  <input
                    type="text"
                    value={currentParty.nationalId || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, nationalId: e.target.value })}
                    maxLength={10}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">نام شرکت</label>
                  <input
                    type="text"
                    value={currentParty.companyName || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, companyName: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">شناسه ملی شرکت</label>
                  <input
                    type="text"
                    value={currentParty.companyNationalId || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, companyNationalId: e.target.value })}
                    maxLength={11}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">شماره ثبت</label>
                  <input
                    type="text"
                    value={currentParty.registrationNumber || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, registrationNumber: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">روزنامه رسمی</label>
                  <input
                    type="text"
                    value={currentParty.officialGazette || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, officialGazette: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
            </>
          )}

          {currentParty.partyRole !== PartyRole.PRINCIPAL && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">اطلاعات نماینده/وکیل</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">طرف اصیل</label>
                    <select
                      value={currentParty.principalPartyId || ''}
                      onChange={(e) => setCurrentParty({ ...currentParty, principalPartyId: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">انتخاب کنید</option>
                      {principalParties
                        .filter(p => p.partyType === currentParty.partyType)
                        .map((p, idx) => (
                          <option key={idx} value={p.id || `party-${idx}`}>
                            {p.entityType === PartyEntityType.NATURAL
                              ? `${p.firstName} ${p.lastName}`
                              : p.companyName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نوع رابطه</label>
                    <select
                      value={currentParty.relationshipType || ''}
                      onChange={(e) => setCurrentParty({ ...currentParty, relationshipType: e.target.value as RelationshipType })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">انتخاب کنید</option>
                      <option value={RelationshipType.ATTORNEY}>وکالت</option>
                      <option value={RelationshipType.MANAGEMENT}>مدیریت</option>
                      <option value={RelationshipType.GUARDIAN}>ولی</option>
                      <option value={RelationshipType.OTHER}>سایر</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">شماره سند رابطه</label>
                    <input
                      type="text"
                      value={currentParty.relationshipDocumentNumber || ''}
                      onChange={(e) => setCurrentParty({ ...currentParty, relationshipDocumentNumber: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ سند رابطه</label>
                    <input
                      type="date"
                      value={currentParty.relationshipDocumentDate || ''}
                      onChange={(e) => setCurrentParty({ ...currentParty, relationshipDocumentDate: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleAddParty}
            className="w-full rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            افزودن طرف
          </button>
        </div>

        {parties.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">طرفین ثبت شده</h3>
            <div className="space-y-4">
              {parties.map((party, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-semibold">
                      {party.partyType === PartyType.LANDLORD ? 'موجر' : 'مستاجر'} -{' '}
                      {party.partyRole === PartyRole.PRINCIPAL ? 'اصیل' : party.partyRole === PartyRole.REPRESENTATIVE ? 'نماینده' : 'وکیل'} -{' '}
                      {party.entityType === PartyEntityType.NATURAL
                        ? `${party.firstName} ${party.lastName}`
                        : party.companyName}
                    </span>
                    <span className="text-sm text-gray-500 mr-2">
                      ({party.shareValue} {party.shareType === ShareType.DANG ? 'دانگ' : 'درصد'})
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveParty(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div>موجرین: مجموع {landlordParties.reduce((sum, p) => sum + p.shareValue, 0)} {landlordParties[0]?.shareType === ShareType.DANG ? 'دانگ' : 'درصد'}</div>
                <div>مستاجرین: مجموع {tenantParties.reduce((sum, p) => sum + p.shareValue, 0)} {tenantParties[0]?.shareType === ShareType.DANG ? 'دانگ' : 'درصد'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">مرحله 3: ثبت جزئیات ملک (ماده 1)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">نوع ملک</label>
          <input
            type="text"
            value={propertyDetails.propertyType}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, propertyType: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="مثال: آپارتمان"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">نوع کاربری</label>
          <input
            type="text"
            value={propertyDetails.usageType}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, usageType: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="مثال: مسکونی"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-600">آدرس</label>
          <input
            type="text"
            value={propertyDetails.address}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, address: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">کد پستی</label>
          <input
            type="text"
            value={propertyDetails.postalCode}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, postalCode: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">مساحت</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={propertyDetails.area}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, area: e.target.value })}
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <input
              type="text"
              value={propertyDetails.areaUnit}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, areaUnit: e.target.value })}
              className="w-32 rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">شماره ثبت</label>
          <input
            type="text"
            value={propertyDetails.registrationNumber}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, registrationNumber: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">شماره ثبت فرعی</label>
          <input
            type="text"
            value={propertyDetails.subRegistrationNumber}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, subRegistrationNumber: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">شماره ثبت اصلی</label>
          <input
            type="text"
            value={propertyDetails.mainRegistrationNumber}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, mainRegistrationNumber: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">بخش</label>
          <input
            type="text"
            value={propertyDetails.section}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, section: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">نوع سند مالکیت</label>
          <input
            type="text"
            value={propertyDetails.ownershipDocumentType}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, ownershipDocumentType: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="مثال: سند رسمی"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">سریال سند</label>
          <input
            type="text"
            value={propertyDetails.ownershipDocumentSerial}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, ownershipDocumentSerial: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">مالک سند</label>
          <input
            type="text"
            value={propertyDetails.ownershipDocumentOwner}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, ownershipDocumentOwner: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد انباری</label>
          <input
            type="number"
            value={propertyDetails.storageCount}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, storageCount: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد پارکینگ</label>
          <input
            type="number"
            value={propertyDetails.parkingCount}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, parkingCount: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">منصوبات و امکانات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">کفپوش</label>
            <input
              type="text"
              value={propertyDetails.amenities.flooring}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, flooring: e.target.value } })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">سرویس بهداشتی</label>
            <input
              type="text"
              value={propertyDetails.amenities.bathroom}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, bathroom: e.target.value } })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">آب</label>
            <input
              type="text"
              value={propertyDetails.amenities.water}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, water: e.target.value } })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">سیستم آب گرم</label>
            <input
              type="text"
              value={propertyDetails.amenities.hotWaterSystem}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, hotWaterSystem: e.target.value } })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">سیستم تهویه</label>
            <input
              type="text"
              value={propertyDetails.amenities.ventilationSystem}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, ventilationSystem: e.target.value } })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={propertyDetails.amenities.meetingHall}
                onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, meetingHall: e.target.checked } })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              سالن اجتماعات
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={propertyDetails.amenities.club}
                onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, club: e.target.checked } })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              باشگاه
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={propertyDetails.amenities.waterCommons}
                onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, waterCommons: e.target.checked } })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              آب مشترک
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">مرحله 4: ثبت شرایط قرارداد</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">مهلت اخطار تخلیه (روز)</label>
          <input
            type="number"
            value={terms.evictionNoticeDays}
            onChange={(e) => setTerms({ ...terms, evictionNoticeDays: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">جریمه روزانه (ریال)</label>
          <input
            type="number"
            value={terms.dailyPenaltyAmount}
            onChange={(e) => setTerms({ ...terms, dailyPenaltyAmount: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">جریمه تاخیر روزانه (ریال)</label>
          <input
            type="number"
            value={terms.dailyDelayPenalty}
            onChange={(e) => setTerms({ ...terms, dailyDelayPenalty: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">جریمه تصرف روزانه (ریال)</label>
          <input
            type="number"
            value={terms.dailyOccupancyPenalty}
            onChange={(e) => setTerms({ ...terms, dailyOccupancyPenalty: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ تحویل</label>
          <input
            type="date"
            value={terms.deliveryDate}
            onChange={(e) => setTerms({ ...terms, deliveryDate: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">جریمه تاخیر تحویل (ریال)</label>
          <input
            type="number"
            value={terms.deliveryDelayPenalty}
            onChange={(e) => setTerms({ ...terms, deliveryDelayPenalty: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">هدف استفاده</label>
          <input
            type="text"
            value={terms.usagePurpose}
            onChange={(e) => setTerms({ ...terms, usagePurpose: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="مثال: سکونت"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد ساکنین</label>
          <input
            type="number"
            value={terms.occupantCount}
            onChange={(e) => setTerms({ ...terms, occupantCount: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-600">شرایط خاص</label>
          <textarea
            value={terms.customTerms}
            onChange={(e) => setTerms({ ...terms, customTerms: e.target.value })}
            rows={4}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="شرایط خاص قرارداد..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">مرحله 5: نهایی‌سازی قرارداد</h2>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        قبل از نهایی‌سازی، لطفا اطلاعات قرارداد را بررسی کنید. پس از نهایی‌سازی، قرارداد قابل ویرایش نخواهد بود.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ قرارداد</label>
          <input
            type="date"
            value={draftData.contractDate}
            onChange={(e) => setDraftData({ ...draftData, contractDate: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ شروع</label>
          <input
            type="date"
            value={draftData.startDate}
            onChange={(e) => setDraftData({ ...draftData, startDate: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ پایان</label>
          <input
            type="date"
            value={draftData.endDate}
            onChange={(e) => setDraftData({ ...draftData, endDate: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        {contractType === ContractType.RENTAL && (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">مبلغ اجاره (ریال)</label>
              <input
                type="number"
                value={draftData.rentalAmount}
                onChange={(e) => setDraftData({ ...draftData, rentalAmount: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">مبلغ ودیعه (ریال)</label>
              <input
                type="number"
                value={draftData.depositAmount}
                onChange={(e) => setDraftData({ ...draftData, depositAmount: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">ثبت قرارداد جدید</h1>
              <button
                onClick={() => router.push('/dashboard/contracts')}
                className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              >
                انصراف
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep === step
                          ? 'bg-primary-600 text-white'
                          : currentStep > step
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step ? <FiCheck /> : step}
                    </div>
                    <span className="mt-2 text-xs text-gray-600">
                      {step === 1 && 'نوع قرارداد'}
                      {step === 2 && 'طرفین'}
                      {step === 3 && 'ملک'}
                      {step === 4 && 'شرایط'}
                      {step === 5 && 'نهایی'}
                    </span>
                  </div>
                  {step < 5 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <ErrorDisplay error={error} />

            {isLoading ? (
              <Loading />
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                {currentStep === 5 && renderStep5()}

                <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200">
                  <div>
                    {currentStep > 1 && (
                      <button
                        onClick={() => setCurrentStep((currentStep - 1) as Step)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      >
                        <FiArrowRight />
                        قبلی
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {currentStep === 5 ? (
                      <>
                        <button
                          onClick={handleSaveDraft}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        >
                          <FiSave />
                          ذخیره پیش‌نویس
                        </button>
                        <button
                          onClick={handleFinalize}
                          className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          <FiCheck />
                          نهایی‌سازی
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          if (currentStep === 1) handleStep1Submit();
                          else if (currentStep === 2) handleStep2Submit();
                          else if (currentStep === 3) handleStep3Submit();
                          else if (currentStep === 4) handleStep4Submit();
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                      >
                        بعدی
                        <FiArrowLeft />
                      </button>
                    )}
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

