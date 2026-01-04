/*
  Prayers.js
  جلب مواقيت الصلاة من API خارجي وتحديد الصلاة القادمة
*/

const API_URL = "https://api.aladhan.com/v1/timingsByCity";

// إحنا هنثبت القاهرة كمثال، بس المفروض تجيب مكان اليوزر
const CITY = "Cairo";
const COUNTRY = "Egypt";

export async function getPrayerTimes() {
    try {
        const today = new Date().toISOString().split('T')[0]; // تاريخ النهاردة YYYY-MM-DD
        
        // هل البيانات متكيشة من قبل كدة؟ (عشان منطلبش الـ API كل شوية)
        const cachedPrayers = localStorage.getItem(`prayers_${today}`);
        if (cachedPrayers) {
            return JSON.parse(cachedPrayers);
        }

        // لو مش موجودة، هاتها من السيرفر
        const response = await fetch(`${API_URL}?city=${CITY}&country=${COUNTRY}&method=5`); // method 5 = الهيئة المصرية
        const data = await response.json();
        
        if (data.code === 200) {
            const timings = data.data.timings;
            // احفظها في اللوكال ستوريج
            localStorage.setItem(`prayers_${today}`, JSON.stringify(timings));
            return timings;
        }
    } catch (error) {
        console.error("فشل جلب مواقيت الصلاة:", error);
        return null; // ممكن ترجع مواقيت افتراضية
    }
}

// دالة لمعرفة الصلاة القادمة
export function getNextPrayer(timings) {
    if (!timings) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const arabicNames = {'Fajr': 'الفجر', 'Dhuhr': 'الظهر', 'Asr': 'العصر', 'Maghrib': 'المغرب', 'Isha': 'العشاء'};

    for (let prayer of prayerNames) {
        const [hours, minutes] = timings[prayer].split(':').map(Number);
        const prayerTime = hours * 60 + minutes;
        
        if (prayerTime > currentTime) {
            return {
                name_en: prayer,
                name_ar: arabicNames[prayer],
                time: timings[prayer],
                remainingMinutes: prayerTime - currentTime
            };
        }
    }
    
    // لو خلصنا العشاء، يبقى الصلاة الجاية الفجر (بكرة)
    return { name_ar: 'الفجر (غداً)', time: timings['Fajr'], nextDay: true };
}