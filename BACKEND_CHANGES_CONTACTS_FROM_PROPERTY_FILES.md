# تغییرات بکند: افزودن مخاطب به دفترچه تلفن از فایل‌های ملکی

## خلاصه تغییرات

این سند شامل تغییرات مورد نیاز در بکند برای پشتیبانی از افزودن خودکار مخاطبین به دفترچه تلفن از صفحات ایجاد و ویرایش فایل‌های ملکی است.

## 1. بررسی API موجود

### 1.1. Endpoint ایجاد مخاطب
```
POST /contacts
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "address": "string (optional)",
  "isEstateContact": boolean,
  "estateId": "string (optional, required if isEstateContact is true)"
}
```

**Response:**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "address": "string | null",
  "isEstateContact": boolean,
  "estate": {
    "id": "string",
    "establishmentName": "string"
  },
  "owner": {
    "id": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 1.2. بررسی نیازمندی‌ها

API موجود برای ایجاد مخاطب کافی است و نیازی به تغییر ندارد. فقط باید مطمئن شویم که:
- Validation برای `phoneNumber` وجود دارد
- اگر `isEstateContact` برابر `true` باشد، `estateId` الزامی است
- اگر `isEstateContact` برابر `false` باشد، `estateId` نباید ارسال شود

## 2. منطق کسب و کار

### 2.1. استخراج نام و نام خانوادگی

از فیلد `owner` در فایل ملکی باید نام و نام خانوادگی استخراج شود:
- اگر `owner` فقط یک کلمه باشد: `firstName = owner`, `lastName = ''`
- اگر `owner` چند کلمه باشد: `firstName = اولین کلمه`, `lastName = بقیه کلمات`

**مثال:**
```
owner = "علی احمدی" → firstName = "علی", lastName = "احمدی"
owner = "محمد" → firstName = "محمد", lastName = ""
owner = "سید حسین موسوی" → firstName = "سید", lastName = "حسین موسوی"
```

### 2.2. تعیین نوع مخاطب

- اگر `zone` فایل ملکی برابر `OFFICE_MASTER` باشد:
  - `isEstateContact = true`
  - `estateId` باید از کاربر فعلی (authenticated user) گرفته شود
- در غیر این صورت:
  - `isEstateContact = false`
  - `estateId` نباید ارسال شود

### 2.3. فیلدهای مورد نیاز

برای ایجاد مخاطب از فایل ملکی، فیلدهای زیر مورد نیاز است:
- `owner`: نام مالک (برای استخراج firstName و lastName)
- `phone`: شماره تماس (برای phoneNumber)
- `address`: آدرس ملک (برای address مخاطب - اختیاری)
- `zone`: نوع زونکن (برای تعیین isEstateContact)

## 3. Validation

### 3.1. Validation در Frontend

قبل از ارسال درخواست ایجاد مخاطب، باید بررسی شود:
- `owner` نباید خالی باشد
- `phone` نباید خالی باشد
- `phone` باید فرمت معتبر داشته باشد (validation موجود در frontend)

### 3.2. Validation در Backend

در endpoint `POST /contacts` باید validation زیر انجام شود:
- `firstName`: الزامی، حداقل 1 کاراکتر
- `lastName`: اختیاری
- `phoneNumber`: الزامی، باید فرمت معتبر داشته باشد
- `address`: اختیاری
- `isEstateContact`: boolean، پیش‌فرض `false`
- اگر `isEstateContact = true`:
  - `estateId` الزامی است
  - کاربر باید به این estate دسترسی داشته باشد
- اگر `isEstateContact = false`:
  - `estateId` نباید ارسال شود یا باید `null` باشد

## 4. مدیریت خطا

### 4.1. خطاهای ممکن

1. **خطا در ایجاد مخاطب:**
   - اگر شماره تلفن تکراری باشد
   - اگر estateId نامعتبر باشد
   - اگر validation fail شود

### 4.2. رفتار مورد انتظار

- اگر ایجاد فایل ملکی موفق باشد اما ایجاد مخاطب fail شود:
  - فایل ملکی باید ایجاد شود
  - خطای ایجاد مخاطب باید به frontend برگردانده شود
  - Frontend باید پیام مناسب نمایش دهد

## 5. مثال‌های استفاده

### 5.1. ایجاد فایل ملکی با افزودن به دفترچه تلفن

**Request:**
```json
POST /property-files
{
  "zone": "OFFICE_MASTER",
  "owner": "علی احمدی",
  "phone": "09123456789",
  "address": "تهران، خیابان ولیعصر",
  "region": "منطقه 1",
  "date": "1403/01/01",
  "transactionType": "SALE",
  "buildingType": "APARTMENT",
  ...
}
```

**Frontend Logic:**
```typescript
// بعد از ایجاد موفق فایل ملکی
if (addToContacts && owner && phone) {
  const { firstName, lastName } = extractNameParts(owner);
  const isEstateContact = zone === PropertyFileZone.OFFICE_MASTER;
  
  const contactData = {
    firstName: firstName || 'بدون نام',
    lastName: lastName || '',
    phoneNumber: phone,
    address: address || undefined,
    isEstateContact,
    ...(isEstateContact && currentUser?.estateId ? { estateId: currentUser.estateId } : {}),
  };

  await createContact(contactData);
}
```

**Expected Contact:**
```json
{
  "firstName": "علی",
  "lastName": "احمدی",
  "phoneNumber": "09123456789",
  "address": "تهران، خیابان ولیعصر",
  "isEstateContact": true,
  "estateId": "estate-id-from-current-user"
}
```

### 5.2. ایجاد فایل ملکی با نوع PERSONAL

**Request:**
```json
POST /property-files
{
  "zone": "PERSONAL",
  "owner": "محمد رضایی",
  "phone": "09187654321",
  "address": "اصفهان، خیابان چهارباغ",
  ...
}
```

**Expected Contact:**
```json
{
  "firstName": "محمد",
  "lastName": "رضایی",
  "phoneNumber": "09187654321",
  "address": "اصفهان، خیابان چهارباغ",
  "isEstateContact": false
}
```

## 6. تست‌های مورد نیاز

### 6.1. تست‌های Unit

1. **استخراج نام و نام خانوادگی:**
   - تست با یک کلمه
   - تست با دو کلمه
   - تست با چند کلمه
   - تست با فاصله‌های اضافی

2. **تعیین نوع مخاطب:**
   - تست با `OFFICE_MASTER` → باید `isEstateContact = true`
   - تست با `PERSONAL` → باید `isEstateContact = false`
   - تست با `INTERNAL_COOPERATION` → باید `isEstateContact = false`
   - تست با `EXTERNAL_NETWORK` → باید `isEstateContact = false`

### 6.2. تست‌های Integration

1. **ایجاد فایل ملکی + مخاطب:**
   - ایجاد فایل با `OFFICE_MASTER`
   - بررسی ایجاد مخاطب با `isEstateContact = true`
   - بررسی `estateId` در مخاطب

2. **ایجاد فایل ملکی + مخاطب (PERSONAL):**
   - ایجاد فایل با `PERSONAL`
   - بررسی ایجاد مخاطب با `isEstateContact = false`
   - بررسی عدم وجود `estateId` در مخاطب

3. **خطا در ایجاد مخاطب:**
   - ایجاد فایل با شماره تلفن تکراری
   - بررسی ایجاد موفق فایل
   - بررسی خطای ایجاد مخاطب

## 7. نکات پیاده‌سازی

### 7.1. در Frontend

- استفاده از تابع helper `extractNameParts` برای استخراج نام
- بررسی وجود `owner` و `phone` قبل از نمایش checkbox
- نمایش checkbox فقط در صورت وجود هر دو فیلد
- نمایش "(مخاطب املاک)" در صورت `zone === OFFICE_MASTER`
- مدیریت خطا: عدم لغو عملیات اصلی در صورت خطای ایجاد مخاطب

### 7.2. در Backend

- Validation کامل در DTO
- بررسی دسترسی کاربر به estate در صورت `isEstateContact = true`
- مدیریت خطا: عدم تأثیر خطای ایجاد مخاطب بر ایجاد فایل ملکی
- Logging مناسب برای debugging

## 8. تغییرات اعمال شده در Backend

### 8.1. به‌روزرسانی CreateContactDto ✅

**فایل:** `src/contacts/dto/create-contact.dto.ts`

```typescript
export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'نام باید حداقل 1 کاراکتر باشد' })
  @ApiProperty({ description: 'نام مخاطب', example: 'علی' })
  firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'نام خانوادگی مخاطب', example: 'احمدی', required: false })
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^09\d{9}$/, { message: 'شماره تلفن باید با 09 شروع شود و 11 رقم باشد' })
  @ApiProperty({ description: 'شماره تلفن مخاطب', example: '09123456789' })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'آدرس مخاطب', example: 'تهران، خیابان ولیعصر', required: false })
  address?: string;

  @IsBoolean()
  @IsOptional()
  @Default(false)
  @ApiProperty({ description: 'آیا مخاطب املاک است؟', example: false, default: false })
  isEstateContact?: boolean;

  @IsUUID()
  @ValidateIf(o => o.isEstateContact === true)
  @IsNotEmpty({ message: 'شناسه آژانس برای مخاطب املاک الزامی است' })
  @ApiProperty({ 
    description: 'شناسه آژانس (فقط برای مخاطبین املاک)', 
    example: 'uuid-of-estate',
    required: false 
  })
  estateId?: string;
}
```

**تغییرات اعمال شده:**
- ✅ افزودن `@MinLength(1)` برای `firstName`
- ✅ افزودن `@ValidateIf` برای `estateId` (الزامی اگر `isEstateContact = true`)
- ✅ بهبود پیام‌های validation
- ✅ بهبود مستندات Swagger

### 8.2. به‌روزرسانی ContactsService ✅

**فایل:** `src/contacts/contacts.service.ts`

```typescript
async create(createContactDto: CreateContactDto, userId: string, userRole: UserRole): Promise<Contact> {
  this.logger.log(`Creating contact for user ${userId}, isEstateContact: ${createContactDto.isEstateContact}`);

  // بررسی دسترسی: فقط ADMIN می‌تواند مخاطب املاک ایجاد کند
  if (createContactDto.isEstateContact && userRole !== UserRole.ADMIN) {
    this.logger.warn(`User ${userId} with role ${userRole} tried to create estate contact`);
    throw new ForbiddenException('فقط مدیر می‌تواند مخاطب املاک ایجاد کند');
  }

  // بررسی estateId برای مخاطبین املاک
  if (createContactDto.isEstateContact) {
    if (!createContactDto.estateId) {
      throw new BadRequestException('شناسه آژانس برای مخاطب املاک الزامی است');
    }

    // بررسی دسترسی ADMIN به estate
    const user = await this.usersService.findOne(userId);
    if (user.estateId !== createContactDto.estateId) {
      this.logger.warn(`User ${userId} tried to create contact for estate ${createContactDto.estateId}`);
      throw new ForbiddenException('شما فقط می‌توانید برای آژانس خود مخاطب ایجاد کنید');
    }

    // بررسی وجود estate
    const estate = await this.estatesService.findOne(createContactDto.estateId);
    if (!estate) {
      throw new NotFoundException('آژانس یافت نشد');
    }
  }

  // حذف estateId اگر مخاطب شخصی است
  if (!createContactDto.isEstateContact && createContactDto.estateId) {
    delete createContactDto.estateId;
  }

  // بررسی تکراری نبودن شماره تلفن
  const whereCondition: any = { phoneNumber: createContactDto.phoneNumber };
  
  if (createContactDto.isEstateContact) {
    // برای مخاطبین املاک: بررسی در همان estate
    whereCondition.estate = { id: createContactDto.estateId };
    whereCondition.isEstateContact = true;
  } else {
    // برای مخاطبین شخصی: بررسی در مخاطبین شخصی همان کاربر
    whereCondition.owner = { id: userId };
    whereCondition.isEstateContact = false;
  }

  const existingContact = await this.contactRepository.findOne({
    where: whereCondition,
    relations: ['estate', 'owner'],
  });

  if (existingContact) {
    this.logger.warn(`Duplicate phone number: ${createContactDto.phoneNumber}`);
    throw new ConflictException('شماره تلفن تکراری است');
  }

  // ایجاد مخاطب
  const contact = this.contactRepository.create({
    ...createContactDto,
    owner: { id: userId },
    ...(createContactDto.isEstateContact && createContactDto.estateId
      ? { estate: { id: createContactDto.estateId } }
      : {}),
  });

  const savedContact = await this.contactRepository.save(contact);
  this.logger.log(`Contact created successfully: ${savedContact.id}`);
  
  return savedContact;
}
```

**تغییرات اعمال شده:**
- ✅ بررسی تکراری بودن شماره تلفن:
  - برای مخاطبین املاک: بررسی در همان estate
  - برای مخاطبین شخصی: بررسی در مخاطبین شخصی همان کاربر
- ✅ مدیریت `estateId`:
  - اگر `isEstateContact = false` باشد، `estateId` حذف می‌شود
- ✅ بررسی دسترسی:
  - فقط ADMIN می‌تواند مخاطب املاک ایجاد کند
  - ADMIN فقط می‌تواند برای آژانس خود مخاطب ایجاد کند
- ✅ افزودن Logging برای debugging

### 8.3. به‌روزرسانی ContactsController ✅

**فایل:** `src/contacts/contacts.controller.ts`

```typescript
@Post()
@UseGuards(JwtAuthGuard)
@ApiOperation({ 
  summary: 'ایجاد مخاطب جدید',
  description: 'ایجاد مخاطب جدید. فقط ADMIN می‌تواند مخاطب املاک ایجاد کند.'
})
@ApiBody({ type: CreateContactDto })
@ApiResponse({ 
  status: 201, 
  description: 'مخاطب با موفقیت ایجاد شد', 
  type: Contact 
})
@ApiResponse({ 
  status: 400, 
  description: 'داده‌های ورودی نامعتبر' 
})
@ApiResponse({ 
  status: 403, 
  description: 'دسترسی غیرمجاز' 
})
@ApiResponse({ 
  status: 404, 
  description: 'آژانس یافت نشد' 
})
@ApiResponse({ 
  status: 409, 
  description: 'شماره تلفن تکراری است' 
})
async create(
  @Body() createContactDto: CreateContactDto,
  @Request() req,
): Promise<Contact> {
  return this.contactsService.create(createContactDto, req.user.id, req.user.role);
}
```

**تغییرات اعمال شده:**
- ✅ بهبود مستندات Swagger
- ✅ افزودن response codes:
  - 400: داده‌های ورودی نامعتبر
  - 403: دسترسی غیرمجاز
  - 404: آژانس یافت نشد
  - 409: شماره تلفن تکراری است

## 9. مستندات API

### 9.1. Swagger Documentation ✅

مستندات Swagger به‌روزرسانی شده و شامل تمام response codes و توضیحات کامل است.

### 9.2. نحوه استفاده

#### مثال 1: ایجاد مخاطب املاک

```http
POST /contacts
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "علی",
  "lastName": "احمدی",
  "phoneNumber": "09123456789",
  "address": "تهران، خیابان ولیعصر",
  "isEstateContact": true,
  "estateId": "uuid-of-estate"
}
```

**Response (201 Created):**
```json
{
  "id": "contact-uuid",
  "firstName": "علی",
  "lastName": "احمدی",
  "phoneNumber": "09123456789",
  "address": "تهران، خیابان ولیعصر",
  "isEstateContact": true,
  "estate": {
    "id": "uuid-of-estate",
    "establishmentName": "نام آژانس"
  },
  "owner": {
    "id": "user-uuid",
    "firstName": "نام کاربر",
    "lastName": "نام خانوادگی کاربر"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### مثال 2: ایجاد مخاطب شخصی

```http
POST /contacts
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "محمد",
  "lastName": "رضایی",
  "phoneNumber": "09187654321",
  "address": "اصفهان، خیابان چهارباغ",
  "isEstateContact": false
}
```

**نکته:** در این حالت `estateId` نباید ارسال شود.

#### مثال 3: استفاده از Helper Function

```typescript
import { extractNameParts } from './contacts/utils/name-extractor.util';

