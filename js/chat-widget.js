/*
  Chat Widget
  بيخلق زرار شات عائم في الصفحة، ولما تدوس عليه يفتح محادثة مع البوت
*/

import { sendMessageToBot } from './ai-bot.js';

document.addEventListener('DOMContentLoaded', () => {
    injectChatStyles();
    createChatWidget();
});

function injectChatStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        .chat-btn-float {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            cursor: pointer;
            z-index: 9999;
            transition: all 0.3s ease;
        }
        .chat-btn-float:hover { transform: scale(1.1); }
        
        .chat-window {
            position: fixed;
            bottom: 90px;
            left: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.15);
            z-index: 9999;
            display: none; /* مخفي في البداية */
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        .chat-header {
            background: #064e3b;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-body {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .chat-input-area {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            background: white;
        }
        .msg {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 14px;
            line-height: 1.4;
        }
        .msg-user {
            background: #10b981;
            color: white;
            align-self: flex-end;
            border-bottom-left-radius: 2px;
        }
        .msg-bot {
            background: #e5e7eb;
            color: #1f2937;
            align-self: flex-start;
            border-bottom-right-radius: 2px;
        }
        .typing { font-size: 12px; color: #888; margin-bottom: 5px; display: none; }
    `;
    document.head.appendChild(style);
}

function createChatWidget() {
    // 1. إنشاء الزر العائم
    const btn = document.createElement('div');
    btn.className = 'chat-btn-float';
    btn.innerHTML = '<i class="fas fa-robot"></i>';
    document.body.appendChild(btn);

    // 2. إنشاء نافذة الشات
    const windowDiv = document.createElement('div');
    windowDiv.className = 'chat-window';
    windowDiv.innerHTML = `
        <div class="chat-header">
            <div class="font-bold flex items-center gap-2">
                <i class="fas fa-leaf"></i> رفيق الذكي
            </div>
            <div class="cursor-pointer close-chat"><i class="fas fa-times"></i></div>
        </div>
        <div class="chat-body" id="chatBody">
            <div class="msg msg-bot">السلام عليكم! أنا رفيقك في رحلة التزكية.. اسألني أو فضفض معايا 💚</div>
        </div>
        <div class="typing px-4">جاري الكتابة...</div>
        <div class="chat-input-area">
            <input type="text" id="chatInput" placeholder="اكتب رسالتك..." class="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <button id="sendBtn" class="bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-emerald-700 transition">
                <i class="fas fa-paper-plane text-sm"></i>
            </button>
        </div>
    `;
    document.body.appendChild(windowDiv);

    // 3. تفعيل الأحداث (Events)
    const chatBody = windowDiv.querySelector('#chatBody');
    const input = windowDiv.querySelector('#chatInput');
    const sendBtn = windowDiv.querySelector('#sendBtn');
    const typingIndicator = windowDiv.querySelector('.typing');

    // فتح/قفل الشات
    btn.addEventListener('click', () => {
        windowDiv.style.display = windowDiv.style.display === 'flex' ? 'none' : 'flex';
        if (windowDiv.style.display === 'flex') input.focus();
    });

    windowDiv.querySelector('.close-chat').addEventListener('click', () => {
        windowDiv.style.display = 'none';
    });

    // إرسال الرسالة
    async function handleSend() {
        const text = input.value.trim();
        if (!text) return;

        // عرض رسالة المستخدم
        appendMessage(text, 'user');
        input.value = '';

        // إظهار جاري الكتابة
        typingIndicator.style.display = 'block';
        chatBody.scrollTop = chatBody.scrollHeight;

        // الرد من البوت
        const reply = await sendMessageToBot(text);
        
        typingIndicator.style.display = 'none';
        appendMessage(reply, 'bot');
    }

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `msg msg-${sender}`;
        div.textContent = text;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}