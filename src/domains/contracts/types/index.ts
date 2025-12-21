// Contract Enums
export enum ContractType {
  RENTAL = 'RENTAL',
  PURCHASE = 'PURCHASE',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum PartyType {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
}

export enum PartyRole {
  PRINCIPAL = 'PRINCIPAL',
  REPRESENTATIVE = 'REPRESENTATIVE',
  ATTORNEY = 'ATTORNEY',
}

export enum PartyEntityType {
  NATURAL = 'NATURAL',
  LEGAL = 'LEGAL',
}

export enum ShareType {
  DANG = 'DANG',
  PERCENTAGE = 'PERCENTAGE',
}

export enum RelationshipType {
  ATTORNEY = 'ATTORNEY',
  MANAGEMENT = 'MANAGEMENT',
  GUARDIAN = 'GUARDIAN',
  OTHER = 'OTHER',
}

// Payment Enums
export enum PaymentType {
  MORTGAGE = 'MORTGAGE',           // رهن (برای اجاره‌نامه)
  RENTAL_PAYMENT = 'RENTAL_PAYMENT', // پرداخت اجاره (چک‌های اجاره)
  DOWN_PAYMENT = 'DOWN_PAYMENT',   // پیش‌پرداخت (برای مبایعه‌نامه)
  BILL_OF_SALE = 'BILL_OF_SALE',   // قبض رسید (برای مبایعه‌نامه)
}

export enum PaymentMethod {
  CARD_TO_CARD = 'CARD_TO_CARD',           // کارت به کارت
  SHABA = 'SHABA',                         // شبا / پل پایا سانتا
  ACCOUNT_TO_ACCOUNT = 'ACCOUNT_TO_ACCOUNT', // حساب به حساب
  CHECK = 'CHECK',                         // چک
  CASH = 'CASH',                           // نقد
}

// Contract Party Types
export interface NaturalPerson {
  firstName: string;
  lastName: string;
  nationalId: string;
}

export interface LegalPerson {
  companyName: string;
  registrationNumber?: string;
  companyNationalId: string;
  officialGazette?: string;
}

export interface PartyRelationship {
  principalPartyId: string;
  relationshipType: RelationshipType;
  relationshipDocumentNumber: string;
  relationshipDocumentDate: string;
}

export interface ContractParty {
  id?: string;
  partyType: PartyType;
  partyRole: PartyRole;
  entityType: PartyEntityType;
  shareType: ShareType;
  shareValue: number;
  // Natural person fields
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  // NEW: Additional natural person fields
  childOf?: string;              // فرزند (نام پدر)
  idCardNumber?: string;         // شماره شناسنامه
  issuedFrom?: string;           // صادره از (محل صدور)
  birthDate?: string;            // متولد (YYYY-MM-DD format)
  phone?: string;                // تلفن
  postalCode?: string;           // کد پستی (10 digits)
  address?: string;              // آدرس
  resident?: string;              // ساكن (محل سکونت)
  authorityType?: string;        // نوع اختیار (وکالت/قیومیت/ولایت/وصايت)
  authorityDocumentNumber?: string;  // شماره مدرک اختیار
  authorityDocumentDate?: string;    // تاریخ مدرک اختیار (YYYY-MM-DD)
  // Legal person fields
  companyName?: string;
  registrationNumber?: string;
  companyNationalId?: string;
  officialGazette?: string;
  // Relationship fields (for representative/attorney)
  principalPartyId?: string;
  relationshipType?: RelationshipType;
  relationshipDocumentNumber?: string;
  relationshipDocumentDate?: string;
  // Related party (for display)
  principalParty?: ContractParty;
}

// Property Details
export interface PropertyAmenities {
  flooring?: string;
  bathroom?: string;
  meetingHall?: boolean;
  club?: boolean;
  amphitheater?: boolean;
  security?: boolean;
  balcony?: boolean;
  hood?: boolean;
  janitorial?: boolean;
  lobby?: boolean;
  terrace?: boolean;
  videoIntercom?: boolean;
  remoteParkingGate?: boolean;
  tableGas?: boolean;
  centralAntenna?: boolean;
}

export interface PropertyUtilityType {
  electricity?: string;  // اختصاصی/اشتراکی
  water?: string;        // اختصاصی/اشتراکی
  gas?: string;          // اختصاصی/اشتراکی
}

export interface PropertyDetails {
  propertyType?: string;
  usageType?: string;
  address?: string;
  postalCode?: string;
  registrationNumber?: string;
  subRegistrationNumber?: string;
  mainRegistrationNumber?: string;
  section?: string;
  area?: number;
  areaUnit?: string;
  ownershipDocumentType?: string;
  ownershipDocumentSerial?: string;
  ownershipDocumentOwner?: string;
  storageCount?: number;
  storageNumbers?: string[];
  parkingCount?: number;
  parkingNumbers?: string[];
  amenities?: PropertyAmenities;
  // NEW: Additional property fields
  bedroomCount?: number;                    // تعداد اتاق خواب
  bedroomArea?: number;                     // مساحت اتاق خواب (متر مربع)
  utilityType?: PropertyUtilityType;        // نوع خدمات
  heatingStatus?: string;                   // وضعیت شوفاژ (روشن/غیر روشن)
  coolerType?: string;                      // نوع کولر
  phoneNumber?: string;                     // شماره تلفن
  phoneStatus?: string;                    // وضعیت تلفن (دایر/غیر دایر)
  ownershipDocumentPage?: string;           // صفحه سند
  ownershipDocumentBook?: string;           // دفتر سند
  uniqueDocumentId?: string;                // شناسه یکتای سند (برای تک برگ)
  propertyShareType?: string;               // نوع سهم (دانگ/دستگاه/یک باب)
}

// Contract Terms
export interface ContractTerms {
  evictionNoticeDays?: number;
  dailyPenaltyAmount?: number;
  dailyDelayPenalty?: number;
  dailyOccupancyPenalty?: number;
  deliveryDate?: string;
  deliveryDelayPenalty?: number;
  usagePurpose?: string;
  occupantCount?: number;
  customTerms?: string;
  // NEW: Article 6 conditions
  permittedUse?: string;                    // نوع استفاده مجاز (مسکونی/تجاری/اداری)
  hasTransferRight?: boolean;               // حق انتقال به غیر (دارد/ندارد)
  lessorOwnershipConfirmed?: boolean;       // تأیید مالکیت موجر (default: true)
  rentPaymentDeadline?: string;             // مهلت پرداخت (اول/آخر ماه)
  utilityCostsResponsibility?: string;      // مسئولیت هزینه‌های مصرفی
  maintenanceFeesResponsibility?: string;   // مسئولیت شارژ ساختمان
  majorRepairsResponsibility?: string;      // مسئولیت تعمیرات اساسی
  minorRepairsResponsibility?: string;      // مسئولیت تعمیرات جزئی
  propertyTaxResponsibility?: string;       // مسئولیت مالیات ملک
  incomeTaxResponsibility?: string;         // مسئولیت مالیات درآمد
  goodwillRights?: string;                  // حق سرقفلی
  returnCondition?: string;                  // شرایط بازگشت ملک
  lessorLoanReturnObligation?: boolean;     // تعهد موجر به بازگشت قرض الحسنه (default: true)
  lesseeRepairRight?: boolean;              // حق مستاجر برای تعمیرات ضروری
  renewalConditions?: string;               // شرایط تمدید
  earlyTerminationNotice?: number;          // مهلت اخطار فسخ (روز)
  earlyTerminationPayment?: number;         // پرداخت اضافی برای فسخ زودهنگام (ریال)
  propertyTransferNotification?: boolean;   // اطلاع‌رسانی انتقال ملک (default: true)
  loanReturnDelayPenalty?: number;          // جریمه تأخیر بازگشت قرض الحسنه (ریال)
}

// Payment Entry Types
export interface PaymentEntry {
  id?: string;
  paymentType: PaymentType;
  amount: number;                           // مبلغ (ریال)
  paymentMethod: PaymentMethod;
  order?: number;                           // ترتیب (برای چندین ورودی)
  description?: string;                     // توضیحات
  // Method-specific fields
  checkNumber?: string;                     // شماره چک (برای CHECK)
  accountNumber?: string;                   // شماره حساب (برای ACCOUNT_TO_ACCOUNT)
  cardNumber?: string;                      // شماره کارت (برای CARD_TO_CARD)
  shabaNumber?: string;                     // شماره شبا (برای SHABA)
  bankName?: string;                        // نام بانک (برای CHECK, ACCOUNT_TO_ACCOUNT)
  branchName?: string;                      // نام شعبه (اختیاری برای CHECK, ACCOUNT_TO_ACCOUNT)
}

// Contract Model
export interface Contract {
  id: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  contractDate: string;
  startDate?: string;        // برای RENTAL
  endDate?: string;          // برای RENTAL
  rentalAmount?: number;     // فقط برای RENTAL
  purchaseAmount?: number;   // فقط برای PURCHASE
  depositAmount?: number;
  // NEW: Administrative fields
  consultancyNumber?: string;               // شماره مشاوره املاک
  registrationArea?: string;                // حوزه ثبتي
  registrationOffice?: string;              // دفتر ثبت
  consultantRegistrationVolume?: string;    // جلد ثبت مشاور
  consultantRegistrationNumber?: string;    // شماره ثبت مشاور
  consultantRegistrationDate?: string;       // تاریخ ثبت مشاور (YYYY-MM-DD)
  witness1Name?: string;                    // نام شاهد 1
  witness2Name?: string;                    // نام شاهد 2
  legalExpertName?: string;                 // نام کارشناس حقوقی
  consultantFee?: number;                   // حق الزحمه مشاور (ریال)
  contractCopies?: number;                  // تعداد نسخ قرارداد (default: 3)
  parties?: ContractParty[];
  propertyDetails?: PropertyDetails;
  terms?: ContractTerms;
  paymentEntries?: PaymentEntry[];          // روش‌های پرداخت
  estate?: {                                // اطلاعات املاک (در صورت وجود)
    id: string;
    establishmentName: string;
    guildId?: string;
    fixedPhone?: string;
    address?: string;
    status?: string;
    rejectionReason?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  createdBy?: {                             // اطلاعات ایجاد کننده
    id: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    role: string;
    isActive?: boolean;
    isApproved?: boolean;
    parentId?: string | null;
    estateId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  createdById?: string;
  // Boolean amenities fields (stored at contract level)
  meetingHall?: boolean;
  club?: boolean;
  amphitheater?: boolean;
  security?: boolean;
  balcony?: boolean;
  hood?: boolean;
  janitorial?: boolean;
  lobby?: boolean;
  terrace?: boolean;
  videoIntercom?: boolean;
  remoteParkingGate?: boolean;
  tableGas?: boolean;
  centralAntenna?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateContractStep1Request {
  type: ContractType;
  estateId?: string;
}

export interface AddPartyRequest {
  partyType: PartyType;
  partyRole: PartyRole;
  entityType: PartyEntityType;
  shareType: ShareType;
  shareValue: number;
  // Natural person
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  // NEW: Additional natural person fields
  childOf?: string;
  idCardNumber?: string;
  issuedFrom?: string;
  birthDate?: string;
  phone?: string;
  postalCode?: string;
  address?: string;
  resident?: string;
  authorityType?: string;
  authorityDocumentNumber?: string;
  authorityDocumentDate?: string;
  // Legal person
  companyName?: string;
  registrationNumber?: string;
  companyNationalId?: string;
  officialGazette?: string;
  // Relationship
  principalPartyId?: string;
  relationshipType?: RelationshipType;
  relationshipDocumentNumber?: string;
  relationshipDocumentDate?: string;
}

export interface CreateContractStep2Request {
  parties: AddPartyRequest[];
}

export interface UpdatePropertyRequest extends PropertyDetails {}

export interface UpdateTermsRequest extends ContractTerms {}

export interface SaveDraftRequest {
  contractDate?: string;
  startDate?: string;        // برای RENTAL
  endDate?: string;          // برای RENTAL
  rentalAmount?: number;     // فقط برای RENTAL
  purchaseAmount?: number;   // فقط برای PURCHASE
  depositAmount?: number;
  // NEW: Administrative fields
  consultancyNumber?: string;
  registrationArea?: string;
  registrationOffice?: string;
  consultantRegistrationVolume?: string;
  consultantRegistrationNumber?: string;
  consultantRegistrationDate?: string;
  witness1Name?: string;
  witness2Name?: string;
  legalExpertName?: string;
  consultantFee?: number;
  contractCopies?: number;
  paymentEntries?: PaymentEntry[];          // روش‌های پرداخت
}

export interface CreateContractFullRequest {
  type: ContractType;
  estateId?: string;
  contractDate?: string;
  startDate?: string;        // برای RENTAL
  endDate?: string;          // برای RENTAL
  rentalAmount?: number;     // فقط برای RENTAL
  purchaseAmount?: number;   // فقط برای PURCHASE
  depositAmount?: number;
  // NEW: Administrative fields
  consultancyNumber?: string;
  registrationArea?: string;
  registrationOffice?: string;
  consultantRegistrationVolume?: string;
  consultantRegistrationNumber?: string;
  consultantRegistrationDate?: string;
  witness1Name?: string;
  witness2Name?: string;
  legalExpertName?: string;
  consultantFee?: number;
  contractCopies?: number;
  parties?: {
    parties: AddPartyRequest[];
  };
  propertyDetails?: PropertyDetails;
  terms?: ContractTerms;
  paymentEntries?: PaymentEntry[];          // روش‌های پرداخت
}

export interface UpdateContractRequest {
  contractDate?: string;
  startDate?: string;        // برای RENTAL
  endDate?: string;          // برای RENTAL
  rentalAmount?: number;     // فقط برای RENTAL
  purchaseAmount?: number;   // فقط برای PURCHASE
  depositAmount?: number;
  // NEW: Administrative fields
  consultancyNumber?: string;
  registrationArea?: string;
  registrationOffice?: string;
  consultantRegistrationVolume?: string;
  consultantRegistrationNumber?: string;
  consultantRegistrationDate?: string;
  witness1Name?: string;
  witness2Name?: string;
  legalExpertName?: string;
  consultantFee?: number;
  contractCopies?: number;
  paymentEntries?: PaymentEntry[];          // روش‌های پرداخت
}

export interface UpdateContractStatusRequest {
  status: ContractStatus;
}

// Filter Types
export interface ContractFilters {
  type?: ContractType;
  status?: ContractStatus;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Archive Filters
export interface ArchiveContractsDto {
  contractDate?: string;  // Date string in YYYY-MM-DD format
  contractNumber?: string;
  name?: string;  // Searches in firstName or companyName
  lastname?: string;  // Searches in lastName
  page?: number;
  limit?: number;
}

export interface ContractsState {
  contracts: Contract[];
  selectedContract: Contract | null;
  filters: ContractFilters;
  pagination: any | null;
  isLoading: boolean;
  error: string | null;
  searchResults: Contract[];
  isSearching: boolean;
  searchQuery: string | null;
}


