import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { MessageIcon, XIcon, SendIcon } from './Icons';
const SUGGESTIONS = [
    'Where is my token?',
    'When should I visit?',
    'How much waiting time?',
    'Is my payment completed?',
];
const AUTO_REPLIES = {
    'Where is my token?': 'Your token is KSN-1042. You are 8 farmers ahead in the queue at Lucknow Grain Procurement Center.',
    'When should I visit?': 'Your slot is at 11:30 AM today. With the current queue, please arrive by 11:15 AM.',
    'How much waiting time?': 'Estimated wait is approximately 35 minutes from now.',
    'Is my payment completed?': 'Your payment of ₹15,600 is currently being processed. You will be notified once credited.',
};
export default function AIAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Hi! I\'m Kisan Sahayak. How can I help you today?' },
    ]);
    const [input, setInput] = useState('');
    const send = (text) => {
        const userMsg = { from: 'user', text };
        const reply = {
            from: 'bot',
            text: AUTO_REPLIES[text] || "I'll check that for you. Please visit the relevant screen for live details.",
        };
        setMessages((m) => [...m, userMsg, reply]);
        setInput('');
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setOpen(true), className: "fixed bottom-24 right-4 z-50 flex items-center gap-2 bg-[#1e5c33] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#16432a] transition-all active:scale-95", children: [_jsx(MessageIcon, { size: 18 }), _jsx("span", { className: "text-sm font-[600]", children: "Kisan Sahayak" })] }), open && (_jsxs("div", { className: "fixed inset-0 z-50 flex items-end", children: [_jsx("div", { className: "absolute inset-0 bg-black/30 backdrop-blur-sm", onClick: () => setOpen(false) }), _jsxs("div", { className: "relative w-full max-w-sm mx-auto bg-white rounded-t-3xl flex flex-col", style: { height: '70vh' }, children: [_jsxs("div", { className: "flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#dde4d7]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-full bg-[#1e5c33] flex items-center justify-center", children: _jsx(MessageIcon, { size: 18, className: "text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[14px] font-[600] text-[#181d14]", children: "Kisan Sahayak" }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-[#16a34a]" }), _jsx("p", { className: "text-xs text-[#6b7563]", children: "Online" })] })] })] }), _jsx("button", { onClick: () => setOpen(false), className: "p-1.5 rounded-full hover:bg-[#f4f6f2] transition-colors", children: _jsx(XIcon, { size: 18, className: "text-[#6b7563]" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3", children: messages.map((m, i) => (_jsx("div", { className: `flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === 'user'
                                            ? 'bg-[#1e5c33] text-white rounded-br-md'
                                            : 'bg-[#f4f6f2] text-[#181d14] rounded-bl-md'}`, children: m.text }) }, i))) }), messages.length <= 2 && (_jsx("div", { className: "px-4 pb-2 flex gap-2 flex-wrap", children: SUGGESTIONS.map((s) => (_jsx("button", { onClick: () => send(s), className: "text-xs px-3 py-1.5 rounded-full border border-[#dde4d7] text-[#1e5c33] font-[500] hover:bg-[#e6f3eb] transition-colors", children: s }, s))) })), _jsxs("div", { className: "px-4 pb-6 pt-2 flex gap-2 border-t border-[#dde4d7]", children: [_jsx("input", { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && input.trim() && send(input.trim()), placeholder: "Type a message...", className: "flex-1 h-11 px-4 rounded-2xl bg-[#f4f6f2] text-sm text-[#181d14] placeholder:text-[#6b7563] outline-none border border-transparent focus:border-[#1e5c33] transition-colors" }), _jsx("button", { onClick: () => input.trim() && send(input.trim()), className: "w-11 h-11 rounded-2xl bg-[#1e5c33] flex items-center justify-center hover:bg-[#16432a] transition-colors", children: _jsx(SendIcon, { size: 16, className: "text-white" }) })] })] })] }))] }));
}
