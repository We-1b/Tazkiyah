/*
  =========================================================
  اسم الملف: js/dashboard.js
  الوصف: "المشغل" الرئيسي للوحة التحكم (محدث)
  - بيجيب بيانات اليوزر
  - بيحسب مواقيت الصلاة
  - بيحدث العادات وشريط التقدم
  =========================================================
*/

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getPrayerTimes, getHijriDateString, getNextPrayer } from './prayers.js';
import { toggleHabit } from './habits.js';

// أول ما الصفحة تحمل، نشتغل
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    // 1. التأكد من تسجيل الدخول
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // تحديث اسم المستخدم في الهيدر
            updateUserName(user);
            
            // تشغيل وظائف الداشبورد
            await loadDashboardData(user.uid);
        } else {
            // لو مش مسجل، رجعه يسجل
            window.location.href = 'login.html';
        }
    });
}

// دالة تحديث الاسم
function updateUserName(user) {
    const nameElements = document.querySelectorAll('.user-name-display');
    nameElements.forEach(el => {
        el.textContent = user.displayName || "يا بطل";
    });
}

// تحميل كل بيانات الصفحة
async function loadDashboardData(uid) {
    console.log("🔄 جاري تحميل بيانات الداشبورد...");

    // أ. التاريخ الهجري والمواقيت
    const hijriDate = getHijriDateString();
    const hijriEl = document.getElementById('current-hijri-date');
    if(hijriEl) hijriEl.textContent = hijriDate;

    const timings = await getPrayerTimes();
    if (timings) {
        updateNextPrayerUI(timings);
    }

    // ب. تحميل حالة العادات (الصح اللي عملناه النهاردة)
    await loadHabitsStatus(uid);
}

// تحديث واجهة الصلاة القادمة
function updateNextPrayerUI(timings) {
    const nextPrayerObj = getNextPrayer(timings);
    const nextPrayerEl = document.getElementById('next-prayer-text');
    
    if (nextPrayerEl && nextPrayerObj) {
        nextPrayerEl.textContent = `القادمة: ${nextPrayerObj.name_ar} (بعد ${nextPrayerObj.remainingMinutes} دقيقة)`;
    }
}

// تحميل العادات من الداتابيز وتفعيل الزراير
async function loadHabitsStatus(uid) {
    const today = new Date().toISOString().split('T')[0];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    // 1. هات السجل بتاع النهاردة من الداتابيز
    const logRef = doc(db, "users", uid, "dailyLogs", today);
    let todayLog = {};

    try {
        const docSnap = await getDoc(logRef);
        if (docSnap.exists()) {
            todayLog = docSnap.data();
            console.log("✅ البيانات اللي جت من الداتابيز:", todayLog);
        }
    } catch (e) {
        console.error("⚠️ مش عارف أجيب البيانات:", e);
    }

    // 2. تفعيل الزراير وتحديث حالتها
    checkboxes.forEach(box => {
        // بنحاول نجيب اسم العادة من الـ HTML
        // يفضل تضيف attribute اسمه name="fajr" في الـ HTML لكل input
        // الحل البديل: بنجيب النص اللي جنب الـ checkbox
        const labelText = box.closest('label').querySelector('span.font-medium').textContent.trim();
        
        // لو العادة دي موجودة في الداتابيز بـ true، علم عليها
        if (todayLog[labelText] === true) {
            box.checked = true;
        }

        // لما اليوزر يغير الحالة
        box.addEventListener('change', async (e) => {
            const isChecked = e.target.checked;
            console.log(`📝 تحديث: ${labelText} -> ${isChecked}`);
            
            // ابعت لملف habits.js يحفظ في الداتابيز
            await toggleHabit(labelText, isChecked);
            
            // حدث الشريط الملون
            updateProgressBars();
        });
    });

    // تحديث الشريط لأول مرة
    updateProgressBars();
}

function updateProgressBars() {
    // حسبة بسيطة لتحديث البار الملون للصلوات
    const allPrayers = document.querySelectorAll('input[data-type="prayer"]');
    const checkedPrayers = document.querySelectorAll('input[data-type="prayer"]:checked');
    
    const prayerBar = document.getElementById('prayers-progress-bar');
    const prayerCount = document.getElementById('prayers-count-display');
    
    if (prayerBar && allPrayers.length > 0) {
        const percent = (checkedPrayers.length / allPrayers.length) * 100;
        prayerBar.style.width = `${percent}%`;
        if (prayerCount) prayerCount.textContent = `${checkedPrayers.length}/${allPrayers.length}`;
    }
}