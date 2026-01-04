/*
  Reports.js
  المسؤول عن تجميع البيانات التاريخية (أسبوعي/شهري) وعرضها
*/
import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await generateReports(user.uid);
    } else {
        window.location.href = 'login.html';
    }
});

async function generateReports(uid) {
    // 1. تحديد بداية الأسبوع (من 7 أيام فاتوا)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    // تحويل التاريخ لنص عشان نقارن بيه في الداتابيز (YYYY-MM-DD)
    const startDateStr = sevenDaysAgo.toISOString().split('T')[0];

    try {
        // 2. جلب البيانات من Firestore
        const logsRef = collection(db, "users", uid, "dailyLogs");
        // هات السجلات اللي تاريخها أكبر من أو يساوي 7 أيام فاتوا
        // ملاحظة: دي بتحتاج "Index" في فايربيس، لو طلع إيرور في الكونسول هيديك لينك تدوس عليه يعملهولك
        const q = query(logsRef, where("__name__", ">=", startDateStr)); // __name__ هو الـ ID بتاع المستند (التاريخ)
        
        const querySnapshot = await getDocs(q);
        
        let weeklyData = [];
        let totalCompletedTasks = 0;
        let daysCount = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // نحسب نسبة إنجاز اليوم ده
            // (ببساطة بنعد كام حاجة true)
            const completedCount = Object.values(data).filter(v => v === true).length;
            // بنفترض إن إجمالي المهام اليومية 5 صلوات + سنن (حوالي 8 مثلاً)
            const dailyScore = Math.min(100, Math.round((completedCount / 8) * 100));
            
            weeklyData.push({ date: doc.id, score: dailyScore });
            totalCompletedTasks += dailyScore;
            daysCount++;
        });

        // 3. عرض البيانات في الصفحة
        updateUI(weeklyData, totalCompletedTasks, daysCount);
        renderChart(weeklyData);

    } catch (error) {
        console.error("Error fetching reports:", error);
        document.getElementById('ai-insight').textContent = "لسه مفيش بيانات كفاية عشان نطلع تقرير.. شد حيلك اليومين دول! 💪";
    }
}

function updateUI(data, totalScore, days) {
    // حساب المتوسط الأسبوعي
    const average = days > 0 ? Math.round(totalScore / days) : 0;
    
    document.getElementById('weekly-score').textContent = `${average}%`;
    document.getElementById('streak-count').textContent = days; // تبسيط: بنعتبر الأيام المتسجلة هي الستريك

    // نصيحة الـ AI
    const insightElem = document.getElementById('ai-insight');
    if (average > 80) {
        insightElem.textContent = "ما شاء الله! أداء ممتاز وثبات رائع.. استمر على هذا المنوال 🌟";
    } else if (average > 50) {
        insightElem.textContent = "أداء جيد، لكن في أيام بتفلت منك.. حاول تركز على صلاة الفجر والورد اليومي.";
    } else {
        insightElem.textContent = "البدايات دايماً صعبة، ولا يهمك. ابدأ بتركيز على الفرائض بس الأسبوع ده.";
    }
}

function renderChart(data) {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    
    // تجهيز البيانات للرسم
    // لو مفيش بيانات لسه، بنحط بيانات وهمية (أصفار) عشان الشكل
    const labels = data.map(d => d.date.slice(5)); // بناخد الشهر واليوم بس (MM-DD)
    const scores = data.map(d => d.score);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            datasets: [{
                label: 'نسبة الإنجاز %',
                data: scores.length ? scores : [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#10b981',
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}