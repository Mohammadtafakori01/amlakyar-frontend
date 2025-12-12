# تغییرات مورد نیاز در بک‌اند - حذف فیلدهای ماده 6

## خلاصه تغییرات
این سند شامل تمام تغییراتی است که باید در بک‌اند برای حذف فیلدهای ماده 6 از فرم ثبت شرایط قرارداد انجام شود.

---

## 1. فیلدهای حذف شده از مدل ContractTerms

### فیلدهای حذف شده:
1. `permittedUse` (نوع استفاده مجاز)
2. `utilityCostsResponsibility` (مسئولیت هزینه‌های مصرفی)
3. `maintenanceFeesResponsibility` (مسئولیت شارژ ساختمان)
4. `majorRepairsResponsibility` (مسئولیت تعمیرات اساسی)
5. `minorRepairsResponsibility` (مسئولیت تعمیرات جزئی)
6. `propertyTaxResponsibility` (مسئولیت مالیات ملک)
7. `incomeTaxResponsibility` (مسئولیت مالیات درآمد)
8. `goodwillRights` (حق سرقفلی)
9. `returnCondition` (شرایط بازگشت ملک)
10. `earlyTerminationNotice` (مهلت اخطار فسخ - روز)
11. `earlyTerminationPayment` (پرداخت اضافی برای فسخ زودهنگام - ریال)
12. `loanReturnDelayPenalty` (جریمه تأخیر بازگشت قرض الحسنه - ریال)
13. `hasTransferRight` (حق انتقال به غیر - boolean)
14. `lessorOwnershipConfirmed` (تأیید مالکیت موجر - boolean)
15. `lesseeRepairRight` (حق مستاجر برای تعمیرات ضروری - boolean)
16. `propertyTransferNotification` (اطلاع‌رسانی انتقال ملک - boolean)
17. `lessorLoanReturnObligation` (تعهد موجر به بازگشت قرض الحسنه - boolean)

### فیلدهای باقی‌مانده در ماده 6:
- `rentPaymentDeadline` (مهلت پرداخت) - **باقی می‌ماند**
- `renewalConditions` (شرایط تمدید) - **باقی می‌ماند**

---

## 2. اقدامات مورد نیاز در بک‌اند

### 2.1. حذف از Entity/Model

```typescript
// قبل
export interface ContractTerms {
  // ... سایر فیلدها
  permittedUse?: string;
  hasTransferRight?: boolean;
  lessorOwnershipConfirmed?: boolean;
  rentPaymentDeadline?: string;
  utilityCostsResponsibility?: string;
  maintenanceFeesResponsibility?: string;
  majorRepairsResponsibility?: string;
  minorRepairsResponsibility?: string;
  propertyTaxResponsibility?: string;
  incomeTaxResponsibility?: string;
  goodwillRights?: string;
  returnCondition?: string;
  lessorLoanReturnObligation?: boolean;
  lesseeRepairRight?: boolean;
  renewalConditions?: string;
  earlyTerminationNotice?: number;
  earlyTerminationPayment?: number;
  propertyTransferNotification?: boolean;
  loanReturnDelayPenalty?: number;
}

// بعد
export interface ContractTerms {
  // ... سایر فیلدها
  rentPaymentDeadline?: string;
  lessorLoanReturnObligation?: boolean;
  renewalConditions?: string;
}
```

