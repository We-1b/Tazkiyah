/*
  ملف إعدادات Firebase
  ده همزة الوصل بين موقعك وبين سيرفرات جوجل.
  محتاج تجيب البيانات دي من Firebase Console -> Project Settings
*/

// بنستورد المكاتب من الـ CDN عشان مش شغالين بـ Node.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// هنا هتحط مفاتيح مشروعك اللي هتجيبها من الموقع
const firebaseConfig = {
    apiKey: "AIzaSy...",          // غير دي بالكود بتاعك
    authDomain: "tazkiyah-app.firebaseapp.com",
    projectId: "tazkiyah-app",
    storageBucket: "tazkiyah-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تصدير الأدوات عشان نستخدمها في باقي الملفات
export const auth = getAuth(app);
export const db = getFirestore(app);