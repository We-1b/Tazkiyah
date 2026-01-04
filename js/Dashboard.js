/*
  =========================================================
  اسم الملف: js/dashboard.js
  الوصف: المشغل الرئيسي للوحة التحكم (مُحدث للتفاعل الحي)
  =========================================================
*/

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getPrayerTimes, getNextPrayer, getHijriDateString } from './prayers.js';
import { toggleHabit } from './habits.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 الداشبورد بدأ...");
    
    // تفعيل القائمة الجانبية والخروج
    setupMobileMenu();
    setupLogout();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("✅ المستخدم:", user.displayName);
            await loadUserData(user);
            
            // هنا السر: تفعيل التفاعل وحساب الإحصائيات
            setupHabitCheckboxes(user.uid);
            updateStatsUI(); // نحدث الأرقام أول ما الصفحة تفتح
        } else {
            window.location.href = 'login.html';
        }
    });

    initPrayerSection();
});

// --- دوال التفعيل ---

function setupMobileMenu() {
    const menuBtn = document.querySelector('.fa-bars');
    const sidebar = document.querySelector('aside');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('fixed');
            sidebar.classList.toggle('inset-0');
            sidebar.classList.toggle('z-50');
            sidebar.classList.toggle('w-full');
        });
    }
}

function setupLogout() {
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut(auth);
            window.location.href = 'login.html';
        });
    });
}

// دالة ربط التشيك بوكس وتحديث الأرقام
function setupHabitCheckboxes(uid) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(box => {
        const label = box.closest('label');
        if (!label) return;
        const habitName = label.querySelector('span').textContent.trim();
        const today = new Date().toISOString().split('T')[0];

        // استرجاع الحالة المحفوظة
        const savedState = localStorage.getItem(`habits_${today}`);
        if (savedState) {
            const data = JSON.parse(savedState);
            if (data[habitName]) box.checked = true;
        }

        // عند التغيير: احفظ، وحدث الأرقام فوراً
        box.addEventListener('change', async (e) => {
            await toggleHabit(habitName, e.target.checked);
            updateStatsUI(); // دي اللي هتغير الرقم فوق 🔄
        });
    });
}

// --- الدالة الجديدة لتحديث العدادات في الكروت ---
function updateStatsUI() {
    // 1. حساب الصلوات
    const prayerChecks = document.querySelectorAll('input[data-type="prayer"]');
    const prayersDone = Array.from(prayerChecks).filter(c => c.checked).length;
    const prayersTotal = prayerChecks.length || 5; // لو مفيش تشيك بوكس، نفترض 5
    
    // تحديث النص (مثلاً 2/5)
    const prayerDisplay = document.getElementById('prayers-count-display');
    if (prayerDisplay) prayerDisplay.textContent = `${prayersDone}/${prayersTotal}`;

    // تحديث البار الأخضر
    const prayerBar = document.getElementById('prayers-progress-bar');
    if (prayerBar) prayerBar.style.width = `${(prayersDone / prayersTotal) * 100}%`;


    // 2. حساب السنن
    const sunanChecks = document.querySelectorAll('input[data-type="sunnah"]');
    const sunanDone = Array.from(sunanChecks).filter(c => c.checked).length;
    const sunanTotal = sunanChecks.length || 12;

    const sunanDisplay = document.getElementById('sunan-count-display');
    if (sunanDisplay) sunanDisplay.textContent = `${sunanDone}/${sunanTotal}`;

    const sunanBar = document.getElementById('sunan-progress-bar');
    if (sunanBar) sunanBar.style.width = `${(sunanDone / sunanTotal) * 100}%`;
}

async function loadUserData(user) {
    document.querySelectorAll('.user-name-display').forEach(el => 
        el.textContent = user.displayName || 'يا بطل'
    );
    const hijriDate = document.getElementById('current-hijri-date');
    if (hijriDate) hijriDate.textContent = getHijriDateString();
}

async function initPrayerSection() {
    const timings = await getPrayerTimes();
    if (timings) {
        const nextPrayer = getNextPrayer(timings);
        const prayerText = document.getElementById('next-prayer-text');
        if (prayerText && nextPrayer) {
            prayerText.innerHTML = `الصلاة القادمة: <span class="text-emerald-600 font-bold">${nextPrayer.name_ar}</span> (باقي ${nextPrayer.remainingMinutes} دقيقة)`;
        }
    }
}