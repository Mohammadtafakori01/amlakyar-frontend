# Property Files Image Upload API Documentation

## Overview
This document describes the API endpoints for uploading and managing images associated with property files. Each property file can have up to 10 images.

## Base URL
```
Development: /api/property-files
Production: {API_BASE_URL}/property-files
```

## Environment Variables

### Frontend Environment Variables

The frontend reads image storage URLs from environment variables:

- **`NEXT_PUBLIC_API_URL`**: Base URL for the API (used as fallback for image storage)
  - Example: `https://api.example.com`
  - Default: `http://localhost:3002`

- **`NEXT_PUBLIC_IMAGE_STORAGE_URL`** (Optional): Dedicated URL for image storage/CDN
  - Example: `https://storage.example.com` or `https://cdn.example.com`
  - If not set, falls back to `NEXT_PUBLIC_API_URL`

### How It Works

The frontend uses a utility function `getImageUrl()` that:
1. Checks if the image URL is absolute (starts with `http://` or `https://`) - uses as-is
2. If relative, prepends the storage base URL from environment variables
3. Handles both development (Next.js proxy) and production environments

### Example `.env.local` file:
```env
# API Base URL
NEXT_PUBLIC_API_URL=https://api.example.com

# Image Storage URL (optional - falls back to API URL if not set)
NEXT_PUBLIC_IMAGE_STORAGE_URL=https://storage.example.com
```

### Example `.env.production` file:
```env
NEXT_PUBLIC_API_URL=https://api.amlakyar.com
NEXT_PUBLIC_IMAGE_STORAGE_URL=https://storage.amlakyar.com
```

## Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer {accessToken}
```

---

## Endpoints

### 1. Upload Image

Upload a single image for a property file. The image will be stored and a URL will be returned.

**Endpoint:** `POST /property-files/upload-image`

**Request:**
- **Method:** POST
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `image` (File, required): The image file to upload
    - Supported formats: JPG, JPEG, PNG, GIF, WebP
    - Maximum file size: 20MB
    - Recommended dimensions: 1920x1080 or higher

**Example Request (cURL):**
```bash
curl -X POST \
  'https://api.example.com/property-files/upload-image' \
  -H 'Authorization: Bearer {accessToken}' \
  -F 'image=@/path/to/image.jpg'
```

**Example Request (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/property-files/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
});
```

**Response:**
- **Status Code:** 200 OK
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "url": "https://storage.example.com/property-files/images/abc123-def456-ghi789.jpg"
}
```

**Error Responses:**

**400 Bad Request** - Invalid file format or size
```json
{
  "message": "فقط فایل‌های تصویری مجاز هستند",
  "errors": {
    "image": ["فرمت فایل نامعتبر است"]
  }
}
```

**400 Bad Request** - File too large
```json
{
  "message": "حجم فایل نباید بیشتر از 20 مگابایت باشد",
  "errors": {
    "image": ["حجم فایل بیش از حد مجاز است"]
  }
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "message": "دسترسی غیرمجاز"
}
```

**500 Internal Server Error** - Server error during upload
```json
{
  "message": "خطا در آپلود تصویر"
}
```

---

### 2. Create Property File with Images

Create a new property file and include image URLs.

**Endpoint:** `POST /property-files`

**Request:**
- **Method:** POST
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "zone": "OFFICE_MASTER",
  "owner": "علی احمدی",
  "region": "تهران",
  "address": "خیابان ولیعصر",
  "transactionType": "SALE",
  "buildingType": "APARTMENT",
  "date": "1403/01/15",
  "images": [
    "https://storage.example.com/property-files/images/img1.jpg",
    "https://storage.example.com/property-files/images/img2.jpg"
  ],
  // ... other property file fields
}
```

**Response:**
- **Status Code:** 201 Created
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "id": "property-file-id",
  "uniqueCode": "PF-2024-001",
  "images": [
    "https://storage.example.com/property-files/images/img1.jpg",
    "https://storage.example.com/property-files/images/img2.jpg"
  ],
  // ... other property file fields
}
```

**Validation Errors:**

**422 Unprocessable Entity** - Too many images
```json
{
  "message": "حداکثر 10 تصویر مجاز است",
  "errors": {
    "images": ["تعداد تصاویر نباید بیشتر از 10 باشد"]
  }
}
```

---

### 3. Update Property File Images

Update the images for an existing property file.

**Endpoint:** `PATCH /property-files/{id}`

**Request:**
- **Method:** PATCH
- **Content-Type:** `application/json`
- **Path Parameters:**
  - `id` (string, required): Property file ID
- **Body:**
```json
{
  "images": [
    "https://storage.example.com/property-files/images/img1.jpg",
    "https://storage.example.com/property-files/images/img2.jpg",
    "https://storage.example.com/property-files/images/img3.jpg"
  ]
}
```

**Response:**
- **Status Code:** 200 OK
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "id": "property-file-id",
  "images": [
    "https://storage.example.com/property-files/images/img1.jpg",
    "https://storage.example.com/property-files/images/img2.jpg",
    "https://storage.example.com/property-files/images/img3.jpg"
  ],
  // ... other property file fields
}
```

