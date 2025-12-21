# تغییرات مورد نیاز در بک‌اند - حذف فیلدهای اطلاعات اداری

## خلاصه تغییرات
این سند شامل تمام تغییراتی است که باید در بک‌اند برای حذف فیلدهای اطلاعات اداری از مرحله 5 (نهایی‌سازی قرارداد) انجام شود.

---

## 1. فیلدهای حذف شده از مدل Contract

### فیلدهای حذف شده:
1. `consultancyNumber` (شماره مشاوره املاک)
2. `registrationOffice` (دفتر ثبت)
3. `consultantRegistrationVolume` (جلد ثبت مشاور)
4. `consultantRegistrationNumber` (شماره ثبت مشاور)
5. `consultantRegistrationDate` (تاریخ ثبت مشاور)
6. `consultantFee` (حق الزحمه مشاور - ریال)
7. `legalExpertName` (نام کارشناس حقوقی)
8. `contractCopies` (تعداد نسخ قرارداد)

### فیلدهای باقی‌مانده در اطلاعات اداری:
- `registrationArea` (حوزه ثبتي) - **باقی می‌ماند**
- `witness1Name` (نام شاهد 1) - **باقی می‌ماند**
- `witness2Name` (نام شاهد 2) - **باقی می‌ماند**

---

## 2. اقدامات مورد نیاز در بک‌اند

### 2.1. حذف از Entity/Model

```typescript
// قبل
export interface Contract {
  // ... سایر فیلدها
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
}

// بعد
export interface Contract {
  // ... سایر فیلدها
  registrationArea?: string;
  witness1Name?: string;
  witness2Name?: string;
}
```

