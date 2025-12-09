import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import PersianDatePicker from '../../../../src/shared/components/common/PersianDatePicker';
import { getChangedFields } from '../../../../src/shared/utils/objectUtils';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

type Step = 1 | 2 | 3 | 4 | 5;

// Validated Input Component
const ValidatedInput = React.memo(({ 
  field, 
  value, 
  onChange, 
  onClearError,
  label, 
  type = 'text', 
  placeholder, 
  maxLength,
  required = false,
  className = '',
  error,
  ...props 
}: {
  field: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearError: (field: string) => void;
  label?: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  className?: string;
  error?: string;
  [key: string]: any;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (error) {
      onClearError(field);
    }
  }, [onChange, onClearError, error, field]);

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-semibold text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value || ''}
        onChange={handleChange}
        className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 transition-all ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
            : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
        } ${className}`}
        placeholder={placeholder}
        maxLength={maxLength}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

// Validated Textarea Component
const ValidatedTextarea = React.memo(({ 
  field, 
  value, 
  onChange, 
  onClearError,
  label, 
  placeholder, 
  rows = 3,
  required = false,
  className = '',
  error,
  ...props 
}: {
  field: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClearError: (field: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  error?: string;
  [key: string]: any;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    if (error) {
      onClearError(field);
    }
  }, [onChange, onClearError, error, field]);

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-semibold text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        value={value || ''}
        onChange={handleChange}
        rows={rows}
        className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 transition-all ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
            : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
        } ${className}`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

ValidatedTextarea.displayName = 'ValidatedTextarea';

