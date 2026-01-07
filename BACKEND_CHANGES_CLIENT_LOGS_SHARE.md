# مستندات تغییرات بکند - اشتراک‌گذاری مراجعات

## خلاصه
این مستندات شامل تغییرات مورد نیاز در بکند برای پیاده‌سازی قابلیت اشتراک‌گذاری مراجعات با مشاوران و سرپرستان است.

---

## 1. تغییرات دیتابیس

### 1.1. افزودن فیلد `isPublic` به جدول `client_logs`

```sql
ALTER TABLE client_logs 
ADD COLUMN is_public BOOLEAN DEFAULT FALSE NOT NULL;

-- ایجاد ایندکس برای بهبود عملکرد جستجو
CREATE INDEX idx_client_logs_is_public ON client_logs(is_public);
CREATE INDEX idx_client_logs_estate_public ON client_logs(estate_id, is_public);
```

**نکات:**
- مقدار پیش‌فرض: `FALSE`
- این فیلد مشخص می‌کند که آیا مراجعه به صورت عمومی با مشاوران و سرپرستان به اشتراک گذاشته شده است یا خیر
- فقط مراجعاتی که `is_public = TRUE` هستند برای مشاوران و سرپرستان قابل مشاهده هستند

---

## 2. تغییرات Entity/Model

### 2.1. به‌روزرسانی Entity ClientLog

```typescript
// مثال برای TypeORM (Node.js/TypeScript)
@Entity('client_logs')
export class ClientLog {
  // ... فیلدهای موجود

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  // ... سایر فیلدها
}
```

```python
# مثال برای SQLAlchemy (Python)
class ClientLog(db.Model):
    __tablename__ = 'client_logs'
    
    # ... فیلدهای موجود
    
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    
    # ... سایر فیلدها
```

---

## 3. API Endpoints

### 3.1. اشتراک‌گذاری مراجعه (Share Client Log)

**Endpoint:** `PATCH /client-logs/:id/share`

**دسترسی:** فقط `ADMIN` و `SECRETARY`

**توضیحات:** این endpoint یک مراجعه را به صورت عمومی با مشاوران و سرپرستان به اشتراک می‌گذارد.

**Request:**
```json
PATCH /client-logs/123e4567-e89b-12d3-a456-426614174000/share
Content-Type: application/json

{
  "isPublic": true
}
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "clientName": "علی احمدی",
  "phoneNumber": "09123456789",
  "propertyNeed": "آپارتمان 100 متری در منطقه شمال",
  "visitTime": "2024-01-15T14:30:00.000Z",
  "visitType": "PHONE",
  "isPublic": true,
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
```

**خطاها:**
- `404 Not Found`: مراجعه یافت نشد
- `403 Forbidden`: کاربر دسترسی لازم را ندارد (فقط ADMIN و SECRETARY)
- `400 Bad Request`: درخواست نامعتبر

**منطق:**
1. بررسی وجود مراجعه با ID داده شده
2. بررسی دسترسی کاربر (فقط ADMIN و SECRETARY می‌توانند اشتراک‌گذاری کنند)
3. بررسی اینکه مراجعه متعلق به همان املاک کاربر است (برای SECRETARY)
4. به‌روزرسانی `isPublic` به `true`
5. بازگرداندن مراجعه به‌روزرسانی شده

---

### 3.2. دریافت مراجعات عمومی (Get Public Client Logs)

**Endpoint:** `GET /client-logs/public`

**دسترسی:** `CONSULTANT` و `SUPERVISOR`

**توضیحات:** این endpoint لیست مراجعات عمومی را که مربوط به املاک کاربر هستند برمی‌گرداند.

**Query Parameters:**
- `page` (optional): شماره صفحه (پیش‌فرض: 1)
- `limit` (optional): تعداد آیتم در هر صفحه (پیش‌فرض: 20)
- `visitType` (optional): فیلتر بر اساس نوع مراجعه (`PHONE` یا `IN_PERSON`)

**Request:**
```
GET /client-logs/public?page=1&limit=20&visitType=PHONE
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "clientName": "علی احمدی",
      "phoneNumber": "09123456789",
      "propertyNeed": "آپارتمان 100 متری در منطقه شمال",
      "visitTime": "2024-01-15T14:30:00.000Z",
      "visitType": "PHONE",
      "isPublic": true,
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
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**خطاها:**
- `403 Forbidden`: کاربر دسترسی لازم را ندارد (فقط CONSULTANT و SUPERVISOR)
- `401 Unauthorized`: کاربر احراز هویت نشده است

**منطق:**
1. بررسی دسترسی کاربر (فقط CONSULTANT و SUPERVISOR)
2. دریافت `estate_id` از کاربر احراز هویت شده
3. جستجوی مراجعات با شرایط زیر:
   - `is_public = TRUE`
   - `estate_id` برابر با املاک کاربر
4. اعمال فیلترهای اختیاری (visitType)
5. اعمال pagination
6. بازگرداندن نتایج

**SQL Query مثال:**
```sql
SELECT cl.*, 
       e.id as estate_id, e.establishment_name,
       u.id as created_by_id, u.first_name, u.last_name
FROM client_logs cl
INNER JOIN estates e ON cl.estate_id = e.id
INNER JOIN users u ON cl.created_by_id = u.id
WHERE cl.is_public = TRUE 
  AND cl.estate_id = :user_estate_id
  AND (:visit_type IS NULL OR cl.visit_type = :visit_type)
ORDER BY cl.visit_time DESC
LIMIT :limit OFFSET :offset;
```

---

### 3.3. به‌روزرسانی Endpoint دریافت مراجعات عادی

**Endpoint:** `GET /client-logs`

**تغییرات:** این endpoint باید همچنان فقط برای ADMIN و SECRETARY قابل دسترسی باشد و تمام مراجعات (اعم از عمومی و غیرعمومی) را برگرداند.

**نکته:** این endpoint تغییری نمی‌کند، فقط باید فیلد `isPublic` را در response شامل کند.

**Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "clientName": "علی احمدی",
    "phoneNumber": "09123456789",
    "propertyNeed": "آپارتمان 100 متری",
    "visitTime": "2024-01-15T14:30:00.000Z",
    "visitType": "PHONE",
    "isPublic": false,  // ← فیلد جدید
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

## 4. منطق دسترسی (Authorization)

### 4.1. اشتراک‌گذاری مراجعه
- **ADMIN**: می‌تواند تمام مراجعات املاک خود را به اشتراک بگذارد
- **SECRETARY**: می‌تواند مراجعات املاک خود را به اشتراک بگذارد
- **سایر نقش‌ها**: دسترسی ندارند

### 4.2. مشاهده مراجعات عمومی
- **CONSULTANT**: می‌تواند مراجعات عمومی مربوط به املاک خود را مشاهده کند
- **SUPERVISOR**: می‌تواند مراجعات عمومی مربوط به املاک خود را مشاهده کند
- **سایر نقش‌ها**: دسترسی ندارند

### 4.3. مشاهده تمام مراجعات
- **ADMIN**: می‌تواند تمام مراجعات املاک خود را مشاهده کند
- **SECRETARY**: می‌تواند تمام مراجعات املاک خود را مشاهده کند
- **سایر نقش‌ها**: دسترسی ندارند

---

## 5. Validation و Business Rules

### 5.1. قوانین اشتراک‌گذاری
1. فقط مراجعاتی که `isPublic = FALSE` هستند می‌توانند به اشتراک گذاشته شوند (اختیاری - می‌توانید اجازه دهید که مراجعات عمومی دوباره به اشتراک گذاشته شوند)
2. کاربر باید عضو همان املاکی باشد که مراجعه به آن تعلق دارد
3. پس از اشتراک‌گذاری، نمی‌توان آن را لغو کرد (یا می‌توانید endpoint دیگری برای لغو اشتراک‌گذاری اضافه کنید)

### 5.2. قوانین مشاهده مراجعات عمومی
1. فقط مراجعات با `isPublic = TRUE` نمایش داده می‌شوند
2. فقط مراجعات مربوط به املاک کاربر نمایش داده می‌شوند
3. نتایج بر اساس `visitTime` به صورت نزولی مرتب می‌شوند (جدیدترین اول)

---

## 6. Migration Script

### 6.1. برای TypeORM (Node.js)

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsPublicToClientLogs1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'client_logs',
      new TableColumn({
        name: 'is_public',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );

    await queryRunner.query(`
      CREATE INDEX idx_client_logs_is_public ON client_logs(is_public);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_client_logs_estate_public ON client_logs(estate_id, is_public);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_client_logs_estate_public;`);
    await queryRunner.query(`DROP INDEX idx_client_logs_is_public;`);
    await queryRunner.dropColumn('client_logs', 'is_public');
  }
}
```

### 6.2. برای Alembic (Python/SQLAlchemy)

```python
"""Add is_public to client_logs

Revision ID: 1234567890
Revises: previous_revision_id
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '1234567890'
down_revision = 'previous_revision_id'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('client_logs', 
                  sa.Column('is_public', sa.Boolean(), 
                           nullable=False, server_default='false'))
    op.create_index('idx_client_logs_is_public', 'client_logs', ['is_public'])
    op.create_index('idx_client_logs_estate_public', 'client_logs', 
                   ['estate_id', 'is_public'])

def downgrade():
    op.drop_index('idx_client_logs_estate_public', 'client_logs')
    op.drop_index('idx_client_logs_is_public', 'client_logs')
    op.drop_column('client_logs', 'is_public')
```

---

## 7. مثال Controller/Handler

### 7.1. برای Node.js/Express

```typescript
// clientLogsController.ts

// اشتراک‌گذاری مراجعه
export const shareClientLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // بررسی دسترسی
  if (userRole !== 'ADMIN' && userRole !== 'SECRETARY') {
    return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  }

  try {
    const clientLog = await ClientLog.findOne({
      where: { id },
      relations: ['estate', 'createdBy'],
    });

    if (!clientLog) {
      return res.status(404).json({ message: 'مراجعه یافت نشد' });
    }

    // بررسی تعلق مراجعه به املاک کاربر (برای SECRETARY)
    if (userRole === 'SECRETARY' && clientLog.estate.id !== req.user.estateId) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    // به‌روزرسانی
    clientLog.isPublic = true;
    await clientLog.save();

    return res.json(clientLog);
  } catch (error) {
    console.error('Error sharing client log:', error);
    return res.status(500).json({ message: 'خطا در اشتراک‌گذاری مراجعه' });
  }
};

// دریافت مراجعات عمومی
export const getPublicClientLogs = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { page = 1, limit = 20, visitType } = req.query;

  // بررسی دسترسی
  if (userRole !== 'CONSULTANT' && userRole !== 'SUPERVISOR') {
    return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  }

  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user || !user.estateId) {
      return res.status(400).json({ message: 'کاربر به املاکی تعلق ندارد' });
    }

    const queryBuilder = ClientLog.createQueryBuilder('cl')
      .leftJoinAndSelect('cl.estate', 'estate')
      .leftJoinAndSelect('cl.createdBy', 'createdBy')
      .where('cl.isPublic = :isPublic', { isPublic: true })
      .andWhere('cl.estateId = :estateId', { estateId: user.estateId })
      .orderBy('cl.visitTime', 'DESC');

    if (visitType) {
      queryBuilder.andWhere('cl.visitType = :visitType', { visitType });
    }

    const skip = (Number(page) - 1) * Number(limit);
    queryBuilder.skip(skip).take(Number(limit));

    const [data, total] = await queryBuilder.getManyAndCount();

    return res.json({
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching public client logs:', error);
    return res.status(500).json({ message: 'خطا در دریافت مراجعات' });
  }
};
```

### 7.2. برای Python/FastAPI

```python
# client_logs_controller.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

router = APIRouter()

@router.patch("/client-logs/{log_id}/share")
async def share_client_log(
    log_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """اشتراک‌گذاری مراجعه"""
    # بررسی دسترسی
    if current_user.role not in ["ADMIN", "SECRETARY"]:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")
    
    # دریافت مراجعه
    client_log = db.query(ClientLog).filter(ClientLog.id == log_id).first()
    if not client_log:
        raise HTTPException(status_code=404, detail="مراجعه یافت نشد")
    
    # بررسی تعلق به املاک (برای SECRETARY)
    if current_user.role == "SECRETARY" and client_log.estate_id != current_user.estate_id:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")
    
    # به‌روزرسانی
    client_log.is_public = True
    db.commit()
    db.refresh(client_log)
    
    return client_log

@router.get("/client-logs/public")
async def get_public_client_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    visit_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """دریافت مراجعات عمومی"""
    # بررسی دسترسی
    if current_user.role not in ["CONSULTANT", "SUPERVISOR"]:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")
    
    if not current_user.estate_id:
        raise HTTPException(status_code=400, detail="کاربر به املاکی تعلق ندارد")
    
    # ساخت query
    query = db.query(ClientLog).filter(
        ClientLog.is_public == True,
        ClientLog.estate_id == current_user.estate_id
    )
    
    if visit_type:
        query = query.filter(ClientLog.visit_type == visit_type)
    
    # Pagination
    total = query.count()
    skip = (page - 1) * limit
    client_logs = query.order_by(ClientLog.visit_time.desc()).offset(skip).limit(limit).all()
    
    return {
        "data": client_logs,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }
```

---

## 8. تست‌ها (Tests)

### 8.1. تست اشتراک‌گذاری مراجعه

```typescript
describe('Share Client Log', () => {
  it('should allow ADMIN to share a client log', async () => {
    const admin = await createTestUser({ role: 'ADMIN' });
    const log = await createTestClientLog({ isPublic: false });
    
    const response = await request(app)
      .patch(`/client-logs/${log.id}/share`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ isPublic: true });
    
    expect(response.status).toBe(200);
    expect(response.body.isPublic).toBe(true);
  });

  it('should not allow CONSULTANT to share a client log', async () => {
    const consultant = await createTestUser({ role: 'CONSULTANT' });
    const log = await createTestClientLog();
    
    const response = await request(app)
      .patch(`/client-logs/${log.id}/share`)
      .set('Authorization', `Bearer ${consultant.token}`)
      .send({ isPublic: true });
    
    expect(response.status).toBe(403);
  });
});
```

### 8.2. تست دریافت مراجعات عمومی

```typescript
describe('Get Public Client Logs', () => {
  it('should return public logs for CONSULTANT', async () => {
    const consultant = await createTestUser({ role: 'CONSULTANT' });
    await createTestClientLog({ isPublic: true, estateId: consultant.estateId });
    await createTestClientLog({ isPublic: false, estateId: consultant.estateId });
    
    const response = await request(app)
      .get('/client-logs/public')
      .set('Authorization', `Bearer ${consultant.token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].isPublic).toBe(true);
  });
});
```

---

## 9. نکات مهم

1. **امنیت**: همیشه بررسی کنید که کاربر فقط به مراجعات املاک خود دسترسی دارد
2. **Performance**: از ایندکس‌های دیتابیس استفاده کنید تا جستجو سریع‌تر باشد
3. **Audit**: می‌توانید یک جدول audit برای ثبت تاریخچه اشتراک‌گذاری‌ها اضافه کنید
4. **Notification**: می‌توانید هنگام اشتراک‌گذاری، به مشاوران و سرپرستان اطلاع‌رسانی کنید
5. **Reversibility**: در صورت نیاز، می‌توانید endpoint برای لغو اشتراک‌گذاری اضافه کنید

---

## 10. چک‌لیست پیاده‌سازی

- [ ] افزودن فیلد `is_public` به جدول `client_logs`
- [ ] ایجاد migration برای تغییرات دیتابیس
- [ ] به‌روزرسانی Entity/Model
- [ ] پیاده‌سازی endpoint `PATCH /client-logs/:id/share`
- [ ] پیاده‌سازی endpoint `GET /client-logs/public`
- [ ] به‌روزرسانی endpoint `GET /client-logs` برای شامل کردن فیلد `isPublic`
- [ ] پیاده‌سازی منطق دسترسی (Authorization)
- [ ] افزودن validation
- [ ] نوشتن تست‌ها
- [ ] به‌روزرسانی مستندات API (Swagger/OpenAPI)

---

**تاریخ ایجاد:** 2024-01-15  
**نسخه:** 1.0

