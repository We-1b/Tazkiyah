/* js/dashboard.js - مشغل الداشبورد الموحد */
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getPrayerTimes, getNextPrayer, getHijriDateString } from './prayers.js';
import { toggleHabit } from './habits.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. تفعيل القائمة والخروج
    setupMobileMenu();
    setupLogout();

    // 2. مراقبة المستخدم
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("✅ المستخدم نشط:", user.displayName);
            await loadUserData(user);
            await applyUserPreferences(user);
            setupHabits(user.uid);
            updateStats();
        } else {
            window.location.href = 'login.html';
        }
    });

    // 3. المواقيت
    initPrayers();
});

function setupHabits(uid) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(box => {
        const label = box.closest('label');
        if(!label) return;
        const name = label.querySelector('span').textContent.trim();
        const today = new Date().toISOString().split('T')[0];
        
        // استرجاع
        const saved = localStorage.getItem(`habits_${today}`);
        if(saved) {
            const data = JSON.parse(saved);
            if(data[name]) box.checked = true;
        }

        // تفاعل
        box.addEventListener('change', async (e) => {
            await toggleHabit(name, e.target.checked);
            updateStats();
        });
    });
}

function updateStats() {
    // حساب الصلوات
    const pChecks = document.querySelectorAll('input[data-type="prayer"]');
    const pDone = Array.from(pChecks).filter(c => c.checked).length;
    const pTotal = pChecks.length || 5;
    
    document.getElementById('prayers-count-display').textContent = `${pDone}/${pTotal}`;
    document.getElementById('prayers-progress-bar').style.width = `${(pDone/pTotal)*100}%`;

    // حساب السنن
    const sChecks = document.querySelectorAll('input[data-type="sunnah"]');
    const sDone = Array.from(sChecks).filter(c => c.checked).length;
    const sTotal = sChecks.length || 12;
    
    document.getElementById('sunan-count-display').textContent = `${sDone}/${sTotal}`;
    document.getElementById('sunan-progress-bar').style.width = `${(sDone/sTotal)*100}%`;
}

async function loadUserData(user) {
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.displayName || 'يا بطل');
    document.getElementById('current-hijri-date').textContent = getHijriDateString();
}

async function applyUserPreferences(user) {
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if(snap.exists() && snap.data().preferences?.showSunan === false) {
            document.getElementById('card-sunan').style.display = 'none';
            document.querySelectorAll('.sunnah-item').forEach(el => el.style.display = 'none');
        }
    } catch(e) { console.log(e); }
}

async function initPrayers() {
    const timings = await getPrayerTimes();
    if(timings) {
        const next = getNextPrayer(timings);
        document.getElementById('next-prayer-text').innerHTML = `القادمة: <span class="text-emerald-600 font-bold">${next.name_ar}</span> (${next.remainingMinutes}د)`;
    }
}

function setupMobileMenu() {
    const btn = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('aside');
    if(btn && sidebar) {
        btn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('fixed'); sidebar.classList.toggle('inset-0'); sidebar.classList.toggle('z-50'); sidebar.classList.toggle('w-full');
        });
    }
}

function setupLogout() {
    document.querySelectorAll('.logout-btn').forEach(b => {
        b.addEventListener('click', async () => { await signOut(auth); window.location.href = 'login.html'; });
    });
}