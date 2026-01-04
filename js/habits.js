/*
  Habits.js
  منطق التعامل مع الـ Checkboxes للسنن والصيام
*/

// قائمة العادات اللي بنتابعها
const HABITS = {
    sunan: ['سنة الفجر', 'سنة الظهر', 'سنة المغرب', 'سنة العشاء', 'الوتر', 'الضحى'],
    fasting: ['الاثنين', 'الخميس', 'الأيام البيض'],
    daily: ['أذكار الصباح', 'أذكار المساء', 'قراءة الورد']
};

export function toggleHabit(habitName, isChecked) {
    const today = new Date().toISOString().split('T')[0];
    let dailyLog = JSON.parse(localStorage.getItem(`habits_${today}`)) || {};
    
    dailyLog[habitName] = isChecked;
    
    localStorage.setItem(`habits_${today}`, JSON.stringify(dailyLog));
    
    updateProgressUI(); // تحديث شريط التقدم فوراً
    console.log(`تم تحديث العادة: ${habitName} -> ${isChecked}`);
}

function updateProgressUI() {
    // كود بيحسب عدد الـ True في اللوكال ستوريج ويحدث الـ Progress Bar
    const today = new Date().toISOString().split('T')[0];
    const dailyLog = JSON.parse(localStorage.getItem(`habits_${today}`)) || {};
    
    const totalHabits = Object.keys(HABITS.daily).length + Object.keys(HABITS.sunan).length; // تبسيط
    const completed = Object.values(dailyLog).filter(v => v === true).length;
    
    // هنا ممكن نبعت event للداشبورد عشان يحدث نفسه
    // document.dispatchEvent(new CustomEvent('habitsUpdated', { detail: { completed } }));
}

// التحقق من أيام الصيام
export function checkFastingDay() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 1 = Monday, 4 = Thursday
    
    if (dayOfWeek === 1 || dayOfWeek === 4) {
        return { isFastingDay: true, type: 'سنة مؤكدة (الاثنين/الخميس)' };
    }
    
    // هنا محتاجين مكتبة Hijri Date عشان الأيام البيض (13, 14, 15)
    return { isFastingDay: false };
}