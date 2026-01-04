/*
  ملف إعدادات Firebase
  تم التحديث: إضافة GoogleAuthProvider
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    // ⚠️ متنساش تحط الكود بتاع مشروعك الحقيقي هنا من Firebase Console
    apiKey: "AIzaSy...", 
    authDomain: "tazkiyah-app.firebaseapp.com",
    projectId: "tazkiyah-app",
    storageBucket: "tazkiyah-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);

// تصدير الأدوات
export const auth = getAuth(app);
export const db = getFirestore(app);

// إعداد مزود تسجيل الدخول بجوجل
export const googleProvider = new GoogleAuthProvider();