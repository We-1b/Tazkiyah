/*
  =========================================================
  اسم الملف: js/auth.js
  الوصف: ملف التحكم في الدخول (نسخة التصحيح القوية)
  التعديل: السماح بالدخول حتى لو قاعدة البيانات فيها مشكلة
  =========================================================
*/

import { auth, googleProvider, db } from './firebase-config.js';
import { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 1. دالة تسجيل الدخول بجوجل (المعدلة)
// ==========================================
export async function loginWithGoogle() {
    try {
        console.log("1. جاري فتح نافذة جوجل...");
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("2. تم تسجيل الدخول بنجاح:", user.displayName);

        // محاولة حفظ البيانات (مفصولة عشان لو فشلت متوقفش الدخول)
        try {
            await saveUserData(user);
        } catch (dbError) {
            console.error("⚠️ تحذير: فشل حفظ البيانات في الداتابيز (مش مهم دلوقتي)", dbError);
            // مش هنوقف، هنكمل دخول عادي
        }

        console.log("3. جاري التحويل للداشبورد...");
        window.location.href = 'dashboard.html';
        return { success: true, user: user };

    } catch (error) {
        console.error("❌ خطأ قاتل في الدخول:", error);
        alert("مشكلة في الدخول: " + error.message);
        return { success: false, error: error.message };
    }
}

// دالة مساعدة لحفظ البيانات
async function saveUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            preferences: {
                showSunan: true,
                enableFasting: true,
                dailyTarget: "medium"
            },
            customHabits: []
        });
        console.log("تم إنشاء ملف جديد للمستخدم.");
    }
}

// ==========================================
// 2. باقي الدوال زي ما هي
// ==========================================
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function registerUser(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        try {
            await setDoc(doc(db, "users", result.user.uid), {
                email: email,
                createdAt: new Date(),
                preferences: { showSunan: true, enableFasting: true }
            });
        } catch (e) { console.log("تخطى الداتابيز"); }
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = 'login.html'; // تعديل: يرجع لصفحة الدخول مش الرئيسية
    } catch (error) {
        console.error("مشكلة في الخروج:", error);
    }
}

export function initAuthListener() {
    onAuthStateChanged(auth, (user) => {
        const currentPath = window.location.pathname;
        
        // لو إحنا في Localhost أو GitHub Pages المسار ممكن يختلف
        const isLoginPage = currentPath.includes('login.html') || currentPath.includes('register.html') || currentPath === '/' || currentPath.endsWith('index.html');
        const isDashboard = currentPath.includes('dashboard.html') || currentPath.includes('settings.html') || currentPath.includes('reports.html');

        if (user) {
            localStorage.setItem('user_uid', user.uid);
            if (isLoginPage) {
                // لو اليوزر مسجل، وديه الداشبورد علطول
                window.location.href = 'dashboard.html';
            }
        } else {
            localStorage.removeItem('user_uid');
            if (isDashboard) {
                // لو مش مسجل، خرجه بره
                window.location.href = 'login.html';
            }
        }
    });
}