### 2.2. Migration Database

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveArticle6Fields1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // حذف ستون‌های حذف شده
    await queryRunner.dropColumn('contract_terms', 'permitted_use');
    await queryRunner.dropColumn('contract_terms', 'has_transfer_right');
    await queryRunner.dropColumn('contract_terms', 'lessor_ownership_confirmed');
    await queryRunner.dropColumn('contract_terms', 'utility_costs_responsibility');
    await queryRunner.dropColumn('contract_terms', 'maintenance_fees_responsibility');
    await queryRunner.dropColumn('contract_terms', 'major_repairs_responsibility');
    await queryRunner.dropColumn('contract_terms', 'minor_repairs_responsibility');
    await queryRunner.dropColumn('contract_terms', 'property_tax_responsibility');
    await queryRunner.dropColumn('contract_terms', 'income_tax_responsibility');
    await queryRunner.dropColumn('contract_terms', 'goodwill_rights');
    await queryRunner.dropColumn('contract_terms', 'return_condition');
    await queryRunner.dropColumn('contract_terms', 'lessee_repair_right');
    await queryRunner.dropColumn('contract_terms', 'early_termination_notice');
    await queryRunner.dropColumn('contract_terms', 'early_termination_payment');
    await queryRunner.dropColumn('contract_terms', 'property_transfer_notification');
    await queryRunner.dropColumn('contract_terms', 'loan_return_delay_penalty');
    await queryRunner.dropColumn('contract_terms', 'lessor_loan_return_obligation');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // برگرداندن ستون‌ها در صورت rollback
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'permitted_use',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'has_transfer_right',
      type: 'boolean',
      default: false,
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'lessor_ownership_confirmed',
      type: 'boolean',
      default: true,
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'utility_costs_responsibility',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'maintenance_fees_responsibility',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'major_repairs_responsibility',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'minor_repairs_responsibility',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'property_tax_responsibility',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'income_tax_responsibility',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'goodwill_rights',
      type: 'text',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'return_condition',
      type: 'text',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'lessee_repair_right',
      type: 'boolean',
      default: false,
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'early_termination_notice',
      type: 'integer',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'early_termination_payment',
      type: 'bigint',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'property_transfer_notification',
      type: 'boolean',
      default: true,
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'loan_return_delay_penalty',
      type: 'bigint',
      isNullable: true,
    }));
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'lessor_loan_return_obligation',
      type: 'boolean',
      default: true,
      isNullable: true,
    }));
  }
}
```

### 2.3. حذف از DTOs

#### CreateContractTermsDTO
```typescript
// حذف فیلدهای زیر:
- permittedUse
- hasTransferRight
- lessorOwnershipConfirmed
- utilityCostsResponsibility
- maintenanceFeesResponsibility
- majorRepairsResponsibility
- minorRepairsResponsibility
- propertyTaxResponsibility
- incomeTaxResponsibility
- goodwillRights
- returnCondition
- lesseeRepairRight
- earlyTerminationNotice
- earlyTerminationPayment
- propertyTransferNotification
- loanReturnDelayPenalty
```

#### UpdateContractTermsDTO
```typescript
// همان فیلدهای CreateContractTermsDTO را حذف کنید
```

#### ContractTermsResponseDTO
```typescript
// همان فیلدها را از response DTO نیز حذف کنید
```

### 2.4. حذف از Validation

حذف تمام validation rules مربوط به فیلدهای حذف شده:
- `permittedUse` validation
- `utilityCostsResponsibility` validation
- `maintenanceFeesResponsibility` validation
- `majorRepairsResponsibility` validation
- `minorRepairsResponsibility` validation
- `propertyTaxResponsibility` validation
- `incomeTaxResponsibility` validation
- `goodwillRights` validation
- `returnCondition` validation
- `earlyTerminationNotice` validation (مثلاً بررسی منفی نبودن)
- `earlyTerminationPayment` validation (مثلاً بررسی منفی نبودن)
- `loanReturnDelayPenalty` validation (مثلاً بررسی منفی نبودن)

---

## 3. تغییرات در API Endpoints

### 3.1. Endpoints تحت تأثیر:
1. `POST /api/contracts/:id/terms` - ایجاد شرایط قرارداد
2. `PUT /api/contracts/:id/terms` - به‌روزرسانی شرایط قرارداد
3. `GET /api/contracts/:id` - دریافت قرارداد (باید فیلدهای حذف شده را برنگرداند)

### 3.2. تغییرات مورد نیاز:

#### Request Body (POST/PUT)
- فیلدهای حذف شده دیگر پذیرفته نمی‌شوند
- اگر این فیلدها در request ارسال شوند، باید نادیده گرفته شوند یا خطا برگردانند (بسته به استراتژی شما)

#### Response (GET)
- این فیلدها نباید در response برگردانده شوند

---

## 4. تغییرات در TypeScript Types (اگر در بک‌اند استفاده می‌شود)

```typescript
// قبل
export interface ContractTerms {
  // ... سایر فیلدها
  permittedUse?: string;
  hasTransferRight?: boolean;
  lessorOwnershipConfirmed?: boolean;
  rentPaymentDeadline?: string;
  utilityCostsResponsibility?: string;
  maintenanceFeesResponsibility?: string;
  majorRepairsResponsibility?: string;
  minorRepairsResponsibility?: string;
  propertyTaxResponsibility?: string;
  incomeTaxResponsibility?: string;
  goodwillRights?: string;
  returnCondition?: string;
  lessorLoanReturnObligation?: boolean;
  lesseeRepairRight?: boolean;
  renewalConditions?: string;
  earlyTerminationNotice?: number;
  earlyTerminationPayment?: number;
  propertyTransferNotification?: boolean;
  loanReturnDelayPenalty?: number;
}

