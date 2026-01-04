/* js/ai-bot.js */
export async function sendMessageToBot(msg) {
    // محاكاة للرد (مؤقتاً)
    return new Promise(resolve => {
        setTimeout(() => {
            if(msg.includes('صلاة')) resolve("حافظ على صلاتك، فهي نور حياتك 🕌");
            else if(msg.includes('حزين')) resolve("ألا بذكر الله تطمئن القلوب 💚");
            else resolve("أنا معاك يا بطل، شد حيلك!");
        }, 1000);
    });
}