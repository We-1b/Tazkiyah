/*
  ملف التحكم في الدخول والخروج (Auth)
  بيتعامل مع تسجيل الدخول، إنشاء الحساب، والخروج
*/

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// دالة تسجيل الدخول
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("تم تسجيل الدخول بنجاح يا هندسة:", userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("خطأ في الدخول:", error.code);
        return { success: false, error: error.message };
    }
}

// دالة إنشاء حساب جديد
export async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("ألف مبروك الحساب الجديد:", userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة الخروج
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = 'index.html'; // ارجع للرئيسية
    } catch (error) {
        console.error("مشكلة في الخروج:", error);
    }
}

// مراقب الحالة (عشان نعرف اليوزر داخل ولا لا ونحمي الصفحات)
export function initAuthListener() {
    onAuthStateChanged(auth, (user) => {
        const currentPath = window.location.pathname;
        
        if (user) {
            // لو اليوزر مسجل وموجود في صفحة الدخول، وديه الداشبورد
            if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
                window.location.href = 'dashboard.html';
            }
            // ممكن هنا نحفظ بيانات اليوزر في LocalStorage لو عايزين سرعة
            localStorage.setItem('user_uid', user.uid);
        } else {
            // لو اليوزر مش مسجل وبيحاول يفتح الداشبورد، رجعه يسجل
            if (currentPath.includes('dashboard.html')) {
                window.location.href = 'login.html';
            }
            localStorage.removeItem('user_uid');
        }
    });
}