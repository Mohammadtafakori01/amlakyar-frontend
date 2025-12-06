/**
 * Downloads a PDF file. Uses native file system on Android, falls back to web method on other platforms.
 * @param blob - The PDF blob to download
 * @param filename - The filename for the downloaded file
 * @returns Promise that resolves when download is complete
 */
export async function downloadPdf(blob: Blob, filename: string): Promise<void> {
  // Check if running in Capacitor (Android/iOS app)
  // Use try-catch to handle cases where Capacitor plugins aren't available (web build)
  try {
    // Check if Capacitor is available in the global scope (only in Capacitor runtime)
    const isCapacitorAvailable = typeof window !== 'undefined' && 
      (window as any).Capacitor !== undefined;

    if (isCapacitorAvailable) {
      // Use Function constructor to create truly dynamic imports that webpack can't analyze
      // This prevents webpack from trying to resolve these modules during build
      const dynamicImport = new Function('moduleName', 'return import(moduleName)');
      
      const capacitorModule = await dynamicImport('@capacitor/core').catch(() => null);
      if (!capacitorModule) {
        throw new Error('Capacitor not available');
      }

      const { Capacitor } = capacitorModule;
      
      if (Capacitor.isNativePlatform()) {
        // Use Function constructor for imports - webpack cannot analyze this
        const filesystemModule = await dynamicImport('@capacitor/filesystem').catch(() => null);
        const shareModule = await dynamicImport('@capacitor/share').catch(() => null);

        if (filesystemModule && shareModule) {
          const { Filesystem, Directory } = filesystemModule;
          const { Share } = shareModule;

          // Convert blob to base64 for Capacitor Filesystem
          const base64Data = await blobToBase64(blob);
          
          // Remove data URL prefix if present (data:application/pdf;base64,)
          const base64String = base64Data.includes(',') 
            ? base64Data.split(',')[1] 
            : base64Data;

          // Save file to Documents directory (accessible via file manager on Android)
          const fileUri = await Filesystem.writeFile({
            path: filename,
            data: base64String,
            directory: Directory.Documents,
          });

          // Share the file - this allows user to save to Downloads or open with another app
          // The file is already saved, so even if user cancels share, file is available
          try {
            await Share.share({
              title: 'دانلود قرارداد',
              text: 'فایل PDF قرارداد',
              url: fileUri.uri,
              dialogTitle: 'ذخیره فایل PDF',
            });
          } catch (shareError: any) {
            // Share was cancelled by user - this is fine, file is already saved
            // Check if it's a cancellation (user pressed back/cancel)
            const errorMessage = shareError?.message || '';
            if (errorMessage.includes('cancel') || errorMessage.includes('User cancelled')) {
              // User cancelled - file is still saved, this is acceptable
              console.log('Share cancelled by user, file saved to:', fileUri.uri);
              return; // Success - file is saved even though share was cancelled
            }
            // Other share errors - file is still saved, but log the error
            console.warn('Share error (file still saved):', shareError);
          }
          return; // Successfully saved using Capacitor
        }
      }
    }
  } catch (error: any) {
    // Capacitor not available or failed - fall back to web method
    console.log('Capacitor not available, using web download method');
  }

  // Web browser fallback (or if Capacitor failed)
  downloadPdfWeb(blob, filename);
}

/**
 * Web browser download method
 */
function downloadPdfWeb(blob: Blob, filename: string): void {
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
