import { useState, useRef, useCallback } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { propertyFilesApi } from '../../../domains/property-files/api/propertyFilesApi';
import { getImageUrl } from '../../../shared/utils/imageUtils';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({ 
  images = [], 
  onChange, 
  maxImages = 10,
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`حداکثر ${maxImages} تصویر می‌توانید آپلود کنید`);
      return;
    }

    const filesArray = Array.from(files);
    const filesToUpload = filesArray.slice(0, remainingSlots);

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        setError('فقط فایل‌های تصویری مجاز هستند');
        continue;
      }
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setError('حجم هر تصویر نباید بیشتر از 20 مگابایت باشد');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = validFiles.map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || 'خطا در آپلود تصاویر');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onChange]);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const response = await propertyFilesApi.uploadImage(file);
      return response.url;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'خطا در آپلود تصویر';
      throw new Error(errorMessage);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          تصاویر ملک
          <span className="text-gray-500 text-xs mr-2">
            (حداکثر {maxImages} تصویر)
          </span>
        </label>
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${disabled || uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled || uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="text-sm text-gray-600">در حال آپلود...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FiUpload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                برای آپلود تصویر کلیک کنید یا فایل را اینجا بکشید
              </span>
              <span className="text-xs text-gray-500">
                فرمت‌های مجاز: JPG, PNG, GIF (حداکثر 20 مگابایت)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              <img
                src={getImageUrl(imageUrl)}
                alt={`Property image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eتصویر%3C/text%3E%3C/svg%3E';
                }}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="حذف تصویر"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                تصویر {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-400">
          <FiImage className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">هنوز تصویری آپلود نشده است</p>
        </div>
      )}
    </div>
  );
}

