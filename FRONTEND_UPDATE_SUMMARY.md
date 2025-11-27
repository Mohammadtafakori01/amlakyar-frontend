# خلاصه به‌روزرسانی‌های فرانت‌اند

## ✅ تغییرات انجام شده

### 1. Types و Interfaces
- ✅ اضافه شدن `PropertyFilePriority` enum (HIGH, MEDIUM, LOW)
- ✅ اضافه شدن `PropertyFileStatus` enum (ACTIVE, INACTIVE, PENDING)
- ✅ اضافه شدن فیلدهای جدید به `PropertyFile`:
  - `tags?: string[]`
  - `priority?: PropertyFilePriority`
  - `status?: PropertyFileStatus`
  - `expiryDate?: string`
  - `attachments?: string[]`
  - `deletedAt?: string`
- ✅ اضافه شدن فیلترهای پیشرفته به `PropertyFileFilters`:
  - `minPrice`, `maxPrice`
  - `minArea`, `maxArea`
  - `fromDate`, `toDate`
  - `region`
- ✅ اضافه شدن `BulkOperationRequest` interface
- ✅ اضافه شدن `PropertyFileAuditLog` interface
- ✅ اضافه شدن `PropertyFileStatistics` interface

### 2. API Services
- ✅ `restorePropertyFile(id)` - بازیابی فایل حذف شده
- ✅ `getDeletedPropertyFiles(filters?)` - دریافت فایل‌های حذف شده
- ✅ `getAuditLogs(id)` - دریافت تاریخچه تغییرات
- ✅ `bulkOperations(data)` - عملیات دسته‌ای
- ✅ `getStatistics()` - دریافت آمار
- ✅ به‌روزرسانی `getPropertyFiles` برای پشتیبانی از فیلترهای پیشرفته

### 3. Redux Store
- ✅ اضافه شدن `auditLogs` و `statistics` به state
- ✅ اضافه شدن async thunks:
  - `restorePropertyFile`
  - `fetchDeletedPropertyFiles`
  - `fetchAuditLogs`
  - `bulkOperations`
  - `fetchStatistics`
- ✅ اضافه شدن reducer `clearAuditLogs`

### 4. Hooks
- ✅ به‌روزرسانی `usePropertyFiles` با تمام actions جدید

---

## 🔄 نیاز به به‌روزرسانی در UI

### 1. صفحه لیست فایل‌ها (`pages/dashboard/property-files/index.tsx`)
**نیاز به اضافه کردن:**
- [ ] فیلترهای پیشرفته (محدوده قیمت، مساحت، تاریخ، منطقه)
- [ ] دکمه انتخاب چندتایی برای Bulk Operations
- [ ] دکمه نمایش آمار
- [ ] Tab برای فایل‌های حذف شده (فقط برای ADMIN)

### 2. صفحه جزئیات فایل (`pages/dashboard/property-files/[id].tsx`)
**نیاز به اضافه کردن:**
- [ ] Tab یا بخش برای نمایش Audit Logs
- [ ] نمایش فیلدهای جدید (tags, priority, status, expiryDate)
- [ ] دکمه بازیابی (برای فایل‌های حذف شده)

### 3. فرم ایجاد/ویرایش (`pages/dashboard/property-files/create.tsx` و `edit/[id].tsx`)
**نیاز به اضافه کردن:**
- [ ] فیلد tags (input با قابلیت افزودن چندتایی)
- [ ] فیلد priority (dropdown)
- [ ] فیلد status (dropdown)
- [ ] فیلد expiryDate (date picker)
- [ ] فیلد attachments (file upload - نیاز به API جداگانه)

### 4. صفحه جدید: آمار (`pages/dashboard/property-files/statistics.tsx`)
**نیاز به ایجاد:**
- [ ] نمایش آمار بر اساس zone
- [ ] نمایش آمار بر اساس نوع معامله
- [ ] نمایش آمار بر اساس نوع ساختمان
- [ ] نمایش میانگین قیمت
- [ ] نمایش تعداد فایل‌های اخیر
- [ ] نمودارها (Chart.js یا Recharts)

### 5. کامپوننت‌های جدید
**نیاز به ایجاد:**
- [ ] `BulkOperationsModal.tsx` - Modal برای عملیات دسته‌ای
- [ ] `AuditLogsView.tsx` - نمایش تاریخچه تغییرات
- [ ] `AdvancedFilters.tsx` - پنل فیلترهای پیشرفته
- [ ] `StatisticsCard.tsx` - کارت نمایش آمار

---

## 📝 نکات مهم

1. **فیلترهای پیشرفته:** باید در UI به صورت collapsible panel نمایش داده شوند
2. **Bulk Operations:** نیاز به checkbox در هر ردیف جدول برای انتخاب
3. **Audit Logs:** باید به صورت timeline یا جدول نمایش داده شود
4. **Statistics:** می‌تواند در dashboard اصلی یا صفحه جداگانه باشد
5. **File Upload:** برای attachments نیاز به API جداگانه است (مثلاً `/api/files/upload`)

---

## 🎯 اولویت پیاده‌سازی UI

### اولویت بالا
1. فیلترهای پیشرفته در صفحه لیست
2. نمایش Audit Logs در صفحه جزئیات
3. Bulk Operations (حذف و به‌اشتراک‌گذاری دسته‌ای)

### اولویت متوسط
4. فیلدهای جدید در فرم ایجاد/ویرایش
5. صفحه آمار
6. Tab فایل‌های حذف شده

### اولویت پایین
7. File Upload برای attachments
8. نمودارهای پیشرفته در آمار

