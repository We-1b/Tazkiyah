/*
  =========================================================
  اسم الملف: js/dashboard.js
  الوصف: المشغل الرئيسي (العدادات + تطبيق الإعدادات)
  =========================================================
*/

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getPrayerTimes, getNextPrayer, getHijriDateString } from './prayers.js';
import { toggleHabit } from './habits.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 الداشبورد بدأ...");
    
    setupMobileMenu();
    setupLogout();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("✅ المستخدم:", user.displayName);
            await loadUserData(user);
            await applyUserPreferences(user); // تطبيق الإعدادات (إخفاء/إظهار)
            
            setupHabitCheckboxes(user.uid); // تفعيل العدادات
            updateStatsUI(); // تحديث الأرقام
        } else {
            window.location.href = 'login.html';
        }
    });

    initPrayerSection();
});

// --- 1. دوال العدادات (Counters) ---
function setupHabitCheckboxes(uid) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(box => {
        const label = box.closest('label');
        if (!label) return;
        const habitName = label.querySelector('span').textContent.trim();
        const today = new Date().toISOString().split('T')[0];

        const savedState = localStorage.getItem(`habits_${today}`);
        if (savedState) {
            const data = JSON.parse(savedState);
            if (data[habitName]) box.checked = true;
        }

        box.addEventListener('change', async (e) => {
            await toggleHabit(habitName, e.target.checked);
            updateStatsUI(); // تحديث فوري للأرقام
        });
    });
}

function updateStatsUI() {
    // حساب الصلوات
    const prayerChecks = document.querySelectorAll('input[data-type="prayer"]');
    const prayersDone = Array.from(prayerChecks).filter(c => c.checked).length;
    const prayersTotal = prayerChecks.length || 5; 
    
    const prayerDisplay = document.getElementById('prayers-count-display');
    const prayerBar = document.getElementById('prayers-progress-bar');
    
    if (prayerDisplay) prayerDisplay.textContent = `${prayersDone}/${prayersTotal}`;
    if (prayerBar) prayerBar.style.width = `${(prayersDone / prayersTotal) * 100}%`;

    // حساب السنن
    const sunanChecks = document.querySelectorAll('input[data-type="sunnah"]');
    const sunanDone = Array.from(sunanChecks).filter(c => c.checked).length;
    const sunanTotal = sunanChecks.length || 12;

    const sunanDisplay = document.getElementById('sunan-count-display');
    const sunanBar = document.getElementById('sunan-progress-bar');
    
    if (sunanDisplay) sunanDisplay.textContent = `${sunanDone}/${sunanTotal}`;
    if (sunanBar) sunanBar.style.width = `${(sunanDone / sunanTotal) * 100}%`;
}

// --- 2. دوال الإعدادات (Preferences) ---
async function applyUserPreferences(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
            const prefs = snap.data().preferences;
            if (prefs) {
                // تطبيق إخفاء السنن
                const sunanCard = document.getElementById('card-sunan');
                const sunanItems = document.querySelectorAll('.sunnah-item');
                
                if (prefs.showSunan === false) {
                    if (sunanCard) sunanCard.style.display = 'none';
                    sunanItems.forEach(item => item.style.display = 'none');
                } else {
                    if (sunanCard) sunanCard.style.display = 'block';
                    sunanItems.forEach(item => item.style.display = 'flex');
                }
            }
        }
    } catch (e) {
        console.error("فشل تحميل الإعدادات:", e);
    }
}

// --- دوال مساعدة ---
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