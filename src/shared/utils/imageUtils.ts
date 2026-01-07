/**
 * Get the backend API base URL from environment variables
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable directly
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.amlakyarr.com/';
  }
  
  // Client-side: use Next.js proxy in development, or env variable in production
  return process.env.NODE_ENV === 'development'
    ? '/api'
    : (process.env.NEXT_PUBLIC_API_URL || 'https://api.amlakyarr.com/');
}

/**
 * Get the image storage base URL from environment variables
 * Falls back to API base URL if not specified
 */
export function getImageStorageUrl(): string {
  const storageUrl = process.env.NEXT_PUBLIC_IMAGE_STORAGE_URL;
  if (storageUrl) {
    return storageUrl;
  }
  
  // Fallback to API base URL
  return getApiBaseUrl();
}

/**
 * Get the full image URL for display
 * Handles both relative and absolute URLs
 * 
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The full URL to use for displaying the image
 */
export function getImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) {
    return '';
  }

  // If it's already an absolute URL (starts with http:// or https://), use it as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative URL, prepend the storage base URL
  const baseUrl = getImageStorageUrl();
  
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Ensure image URL starts with /
  const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${cleanBaseUrl}${cleanImageUrl}`;
}

