/*
  Notifications.js
  إدارة التنبيهات والأصوات
*/

export function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("المتصفح ده مش بيدعم التنبيهات للأسف");
        return;
    }

    if (Notification.permission === "granted") {
        console.log("التنبيهات شغالة زي الفل");
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification("أهلاً بيك في تزكية! 🕌", {
                    body: "هنفكرك بمواعيد الصلاة والخير إن شاء الله.",
                    icon: "/images/icon-192.png"
                });
            }
        });
    }
}

export function playAdhan() {
    const audio = new Audio('/media/adhan.mp3');
    audio.play().catch(e => console.log("لازم تفاعل من اليوزر عشان الصوت يشتغل"));
}

export function scheduleNotification(title, body, timeInMs) {
    setTimeout(() => {
        if (Notification.permission === "granted") {
            new Notification(title, {
                body: body,
                icon: "/images/icon-192.png"
            });
            // شغل صوت تنبيه خفيف
            const alertSound = new Audio('/media/alert.mp3');
            alertSound.play().catch(() => {});
        }
    }, timeInMs);
}