/* js/chat-widget.js - الشات العائم */
import { sendMessageToBot } from './ai-bot.js';

document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .chat-float { position: fixed; bottom: 20px; left: 20px; width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; z-index: 999; font-size: 24px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: 0.3s; }
        .chat-float:hover { transform: scale(1.1); }
        .chat-window { position: fixed; bottom: 90px; left: 20px; width: 320px; height: 450px; background: white; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); z-index: 999; display: none; flex-direction: column; overflow: hidden; border: 1px solid #eee; }
        .chat-head { background: #064e3b; color: white; padding: 15px; font-weight: bold; display: flex; justify-content: space-between; }
        .chat-body { flex: 1; padding: 10px; overflow-y: auto; background: #f9f9f9; }
        .chat-input { padding: 10px; border-top: 1px solid #eee; display: flex; gap: 5px; background: white; }
        .msg { padding: 8px 12px; border-radius: 15px; margin-bottom: 5px; max-width: 80%; font-size: 14px; }
        .msg-bot { background: #eee; align-self: flex-start; color: #333; }
        .msg-user { background: #10b981; align-self: flex-end; color: white; margin-right: auto; }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('div');
    btn.className = 'chat-float';
    btn.innerHTML = '<i class="fas fa-robot"></i>';
    document.body.appendChild(btn);

    const win = document.createElement('div');
    win.className = 'chat-window';
    win.innerHTML = `
        <div class="chat-head"><span>رفيق الذكي</span> <span class="cursor-pointer x-btn">✕</span></div>
        <div class="chat-body" id="cBody"><div class="msg msg-bot">السلام عليكم! أنا هنا لمساعدتك.</div></div>
        <div class="chat-input"><input id="cIn" class="flex-1 border rounded px-2 text-sm" placeholder="اكتب..."><button id="cSend" class="text-emerald-600"><i class="fas fa-paper-plane"></i></button></div>
    `;
    document.body.appendChild(win);

    const body = win.querySelector('#cBody');
    const input = win.querySelector('#cIn');

    btn.onclick = () => { win.style.display = win.style.display==='flex'?'none':'flex'; if(win.style.display==='flex') input.focus(); };
    win.querySelector('.x-btn').onclick = () => win.style.display = 'none';

    async function send() {
        const txt = input.value.trim();
        if(!txt) return;
        addMsg(txt, 'user');
        input.value = '';
        addMsg('جاري الكتابة...', 'bot');
        const reply = await sendMessageToBot(txt);
        body.lastChild.textContent = reply;
    }

    function addMsg(txt, type) {
        const d = document.createElement('div');
        d.className = `msg msg-${type}`;
        d.textContent = txt;
        body.appendChild(d);
        body.scrollTop = body.scrollHeight;
    }

    win.querySelector('#cSend').onclick = send;
    input.onkeypress = (e) => e.key === 'Enter' && send();
});