### 2.2. Migration Database

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveAdministrativeFields1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // حذف ستون‌های حذف شده
    await queryRunner.dropColumn('contracts', 'consultancy_number');
    await queryRunner.dropColumn('contracts', 'registration_office');
    await queryRunner.dropColumn('contracts', 'consultant_registration_volume');
    await queryRunner.dropColumn('contracts', 'consultant_registration_number');
    await queryRunner.dropColumn('contracts', 'consultant_registration_date');
    await queryRunner.dropColumn('contracts', 'legal_expert_name');
    await queryRunner.dropColumn('contracts', 'consultant_fee');
    await queryRunner.dropColumn('contracts', 'contract_copies');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // برگرداندن ستون‌ها در صورت rollback
    await queryRunner.addColumn('contracts', new TableColumn({
      name: 'consultancy_number',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contracts', new TableColumn({
      name: 'registration_office',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contracts', new TableColumn({
      name: 'consultant_registration_volume',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contracts', new TableColumn({
      name: 'consultant_registration_number',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contracts', new TableColumn({
      name: 'consultant_registration_date',
      type: 'date',
      isNullable: true,
    }));
    await queryRunner.addColumn('contracts', new TableColumn({
      name: 'legal_expert_name',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));
    await queryRunner.addColumn('contracts', new TableColumn({
      name: 'consultant_fee',
      type: 'bigint',
      isNullable: true,
    }));
    await queryRunner.addColumn('contracts', new TableColumn({
      name: 'contract_copies',
      type: 'integer',
      default: 3,
      isNullable: true,
    }));
  }
}
```

### 2.3. حذف از DTOs

#### CreateContractFullRequest / SaveDraftRequest
```typescript
// حذف فیلدهای زیر:
- consultancyNumber
- registrationOffice
- consultantRegistrationVolume
- consultantRegistrationNumber
- consultantRegistrationDate
- legalExpertName
- consultantFee
- contractCopies
```

#### UpdateContractRequest
```typescript
// همان فیلدهای CreateContractFullRequest را حذف کنید
```

#### ContractResponseDTO
```typescript
// همان فیلدها را از response DTO نیز حذف کنید
```

### 2.4. حذف از Validation

حذف تمام validation rules مربوط به فیلدهای حذف شده:
- `consultancyNumber` validation
- `registrationOffice` validation
- `consultantRegistrationVolume` validation
- `consultantRegistrationNumber` validation
- `consultantRegistrationDate` validation (مثلاً بررسی فرمت تاریخ)
- `legalExpertName` validation
- `consultantFee` validation (مثلاً بررسی منفی نبودن)
- `contractCopies` validation (مثلاً بررسی حداقل 1 بودن)

---

## 3. تغییرات در API Endpoints

### 3.1. Endpoints تحت تأثیر:
1. `POST /api/contracts` - ایجاد قرارداد کامل
2. `PUT /api/contracts/:id` - به‌روزرسانی قرارداد
3. `POST /api/contracts/:id/draft` - ذخیره پیش‌نویس
4. `GET /api/contracts/:id` - دریافت قرارداد (باید فیلدهای حذف شده را برنگرداند)

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
export interface Contract {
  // ... سایر فیلدها
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
}

// بعد
export interface Contract {
  // ... سایر فیلدها
  registrationArea?: string;
  witness1Name?: string;
  witness2Name?: string;
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
- [ ] تست ذخیره پیش‌نویس بدون فیلدهای حذف شده
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
| `consultancyNumber` | string | حذف | شماره مشاوره املاک |
| `registrationOffice` | string | حذف | دفتر ثبت |
| `consultantRegistrationVolume` | string | حذف | جلد ثبت مشاور |
| `consultantRegistrationNumber` | string | حذف | شماره ثبت مشاور |
| `consultantRegistrationDate` | string (date) | حذف | تاریخ ثبت مشاور |
| `consultantFee` | number | حذف | حق الزحمه مشاور (ریال) |
| `legalExpertName` | string | حذف | نام کارشناس حقوقی |
| `contractCopies` | number | حذف | تعداد نسخ قرارداد |
| `registrationArea` | string | باقی می‌ماند | حوزه ثبتي |
| `witness1Name` | string | باقی می‌ماند | نام شاهد 1 |
| `witness2Name` | string | باقی می‌ماند | نام شاهد 2 |

---

## 8. فیلدهای باقی‌مانده در اطلاعات اداری

پس از حذف فیلدهای بالا، فقط این 3 فیلد در بخش اطلاعات اداری باقی می‌مانند:

1. **`registrationArea`** (حوزه ثبتي)
   - نوع: string
   - توضیحات: حوزه ثبتي قرارداد

2. **`witness1Name`** (نام شاهد 1)
   - نوع: string
   - توضیحات: نام شاهد اول

3. **`witness2Name`** (نام شاهد 2)
   - نوع: string
   - توضیحات: نام شاهد دوم

---

## 9. تاریخچه تغییرات
- تاریخ: [تاریخ امروز]
- نسخه: 1.0.0
- توضیحات: حذف 8 فیلد از اطلاعات اداری قرارداد، باقی ماندن 3 فیلد

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

---

## 11. جزئیات فنی

### 11.1. نام ستون‌های دیتابیس (برای Migration):
- `consultancy_number` → حذف
- `registration_office` → حذف
- `consultant_registration_volume` → حذف
- `consultant_registration_number` → حذف
- `consultant_registration_date` → حذف
- `legal_expert_name` → حذف
- `consultant_fee` → حذف
- `contract_copies` → حذف

### 11.2. فیلدهای باقی‌مانده:
- `registration_area` → باقی می‌ماند
- `witness1_name` → باقی می‌ماند
- `witness2_name` → باقی می‌ماند

---

## 12. مثال Migration (PostgreSQL)

```sql
-- Migration Up
ALTER TABLE contracts 
  DROP COLUMN IF EXISTS consultancy_number,
  DROP COLUMN IF EXISTS registration_office,
  DROP COLUMN IF EXISTS consultant_registration_volume,
  DROP COLUMN IF EXISTS consultant_registration_number,
  DROP COLUMN IF EXISTS consultant_registration_date,
  DROP COLUMN IF EXISTS legal_expert_name,
  DROP COLUMN IF EXISTS consultant_fee,
  DROP COLUMN IF EXISTS contract_copies;

-- Migration Down (Rollback)
ALTER TABLE contracts 
  ADD COLUMN consultancy_number VARCHAR(255),
  ADD COLUMN registration_office VARCHAR(255),
  ADD COLUMN consultant_registration_volume VARCHAR(255),
  ADD COLUMN consultant_registration_number VARCHAR(255),
  ADD COLUMN consultant_registration_date DATE,
  ADD COLUMN legal_expert_name VARCHAR(255),
  ADD COLUMN consultant_fee BIGINT,
  ADD COLUMN contract_copies INTEGER DEFAULT 3;
```

---

## 13. مثال Migration (MySQL)

```sql
-- Migration Up
ALTER TABLE contracts 
  DROP COLUMN consultancy_number,
  DROP COLUMN registration_office,
  DROP COLUMN consultant_registration_volume,
  DROP COLUMN consultant_registration_number,
  DROP COLUMN consultant_registration_date,
  DROP COLUMN legal_expert_name,
  DROP COLUMN consultant_fee,
  DROP COLUMN contract_copies;

-- Migration Down (Rollback)
ALTER TABLE contracts 
  ADD COLUMN consultancy_number VARCHAR(255),
  ADD COLUMN registration_office VARCHAR(255),
  ADD COLUMN consultant_registration_volume VARCHAR(255),
  ADD COLUMN consultant_registration_number VARCHAR(255),
  ADD COLUMN consultant_registration_date DATE,
  ADD COLUMN legal_expert_name VARCHAR(255),
  ADD COLUMN consultant_fee BIGINT,
  ADD COLUMN contract_copies INT DEFAULT 3;
```