const { firstName, lastName } = extractNameParts("علی احمدی");
// firstName: "علی", lastName: "احمدی"

const { firstName: f1, lastName: l1 } = extractNameParts("محمد");
// f1: "محمد", l1: ""

const { firstName: f2, lastName: l2 } = extractNameParts("سید حسین موسوی");
// f2: "سید", l2: "حسین موسوی"
```

## 10. Validation Rules ✅

### 10.1. قوانین اعتبارسنجی

- **firstName**: الزامی، حداقل 1 کاراکتر
- **lastName**: اختیاری
- **phoneNumber**: الزامی، فرمت ایرانی (09xxxxxxxxx)
- **address**: اختیاری
- **isEstateContact**: اختیاری، پیش‌فرض `false`
- **estateId**:
  - اگر `isEstateContact = true`: الزامی
  - اگر `isEstateContact = false`: نباید ارسال شود

### 10.2. قوانین دسترسی

- فقط **ADMIN** می‌تواند مخاطب املاک ایجاد کند
- **ADMIN** فقط می‌تواند برای آژانس خود مخاطب ایجاد کند
- همه کاربران می‌توانند مخاطب شخصی ایجاد کنند

### 10.3. قوانین تکراری بودن

- برای مخاطبین املاک: بررسی تکراری بودن در همان estate
- برای مخاطبین شخصی: بررسی تکراری بودن در مخاطبین شخصی همان کاربر

## 11. Error Handling ✅

### 11.1. کدهای خطا

| کد | توضیح | پیام |
|---|---|---|
| 400 | داده‌های ورودی نامعتبر | "داده‌های ورودی نامعتبر" |
| 403 | دسترسی غیرمجاز | "فقط مدیر می‌تواند مخاطب املاک ایجاد کند" یا "شما فقط می‌توانید برای آژانس خود مخاطب ایجاد کنید" |
| 404 | آژانس یافت نشد | "آژانس یافت نشد" |
| 409 | شماره تلفن تکراری است | "شماره تلفن تکراری است" |

### 11.2. مثال‌های خطا

**خطای شماره تلفن تکراری:**
```json
{
  "statusCode": 409,
  "message": "شماره تلفن تکراری است",
  "error": "Conflict"
}
```

**خطای دسترسی غیرمجاز:**
```json
{
  "statusCode": 403,
  "message": "فقط مدیر می‌تواند مخاطب املاک ایجاد کند",
  "error": "Forbidden"
}
```

**خطای estateId نامعتبر:**
```json
{
  "statusCode": 404,
  "message": "آژانس یافت نشد",
  "error": "Not Found"
}
```

## 12. چک‌لیست پیاده‌سازی

- [x] بررسی و به‌روزرسانی `CreateContactDto` با validation مناسب ✅
- [x] بررسی منطق Service برای مدیریت `isEstateContact` و `estateId` ✅
- [x] بررسی دسترسی کاربر به estate ✅
- [x] بررسی تکراری نبودن شماره تلفن ✅
- [x] اضافه کردن logging مناسب ✅
- [x] به‌روزرسانی مستندات Swagger ✅
- [x] بررسی error handling ✅
- [x] ایجاد Helper Function ✅
- [x] ایجاد Migration برای Performance ✅
- [ ] نوشتن تست‌های unit برای Service
- [ ] نوشتن تست‌های integration

## 13. نکات مهم ✅

### 13.1. امنیت

- ✅ بررسی دسترسی کاربر به estate
- ✅ جلوگیری از ایجاد مخاطب با estateId دیگران
- ✅ فقط ADMIN می‌تواند مخاطب املاک ایجاد کند
- ✅ ADMIN فقط می‌تواند برای آژانس خود مخاطب ایجاد کند

### 13.2. Performance

- ✅ بررسی تکراری بودن شماره تلفن با index مناسب انجام می‌شود
- ✅ استفاده از composite indexes برای بهبود performance
- ✅ استفاده از transaction در صورت نیاز

### 13.3. Error Handling

- ✅ خطاهای واضح و قابل فهم
- ✅ عدم تأثیر خطای ایجاد مخاطب بر ایجاد فایل ملکی
- ✅ کدهای خطای مناسب (400, 403, 404, 409)

### 13.4. Logging

- ✅ لاگ کردن عملیات ایجاد مخاطب
- ✅ لاگ کردن خطاها برای debugging
- ✅ لاگ کردن تلاش‌های غیرمجاز

### 13.5. نکات اضافی

- ✅ بررسی تکراری بودن شماره تلفن به‌صورت جداگانه برای مخاطبین املاک و شخصی انجام می‌شود
- ✅ اگر `isEstateContact = false` باشد، `estateId` به‌صورت خودکار حذف می‌شود
- ✅ Helper Function برای استخراج نام در backend نیز موجود است

## 12. مثال کد کامل برای Backend

### 8.4. ایجاد Helper Function ✅

**فایل:** `src/contacts/utils/name-extractor.util.ts`

```typescript
/**
 * استخراج نام و نام خانوادگی از رشته owner
 * @param owner - رشته حاوی نام مالک
 * @returns شیء شامل firstName و lastName
 * 
 * @example
 * extractNameParts("علی احمدی") // { firstName: "علی", lastName: "احمدی" }
 * extractNameParts("محمد") // { firstName: "محمد", lastName: "" }
 * extractNameParts("سید حسین موسوی") // { firstName: "سید", lastName: "حسین موسوی" }
 */
