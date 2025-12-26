# تغییرات مورد نیاز در بکند برای Property Files

## تغییرات در CreatePropertyFileRequest

### فیلدهای جدید اضافه شده:

1. **hasServantRoom** (boolean, optional)
   - چک‌باکس برای وجود سرایداری
   - نوع: `boolean`
   - پیش‌فرض: `false`

2. **hasYard** (boolean, optional)
   - چک‌باکس برای وجود حیاط
   - نوع: `boolean`
   - پیش‌فرض: `false`

3. **hasPorch** (boolean, optional)
   - چک‌باکس برای وجود پاسیو
   - نوع: `boolean`
   - پیش‌فرض: `false`

### فیلدهای حذف شده (اختیاری - می‌توانند در صورت نیاز حذف شوند):

- `informationSource` - منبع اطلاعاتی (حذف شده از فرم)
- `ownerResidence` - محل سکونت مالک (حذف شده از فرم)

### تغییرات در فیلدهای موجود:

1. **facade** (string, optional)
   - قبلاً: فیلد متنی آزاد
   - حالا: باید یکی از مقادیر زیر باشد:
     - `"سنگی"`
     - `"آجر"`
     - `"کامپوزیت"`
     - `"سیمانی"`
     - `"نما ترکیبی"`
     - `"سایر"`
   - پیشنهاد: اضافه کردن enum یا validation برای این مقادیر

2. **documentStatus** (string, optional)
   - قبلاً: فیلد متنی آزاد
   - حالا: باید یکی از مقادیر زیر باشد:
     - `"شخصی"`
     - `"اوقاف"`
     - `"بنیاد"`
     - `"سایر"`
   - پیشنهاد: اضافه کردن enum یا validation برای این مقادیر

## مثال Request Body:

```json
{
  "zone": "OFFICE_MASTER",
  "owner": "نام مالک",
  "region": "منطقه",
  "address": "آدرس",
  "date": "1403/01/01",
  "transactionType": "SALE",
  "buildingType": "APARTMENT",
  "facade": "سنگی",
  "documentStatus": "شخصی",
  "hasServantRoom": true,
  "hasYard": false,
  "hasPorch": true,
  // ... سایر فیلدها
}
```

## توصیه‌ها:

1. **Enum برای Facade**: ایجاد enum برای facade:
   ```typescript
   enum FacadeType {
     STONE = 'سنگی',
     BRICK = 'آجر',
     COMPOSITE = 'کامپوزیت',
     CEMENT = 'سیمانی',
     MIXED = 'نما ترکیبی',
     OTHER = 'سایر'
   }
   ```

2. **Enum برای DocumentStatus**: ایجاد enum برای documentStatus:
   ```typescript
   enum DocumentStatus {
     PERSONAL = 'شخصی',
     ENDOWMENT = 'اوقاف',
     FOUNDATION = 'بنیاد',
     OTHER = 'سایر'
   }
   ```

3. **Validation**: اضافه کردن validation برای facade و documentStatus تا فقط مقادیر مجاز پذیرفته شوند.

4. **Migration**: در صورت نیاز، migration برای اضافه کردن فیلدهای جدید به دیتابیس:
   ```sql
   ALTER TABLE property_files 
   ADD COLUMN has_servant_room BOOLEAN DEFAULT FALSE,
   ADD COLUMN has_yard BOOLEAN DEFAULT FALSE,
   ADD COLUMN has_porch BOOLEAN DEFAULT FALSE;
   ```

5. **حذف فیلدهای قدیمی** (اختیاری):
   - اگر `informationSource` و `ownerResidence` دیگر استفاده نمی‌شوند، می‌توانند از schema حذف شوند.
   - یا می‌توانند به صورت optional باقی بمانند برای سازگاری با داده‌های قدیمی.

