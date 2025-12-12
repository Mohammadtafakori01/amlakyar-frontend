# تغییرات مورد نیاز در بک‌اند

## خلاصه تغییرات
این سند شامل تمام تغییراتی است که باید در بک‌اند برای هماهنگی با تغییرات فرانت‌اند انجام شود.

---

## 1. حذف فیلدها از مدل ContractTerms

### فیلدهای حذف شده:
- `evictionNoticeDays` (مهلت اخطار تخلیه - روز)
- `dailyPenaltyAmount` (جریمه روزانه - ریال)

### اقدامات مورد نیاز:
1. **حذف از Entity/Model:**
   - حذف فیلد `evictionNoticeDays` از مدل `ContractTerms`
   - حذف فیلد `dailyPenaltyAmount` از مدل `ContractTerms`

2. **Migration Database:**
   - ایجاد migration برای حذف ستون‌های `eviction_notice_days` و `daily_penalty_amount` از جدول `contract_terms`
   - توجه: اگر داده‌های موجودی وجود دارد، تصمیم بگیرید که آیا باید نگه داشته شوند یا حذف شوند

3. **حذف از DTOs:**
   - حذف از `CreateContractTermsDTO`
   - حذف از `UpdateContractTermsDTO`
   - حذف از `ContractTermsResponseDTO`

4. **حذف از Validation:**
   - حذف validation rules برای `evictionNoticeDays`
   - حذف validation rules برای `dailyPenaltyAmount`

---

## 2. تغییر نام فیلدها (فقط نمایش - نام فیلد در دیتابیس تغییر نمی‌کند)

### فیلدهای با تغییر نام نمایشی:
1. **`dailyDelayPenalty`** 
   - نام قبلی نمایشی: "جریمه تاخیر روزانه (ریال)"
   - نام جدید نمایشی: "جریمه تاخیر در پرداخت قرض الحسنه"
   - **توجه:** نام فیلد در دیتابیس و API تغییر نمی‌کند، فقط برچسب نمایشی در فرانت‌اند تغییر کرده است

2. **`dailyOccupancyPenalty`**
   - نام قبلی نمایشی: "جریمه تصرف روزانه (ریال)"
   - نام جدید نمایشی: "اجرت المثل ایام تصرف"
   - **توجه:** نام فیلد در دیتابیس و API تغییر نمی‌کند

3. **`customTerms`**
   - نام قبلی نمایشی: "شرایط خاص"
   - نام جدید نمایشی: "توضیحات"
   - **توجه:** نام فیلد در دیتابیس و API تغییر نمی‌کند

4. **`usagePurpose`**
   - نام قبلی نمایشی: "هدف استفاده"
   - نام جدید نمایشی: "کاربری"
   - **توجه:** نام فیلد در دیتابیس و API تغییر نمی‌کند

---

## 3. تغییر رفتار فیلد `usagePurpose`

### تغییرات:
- قبلاً: فیلد متنی آزاد بود
- حالا: یک select با 4 گزینه:
  - `مسکونی`
  - `اداری`
  - `تجاری`
  - `سایر` (که اجازه ورود دستی می‌دهد)

### اقدامات مورد نیاز در بک‌اند:

#### گزینه 1: بدون تغییر (پیشنهادی)
- **هیچ تغییری لازم نیست** - بک‌اند همچنان می‌تواند هر رشته متنی را بپذیرد
- فرانت‌اند فقط UI را محدود کرده است اما هنوز می‌تواند مقادیر دلخواه ارسال کند

#### گزینه 2: اضافه کردن Validation (اختیاری)
اگر می‌خواهید validation اضافه کنید:
```typescript
// در DTO validation
@IsOptional()
@IsIn(['مسکونی', 'اداری', 'تجاری'], { message: 'کاربری باید یکی از مقادیر مجاز باشد' })
usagePurpose?: string;
```

**توجه:** این validation اختیاری است و فقط برای اطمینان بیشتر است. اگر می‌خواهید کاربران بتوانند مقادیر دلخواه وارد کنند (گزینه "سایر")، این validation را اضافه نکنید.

---

## 4. تغییرات در API Endpoints

### Endpoints تحت تأثیر:
1. `POST /api/contracts/:id/terms` - ایجاد شرایط قرارداد
2. `PUT /api/contracts/:id/terms` - به‌روزرسانی شرایط قرارداد
3. `GET /api/contracts/:id` - دریافت قرارداد (باید فیلدهای حذف شده را برنگرداند)

