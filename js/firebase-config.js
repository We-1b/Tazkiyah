/*
  =========================================================
  اسم الملف: js/firebase-config.js
  الوصف: ملف الربط بفايربيس (تم التحديث بالمفاتيح الحقيقية)
  =========================================================
*/

// بنستخدم روابط CDN عشان الموقع يشتغل على المتصفح مباشرة من غير Node.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات مشروعك الحقيقية (Tazkiyah App)
const firebaseConfig = {
    apiKey: "AIzaSyCPLO_YbLlBWZ_ivAOBh9Fq1KqoOZbWOGs",
    authDomain: "tazkiyah-app-d27b8.firebaseapp.com",
    projectId: "tazkiyah-app-d27b8",
    storageBucket: "tazkiyah-app-d27b8.firebasestorage.app",
    messagingSenderId: "1083049907770",
    appId: "1:1083049907770:web:10cec436b66cce13378703",
    measurementId: "G-T3W61F8F5N"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تصدير الأدوات لباقي الملفات
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();