import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Downloads a PDF file. Uses native file system on Android, falls back to web method on other platforms.
 * @param blob - The PDF blob to download
 * @param filename - The filename for the downloaded file
 * @returns Promise that resolves when download is complete
 */
export async function downloadPdf(blob: Blob, filename: string): Promise<void> {
  // Check if running in Capacitor (Android/iOS app)
  if (Capacitor.isNativePlatform()) {
    try {
      // Convert blob to base64 for Capacitor Filesystem
      const base64Data = await blobToBase64(blob);
      
      // Remove data URL prefix if present (data:application/pdf;base64,)
      const base64String = base64Data.includes(',') 
        ? base64Data.split(',')[1] 
        : base64Data;

      // Save file to Documents directory first
      // On Android, we'll use ExternalStorage to save to Downloads
      const fileUri = await Filesystem.writeFile({
        path: filename,
        data: base64String,
        directory: Directory.ExternalStorage, // Use ExternalStorage for Android Downloads access
      });

      // Try to share the file - this allows user to save to Downloads or open with another app
      try {
        await Share.share({
          title: 'دانلود قرارداد',
          text: 'فایل PDF قرارداد',
          url: fileUri.uri,
          dialogTitle: 'ذخیره فایل PDF',
        });
      } catch (shareError: any) {
        // Share was cancelled or failed, but file is saved
        // On Android, ExternalStorage saves to a location accessible via file manager
        console.log('File saved to:', fileUri.uri);
        // Re-throw only if it's not a user cancellation
        if (shareError.message && !shareError.message.includes('cancel')) {
          throw shareError;
        }
      }
    } catch (error: any) {
      console.error('Error saving PDF with Capacitor:', error);
      
      // Fallback: try to use Share plugin directly with a data URL
      try {
        const base64Data = await blobToBase64(blob);
        await Share.share({
          title: 'دانلود قرارداد',
          text: 'فایل PDF قرارداد',
          url: base64Data,
          dialogTitle: 'ذخیره فایل PDF',
        });
      } catch (fallbackError) {
        throw new Error('خطا در ذخیره فایل PDF. لطفا دوباره تلاش کنید.');
      }
    }
  } else {
    // Web browser fallback
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

/**
 * Converts a Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
