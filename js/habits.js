/* js/habits.js */
import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function toggleHabit(name, checked) {
    const user = auth.currentUser;
    const today = new Date().toISOString().split('T')[0];
    
    // 1. تحديث محلي
    const key = `habits_${today}`;
    let data = JSON.parse(localStorage.getItem(key)) || {};
    data[name] = checked;
    localStorage.setItem(key, JSON.stringify(data));

    // 2. تحديث سيرفر
    if(user) {
        try {
            await setDoc(doc(db, "users", user.uid, "dailyLogs", today), {
                [name]: checked, lastUpdated: new Date()
            }, { merge: true });
        } catch(e) { console.error("Sync error:", e); }
    }
}