export function extractNameParts(owner: string): { firstName: string; lastName: string } {
  const trimmed = owner.trim();
  const parts = trimmed.split(/\s+/);
  
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  
  return { firstName, lastName };
}
```

**تغییرات اعمال شده:**
- ✅ ایجاد `extractNameParts` در `src/contacts/utils/name-extractor.util.ts`
- ✅ قابل استفاده در frontend یا backend
- ✅ پشتیبانی از نام‌های یک یا چند کلمه‌ای
- ✅ مستندات کامل با JSDoc

### 8.5. Migration برای Performance ✅

**فایل:** `migrations/add-phone-index-to-contacts.sql`

```sql
-- افزودن index روی phone_number برای بهبود performance
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number);

-- افزودن composite index برای بررسی تکراری بودن در estate
CREATE INDEX IF NOT EXISTS idx_contacts_phone_estate ON contacts(phone_number, estate_id) 
WHERE is_estate_contact = true;

-- افزودن composite index برای بررسی تکراری بودن در owner
CREATE INDEX IF NOT EXISTS idx_contacts_phone_owner ON contacts(phone_number, owner_id) 
WHERE is_estate_contact = false;
```

**اجرای Migration:**
```bash
psql -U postgres -d amlakyar -f migrations/add-phone-index-to-contacts.sql
```

**تغییرات اعمال شده:**
- ✅ ایجاد migration برای افزودن index روی `phone_number`
- ✅ افزودن composite indexes برای بررسی تکراری بودن

## 14. نتیجه‌گیری

### 14.1. تغییرات اعمال شده ✅

تمام تغییرات مورد نیاز در backend اعمال شده است:

1. ✅ **Validation**: به‌روزرسانی `CreateContactDto` با validation مناسب
2. ✅ **Service Logic**: بهبود منطق Service برای مدیریت `isEstateContact` و `estateId`
3. ✅ **دسترسی**: بررسی دسترسی کاربر به estate و نقش کاربر
4. ✅ **تکراری بودن**: بررسی تکراری بودن شماره تلفن به‌صورت جداگانه برای مخاطبین املاک و شخصی
5. ✅ **Error Handling**: مدیریت خطاها با کدهای مناسب
6. ✅ **Logging**: افزودن logging برای debugging
7. ✅ **Performance**: ایجاد indexes برای بهبود performance
8. ✅ **مستندات**: به‌روزرسانی مستندات Swagger
9. ✅ **Helper Function**: ایجاد تابع helper برای استخراج نام

### 14.2. نحوه استفاده

Frontend تمام منطق استخراج نام و تعیین نوع مخاطب را انجام می‌دهد و فقط درخواست ایجاد مخاطب را به backend ارسال می‌کند. Backend تمام validation، بررسی دسترسی و بررسی تکراری بودن را انجام می‌دهد.

### 14.3. نکات نهایی

- فقط ADMIN می‌تواند مخاطب املاک ایجاد کند
- ADMIN فقط می‌تواند برای آژانس خود مخاطب ایجاد کند
- بررسی تکراری بودن شماره تلفن به‌صورت جداگانه برای مخاطبین املاک و شخصی انجام می‌شود
- اگر `isEstateContact = false` باشد، `estateId` به‌صورت خودکار حذف می‌شود
- Migration برای بهبود performance باید اجرا شود

