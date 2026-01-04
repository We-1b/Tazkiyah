/*
  =========================================================
  اسم الملف: js/dashboard.js
  الوصف: المشغل الرئيسي للوحة التحكم (تم إصلاح التفاعل)
  =========================================================
*/

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getPrayerTimes, getNextPrayer, getHijriDateString } from './prayers.js';
import { toggleHabit, calculateDailyProgress } from './habits.js';

// بنستنى لما الصفحة كلها تحمل عشان نضمن إن الزراير موجودة
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 تم تحميل الصفحة، جاري تجهيز الداشبورد...");

    // 1. تفعيل زرار القائمة الجانبية (للموبايل)
    setupMobileMenu();

    // 2. تفعيل زرار الخروج
    setupLogout();

    // 3. مراقبة حالة المستخدم
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("✅ المستخدم مسجل:", user.displayName);
            await loadUserData(user);
            setupHabitCheckboxes(user.uid); // تفعيل التشيك بوكس
        } else {
            console.warn("⚠️ مفيش مستخدم، راجع لصفحة الدخول...");
            window.location.href = 'login.html';
        }
    });

    // 4. تشغيل المواقيت والتاريخ
    initPrayerSection();
});

// --- دوال التفعيل (Event Listeners) ---

function setupMobileMenu() {
    const menuBtn = document.querySelector('.fa-bars');
    const sidebar = document.querySelector('aside');
    
    if (menuBtn && sidebar) {
        // بنشيل أي مستمع قديم عشان ميتكررش
        const newBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newBtn, menuBtn);
        
        newBtn.addEventListener('click', () => {
            console.log("📱 تم الضغط على القائمة");
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('fixed');
            sidebar.classList.toggle('inset-0');
            sidebar.classList.toggle('z-50');
            sidebar.classList.toggle('w-full');
        });
    } else {
        console.error("❌ زرار القائمة مش موجود في الـ HTML");
    }
}

function setupLogout() {
    // بندور على أي زرار واخد كلاس logout-btn
    const logoutBtns = document.querySelectorAll('.logout-btn');
    
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("👋 جاري تسجيل الخروج...");
            try {
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                console.error("خطأ في الخروج:", error);
            }
        });
    });
}

function setupHabitCheckboxes(uid) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log(`🔎 لقينا ${checkboxes.length} عادات في الصفحة`);

    checkboxes.forEach(box => {
        // بنجيب اسم العادة من النص اللي جنبها
        const label = box.closest('label');
        if (!label) return;
        
        const habitName = label.querySelector('span').textContent.trim();
        const today = new Date().toISOString().split('T')[0];
        
        // استرجاع الحالة المحفوظة (عشان العلامة تفضل موجودة)
        const savedState = localStorage.getItem(`habits_${today}`);
        if (savedState) {
            const data = JSON.parse(savedState);
            if (data[habitName]) box.checked = true;
        }

        // عند الضغط (التفاعل)
        box.addEventListener('change', async (e) => {
            console.log(`✨ تم تغيير حالة العادة: ${habitName} -> ${e.target.checked}`);
            
            // تشغيل الأنيميشن وتحديث الداتا
            await toggleHabit(habitName, e.target.checked);
            
            // تحديث شريط التقدم (اختياري)
            const progress = calculateDailyProgress();
            console.log("نسبة الإنجاز الجديدة:", progress + "%");
        });
    });
}

// --- دوال البيانات والعرض ---

async function loadUserData(user) {
    // عرض الاسم والصورة
    const nameElements = document.querySelectorAll('.user-name-display');
    nameElements.forEach(el => el.textContent = user.displayName || 'يا بطل');
    
    // التاريخ الهجري
    const hijriDate = document.getElementById('current-hijri-date');
    if (hijriDate) hijriDate.textContent = getHijriDateString();
}

async function initPrayerSection() {
    try {
        const timings = await getPrayerTimes();
        if (!timings) return;

        const nextPrayer = getNextPrayer(timings);
        const prayerText = document.getElementById('next-prayer-text');
        
        if (prayerText && nextPrayer) {
            prayerText.innerHTML = `الصلاة القادمة: <span class="text-emerald-600 font-bold">${nextPrayer.name_ar}</span> (باقي ${nextPrayer.remainingMinutes} دقيقة)`;
        }
    } catch (e) {
        console.error("مشكلة في المواقيت:", e);
    }
}