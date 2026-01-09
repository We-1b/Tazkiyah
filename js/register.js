/*
  =========================================================
  اسم الملف: js/register.js
  الوصف: التحكم في إنشاء الحساب (إصلاح خطأ الباسورد)
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
        
        // 1. جلب القيم وتنظيف الفراغات
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const btn = regForm.querySelector('button[type="submit"]');

        // 2. التأكد إن مفيش حاجة فاضية
        if (!name || !email || !password) {
            showError("يا بطل، لازم تملأ كل البيانات (الاسم، الإيميل، والباسورد) 😉");
            return;
        }

        if (password.length < 6) {
            showError("كلمة المرور ضعيفة، خليها 6 حروف أو أرقام على الأقل 🔐");
            return;
        }

        // 3. تغيير حالة الزرار (تحميل)
        const originalText = btn.textContent;
        btn.textContent = 'جاري تحضير حسابك... 🚀';
        btn.disabled = true;
        errorMsg.classList.add('hidden');

        try {
            // أ. إرسال البيانات (الاسم، الإيميل، الباسورد) للدالة
            // التعديل هنا: ضفت variable 'name' في الأول
            const result = await registerUser(name, email, password);

            if (result.success) {
                console.log("✅ تم إنشاء الحساب:", result.user.email);

                // ب. تحديث البروفايل وحفظ البيانات في الداتابيز
                // بنستخدم Promise.all عشان نعمل الخطوتين مع بعض أسرع
                await Promise.all([
                    updateProfile(result.user, { displayName: name }),
                    setDoc(doc(db, "users", result.user.uid), { 
                        name: name,
                        email: email,
                        createdAt: new Date(),
                        preferences: { showSunan: true, enableFasting: true } // الإعدادات الافتراضية
                    }, { merge: true })
                ]);

                console.log("✅ البيانات اتحفظت، جاري الدخول...");
                
                // ج. توجيه مباشر للداشبورد
                window.location.href = 'dashboard.html';

            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            btn.textContent = originalText;
            btn.disabled = false;
            
            console.error("❌ خطأ:", error);
            
            // ترجمة الأخطاء عشان اليوزر يفهم
            let message = "حدث خطأ غير متوقع.";
            if (error.message.includes("email-already-in-use")) message = "الإيميل ده متسجل قبل كده! جرب تعمل دخول.";
            if (error.message.includes("weak-password")) message = "الباسورد ضعيف جداً.";
            if (error.message.includes("invalid-email")) message = "شكل الإيميل مش مظبوط.";
            if (error.message.includes("network-request-failed")) message = "اتأكد من اتصالك بالنت.";
            
            showError(message);
        }
    });
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}