### تغییرات مورد نیاز:
1. **حذف از Request Body:**
   - `evictionNoticeDays` دیگر پذیرفته نمی‌شود
   - `dailyPenaltyAmount` دیگر پذیرفته نمی‌شود

2. **حذف از Response:**
   - این فیلدها نباید در response برگردانده شوند

3. **Validation:**
   - اگر این فیلدها در request ارسال شوند، باید نادیده گرفته شوند یا خطا برگردانند (بسته به استراتژی شما)

---

## 5. Migration Script (مثال برای TypeORM)

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveContractTermsFields1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // حذف ستون eviction_notice_days
    await queryRunner.dropColumn('contract_terms', 'eviction_notice_days');
    
    // حذف ستون daily_penalty_amount
    await queryRunner.dropColumn('contract_terms', 'daily_penalty_amount');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // برگرداندن ستون‌ها در صورت rollback
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'eviction_notice_days',
      type: 'integer',
      isNullable: true,
    }));
    
    await queryRunner.addColumn('contract_terms', new TableColumn({
      name: 'daily_penalty_amount',
      type: 'bigint',
      isNullable: true,
    }));
  }
}
```

---

## 6. تغییرات در TypeScript Types (اگر در بک‌اند استفاده می‌شود)

```typescript
// قبل
export interface ContractTerms {
  evictionNoticeDays?: number;
  dailyPenaltyAmount?: number;
  dailyDelayPenalty?: number;
  dailyOccupancyPenalty?: number;
  // ...
}

// بعد
export interface ContractTerms {
  // evictionNoticeDays حذف شد
  // dailyPenaltyAmount حذف شد
  dailyDelayPenalty?: number;
  dailyOccupancyPenalty?: number;
  // ...
}
```

---

## 7. تست‌های مورد نیاز

### Unit Tests:
- [ ] تست حذف فیلدها از DTO
- [ ] تست validation برای فیلدهای باقی‌مانده
- [ ] تست migration

### Integration Tests:
- [ ] تست ایجاد قرارداد بدون فیلدهای حذف شده
- [ ] تست به‌روزرسانی قرارداد بدون فیلدهای حذف شده
- [ ] تست دریافت قرارداد (بررسی عدم وجود فیلدهای حذف شده در response)

### Manual Tests:
- [ ] تست ارسال request با فیلدهای حذف شده (باید نادیده گرفته شوند یا خطا برگردانند)
- [ ] تست backward compatibility با داده‌های قدیمی

---

## 8. نکات مهم

1. **Backward Compatibility:**
   - اگر قراردادهای قدیمی با این فیلدها وجود دارند، تصمیم بگیرید:
     - آیا باید migration برای حذف داده‌های قدیمی اجرا شود؟
     - یا فقط فیلدها را nullable نگه دارید و دیگر استفاده نکنید؟

2. **API Versioning:**
   - اگر از API versioning استفاده می‌کنید، این تغییرات را در نسخه جدید API اعمال کنید

3. **Documentation:**
   - به‌روزرسانی مستندات API (Swagger/OpenAPI)
   - حذف فیلدها از مثال‌های API

---

## خلاصه تغییرات

| فیلد | عمل | توضیحات |
|------|-----|---------|
| `evictionNoticeDays` | حذف | حذف کامل از مدل، DTO، و دیتابیس |
| `dailyPenaltyAmount` | حذف | حذف کامل از مدل، DTO، و دیتابیس |
| `dailyDelayPenalty` | بدون تغییر | فقط نام نمایشی تغییر کرده (در فرانت‌اند) |
| `dailyOccupancyPenalty` | بدون تغییر | فقط نام نمایشی تغییر کرده (در فرانت‌اند) |
| `customTerms` | بدون تغییر | فقط نام نمایشی تغییر کرده (در فرانت‌اند) |
| `usagePurpose` | بدون تغییر | فقط UI تغییر کرده (select به جای input) |

---

## تاریخچه تغییرات
- تاریخ: [تاریخ امروز]
- نسخه: 1.0.0
- توضیحات: حذف فیلدهای evictionNoticeDays و dailyPenaltyAmount و تغییر نام‌های نمایشی


