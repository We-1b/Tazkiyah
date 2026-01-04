/*
  Habits.js (نسخة المزامنة)
  إدارة العادات ومزامنتها لحظياً مع Firebase Firestore
  - لما تعلم صح، بتسمع في المتصفح فوراً (عشان السرعة).
  - وفي الخلفية بتبعتها لفايربيس (عشان الأمان).
*/

import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// دالة لتبديل حالة العادة (Checked/Unchecked)
export async function toggleHabit(habitName, isChecked) {
    const user = auth.currentUser;
    const today = new Date().toISOString().split('T')[0]; // تاريخ النهاردة YYYY-MM-DD

    // 1. تحديث الواجهة فوراً (Optimistic UI) عشان اليوزر ميحسش بتقل
    updateLocalStorage(today, habitName, isChecked);

    // 2. التحديث في السيرفر (لو اليوزر مسجل)
    if (user) {
        try {
            // بنسجل كل يوم في Document منفصل عشان الداتا متكبرش قوي في ملف اليوزر
            // المسار: users -> {uid} -> dailyLogs -> {date}
            const logRef = doc(db, "users", user.uid, "dailyLogs", today);
            
            // بنستخدم setDoc مع merge: true عشان لو الملف مش موجود ينشئه، ولو موجود يحدثه بس
            await setDoc(logRef, {
                [habitName]: isChecked,
                lastUpdated: new Date()
            }, { merge: true });

            console.log(`تمت المزامنة: ${habitName} -> ${isChecked} ✅`);
        } catch (error) {
            console.error("فشل المزامنة مع السيرفر:", error);
            // ممكن هنا نعرض علامة تعجب حمراء جنب العادة لو حبيت تعقد الأمور
        }
    }
}

// دالة مساعدة للتخزين المحلي (عشان لو النت قطع، الداتا متضيعش من قدام اليوزر)
function updateLocalStorage(date, habitName, value) {
    const key = `habits_${date}`;
    let data = JSON.parse(localStorage.getItem(key)) || {};
    data[habitName] = value;
    localStorage.setItem(key, JSON.stringify(data));
}

// دالة لحساب نسبة الإنجاز اليومية (ممكن تستخدمها في الداشبورد)
export function calculateDailyProgress() {
    const today = new Date().toISOString().split('T')[0];
    const data = JSON.parse(localStorage.getItem(`habits_${today}`)) || {};
    
    // لنفترض أن عندنا عدد ثابت من المهام يومياً
    const totalTasks = 5; // (5 صلوات مثلاً)
    const completedTasks = Object.values(data).filter(v => v === true).length;
    
    return Math.min(100, Math.round((completedTasks / totalTasks) * 100));
}