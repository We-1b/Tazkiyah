/*
  =========================================================
  اسم الملف: js/auth.js
  الوصف: التحكم الكامل في الدخول والخروج وحفظ بيانات المستخدم
  =========================================================
*/

import { auth, googleProvider, db } from './firebase-config.js';
import { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. الدخول بجوجل ---
export async function loginWithGoogle() {
    try {
        console.log("🔵 جاري الاتصال بجوجل...");
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // حفظ بيانات المستخدم في Firestore
        await saveUserProfile(user);

        console.log("✅ تم الدخول:", user.displayName);
        window.location.href = 'dashboard.html';
        return { success: true, user };
    } catch (error) {
        console.error("❌ خطأ جوجل:", error);
        return { success: false, error: error.message };
    }
}

// --- 2. إنشاء حساب إيميل ---
export async function registerUser(name, email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // تحديث الاسم
        await updateProfile(user, { displayName: name });
        
        // حفظ في الداتابيز
        await saveUserProfile({ ...user, displayName: name });

        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// --- 3. دخول بالإيميل ---
export async function loginUser(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// --- 4. الخروج ---
export async function logoutUser() {
    await signOut(auth);
    window.location.href = 'login.html';
}

// --- دالة مساعدة: حفظ ملف المستخدم ---
async function saveUserProfile(user) {
    const userRef = doc(db, "users", user.uid);
    try {
        await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || "مستخدم جديد",
            email: user.email,
            photoURL: user.photoURL || "",
            lastLogin: new Date(),
            preferences: { showSunan: true, enableFasting: true } // إعدادات افتراضية
        }, { merge: true }); // merge عشان ميمسحش الداتا القديمة لو موجودة
    } catch (e) {
        console.error("⚠️ فشل حفظ البروفايل (مش مشكلة حرجة):", e);
    }
}

// --- مراقب الحالة ---
export function initAuthListener() {
    onAuthStateChanged(auth, (user) => {
        const path = window.location.pathname;
        const isPublicPage = path.includes('login') || path.includes('register') || path.endsWith('index.html') || path === '/';
        
        if (user) {
            if (isPublicPage) window.location.href = 'dashboard.html';
        } else {
            if (!isPublicPage && !path.includes('index')) window.location.href = 'login.html';
        }
    });
}