---

### 4. Delete Image

Delete a specific image from a property file.

**Endpoint:** `DELETE /property-files/{id}/images`

**Request:**
- **Method:** DELETE
- **Content-Type:** `application/json`
- **Path Parameters:**
  - `id` (string, required): Property file ID
- **Body:**
```json
{
  "imageUrl": "https://storage.example.com/property-files/images/img1.jpg"
}
```

**Response:**
- **Status Code:** 200 OK
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "message": "تصویر با موفقیت حذف شد"
}
```

**Error Responses:**

**404 Not Found** - Image not found
```json
{
  "message": "تصویر یافت نشد"
}
```

**400 Bad Request** - Invalid image URL
```json
{
  "message": "آدرس تصویر نامعتبر است"
}
```

---

### 5. Get Property File with Images

Retrieve a property file including its images.

**Endpoint:** `GET /property-files/{id}`

**Request:**
- **Method:** GET
- **Path Parameters:**
  - `id` (string, required): Property file ID

**Response:**
- **Status Code:** 200 OK
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "id": "property-file-id",
  "uniqueCode": "PF-2024-001",
  "images": [
    "https://storage.example.com/property-files/images/img1.jpg",
    "https://storage.example.com/property-files/images/img2.jpg"
  ],
  // ... other property file fields
}
```

---

## Data Model

### PropertyFile.images

**Type:** `string[]`

**Description:** Array of image URLs associated with the property file.

**Constraints:**
- Maximum 10 images per property file
- Each URL must be a valid HTTPS URL
- Images should be stored in a secure, accessible location
- URLs should remain valid for the lifetime of the property file

**Example:**
```json
{
  "images": [
    "https://storage.example.com/property-files/images/abc123.jpg",
    "https://storage.example.com/property-files/images/def456.png"
  ]
}
```

---

## Image Storage Requirements

### File Storage
- Images should be stored in a secure cloud storage service (e.g., AWS S3, Google Cloud Storage, Azure Blob Storage)
- Each image should have a unique filename to prevent conflicts
- Recommended naming pattern: `{propertyFileId}-{timestamp}-{randomString}.{extension}`

### Image Processing
- Images should be optimized for web delivery
- Consider generating thumbnails for faster loading
- Recommended formats:
  - Original: JPEG or PNG
  - Thumbnail: JPEG (smaller file size)

### Security
- Images should be accessible only to authenticated users
- Implement access control based on user permissions
- Validate image URLs before serving to prevent unauthorized access

---

## Frontend Implementation Notes

### Image Upload Component
The frontend includes an `ImageUpload` component that:
- Supports drag-and-drop file selection
- Validates file types and sizes client-side
- Shows upload progress
- Displays image previews in a grid layout
- Allows removing images before submission
- Limits uploads to 10 images maximum

### Usage Example
```typescript
import ImageUpload from '@/shared/components/common/ImageUpload';

function PropertyFileForm() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageUpload
      images={images}
      onChange={setImages}
      maxImages={10}
      disabled={false}
    />
  );
}
```

---

## Error Handling

### Client-Side Validation
Before uploading, validate:
- File type (must be image)
- File size (max 20MB)
- Number of images (max 10)

### Server-Side Validation
The backend should validate:
- File type and size
- Image count (max 10 per property file)
- Image URL format and accessibility
- User permissions

---

## Rate Limiting

Consider implementing rate limiting for image uploads:
- Maximum 20 uploads per minute per user
- Maximum 100 uploads per hour per user

---

## Best Practices

1. **Image Optimization**: Compress images before storing to reduce storage costs and improve load times
2. **CDN Usage**: Serve images through a CDN for better performance
3. **Lazy Loading**: Implement lazy loading for image galleries
4. **Error Handling**: Provide clear error messages for failed uploads
5. **Progress Indicators**: Show upload progress for better UX
6. **Validation**: Validate both client-side and server-side
7. **Security**: Sanitize file names and validate image content (not just extension)

---

## Testing

### Test Cases

1. **Upload Single Image**
   - Upload a valid image file
   - Verify URL is returned
   - Verify image is accessible

2. **Upload Multiple Images**
   - Upload 10 valid images
   - Verify all URLs are returned
   - Verify all images are accessible

3. **Upload Invalid File**
   - Upload non-image file
   - Verify error is returned

4. **Upload Oversized File**
   - Upload file > 20MB
   - Verify error is returned

5. **Upload More Than 10 Images**
   - Attempt to add 11th image
   - Verify error is returned

6. **Delete Image**
   - Delete existing image
   - Verify image is removed from property file
   - Verify image file is deleted from storage

7. **Update Images**
   - Update property file with new images array
   - Verify old images are replaced
   - Verify old image files are cleaned up

---

## Changelog

### Version 1.0.0 (Initial Release)
- Added image upload endpoint
- Added image deletion endpoint
- Added images field to PropertyFile model
- Maximum 10 images per property file
- Maximum 20MB per image file

