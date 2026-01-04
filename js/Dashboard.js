/*
  Dashboard.js (نسخة المطور المحترف)
  ده المخ اللي بيحرك الصفحة كلها: بيجيب البيانات ويعرضها
*/

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getPrayerTimes, getNextPrayer } from './prayers.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. التأكد من هوية المستخدم وتحديث بياناته في الصفحة
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("اليوزر موجود:", user.displayName);
            updateUserProfileUI(user);
            loadUserHabits(user.uid);
        } else {
            // لو مش مسجل، رجعه يسجل (حماية للصفحة)
            window.location.href = 'login.html';
        }
    });

    // 2. تشغيل مواقيت الصلاة
    initPrayerSection();
});

// دالة لتحديث الاسم والصورة
function updateUserProfileUI(user) {
    // تحديث الاسم في الهيدر والترحيب
    const nameElements = document.querySelectorAll('.user-name-display'); // ضيف الكلاس ده للأسماء في الـ HTML
    // لو مفيش كلاسات، هندور بالـ Selectors العادية اللي في القالب بتاعنا
    const headerName = document.querySelector('header .text-sm.font-semibold');
    const welcomeName = document.querySelector('.welcome-widget-circle').parentElement.querySelector('h2');
    
    if (headerName) headerName.textContent = user.displayName || "يا بطل";
    if (welcomeName) welcomeName.textContent = `السلام عليكم يا ${user.displayName.split(' ')[0]} 👋`;

    // تحديث الصورة لو موجودة
    if (user.photoURL) {
        const avatarDiv = document.querySelector('header .w-10.h-10');
        if (avatarDiv) {
            avatarDiv.innerHTML = `<img src="${user.photoURL}" class="w-full h-full rounded-full object-cover" alt="Avatar">`;
        }
    }
}

// دالة إدارة الصلاة
async function initPrayerSection() {
    const timings = await getPrayerTimes();
    if (!timings) return;

    const nextPrayer = getNextPrayer(timings);
    
    // تحديث كارت الصلاة
    const prayerCard = document.querySelector('.border-emerald-500'); // بنمسك الكارت بلونه
    if (prayerCard) {
        const statusText = prayerCard.querySelector('p.text-xs');
        if (statusText) {
            if (nextPrayer.nextDay) {
                statusText.innerHTML = `الصلاة القادمة: <span class="font-bold text-emerald-600">${nextPrayer.name_ar}</span> (غداً)`;
            } else {
                statusText.innerHTML = `الصلاة القادمة: <span class="font-bold text-emerald-600">${nextPrayer.name_ar}</span> (باقي ${nextPrayer.remainingMinutes} دقيقة)`;
            }
        }

        // تحديث البروجرس بار حسب الوقت في اليوم
        const now = new Date();
        const startOfDay = new Date().setHours(0,0,0,0);
        const endOfDay = new Date().setHours(23,59,59,999);
        const totalDayMinutes = (endOfDay - startOfDay) / 60000;
        const currentMinutes = (now - startOfDay) / 60000;
        const percent = Math.min(100, Math.max(0, (currentMinutes / totalDayMinutes) * 100));
        
        const progressBar = prayerCard.querySelector('.bg-emerald-500.h-2\\.5');
        if (progressBar) progressBar.style.width = `${percent}%`;
    }
}

// دالة تحميل العادات (السنن)
async function loadUserHabits(uid) {
    // هنا المفروض نجيب العادات من الفايربيس، بس مؤقتاً هنخليها شغالة "لوكال" عشان السرعة
    // ونربط الـ Checkboxes بحدث التغيير
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(box => {
        // استرجاع الحالة المحفوظة
        const habitKey = `habit_${uid}_${box.nextElementSibling.textContent.trim()}_${new Date().toISOString().split('T')[0]}`;
        const savedState = localStorage.getItem(habitKey);
        if (savedState === 'true') box.checked = true;

        // عند الضغط
        box.addEventListener('change', (e) => {
            localStorage.setItem(habitKey, e.target.checked);
            // تشغيل صوت تشجيعي بسيط لو حبيت
            if (e.target.checked) {
                console.log("عاش! الله يتقبل 🤲");
            }
        });
    });
}