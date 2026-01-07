# مستندات API اشتراک‌گذاری مراجعات

## خلاصه
این مستندات نحوه استفاده از API های جدید برای اشتراک‌گذاری مراجعات با مشاوران و سرپرستان را توضیح می‌دهد.

---

## احراز هویت (Authentication)

تمام endpoint های این API نیاز به احراز هویت دارند. برای دسترسی باید یک JWT Token معتبر در header درخواست ارسال کنید:

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. اشتراک‌گذاری مراجعه

### Endpoint
```
PATCH /client-logs/:id/share
```

### دسترسی
- ✅ **ADMIN** - می‌تواند مراجعات املاک خود را به اشتراک بگذارد
- ✅ **SECRETARY** - می‌تواند مراجعات املاک خود را به اشتراک بگذارد
- ❌ سایر نقش‌ها دسترسی ندارند

### توضیحات
این endpoint یک مراجعه را به صورت عمومی با مشاوران و سرپرستان به اشتراک می‌گذارد. پس از اشتراک‌گذاری، مراجعه در لیست مراجعات عمومی برای مشاوران و سرپرستان همان املاک قابل مشاهده خواهد بود.

### پارامترهای URL
| پارامتر | نوع | توضیحات | مثال |
|---------|-----|----------|------|
| `id` | UUID | شناسه یکتای مراجعه | `e642e963-dd40-49f9-8c11-db512237ee45` |

### Request Body
```json
{
  "isPublic": true
}
```

| فیلد | نوع | الزامی | توضیحات |
|------|-----|--------|----------|
| `isPublic` | boolean | بله | برای اشتراک‌گذاری باید `true` باشد |

### مثال Request
```bash
curl -X PATCH "http://localhost:3000/client-logs/e642e963-dd40-49f9-8c11-db512237ee45/share" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "isPublic": true
  }'
```

### Response موفق (200 OK)
```json
{
  "id": "e642e963-dd40-49f9-8c11-db512237ee45",
  "clientName": "علی احمدی",
  "phoneNumber": "09123456789",
  "propertyNeed": "آپارتمان 100 متری در منطقه شمال",
  "visitTime": "2024-01-15T14:30:00.000Z",
  "visitType": "PHONE",
  "isPublic": true,
  "estate": {
    "id": "estate-id-123",
    "establishmentName": "املاک نمونه",
    "guildId": "12345"
  },
  "createdBy": {
    "id": "user-id-456",
    "firstName": "محمد",
    "lastName": "رضایی",
    "phoneNumber": "09123456789"
  },
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### خطاهای ممکن

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "مراجعه‌ای با شناسه e642e963-dd40-49f9-8c11-db512237ee45 یافت نشد",
  "error": "Not Found"
}
```
**علت:** مراجعه با شناسه داده شده وجود ندارد.

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "فقط مدیر و منشی می‌توانند مراجعات را به اشتراک بگذارند",
  "error": "Forbidden"
}
```
**علت:** کاربر نقش مناسب (ADMIN یا SECRETARY) را ندارد.

```json
{
  "statusCode": 403,
  "message": "شما اجازه اشتراک‌گذاری این مراجعه را ندارید",
  "error": "Forbidden"
}
```
**علت:** مراجعه متعلق به املاک کاربر نیست.

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "isPublic must be a boolean value"
  ],
  "error": "Bad Request"
}
```
**علت:** فیلد `isPublic` نامعتبر است یا ارسال نشده است.

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**علت:** Token احراز هویت معتبر نیست یا ارسال نشده است.

---

## 2. دریافت مراجعات عمومی

### Endpoint
```
GET /client-logs/public
```

### دسترسی
- ✅ **CONSULTANT** - می‌تواند مراجعات عمومی املاک خود را مشاهده کند
- ✅ **SUPERVISOR** - می‌تواند مراجعات عمومی املاک خود را مشاهده کند
- ❌ سایر نقش‌ها دسترسی ندارند

### توضیحات
این endpoint لیست مراجعات عمومی را که مربوط به املاک کاربر هستند برمی‌گرداند. فقط مراجعاتی که `isPublic = true` هستند نمایش داده می‌شوند.

### Query Parameters

| پارامتر | نوع | الزامی | پیش‌فرض | توضیحات | مثال |
|---------|-----|--------|---------|----------|------|
| `page` | number | خیر | `1` | شماره صفحه | `1` |
| `limit` | number | خیر | `20` | تعداد آیتم در هر صفحه (حداکثر 100) | `20` |
| `visitType` | enum | خیر | - | فیلتر بر اساس نوع مراجعه | `PHONE` یا `IN_PERSON` |

### مقادیر ممکن برای `visitType`
- `PHONE` - تماس تلفنی
- `IN_PERSON` - مراجعه حضوری

