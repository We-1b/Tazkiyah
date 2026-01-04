/*
  Register.js
  التحكم في صفحة إنشاء الحساب
  - إضافة دعم التسجيل بجوجل
  - إضافة دعم التسجيل بالإيميل
*/

import { registerUser, loginWithGoogle } from './auth.js'; // استوردنا دالة جوجل
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const regForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('regError');
const googleBtn = document.getElementById('googleRegisterBtn');

// 1. تشغيل زرار جوجل
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const originalContent = googleBtn.innerHTML;
        googleBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-emerald-600"></i> جاري الإنشاء...';
        googleBtn.disabled = true;

        // دالة loginWithGoogle في ملف auth.js ذكية:
        // لو الحساب مش موجود بتعمله create
        // لو موجود بتعمل login
        const result = await loginWithGoogle();

        if (!result.success) {
            googleBtn.innerHTML = originalContent;
            googleBtn.disabled = false;
            errorMsg.textContent = "حدث خطأ في التسجيل بجوجل.";
            errorMsg.classList.remove('hidden');
        }
    });
}

// 2. تشغيل فورم الإيميل
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = regForm.querySelector('button[type="submit"]');

        // تغيير حالة الزرار
        const originalText = btn.textContent;
        btn.textContent = 'جاري الإنشاء...';
        btn.disabled = true;
        errorMsg.classList.add('hidden');

        // إنشاء الحساب
        const result = await registerUser(email, password);

        if (result.success) {
            try {
                // تحديث اسم المستخدم
                await updateProfile(result.user, { displayName: name });
                
                // تحديث الاسم في الداتابيز
                const userRef = doc(db, "users", result.user.uid);
                await updateDoc(userRef, { name: name });

                window.location.href = 'dashboard.html';
                
            } catch (error) {
                console.error("Error updating profile:", error);
                window.location.href = 'dashboard.html';
            }
        } else {
            // فشل التسجيل
            btn.textContent = originalText;
            btn.disabled = false;
            
            let message = "حدث خطأ في التسجيل.";
            if (result.error.includes("email-already-in-use")) message = "البريد الإلكتروني مسجل بالفعل.";
            if (result.error.includes("weak-password")) message = "كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل).";
            
            errorMsg.textContent = message;
            errorMsg.classList.remove('hidden');
        }
    });
}