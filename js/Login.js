/*
  Login.js
  التحكم في صفحة تسجيل الدخول
  - بيربط زرار جوجل بملف auth.js
  - بيعرض رسائل الخطأ لو حصلت
*/

import { loginWithGoogle, loginUser } from './auth.js';

// مسك العناصر
const googleBtn = document.getElementById('googleLoginBtn');
const emailForm = document.getElementById('emailLoginForm');
const errorMsg = document.getElementById('errorMessage');

// 1. تشغيل دخول جوجل
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        // تغيير شكل الزرار عشان اليوزر يعرف إنه بيحمل
        const originalContent = googleBtn.innerHTML;
        googleBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-emerald-600"></i> جاري الاتصال...';
        googleBtn.disabled = true;

        const result = await loginWithGoogle();

        if (!result.success) {
            // لو فشل، رجع الزرار واعرض الخطأ
            googleBtn.innerHTML = originalContent;
            googleBtn.disabled = false;
            showError("فشل الدخول بجوجل. تأكد من الإعدادات.");
            console.error(result.error);
        }
        // لو نجح، هو أوتوماتيك هيحولك للداشبورد من ملف auth.js
    });
}

// 2. تشغيل دخول الإيميل (لو حبيت تجربه)
if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = emailForm.querySelector('button');

        btn.textContent = 'جاري التحقق...';
        btn.disabled = true;

        const result = await loginUser(email, password);

        if (!result.success) {
            btn.textContent = 'دخول';
            btn.disabled = false;
            showError("البيانات غير صحيحة، حاول تاني.");
        }
    });
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}