/*
  =========================================================
  اسم الملف: js/register.js
  الوصف: التحكم في إنشاء الحساب (تركيز على الإيميل فقط)
  =========================================================
*/

import { registerUser } from './auth.js'; 
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const regForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('regError');
const googleBtn = document.getElementById('googleRegisterBtn');

// 1. (تم إيقاف جوجل مؤقتاً بناءً على طلبك) 🚫
if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        alert("خلينا شغالين بالإيميل دلوقتي أضمن 😉");
    });
}

// 2. تشغيل تسجيل الإيميل والباسورد (المهم) ✅
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = regForm.querySelector('button[type="submit"]');

        // تغيير حالة الزرار عشان تعرف إنه شغال
        const originalText = btn.textContent;
        btn.textContent = 'جاري تسجيلك... ⏳';
        btn.disabled = true;
        errorMsg.classList.add('hidden');

        try {
            // أ. إنشاء الحساب في Authentication
            const result = await registerUser(email, password);

            if (result.success) {
                console.log("✅ تم إنشاء الحساب بنجاح:", result.user.email);

                // ب. تحديث اسم المستخدم (Profile)
                try {
                    await updateProfile(result.user, { displayName: name });
                } catch (profileErr) {
                    console.warn("⚠️ تحذير: فشل تحديث الاسم في البروفايل (مش مشكلة)", profileErr);
                }
                
                // ج. محاولة حفظ البيانات في الداتابيز (Firestore)
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
                    console.error("⚠️ فشل الكتابة في الداتابيز (ممكن بسبب الـ Rules):", dbError);
                }

                // د. التحويل النهائي (أهم خطوة)
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
            
            // هنا بنعرض الخطأ الأصلي عشان نعرف السبب
            let message = "حدث خطأ: " + error.message;

            if (error.message.includes("email-already-in-use")) message = "البريد ده مستخدم قبل كده، جرب تسجل دخول.";
            if (error.message.includes("weak-password")) message = "الباسورد ضعيف، خليه 6 أرقام أو حروف على الأقل.";
            if (error.message.includes("invalid-email")) message = "شكل الإيميل مش مظبوط.";
            if (error.message.includes("operation-not-allowed")) message = "تنبيه هام: لازم تفعل Email/Password من لوحة تحكم فايربيس!";
            
            errorMsg.textContent = message;
            errorMsg.classList.remove('hidden');
        }
    });
}