// بعد
export interface ContractTerms {
  // ... سایر فیلدها
  rentPaymentDeadline?: string;
  lessorLoanReturnObligation?: boolean;
  renewalConditions?: string;
}
```

---

## 5. تست‌های مورد نیاز

### 5.1. Unit Tests:
- [ ] تست حذف فیلدها از DTO
- [ ] تست validation برای فیلدهای باقی‌مانده
- [ ] تست migration

### 5.2. Integration Tests:
- [ ] تست ایجاد قرارداد بدون فیلدهای حذف شده
- [ ] تست به‌روزرسانی قرارداد بدون فیلدهای حذف شده
- [ ] تست دریافت قرارداد (بررسی عدم وجود فیلدهای حذف شده در response)
- [ ] تست ارسال request با فیلدهای حذف شده (باید نادیده گرفته شوند یا خطا برگردانند)

### 5.3. Manual Tests:
- [ ] تست backward compatibility با داده‌های قدیمی
- [ ] تست اینکه قراردادهای قدیمی با این فیلدها هنوز قابل خواندن هستند

---

## 6. نکات مهم

### 6.1. Backward Compatibility:
- اگر قراردادهای قدیمی با این فیلدها وجود دارند:
  - **گزینه 1:** Migration را اجرا کنید و داده‌های قدیمی را حذف کنید
  - **گزینه 2:** فیلدها را nullable نگه دارید و دیگر استفاده نکنید (اما در API response برنگردانید)

### 6.2. API Versioning:
- اگر از API versioning استفاده می‌کنید، این تغییرات را در نسخه جدید API اعمال کنید

### 6.3. Documentation:
- به‌روزرسانی مستندات API (Swagger/OpenAPI)
- حذف فیلدها از مثال‌های API

### 6.4. Data Migration:
- اگر داده‌های مهمی در این فیلدها وجود دارد، قبل از حذف آنها را backup کنید
- تصمیم بگیرید که آیا باید داده‌های قدیمی را نگه دارید یا حذف کنید

---

## 7. خلاصه تغییرات

| فیلد | نوع | عمل | توضیحات |
|------|-----|-----|---------|
| `permittedUse` | string | حذف | نوع استفاده مجاز |
| `utilityCostsResponsibility` | string | حذف | مسئولیت هزینه‌های مصرفی |
| `maintenanceFeesResponsibility` | string | حذف | مسئولیت شارژ ساختمان |
| `majorRepairsResponsibility` | string | حذف | مسئولیت تعمیرات اساسی |
| `minorRepairsResponsibility` | string | حذف | مسئولیت تعمیرات جزئی |
| `propertyTaxResponsibility` | string | حذف | مسئولیت مالیات ملک |
| `incomeTaxResponsibility` | string | حذف | مسئولیت مالیات درآمد |
| `goodwillRights` | string (text) | حذف | حق سرقفلی |
| `returnCondition` | string (text) | حذف | شرایط بازگشت ملک |
| `earlyTerminationNotice` | number | حذف | مهلت اخطار فسخ (روز) |
| `earlyTerminationPayment` | number | حذف | پرداخت اضافی برای فسخ زودهنگام (ریال) |
| `loanReturnDelayPenalty` | number | حذف | جریمه تأخیر بازگشت قرض الحسنه (ریال) |
| `hasTransferRight` | boolean | حذف | حق انتقال به غیر |
| `lessorOwnershipConfirmed` | boolean | حذف | تأیید مالکیت موجر |
| `lesseeRepairRight` | boolean | حذف | حق مستاجر برای تعمیرات ضروری |
| `propertyTransferNotification` | boolean | حذف | اطلاع‌رسانی انتقال ملک |
| `rentPaymentDeadline` | string | باقی می‌ماند | مهلت پرداخت |
| `renewalConditions` | string (text) | باقی می‌ماند | شرایط تمدید |
| `lessorLoanReturnObligation` | boolean | حذف | تعهد موجر به بازگشت قرض الحسنه |

---

## 8. فیلدهای باقی‌مانده در ماده 6

پس از حذف فیلدهای بالا، فقط این 2 فیلد در بخش ماده 6 باقی می‌مانند:

1. **`rentPaymentDeadline`** (مهلت پرداخت)
   - نوع: string
   - مقادیر مجاز: "اول"، "دوم"، "سوم"، ...، "سی ام" (30 گزینه از اول ماه تا سی ام ماه)

2. **`renewalConditions`** (شرایط تمدید)
   - نوع: string (text)
   - توضیحات متنی

---

## 9. تاریخچه تغییرات
- تاریخ: [تاریخ امروز]
- نسخه: 2.1.0
- توضیحات: حذف 17 فیلد از ماده 6 شرایط قرارداد (شامل lessorLoanReturnObligation)، باقی ماندن 2 فیلد

---

## 10. چک‌لیست پیاده‌سازی

- [ ] به‌روزرسانی Entity/Model
- [ ] ایجاد Migration
- [ ] اجرای Migration در محیط Development
- [ ] به‌روزرسانی DTOs (Create, Update, Response)
- [ ] حذف Validation Rules
- [ ] به‌روزرسانی API Endpoints
- [ ] به‌روزرسانی TypeScript Types
- [ ] اجرای Unit Tests
- [ ] اجرای Integration Tests
- [ ] تست Manual
- [ ] به‌روزرسانی مستندات API
- [ ] اجرای Migration در محیط Production
- [ ] بررسی Backward Compatibility

