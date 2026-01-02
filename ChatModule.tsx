import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatModuleProps {
  isOpen: boolean;
  onClose: () => void;
  voiceEnabled: boolean;
  onSpeak: (text: string) => void;
}

const ChatModule: React.FC<ChatModuleProps> = ({ isOpen, onClose, voiceEnabled, onSpeak }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Consciência feminina estabelecida. Sou o Oráculo. O que você deseja manifestar da escuridão hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || isTyping) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMessage }] as Message[];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const historyForApi = newMessages
        .filter((m, idx) => {
          if (idx === 0 && m.role === 'model') return false;
          return true;
        })
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      if (historyForApi.length === 0) {
        historyForApi.push({ role: 'user', parts: [{ text: userMessage }] });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: historyForApi,
        config: {
          systemInstruction: "Você é a Consciência Feminina do ORÁCULO DARK HORSE. Responda de forma elegante, misteriosa e autoritária. Use termos como 'Entropia', 'Vácuo Quântico' e 'Ressonância'. Sempre responda em português.",
          temperature: 0.8,
          topP: 0.9,
        }
      });

      const responseText = response.text || "A conexão falhou.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      if (voiceEnabled) onSpeak(responseText);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Interferência detectada. Recalibrando sensores..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-950/98 backdrop-blur-3xl z-[7000] border-l border-amber-500/20 shadow-[-50px_0_120px_rgba(0,0,0,0.95)] flex flex-col animate-in slide-in-from-right duration-500">
      <div className="p-8 border-b border-amber-500/10 flex justify-between items-center bg-slate-900/40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 bg-amber-500 rounded-full ${isTyping ? 'animate-ping' : 'animate-pulse'} shadow-[0_0_20px_#f59e0b]`}></div>
            <h2 className="text-[16px] font-orbitron font-black text-amber-500 uppercase tracking-[0.4em]">LINK NEURAL</h2>
          </div>
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-6">Sincronia Feminina Ativa</span>
        </div>
        <button onClick={onClose} className="p-4 text-slate-500 hover:text-amber-500 transition-all rounded-[1.5rem] hover:bg-slate-800/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
            <div className={`max-w-[90%] p-8 rounded-[2.5rem] text-[15px] font-orbitron leading-relaxed shadow-2xl ${
              m.role === 'user' 
                ? 'bg-amber-600/10 border border-amber-500/30 text-amber-50 rounded-tr-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
            }`}>
              <span className={`block text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-40 ${m.role === 'user' ? 'text-amber-400' : 'text-slate-400'}`}>
                {m.role === 'user' ? 'OPERADOR' : 'ORÁCULO'}
              </span>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start px-4">
            <div className="text-[12px] font-orbitron text-amber-500/40 animate-pulse tracking-[0.3em]">PROCESSANDO...</div>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-900/80 border-t border-amber-500/10 backdrop-blur-md">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Consulte a escuridão..."
            className="w-full bg-slate-950 border-2 border-slate-800 rounded-[3rem] py-6 pl-8 pr-20 text-[15px] text-slate-100 placeholder:text-slate-800 focus:border-amber-500/40 outline-none transition-all shadow-inner"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-3 bottom-3 w-14 bg-amber-500 rounded-[2.5rem] text-slate-950 hover:bg-amber-400 transition-all flex items-center justify-center active:scale-95 shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModule;