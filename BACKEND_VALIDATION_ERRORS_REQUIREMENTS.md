# نیازمندی‌های Backend برای خطاهای Validation دقیق

## مشکل فعلی
در حال حاضر، خطاهای validation به صورت عمومی برگردانده می‌شوند و نمی‌توان دقیقاً مشخص کرد که خطا مربوط به کدام فیلد است.

## راه‌حل پیشنهادی

### 1. ساختار خطای پیشنهادی

Backend باید خطاها را به صورت زیر برگرداند:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "خطاهای اعتبارسنجی",
  "errors": {
    "phone": [
      "شماره تلفن باید به فرمت ایرانی (09xxxxxxxxx) باشد",
      "phone must be longer than or equal to 11 characters"
    ],
    "owner": [
      "نام مالک نمی‌تواند خالی باشد"
    ],
    "totalPrice": [
      "قیمت کل باید عدد مثبت باشد"
    ],
    "totalArea": [
      "مساحت کل باید عدد مثبت باشد"
    ]
  }
}
```

### 2. پیاده‌سازی در NestJS (مثال)

```typescript
// dto/property-file.dto.ts
import { IsString, IsNotEmpty, Matches, MinLength, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyFileDto {
  @ApiProperty({ example: '09123456789' })
  @IsString()
  @IsNotEmpty({ message: 'شماره تماس الزامی است' })
  @Matches(/^09\d{9}$/, { message: 'شماره تلفن باید به فرمت ایرانی (09xxxxxxxxx) باشد' })
  @MinLength(11, { message: 'شماره تماس باید حداقل 11 کاراکتر باشد' })
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'نام مالک الزامی است' })
  owner: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'منطقه الزامی است' })
  region: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'آدرس الزامی است' })
  address: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0, { message: 'قیمت کل باید عدد مثبت باشد' })
  totalPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0, { message: 'قیمت متری باید عدد مثبت باشد' })
  unitPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0, { message: 'مساحت کل باید عدد مثبت باشد' })
  totalArea?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0, { message: 'مساحت زمین باید عدد مثبت باشد' })
  landArea?: number;
}
```

```typescript
// main.ts یا app.module.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        // ساختار خطای سفارشی
        const formattedErrors: Record<string, string[]> = {};
        
        errors.forEach((error) => {
          const field = error.property;
          const messages = Object.values(error.constraints || {});
          
          if (messages.length > 0) {
            formattedErrors[field] = messages;
          }
        });

        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'خطاهای اعتبارسنجی',
          errors: formattedErrors,
        });
      },
    }),
  );

  await app.listen(3000);
}
```

### 3. ساختار خطا برای Floors

برای خطاهای مربوط به floors (اطلاعات طبقات):

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "خطاهای اعتبارسنجی",
  "errors": {
    "floors.0.floorNumber": [
      "شماره طبقه الزامی است"
    ],
    "floors.0.area": [
      "مساحت طبقه باید عدد مثبت باشد"
    ],
    "floors.1.bedrooms": [
      "تعداد خواب باید عدد صحیح مثبت باشد"
    ]
  }
}
```

### 4. مثال DTO برای Floors

```typescript
// dto/floor-details.dto.ts
import { IsNumber, IsOptional, IsBoolean, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FloorDetailsDto {
  @IsNumber()
  @Min(1, { message: 'شماره طبقه باید عدد مثبت باشد' })
  @Type(() => Number)
  floorNumber: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'مساحت باید عدد مثبت باشد' })
  @Type(() => Number)
  area?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'تعداد خواب باید عدد صحیح مثبت باشد' })
  @Type(() => Number)
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'تعداد سرویس باید عدد صحیح مثبت باشد' })
  @Type(() => Number)
  bathroom?: number;

  @IsOptional()
  @IsString()
  flooring?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  phone?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  kitchen?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  openKitchen?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  parking?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  storage?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  fireplace?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  cooler?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  fanCoil?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  chiller?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  package?: boolean;
}
```

```typescript
// dto/property-file.dto.ts (ادامه)
import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { FloorDetailsDto } from './floor-details.dto';

export class CreatePropertyFileDto {
  // ... فیلدهای قبلی

  @ApiProperty({ type: [FloorDetailsDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorDetailsDto)
  floors?: FloorDetailsDto[];
}
```

### 5. فیلدهای مورد نیاز برای Validation

فیلدهای اصلی که باید validation داشته باشند:

1. **phone**: شماره تماس (فرمت ایرانی)
2. **owner**: نام مالک (الزامی)
3. **region**: منطقه (الزامی)
4. **address**: آدرس (الزامی)
5. **totalPrice**: قیمت کل (عدد مثبت)
6. **unitPrice**: قیمت متری (عدد مثبت)
7. **totalArea**: مساحت کل (عدد مثبت)
8. **landArea**: مساحت زمین (عدد مثبت)
9. **floors**: آرایه اطلاعات طبقات
   - **floors[].floorNumber**: شماره طبقه (الزامی، عدد مثبت)
   - **floors[].area**: مساحت (عدد مثبت)
   - **floors[].bedrooms**: تعداد خواب (عدد صحیح مثبت)
   - **floors[].bathroom**: تعداد سرویس (عدد صحیح مثبت)

### 6. نکات مهم

1. **ساختار خطا**: خطاها باید در فیلد `errors` به صورت object با key برابر نام فیلد برگردانده شوند
2. **پیام‌های فارسی**: تمام پیام‌های خطا باید به فارسی باشند
3. **خطاهای چندگانه**: برای هر فیلد می‌توان چند خطا برگرداند (array)
4. **خطاهای Nested**: برای فیلدهای nested مثل floors، از dot notation استفاده شود (مثلاً `floors.0.floorNumber`)

### 7. مثال Response کامل

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "خطاهای اعتبارسنجی",
  "errors": {
    "phone": [
      "شماره تلفن باید به فرمت ایرانی (09xxxxxxxxx) باشد"
    ],
    "totalPrice": [
      "قیمت کل باید عدد مثبت باشد",
      "totalPrice must not be less than 0"
    ],
    "floors.0.floorNumber": [
      "شماره طبقه الزامی است"
    ],
    "floors.1.area": [
      "مساحت طبقه باید عدد مثبت باشد"
    ]
  }
}
```

### 8. تست

برای تست، می‌توانید از Postman یا curl استفاده کنید:

```bash
curl -X POST http://localhost:3000/api/property-files \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "123",
    "owner": "",
    "totalPrice": -1000,
    "floors": [
      {
        "floorNumber": null,
        "area": -50
      }
    ]
  }'
```

باید response زیر را دریافت کنید:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "خطاهای اعتبارسنجی",
  "errors": {
    "phone": [
      "شماره تلفن باید به فرمت ایرانی (09xxxxxxxxx) باشد"
    ],
    "owner": [
      "نام مالک الزامی است"
    ],
    "totalPrice": [
      "قیمت کل باید عدد مثبت باشد"
    ],
    "floors.0.floorNumber": [
      "شماره طبقه الزامی است"
    ],
    "floors.0.area": [
      "مساحت طبقه باید عدد مثبت باشد"
    ]
  }
}
```

## نتیجه

با این تغییرات، Frontend می‌تواند:
1. خطاهای دقیق هر فیلد را نمایش دهد
2. فیلدهای دارای خطا را با border قرمز مشخص کند
3. پیام خطا را دقیقاً زیر فیلد مربوطه نمایش دهد
4. اطلاعات کاربر را حفظ کند و فرم را نبندد

