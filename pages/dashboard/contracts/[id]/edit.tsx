import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { FiArrowRight, FiArrowLeft, FiSave, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../../../src/shared/components/Layout/DashboardLayout';
import PrivateRoute from '../../../../src/shared/components/guards/PrivateRoute';
import RoleGuard from '../../../../src/shared/components/guards/RoleGuard';
import { useContracts } from '../../../../src/domains/contracts/hooks/useContracts';
import { useAuth } from '../../../../src/domains/auth/hooks/useAuth';
import { UserRole } from '../../../../src/shared/types';
import {
  ContractType,
  ContractStatus,
  PartyType,
  PartyRole,
  PartyEntityType,
  ShareType,
  RelationshipType,
  PaymentType,
  PaymentMethod,
  PaymentEntry,
  AddPartyRequest,
  UpdateContractRequest,
  ContractParty,
} from '../../../../src/domains/contracts/types';
import Loading from '../../../../src/shared/components/common/Loading';
import ErrorDisplay from '../../../../src/shared/components/common/ErrorDisplay';

type Step = 1 | 2 | 3 | 4 | 5;

export default function EditContractPage() {
  const router = useRouter();
  const { id } = router.query;
  const { fetchContractById, createContractStep2, updateProperty, updateTerms, saveDraft, updateContract, finalizeContract, selectedContract, isLoading, error } = useContracts();
  const { user: currentUser } = useAuth();
  const hasFetched = useRef<string | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>(2); // Start from step 2 (skip contract type)
  const [contractId, setContractId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Step 1: Contract Type (read-only, just for display)
  const [contractType, setContractType] = useState<ContractType>(ContractType.RENTAL);

  // Helper function to get party labels based on contract type
  const getPartyTypeLabel = (partyType: PartyType): string => {
    if (contractType === ContractType.PURCHASE) {
      return partyType === PartyType.LANDLORD ? 'فروشنده' : 'خریدار';
    }
    return partyType === PartyType.LANDLORD ? 'موجر' : 'مستاجر';
  };

  // Helper functions for payment labels
  const getPaymentTypeLabel = (type: PaymentType): string => {
    const labels: Record<PaymentType, string> = {
      [PaymentType.MORTGAGE]: 'رهن',
      [PaymentType.DOWN_PAYMENT]: 'پیش‌پرداخت',
      [PaymentType.BILL_OF_SALE]: 'قبض رسید',
    };
    return labels[type];
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.CARD_TO_CARD]: 'کارت به کارت',
      [PaymentMethod.SHABA]: 'شبا / پل پایا سانتا',
      [PaymentMethod.ACCOUNT_TO_ACCOUNT]: 'حساب به حساب',
      [PaymentMethod.CHECK]: 'چک',
      [PaymentMethod.CASH]: 'نقد',
    };
    return labels[method];
  };

  // Payment Entries
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Partial<PaymentEntry>>({
    paymentType: PaymentType.MORTGAGE,
    paymentMethod: PaymentMethod.CASH,
    amount: 0,
    order: 0,
  });

  // Payment entries handlers (same as create form)
  const handleAddPayment = () => {
    const defaultType = contractType === ContractType.RENTAL 
      ? PaymentType.MORTGAGE 
      : PaymentType.DOWN_PAYMENT;
    setCurrentPayment({
      paymentType: defaultType,
      paymentMethod: PaymentMethod.CASH,
      amount: 0,
      order: paymentEntries.length,
    });
    setEditingPaymentIndex(null);
    setShowPaymentModal(true);
  };

  const handleEditPayment = (index: number) => {
    setCurrentPayment({ ...paymentEntries[index] });
    setEditingPaymentIndex(index);
    setShowPaymentModal(true);
  };

  const handleDeletePayment = (index: number) => {
    const updated = paymentEntries.filter((_, i) => i !== index);
    updated.forEach((entry, i) => {
      entry.order = i;
    });
    setPaymentEntries(updated);
  };

  const handleSavePayment = () => {
    if (!currentPayment.paymentType || !currentPayment.paymentMethod || !currentPayment.amount || currentPayment.amount <= 0) {
      setSnackbar({ open: true, message: 'لطفا تمام فیلدهای الزامی را پر کنید', severity: 'error' });
      return;
    }

    if (currentPayment.paymentMethod === PaymentMethod.CHECK) {
      if (!currentPayment.checkNumber || !currentPayment.bankName) {
        setSnackbar({ open: true, message: 'شماره چک و نام بانک الزامی است', severity: 'error' });
        return;
      }
    } else if (currentPayment.paymentMethod === PaymentMethod.ACCOUNT_TO_ACCOUNT) {
      if (!currentPayment.accountNumber || !currentPayment.bankName) {
        setSnackbar({ open: true, message: 'شماره حساب و نام بانک الزامی است', severity: 'error' });
        return;
      }
    } else if (currentPayment.paymentMethod === PaymentMethod.SHABA) {
      if (!currentPayment.shabaNumber) {
        setSnackbar({ open: true, message: 'شماره شبا الزامی است', severity: 'error' });
        return;
      }
    } else if (currentPayment.paymentMethod === PaymentMethod.CARD_TO_CARD) {
      if (!currentPayment.cardNumber) {
        setSnackbar({ open: true, message: 'شماره کارت الزامی است', severity: 'error' });
        return;
      }
    }

    const paymentEntry: PaymentEntry = {
      id: currentPayment.id,
      paymentType: currentPayment.paymentType!,
      paymentMethod: currentPayment.paymentMethod!,
      amount: currentPayment.amount!,
      order: currentPayment.order ?? paymentEntries.length,
      description: currentPayment.description,
      checkNumber: currentPayment.checkNumber,
      accountNumber: currentPayment.accountNumber,
      cardNumber: currentPayment.cardNumber,
      shabaNumber: currentPayment.shabaNumber,
      bankName: currentPayment.bankName,
      branchName: currentPayment.branchName,
    };

    if (editingPaymentIndex !== null) {
      const updated = [...paymentEntries];
      updated[editingPaymentIndex] = paymentEntry;
      setPaymentEntries(updated);
    } else {
      setPaymentEntries([...paymentEntries, paymentEntry]);
    }

    setShowPaymentModal(false);
    setCurrentPayment({});
    setEditingPaymentIndex(null);
  };

  const getPaymentTotal = (type: PaymentType): number => {
    return paymentEntries
      .filter(entry => entry.paymentType === type)
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getAllPaymentsTotal = (): number => {
    return paymentEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

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
    // NEW: Additional property fields
    bedroomCount: '',
    bedroomArea: '',
    utilityType: {
      electricity: '',
      water: '',
      gas: '',
    },
    heatingStatus: '',
    coolerType: '',
    phoneNumber: '',
    phoneStatus: '',
    ownershipDocumentPage: '',
    ownershipDocumentBook: '',
    propertyShareType: '',
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
    // NEW: Article 6 conditions
    permittedUse: '',
    hasTransferRight: false,
    lessorOwnershipConfirmed: true,
    rentPaymentDeadline: '',
    utilityCostsResponsibility: '',
    maintenanceFeesResponsibility: '',
    majorRepairsResponsibility: '',
    minorRepairsResponsibility: '',
    propertyTaxResponsibility: '',
    incomeTaxResponsibility: '',
    goodwillRights: '',
    returnCondition: '',
    lessorLoanReturnObligation: true,
    lesseeRepairRight: false,
    renewalConditions: '',
    earlyTerminationNotice: '',
    earlyTerminationPayment: '',
    propertyTransferNotification: true,
    loanReturnDelayPenalty: '',
  });

  // Step 5: Finalize
  const [draftData, setDraftData] = useState({
    contractDate: '',
    startDate: '',
    endDate: '',
    rentalAmount: '',
    purchaseAmount: '',
    depositAmount: '',
    // NEW: Administrative fields
    consultancyNumber: '',
    registrationArea: '',
    registrationOffice: '',
    consultantRegistrationVolume: '',
    consultantRegistrationNumber: '',
    consultantRegistrationDate: '',
    witness1Name: '',
    witness2Name: '',
    legalExpertName: '',
    consultantFee: '',
    contractCopies: '3',
  });

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Load contract data
  useEffect(() => {
    const contractIdFromQuery = id && typeof id === 'string' ? id : null;
    
    if (contractIdFromQuery && hasFetched.current !== contractIdFromQuery) {
      hasFetched.current = contractIdFromQuery;
      setContractId(contractIdFromQuery);
      fetchContractById(contractIdFromQuery);
    }
  }, [id, fetchContractById]);

  // Populate form data when contract is loaded
  useEffect(() => {
    if (selectedContract && selectedContract.id === contractId && !isDataLoaded) {
      setIsDataLoaded(true);
      
      // Set contract type
      setContractType(selectedContract.type);
      
      // Load parties
      if (selectedContract.parties && selectedContract.parties.length > 0) {
        const loadedParties: AddPartyRequest[] = selectedContract.parties.map((party: ContractParty) => ({
          partyType: party.partyType,
          partyRole: party.partyRole,
          entityType: party.entityType,
          shareType: party.shareType || ShareType.DANG, // Default to DANG if not set
          shareValue: typeof party.shareValue === 'number' ? party.shareValue : (parseFloat(String(party.shareValue)) || 0),
          firstName: party.firstName,
          lastName: party.lastName,
          nationalId: party.nationalId,
          // NEW: Additional natural person fields
          childOf: party.childOf,
          idCardNumber: party.idCardNumber,
          issuedFrom: party.issuedFrom,
          birthDate: party.birthDate,
          phone: party.phone,
          postalCode: party.postalCode,
          address: party.address,
          resident: party.resident,
          authorityType: party.authorityType,
          authorityDocumentNumber: party.authorityDocumentNumber,
          authorityDocumentDate: party.authorityDocumentDate,
          companyName: party.companyName,
          registrationNumber: party.registrationNumber,
          companyNationalId: party.companyNationalId,
          officialGazette: party.officialGazette,
          principalPartyId: party.principalPartyId,
          relationshipType: party.relationshipType,
          relationshipDocumentNumber: party.relationshipDocumentNumber,
          relationshipDocumentDate: party.relationshipDocumentDate,
        }));
        setParties(loadedParties);
      }
      
      // Load property details
      if (selectedContract.propertyDetails) {
        const pd = selectedContract.propertyDetails;
        setPropertyDetails({
          propertyType: pd.propertyType || '',
          usageType: pd.usageType || '',
          address: pd.address || '',
          postalCode: pd.postalCode || '',
          registrationNumber: pd.registrationNumber || '',
          subRegistrationNumber: pd.subRegistrationNumber || '',
          mainRegistrationNumber: pd.mainRegistrationNumber || '',
          section: pd.section || '',
          area: pd.area?.toString() || '',
          areaUnit: pd.areaUnit || 'متر مربع',
          ownershipDocumentType: pd.ownershipDocumentType || '',
          ownershipDocumentSerial: pd.ownershipDocumentSerial || '',
          ownershipDocumentOwner: pd.ownershipDocumentOwner || '',
          storageCount: pd.storageCount?.toString() || '',
          storageNumbers: pd.storageNumbers || [],
          parkingCount: pd.parkingCount?.toString() || '',
          parkingNumbers: pd.parkingNumbers || [],
          // NEW: Additional property fields
          bedroomCount: pd.bedroomCount?.toString() || '',
          bedroomArea: pd.bedroomArea?.toString() || '',
          utilityType: pd.utilityType || { electricity: '', water: '', gas: '' },
          heatingStatus: pd.heatingStatus || '',
          coolerType: pd.coolerType || '',
          phoneNumber: pd.phoneNumber || '',
          phoneStatus: pd.phoneStatus || '',
          ownershipDocumentPage: pd.ownershipDocumentPage || '',
          ownershipDocumentBook: pd.ownershipDocumentBook || '',
          propertyShareType: pd.propertyShareType || '',
          amenities: {
            flooring: pd.amenities?.flooring || '',
            bathroom: pd.amenities?.bathroom || '',
            water: pd.amenities?.water || '',
            meetingHall: pd.amenities?.meetingHall || false,
            club: pd.amenities?.club || false,
            waterCommons: pd.amenities?.waterCommons || false,
            hotWaterSystem: pd.amenities?.hotWaterSystem || '',
            ventilationSystem: pd.amenities?.ventilationSystem || '',
          },
        });
      }
      
      // Load terms
      if (selectedContract.terms) {
        const t = selectedContract.terms;
        setTerms({
          evictionNoticeDays: t.evictionNoticeDays?.toString() || '',
          dailyPenaltyAmount: t.dailyPenaltyAmount?.toString() || '',
          dailyDelayPenalty: t.dailyDelayPenalty?.toString() || '',
          dailyOccupancyPenalty: t.dailyOccupancyPenalty?.toString() || '',
          deliveryDate: t.deliveryDate || '',
          deliveryDelayPenalty: t.deliveryDelayPenalty?.toString() || '',
          usagePurpose: t.usagePurpose || '',
          occupantCount: t.occupantCount?.toString() || '',
          customTerms: t.customTerms || '',
          // NEW: Article 6 conditions
          permittedUse: t.permittedUse || '',
          hasTransferRight: t.hasTransferRight || false,
          lessorOwnershipConfirmed: t.lessorOwnershipConfirmed !== undefined ? t.lessorOwnershipConfirmed : true,
          rentPaymentDeadline: t.rentPaymentDeadline || '',
          utilityCostsResponsibility: t.utilityCostsResponsibility || '',
          maintenanceFeesResponsibility: t.maintenanceFeesResponsibility || '',
          majorRepairsResponsibility: t.majorRepairsResponsibility || '',
          minorRepairsResponsibility: t.minorRepairsResponsibility || '',
          propertyTaxResponsibility: t.propertyTaxResponsibility || '',
          incomeTaxResponsibility: t.incomeTaxResponsibility || '',
          goodwillRights: t.goodwillRights || '',
          returnCondition: t.returnCondition || '',
          lessorLoanReturnObligation: t.lessorLoanReturnObligation !== undefined ? t.lessorLoanReturnObligation : true,
          lesseeRepairRight: t.lesseeRepairRight || false,
          renewalConditions: t.renewalConditions || '',
          earlyTerminationNotice: t.earlyTerminationNotice?.toString() || '',
          earlyTerminationPayment: t.earlyTerminationPayment?.toString() || '',
          propertyTransferNotification: t.propertyTransferNotification !== undefined ? t.propertyTransferNotification : true,
          loanReturnDelayPenalty: t.loanReturnDelayPenalty?.toString() || '',
        });
      }
      
      // Load draft data
      setDraftData({
        contractDate: selectedContract.contractDate || '',
        startDate: selectedContract.startDate || '',
        endDate: selectedContract.endDate || '',
        rentalAmount: selectedContract.rentalAmount?.toString() || '',
        purchaseAmount: selectedContract.purchaseAmount?.toString() || '',
        depositAmount: selectedContract.depositAmount?.toString() || '',
        // NEW: Administrative fields
        consultancyNumber: selectedContract.consultancyNumber || '',
        registrationArea: selectedContract.registrationArea || '',
        registrationOffice: selectedContract.registrationOffice || '',
        consultantRegistrationVolume: selectedContract.consultantRegistrationVolume || '',
        consultantRegistrationNumber: selectedContract.consultantRegistrationNumber || '',
        consultantRegistrationDate: selectedContract.consultantRegistrationDate || '',
        witness1Name: selectedContract.witness1Name || '',
        witness2Name: selectedContract.witness2Name || '',
        legalExpertName: selectedContract.legalExpertName || '',
        consultantFee: selectedContract.consultantFee?.toString() || '',
        contractCopies: selectedContract.contractCopies?.toString() || '3',
      });

      // Load payment entries
      if (selectedContract.paymentEntries && selectedContract.paymentEntries.length > 0) {
        setPaymentEntries(selectedContract.paymentEntries);
      } else {
        setPaymentEntries([]);
      }
    }
  }, [selectedContract, contractId, isDataLoaded]);

  // Helper function to get the current contractId
  const getCurrentContractId = (): string | null => {
    if (contractId) return contractId;
    if (selectedContract?.id) return selectedContract.id;
    return null;
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
      setSnackbar({ open: true, message: 'قرارداد یافت نشد', severity: 'error' });
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
      if (!landlordShareType) {
        setSnackbar({ open: true, message: 'نوع سهم موجرین مشخص نشده است', severity: 'error' });
        return;
      }
      const landlordTotal = landlordParties.reduce((sum, p) => {
        const value = typeof p.shareValue === 'number' ? p.shareValue : parseFloat(String(p.shareValue)) || 0;
        return sum + value;
      }, 0);
      const expectedTotal = landlordShareType === ShareType.DANG ? 6 : 100;
      // Use Math.abs to handle floating point precision issues
      if (Math.abs(landlordTotal - expectedTotal) > 0.01) {
        setSnackbar({ open: true, message: `مجموع سهم موجرین باید ${expectedTotal} ${landlordShareType === ShareType.DANG ? 'دانگ' : 'درصد'} باشد (جمع فعلی: ${landlordTotal.toFixed(2)})`, severity: 'error' });
        return;
      }
    }

    if (tenantParties.length > 0) {
      const tenantShareType = tenantParties[0].shareType;
      if (!tenantShareType) {
        setSnackbar({ open: true, message: 'نوع سهم مستاجرین مشخص نشده است', severity: 'error' });
        return;
      }
      const tenantTotal = tenantParties.reduce((sum, p) => {
        const value = typeof p.shareValue === 'number' ? p.shareValue : parseFloat(String(p.shareValue)) || 0;
        return sum + value;
      }, 0);
      const expectedTotal = tenantShareType === ShareType.DANG ? 6 : 100;
      // Use Math.abs to handle floating point precision issues
      if (Math.abs(tenantTotal - expectedTotal) > 0.01) {
        setSnackbar({ open: true, message: `مجموع سهم مستاجرین باید ${expectedTotal} ${tenantShareType === ShareType.DANG ? 'دانگ' : 'درصد'} باشد (جمع فعلی: ${tenantTotal.toFixed(2)})`, severity: 'error' });
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
        setSnackbar({ open: true, message: `خطا: ${errorMsg}. لطفا صفحه را رفرش کنید.`, severity: 'error' });
        return;
      }
      
      await createContractStep2(currentContractId, { parties });
      setCurrentStep(3);
      setSnackbar({ open: true, message: 'طرفین قرارداد با موفقیت به‌روزرسانی شدند', severity: 'success' });
    } catch (err: any) {
      console.error('Error in step 2:', err);
      const errorMessage = err.response?.data?.message || err.message || 'خطا در به‌روزرسانی طرفین';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleStep3Submit = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد یافت نشد', severity: 'error' });
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
        setSnackbar({ open: true, message: `خطا: ${errorMsg}. لطفا صفحه را رفرش کنید.`, severity: 'error' });
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
        // NEW: Additional property fields
        bedroomCount: propertyDetails.bedroomCount ? parseInt(propertyDetails.bedroomCount) : undefined,
        bedroomArea: propertyDetails.bedroomArea ? parseFloat(propertyDetails.bedroomArea) : undefined,
        utilityType: (propertyDetails.utilityType?.electricity || propertyDetails.utilityType?.water || propertyDetails.utilityType?.gas) ? propertyDetails.utilityType : undefined,
        heatingStatus: propertyDetails.heatingStatus?.trim() || undefined,
        coolerType: propertyDetails.coolerType?.trim() || undefined,
        phoneNumber: propertyDetails.phoneNumber?.trim() || undefined,
        phoneStatus: propertyDetails.phoneStatus?.trim() || undefined,
        ownershipDocumentPage: propertyDetails.ownershipDocumentPage?.trim() || undefined,
        ownershipDocumentBook: propertyDetails.ownershipDocumentBook?.trim() || undefined,
        propertyShareType: propertyDetails.propertyShareType?.trim() || undefined,
        amenities: propertyDetails.amenities || undefined,
      };
      
      const result = await updateProperty(currentContractId, propertyData);
      console.log('Property update response:', result);
      
      // Extract contract ID from response
      const propertyResponse = result as any;
      const responseContractId = propertyResponse?.contractId || propertyResponse?.contract?.id;
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
      setSnackbar({ open: true, message: 'جزئیات ملک با موفقیت به‌روزرسانی شد', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در به‌روزرسانی جزئیات ملک', severity: 'error' });
    }
  };

  const handleStep4Submit = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد یافت نشد', severity: 'error' });
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
        setSnackbar({ open: true, message: `خطا: ${errorMsg}. لطفا صفحه را رفرش کنید.`, severity: 'error' });
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
        // NEW: Article 6 conditions
        permittedUse: terms.permittedUse?.trim() || undefined,
        hasTransferRight: terms.hasTransferRight,
        lessorOwnershipConfirmed: terms.lessorOwnershipConfirmed,
        rentPaymentDeadline: terms.rentPaymentDeadline?.trim() || undefined,
        utilityCostsResponsibility: terms.utilityCostsResponsibility?.trim() || undefined,
        maintenanceFeesResponsibility: terms.maintenanceFeesResponsibility?.trim() || undefined,
        majorRepairsResponsibility: terms.majorRepairsResponsibility?.trim() || undefined,
        minorRepairsResponsibility: terms.minorRepairsResponsibility?.trim() || undefined,
        propertyTaxResponsibility: terms.propertyTaxResponsibility?.trim() || undefined,
        incomeTaxResponsibility: terms.incomeTaxResponsibility?.trim() || undefined,
        goodwillRights: terms.goodwillRights?.trim() || undefined,
        returnCondition: terms.returnCondition?.trim() || undefined,
        lessorLoanReturnObligation: terms.lessorLoanReturnObligation,
        lesseeRepairRight: terms.lesseeRepairRight,
        renewalConditions: terms.renewalConditions?.trim() || undefined,
        earlyTerminationNotice: terms.earlyTerminationNotice ? parseInt(terms.earlyTerminationNotice) : undefined,
        earlyTerminationPayment: terms.earlyTerminationPayment ? parseFloat(terms.earlyTerminationPayment) : undefined,
        propertyTransferNotification: terms.propertyTransferNotification,
        loanReturnDelayPenalty: terms.loanReturnDelayPenalty ? parseFloat(terms.loanReturnDelayPenalty) : undefined,
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
      setSnackbar({ open: true, message: 'شرایط قرارداد با موفقیت به‌روزرسانی شد', severity: 'success' });
    } catch (err: any) {
      console.error('Error in step 4:', err);
      const errorMessage = err.response?.data?.message || err.message || 'خطا در به‌روزرسانی شرایط';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSaveDraft = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد یافت نشد', severity: 'error' });
      return;
    }

    try {
      const updateData: UpdateContractRequest = {
        contractDate: draftData.contractDate || undefined,
        startDate: contractType === ContractType.RENTAL ? (draftData.startDate || undefined) : undefined,
        endDate: contractType === ContractType.RENTAL ? (draftData.endDate || undefined) : undefined,
        rentalAmount: contractType === ContractType.RENTAL ? (draftData.rentalAmount ? parseFloat(draftData.rentalAmount) : undefined) : undefined,
        purchaseAmount: contractType === ContractType.PURCHASE ? (draftData.purchaseAmount ? parseFloat(draftData.purchaseAmount) : undefined) : undefined,
        depositAmount: draftData.depositAmount ? parseFloat(draftData.depositAmount) : undefined,
        paymentEntries: paymentEntries.length > 0 ? paymentEntries : undefined,
        // NEW: Administrative fields
        consultancyNumber: draftData.consultancyNumber?.trim() || undefined,
        registrationArea: draftData.registrationArea?.trim() || undefined,
        registrationOffice: draftData.registrationOffice?.trim() || undefined,
        consultantRegistrationVolume: draftData.consultantRegistrationVolume?.trim() || undefined,
        consultantRegistrationNumber: draftData.consultantRegistrationNumber?.trim() || undefined,
        consultantRegistrationDate: draftData.consultantRegistrationDate || undefined,
        witness1Name: draftData.witness1Name?.trim() || undefined,
        witness2Name: draftData.witness2Name?.trim() || undefined,
        legalExpertName: draftData.legalExpertName?.trim() || undefined,
        consultantFee: draftData.consultantFee ? parseFloat(draftData.consultantFee) : undefined,
        contractCopies: draftData.contractCopies ? parseInt(draftData.contractCopies) : undefined,
      };
      await updateContract(currentContractId, updateData);
      setSnackbar({ open: true, message: 'پیش‌نویس با موفقیت ذخیره شد', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'خطا در ذخیره پیش‌نویس', severity: 'error' });
    }
  };

  const handleFinalize = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد یافت نشد', severity: 'error' });
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
        setSnackbar({ open: true, message: `خطا: ${errorMsg}. لطفا صفحه را رفرش کنید.`, severity: 'error' });
        return;
      }
      
      // IMPORTANT: Save financial and administrative data before finalizing
      // The finalizeContract endpoint doesn't accept financial data, so we need to save it first
      const updateData: UpdateContractRequest = {
        contractDate: draftData.contractDate || undefined,
        startDate: contractType === ContractType.RENTAL ? (draftData.startDate || undefined) : undefined,
        endDate: contractType === ContractType.RENTAL ? (draftData.endDate || undefined) : undefined,
        rentalAmount: contractType === ContractType.RENTAL ? (draftData.rentalAmount ? parseFloat(draftData.rentalAmount) : undefined) : undefined,
        purchaseAmount: contractType === ContractType.PURCHASE ? (draftData.purchaseAmount ? parseFloat(draftData.purchaseAmount) : undefined) : undefined,
        depositAmount: draftData.depositAmount ? parseFloat(draftData.depositAmount) : undefined,
        paymentEntries: paymentEntries.length > 0 ? paymentEntries : undefined,
        // NEW: Administrative fields
        consultancyNumber: draftData.consultancyNumber?.trim() || undefined,
        registrationArea: draftData.registrationArea?.trim() || undefined,
        registrationOffice: draftData.registrationOffice?.trim() || undefined,
        consultantRegistrationVolume: draftData.consultantRegistrationVolume?.trim() || undefined,
        consultantRegistrationNumber: draftData.consultantRegistrationNumber?.trim() || undefined,
        consultantRegistrationDate: draftData.consultantRegistrationDate || undefined,
        witness1Name: draftData.witness1Name?.trim() || undefined,
        witness2Name: draftData.witness2Name?.trim() || undefined,
        legalExpertName: draftData.legalExpertName?.trim() || undefined,
        consultantFee: draftData.consultantFee ? parseFloat(draftData.consultantFee) : undefined,
        contractCopies: draftData.contractCopies ? parseInt(draftData.contractCopies) : undefined,
      };
      
      // Only update if there's data to save
      const hasData = updateData.rentalAmount || updateData.purchaseAmount || updateData.depositAmount || updateData.contractDate || updateData.startDate || updateData.endDate ||
        updateData.paymentEntries || updateData.consultancyNumber || updateData.registrationArea || updateData.registrationOffice || updateData.consultantRegistrationVolume ||
        updateData.consultantRegistrationNumber || updateData.consultantRegistrationDate || updateData.witness1Name || updateData.witness2Name ||
        updateData.legalExpertName || updateData.consultantFee || updateData.contractCopies;
      if (hasData) {
        console.log('Saving financial and administrative data before finalizing...');
        await updateContract(currentContractId, updateData);
        console.log('Data saved successfully');
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

  // Copy renderStep functions from create page - I'll need to read them
  // For now, let me create a simplified version that will work

  if (isLoading || !isDataLoaded) {
    return (
      <PrivateRoute>
        <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
          <DashboardLayout>
            <Loading />
          </DashboardLayout>
        </RoleGuard>
      </PrivateRoute>
    );
  }

  if (error || !selectedContract) {
    return (
      <PrivateRoute>
        <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
          <DashboardLayout>
            <div className="space-y-6 text-right">
              <ErrorDisplay error={error || 'قرارداد یافت نشد'} />
              <button
                onClick={() => router.push('/dashboard/contracts')}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <FiArrowRight />
                بازگشت به لیست قراردادها
              </button>
            </div>
          </DashboardLayout>
        </RoleGuard>
      </PrivateRoute>
    );
  }

  if (selectedContract.status !== ContractStatus.DRAFT) {
    return (
      <PrivateRoute>
        <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
          <DashboardLayout>
            <div className="space-y-6 text-right">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                فقط قراردادهای پیش‌نویس قابل ویرایش هستند.
              </div>
              <button
                onClick={() => router.push(`/dashboard/contracts/${selectedContract.id}`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <FiArrowRight />
                بازگشت به جزئیات قرارداد
              </button>
            </div>
          </DashboardLayout>
        </RoleGuard>
      </PrivateRoute>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">مرحله 1: نوع قرارداد</h2>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-gray-700">
          نوع قرارداد: <span className="font-semibold">{contractType === ContractType.RENTAL ? 'اجاره‌نامه' : 'مبایعه‌نامه'}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">نوع قرارداد قابل تغییر نیست</p>
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
                <option value={PartyType.LANDLORD}>{getPartyTypeLabel(PartyType.LANDLORD)}</option>
                <option value={PartyType.TENANT}>{getPartyTypeLabel(PartyType.TENANT)}</option>
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
              {/* NEW: Additional natural person fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">فرزند</label>
                  <input
                    type="text"
                    value={currentParty.childOf || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, childOf: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="نام پدر"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">شماره شناسنامه</label>
                  <input
                    type="text"
                    value={currentParty.idCardNumber || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, idCardNumber: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">صادره از</label>
                  <input
                    type="text"
                    value={currentParty.issuedFrom || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, issuedFrom: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="محل صدور"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">متولد</label>
                  <input
                    type="date"
                    value={currentParty.birthDate || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, birthDate: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">تلفن</label>
                  <input
                    type="text"
                    value={currentParty.phone || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, phone: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="09123456789"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">کد پستی</label>
                  <input
                    type="text"
                    value={currentParty.postalCode || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, postalCode: e.target.value })}
                    maxLength={10}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">آدرس</label>
                  <textarea
                    value={currentParty.address || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, address: e.target.value })}
                    rows={2}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">ساكن</label>
                  <input
                    type="text"
                    value={currentParty.resident || ''}
                    onChange={(e) => setCurrentParty({ ...currentParty, resident: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="محل سکونت"
                  />
                </div>
              </div>
              {/* Authority section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">اطلاعات اختیار (در صورت وجود)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نوع اختیار</label>
                    <select
                      value={currentParty.authorityType || ''}
                      onChange={(e) => setCurrentParty({ ...currentParty, authorityType: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="وکالت">وکالت</option>
                      <option value="قیومیت">قیومیت</option>
                      <option value="ولایت">ولایت</option>
                      <option value="وصايت">وصايت</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">شماره مدرک اختیار</label>
                    <input
                      type="text"
                      value={currentParty.authorityDocumentNumber || ''}
                      onChange={(e) => setCurrentParty({ ...currentParty, authorityDocumentNumber: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      disabled={!currentParty.authorityType}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ مدرک اختیار</label>
                    <input
                      type="date"
                      value={currentParty.authorityDocumentDate || ''}
                      onChange={(e) => setCurrentParty({ ...currentParty, authorityDocumentDate: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      disabled={!currentParty.authorityType}
                    />
                  </div>
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
                      {getPartyTypeLabel(party.partyType)} -{' '}
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
                <div>{getPartyTypeLabel(PartyType.LANDLORD)}ان: مجموع {landlordParties.reduce((sum, p) => sum + p.shareValue, 0)} {landlordParties[0]?.shareType === ShareType.DANG ? 'دانگ' : 'درصد'}</div>
                <div>{getPartyTypeLabel(PartyType.TENANT)}ان: مجموع {tenantParties.reduce((sum, p) => sum + p.shareValue, 0)} {tenantParties[0]?.shareType === ShareType.DANG ? 'دانگ' : 'درصد'}</div>
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
        {/* NEW: Additional property fields */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد اتاق خواب</label>
          <input
            type="number"
            value={propertyDetails.bedroomCount || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, bedroomCount: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">مساحت اتاق خواب (متر مربع)</label>
          <input
            type="number"
            value={propertyDetails.bedroomArea || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, bedroomArea: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">وضعیت شوفاژ</label>
          <select
            value={propertyDetails.heatingStatus || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, heatingStatus: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="روشن">روشن</option>
            <option value="غیر روشن">غیر روشن</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">نوع کولر</label>
          <input
            type="text"
            value={propertyDetails.coolerType || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, coolerType: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="مثال: اسپلیت"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">شماره تلفن</label>
          <input
            type="text"
            value={propertyDetails.phoneNumber || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, phoneNumber: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="02112345678"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">وضعیت تلفن</label>
          <select
            value={propertyDetails.phoneStatus || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, phoneStatus: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="دایر">دایر</option>
            <option value="غیر دایر">غیر دایر</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">صفحه سند</label>
          <input
            type="text"
            value={propertyDetails.ownershipDocumentPage || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, ownershipDocumentPage: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">دفتر سند</label>
          <input
            type="text"
            value={propertyDetails.ownershipDocumentBook || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, ownershipDocumentBook: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">نوع سهم</label>
          <select
            value={propertyDetails.propertyShareType || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, propertyShareType: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="دانگ">دانگ</option>
            <option value="دستگاه">دستگاه</option>
            <option value="یک باب">یک باب</option>
          </select>
        </div>
      </div>

      {/* NEW: Utility Type Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">نوع خدمات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">برق</label>
            <select
              value={propertyDetails.utilityType?.electricity || ''}
              onChange={(e) => setPropertyDetails({ 
                ...propertyDetails, 
                utilityType: { 
                  ...propertyDetails.utilityType, 
                  electricity: e.target.value 
                } 
              })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="اختصاصی">اختصاصی</option>
              <option value="اشتراکی">اشتراکی</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">آب</label>
            <select
              value={propertyDetails.utilityType?.water || ''}
              onChange={(e) => setPropertyDetails({ 
                ...propertyDetails, 
                utilityType: { 
                  ...propertyDetails.utilityType, 
                  water: e.target.value 
                } 
              })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="اختصاصی">اختصاصی</option>
              <option value="اشتراکی">اشتراکی</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">گاز</label>
            <select
              value={propertyDetails.utilityType?.gas || ''}
              onChange={(e) => setPropertyDetails({ 
                ...propertyDetails, 
                utilityType: { 
                  ...propertyDetails.utilityType, 
                  gas: e.target.value 
                } 
              })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="اختصاصی">اختصاصی</option>
              <option value="اشتراکی">اشتراکی</option>
            </select>
          </div>
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

      {/* NEW: Article 6 Conditions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ماده 6 - شرایط قرارداد</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">نوع استفاده مجاز</label>
            <select
              value={terms.permittedUse}
              onChange={(e) => setTerms({ ...terms, permittedUse: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="مسکونی">مسکونی</option>
              <option value="تجاری">تجاری</option>
              <option value="اداری">اداری</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مهلت پرداخت</label>
            <select
              value={terms.rentPaymentDeadline}
              onChange={(e) => setTerms({ ...terms, rentPaymentDeadline: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="اول">اول ماه</option>
              <option value="آخر">آخر ماه</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مسئولیت هزینه‌های مصرفی</label>
            <select
              value={terms.utilityCostsResponsibility}
              onChange={(e) => setTerms({ ...terms, utilityCostsResponsibility: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="موجر">موجر</option>
              <option value="مستاجر">مستاجر</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مسئولیت شارژ ساختمان</label>
            <select
              value={terms.maintenanceFeesResponsibility}
              onChange={(e) => setTerms({ ...terms, maintenanceFeesResponsibility: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="موجر">موجر</option>
              <option value="مستاجر">مستاجر</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مسئولیت تعمیرات اساسی</label>
            <select
              value={terms.majorRepairsResponsibility}
              onChange={(e) => setTerms({ ...terms, majorRepairsResponsibility: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="موجر">موجر</option>
              <option value="مستاجر">مستاجر</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مسئولیت تعمیرات جزئی</label>
            <select
              value={terms.minorRepairsResponsibility}
              onChange={(e) => setTerms({ ...terms, minorRepairsResponsibility: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="موجر">موجر</option>
              <option value="مستاجر">مستاجر</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مسئولیت مالیات ملک</label>
            <select
              value={terms.propertyTaxResponsibility}
              onChange={(e) => setTerms({ ...terms, propertyTaxResponsibility: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="موجر">موجر</option>
              <option value="مستاجر">مستاجر</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مسئولیت مالیات درآمد</label>
            <select
              value={terms.incomeTaxResponsibility}
              onChange={(e) => setTerms({ ...terms, incomeTaxResponsibility: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="موجر">موجر</option>
              <option value="مستاجر">مستاجر</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-600">حق سرقفلی</label>
            <textarea
              value={terms.goodwillRights}
              onChange={(e) => setTerms({ ...terms, goodwillRights: e.target.value })}
              rows={2}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="شرایط حق سرقفلی..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-600">شرایط بازگشت ملک</label>
            <textarea
              value={terms.returnCondition}
              onChange={(e) => setTerms({ ...terms, returnCondition: e.target.value })}
              rows={2}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="شرایط بازگشت ملک..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مهلت اخطار فسخ (روز)</label>
            <input
              type="number"
              value={terms.earlyTerminationNotice}
              onChange={(e) => setTerms({ ...terms, earlyTerminationNotice: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">پرداخت اضافی برای فسخ زودهنگام (ریال)</label>
            <input
              type="number"
              value={terms.earlyTerminationPayment}
              onChange={(e) => setTerms({ ...terms, earlyTerminationPayment: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">جریمه تأخیر بازگشت قرض الحسنه (ریال)</label>
            <input
              type="number"
              value={terms.loanReturnDelayPenalty}
              onChange={(e) => setTerms({ ...terms, loanReturnDelayPenalty: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-600">شرایط تمدید</label>
            <textarea
              value={terms.renewalConditions}
              onChange={(e) => setTerms({ ...terms, renewalConditions: e.target.value })}
              rows={2}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="شرایط تمدید قرارداد..."
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={terms.hasTransferRight}
                onChange={(e) => setTerms({ ...terms, hasTransferRight: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              حق انتقال به غیر
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={terms.lessorOwnershipConfirmed}
                onChange={(e) => setTerms({ ...terms, lessorOwnershipConfirmed: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              تأیید مالکیت موجر
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={terms.lessorLoanReturnObligation}
                onChange={(e) => setTerms({ ...terms, lessorLoanReturnObligation: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              تعهد موجر به بازگشت قرض الحسنه
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={terms.lesseeRepairRight}
                onChange={(e) => setTerms({ ...terms, lesseeRepairRight: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              حق مستاجر برای تعمیرات ضروری
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={terms.propertyTransferNotification}
                onChange={(e) => setTerms({ ...terms, propertyTransferNotification: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              اطلاع‌رسانی انتقال ملک
            </label>
          </div>
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
        {contractType === ContractType.RENTAL && (
          <>
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
        {contractType === ContractType.PURCHASE && (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">مبلغ خرید (ریال)</label>
              <input
                type="number"
                value={draftData.purchaseAmount}
                onChange={(e) => setDraftData({ ...draftData, purchaseAmount: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">پیش‌پرداخت (ریال)</label>
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

      {/* NEW: Administrative Fields */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات اداری</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">شماره مشاوره املاک</label>
            <input
              type="text"
              value={draftData.consultancyNumber}
              onChange={(e) => setDraftData({ ...draftData, consultancyNumber: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">حوزه ثبتي</label>
            <input
              type="text"
              value={draftData.registrationArea}
              onChange={(e) => setDraftData({ ...draftData, registrationArea: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">دفتر ثبت</label>
            <input
              type="text"
              value={draftData.registrationOffice}
              onChange={(e) => setDraftData({ ...draftData, registrationOffice: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">جلد ثبت مشاور</label>
            <input
              type="text"
              value={draftData.consultantRegistrationVolume}
              onChange={(e) => setDraftData({ ...draftData, consultantRegistrationVolume: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">شماره ثبت مشاور</label>
            <input
              type="text"
              value={draftData.consultantRegistrationNumber}
              onChange={(e) => setDraftData({ ...draftData, consultantRegistrationNumber: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ ثبت مشاور</label>
            <input
              type="date"
              value={draftData.consultantRegistrationDate}
              onChange={(e) => setDraftData({ ...draftData, consultantRegistrationDate: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">نام شاهد 1</label>
            <input
              type="text"
              value={draftData.witness1Name}
              onChange={(e) => setDraftData({ ...draftData, witness1Name: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">نام شاهد 2</label>
            <input
              type="text"
              value={draftData.witness2Name}
              onChange={(e) => setDraftData({ ...draftData, witness2Name: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">نام کارشناس حقوقی</label>
            <input
              type="text"
              value={draftData.legalExpertName}
              onChange={(e) => setDraftData({ ...draftData, legalExpertName: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">حق الزحمه مشاور (ریال)</label>
            <input
              type="number"
              value={draftData.consultantFee}
              onChange={(e) => setDraftData({ ...draftData, consultantFee: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد نسخ قرارداد</label>
            <input
              type="number"
              value={draftData.contractCopies}
              onChange={(e) => setDraftData({ ...draftData, contractCopies: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Payment Methods Section - Same as create form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">روش‌های پرداخت</h3>
          <button
            onClick={handleAddPayment}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <FiCheck />
            افزودن پرداخت
          </button>
        </div>

        {contractType === ContractType.RENTAL && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">رهن</h4>
            {paymentEntries.filter(e => e.paymentType === PaymentType.MORTGAGE).length === 0 ? (
              <p className="text-sm text-gray-500">هیچ پرداختی ثبت نشده است</p>
            ) : (
              <div className="space-y-2">
                {paymentEntries
                  .filter(e => e.paymentType === PaymentType.MORTGAGE)
                  .map((entry, index) => {
                    const originalIndex = paymentEntries.findIndex(e => e === entry);
                    return (
                      <div key={index} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{getPaymentMethodLabel(entry.paymentMethod)}</div>
                          <div className="text-sm text-gray-600">
                            مبلغ: {entry.amount.toLocaleString('fa-IR')} ریال
                            {entry.checkNumber && ` | شماره چک: ${entry.checkNumber}`}
                            {entry.accountNumber && ` | شماره حساب: ${entry.accountNumber}`}
                            {entry.cardNumber && ` | شماره کارت: ${entry.cardNumber}`}
                            {entry.shabaNumber && ` | شماره شبا: ${entry.shabaNumber}`}
                            {entry.bankName && ` | بانک: ${entry.bankName}`}
                            {entry.branchName && ` | شعبه: ${entry.branchName}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPayment(originalIndex)}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDeletePayment(originalIndex)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    );
                  })}
                <div className="text-sm font-semibold text-gray-700 mt-2">
                  مجموع رهن: {getPaymentTotal(PaymentType.MORTGAGE).toLocaleString('fa-IR')} ریال
                  {draftData.depositAmount && (
                    <span className={getPaymentTotal(PaymentType.MORTGAGE) === parseFloat(draftData.depositAmount) ? 'text-green-600' : 'text-red-600'}>
                      {' '}(مبلغ ودیعه: {parseFloat(draftData.depositAmount).toLocaleString('fa-IR')} ریال)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {contractType === ContractType.PURCHASE && (
          <>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">پیش‌پرداخت</h4>
              {paymentEntries.filter(e => e.paymentType === PaymentType.DOWN_PAYMENT).length === 0 ? (
                <p className="text-sm text-gray-500">هیچ پرداختی ثبت نشده است</p>
              ) : (
                <div className="space-y-2">
                  {paymentEntries
                    .filter(e => e.paymentType === PaymentType.DOWN_PAYMENT)
                    .map((entry, index) => {
                      const originalIndex = paymentEntries.findIndex(e => e === entry);
                      return (
                        <div key={index} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{getPaymentMethodLabel(entry.paymentMethod)}</div>
                            <div className="text-sm text-gray-600">
                              مبلغ: {entry.amount.toLocaleString('fa-IR')} ریال
                              {entry.checkNumber && ` | شماره چک: ${entry.checkNumber}`}
                              {entry.accountNumber && ` | شماره حساب: ${entry.accountNumber}`}
                              {entry.cardNumber && ` | شماره کارت: ${entry.cardNumber}`}
                              {entry.shabaNumber && ` | شماره شبا: ${entry.shabaNumber}`}
                              {entry.bankName && ` | بانک: ${entry.bankName}`}
                              {entry.branchName && ` | شعبه: ${entry.branchName}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPayment(originalIndex)}
                              className="text-primary-600 hover:text-primary-700 text-sm"
                            >
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDeletePayment(originalIndex)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  <div className="text-sm font-semibold text-gray-700 mt-2">
                    مجموع پیش‌پرداخت: {getPaymentTotal(PaymentType.DOWN_PAYMENT).toLocaleString('fa-IR')} ریال
                    {draftData.depositAmount && (
                      <span className={getPaymentTotal(PaymentType.DOWN_PAYMENT) === parseFloat(draftData.depositAmount) ? 'text-green-600' : 'text-red-600'}>
                        {' '}(پیش‌پرداخت: {parseFloat(draftData.depositAmount).toLocaleString('fa-IR')} ریال)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">قبض رسید</h4>
              {paymentEntries.filter(e => e.paymentType === PaymentType.BILL_OF_SALE).length === 0 ? (
                <p className="text-sm text-gray-500">هیچ پرداختی ثبت نشده است</p>
              ) : (
                <div className="space-y-2">
                  {paymentEntries
                    .filter(e => e.paymentType === PaymentType.BILL_OF_SALE)
                    .map((entry, index) => {
                      const originalIndex = paymentEntries.findIndex(e => e === entry);
                      return (
                        <div key={index} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{getPaymentMethodLabel(entry.paymentMethod)}</div>
                            <div className="text-sm text-gray-600">
                              مبلغ: {entry.amount.toLocaleString('fa-IR')} ریال
                              {entry.checkNumber && ` | شماره چک: ${entry.checkNumber}`}
                              {entry.accountNumber && ` | شماره حساب: ${entry.accountNumber}`}
                              {entry.cardNumber && ` | شماره کارت: ${entry.cardNumber}`}
                              {entry.shabaNumber && ` | شماره شبا: ${entry.shabaNumber}`}
                              {entry.bankName && ` | بانک: ${entry.bankName}`}
                              {entry.branchName && ` | شعبه: ${entry.branchName}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPayment(originalIndex)}
                              className="text-primary-600 hover:text-primary-700 text-sm"
                            >
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDeletePayment(originalIndex)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  <div className="text-sm font-semibold text-gray-700 mt-2">
                    مجموع قبض رسید: {getPaymentTotal(PaymentType.BILL_OF_SALE).toLocaleString('fa-IR')} ریال
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm font-semibold text-gray-700">
                مجموع کل پرداخت‌ها: {getAllPaymentsTotal().toLocaleString('fa-IR')} ریال
                {draftData.purchaseAmount && (
                  <span className={getAllPaymentsTotal() <= parseFloat(draftData.purchaseAmount) ? 'text-green-600' : 'text-red-600'}>
                    {' '}(مبلغ خرید: {parseFloat(draftData.purchaseAmount).toLocaleString('fa-IR')} ریال)
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Modal - Same as create form */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingPaymentIndex !== null ? 'ویرایش پرداخت' : 'افزودن پرداخت'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">نوع پرداخت</label>
                <select
                  value={currentPayment.paymentType || ''}
                  onChange={(e) => setCurrentPayment({ ...currentPayment, paymentType: e.target.value as PaymentType })}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  {contractType === ContractType.RENTAL ? (
                    <option value={PaymentType.MORTGAGE}>رهن</option>
                  ) : (
                    <>
                      <option value={PaymentType.DOWN_PAYMENT}>پیش‌پرداخت</option>
                      <option value={PaymentType.BILL_OF_SALE}>قبض رسید</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">مبلغ (ریال)</label>
                <input
                  type="number"
                  value={currentPayment.amount || ''}
                  onChange={(e) => setCurrentPayment({ ...currentPayment, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  min="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">روش پرداخت</label>
                <select
                  value={currentPayment.paymentMethod || ''}
                  onChange={(e) => {
                    const method = e.target.value as PaymentMethod;
                    setCurrentPayment({
                      ...currentPayment,
                      paymentMethod: method,
                      checkNumber: undefined,
                      accountNumber: undefined,
                      cardNumber: undefined,
                      shabaNumber: undefined,
                      bankName: undefined,
                      branchName: undefined,
                    });
                  }}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value={PaymentMethod.CASH}>نقد</option>
                  <option value={PaymentMethod.CARD_TO_CARD}>کارت به کارت</option>
                  <option value={PaymentMethod.SHABA}>شبا / پل پایا سانتا</option>
                  <option value={PaymentMethod.ACCOUNT_TO_ACCOUNT}>حساب به حساب</option>
                  <option value={PaymentMethod.CHECK}>چک</option>
                </select>
              </div>

              {currentPayment.paymentMethod === PaymentMethod.CHECK && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">شماره چک *</label>
                    <input
                      type="text"
                      value={currentPayment.checkNumber || ''}
                      onChange={(e) => setCurrentPayment({ ...currentPayment, checkNumber: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نام بانک *</label>
                    <input
                      type="text"
                      value={currentPayment.bankName || ''}
                      onChange={(e) => setCurrentPayment({ ...currentPayment, bankName: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نام شعبه</label>
                    <input
                      type="text"
                      value={currentPayment.branchName || ''}
                      onChange={(e) => setCurrentPayment({ ...currentPayment, branchName: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </>
              )}

              {currentPayment.paymentMethod === PaymentMethod.ACCOUNT_TO_ACCOUNT && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">شماره حساب *</label>
                    <input
                      type="text"
                      value={currentPayment.accountNumber || ''}
                      onChange={(e) => setCurrentPayment({ ...currentPayment, accountNumber: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نام بانک *</label>
                    <input
                      type="text"
                      value={currentPayment.bankName || ''}
                      onChange={(e) => setCurrentPayment({ ...currentPayment, bankName: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">نام شعبه</label>
                    <input
                      type="text"
                      value={currentPayment.branchName || ''}
                      onChange={(e) => setCurrentPayment({ ...currentPayment, branchName: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </>
              )}

              {currentPayment.paymentMethod === PaymentMethod.SHABA && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">شماره شبا *</label>
                  <input
                    type="text"
                    value={currentPayment.shabaNumber || ''}
                    onChange={(e) => setCurrentPayment({ ...currentPayment, shabaNumber: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="IR + 24 digits"
                  />
                </div>
              )}

              {currentPayment.paymentMethod === PaymentMethod.CARD_TO_CARD && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">شماره کارت *</label>
                  <input
                    type="text"
                    value={currentPayment.cardNumber || ''}
                    onChange={(e) => setCurrentPayment({ ...currentPayment, cardNumber: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="16 digits"
                    maxLength={16}
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">توضیحات</label>
                <textarea
                  value={currentPayment.description || ''}
                  onChange={(e) => setCurrentPayment({ ...currentPayment, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setCurrentPayment({});
                  setEditingPaymentIndex(null);
                }}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSavePayment}
                className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PrivateRoute>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MASTER]}>
        <DashboardLayout>
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">ویرایش قرارداد</h1>
              <button
                onClick={() => router.push(`/dashboard/contracts/${contractId}`)}
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
                          if (currentStep === 1) setCurrentStep(2);
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
