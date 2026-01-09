/* js/habits.js - حفظ العادات في الداتابيز */
import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// الدالة دي بتستدعى لما اليوزر يعلم صح أو غلط
export async function toggleHabit(habitName, isCompleted) {
    const user = auth.currentUser;
    if (!user) {
        console.warn("⚠️ المستخدم غير مسجل، لن يتم الحفظ في السحابة.");
        return; 
    }

    const today = new Date().toISOString().split('T')[0];
    const logRef = doc(db, "users", user.uid, "dailyLogs", today);

    try {
        // حفظ في الداتابيز (Firestore)
        // بنستخدم merge: true عشان منمسحش باقي العادات اللي اتسجلت النهاردة
        await setDoc(logRef, {
            [habitName]: isCompleted, // اسم العادة وقيمتها (مثال: "صلاة الفجر": true)
            last_updated: new Date()
        }, { merge: true });

        console.log(`✅ تم حفظ "${habitName}" في السحابة.`);
    } catch (error) {
        console.error("❌ فشل الحفظ في السحابة:", error);
    }
}