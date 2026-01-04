/*
  ملف التحكم في الدخول (Google & Email)
  تم التحديث: إضافة الدخول بجوجل وحفظ بيانات المستخدم في Firestore
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
// 1. دالة تسجيل الدخول بجوجل (Google Sign-In)
// ==========================================
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // هنتأكد هل اليوزر ده جديد ولا قديم؟
        // عشان لو جديد، نجهزه الداتابيز بتاعته (إعدادات افتراضية)
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // يوزر جديد: أنشئ له ملف في الداتابيز
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: new Date(),
                // هنا الإعدادات الافتراضية اللي اليوزر يقدر يعدلها براحته بعدين
                preferences: {
                    showSunan: true,      // إظهار السنن (افتراضي: نعم)
                    enableFasting: true,  // تذكير الصيام
                    dailyTarget: "medium" // مستوى الالتزام
                },
                customHabits: [] // مصفوفة فاضية يضيف فيها اللي هو عايزه
            });
            console.log("تم إنشاء ملف مستخدم جديد في قاعدة البيانات 🎉");
        }

        console.log("تم تسجيل الدخول بنجاح:", user.displayName);
        window.location.href = 'dashboard.html'; // تحويل للداشبورد
        return { success: true, user: user };

    } catch (error) {
        console.error("خطأ في دخول جوجل:", error.message);
        alert("حصل مشكلة في تسجيل الدخول، حاول تاني.");
        return { success: false, error: error.message };
    }
}

// ==========================================
// 2. الدوال العادية (إيميل وباسورد) - زي ما هي
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
        // برضه هننشئ له داتابيز لو سجل بإيميل
        await setDoc(doc(db, "users", result.user.uid), {
            email: email,
            createdAt: new Date(),
            preferences: { showSunan: true, enableFasting: true },
            customHabits: []
        });
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("مشكلة في الخروج:", error);
    }
}

export function initAuthListener() {
    onAuthStateChanged(auth, (user) => {
        const currentPath = window.location.pathname;
        if (user) {
            localStorage.setItem('user_uid', user.uid);
            if (currentPath.includes('login.html')) window.location.href = 'dashboard.html';
        } else {
            localStorage.removeItem('user_uid');
            if (currentPath.includes('dashboard.html')) window.location.href = 'login.html';
        }
    });
}