### مثال Request
```bash
# دریافت صفحه اول با 20 آیتم
curl -X GET "http://localhost:3000/client-logs/public?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# دریافت فقط مراجعات تلفنی
curl -X GET "http://localhost:3000/client-logs/public?visitType=PHONE" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# دریافت صفحه دوم با 10 آیتم
curl -X GET "http://localhost:3000/client-logs/public?page=2&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response موفق (200 OK)
```json
{
  "data": [
    {
      "id": "e642e963-dd40-49f9-8c11-db512237ee45",
      "clientName": "علی احمدی",
      "phoneNumber": "09123456789",
      "propertyNeed": "آپارتمان 100 متری در منطقه شمال",
      "visitTime": "2024-01-15T14:30:00.000Z",
      "visitType": "PHONE",
      "isPublic": true,
      "estate": {
        "id": "estate-id-123",
        "establishmentName": "املاک نمونه",
        "guildId": "12345"
      },
      "createdBy": {
        "id": "user-id-456",
        "firstName": "محمد",
        "lastName": "رضایی",
        "phoneNumber": "09123456789"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": "a123b456-c789-d012-e345-f67890123456",
      "clientName": "فاطمه رضایی",
      "phoneNumber": "09187654321",
      "propertyNeed": "ویلا 200 متری در شمال",
      "visitTime": "2024-01-14T10:00:00.000Z",
      "visitType": "IN_PERSON",
      "isPublic": true,
      "estate": {
        "id": "estate-id-123",
        "establishmentName": "املاک نمونه",
        "guildId": "12345"
      },
      "createdBy": {
        "id": "user-id-789",
        "firstName": "احمد",
        "lastName": "کریمی",
        "phoneNumber": "09111111111"
      },
      "createdAt": "2024-01-14T09:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

### ساختار Response

#### `data` (Array)
آرایه‌ای از مراجعات عمومی که شامل فیلدهای زیر است:

| فیلد | نوع | توضیحات |
|------|-----|----------|
| `id` | UUID | شناسه یکتای مراجعه |
| `clientName` | string | نام مشتری |
| `phoneNumber` | string | شماره تماس مشتری (11 رقم) |
| `propertyNeed` | string | نیاز ملکی مشتری |
| `visitTime` | ISO DateTime | زمان مراجعه |
| `visitType` | enum | نوع مراجعه (`PHONE` یا `IN_PERSON`) |
| `isPublic` | boolean | وضعیت اشتراک‌گذاری (همیشه `true` در این endpoint) |
| `estate` | object | اطلاعات املاک |
| `estate.id` | UUID | شناسه املاک |
| `estate.establishmentName` | string | نام دفتر املاک |
| `estate.guildId` | string | شناسه صنف |
| `createdBy` | object | اطلاعات کاربر ثبت‌کننده |
| `createdBy.id` | UUID | شناسه کاربر |
| `createdBy.firstName` | string | نام |
| `createdBy.lastName` | string | نام خانوادگی |
| `createdBy.phoneNumber` | string | شماره تماس |
| `createdAt` | ISO DateTime | تاریخ و زمان ثبت |

#### `meta` (Object)
اطلاعات صفحه‌بندی:

| فیلد | نوع | توضیحات |
|------|-----|----------|
| `page` | number | شماره صفحه فعلی |
| `limit` | number | تعداد آیتم در هر صفحه |
| `total` | number | تعداد کل مراجعات |
| `totalPages` | number | تعداد کل صفحات |

### خطاهای ممکن

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "فقط مشاور و سرپرست می‌توانند مراجعات عمومی را مشاهده کنند",
  "error": "Forbidden"
}
```
**علت:** کاربر نقش مناسب (CONSULTANT یا SUPERVISOR) را ندارد.

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "کاربر باید به یک آژانس تعلق داشته باشد",
  "error": "Bad Request"
}
```
**علت:** کاربر به هیچ املاکی تعلق ندارد.

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**علت:** Token احراز هویت معتبر نیست یا ارسال نشده است.

---

## 3. دریافت تمام مراجعات (به‌روزرسانی شده)

### Endpoint
```
GET /client-logs
```

### دسترسی
- ✅ **ADMIN** - می‌تواند تمام مراجعات املاک خود را مشاهده کند
- ✅ **SECRETARY** - می‌تواند تمام مراجعات املاک خود را مشاهده کند
- ❌ سایر نقش‌ها دسترسی ندارند

### تغییرات
این endpoint تغییری نکرده است، اما حالا فیلد `isPublic` را در response شامل می‌کند.

### Response مثال
```json
[
  {
    "id": "e642e963-dd40-49f9-8c11-db512237ee45",
    "clientName": "علی احمدی",
    "phoneNumber": "09123456789",
    "propertyNeed": "آپارتمان 100 متری",
    "visitTime": "2024-01-15T14:30:00.000Z",
    "visitType": "PHONE",
    "isPublic": false,
    "estate": {
      "id": "estate-id-123",
      "establishmentName": "املاک نمونه"
    },
    "createdBy": {
      "id": "user-id-456",
      "firstName": "محمد",
      "lastName": "رضایی"
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

## مثال‌های استفاده در JavaScript/TypeScript

### استفاده با Fetch API

#### اشتراک‌گذاری مراجعه
```javascript
async function shareClientLog(logId, token) {
  const response = await fetch(
    `http://localhost:3000/client-logs/${logId}/share`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isPublic: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// استفاده
try {
  const sharedLog = await shareClientLog(
    'e642e963-dd40-49f9-8c11-db512237ee45',
    'your-jwt-token'
  );
  console.log('مراجعه به اشتراک گذاشته شد:', sharedLog);
} catch (error) {
  console.error('خطا:', error.message);
}
```

#### دریافت مراجعات عمومی
```javascript
async function getPublicClientLogs(token, options = {}) {
  const { page = 1, limit = 20, visitType } = options;
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (visitType) {
    params.append('visitType', visitType);
  }

  const response = await fetch(
    `http://localhost:3000/client-logs/public?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// استفاده
try {
  const result = await getPublicClientLogs('your-jwt-token', {
    page: 1,
    limit: 20,
    visitType: 'PHONE', // اختیاری
  });
  
  console.log('مراجعات:', result.data);
  console.log('تعداد کل:', result.meta.total);
  console.log('صفحات:', result.meta.totalPages);
} catch (error) {
  console.error('خطا:', error.message);
}
```

### استفاده با Axios

#### اشتراک‌گذاری مراجعه
```javascript
import axios from 'axios';

async function shareClientLog(logId, token) {
  try {
    const response = await axios.patch(
      `http://localhost:3000/client-logs/${logId}/share`,
      { isPublic: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}
```

#### دریافت مراجعات عمومی
```javascript
import axios from 'axios';

async function getPublicClientLogs(token, options = {}) {
  try {
    const response = await axios.get(
      'http://localhost:3000/client-logs/public',
      {
        params: {
          page: options.page || 1,
          limit: options.limit || 20,
          visitType: options.visitType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}
```

---

## نکات مهم

### 1. ترتیب Route ها
در NestJS، route های خاص (مثل `/public` و `/:id/share`) باید قبل از route های پارامتری (مثل `/:id`) تعریف شوند. این در کد رعایت شده است.

### 2. محدودیت دسترسی
- فقط ADMIN و SECRETARY می‌توانند مراجعات را به اشتراک بگذارند
- فقط CONSULTANT و SUPERVISOR می‌توانند مراجعات عمومی را مشاهده کنند
- کاربران فقط به مراجعات املاک خود دسترسی دارند

### 3. فیلتر بر اساس املاک
تمام endpoint ها به صورت خودکار مراجعات را بر اساس `estateId` کاربر فیلتر می‌کنند. کاربر نمی‌تواند به مراجعات املاک‌های دیگر دسترسی داشته باشد.

### 4. Pagination
- صفحه‌بندی از 1 شروع می‌شود (نه 0)
- حداکثر `limit` برابر 100 است
- اگر `limit` بیشتر از 100 باشد، به صورت خودکار به 100 محدود می‌شود

### 5. مرتب‌سازی
مراجعات عمومی بر اساس `visitTime` به صورت نزولی (جدیدترین اول) مرتب می‌شوند.

### 6. فیلد `isPublic`
- مقدار پیش‌فرض: `false`
- فقط مراجعات با `isPublic = true` در endpoint `/public` نمایش داده می‌شوند
- پس از اشتراک‌گذاری، نمی‌توان آن را لغو کرد (در نسخه فعلی)

---

## تست API ها

### با استفاده از Postman

1. **ایجاد Collection جدید**
2. **تنظیم Authorization**: در بخش Authorization، نوع را `Bearer Token` انتخاب کنید و token خود را وارد کنید
3. **ایجاد Request برای اشتراک‌گذاری**:
   - Method: `PATCH`
   - URL: `http://localhost:3000/client-logs/{logId}/share`
   - Body (raw JSON): `{ "isPublic": true }`
4. **ایجاد Request برای دریافت مراجعات عمومی**:
   - Method: `GET`
   - URL: `http://localhost:3000/client-logs/public?page=1&limit=20`

### با استفاده از cURL

```bash
# دریافت Token (مثال)
TOKEN="your-jwt-token-here"

# اشتراک‌گذاری مراجعه
curl -X PATCH "http://localhost:3000/client-logs/e642e963-dd40-49f9-8c11-db512237ee45/share" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPublic": true}'

# دریافت مراجعات عمومی
curl -X GET "http://localhost:3000/client-logs/public?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

## تغییرات آینده (پیشنهادی)

1. **لغو اشتراک‌گذاری**: اضافه کردن endpoint برای تغییر `isPublic` به `false`
2. **فیلترهای بیشتر**: اضافه کردن فیلتر بر اساس تاریخ، نام مشتری، و غیره
3. **جستجو**: اضافه کردن قابلیت جستجو در مراجعات عمومی
4. **اعلان‌ها**: ارسال اعلان به مشاوران و سرپرستان هنگام اشتراک‌گذاری مراجعه جدید

---

**تاریخ ایجاد:** 2024-01-15  
**نسخه:** 1.0  
**نویسنده:** Backend Team

