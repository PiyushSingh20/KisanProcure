import { useState } from 'react';
import { MessageIcon, XIcon, SendIcon } from './Icons';

const SUGGESTIONS = [
  'Where is my token?',
  'When should I visit?',
  'How much waiting time?',
  'Is my payment completed?',
];

interface Message {
  from: 'user' | 'bot';
  text: string;
}

const AUTO_REPLIES: Record<string, string> = {
  'Where is my token?': 'Your token is KSN-1042. You are 8 farmers ahead in the queue at Lucknow Grain Procurement Center.',
  'When should I visit?': 'Your slot is at 11:30 AM today. With the current queue, please arrive by 11:15 AM.',
  'How much waiting time?': 'Estimated wait is approximately 35 minutes from now.',
  'Is my payment completed?': 'Your payment of ₹15,600 is currently being processed. You will be notified once credited.',
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Hi! I\'m Kisan Sahayak. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    const userMsg: Message = { from: 'user', text };
    const reply: Message = {
      from: 'bot',
      text: AUTO_REPLIES[text] || "I'll check that for you. Please visit the relevant screen for live details.",
    };
    setMessages((m) => [...m, userMsg, reply]);
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2 bg-[#1e5c33] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#16432a] transition-all active:scale-95"
      >
        <MessageIcon size={18} />
        <span className="text-sm font-[600]">Kisan Sahayak</span>
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm mx-auto bg-white rounded-t-3xl flex flex-col" style={{ height: '70vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#dde4d7]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1e5c33] flex items-center justify-center">
                  <MessageIcon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-[600] text-[#181d14]">Kisan Sahayak</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    <p className="text-xs text-[#6b7563]">Online</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-[#f4f6f2] transition-colors">
                <XIcon size={18} className="text-[#6b7563]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.from === 'user'
                        ? 'bg-[#1e5c33] text-white rounded-br-md'
                        : 'bg-[#f4f6f2] text-[#181d14] rounded-bl-md'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#dde4d7] text-[#1e5c33] font-[500] hover:bg-[#e6f3eb] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-6 pt-2 flex gap-2 border-t border-[#dde4d7]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && input.trim() && send(input.trim())}
                placeholder="Type a message..."
                className="flex-1 h-11 px-4 rounded-2xl bg-[#f4f6f2] text-sm text-[#181d14] placeholder:text-[#6b7563] outline-none border border-transparent focus:border-[#1e5c33] transition-colors"
              />
              <button
                onClick={() => input.trim() && send(input.trim())}
                className="w-11 h-11 rounded-2xl bg-[#1e5c33] flex items-center justify-center hover:bg-[#16432a] transition-colors"
              >
                <SendIcon size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
