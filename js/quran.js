/*
  Quran.js
  متابعة الورد اليومي وحفظ آخر صفحة وقفت عندها
*/

import { db } from './firebase-config.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// حفظ الصفحة الحالية
export async function saveQuranProgress(pageNumber, surahName) {
    const userId = localStorage.getItem('user_uid');
    
    // 1. حفظ محلي سريع
    localStorage.setItem('quran_last_page', pageNumber);
    localStorage.setItem('quran_last_surah', surahName);
    
    console.log(`تم حفظ الورد: سورة ${surahName} - صفحة ${pageNumber}`);

    // 2. حفظ في السحابة (لو اليوزر مسجل)
    if (userId) {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                "quran_progress": {
                    page: pageNumber,
                    surah: surahName,
                    last_updated: new Date()
                }
            });
        } catch (e) {
            console.log("تنبيه: لم يتم الحفظ أونلاين، النت ممكن يكون قاطع");
        }
    }
}

// استرجاع آخر قراءة
export function getLastRead() {
    return {
        page: localStorage.getItem('quran_last_page') || 1,
        surah: localStorage.getItem('quran_last_surah') || 'الفاتحة'
    };
}