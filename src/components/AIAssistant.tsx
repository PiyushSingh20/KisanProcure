import { useState } from 'react';
import { MessageIcon, XIcon, SendIcon } from './Icons';
import { api } from '../lib/api';
import { getAIResponse } from '../lib/demoData';

const SUGGESTIONS = [
  'Wheat MSP rate?',
  'Paddy price in Prayagraj?',
  'Where is my token?',
  'How much waiting time?',
  'Nearby UP centres?',
  'Payment status?',
];

interface Message {
  from: 'user' | 'bot';
  text: string;
  source?: string;
  updated?: string;
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<'hi' | 'en'>('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'bot',
      text: 'Namaste! I am Kisan Sahayak, your AI Agricultural Assistant. Ask me about MSP rates, mandi prices, UP procurement centres, or your token status.',
      source: 'KisanProcure Knowledge Base',
      updated: '2024-12-15',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = { from: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 1. Attempt live backend call
      const res = await api.chatWithAI(query, lang);
      if (res?.reply) {
        setMessages(prev => [
          ...prev,
          {
            from: 'bot',
            text: res.reply,
            source: res.source || 'Verified Procurement System',
            updated: res.lastUpdated || new Date().toISOString().split('T')[0],
          },
        ]);
      } else {
        // Fallback to grounded local AI engine
        const fallback = getAIResponse(query);
        setMessages(prev => [
          ...prev,
          {
            from: 'bot',
            text: fallback.reply,
            source: fallback.source,
            updated: fallback.updated,
          },
        ]);
      }
    } catch {
      const fallback = getAIResponse(query);
      setMessages(prev => [
        ...prev,
        {
          from: 'bot',
          text: fallback.reply,
          source: fallback.source,
          updated: fallback.updated,
        },
      ]);
    } finally {
      setLoading(false);
    }
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm mx-auto bg-white rounded-t-3xl flex flex-col shadow-2xl" style={{ height: '75vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#dde4d7]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1e5c33] flex items-center justify-center">
                  <MessageIcon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-[700] text-[#181d14]">Kisan Sahayak AI</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                    <p className="text-[11px] text-[#6b7563]">RAG Grounded Intelligence</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Language Switch */}
                <button
                  onClick={() => setLang(l => (l === 'en' ? 'hi' : 'en'))}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-lg border border-[#dde4d7] bg-[#f4f6f2] text-[#1e5c33]"
                >
                  {lang === 'en' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-[#f4f6f2] transition-colors">
                  <XIcon size={18} className="text-[#6b7563]" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      m.from === 'user'
                        ? 'bg-[#1e5c33] text-white rounded-br-xs'
                        : 'bg-[#f4f6f2] text-[#181d14] rounded-bl-xs border border-[#dde4d7]'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Grounding Attribution & Source */}
                  {m.source && (
                    <div className="mt-1 px-1 flex items-center gap-1.5 text-[10px] text-[#6b7563]">
                      <span>Source: <strong className="text-[#181d14]">{m.source}</strong></span>
                      {m.updated && <span>· Updated: {m.updated}</span>}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-1.5 text-xs text-[#6b7563] bg-[#f4f6f2] p-2.5 rounded-2xl max-w-[60%]">
                  <div className="w-2 h-2 rounded-full bg-[#1e5c33] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#1e5c33] animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-[#1e5c33] animate-bounce delay-200" />
                  <span className="text-[11px] ml-1">Verifying official records...</span>
                </div>
              )}
            </div>

            {/* Suggestion Chips */}
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-[#dde4d7] bg-[#f8faf7] text-[#1e5c33] font-medium hover:bg-[#e6f3eb] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="px-4 py-3 border-t border-[#dde4d7] bg-white">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask in English or हिन्दी..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#dde4d7] text-xs focus:outline-none focus:border-[#1e5c33]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2 rounded-xl bg-[#1e5c33] text-white hover:bg-[#143d22] disabled:opacity-40 transition-colors"
                >
                  <SendIcon size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
