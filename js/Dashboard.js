/*
  Dashboard.js
  مسؤول عن الرسوم البيانية وملخص الإحصائيات في الصفحة الرئيسية
*/

// هنفترض إننا بنجيب البيانات من LocalStorage أو Firebase
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    
    const userId = localStorage.getItem('user_uid');
    if (!userId) return; // لو مفيش يوزر، اطلع

    console.log("تحميل بيانات الداشبورد لليوزر:", userId);

    // 1. تحديث شريط التقدم للصلاة (مثال)
    // في الحقيقة هنجيب الداتا دي من habits.js أو prayers.js
    const prayersCompleted = 3; // مثال: صلى 3 فروض
    const totalPrayers = 5;
    const prayerProgress = (prayersCompleted / totalPrayers) * 100;
    
    // تلوين البروجرس بار
    const prayerBar = document.getElementById('prayer-progress-bar');
    if (prayerBar) {
        prayerBar.style.width = `${prayerProgress}%`;
        
        if (prayerProgress === 100) {
            prayerBar.classList.add('bg-emerald-600');
        }
    }

    // 2. رسالة الترحيب الديناميكية
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        const hour = new Date().getHours();
        let greeting = "السلام عليكم";
        if (hour < 12) greeting = "صباح الخير والبركة";
        else if (hour < 17) greeting = "مساء النور";
        else greeting = "تقبل الله طاعتك";
        
        welcomeMsg.innerText = `${greeting}، يا بطل 💪`;
    }

    // هنا ممكن نضيف Chart.js لو حبيت ترسم جرافيك معقد مستقبلاً
});