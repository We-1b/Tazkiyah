const CACHE_NAME = 'tazkiyah-app-v1';

// قايمة الملفات اللي عايزين نحفظها عشان الموقع يشتغل أوفلاين
// لازم تتأكد إن المسارات دي موجودة فعلاً في الفولدر عندك
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/login.html',
  '/style.css',
  '/dashboard.css',
  '/js/main.js',
  '/js/dashboard.js',
  '/js/notifications.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com', // بنكيش المكتبات الخارجية لو أمكن، بس الأفضل ننزلها لوكال لو عايز سرعة 100%
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&display=swap'
];

// 1. مرحلة التثبيت (Install Event)
// أول ما اليوزر يفتح الموقع، بننزل الملفات دي ونخبيها في الكاش
self.addEventListener('install', (event) => {
  console.log('[Service Worker] جاري تثبيت التطبيق وتخزين الملفات... 📥');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] تم فتح الكاش وتخزين الملفات بنجاح ✅');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. مرحلة التفعيل (Activate Event)
// دي بتشتغل لما نحدث نسخة التطبيق، بتمسح الكاش القديم عشان المساحة
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] تم تفعيل الخدمة 🚀');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] جاري حذف الكاش القديم:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. مرحلة جلب البيانات (Fetch Event)
// هنا "الجمارك" بتاعة الموقع، أي طلب بيعدي من هنا الأول
// لو الملف موجود في الكاش؟ هاته فوراً (أوفلاين مود)
// لو مش موجود؟ هاته من النت وحطه في الكاش للمرة الجاية (اختياري)
self.addEventListener('fetch', (event) => {
  // بنتجاهل طلبات الـ API أو الحاجات اللي مش عايزنها تتكيش دلوقتي
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // لو لقينا الملف في الكاش، رجعه
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // لو مش موجود، هاته من النت
      return fetch(event.request).then((networkResponse) => {
        // تأكد إن الاستجابة سليمة
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // انسخ الاستجابة وحطها في الكاش للمستقبل (Dynamic Caching)
        // دي خطوة إضافية عشان نكيش أي صفحة يزورها اليوزر
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});