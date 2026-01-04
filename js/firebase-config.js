/*
  =========================================================
  اسم الملف: js/firebase-config.js
  الوصف: ملف الربط بفايربيس (محتاج مفاتيحك الحقيقية عشان يشتغل)
  =========================================================
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 هام جداً: لازم تمسح الكلام اللي بين علامات التنصيص تحت وتحط بياناتك الحقيقية
const firebaseConfig = {
    apiKey: "نسخ_الكود_هنا", 
    authDomain: "نسخ_الكود_هنا",
    projectId: "نسخ_الكود_هنا",
    storageBucket: "نسخ_الكود_هنا",
    messagingSenderId: "نسخ_الكود_هنا",
    appId: "نسخ_الكود_هنا"
};

/*
  💡 بتجيب البيانات دي منين؟
  1. افتح https://console.firebase.google.com/
  2. ادخل مشروعك (Tazkiyah-App)
  3. دوس علامة الترس ⚙️ (Project Settings)
  4. انزل تحت خالص عند "Your apps"
  5. اختار "Config" وانسخ البيانات اللي شبه دي بالظبط
*/

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تصدير الأدوات لباقي الملفات
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();