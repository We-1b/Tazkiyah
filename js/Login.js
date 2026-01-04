/*
  =========================================================
  اسم الملف: js/login.js
  الوصف: كود صفحة تسجيل الدخول (تم إضافة فحص للأخطاء)
  =========================================================
*/

import { loginWithGoogle, loginUser } from './auth.js';

console.log("🚀 ملف login.js بدأ العمل...");

// 1. تعريف العناصر
const googleBtn = document.getElementById('googleLoginBtn');
const emailForm = document.getElementById('emailLoginForm');
const errorMsg = document.getElementById('errorMessage');

// 2. تشغيل زرار جوجل
if (googleBtn) {
    console.log("✅ زرار جوجل موجود وجاهز");
    
    googleBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // عشان ميعملش ريفريش لوحده
        console.log("🖱️ تم الضغط على زرار جوجل");

        // نغير شكل الزرار عشان تعرف إنه شغال
        const originalContent = googleBtn.innerHTML;
        googleBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-emerald-600"></i> جاري الاتصال...';
        googleBtn.style.opacity = "0.7";
        googleBtn.style.pointerEvents = "none"; // نمنع الدوس مرتين

        try {
            // بننادي على دالة الدخول من ملف auth.js
            const result = await loginWithGoogle();

            if (!result.success) {
                throw new Error(result.error);
            }
            // لو نجح، الكود في auth.js هيحولك للداشبورد لوحده
        } catch (err) {
            console.error("❌ فشل الدخول:", err);
            
            // نرجع الزرار زي ما كان
            googleBtn.innerHTML = originalContent;
            googleBtn.style.opacity = "1";
            googleBtn.style.pointerEvents = "auto";
            
            showError("فشل الدخول: " + err.message);
        }
    });
} else {
    console.error("❌ كارثة: زرار جوجل مش موجود! اتأكد إن الـ ID بتاعه في HTML هو 'googleLoginBtn'");
}

// 3. تشغيل دخول الإيميل
if (emailForm) {
    console.log("✅ فورم الإيميل موجود");
    
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("📨 جاري الدخول بالإيميل...");

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = emailForm.querySelector('button');
        const originalText = btn.innerHTML;

        btn.innerHTML = 'جاري التحقق...';
        btn.disabled = true;
        if (errorMsg) errorMsg.classList.add('hidden');

        const result = await loginUser(email, password);

        if (!result.success) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            let msg = "البيانات غير صحيحة.";
            if (result.error.includes("user-not-found")) msg = "هذا البريد غير مسجل.";
            if (result.error.includes("wrong-password")) msg = "كلمة المرور خاطئة.";
            
            showError(msg);
        }
    });
}

function showError(msg) {
    if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
        errorMsg.style.display = 'block';
    } else {
        alert(msg);
    }
}