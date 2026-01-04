/* js/prayers.js */
const API_URL = "https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5";

export async function getPrayerTimes() {
    const today = new Date().toISOString().split('T')[0];
    const cached = localStorage.getItem(`prayers_${today}`);
    if(cached) return JSON.parse(cached);

    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if(data.code === 200) {
            localStorage.setItem(`prayers_${today}`, JSON.stringify(data.data.timings));
            localStorage.setItem(`hijri_${today}`, JSON.stringify(data.data.date.hijri));
            return data.data.timings;
        }
    } catch(e) { console.error(e); }
    return null;
}

export function getHijriDateString() {
    const today = new Date().toISOString().split('T')[0];
    const h = JSON.parse(localStorage.getItem(`hijri_${today}`));
    return h ? `${h.day} ${h.month.ar} ${h.year}هـ` : 'جاري التحميل...';
}

export function getNextPrayer(timings) {
    if(!timings) return null;
    const now = new Date();
    const cur = now.getHours()*60 + now.getMinutes();
    const prayers = [
        {en:'Fajr', ar:'الفجر'}, {en:'Dhuhr', ar:'الظهر'}, {en:'Asr', ar:'العصر'},
        {en:'Maghrib', ar:'المغرب'}, {en:'Isha', ar:'العشاء'}
    ];
    
    for(let p of prayers) {
        const [h,m] = timings[p.en].split(':').map(Number);
        const time = h*60 + m;
        if(time > cur) return {name_ar: p.ar, remainingMinutes: time - cur};
    }
    return {name_ar: 'الفجر (غداً)', remainingMinutes: 0};
}