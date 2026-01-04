/*
  Settings.js
  التحكم في إعدادات المستخدم وحفظها في Firebase
  - بيشغل زراير التحكم (Toggle Buttons).
  - بيحفظ اختياراتك (صوت، سنن، صيام) في الداتابيز.
*/

import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// مسك العناصر من الصفحة
const sunanToggle = document.getElementById('toggleSunan');
const fastingToggle = document.getElementById('toggleFasting');
const adhanToggle = document.getElementById('toggleAdhanSound');
const saveBtn = document.getElementById('saveSettingsBtn');

// 1. أول ما الصفحة تفتح، هات الإعدادات القديمة لو موجودة
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // بنجيب ملف اليوزر من الداتابيز
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // لو اليوزر ليه تفضيلات محفوظة، نطبقها
            const prefs = docSnap.data().preferences || {};
            
            // ضبط حالة الزراير (الافتراضي true لو مش موجود)
            if (sunanToggle) sunanToggle.checked = prefs.showSunan !== false; 
            if (fastingToggle) fastingToggle.checked = prefs.enableFasting !== false;
            if (adhanToggle) adhanToggle.checked = prefs.playAdhan === true;
        }
    } else {
        // لو مش مسجل دخول، ارميه بره
        window.location.href = 'login.html';
    }
});

// 2. لما يدوس حفظ
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;

        // غير شكل الزرار عشان اليوزر يعرف إننا شغالين
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'جاري الحفظ... ⏳';
        saveBtn.disabled = true;

        try {
            const userRef = doc(db, "users", user.uid);
            
            // تحديث البيانات في فايربيس
            await updateDoc(userRef, {
                preferences: {
                    showSunan: sunanToggle.checked,
                    enableFasting: fastingToggle.checked,
                    playAdhan: adhanToggle.checked
                }
            });
            
            // تأثير بصري للنجاح (زرار أخضر)
            saveBtn.textContent = 'تم الحفظ بنجاح ✅';
            saveBtn.classList.remove('bg-emerald-600');
            saveBtn.classList.add('bg-green-600');
            
            // رجع الزرار لأصله بعد ثانيتين
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.classList.add('bg-emerald-600');
                saveBtn.classList.remove('bg-green-600');
                saveBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error("Error saving settings:", error);
            saveBtn.textContent = 'حدث خطأ ❌';
            saveBtn.disabled = false;
        }
    });
}