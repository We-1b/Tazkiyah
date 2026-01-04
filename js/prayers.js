/*
  Prayers.js (مُحدث)
  - بيجيب مواقيت الصلاة من API.
  - بيجيب التاريخ الهجري أوتوماتيك.
  - بيحسب الصلاة اللي عليها الدور.
*/

const API_URL = "https://api.aladhan.com/v1/timingsByCity";
const CITY = "Cairo";     // ممكن تغيرها لدولة تانية أو تخليها ديناميك مستقبلاً
const COUNTRY = "Egypt";

// دالة جلب المواقيت
export async function getPrayerTimes() {
    const today = new Date().toISOString().split('T')[0];
    
    // لو البيانات متكيشة من الصبح، منعملش طلب جديد
    const cached = localStorage.getItem(`prayers_${today}`);
    if (cached) return JSON.parse(cached);

    try {
        // بنطلب المواقيت بطريقة "الهيئة المصرية العامة للمساحة" (method=5)
        const response = await fetch(`${API_URL}?city=${CITY}&country=${COUNTRY}&method=5`);
        const data = await response.json();
        
        if (data.code === 200) {
            const timings = data.data.timings;
            const hijri = data.data.date.hijri; // الـ API ده بيرجع التاريخ الهجري كمان!
            
            // نحفظ المواقيت والتاريخ الهجري في المتصفح
            localStorage.setItem(`prayers_${today}`, JSON.stringify(timings));
            localStorage.setItem(`hijri_${today}`, JSON.stringify(hijri));
            
            return timings;
        }
    } catch (error) {
        console.error("Prayer API Error:", error);
        return null;
    }
}

// دالة لعرض التاريخ الهجري في الهيدر
export function getHijriDateString() {
    const today = new Date().toISOString().split('T')[0];
    const savedHijri = JSON.parse(localStorage.getItem(`hijri_${today}`));

    if (savedHijri) {
        // مثال: 15 رمضان 1446هـ
        return `${savedHijri.day} ${savedHijri.month.ar} ${savedHijri.year}هـ`;
    }
    
    // لو لسه مجبناش الداتا، بنرجع التاريخ الهجري التقريبي من المتصفح
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());
}

// دالة حساب الصلاة القادمة والوقت المتبقي
export function getNextPrayer(timings) {
    if (!timings) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // الوقت الحالي بالدقايف
    
    const prayers = [
        { en: 'Fajr', ar: 'الفجر' },
        { en: 'Dhuhr', ar: 'الظهر' },
        { en: 'Asr', ar: 'العصر' },
        { en: 'Maghrib', 'ar': 'المغرب' },
        { en: 'Isha', 'ar': 'العشاء' }
    ];

    for (let p of prayers) {
        const [h, m] = timings[p.en].split(':').map(Number);
        const prayerTimeVal = h * 60 + m;
        
        if (prayerTimeVal > currentTime) {
            return { 
                name_ar: p.ar, 
                remainingMinutes: prayerTimeVal - currentTime,
                nextDay: false
            };
        }
    }
    
    // لو خلصنا العشاء، يبقى الصلاة الجاية الفجر بكرة
    return { name_ar: 'الفجر (غداً)', remainingMinutes: 0, nextDay: true };
}