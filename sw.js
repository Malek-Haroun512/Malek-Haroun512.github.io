/* Service Worker لإشعارات هارون بلاست
 * يستقبل إشعارات Web Push ويعرضها، وعند الضغط يفتح التطبيق.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// استقبال الإشعار من الخادم
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'هارون بلاست', body: event.data ? event.data.text() : 'لديك إشعار جديد' };
  }

  const title = data.title || 'هارون بلاست';
  const options = {
    body: data.body || 'صنف جديد وصل — اطّلع عليه الآن',
    icon: data.icon || '/icon-192.png',
    badge: '/favicon.png',
    tag: data.tag || 'haroun-update',
    renotify: true,
    requireInteraction: false,
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || '/', productId: data.productId || null },
    vibrate: [120, 60, 120],
    actions: [
      { action: 'open', title: 'عرض المنتج' },
      { action: 'dismiss', title: 'لاحقاً' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// عند الضغط على الإشعار: افتح التطبيق (أو ركّز النافذة المفتوحة)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      // لو التطبيق مفتوح أصلاً → ركّز عليه وانتقل للمسار المطلوب
      for (const client of clientList) {
        if ('focus' in client) {
          const focused = await client.focus();
          if (focused && 'navigate' in focused) {
            try { return focused.navigate(targetUrl); } catch { /* تجاهُل */ }
          }
          return undefined;
        }
      }
      // غير مفتوح → افتحه
      return self.clients.openWindow(targetUrl);
    }),
  );
});

// إغلاق الإشعار مباشرة من مركز الإشعارات
self.addEventListener('notificationclose', () => {
  // لا شيء مطلوب حاليًا
});