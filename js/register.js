/*
  =========================================================
  اسم الملف: js/register.js
  الوصف: التحكم في إنشاء الحساب (إيميل فقط)
  =========================================================
*/

import { registerUser } from './auth.js'; 
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const regForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('regError');

// تشغيل تسجيل الإيميل والباسورد
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // جلب القيم وتنظيف الفراغات الزيادة
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const btn = regForm.querySelector('button[type="submit"]');

        // --- خطوة الأمان: التأكد من البيانات ---
        if (!name || !email || !password) {
            showError("يا بطل، لازم تملأ كل البيانات (الاسم، الإيميل، والباسورد) 😉");
            return;
        }

        if (password.length < 6) {
            showError("كلمة المرور ضعيفة، خليها 6 حروف أو أرقام على الأقل 🔐");
            return;
        }

        // تغيير حالة الزرار
        const originalText = btn.textContent;
        btn.textContent = 'جاري تسجيلك... ⏳';
        btn.disabled = true;
        errorMsg.classList.add('hidden');

        try {
            // 1. إنشاء الحساب في Authentication
            const result = await registerUser(email, password);

            if (result.success) {
                console.log("✅ تم إنشاء الحساب بنجاح:", result.user.email);

                // 2. تحديث اسم المستخدم (Profile)
                try {
                    await updateProfile(result.user, { displayName: name });
                } catch (profileErr) {
                    console.warn("⚠️ تحذير: فشل تحديث الاسم في البروفايل", profileErr);
                }
                
                // 3. حفظ البيانات في الداتابيز (Firestore)
                // دي الخطوة اللي بتخلي الاسم يظهر عندك في الـ Console في users
                try {
                    const userRef = doc(db, "users", result.user.uid);
                    await setDoc(userRef, { 
                        name: name,
                        email: email,
                        createdAt: new Date(),
                        preferences: { showSunan: true, enableFasting: true }
                    }, { merge: true });
                    console.log("✅ تم حفظ البيانات في الداتابيز");
                } catch (dbError) {
                    console.error("⚠️ فشل الكتابة في الداتابيز:", dbError);
                }

                // 4. التحويل للداشبورد
                console.log("🚀 جاري التحويل للداشبورد...");
                window.location.href = 'dashboard.html';

            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            // التعامل مع الأخطاء
            btn.textContent = originalText;
            btn.disabled = false;
            
            console.error("❌ خطأ في التسجيل:", error);
            
            let message = "حدث خطأ: " + error.message;

            if (error.message.includes("email-already-in-use")) message = "البريد ده مستخدم قبل كده، جرب تسجل دخول.";
            if (error.message.includes("weak-password")) message = "الباسورد ضعيف، خليه 6 أرقام أو حروف على الأقل.";
            if (error.message.includes("invalid-email")) message = "شكل الإيميل مش مظبوط.";
            if (error.message.includes("operation-not-allowed")) message = "تنبيه هام: لازم تفعل Email/Password من لوحة تحكم فايربيس!";
            
            showError(message);
        }
    });
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}