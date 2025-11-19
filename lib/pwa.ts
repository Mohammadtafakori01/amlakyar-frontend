// PWA utility functions for advanced features

// Extend ServiceWorkerRegistration to include Background Sync API
interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  };
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Register for background sync
          const registrationWithSync = registration as ServiceWorkerRegistrationWithSync;
          if ('sync' in ServiceWorkerRegistration.prototype && registrationWithSync.sync) {
            registrationWithSync.sync.register('background-sync').catch((err) => {
              console.log('Background sync registration failed:', err);
            });
          }

          // Set up push notification
          if ('PushManager' in window) {
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (vapidKey) {
              registration.pushManager
                .subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
                })
                .then((subscription) => {
                  console.log('Push subscription:', subscription);
                })
                .catch((err) => {
                  console.log('Push subscription failed:', err);
                });
            }
          }
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
}

export async function registerBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    const registrationWithSync = registration as ServiceWorkerRegistrationWithSync;
    if (registrationWithSync.sync) {
      await registrationWithSync.sync.register(tag);
    } else {
      throw new Error('Background sync is not supported');
    }
  } else {
    throw new Error('Background sync is not supported');
  }
}