// Validated Select Component
const ValidatedSelect = React.memo(({ 
  field, 
  value, 
  onChange, 
  onClearError,
  label, 
  options,
  required = false,
  className = '',
  error,
  ...props 
}: {
  field: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClearError: (field: string) => void;
  label?: string;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
  error?: string;
  [key: string]: any;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);
    if (error) {
      onClearError(field);
    }
  }, [onChange, onClearError, error, field]);

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-semibold text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value || ''}
        onChange={handleChange}
        className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 transition-all ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
            : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
        } ${className}`}
        {...props}
      >
        {options.map((option, idx) => (
          <option key={idx} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

ValidatedSelect.displayName = 'ValidatedSelect';

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
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyModalStep, setPartyModalStep] = useState(1);
  const [editingPartyIndex, setEditingPartyIndex] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
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
    propertyTypeCustom: false,
    usageTypeCustom: false,
    address: '',
    postalCode: '',
    registrationNumber: '',
    section: '',
    area: '',
    areaUnit: 'متر مربع',
    ownershipDocumentType: '',
    ownershipDocumentTypeCustom: false,
    ownershipDocumentSerial: '',
    ownershipDocumentOwner: '',
    storageCount: '',
    storageNumbers: [] as string[],
    parkingCount: '',
    parkingNumbers: [] as string[],
    // NEW: Additional property fields
    bedroomCount: '',
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
  const [originalDraftData, setOriginalDraftData] = useState(draftData);
  const [originalPaymentEntries, setOriginalPaymentEntries] = useState<PaymentEntry[]>([]);

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
        const propertyTypeOptions = ['آپارتمان', 'ویلا', 'خانه', 'زمین', 'مغازه', 'دفتر', 'انبار', 'کارگاه'];
        const usageTypeOptions = ['مسکونی', 'تجاری', 'اداری', 'صنعتی', 'کشاورزی', 'خدماتی', 'مختلط'];
        const ownershipDocumentTypeOptions = ['دفترچه ای', 'تک برگ', 'سند عادی'];
        setPropertyDetails({
          propertyType: pd.propertyType || '',
          usageType: pd.usageType || '',
          propertyTypeCustom: pd.propertyType ? !propertyTypeOptions.includes(pd.propertyType) : false,
          usageTypeCustom: pd.usageType ? !usageTypeOptions.includes(pd.usageType) : false,
          address: pd.address || '',
          postalCode: pd.postalCode || '',
          registrationNumber: pd.registrationNumber?.toString() || '',
          section: pd.section || '',
          area: pd.area?.toString() || '',
          areaUnit: pd.areaUnit || 'متر مربع',
          ownershipDocumentType: pd.ownershipDocumentType || '',
          ownershipDocumentTypeCustom: pd.ownershipDocumentType ? !ownershipDocumentTypeOptions.includes(pd.ownershipDocumentType) : false,
          ownershipDocumentSerial: pd.ownershipDocumentSerial || '',
          ownershipDocumentOwner: pd.ownershipDocumentOwner || '',
          storageCount: pd.storageCount?.toString() || '',
          storageNumbers: pd.storageNumbers || [],
          parkingCount: pd.parkingCount?.toString() || '',
          parkingNumbers: pd.parkingNumbers || [],
          // NEW: Additional property fields
          bedroomCount: pd.bedroomCount?.toString() || '',
          utilityType: {
            electricity: pd.utilityType?.electricity || '',
            water: pd.utilityType?.water || '',
            gas: pd.utilityType?.gas || '',
          },
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
      const loadedDraftData = {
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
      };
      setDraftData(loadedDraftData);
      setOriginalDraftData(loadedDraftData);

      // Load payment entries
      if (selectedContract.paymentEntries && selectedContract.paymentEntries.length > 0) {
        setPaymentEntries(selectedContract.paymentEntries);
        setOriginalPaymentEntries([...selectedContract.paymentEntries]);
      } else {
        setPaymentEntries([]);
        setOriginalPaymentEntries([]);
      }
    }
  }, [selectedContract, contractId, isDataLoaded]);

  // Helper function to convert Persian/Farsi numbers to Latin/English numbers
  const convertToLatinNumbers = (value: string | number | undefined | null): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const persianToLatin: { [key: string]: string } = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return str.split('').map(char => persianToLatin[char] || char).join('');
  };

  // Helper function to convert numeric string to number (handles Persian numbers)
  const parseLatinNumber = (value: string | number | undefined | null): number => {
    if (value === null || value === undefined) return 0;
    const latinStr = convertToLatinNumbers(value);
    return parseFloat(latinStr) || 0;
  };

  // Helper function to convert integer string to integer (handles Persian numbers)
  const parseLatinInteger = (value: string | number | undefined | null): number => {
    if (value === null || value === undefined) return 0;
    const latinStr = convertToLatinNumbers(value);
    return parseInt(latinStr, 10) || 0;
  };

  // Helper function to extract clear error message from API errors
  const getErrorMessage = (err: any, defaultMessage: string): string => {
    // Check for 400 Bad Request - prioritize this for clear error messages
    if (err?.response?.status === 400) {
      const errorData = err.response?.data;
      if (errorData?.message) {
        return `خطا: ${errorData.message}`;
      }
      if (errorData?.error) {
        return `خطا: ${errorData.error}`;
      }
      if (Array.isArray(errorData) && errorData.length > 0) {
        return `خطا: ${errorData.join(', ')}`;
      }
      if (typeof errorData === 'string') {
        return `خطا: ${errorData}`;
      }
      return 'درخواست نامعتبر است. لطفا اطلاعات را بررسی کنید.';
    }
    
    // Check for other HTTP errors
    if (err?.response?.status) {
      const errorData = err.response?.data;
      if (errorData?.message) {
        return errorData.message;
      }
      if (errorData?.error) {
        return errorData.error;
      }
      if (Array.isArray(errorData) && errorData.length > 0) {
        return errorData.join(', ');
      }
    }
    
    // Check for Redux rejected action
    if (err?.type?.endsWith('/rejected')) {
      const payload = err.payload;
      if (payload?.response?.status === 400) {
        const errorData = payload.response?.data;
        if (errorData?.message) {
          return `خطا: ${errorData.message}`;
        }
        if (errorData?.error) {
          return `خطا: ${errorData.error}`;
        }
        if (typeof errorData === 'string') {
          return `خطا: ${errorData}`;
        }
        return 'درخواست نامعتبر است. لطفا اطلاعات را بررسی کنید.';
      }
      if (typeof payload === 'string') {
        return payload;
      }
      if (payload?.message) {
        return payload.message;
      }
      return defaultMessage;
    }
    
    // Fallback to error message or default
    return err?.message || defaultMessage;
  };

  // Helper function to get the current contractId
  const getCurrentContractId = (): string | null => {
    if (contractId) return contractId;
    if (selectedContract?.id) return selectedContract.id;
    return null;
  };

  const handleOpenPartyModal = (index?: number) => {
    if (index !== undefined) {
      // Editing existing party
      setEditingPartyIndex(index);
      setCurrentParty(parties[index]);
    } else {
      // Adding new party
      setEditingPartyIndex(null);
      setCurrentParty({
        partyType: PartyType.LANDLORD,
        partyRole: PartyRole.PRINCIPAL,
        entityType: PartyEntityType.NATURAL,
        shareType: ShareType.DANG,
        shareValue: 0,
      });
    }
    setPartyModalStep(1);
    setShowPartyModal(true);
    setFieldErrors({}); // Clear all errors when opening modal
  };

  const handleClosePartyModal = () => {
    setShowPartyModal(false);
    setPartyModalStep(1);
    setEditingPartyIndex(null);
    setCurrentParty({
      partyType: PartyType.LANDLORD,
      partyRole: PartyRole.PRINCIPAL,
      entityType: PartyEntityType.NATURAL,
      shareType: ShareType.DANG,
      shareValue: 0,
    });
    setFieldErrors({});
  };

  // Helper function to set field error
  const setFieldError = (field: string, error: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  // Helper function to clear all errors
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  // Helper function to clear field error
  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Memoize clearFieldError to prevent recreation
  const clearFieldErrorMemoized = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handlePartyModalNext = () => {
    const errors: Record<string, string> = {};
    
    // Validate current step before proceeding
    if (partyModalStep === 1) {
      if (!currentParty.partyType) {
        errors['partyType'] = 'لطفا نوع طرف را انتخاب کنید';
      }
    } else if (partyModalStep === 2) {
      if (!currentParty.partyRole) {
        errors['partyRole'] = 'لطفا نقش را انتخاب کنید';
      }
    } else if (partyModalStep === 3) {
      if (!currentParty.entityType) {
        errors['entityType'] = 'لطفا نوع شخصیت را انتخاب کنید';
      }
    } else if (partyModalStep === 4) {
      if (!currentParty.shareType) {
        errors['shareType'] = 'لطفا نوع سهم را انتخاب کنید';
      }
      if (!currentParty.shareValue || currentParty.shareValue <= 0) {
        errors['shareValue'] = 'لطفا مقدار سهم را وارد کنید';
      }
    } else if (partyModalStep === 5) {
      // Validate party details
      if (currentParty.entityType === PartyEntityType.NATURAL) {
        if (!currentParty.firstName) {
          errors['firstName'] = 'نام الزامی است';
        }
        if (!currentParty.lastName) {
          errors['lastName'] = 'نام خانوادگی الزامی است';
        }
        if (!currentParty.nationalId) {
          errors['nationalId'] = 'کد ملی الزامی است';
        } else if (currentParty.nationalId.length !== 10) {
          errors['nationalId'] = 'کد ملی باید 10 رقم باشد';
        }
      } else {
        if (!currentParty.companyName) {
          errors['companyName'] = 'نام شرکت الزامی است';
        }
        if (!currentParty.companyNationalId) {
          errors['companyNationalId'] = 'شناسه ملی شرکت الزامی است';
        } else if (currentParty.companyNationalId.length !== 11) {
          errors['companyNationalId'] = 'شناسه ملی شرکت باید 11 رقم باشد';
        }
      }
    } else if (partyModalStep === 6) {
      // Validate authorization/relationship if needed
      if (currentParty.partyRole !== PartyRole.PRINCIPAL) {
        if (!currentParty.principalPartyId) {
          errors['principalPartyId'] = 'طرف اصیل الزامی است';
        }
        if (!currentParty.relationshipType) {
          errors['relationshipType'] = 'نوع رابطه الزامی است';
        }
        if (!currentParty.relationshipDocumentNumber) {
          errors['relationshipDocumentNumber'] = 'شماره سند رابطه الزامی است';
        }
        if (!currentParty.relationshipDocumentDate) {
          errors['relationshipDocumentDate'] = 'تاریخ سند رابطه الزامی است';
        }
      } else if (currentParty.authorityType) {
        if (!currentParty.authorityDocumentNumber) {
          errors['authorityDocumentNumber'] = 'شماره مدرک اختیار الزامی است';
        }
        if (!currentParty.authorityDocumentDate) {
          errors['authorityDocumentDate'] = 'تاریخ مدرک اختیار الزامی است';
        }
      }
    } else if (partyModalStep === 7) {
      handleSaveParty(); // Save and close
      return;
    }

    // Set errors and show notification if any
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      setSnackbar({ open: true, message: firstError, severity: 'error' });
      return;
    }

    // Clear errors for current step
    clearAllErrors();

    // Determine next step
    const needsRelationshipStep = currentParty.partyRole !== PartyRole.PRINCIPAL;
    const needsAuthorizationStep = currentParty.partyRole === PartyRole.PRINCIPAL && 
      currentParty.entityType === PartyEntityType.NATURAL && 
      currentParty.authorityType;

    if (partyModalStep === 5) {
      if (needsRelationshipStep) {
        setPartyModalStep(6); // Go to relationship step
      } else if (needsAuthorizationStep) {
        setPartyModalStep(6); // Go to authorization step
      } else {
        setPartyModalStep(7); // Go directly to preview
      }
    } else if (partyModalStep === 6) {
      setPartyModalStep(7); // Go to preview
    } else {
      setPartyModalStep(partyModalStep + 1);
    }
  };

  const handlePartyModalPrev = () => {
    if (partyModalStep > 1) {
      setPartyModalStep(partyModalStep - 1);
    }
  };

  const handleSaveParty = () => {
    if (editingPartyIndex !== null) {
      // Update existing party
      const updatedParties = [...parties];
      updatedParties[editingPartyIndex] = currentParty as AddPartyRequest;
      setParties(updatedParties);
    } else {
      // Add new party
      setParties([...parties, currentParty as AddPartyRequest]);
    }
    handleClosePartyModal();
    setSnackbar({ open: true, message: editingPartyIndex !== null ? 'طرف قرارداد با موفقیت ویرایش شد' : 'طرف قرارداد با موفقیت افزوده شد', severity: 'success' });
  };

  const handleAddParty = () => {
    // This function is kept for backward compatibility but not used in new UI
    handleOpenPartyModal();
  };

  const handleAddPartyOld = () => {
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
      
      // Convert all numeric values and string fields that may contain numbers in parties to Latin numbers before sending
      // Exclude 'resident' field as backend doesn't accept it
      const partiesWithLatinNumbers = parties.map(party => {
        const { resident, ...partyWithoutResident } = party;
        return {
          ...partyWithoutResident,
          shareValue: parseLatinNumber(party.shareValue),
          // Convert string fields that may contain Persian numbers
          nationalId: party.nationalId ? convertToLatinNumbers(party.nationalId) : undefined,
          companyNationalId: party.companyNationalId ? convertToLatinNumbers(party.companyNationalId) : undefined,
          postalCode: party.postalCode ? convertToLatinNumbers(party.postalCode) : undefined,
          address: party.address ? convertToLatinNumbers(party.address) : undefined,
          idCardNumber: party.idCardNumber ? convertToLatinNumbers(party.idCardNumber) : undefined,
          phone: party.phone ? convertToLatinNumbers(party.phone) : undefined,
          authorityDocumentNumber: party.authorityDocumentNumber ? convertToLatinNumbers(party.authorityDocumentNumber) : undefined,
          registrationNumber: party.registrationNumber ? convertToLatinNumbers(party.registrationNumber) : undefined,
          relationshipDocumentNumber: party.relationshipDocumentNumber ? convertToLatinNumbers(party.relationshipDocumentNumber) : undefined,
        };
      });
      
      const result = await createContractStep2(currentContractId, { parties: partiesWithLatinNumbers });
      
      // Check if the action was rejected
      if (result && 'type' in result && result.type.endsWith('/rejected')) {
        const errorPayload = (result as any).payload;
        const errorMessage = getErrorMessage(errorPayload || {}, 'خطا در به‌روزرسانی طرفین');
        console.error('Step 2 submission rejected:', errorMessage);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        // Don't proceed to next step on error
        return;
      }
      
      setCurrentStep(3);
      setSnackbar({ open: true, message: 'طرفین قرارداد با موفقیت به‌روزرسانی شدند', severity: 'success' });
    } catch (err: any) {
      console.error('Error in step 2:', err);
      const errorMessage = getErrorMessage(err, 'خطا در به‌روزرسانی طرفین');
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      // Don't proceed to next step on error
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
    if (!propertyDetails.area || parseLatinNumber(propertyDetails.area) <= 0) {
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
        area: parseLatinNumber(propertyDetails.area),
        areaUnit: propertyDetails.areaUnit || undefined,
        postalCode: propertyDetails.postalCode ? convertToLatinNumbers(propertyDetails.postalCode.trim()) || undefined : undefined,
        registrationNumber: propertyDetails.registrationNumber ? parseLatinNumber(propertyDetails.registrationNumber) : undefined,
        section: propertyDetails.section ? convertToLatinNumbers(propertyDetails.section.trim()) || undefined : undefined,
        ownershipDocumentType: propertyDetails.ownershipDocumentType?.trim() || undefined,
        ownershipDocumentSerial: propertyDetails.ownershipDocumentSerial ? convertToLatinNumbers(propertyDetails.ownershipDocumentSerial.trim()) || undefined : undefined,
        ownershipDocumentOwner: propertyDetails.ownershipDocumentOwner?.trim() || undefined,
        storageCount: propertyDetails.storageCount ? parseLatinInteger(propertyDetails.storageCount) : undefined,
        storageNumbers: propertyDetails.storageNumbers?.length > 0 ? propertyDetails.storageNumbers.map(n => convertToLatinNumbers(n)) : undefined,
        parkingCount: propertyDetails.parkingCount ? parseLatinInteger(propertyDetails.parkingCount) : undefined,
        parkingNumbers: propertyDetails.parkingNumbers?.length > 0 ? propertyDetails.parkingNumbers.map(n => convertToLatinNumbers(n)) : undefined,
        // NEW: Additional property fields
        bedroomCount: propertyDetails.bedroomCount ? parseLatinInteger(propertyDetails.bedroomCount) : undefined,
        utilityType: (propertyDetails.utilityType?.electricity || propertyDetails.utilityType?.water || propertyDetails.utilityType?.gas) ? propertyDetails.utilityType : undefined,
        heatingStatus: propertyDetails.heatingStatus?.trim() || undefined,
        coolerType: propertyDetails.coolerType?.trim() || undefined,
        phoneNumber: propertyDetails.phoneNumber ? convertToLatinNumbers(propertyDetails.phoneNumber.trim()) || undefined : undefined,
        phoneStatus: propertyDetails.phoneStatus?.trim() || undefined,
        ownershipDocumentPage: propertyDetails.ownershipDocumentPage ? convertToLatinNumbers(propertyDetails.ownershipDocumentPage.trim()) || undefined : undefined,
        ownershipDocumentBook: propertyDetails.ownershipDocumentBook ? convertToLatinNumbers(propertyDetails.ownershipDocumentBook.trim()) || undefined : undefined,
        propertyShareType: propertyDetails.propertyShareType?.trim() || undefined,
        amenities: propertyDetails.amenities || undefined,
      };
      
      const result = await updateProperty(currentContractId, propertyData);
      
      // Check if the action was rejected
      if (result && 'type' in result && result.type.endsWith('/rejected')) {
        const errorPayload = (result as any).payload;
        const errorMessage = getErrorMessage(errorPayload || {}, 'خطا در به‌روزرسانی جزئیات ملک');
        console.error('Step 3 submission rejected:', errorMessage);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        // Don't proceed to next step on error
        return;
      }
      
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
      console.error('Error in step 3:', err);
      const errorMessage = getErrorMessage(err, 'خطا در به‌روزرسانی جزئیات ملک');
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      // Don't proceed to next step on error
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
        evictionNoticeDays: terms.evictionNoticeDays ? parseLatinInteger(terms.evictionNoticeDays) : undefined,
        dailyPenaltyAmount: terms.dailyPenaltyAmount ? parseLatinNumber(terms.dailyPenaltyAmount) : undefined,
        dailyDelayPenalty: terms.dailyDelayPenalty ? parseLatinNumber(terms.dailyDelayPenalty) : undefined,
        dailyOccupancyPenalty: terms.dailyOccupancyPenalty ? parseLatinNumber(terms.dailyOccupancyPenalty) : undefined,
        deliveryDate: terms.deliveryDate || undefined,
        deliveryDelayPenalty: terms.deliveryDelayPenalty ? parseLatinNumber(terms.deliveryDelayPenalty) : undefined,
        usagePurpose: terms.usagePurpose || undefined,
        occupantCount: terms.occupantCount ? parseLatinInteger(terms.occupantCount) : undefined,
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
        earlyTerminationNotice: terms.earlyTerminationNotice ? parseLatinInteger(terms.earlyTerminationNotice) : undefined,
        earlyTerminationPayment: terms.earlyTerminationPayment ? parseLatinNumber(terms.earlyTerminationPayment) : undefined,
        propertyTransferNotification: terms.propertyTransferNotification,
        loanReturnDelayPenalty: terms.loanReturnDelayPenalty ? parseLatinNumber(terms.loanReturnDelayPenalty) : undefined,
      };
      
      const result = await updateTerms(currentContractId, termsData);
      
      // Check if the action was rejected
      if (result && 'type' in result && result.type.endsWith('/rejected')) {
        const errorPayload = (result as any).payload;
        const errorMessage = getErrorMessage(errorPayload || {}, 'خطا در به‌روزرسانی شرایط');
        console.error('Step 4 submission rejected:', errorMessage);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        // Don't proceed to next step on error
        return;
      }
      
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
      const errorMessage = getErrorMessage(err, 'خطا در به‌روزرسانی شرایط');
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      // Don't proceed to next step on error
    }
  };

  const handleSaveDraft = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد یافت نشد', severity: 'error' });
      return;
    }

    try {
      // Build the current update data
      const currentUpdateData: UpdateContractRequest = {
        contractDate: draftData.contractDate || undefined,
        startDate: contractType === ContractType.RENTAL ? (draftData.startDate || undefined) : undefined,
        endDate: contractType === ContractType.RENTAL ? (draftData.endDate || undefined) : undefined,
        rentalAmount: contractType === ContractType.RENTAL ? (draftData.rentalAmount ? parseLatinNumber(draftData.rentalAmount) : undefined) : undefined,
        purchaseAmount: contractType === ContractType.PURCHASE ? (draftData.purchaseAmount ? parseLatinNumber(draftData.purchaseAmount) : undefined) : undefined,
        depositAmount: draftData.depositAmount ? parseLatinNumber(draftData.depositAmount) : undefined,
        paymentEntries: paymentEntries.length > 0 ? paymentEntries.map(entry => ({
          ...entry,
          amount: parseLatinNumber(entry.amount),
          shabaNumber: entry.shabaNumber ? convertToLatinNumbers(entry.shabaNumber) : undefined,
          cardNumber: entry.cardNumber ? convertToLatinNumbers(entry.cardNumber) : undefined,
        })) : undefined,
        // NEW: Administrative fields
        consultancyNumber: draftData.consultancyNumber ? convertToLatinNumbers(draftData.consultancyNumber.trim()) || undefined : undefined,
        registrationArea: draftData.registrationArea?.trim() || undefined,
        registrationOffice: draftData.registrationOffice?.trim() || undefined,
        consultantRegistrationVolume: draftData.consultantRegistrationVolume ? convertToLatinNumbers(draftData.consultantRegistrationVolume.trim()) || undefined : undefined,
        consultantRegistrationNumber: draftData.consultantRegistrationNumber ? convertToLatinNumbers(draftData.consultantRegistrationNumber.trim()) || undefined : undefined,
        consultantRegistrationDate: draftData.consultantRegistrationDate || undefined,
        witness1Name: draftData.witness1Name?.trim() || undefined,
        witness2Name: draftData.witness2Name?.trim() || undefined,
        legalExpertName: draftData.legalExpertName?.trim() || undefined,
        consultantFee: draftData.consultantFee ? parseLatinNumber(draftData.consultantFee) : undefined,
        contractCopies: draftData.contractCopies ? parseLatinInteger(draftData.contractCopies) : undefined,
      };

      // Build original data for comparison
      const originalUpdateData: UpdateContractRequest = {
        contractDate: originalDraftData.contractDate || undefined,
        startDate: contractType === ContractType.RENTAL ? (originalDraftData.startDate || undefined) : undefined,
        endDate: contractType === ContractType.RENTAL ? (originalDraftData.endDate || undefined) : undefined,
        rentalAmount: contractType === ContractType.RENTAL ? (originalDraftData.rentalAmount ? parseLatinNumber(originalDraftData.rentalAmount) : undefined) : undefined,
        purchaseAmount: contractType === ContractType.PURCHASE ? (originalDraftData.purchaseAmount ? parseLatinNumber(originalDraftData.purchaseAmount) : undefined) : undefined,
        depositAmount: originalDraftData.depositAmount ? parseLatinNumber(originalDraftData.depositAmount) : undefined,
        paymentEntries: originalPaymentEntries.length > 0 ? originalPaymentEntries : undefined,
        consultancyNumber: originalDraftData.consultancyNumber?.trim() || undefined,
        registrationArea: originalDraftData.registrationArea?.trim() || undefined,
        registrationOffice: originalDraftData.registrationOffice?.trim() || undefined,
        consultantRegistrationVolume: originalDraftData.consultantRegistrationVolume?.trim() || undefined,
        consultantRegistrationNumber: originalDraftData.consultantRegistrationNumber?.trim() || undefined,
        consultantRegistrationDate: originalDraftData.consultantRegistrationDate || undefined,
        witness1Name: originalDraftData.witness1Name?.trim() || undefined,
        witness2Name: originalDraftData.witness2Name?.trim() || undefined,
        legalExpertName: originalDraftData.legalExpertName?.trim() || undefined,
        consultantFee: originalDraftData.consultantFee ? parseLatinNumber(originalDraftData.consultantFee) : undefined,
        contractCopies: originalDraftData.contractCopies ? parseLatinInteger(originalDraftData.contractCopies) : undefined,
      };

      // Compare payment entries separately (arrays need special handling)
      const paymentEntriesChanged = JSON.stringify(paymentEntries) !== JSON.stringify(originalPaymentEntries);
      
      // Get only changed fields
      const changedFields = getChangedFields(originalUpdateData, currentUpdateData);
      
      // If payment entries changed, include them
      if (paymentEntriesChanged) {
        changedFields.paymentEntries = currentUpdateData.paymentEntries;
      }

      // If no fields changed, show message and return
      if (Object.keys(changedFields).length === 0) {
        setSnackbar({ open: true, message: 'هیچ تغییری اعمال نشده است', severity: 'error' });
        return;
      }

      await updateContract(currentContractId, changedFields);
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
      const currentUpdateData: UpdateContractRequest = {
        contractDate: draftData.contractDate || undefined,
        startDate: contractType === ContractType.RENTAL ? (draftData.startDate || undefined) : undefined,
        endDate: contractType === ContractType.RENTAL ? (draftData.endDate || undefined) : undefined,
        rentalAmount: contractType === ContractType.RENTAL ? (draftData.rentalAmount ? parseLatinNumber(draftData.rentalAmount) : undefined) : undefined,
        purchaseAmount: contractType === ContractType.PURCHASE ? (draftData.purchaseAmount ? parseLatinNumber(draftData.purchaseAmount) : undefined) : undefined,
        depositAmount: draftData.depositAmount ? parseLatinNumber(draftData.depositAmount) : undefined,
        paymentEntries: paymentEntries.length > 0 ? paymentEntries.map(entry => ({
          ...entry,
          amount: parseLatinNumber(entry.amount),
          shabaNumber: entry.shabaNumber ? convertToLatinNumbers(entry.shabaNumber) : undefined,
          cardNumber: entry.cardNumber ? convertToLatinNumbers(entry.cardNumber) : undefined,
        })) : undefined,
        // NEW: Administrative fields
        consultancyNumber: draftData.consultancyNumber ? convertToLatinNumbers(draftData.consultancyNumber.trim()) || undefined : undefined,
        registrationArea: draftData.registrationArea?.trim() || undefined,
        registrationOffice: draftData.registrationOffice?.trim() || undefined,
        consultantRegistrationVolume: draftData.consultantRegistrationVolume ? convertToLatinNumbers(draftData.consultantRegistrationVolume.trim()) || undefined : undefined,
        consultantRegistrationNumber: draftData.consultantRegistrationNumber ? convertToLatinNumbers(draftData.consultantRegistrationNumber.trim()) || undefined : undefined,
        consultantRegistrationDate: draftData.consultantRegistrationDate || undefined,
        witness1Name: draftData.witness1Name?.trim() || undefined,
        witness2Name: draftData.witness2Name?.trim() || undefined,
        legalExpertName: draftData.legalExpertName?.trim() || undefined,
        consultantFee: draftData.consultantFee ? parseLatinNumber(draftData.consultantFee) : undefined,
        contractCopies: draftData.contractCopies ? parseLatinInteger(draftData.contractCopies) : undefined,
      };

      // Build original data for comparison
      const originalUpdateData: UpdateContractRequest = {
        contractDate: originalDraftData.contractDate || undefined,
        startDate: contractType === ContractType.RENTAL ? (originalDraftData.startDate || undefined) : undefined,
        endDate: contractType === ContractType.RENTAL ? (originalDraftData.endDate || undefined) : undefined,
        rentalAmount: contractType === ContractType.RENTAL ? (originalDraftData.rentalAmount ? parseLatinNumber(originalDraftData.rentalAmount) : undefined) : undefined,
        purchaseAmount: contractType === ContractType.PURCHASE ? (originalDraftData.purchaseAmount ? parseLatinNumber(originalDraftData.purchaseAmount) : undefined) : undefined,
        depositAmount: originalDraftData.depositAmount ? parseLatinNumber(originalDraftData.depositAmount) : undefined,
        paymentEntries: originalPaymentEntries.length > 0 ? originalPaymentEntries : undefined,
        consultancyNumber: originalDraftData.consultancyNumber?.trim() || undefined,
        registrationArea: originalDraftData.registrationArea?.trim() || undefined,
        registrationOffice: originalDraftData.registrationOffice?.trim() || undefined,
        consultantRegistrationVolume: originalDraftData.consultantRegistrationVolume?.trim() || undefined,
        consultantRegistrationNumber: originalDraftData.consultantRegistrationNumber?.trim() || undefined,
        consultantRegistrationDate: originalDraftData.consultantRegistrationDate || undefined,
        witness1Name: originalDraftData.witness1Name?.trim() || undefined,
        witness2Name: originalDraftData.witness2Name?.trim() || undefined,
        legalExpertName: originalDraftData.legalExpertName?.trim() || undefined,
        consultantFee: originalDraftData.consultantFee ? parseLatinNumber(originalDraftData.consultantFee) : undefined,
        contractCopies: originalDraftData.contractCopies ? parseLatinInteger(originalDraftData.contractCopies) : undefined,
      };

      // Compare payment entries separately
      const paymentEntriesChanged = JSON.stringify(paymentEntries) !== JSON.stringify(originalPaymentEntries);
      
      // Get only changed fields
      const changedFields = getChangedFields(originalUpdateData, currentUpdateData);
      
      // If payment entries changed, include them
      if (paymentEntriesChanged) {
        changedFields.paymentEntries = currentUpdateData.paymentEntries;
      }
      
      // Only update if there are changes
      if (Object.keys(changedFields).length > 0) {
        console.log('Saving financial and administrative data before finalizing...');
        await updateContract(currentContractId, changedFields);
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

  const renderPartyModal = () => {
    const principalParties = parties.filter(p => p.partyRole === PartyRole.PRINCIPAL);
    const needsRelationshipStep = currentParty.partyRole !== PartyRole.PRINCIPAL;
    const needsAuthorizationStep = currentParty.partyRole === PartyRole.PRINCIPAL && 
      currentParty.entityType === PartyEntityType.NATURAL && 
      currentParty.authorityType;
    
    const totalSteps = 7; // Always 7 steps: 1-5 basic, 6 conditional (relationship/auth), 7 preview

    const renderModalStep = () => {
      switch (partyModalStep) {
        case 1: // Party Type
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 text-center">انتخاب نوع طرف</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setCurrentParty(prev => ({ ...prev, partyType: PartyType.LANDLORD }));
                    clearFieldErrorMemoized('partyType');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    currentParty.partyType === PartyType.LANDLORD
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : fieldErrors['partyType']
                      ? 'border-red-500 hover:border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-2xl font-bold">{getPartyTypeLabel(PartyType.LANDLORD)}</div>
                  <div className="text-sm mt-2 text-gray-500">
                    {contractType === ContractType.RENTAL ? 'مالک ملک' : 'فروشنده ملک'}
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCurrentParty(prev => ({ ...prev, partyType: PartyType.TENANT }));
                    clearFieldErrorMemoized('partyType');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    currentParty.partyType === PartyType.TENANT
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : fieldErrors['partyType']
                      ? 'border-red-500 hover:border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-2xl font-bold">{getPartyTypeLabel(PartyType.TENANT)}</div>
                  <div className="text-sm mt-2 text-gray-500">
                    {contractType === ContractType.RENTAL ? 'مستاجر ملک' : 'خریدار ملک'}
                  </div>
                </button>
              </div>
              {fieldErrors['partyType'] && (
                <p className="text-center text-sm text-red-600">{fieldErrors['partyType']}</p>
              )}
            </div>
          );

        case 2: // Role
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 text-center">انتخاب نقش</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setCurrentParty(prev => ({ ...prev, partyRole: PartyRole.PRINCIPAL }));
                    clearFieldErrorMemoized('partyRole');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    currentParty.partyRole === PartyRole.PRINCIPAL
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : fieldErrors['partyRole']
                      ? 'border-red-500 hover:border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-xl font-bold">اصیل</div>
                  <div className="text-sm mt-2 text-gray-500">طرف اصلی قرارداد</div>
                </button>
                <button
                  onClick={() => {
                    setCurrentParty(prev => ({ ...prev, partyRole: PartyRole.REPRESENTATIVE }));
                    clearFieldErrorMemoized('partyRole');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    currentParty.partyRole === PartyRole.REPRESENTATIVE
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : fieldErrors['partyRole']
                      ? 'border-red-500 hover:border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-xl font-bold">نماینده</div>
                  <div className="text-sm mt-2 text-gray-500">نماینده طرف اصیل</div>
                </button>
                <button
                  onClick={() => {
                    setCurrentParty(prev => ({ ...prev, partyRole: PartyRole.ATTORNEY }));
                    clearFieldErrorMemoized('partyRole');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    currentParty.partyRole === PartyRole.ATTORNEY
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : fieldErrors['partyRole']
                      ? 'border-red-500 hover:border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-xl font-bold">وکیل</div>
                  <div className="text-sm mt-2 text-gray-500">وکیل طرف اصیل</div>
                </button>
              </div>
              {fieldErrors['partyRole'] && (
                <p className="text-center text-sm text-red-600">{fieldErrors['partyRole']}</p>
              )}
            </div>
          );

        case 3: // Entity Type
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 text-center">انتخاب نوع شخصیت</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setCurrentParty(prev => ({ ...prev, entityType: PartyEntityType.NATURAL }));
                    clearFieldErrorMemoized('entityType');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    currentParty.entityType === PartyEntityType.NATURAL
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : fieldErrors['entityType']
                      ? 'border-red-500 hover:border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-xl font-bold">شخص حقیقی</div>
                  <div className="text-sm mt-2 text-gray-500">فرد</div>
                </button>
                <button
                  onClick={() => {
                    setCurrentParty(prev => ({ ...prev, entityType: PartyEntityType.LEGAL }));
                    clearFieldErrorMemoized('entityType');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    currentParty.entityType === PartyEntityType.LEGAL
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : fieldErrors['entityType']
                      ? 'border-red-500 hover:border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-xl font-bold">شخص حقوقی</div>
                  <div className="text-sm mt-2 text-gray-500">شرکت یا سازمان</div>
                </button>
              </div>
              {fieldErrors['entityType'] && (
                <p className="text-center text-sm text-red-600">{fieldErrors['entityType']}</p>
              )}
            </div>
          );

        case 4: // Share Type and Value
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 text-center">نوع سهم و مقدار آن</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">
                    نوع سهم <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setCurrentParty(prev => ({ ...prev, shareType: ShareType.DANG }));
                        clearFieldErrorMemoized('shareType');
                      }}
                      className={
                        currentParty.shareType === ShareType.DANG
                          ? 'p-4 rounded-2xl border-2 transition-all border-primary-500 bg-primary-50 text-primary-700'
                          : fieldErrors['shareType']
                          ? 'p-4 rounded-2xl border-2 transition-all border-red-500 hover:border-red-600 bg-red-50'
                          : 'p-4 rounded-2xl border-2 transition-all border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                      }
                    >
                      <div className="font-bold">دانگ</div>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentParty(prev => ({ ...prev, shareType: ShareType.PERCENTAGE }));
                        clearFieldErrorMemoized('shareType');
                      }}
                      className={
                        currentParty.shareType === ShareType.PERCENTAGE
                          ? 'p-4 rounded-2xl border-2 transition-all border-primary-500 bg-primary-50 text-primary-700'
                          : fieldErrors['shareType']
                          ? 'p-4 rounded-2xl border-2 transition-all border-red-500 hover:border-red-600 bg-red-50'
                          : 'p-4 rounded-2xl border-2 transition-all border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                      }
                    >
                      <div className="font-bold">درصد</div>
                    </button>
                  </div>
                  {fieldErrors['shareType'] ? (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors['shareType']}</p>
                  ) : null}
                </div>
                <ValidatedInput
                  field="shareValue"
                  value={currentParty.shareValue?.toString() || ''}
                  onChange={(e) => setCurrentParty(prev => ({ ...prev, shareValue: parseFloat(e.target.value) || 0 }))}
                  onClearError={clearFieldErrorMemoized}
                  label="مقدار سهم"
                  type="number"
                  placeholder={currentParty.shareType === ShareType.DANG ? "مثال: 2" : "مثال: 50"}
                  required
                  error={fieldErrors['shareValue']}
                />
              </div>
            </div>
          );

        case 5: // Party Details
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 text-center">مشخصات طرف</h3>
              {currentParty.entityType === PartyEntityType.NATURAL ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ValidatedInput
                      field="firstName"
                      value={currentParty.firstName || ''}
                      onChange={(e) => setCurrentParty(prev => ({ ...prev, firstName: e.target.value }))}
                      onClearError={clearFieldErrorMemoized}
                      label="نام"
                      required
                      error={fieldErrors['firstName']}
                    />
                    <ValidatedInput
                      field="lastName"
                      value={currentParty.lastName || ''}
                      onChange={(e) => setCurrentParty(prev => ({ ...prev, lastName: e.target.value }))}
                      onClearError={clearFieldErrorMemoized}
                      label="نام خانوادگی"
                      required
                      error={fieldErrors['lastName']}
                    />
                  </div>
                  <ValidatedInput
                    field="nationalId"
                    value={currentParty.nationalId || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, nationalId: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="کد ملی"
                    maxLength={10}
                    required
                    error={fieldErrors['nationalId']}
                  />
                  <ValidatedTextarea
                    field="address"
                    value={currentParty.address || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, address: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="آدرس"
                    placeholder="آدرس کامل"
                    rows={3}
                    error={fieldErrors['address']}
                  />
                  <div className="border-t border-gray-200 pt-4">
                    <label className="mb-2 block text-sm font-semibold text-gray-600">آیا اطلاعات اختیار دارید؟</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setCurrentParty(prev => ({ ...prev, authorityType: '' }));
                          clearFieldErrorMemoized('authorityType');
                        }}
                        className={`flex-1 p-3 rounded-2xl border-2 transition-all ${
                          !currentParty.authorityType
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                        }`}
                      >
                        خیر
                      </button>
                      <button
                        onClick={() => {
                          setCurrentParty(prev => ({ ...prev, authorityType: 'وکالت' }));
                          clearFieldErrorMemoized('authorityType');
                        }}
                        className={`flex-1 p-3 rounded-2xl border-2 transition-all ${
                          currentParty.authorityType
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-300 bg-white text-gray-700'
                        }`}
                      >
                        بله
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ValidatedInput
                    field="companyName"
                    value={currentParty.companyName || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, companyName: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="نام شرکت"
                    required
                    error={fieldErrors['companyName']}
                  />
                  <ValidatedInput
                    field="companyNationalId"
                    value={currentParty.companyNationalId || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, companyNationalId: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="شناسه ملی شرکت"
                    maxLength={11}
                    required
                    error={fieldErrors['companyNationalId']}
                  />
                  <ValidatedTextarea
                    field="address"
                    value={currentParty.address || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, address: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="آدرس"
                    placeholder="آدرس کامل"
                    rows={3}
                    error={fieldErrors['address']}
                  />
                </div>
              )}
            </div>
          );

        case 6: // Authorization or Relationship
          if (currentParty.partyRole !== PartyRole.PRINCIPAL) {
            // Relationship info for representative/attorney
            return (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 text-center">اطلاعات نماینده/وکیل</h3>
                <div className="space-y-4">
                  <ValidatedSelect
                    field="principalPartyId"
                    value={currentParty.principalPartyId || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, principalPartyId: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="طرف اصیل"
                    required
                    error={fieldErrors['principalPartyId']}
                    options={[
                      { value: '', label: 'انتخاب کنید' },
                      ...principalParties
                        .filter(p => p.partyType === currentParty.partyType)
                        .map((p, idx) => {
                          const partyIndex = parties.findIndex(party => party === p);
                          return {
                            value: partyIndex >= 0 ? partyIndex.toString() : idx.toString(),
                            label: p.entityType === PartyEntityType.NATURAL
                              ? `${p.firstName} ${p.lastName}`
                              : p.companyName || ''
                          };
                        })
                    ]}
                  />
                  <ValidatedSelect
                    field="relationshipType"
                    value={currentParty.relationshipType || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, relationshipType: e.target.value as RelationshipType }))}
                    onClearError={clearFieldErrorMemoized}
                    label="نوع رابطه"
                    required
                    error={fieldErrors['relationshipType']}
                    options={[
                      { value: '', label: 'انتخاب کنید' },
                      { value: RelationshipType.ATTORNEY, label: 'وکالت' },
                      { value: RelationshipType.MANAGEMENT, label: 'مدیریت' },
                      { value: RelationshipType.GUARDIAN, label: 'ولی' },
                      { value: RelationshipType.OTHER, label: 'سایر' }
                    ]}
                  />
                  <ValidatedInput
                    field="relationshipDocumentNumber"
                    value={currentParty.relationshipDocumentNumber || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, relationshipDocumentNumber: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="شماره سند رابطه"
                    required
                    error={fieldErrors['relationshipDocumentNumber']}
                  />
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      تاریخ سند رابطه <span className="text-red-500">*</span>
                    </label>
                    <PersianDatePicker
                      value={currentParty.relationshipDocumentDate || ''}
                      onChange={(value) => {
                        setCurrentParty(prev => ({ ...prev, relationshipDocumentDate: value }));
                        if (fieldErrors['relationshipDocumentDate']) clearFieldErrorMemoized('relationshipDocumentDate');
                      }}
                    />
                    {fieldErrors['relationshipDocumentDate'] && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors['relationshipDocumentDate']}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          } else {
            // Authorization info
            return (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 text-center">اطلاعات اختیار</h3>
                <div className="space-y-4">
                  <ValidatedSelect
                    field="authorityType"
                    value={currentParty.authorityType || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, authorityType: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="نوع اختیار"
                    required
                    error={fieldErrors['authorityType']}
                    options={[
                      { value: '', label: 'انتخاب کنید' },
                      { value: 'وکالت', label: 'وکالت' },
                      { value: 'قیومیت', label: 'قیومیت' },
                      { value: 'ولایت', label: 'ولایت' },
                      { value: 'وصايت', label: 'وصايت' }
                    ]}
                  />
                  <ValidatedInput
                    field="authorityDocumentNumber"
                    value={currentParty.authorityDocumentNumber || ''}
                    onChange={(e) => setCurrentParty(prev => ({ ...prev, authorityDocumentNumber: e.target.value }))}
                    onClearError={clearFieldErrorMemoized}
                    label="شماره مدرک اختیار"
                    required
                    disabled={!currentParty.authorityType}
                    error={fieldErrors['authorityDocumentNumber']}
                  />    
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">
                      تاریخ مدرک اختیار <span className="text-red-500">*</span>
                    </label>
                    <PersianDatePicker
                      value={currentParty.authorityDocumentDate || ''}
                      onChange={(value) => {
                        setCurrentParty(prev => ({ ...prev, authorityDocumentDate: value }));
                        if (fieldErrors['authorityDocumentDate']) clearFieldErrorMemoized('authorityDocumentDate');
                      }}
                      disabled={!currentParty.authorityType}
                    />
                    {fieldErrors['authorityDocumentDate'] && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors['authorityDocumentDate']}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          }

        case 7: // Preview
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 text-center">پیش نمایش اطلاعات</h3>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">نوع طرف:</span>
                    <p className="font-semibold">{getPartyTypeLabel(currentParty.partyType!)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">نقش:</span>
                    <p className="font-semibold">
                      {currentParty.partyRole === PartyRole.PRINCIPAL ? 'اصیل' : 
                       currentParty.partyRole === PartyRole.REPRESENTATIVE ? 'نماینده' : 'وکیل'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">نوع شخصیت:</span>
                    <p className="font-semibold">
                      {currentParty.entityType === PartyEntityType.NATURAL ? 'حقیقی' : 'حقوقی'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">سهم:</span>
                    <p className="font-semibold">
                      {currentParty.shareValue} {currentParty.shareType === ShareType.DANG ? 'دانگ' : 'درصد'}
                    </p>
                  </div>
                </div>
                {currentParty.entityType === PartyEntityType.NATURAL ? (
                  <>
                    <div className="border-t pt-4">
                      <span className="text-sm text-gray-500">نام و نام خانوادگی:</span>
                      <p className="font-semibold">{currentParty.firstName} {currentParty.lastName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">کد ملی:</span>
                      <p className="font-semibold">{currentParty.nationalId}</p>
                    </div>
                    {currentParty.address && (
                      <div>
                        <span className="text-sm text-gray-500">آدرس:</span>
                        <p className="font-semibold">{currentParty.address}</p>
                      </div>
                    )}
                    {currentParty.authorityType && (
                      <div className="border-t pt-4">
                        <span className="text-sm text-gray-500">نوع اختیار:</span>
                        <p className="font-semibold">{currentParty.authorityType}</p>
                        {currentParty.authorityDocumentNumber && (
                          <p className="text-sm mt-1">شماره: {currentParty.authorityDocumentNumber}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="border-t pt-4">
                      <span className="text-sm text-gray-500">نام شرکت:</span>
                      <p className="font-semibold">{currentParty.companyName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">شناسه ملی:</span>
                      <p className="font-semibold">{currentParty.companyNationalId}</p>
                    </div>
                    {currentParty.address && (
                      <div>
                        <span className="text-sm text-gray-500">آدرس:</span>
                        <p className="font-semibold">{currentParty.address}</p>
                      </div>
                    )}
                  </>
                )}
                {currentParty.partyRole !== PartyRole.PRINCIPAL && (
                  <div className="border-t pt-4">
                    <span className="text-sm text-gray-500">طرف اصیل:</span>
                    <p className="font-semibold">
                      {(() => {
                        const principal = principalParties.find(p => {
                          const idx = parties.findIndex(party => party === p);
                          return idx.toString() === currentParty.principalPartyId;
                        });
                        return principal
                          ? principal.entityType === PartyEntityType.NATURAL
                            ? `${principal.firstName} ${principal.lastName}`
                            : principal.companyName
                          : '';
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    if (!showPartyModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-right shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleClosePartyModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="text-2xl" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPartyIndex !== null ? 'ویرایش طرف قرارداد' : 'افزودن طرف قرارداد'}
            </h2>
            <div className="w-8"></div>
          </div>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5, 6, 7].map((step, idx) => {
                // Skip step 6 if not needed
                if (step === 6 && !needsRelationshipStep && !needsAuthorizationStep) {
                  return null;
                }
                const isActive = step === partyModalStep;
                const isCompleted = step < partyModalStep;
                const isLast = idx === 6;
                return (
                  <div key={idx} className="flex items-center flex-1">
                    <div className={`flex-1 h-2 rounded-full ${
                      isCompleted || isActive ? 'bg-primary-500' : 'bg-gray-200'
                    }`}></div>
                    {!isLast && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isCompleted ? 'bg-primary-500 text-white' :
                        isActive ? 'bg-primary-100 text-primary-700 border-2 border-primary-500' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? '✓' : step}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              مرحله {partyModalStep} از {totalSteps}
            </div>
          </div>

          {/* Step content */}
          <div className="mb-6 min-h-[300px]">
            {renderModalStep()}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePartyModalPrev}
              disabled={partyModalStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                partyModalStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FiArrowRight />
              قبلی
            </button>
            <button
              onClick={handlePartyModalNext}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all"
            >
              {partyModalStep === totalSteps ? 'ذخیره' : 'بعدی'}
              {partyModalStep !== totalSteps && <FiArrowLeft />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const landlordParties = parties.filter(p => p.partyType === PartyType.LANDLORD);
    const tenantParties = parties.filter(p => p.partyType === PartyType.TENANT);
    const principalParties = parties.filter(p => p.partyRole === PartyRole.PRINCIPAL);

    // Check if landlord shares are valid
    const isLandlordShareValid = () => {
      if (landlordParties.length === 0) return true;
      const landlordShareType = landlordParties[0].shareType;
      const landlordTotal = landlordParties.reduce((sum, p) => {
        const value = typeof p.shareValue === 'number' ? p.shareValue : parseLatinNumber(p.shareValue);
        return sum + value;
      }, 0);
      const expectedTotal = landlordShareType === ShareType.DANG ? 6 : 100;
      return Math.abs(landlordTotal - expectedTotal) <= 0.01;
    };

    // Check if tenant shares are valid
    const isTenantShareValid = () => {
      if (tenantParties.length === 0) return true;
      const tenantShareType = tenantParties[0].shareType;
      const tenantTotal = tenantParties.reduce((sum, p) => {
        const value = typeof p.shareValue === 'number' ? p.shareValue : parseLatinNumber(p.shareValue);
        return sum + value;
      }, 0);
      const expectedTotal = tenantShareType === ShareType.DANG ? 6 : 100;
      return Math.abs(tenantTotal - expectedTotal) <= 0.01;
    };

    const landlordShareInvalid = !isLandlordShareValid();
    const tenantShareInvalid = !isTenantShareValid();

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">مرحله 2: ثبت طرفین قرارداد</h2>
        
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">طرفین قرارداد</h3>
            <button
              onClick={() => handleOpenPartyModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all"
            >
              <FiPlus />
              افزودن طرف
            </button>
          </div>
          
          {parties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">نوع طرف</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">نقش</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">نام</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">سهم</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.map((party, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {getPartyTypeLabel(party.partyType)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {party.partyRole === PartyRole.PRINCIPAL ? 'اصیل' : 
                         party.partyRole === PartyRole.REPRESENTATIVE ? 'نماینده' : 'وکیل'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {party.entityType === PartyEntityType.NATURAL
                          ? `${party.firstName || ''} ${party.lastName || ''}`.trim()
                          : party.companyName || ''}
                      </td>
                      <td className={`py-3 px-4 text-sm ${
                        (party.partyType === PartyType.LANDLORD && landlordShareInvalid) ||
                        (party.partyType === PartyType.TENANT && tenantShareInvalid)
                          ? 'text-red-600 font-semibold'
                          : 'text-gray-800'
                      }`}>
                        {party.shareValue} {party.shareType === ShareType.DANG ? 'دانگ' : 'درصد'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenPartyModal(index)}
                            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all"
                            title="ویرایش"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleRemoveParty(index)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            title="حذف"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>هنوز طرفی اضافه نشده است</p>
              <p className="text-sm mt-2">برای افزودن طرف جدید روی دکمه "افزودن طرف" کلیک کنید</p>
            </div>
          )}
          
          {parties.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <div className={landlordShareInvalid ? 'text-red-600' : ''}>
                  <span className="font-semibold">{getPartyTypeLabel(PartyType.LANDLORD)}ان:</span>{' '}
                  <span className={landlordShareInvalid ? 'font-bold' : ''}>
                    مجموع {landlordParties.reduce((sum, p) => {
                      const value = typeof p.shareValue === 'number' ? p.shareValue : parseLatinNumber(p.shareValue);
                      return sum + value;
                    }, 0)} {landlordParties[0]?.shareType === ShareType.DANG ? 'دانگ' : 'درصد'}
                  </span>
                  {landlordShareInvalid && landlordParties.length > 0 && (
                    <span className="text-red-600 text-xs mr-2">
                      (باید {landlordParties[0]?.shareType === ShareType.DANG ? '6' : '100'} {landlordParties[0]?.shareType === ShareType.DANG ? 'دانگ' : 'درصد'} باشد)
                    </span>
                  )}
                </div>
                <div className={tenantShareInvalid ? 'text-red-600' : ''}>
                  <span className="font-semibold">{getPartyTypeLabel(PartyType.TENANT)}ان:</span>{' '}
                  <span className={tenantShareInvalid ? 'font-bold' : ''}>
                    مجموع {tenantParties.reduce((sum, p) => {
                      const value = typeof p.shareValue === 'number' ? p.shareValue : parseLatinNumber(p.shareValue);
                      return sum + value;
                    }, 0)} {tenantParties[0]?.shareType === ShareType.DANG ? 'دانگ' : 'درصد'}
                  </span>
                  {tenantShareInvalid && tenantParties.length > 0 && (
                    <span className="text-red-600 text-xs mr-2">
                      (باید {tenantParties[0]?.shareType === ShareType.DANG ? '6' : '100'} {tenantParties[0]?.shareType === ShareType.DANG ? 'دانگ' : 'درصد'} باشد)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Party Modal */}
        {renderPartyModal()}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">مرحله 3: ثبت جزئیات ملک (ماده 1)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">نوع ملک</label>
          <select
            value={propertyDetails.propertyTypeCustom ? 'CUSTOM' : propertyDetails.propertyType}
            onChange={(e) => {
              if (e.target.value === 'CUSTOM') {
                setPropertyDetails({ ...propertyDetails, propertyTypeCustom: true, propertyType: '' });
              } else {
                setPropertyDetails({ ...propertyDetails, propertyTypeCustom: false, propertyType: e.target.value });
              }
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="آپارتمان">آپارتمان</option>
            <option value="ویلا">ویلا</option>
            <option value="خانه">خانه</option>
            <option value="زمین">زمین</option>
            <option value="مغازه">مغازه</option>
            <option value="دفتر">دفتر</option>
            <option value="انبار">انبار</option>
            <option value="کارگاه">کارگاه</option>
            <option value="CUSTOM">سایر (دستی)</option>
          </select>
          {propertyDetails.propertyTypeCustom && (
            <input
              type="text"
              value={propertyDetails.propertyType}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, propertyType: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="نوع ملک را وارد کنید"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">نوع کاربری</label>
          <select
            value={propertyDetails.usageTypeCustom ? 'CUSTOM' : propertyDetails.usageType}
            onChange={(e) => {
              if (e.target.value === 'CUSTOM') {
                setPropertyDetails({ ...propertyDetails, usageTypeCustom: true, usageType: '' });
              } else {
                setPropertyDetails({ ...propertyDetails, usageTypeCustom: false, usageType: e.target.value });
              }
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="مسکونی">مسکونی</option>
            <option value="تجاری">تجاری</option>
            <option value="اداری">اداری</option>
            <option value="صنعتی">صنعتی</option>
            <option value="کشاورزی">کشاورزی</option>
            <option value="خدماتی">خدماتی</option>
            <option value="مختلط">مختلط</option>
            <option value="CUSTOM">سایر (دستی)</option>
          </select>
          {propertyDetails.usageTypeCustom && (
            <input
              type="text"
              value={propertyDetails.usageType}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, usageType: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="نوع کاربری را وارد کنید"
            />
          )}
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
              step="0.01"
              value={propertyDetails.area}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty, numbers, and decimal with max 2 decimal places
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                  setPropertyDetails({ ...propertyDetails, area: value });
                }
              }}
              onBlur={(e) => {
                // Round to 2 decimal places on blur
                const value = e.target.value;
                if (value && !isNaN(parseFloat(value))) {
                  const rounded = parseFloat(value).toFixed(2);
                  setPropertyDetails({ ...propertyDetails, area: rounded });
                }
              }}
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="مثال: 120.50"
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
          <label className="mb-1 block text-sm font-semibold text-gray-600">پلاک ثبتی</label>
          <input
            type="number"
            step="0.01"
            value={propertyDetails.registrationNumber}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty, numbers, and decimal with max 2 decimal places
              if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                setPropertyDetails({ ...propertyDetails, registrationNumber: value });
              }
            }}
            onBlur={(e) => {
              // Round to 2 decimal places on blur
              const value = e.target.value;
              if (value && !isNaN(parseFloat(value))) {
                const rounded = parseFloat(value).toFixed(2);
                setPropertyDetails({ ...propertyDetails, registrationNumber: rounded });
              }
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="مثال: 123.45"
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
          <select
            value={propertyDetails.ownershipDocumentTypeCustom ? 'CUSTOM' : propertyDetails.ownershipDocumentType}
            onChange={(e) => {
              if (e.target.value === 'CUSTOM') {
                setPropertyDetails({ ...propertyDetails, ownershipDocumentTypeCustom: true, ownershipDocumentType: '' });
              } else {
                setPropertyDetails({ ...propertyDetails, ownershipDocumentTypeCustom: false, ownershipDocumentType: e.target.value });
              }
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="دفترچه ای">دفترچه ای</option>
            <option value="تک برگ">تک برگ</option>
            <option value="سند عادی">سند عادی</option>
            <option value="CUSTOM">سایر (دستی)</option>
          </select>
          {propertyDetails.ownershipDocumentTypeCustom && (
            <input
              type="text"
              value={propertyDetails.ownershipDocumentType}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, ownershipDocumentType: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="نوع سند مالکیت را وارد کنید"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">
            {propertyDetails.ownershipDocumentType === 'سند عادی' ? 'شماره سند' : 'سریال سند'}
          </label>
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
          <label className="mb-1 block text-sm font-semibold text-gray-600">وضعیت سیستم آب گرم</label>
          <select
            value={propertyDetails.heatingStatus || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, heatingStatus: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="پکیج">پکیج</option>
            <option value="موتورخانه مرکزی">موتورخانه مرکزی</option>
            <option value="آبگرمکن">آبگرمکن</option>
            <option value="دستی">دستی</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">سیستم تهویه</label>
          <select
            value={propertyDetails.coolerType || ''}
            onChange={(e) => setPropertyDetails({ ...propertyDetails, coolerType: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="اسپیلت">اسپیلت</option>
            <option value="داک اسپلیت">داک اسپلیت</option>
            <option value="سیستم مرکزی ( چیلر )">سیستم مرکزی ( چیلر )</option>
            <option value="رادیاتور ( کولر آبی‌ )">رادیاتور ( کولر آبی‌ )</option>
          </select>
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
          <PersianDatePicker
            value={terms.deliveryDate}
            onChange={(value) => setTerms({ ...terms, deliveryDate: value })}
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
          <PersianDatePicker
            value={draftData.contractDate}
            onChange={(value) => setDraftData({ ...draftData, contractDate: value })}
          />
        </div>
        {contractType === ContractType.RENTAL && (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ شروع</label>
              <PersianDatePicker
                value={draftData.startDate}
                onChange={(value) => setDraftData({ ...draftData, startDate: value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">تاریخ پایان</label>
              <PersianDatePicker
                value={draftData.endDate}
                onChange={(value) => setDraftData({ ...draftData, endDate: value })}
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
            <PersianDatePicker
              value={draftData.consultantRegistrationDate}
              onChange={(value) => setDraftData({ ...draftData, consultantRegistrationDate: value })}
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
