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
import { formatNumber, parseFormattedNumber } from '../../../../src/shared/utils/numberUtils';
import { formatToPersianDate, formatToGregorianDate } from '../../../../src/shared/utils/dateUtils';
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

  // بررسی اعتبارسنجی مجموع پرداختی‌ها
  const validatePayments = (): { isValid: boolean; errorMessage?: string } => {
    if (contractType === ContractType.RENTAL) {
      // برای اجاره‌نامه: مجموع رهن باید >= مبلغ ودیعه باشد
      const depositAmount = draftData.depositAmount ? parseFloat(draftData.depositAmount) : 0;
      const mortgageTotal = getPaymentTotal(PaymentType.MORTGAGE);
      
      if (depositAmount > 0 && mortgageTotal < depositAmount) {
        return {
          isValid: false,
          errorMessage: `مجموع رهن (${mortgageTotal.toLocaleString('fa-IR')} ریال) کمتر از مبلغ ودیعه (${depositAmount.toLocaleString('fa-IR')} ریال) است. لطفا پرداختی‌های بیشتری اضافه کنید.`
        };
      }
    } else if (contractType === ContractType.PURCHASE) {
      // برای مبایعه‌نامه: مجموع همه پرداختی‌ها باید >= مبلغ خرید باشد
      const purchaseAmount = draftData.purchaseAmount ? parseFloat(draftData.purchaseAmount) : 0;
      const allPaymentsTotal = getAllPaymentsTotal();
      
      if (purchaseAmount > 0 && allPaymentsTotal < purchaseAmount) {
        return {
          isValid: false,
          errorMessage: `مجموع پرداختی‌ها (${allPaymentsTotal.toLocaleString('fa-IR')} ریال) کمتر از مبلغ خرید (${purchaseAmount.toLocaleString('fa-IR')} ریال) است. لطفا پرداختی‌های بیشتری اضافه کنید.`
        };
      }
    }
    
    return { isValid: true };
  };

  // Step 2: Parties
  const [parties, setParties] = useState<AddPartyRequest[]>([]);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyModalStep, setPartyModalStep] = useState(1);
  const [editingPartyIndex, setEditingPartyIndex] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [step1FieldErrors, setStep1FieldErrors] = useState<Record<string, string>>({});
  const [step2FieldErrors, setStep2FieldErrors] = useState<Record<string, string>>({});
  const [step3FieldErrors, setStep3FieldErrors] = useState<Record<string, string>>({});
  const [step4FieldErrors, setStep4FieldErrors] = useState<Record<string, string>>({});
  
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
    heatingStatusCustom: false,
    coolerType: '',
    coolerTypeCustom: false,
    phoneNumber: '',
    phoneStatus: '',
    ownershipDocumentPage: '',
    ownershipDocumentBook: '',
    uniqueDocumentId: '',
    propertyShareType: '',
    amenities: {
      flooring: '',
      flooringCustom: false,
      bathroom: '',
      bathroomCustom: false,
      meetingHall: false,
      club: false,
      amphitheater: false,
      security: false,
      balcony: false,
      hood: false,
      janitorial: false,
      lobby: false,
      terrace: false,
      videoIntercom: false,
      remoteParkingGate: false,
      tableGas: false,
      centralAntenna: false,
    },
  });

  // Step 4: Terms
  const [terms, setTerms] = useState({
    dailyDelayPenalty: '',
    dailyOccupancyPenalty: '',
    deliveryDate: '',
    deliveryDelayPenalty: '',
    usagePurpose: '',
    usagePurposeOther: '',
    occupantCount: '',
    customTerms: '',
    // NEW: Article 6 conditions
    rentPaymentDeadline: '',
    renewalConditions: '',
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
    registrationArea: '',
    witness1Name: '',
    witness2Name: '',
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
    if (selectedContract && selectedContract.id === contractId) {
      // Set contract type
      setContractType(selectedContract.type);
      
      // Load parties - always update when selectedContract changes
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
          birthDate: party.birthDate ? (party.birthDate.includes('-') ? formatToPersianDate(party.birthDate) : party.birthDate) : undefined,
          phone: party.phone,
          postalCode: party.postalCode,
          address: party.address,
          resident: party.resident,
          authorityType: party.authorityType,
          authorityDocumentNumber: party.authorityDocumentNumber,
          authorityDocumentDate: party.authorityDocumentDate ? (party.authorityDocumentDate.includes('-') ? formatToPersianDate(party.authorityDocumentDate) : party.authorityDocumentDate) : undefined,
          companyName: party.companyName,
          registrationNumber: party.registrationNumber,
          companyNationalId: party.companyNationalId,
          officialGazette: party.officialGazette,
          principalPartyId: party.principalPartyId,
          relationshipType: party.relationshipType,
          relationshipDocumentNumber: party.relationshipDocumentNumber,
          relationshipDocumentDate: party.relationshipDocumentDate ? (party.relationshipDocumentDate.includes('-') ? formatToPersianDate(party.relationshipDocumentDate) : party.relationshipDocumentDate) : undefined,
        }));
        setParties(loadedParties);
      } else {
        // If parties array is empty or doesn't exist, clear the parties state
        setParties([]);
      }
      
      // Load property details
      if (selectedContract.propertyDetails) {
        const pd = selectedContract.propertyDetails;
        const propertyTypeOptions = ['آپارتمان', 'ویلا', 'خانه', 'زمین', 'مغازه', 'دفتر', 'انبار', 'کارگاه'];
        const usageTypeOptions = ['مسکونی', 'تجاری', 'اداری', 'صنعتی', 'کشاورزی', 'خدماتی', 'مختلط'];
        const ownershipDocumentTypeOptions = ['دفترچه ای', 'تک برگ', 'سند عادی'];
        const heatingStatusOptions = ['پکیج', 'موتورخانه مرکزی', 'آبگرمکن'];
        const coolerTypeOptions = ['اسپیلت', 'داک اسپلیت', 'سیستم مرکزی ( چیلر )', 'رادیاتور ( کولر آبی‌ )'];
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
          heatingStatusCustom: pd.heatingStatus ? !heatingStatusOptions.includes(pd.heatingStatus) : false,
          coolerType: pd.coolerType || '',
          coolerTypeCustom: pd.coolerType ? !coolerTypeOptions.includes(pd.coolerType) : false,
          phoneNumber: pd.phoneNumber || '',
          phoneStatus: pd.phoneStatus || '',
          ownershipDocumentPage: pd.ownershipDocumentPage || '',
          ownershipDocumentBook: pd.ownershipDocumentBook || '',
          uniqueDocumentId: pd.uniqueDocumentId !== undefined && pd.uniqueDocumentId !== null ? String(pd.uniqueDocumentId) : '',
          propertyShareType: pd.propertyShareType || '',
          amenities: {
            flooring: pd.amenities?.flooring || '',
            flooringCustom: pd.amenities?.flooring ? !['سرامیک', 'سنگ', 'لمینت یا پارکت', 'موکت'].includes(pd.amenities.flooring) : false,
            bathroom: pd.amenities?.bathroom || '',
            bathroomCustom: false,
            meetingHall: pd.amenities?.meetingHall || false,
            club: pd.amenities?.club || false,
            amphitheater: pd.amenities?.amphitheater || false,
            security: pd.amenities?.security || false,
            balcony: pd.amenities?.balcony || false,
            hood: pd.amenities?.hood || false,
            janitorial: pd.amenities?.janitorial || false,
            lobby: pd.amenities?.lobby || false,
            terrace: pd.amenities?.terrace || false,
            videoIntercom: pd.amenities?.videoIntercom || false,
            remoteParkingGate: pd.amenities?.remoteParkingGate || false,
            tableGas: pd.amenities?.tableGas || false,
            centralAntenna: pd.amenities?.centralAntenna || false,
          },
        });
      }
      
      // Load terms
      if (selectedContract.terms) {
        const t = selectedContract.terms;
        // Check if usagePurpose is one of the predefined values, otherwise it's "other"
        const usagePurposeValue = t.usagePurpose && ['مسکونی', 'اداری', 'تجاری'].includes(t.usagePurpose) 
          ? t.usagePurpose 
          : (t.usagePurpose ? 'سایر' : '');
        const usagePurposeOtherValue = usagePurposeValue === 'سایر' ? (t.usagePurpose || '') : '';
        setTerms({
          dailyDelayPenalty: t.dailyDelayPenalty?.toString() || '',
          dailyOccupancyPenalty: t.dailyOccupancyPenalty?.toString() || '',
          deliveryDate: t.deliveryDate || '',
          deliveryDelayPenalty: t.deliveryDelayPenalty?.toString() || '',
          usagePurpose: usagePurposeValue,
          usagePurposeOther: usagePurposeOtherValue,
          occupantCount: t.occupantCount?.toString() || '',
          customTerms: t.customTerms || '',
          // NEW: Article 6 conditions
          rentPaymentDeadline: t.rentPaymentDeadline || '',
          renewalConditions: t.renewalConditions || '',
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
        registrationArea: selectedContract.registrationArea || '',
        witness1Name: selectedContract.witness1Name || '',
        witness2Name: selectedContract.witness2Name || '',
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
  }, [selectedContract, contractId]);

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
  
  // Helper function to parse step 1 validation errors from backend
  const parseStep1ValidationErrors = (errorPayload: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!errorPayload) return errors;
    
    if (errorPayload.statusCode === 400 && errorPayload.message) {
      const messages = Array.isArray(errorPayload.message) ? errorPayload.message : [errorPayload.message];
      
      messages.forEach((msg: string) => {
        if (msg.includes('type') && (msg.includes('must be an enum value') || msg.includes('must not be empty'))) {
          errors['type'] = 'نوع قرارداد الزامی است';
        } else if (msg.includes('estateId') && msg.includes('must be a UUID')) {
          errors['estateId'] = 'شناسه دفتر باید یک UUID معتبر باشد';
        } else if (msg.includes('uniqueDocumentId') && msg.includes('must be a string')) {
          errors['uniqueDocumentId'] = 'شناسه یکتای سند باید یک رشته باشد';
        }
      });
    }
    
    return errors;
  };

  // Helper function to parse step 2 validation errors from backend
  const parseStep2ValidationErrors = (errorPayload: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!errorPayload) return errors;
    
    if (errorPayload.statusCode === 400 && errorPayload.message) {
      const messages = Array.isArray(errorPayload.message) ? errorPayload.message : [errorPayload.message];
      
      messages.forEach((msg: string) => {
        if (msg.includes('parties') && (msg.includes('must not be empty') || msg.includes('must contain at least'))) {
          errors['parties'] = 'حداقل یک طرف قرارداد باید ثبت شود';
        }
      });
    }
    
    return errors;
  };

  // Helper function to parse step 4 validation errors from backend
  const parseStep4ValidationErrors = (errorPayload: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!errorPayload) return errors;
    
    if (errorPayload.statusCode === 400 && errorPayload.message) {
      const messages = Array.isArray(errorPayload.message) ? errorPayload.message : [errorPayload.message];
      
      const fieldMapping: Record<string, string> = {
        'dailyDelayPenalty': 'dailyDelayPenalty',
        'dailyOccupancyPenalty': 'dailyOccupancyPenalty',
        'deliveryDate': 'deliveryDate',
        'deliveryDelayPenalty': 'deliveryDelayPenalty',
        'usagePurpose': 'usagePurpose',
        'occupantCount': 'occupantCount',
        'customTerms': 'customTerms',
      };
      
      messages.forEach((msg: string) => {
        const fieldMatch = msg.match(/^([a-zA-Z][a-zA-Z0-9]*)\s+must/);
        let matchedField = null;
        
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          if (fieldMapping[fieldName]) {
            matchedField = fieldMapping[fieldName];
          }
        }
        
        if (!matchedField) {
          for (const [backendField, frontendField] of Object.entries(fieldMapping)) {
            const regex = new RegExp(`\\b${backendField}\\b`);
            if (regex.test(msg)) {
              matchedField = frontendField;
              break;
            }
          }
        }
        
        if (matchedField && !errors[matchedField]) {
          let translatedMsg = msg;
          if (msg.includes('must not be less than')) {
            translatedMsg = 'مقدار نمی‌تواند منفی باشد';
          } else if (msg.includes('must be a number')) {
            translatedMsg = 'این فیلد باید عدد باشد';
          } else if (msg.includes('must be a valid ISO 8601 date string')) {
            translatedMsg = 'تاریخ نامعتبر است';
          } else if (msg.includes('must be a string')) {
            translatedMsg = 'این فیلد باید متن باشد';
          }
          errors[matchedField] = translatedMsg;
        }
      });
    }
    
    return errors;
  };

  // Helper function to parse step 3 validation errors from backend
  const parseStep3ValidationErrors = (errorPayload: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!errorPayload) return errors;
    
    // Check if it's a 400 error with validation messages
    if (errorPayload.statusCode === 400 && errorPayload.message) {
      const messages = Array.isArray(errorPayload.message) ? errorPayload.message : [errorPayload.message];
      
      // Map backend field names to frontend field names
      const fieldMapping: Record<string, string> = {
        'propertyType': 'propertyType',
        'usageType': 'usageType',
        'address': 'address',
        'postalCode': 'postalCode',
        'registrationNumber': 'registrationNumber',
        'section': 'section',
        'area': 'area',
        'areaUnit': 'areaUnit',
        'ownershipDocumentType': 'ownershipDocumentType',
        'ownershipDocumentSerial': 'ownershipDocumentSerial',
        'ownershipDocumentOwner': 'ownershipDocumentOwner',
        'storageCount': 'storageCount',
        'storageNumbers': 'storageNumbers',
        'parkingCount': 'parkingCount',
        'parkingNumbers': 'parkingNumbers',
        'bedroomCount': 'bedroomCount',
        'utilityType': 'utilityType',
        'heatingStatus': 'heatingStatus',
        'coolerType': 'coolerType',
        'phoneNumber': 'phoneNumber',
        'phoneStatus': 'phoneStatus',
        'ownershipDocumentPage': 'ownershipDocumentPage',
        'ownershipDocumentBook': 'ownershipDocumentBook',
        'uniqueDocumentId': 'uniqueDocumentId',
        'propertyShareType': 'propertyShareType',
        'amenities': 'amenities',
        'amenities.flooring': 'amenities.flooring',
        'amenities.bathroom': 'amenities.bathroom',
        'amenities.meetingHall': 'amenities.meetingHall',
        'amenities.club': 'amenities.club',
        'amenities.amphitheater': 'amenities.amphitheater',
        'amenities.security': 'amenities.security',
        'amenities.balcony': 'amenities.balcony',
        'amenities.hood': 'amenities.hood',
        'amenities.janitorial': 'amenities.janitorial',
        'amenities.lobby': 'amenities.lobby',
        'amenities.terrace': 'amenities.terrace',
        'amenities.videoIntercom': 'amenities.videoIntercom',
        'amenities.remoteParkingGate': 'amenities.remoteParkingGate',
        'amenities.tableGas': 'amenities.tableGas',
        'amenities.centralAntenna': 'amenities.centralAntenna',
      };
      
      // Parse each error message
      messages.forEach((msg: string) => {
        // Try to extract field name from error message
        // Format: "fieldName must be..." or "fieldName must not be..."
        // First, try to match the field name at the beginning of the message
        const fieldMatch = msg.match(/^([a-zA-Z][a-zA-Z0-9]*)\s+must/);
        let matchedField = null;
        
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          // Check if this field is in our mapping
          if (fieldMapping[fieldName]) {
            matchedField = fieldMapping[fieldName];
          }
        }
        
        // If not found at the beginning, try to find it anywhere in the message
        if (!matchedField) {
          for (const [backendField, frontendField] of Object.entries(fieldMapping)) {
            // Use word boundary to avoid partial matches
            const regex = new RegExp(`\\b${backendField}\\b`);
            if (regex.test(msg)) {
              matchedField = frontendField;
              break;
            }
          }
        }
        
        if (matchedField && !errors[matchedField]) {
          // Translate common error messages to Persian
          let translatedMsg = msg;
          if (msg.includes('must not be empty')) {
            translatedMsg = 'این فیلد الزامی است';
          } else if (msg.includes('must be a string')) {
            if (matchedField === 'registrationNumber') {
              translatedMsg = 'شماره پلاک ثبتی باید یک رشته باشد';
            } else {
              translatedMsg = 'این فیلد باید متن باشد';
            }
          } else if (msg.includes('must be a number')) {
            translatedMsg = 'این فیلد باید عدد باشد';
          } else if (msg.includes('must not be less than')) {
            translatedMsg = 'مقدار باید بزرگتر از صفر باشد';
          } else if (msg.includes('must be longer than or equal to')) {
            // Extract the number from the message
            const match = msg.match(/must be longer than or equal to (\d+) characters?/);
            if (match) {
              if (matchedField === 'postalCode') {
                translatedMsg = `کد پستی باید حداقل ${match[1]} کاراکتر باشد`;
              } else {
                translatedMsg = `این فیلد باید حداقل ${match[1]} کاراکتر باشد`;
              }
            } else {
              translatedMsg = 'تعداد کاراکترها کافی نیست';
            }
          } else if (msg.includes('must be shorter than or equal to')) {
            const match = msg.match(/must be shorter than or equal to (\d+) characters?/);
            if (match) {
              translatedMsg = `این فیلد باید حداکثر ${match[1]} کاراکتر باشد`;
            } else {
              translatedMsg = 'تعداد کاراکترها بیش از حد است';
            }
          } else if (msg.includes('must be a valid ISO 8601 date string')) {
            translatedMsg = 'تاریخ نامعتبر است';
          } else if (msg.includes('must be an array')) {
            translatedMsg = 'این فیلد باید آرایه باشد';
          } else if (msg.includes('must be an object')) {
            translatedMsg = 'این فیلد باید آبجکت باشد';
          } else if (msg.includes('must be a boolean value')) {
            translatedMsg = 'این فیلد باید boolean باشد';
          }
          errors[matchedField] = translatedMsg;
        }
      });
    }
    
    return errors;
  };

  // Helper function to clear step 3 field errors
  const clearStep3FieldError = useCallback((field: string) => {
    setStep3FieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Validation functions for each step
  const validateStep2 = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (parties.length === 0) {
      errors['parties'] = 'حداقل یک طرف قرارداد باید ثبت شود';
      return errors;
    }
    
    // Validate each party
    parties.forEach((party, index) => {
      const prefix = `parties.${index}`;
      
      if (!party.partyType) {
        errors[`${prefix}.partyType`] = 'نوع طرف قرارداد الزامی است';
      }
      
      if (!party.partyRole) {
        errors[`${prefix}.partyRole`] = 'نقش طرف قرارداد الزامی است';
      }
      
      if (!party.entityType) {
        errors[`${prefix}.entityType`] = 'نوع شخصیت الزامی است';
      }
      
      if (!party.shareType) {
        errors[`${prefix}.shareType`] = 'نوع سهم الزامی است';
      }
      
      if (party.shareValue === undefined || party.shareValue === null || party.shareValue <= 0) {
        errors[`${prefix}.shareValue`] = 'مقدار سهم الزامی است و باید بزرگتر از صفر باشد';
      }
      
      if (party.entityType === PartyEntityType.NATURAL) {
        if (!party.firstName || !party.firstName.trim()) {
          errors[`${prefix}.firstName`] = 'نام الزامی است';
        }
        if (!party.lastName || !party.lastName.trim()) {
          errors[`${prefix}.lastName`] = 'نام خانوادگی الزامی است';
        }
        if (!party.nationalId || !party.nationalId.trim()) {
          errors[`${prefix}.nationalId`] = 'کد ملی الزامی است';
        } else {
          const nationalIdLatin = convertToLatinNumbers(party.nationalId);
          if (nationalIdLatin.length !== 10) {
            errors[`${prefix}.nationalId`] = 'کد ملی باید دقیقاً 10 رقم باشد';
          } else if (!/^\d+$/.test(nationalIdLatin)) {
            errors[`${prefix}.nationalId`] = 'کد ملی باید فقط شامل اعداد باشد';
          }
        }
      } else if (party.entityType === PartyEntityType.LEGAL) {
        if (!party.companyName || !party.companyName.trim()) {
          errors[`${prefix}.companyName`] = 'نام شرکت الزامی است';
        }
        if (party.companyNationalId) {
          const companyNationalIdLatin = convertToLatinNumbers(party.companyNationalId);
          if (companyNationalIdLatin.length !== 11) {
            errors[`${prefix}.companyNationalId`] = 'شناسه ملی شرکت باید دقیقاً 11 رقم باشد';
          } else if (!/^\d+$/.test(companyNationalIdLatin)) {
            errors[`${prefix}.companyNationalId`] = 'شناسه ملی شرکت باید فقط شامل اعداد باشد';
          }
        }
      }
      
      if ((party.partyRole === PartyRole.REPRESENTATIVE || party.partyRole === PartyRole.ATTORNEY) && !party.principalPartyId) {
        errors[`${prefix}.principalPartyId`] = 'شناسه طرف اصیل الزامی است';
      }
    });
    
    // Validate shares
    const landlordParties = parties.filter(p => p.partyType === PartyType.LANDLORD);
    const tenantParties = parties.filter(p => p.partyType === PartyType.TENANT);
    
    if (landlordParties.length > 0) {
      const landlordShareType = landlordParties[0].shareType;
      const landlordTotal = landlordParties.reduce((sum, p) => sum + p.shareValue, 0);
      const expectedTotal = landlordShareType === ShareType.DANG ? 6 : 100;
      if (landlordTotal !== expectedTotal) {
        errors['landlordShare'] = `مجموع سهم موجرین باید ${expectedTotal} ${landlordShareType === ShareType.DANG ? 'دانگ' : 'درصد'} باشد`;
      }
    }
    
    if (tenantParties.length > 0) {
      const tenantShareType = tenantParties[0].shareType;
      const tenantTotal = tenantParties.reduce((sum, p) => sum + p.shareValue, 0);
      const expectedTotal = tenantShareType === ShareType.DANG ? 6 : 100;
      if (tenantTotal !== expectedTotal) {
        errors['tenantShare'] = `مجموع سهم مستاجرین باید ${expectedTotal} ${tenantShareType === ShareType.DANG ? 'دانگ' : 'درصد'} باشد`;
      }
    }
    
    return errors;
  };

  const validateStep3 = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!propertyDetails.propertyType || !propertyDetails.propertyType.trim()) {
      errors['propertyType'] = 'نوع ملک الزامی است';
    }
    
    if (!propertyDetails.usageType || !propertyDetails.usageType.trim()) {
      errors['usageType'] = 'کاربری ملک الزامی است';
    }
    
    if (!propertyDetails.address || !propertyDetails.address.trim()) {
      errors['address'] = 'آدرس الزامی است';
    }
    
    if (propertyDetails.postalCode) {
      const postalCodeLatin = convertToLatinNumbers(propertyDetails.postalCode);
      if (postalCodeLatin.length !== 10) {
        errors['postalCode'] = 'کد پستی باید دقیقاً 10 کاراکتر باشد';
      }
    }
    
    if (!propertyDetails.area || parseLatinNumber(propertyDetails.area) <= 0) {
      errors['area'] = 'مساحت الزامی است و باید بزرگتر از صفر باشد';
    }
    
    return errors;
  };

  const validateStep4 = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (terms.dailyDelayPenalty) {
      const amount = parseLatinNumber(terms.dailyDelayPenalty);
      if (amount < 0) {
        errors['dailyDelayPenalty'] = 'مبلغ جریمه روزانه برای تأخیر پرداخت نمی‌تواند منفی باشد';
      }
    }
    
    if (terms.dailyOccupancyPenalty) {
      const amount = parseLatinNumber(terms.dailyOccupancyPenalty);
      if (amount < 0) {
        errors['dailyOccupancyPenalty'] = 'مبلغ اجرت ایام تصرف نمی‌تواند منفی باشد';
      }
    }
    
    if (terms.deliveryDelayPenalty) {
      const amount = parseLatinNumber(terms.deliveryDelayPenalty);
      if (amount < 0) {
        errors['deliveryDelayPenalty'] = 'مبلغ وجه التزام تأخیر تحویل نمی‌تواند منفی باشد';
      }
    }
    
    if (terms.occupantCount) {
      const count = parseLatinInteger(terms.occupantCount);
      if (count < 1) {
        errors['occupantCount'] = 'تعداد نفرات باید حداقل 1 باشد';
      }
    }
    
    return errors;
  };

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
    
    // Validate step 2
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setStep2FieldErrors(validationErrors);
      setSnackbar({ open: true, message: 'لطفا خطاهای فرم را برطرف کنید', severity: 'error' });
      return;
    }
    
    // Clear errors if validation passes
    setStep2FieldErrors({});

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
        
        // Convert birthDate: if it exists and has value, convert from Persian to Gregorian
        let convertedBirthDate: string | undefined = undefined;
        if (party.birthDate && typeof party.birthDate === 'string' && party.birthDate.trim() !== '') {
          if (party.birthDate.includes('/')) {
            // Persian format (yyyy/mm/dd), convert to Gregorian
            const converted = formatToGregorianDate(party.birthDate);
            convertedBirthDate = converted || party.birthDate; // Fallback to original if conversion fails
          } else if (party.birthDate.includes('-')) {
            // Already in Gregorian format (YYYY-MM-DD)
            convertedBirthDate = party.birthDate;
          } else {
            // Unknown format, keep as is
            convertedBirthDate = party.birthDate;
          }
        }
        
        // Debug: log birthDate conversion
        if (party.birthDate) {
          console.log('BirthDate conversion:', {
            original: party.birthDate,
            converted: convertedBirthDate,
            partyIndex: parties.indexOf(party)
          });
        }
        
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
          // Convert Persian dates to Gregorian format for backend
          birthDate: convertedBirthDate,
          relationshipDocumentDate: party.relationshipDocumentDate && party.relationshipDocumentDate.trim() !== ''
            ? (party.relationshipDocumentDate.includes('/') ? formatToGregorianDate(party.relationshipDocumentDate) : party.relationshipDocumentDate)
            : (party.relationshipDocumentDate !== undefined ? party.relationshipDocumentDate : undefined),
          authorityDocumentDate: party.authorityDocumentDate && party.authorityDocumentDate.trim() !== ''
            ? (party.authorityDocumentDate.includes('/') ? formatToGregorianDate(party.authorityDocumentDate) : party.authorityDocumentDate)
            : (party.authorityDocumentDate !== undefined ? party.authorityDocumentDate : undefined),
        };
      });
      
      const result = await createContractStep2(currentContractId, { parties: partiesWithLatinNumbers });
      
      // Check if the action was rejected
      if (result && 'type' in result && result.type.endsWith('/rejected')) {
        const errorPayload = (result as any).payload;
        console.error('Step 2 submission rejected:', errorPayload);
        
        // Parse validation errors
        const backendErrors = parseStep2ValidationErrors(errorPayload);
        if (Object.keys(backendErrors).length > 0) {
          setStep2FieldErrors(backendErrors);
          setSnackbar({ open: true, message: 'لطفا خطاهای فرم را برطرف کنید', severity: 'error' });
        } else {
          const errorMessage = getErrorMessage(errorPayload || {}, 'خطا در به‌روزرسانی طرفین');
          setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
        // Don't proceed to next step on error
        return;
      }
      
      // Clear errors on success
      setStep2FieldErrors({});
      
      // Reload contract data to get updated parties from backend
      try {
        await fetchContractById(currentContractId);
      } catch (reloadErr) {
        console.error('Error reloading contract after save:', reloadErr);
        // Continue anyway - the save was successful
      }
      
      setCurrentStep(3);
      setSnackbar({ open: true, message: 'طرفین قرارداد با موفقیت به‌روزرسانی شدند', severity: 'success' });
    } catch (err: any) {
      console.error('Error in step 2:', err);
      
      // Try to parse validation errors from the error object
      const errorPayload = err?.response?.data || err?.payload || err;
      const backendErrors = parseStep2ValidationErrors(errorPayload);
      
      if (Object.keys(backendErrors).length > 0) {
        setStep2FieldErrors(backendErrors);
        setSnackbar({ open: true, message: 'لطفا خطاهای فرم را برطرف کنید', severity: 'error' });
      } else {
        const errorMessage = getErrorMessage(err, 'خطا در به‌روزرسانی طرفین');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
      // Don't proceed to next step on error
      return;
    }
  };

  const handleStep3Submit = async () => {
    const currentContractId = getCurrentContractId();
    if (!currentContractId) {
      setSnackbar({ open: true, message: 'قرارداد یافت نشد', severity: 'error' });
      return;
    }

    // Validate step 3
    const validationErrors = validateStep3();
    if (Object.keys(validationErrors).length > 0) {
      setStep3FieldErrors(validationErrors);
      setSnackbar({ open: true, message: 'لطفا خطاهای فرم را برطرف کنید', severity: 'error' });
      return;
    }
    
    // Clear errors if validation passes
    setStep3FieldErrors({});

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
        registrationNumber: propertyDetails.registrationNumber ? convertToLatinNumbers(propertyDetails.registrationNumber.trim()) || undefined : undefined,
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
        ownershipDocumentPage: propertyDetails.ownershipDocumentType === 'دفترچه ای' && propertyDetails.ownershipDocumentPage ? convertToLatinNumbers(propertyDetails.ownershipDocumentPage.trim()) || undefined : undefined,
        ownershipDocumentBook: propertyDetails.ownershipDocumentType === 'دفترچه ای' && propertyDetails.ownershipDocumentBook ? convertToLatinNumbers(propertyDetails.ownershipDocumentBook.trim()) || undefined : undefined,
        uniqueDocumentId: propertyDetails.ownershipDocumentType === 'تک برگ' && propertyDetails.uniqueDocumentId ? convertToLatinNumbers(propertyDetails.uniqueDocumentId.trim()) || undefined : undefined,
        propertyShareType: propertyDetails.propertyShareType?.trim() || undefined,
        amenities: propertyDetails.amenities ? {
          flooring: propertyDetails.amenities.flooring || undefined,
          bathroom: propertyDetails.amenities.bathroom || undefined,
          meetingHall: propertyDetails.amenities.meetingHall || undefined,
          club: propertyDetails.amenities.club || undefined,
          amphitheater: propertyDetails.amenities.amphitheater || undefined,
          security: propertyDetails.amenities.security || undefined,
          balcony: propertyDetails.amenities.balcony || undefined,
          hood: propertyDetails.amenities.hood || undefined,
          janitorial: propertyDetails.amenities.janitorial || undefined,
          lobby: propertyDetails.amenities.lobby || undefined,
          terrace: propertyDetails.amenities.terrace || undefined,
          videoIntercom: propertyDetails.amenities.videoIntercom || undefined,
          remoteParkingGate: propertyDetails.amenities.remoteParkingGate || undefined,
          tableGas: propertyDetails.amenities.tableGas || undefined,
          centralAntenna: propertyDetails.amenities.centralAntenna || undefined,
        } : undefined,
      };
      
      const result = await updateProperty(currentContractId, propertyData);
      
      // Check if the action was rejected
      if (result && 'type' in result && result.type.endsWith('/rejected')) {
        const errorPayload = (result as any).payload;
        console.error('Step 3 submission rejected:', errorPayload);
        
        // Parse validation errors
        const validationErrors = parseStep3ValidationErrors(errorPayload);
        if (Object.keys(validationErrors).length > 0) {
          setStep3FieldErrors(validationErrors);
          setSnackbar({ open: true, message: 'لطفا خطاهای فرم را برطرف کنید', severity: 'error' });
        } else {
          const errorMessage = getErrorMessage(errorPayload || {}, 'خطا در به‌روزرسانی جزئیات ملک');
          setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
        // Don't proceed to next step on error
        return;
      }
      
      // Clear errors on success
      setStep3FieldErrors({});
      
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
      
      // Try to parse validation errors from the error object
      const errorPayload = err?.response?.data || err?.payload || err;
      const validationErrors = parseStep3ValidationErrors(errorPayload);
      
      if (Object.keys(validationErrors).length > 0) {
        setStep3FieldErrors(validationErrors);
        setSnackbar({ open: true, message: 'لطفا خطاهای فرم را برطرف کنید', severity: 'error' });
      } else {
        const errorMessage = getErrorMessage(err, 'خطا در به‌روزرسانی جزئیات ملک');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
      // Don't proceed to next step on error
      return;
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
        dailyDelayPenalty: terms.dailyDelayPenalty ? parseLatinNumber(terms.dailyDelayPenalty) : undefined,
        dailyOccupancyPenalty: terms.dailyOccupancyPenalty ? parseLatinNumber(terms.dailyOccupancyPenalty) : undefined,
        deliveryDate: terms.deliveryDate 
          ? (terms.deliveryDate.includes('/') ? formatToGregorianDate(terms.deliveryDate) : terms.deliveryDate)
          : undefined,
        deliveryDelayPenalty: terms.deliveryDelayPenalty ? parseLatinNumber(terms.deliveryDelayPenalty) : undefined,
        usagePurpose: terms.usagePurpose === 'سایر' ? terms.usagePurposeOther : (terms.usagePurpose || undefined),
        occupantCount: terms.occupantCount ? parseLatinInteger(terms.occupantCount) : undefined,
        customTerms: terms.customTerms || undefined,
        // NEW: Article 6 conditions
        rentPaymentDeadline: terms.rentPaymentDeadline?.trim() || undefined,
        renewalConditions: terms.renewalConditions?.trim() || undefined,
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
      
      // Try to parse validation errors from the error object
      const errorPayload = err?.response?.data || err?.payload || err;
      const backendErrors = parseStep4ValidationErrors(errorPayload);
      
      if (Object.keys(backendErrors).length > 0) {
        setStep4FieldErrors(backendErrors);
        setSnackbar({ open: true, message: 'لطفا خطاهای فرم را برطرف کنید', severity: 'error' });
      } else {
        const errorMessage = getErrorMessage(err, 'خطا در به‌روزرسانی شرایط');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
      // Don't proceed to next step on error
      return;
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
        contractDate: draftData.contractDate 
          ? (draftData.contractDate.includes('/') ? formatToGregorianDate(draftData.contractDate) : draftData.contractDate)
          : undefined,
        startDate: contractType === ContractType.RENTAL 
          ? (draftData.startDate 
              ? (draftData.startDate.includes('/') ? formatToGregorianDate(draftData.startDate) : draftData.startDate)
              : undefined)
          : undefined,
        endDate: contractType === ContractType.RENTAL 
          ? (draftData.endDate 
              ? (draftData.endDate.includes('/') ? formatToGregorianDate(draftData.endDate) : draftData.endDate)
              : undefined)
          : undefined,
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
        registrationArea: draftData.registrationArea?.trim() || undefined,
        witness1Name: draftData.witness1Name?.trim() || undefined,
        witness2Name: draftData.witness2Name?.trim() || undefined,
      };

      // Build original data for comparison
      // Note: originalDraftData should already be in Gregorian format from backend, but convert if needed
      const originalUpdateData: UpdateContractRequest = {
        contractDate: originalDraftData.contractDate 
          ? (originalDraftData.contractDate.includes('/') ? formatToGregorianDate(originalDraftData.contractDate) : originalDraftData.contractDate)
          : undefined,
        startDate: contractType === ContractType.RENTAL 
          ? (originalDraftData.startDate 
              ? (originalDraftData.startDate.includes('/') ? formatToGregorianDate(originalDraftData.startDate) : originalDraftData.startDate)
              : undefined)
          : undefined,
        endDate: contractType === ContractType.RENTAL 
          ? (originalDraftData.endDate 
              ? (originalDraftData.endDate.includes('/') ? formatToGregorianDate(originalDraftData.endDate) : originalDraftData.endDate)
              : undefined)
          : undefined,
        rentalAmount: contractType === ContractType.RENTAL ? (originalDraftData.rentalAmount ? parseLatinNumber(originalDraftData.rentalAmount) : undefined) : undefined,
        purchaseAmount: contractType === ContractType.PURCHASE ? (originalDraftData.purchaseAmount ? parseLatinNumber(originalDraftData.purchaseAmount) : undefined) : undefined,
        depositAmount: originalDraftData.depositAmount ? parseLatinNumber(originalDraftData.depositAmount) : undefined,
        paymentEntries: originalPaymentEntries.length > 0 ? originalPaymentEntries : undefined,
        registrationArea: originalDraftData.registrationArea?.trim() || undefined,
        witness1Name: originalDraftData.witness1Name?.trim() || undefined,
        witness2Name: originalDraftData.witness2Name?.trim() || undefined,
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

    // بررسی اعتبارسنجی پرداختی‌ها
    const paymentValidation = validatePayments();
    if (!paymentValidation.isValid) {
      setSnackbar({ open: true, message: paymentValidation.errorMessage || 'مجموع پرداختی‌ها کافی نیست', severity: 'error' });
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
        contractDate: draftData.contractDate 
          ? (draftData.contractDate.includes('/') ? formatToGregorianDate(draftData.contractDate) : draftData.contractDate)
          : undefined,
        startDate: contractType === ContractType.RENTAL 
          ? (draftData.startDate 
              ? (draftData.startDate.includes('/') ? formatToGregorianDate(draftData.startDate) : draftData.startDate)
              : undefined)
          : undefined,
        endDate: contractType === ContractType.RENTAL 
          ? (draftData.endDate 
              ? (draftData.endDate.includes('/') ? formatToGregorianDate(draftData.endDate) : draftData.endDate)
              : undefined)
          : undefined,
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
        registrationArea: draftData.registrationArea?.trim() || undefined,
        witness1Name: draftData.witness1Name?.trim() || undefined,
        witness2Name: draftData.witness2Name?.trim() || undefined,
      };

      // Build original data for comparison
      // Note: originalDraftData should already be in Gregorian format from backend, but convert if needed
      const originalUpdateData: UpdateContractRequest = {
        contractDate: originalDraftData.contractDate 
          ? (originalDraftData.contractDate.includes('/') ? formatToGregorianDate(originalDraftData.contractDate) : originalDraftData.contractDate)
          : undefined,
        startDate: contractType === ContractType.RENTAL 
          ? (originalDraftData.startDate 
              ? (originalDraftData.startDate.includes('/') ? formatToGregorianDate(originalDraftData.startDate) : originalDraftData.startDate)
              : undefined)
          : undefined,
        endDate: contractType === ContractType.RENTAL 
          ? (originalDraftData.endDate 
              ? (originalDraftData.endDate.includes('/') ? formatToGregorianDate(originalDraftData.endDate) : originalDraftData.endDate)
              : undefined)
          : undefined,
        rentalAmount: contractType === ContractType.RENTAL ? (originalDraftData.rentalAmount ? parseLatinNumber(originalDraftData.rentalAmount) : undefined) : undefined,
        purchaseAmount: contractType === ContractType.PURCHASE ? (originalDraftData.purchaseAmount ? parseLatinNumber(originalDraftData.purchaseAmount) : undefined) : undefined,
        depositAmount: originalDraftData.depositAmount ? parseLatinNumber(originalDraftData.depositAmount) : undefined,
        paymentEntries: originalPaymentEntries.length > 0 ? originalPaymentEntries : undefined,
        registrationArea: originalDraftData.registrationArea?.trim() || undefined,
        witness1Name: originalDraftData.witness1Name?.trim() || undefined,
        witness2Name: originalDraftData.witness2Name?.trim() || undefined,
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

  if (isLoading || !selectedContract || selectedContract.id !== contractId) {
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ValidatedInput
                      field="childOf"
                      value={currentParty.childOf || ''}
                      onChange={(e) => setCurrentParty(prev => ({ ...prev, childOf: e.target.value }))}
                      onClearError={clearFieldErrorMemoized}
                      label="نام پدر"
                      error={fieldErrors['childOf']}
                    />
                    <div className="w-full">
                      <label className="mb-1 block text-sm font-semibold text-gray-600">
                        تاریخ تولد
                      </label>
                      <PersianDatePicker
                        field="birthDate"
                        key={`birthDate-${editingPartyIndex !== null ? editingPartyIndex : 'new'}-${currentParty.firstName || ''}-${currentParty.lastName || ''}`}
                        value={currentParty.birthDate || ''}
                        onChange={(value) => {
                          setCurrentParty(prev => ({ ...prev, birthDate: value }));
                          if (fieldErrors['birthDate']) clearFieldErrorMemoized('birthDate');
                        }}
                        placeholder="انتخاب تاریخ تولد"
                        className="w-full"
                      />
                      {fieldErrors['birthDate'] && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors['birthDate']}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ValidatedInput
                      field="issuedFrom"
                      value={currentParty.issuedFrom || ''}
                      onChange={(e) => setCurrentParty(prev => ({ ...prev, issuedFrom: e.target.value }))}
                      onClearError={clearFieldErrorMemoized}
                      label="محل صدور"
                      error={fieldErrors['issuedFrom']}
                    />
                    <ValidatedInput
                      field="phone"
                      value={currentParty.phone || ''}
                      onChange={(e) => setCurrentParty(prev => ({ ...prev, phone: e.target.value }))}
                      onClearError={clearFieldErrorMemoized}
                      label="شماره تماس"
                      type="tel"
                      error={fieldErrors['phone']}
                    />
                  </div>
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
        
        {step2FieldErrors['parties'] && (
          <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4">
            <p className="text-sm text-red-600">{step2FieldErrors['parties']}</p>
          </div>
        )}
        
        {step2FieldErrors['landlordShare'] && (
          <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4">
            <p className="text-sm text-red-600">{step2FieldErrors['landlordShare']}</p>
          </div>
        )}
        
        {step2FieldErrors['tenantShare'] && (
          <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4">
            <p className="text-sm text-red-600">{step2FieldErrors['tenantShare']}</p>
          </div>
        )}
        
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
              <p className="text-sm mt-2">برای افزودن طرف جدید روی دکمه &quot;افزودن طرف&quot; کلیک کنید</p>
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
              if (step3FieldErrors['propertyType']) {
                clearStep3FieldError('propertyType');
              }
            }}
            className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
              step3FieldErrors['propertyType']
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
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
              onChange={(e) => {
                setPropertyDetails({ ...propertyDetails, propertyType: e.target.value });
                if (step3FieldErrors['propertyType']) {
                  clearStep3FieldError('propertyType');
                }
              }}
              className={`mt-2 w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
                step3FieldErrors['propertyType']
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
              }`}
              placeholder="نوع ملک را وارد کنید"
            />
          )}
          {step3FieldErrors['propertyType'] && (
            <p className="mt-1 text-sm text-red-600">{step3FieldErrors['propertyType']}</p>
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
              if (step3FieldErrors['usageType']) {
                clearStep3FieldError('usageType');
              }
            }}
            className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
              step3FieldErrors['usageType']
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
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
              onChange={(e) => {
                setPropertyDetails({ ...propertyDetails, usageType: e.target.value });
                if (step3FieldErrors['usageType']) {
                  clearStep3FieldError('usageType');
                }
              }}
              className={`mt-2 w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
                step3FieldErrors['usageType']
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
              }`}
              placeholder="نوع کاربری را وارد کنید"
            />
          )}
          {step3FieldErrors['usageType'] && (
            <p className="mt-1 text-sm text-red-600">{step3FieldErrors['usageType']}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-600">آدرس</label>
          <input
            type="text"
            value={propertyDetails.address}
            onChange={(e) => {
              setPropertyDetails({ ...propertyDetails, address: e.target.value });
              if (step3FieldErrors['address']) {
                clearStep3FieldError('address');
              }
            }}
            className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
              step3FieldErrors['address']
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
          />
          {step3FieldErrors['address'] && (
            <p className="mt-1 text-sm text-red-600">{step3FieldErrors['address']}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">کد پستی</label>
          <input
            type="text"
            value={propertyDetails.postalCode}
            onChange={(e) => {
              setPropertyDetails({ ...propertyDetails, postalCode: e.target.value });
              if (step3FieldErrors['postalCode']) {
                clearStep3FieldError('postalCode');
              }
            }}
            className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
              step3FieldErrors['postalCode']
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
          />
          {step3FieldErrors['postalCode'] && (
            <p className="mt-1 text-sm text-red-600">{step3FieldErrors['postalCode']}</p>
          )}
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
                if (step3FieldErrors['area']) {
                  clearStep3FieldError('area');
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
              className={`flex-1 rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
                step3FieldErrors['area']
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
              }`}
              placeholder="مثال: 120.50"
            />
            {step3FieldErrors['area'] && (
              <p className="mt-1 text-sm text-red-600">{step3FieldErrors['area']}</p>
            )}
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
            type="text"
            value={propertyDetails.registrationNumber}
            onChange={(e) => {
              setPropertyDetails({ ...propertyDetails, registrationNumber: e.target.value });
              if (step3FieldErrors['registrationNumber']) {
                clearStep3FieldError('registrationNumber');
              }
            }}
            className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
              step3FieldErrors['registrationNumber']
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
          />
          {step3FieldErrors['registrationNumber'] && (
            <p className="mt-1 text-sm text-red-600">{step3FieldErrors['registrationNumber']}</p>
          )}
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
            value={propertyDetails.heatingStatusCustom ? 'CUSTOM' : propertyDetails.heatingStatus}
            onChange={(e) => {
              if (e.target.value === 'CUSTOM') {
                setPropertyDetails({ ...propertyDetails, heatingStatusCustom: true, heatingStatus: '' });
              } else {
                setPropertyDetails({ ...propertyDetails, heatingStatusCustom: false, heatingStatus: e.target.value });
              }
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="پکیج">پکیج</option>
            <option value="موتورخانه مرکزی">موتورخانه مرکزی</option>
            <option value="آبگرمکن">آبگرمکن</option>
            <option value="CUSTOM">سایر (دستی)</option>
          </select>
          {propertyDetails.heatingStatusCustom && (
            <input
              type="text"
              value={propertyDetails.heatingStatus}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, heatingStatus: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="وضعیت سیستم آب گرم را وارد کنید"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">سیستم تهویه</label>
          <select
            value={propertyDetails.coolerTypeCustom ? 'CUSTOM' : propertyDetails.coolerType}
            onChange={(e) => {
              if (e.target.value === 'CUSTOM') {
                setPropertyDetails({ ...propertyDetails, coolerTypeCustom: true, coolerType: '' });
              } else {
                setPropertyDetails({ ...propertyDetails, coolerTypeCustom: false, coolerType: e.target.value });
              }
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="اسپیلت">اسپیلت</option>
            <option value="داک اسپلیت">داک اسپلیت</option>
            <option value="سیستم مرکزی ( چیلر )">سیستم مرکزی ( چیلر )</option>
            <option value="رادیاتور ( کولر آبی‌ )">رادیاتور ( کولر آبی‌ )</option>
            <option value="CUSTOM">سایر (دستی)</option>
          </select>
          {propertyDetails.coolerTypeCustom && (
            <input
              type="text"
              value={propertyDetails.coolerType}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, coolerType: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="سیستم تهویه را وارد کنید"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">وضعیت تلفن</label>
          <select
            value={propertyDetails.phoneStatus || ''}
            onChange={(e) => {
              const newStatus = e.target.value;
              setPropertyDetails({ 
                ...propertyDetails, 
                phoneStatus: newStatus,
                // اگر وضعیت "دایر" نیست، شماره تلفن را پاک کن
                phoneNumber: newStatus === 'دایر' ? propertyDetails.phoneNumber : ''
              });
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="دایر">دایر</option>
            <option value="غیر دایر">غیر دایر</option>
          </select>
        </div>
        {propertyDetails.phoneStatus === 'دایر' && (
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
        )}
        {propertyDetails.ownershipDocumentType === 'دفترچه ای' && (
          <>
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
          </>
        )}
        
        {propertyDetails.ownershipDocumentType === 'تک برگ' && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">شناسه یکتای سند</label>
            <input
              type="text"
              value={propertyDetails.uniqueDocumentId ?? ''}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, uniqueDocumentId: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="شناسه یکتای سند را وارد کنید"
            />
          </div>
        )}
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
            <select
              value={propertyDetails.amenities.flooringCustom ? 'CUSTOM' : propertyDetails.amenities.flooring}
              onChange={(e) => {
                if (e.target.value === 'CUSTOM') {
                  setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, flooringCustom: true, flooring: '' } });
                } else {
                  setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, flooringCustom: false, flooring: e.target.value } });
                }
              }}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="سرامیک">سرامیک</option>
              <option value="سنگ">سنگ</option>
              <option value="لمینت یا پارکت">لمینت یا پارکت</option>
              <option value="موکت">موکت</option>
              <option value="CUSTOM">سایر</option>
            </select>
            {propertyDetails.amenities.flooringCustom && (
              <input
                type="text"
                value={propertyDetails.amenities.flooring}
                onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, flooring: e.target.value } })}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="کفپوش را وارد کنید"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">سرویس بهداشتی</label>
            <select
              value={propertyDetails.amenities.bathroom}
              onChange={(e) => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, bathroom: e.target.value } })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="فرنگی">فرنگی</option>
              <option value="ایرانی">ایرانی</option>
              <option value="ایرانی و فرنگی">ایرانی و فرنگی</option>
            </select>
          </div>
          <div className="md:col-span-2 w-full">
            <label className="mb-3 block text-sm font-semibold text-gray-600">امکانات</label>
            <div className="flex flex-wrap gap-3 w-full">
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, meetingHall: !propertyDetails.amenities.meetingHall } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.meetingHall
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.meetingHall}
                  onChange={() => {}}
                  className="hidden"
                />
                سالن اجتماعات
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, club: !propertyDetails.amenities.club } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.club
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.club}
                  onChange={() => {}}
                  className="hidden"
                />
                باشگاه
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, amphitheater: !propertyDetails.amenities.amphitheater } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.amphitheater
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.amphitheater}
                  onChange={() => {}}
                  className="hidden"
                />
                سالن آمفی تئاتر
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, security: !propertyDetails.amenities.security } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.security
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.security}
                  onChange={() => {}}
                  className="hidden"
                />
                نگهبانی
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, balcony: !propertyDetails.amenities.balcony } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.balcony
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.balcony}
                  onChange={() => {}}
                  className="hidden"
                />
                بالکن
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, hood: !propertyDetails.amenities.hood } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.hood
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.hood}
                  onChange={() => {}}
                  className="hidden"
                />
                هود
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, janitorial: !propertyDetails.amenities.janitorial } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.janitorial
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.janitorial}
                  onChange={() => {}}
                  className="hidden"
                />
                سرایداری
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, lobby: !propertyDetails.amenities.lobby } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.lobby
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.lobby}
                  onChange={() => {}}
                  className="hidden"
                />
                لابی
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, terrace: !propertyDetails.amenities.terrace } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.terrace
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.terrace}
                  onChange={() => {}}
                  className="hidden"
                />
                تراس
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, videoIntercom: !propertyDetails.amenities.videoIntercom } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.videoIntercom
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.videoIntercom}
                  onChange={() => {}}
                  className="hidden"
                />
                آیفون تصویری
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, remoteParkingGate: !propertyDetails.amenities.remoteParkingGate } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.remoteParkingGate
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.remoteParkingGate}
                  onChange={() => {}}
                  className="hidden"
                />
                درب ریموت دار پارکینگ
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, tableGas: !propertyDetails.amenities.tableGas } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.tableGas
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.tableGas}
                  onChange={() => {}}
                  className="hidden"
                />
                گاز رومیزی
              </button>
              <button
                type="button"
                onClick={() => setPropertyDetails({ ...propertyDetails, amenities: { ...propertyDetails.amenities, centralAntenna: !propertyDetails.amenities.centralAntenna } })}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  propertyDetails.amenities.centralAntenna
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 border-2 border-primary-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={propertyDetails.amenities.centralAntenna}
                  onChange={() => {}}
                  className="hidden"
                />
                آنتن مرکزی
              </button>
            </div>
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
          <label className="mb-1 block text-sm font-semibold text-gray-600">جریمه تاخیر در پرداخت قرض الحسنه (ریال)</label>
          <input
            type="text"
            value={terms.dailyDelayPenalty !== '' ? formatNumber(parseFormattedNumber(terms.dailyDelayPenalty)) : ''}
            onChange={(e) => {
              const parsed = parseFormattedNumber(e.target.value);
              const rawValue = parsed === 0 && !e.target.value.trim() ? '' : parsed.toString();
              setTerms({ ...terms, dailyDelayPenalty: rawValue });
              if (step4FieldErrors['dailyDelayPenalty']) {
                setStep4FieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors['dailyDelayPenalty'];
                  return newErrors;
                });
              }
            }}
            className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
              step4FieldErrors['dailyDelayPenalty']
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
          />
          {step4FieldErrors['dailyDelayPenalty'] && (
            <p className="mt-1 text-sm text-red-600">{step4FieldErrors['dailyDelayPenalty']}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">اجرت المثل ایام تصرف (ریال)</label>
          <input
            type="text"
            value={terms.dailyOccupancyPenalty !== '' ? formatNumber(parseFormattedNumber(terms.dailyOccupancyPenalty)) : ''}
            onChange={(e) => {
              const parsed = parseFormattedNumber(e.target.value);
              const rawValue = parsed === 0 && !e.target.value.trim() ? '' : parsed.toString();
              setTerms({ ...terms, dailyOccupancyPenalty: rawValue });
              if (step4FieldErrors['dailyOccupancyPenalty']) {
                setStep4FieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors['dailyOccupancyPenalty'];
                  return newErrors;
                });
              }
            }}
            className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
              step4FieldErrors['dailyOccupancyPenalty']
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
          />
          {step4FieldErrors['dailyOccupancyPenalty'] && (
            <p className="mt-1 text-sm text-red-600">{step4FieldErrors['dailyOccupancyPenalty']}</p>
          )}
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
            type="text"
            value={terms.deliveryDelayPenalty !== '' ? formatNumber(parseFormattedNumber(terms.deliveryDelayPenalty)) : ''}
            onChange={(e) => {
              const parsed = parseFormattedNumber(e.target.value);
              const rawValue = parsed === 0 && !e.target.value.trim() ? '' : parsed.toString();
              setTerms({ ...terms, deliveryDelayPenalty: rawValue });
            }}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">کاربری</label>
          <select
            value={terms.usagePurpose}
            onChange={(e) => setTerms({ ...terms, usagePurpose: e.target.value, usagePurposeOther: e.target.value === 'سایر' ? terms.usagePurposeOther : '' })}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">انتخاب کنید</option>
            <option value="مسکونی">مسکونی</option>
            <option value="اداری">اداری</option>
            <option value="تجاری">تجاری</option>
            <option value="سایر">سایر (دستی)</option>
          </select>
          {terms.usagePurpose === 'سایر' && (
            <input
              type="text"
              value={terms.usagePurposeOther}
              onChange={(e) => setTerms({ ...terms, usagePurposeOther: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="لطفا کاربری را وارد کنید"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-600">تعداد ساکنین</label>
          <input
            type="number"
            value={terms.occupantCount}
            onChange={(e) => {
              setTerms({ ...terms, occupantCount: e.target.value });
              if (step4FieldErrors['occupantCount']) {
                setStep4FieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors['occupantCount'];
                  return newErrors;
                });
              }
            }}
            className={`w-full rounded-2xl border px-4 py-2 text-sm text-gray-800 focus:ring-2 ${
              step4FieldErrors['occupantCount']
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
          />
          {step4FieldErrors['occupantCount'] && (
            <p className="mt-1 text-sm text-red-600">{step4FieldErrors['occupantCount']}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-600">توضیحات</label>
          <textarea
            value={terms.customTerms}
            onChange={(e) => setTerms({ ...terms, customTerms: e.target.value })}
            rows={4}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="توضیحات قرارداد..."
          />
        </div>
      </div>

      {/* NEW: Article 6 Conditions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ماده 6 - شرایط قرارداد</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">مهلت پرداخت</label>
            <select
              value={terms.rentPaymentDeadline}
              onChange={(e) => setTerms({ ...terms, rentPaymentDeadline: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">انتخاب کنید</option>
              <option value="اول">اول ماه</option>
              <option value="دوم">دوم ماه</option>
              <option value="سوم">سوم ماه</option>
              <option value="چهارم">چهارم ماه</option>
              <option value="پنجم">پنجم ماه</option>
              <option value="ششم">ششم ماه</option>
              <option value="هفتم">هفتم ماه</option>
              <option value="هشتم">هشتم ماه</option>
              <option value="نهم">نهم ماه</option>
              <option value="دهم">دهم ماه</option>
              <option value="یازدهم">یازدهم ماه</option>
              <option value="دوازدهم">دوازدهم ماه</option>
              <option value="سیزدهم">سیزدهم ماه</option>
              <option value="چهاردهم">چهاردهم ماه</option>
              <option value="پانزدهم">پانزدهم ماه</option>
              <option value="شانزدهم">شانزدهم ماه</option>
              <option value="هفدهم">هفدهم ماه</option>
              <option value="هجدهم">هجدهم ماه</option>
              <option value="نوزدهم">نوزدهم ماه</option>
              <option value="بیستم">بیستم ماه</option>
              <option value="بیست و یکم">بیست و یکم ماه</option>
              <option value="بیست و دوم">بیست و دوم ماه</option>
              <option value="بیست و سوم">بیست و سوم ماه</option>
              <option value="بیست و چهارم">بیست و چهارم ماه</option>
              <option value="بیست و پنجم">بیست و پنجم ماه</option>
              <option value="بیست و ششم">بیست و ششم ماه</option>
              <option value="بیست و هفتم">بیست و هفتم ماه</option>
              <option value="بیست و هشتم">بیست و هشتم ماه</option>
              <option value="بیست و نهم">بیست و نهم ماه</option>
              <option value="سی ام">سی ام ماه</option>
            </select>
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
                type="text"
                value={draftData.rentalAmount !== '' ? formatNumber(parseFormattedNumber(draftData.rentalAmount)) : ''}
                onChange={(e) => {
                  const parsed = parseFormattedNumber(e.target.value);
                  const rawValue = parsed === 0 && !e.target.value.trim() ? '' : parsed.toString();
                  setDraftData({ ...draftData, rentalAmount: rawValue });
                }}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">مبلغ ودیعه (ریال)</label>
              <input
                type="text"
                value={draftData.depositAmount !== '' ? formatNumber(parseFormattedNumber(draftData.depositAmount)) : ''}
                onChange={(e) => {
                  const parsed = parseFormattedNumber(e.target.value);
                  const rawValue = parsed === 0 && !e.target.value.trim() ? '' : parsed.toString();
                  setDraftData({ ...draftData, depositAmount: rawValue });
                }}
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
                type="text"
                value={draftData.purchaseAmount !== '' ? formatNumber(parseFormattedNumber(draftData.purchaseAmount)) : ''}
                onChange={(e) => {
                  const parsed = parseFormattedNumber(e.target.value);
                  const rawValue = parsed === 0 && !e.target.value.trim() ? '' : parsed.toString();
                  setDraftData({ ...draftData, purchaseAmount: rawValue });
                }}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">پیش‌پرداخت (ریال)</label>
              <input
                type="text"
                value={draftData.depositAmount !== '' ? formatNumber(parseFormattedNumber(draftData.depositAmount)) : ''}
                onChange={(e) => {
                  const parsed = parseFormattedNumber(e.target.value);
                  const rawValue = parsed === 0 && !e.target.value.trim() ? '' : parsed.toString();
                  setDraftData({ ...draftData, depositAmount: rawValue });
                }}
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
            <label className="mb-1 block text-sm font-semibold text-gray-600">حوزه ثبتي</label>
            <input
              type="text"
              value={draftData.registrationArea}
              onChange={(e) => setDraftData({ ...draftData, registrationArea: e.target.value })}
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

        {/* هشدار اعتبارسنجی پرداختی‌ها */}
        {(() => {
          const validation = validatePayments();
          if (!validation.isValid) {
            return (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-semibold">⚠️</span>
                  <div>
                    <p className="font-semibold mb-1">هشدار: مجموع پرداختی‌ها کافی نیست</p>
                    <p>{validation.errorMessage}</p>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

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
                          disabled={!validatePayments().isValid}
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
                            validatePayments().isValid
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
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
