/* js/login.js - كود تشغيل صفحة الدخول */
import { loginWithGoogle, loginUser } from './auth.js';

const googleBtn = document.getElementById('googleLoginBtn');
const emailForm = document.getElementById('emailLoginForm');
const errorMsg = document.getElementById('errorMessage');

if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الاتصال...';
        googleBtn.disabled = true;
        
        const result = await loginWithGoogle();
        if (!result.success) {
            googleBtn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-6 h-6"> دخول بجوجل';
            googleBtn.disabled = false;
            showError("فشل الدخول: " + result.error);
        }
    });
}

if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const result = await loginUser(email, password);
        if (!result.success) showError("البيانات غير صحيحة");
    });
}

function showError(msg) {
    if(errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    } else { alert(msg); }
}