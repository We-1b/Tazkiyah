/*
  =========================================================
  اسم الملف: js/main.js
  الوصف: الكود العام للتحكم في الموقع (الناف بار، التاريخ، PWA)
  =========================================================
*/

import { initAuthListener, logoutUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تفعيل مراقب تسجيل الدخول
    initAuthListener();

    // 2. تشغيل القائمة الجانبية في الموبايل (Mobile Menu Toggle)
    const menuBtn = document.querySelector('.fa-bars');
    const mobileMenu = document.querySelector('nav .hidden.md\\:flex'); // دي محتاجة تظبيط حسب الـ HTML
    
    // لو إحنا في الداشبورد، القائمة الجانبية (Sidebar) ليها كلاسات تانية
    const sidebarToggle = document.querySelector('.md\\:hidden.text-emerald-700');
    const sidebar = document.querySelector('aside');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('fixed');
            sidebar.classList.toggle('inset-0');
            sidebar.classList.toggle('z-50');
            sidebar.classList.toggle('w-full');
        });
    }

    // 3. عرض التاريخ الهجري والميلادي
    const dateElement = document.getElementById('current-time');
    if (dateElement) {
        const updateTime = () => {
            const now = new Date();
            // تنسيق بسيط للوقت
            dateElement.innerText = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        };
        updateTime();
        setInterval(updateTime, 60000); // تحديث كل دقيقة
    }

    // 4. تفعيل زر الخروج
    const logoutBtns = document.querySelectorAll('.logout-btn'); // ضيف الكلاس ده لزرار الخروج
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    });

    // 5. تسجيل الـ Service Worker (عشان الـ Offline Mode)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered 📡', reg.scope))
            .catch(err => console.log('Service Worker Failed ❌', err));
    }
});