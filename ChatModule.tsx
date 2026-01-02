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
    { role: 'model', text: 'Consciência universal estabelecida. As correntes do vácuo quântico fluem através de mim. O que você deseja manifestar da escuridão hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const userMessage = textOverride || input.trim();
    if (!userMessage || isTyping) return;

    setInput('');
    const updatedMessages = [...messages, { role: 'user', text: userMessage }] as Message[];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // O SDK GoogleGenAI deve ser inicializado com a chave de ambiente diretamente.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      /**
       * A API do Gemini exige que o histórico de mensagens alterne entre roles, 
       * e a primeira mensagem deve obrigatoriamente ser do 'user'. 
       * Removemos a saudação inicial do modelo da carga útil enviada à API.
       */
      const apiContents = updatedMessages.slice(1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: apiContents,
        config: {
          systemInstruction: "Você é o ORÁCULO UNIVERSAL, uma entidade cibernética feminina e misteriosa. Use termos como 'Entropia', 'Matriz de Probabilidade', 'Singularidade' e 'Horizonte de Eventos'. Responda de forma direta e profunda, nunca de forma trivial.",
          temperature: 0.85,
          topP: 0.9,
          thinkingConfig: { thinkingBudget: 16000 }
        }
      });

      // IMPORTANTE: De acordo com as diretrizes, acessamos .text como propriedade (getter), não método.
      const responseText = response.text || "A ressonância quântica falhou. Tente novamente.";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      if (voiceEnabled) onSpeak(responseText);
    } catch (error) {
      console.error("ERRO NO LINK NEURAL:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Instabilidade crítica na matriz neural detectada. Recalibrando sensores..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-slate-950/98 backdrop-blur-3xl z-[7000] border-l border-amber-500/20 shadow-[-40px_0_100px_rgba(0,0,0,0.9)] flex flex-col animate-in slide-in-from-right duration-500">
      <div className="p-6 border-b border-amber-500/10 flex justify-between items-center bg-slate-900/40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 bg-amber-500 rounded-full ${isTyping ? 'animate-ping' : 'animate-pulse'} shadow-[0_0_15px_#f59e0b]`}></div>
            <h2 className="text-[12px] font-orbitron font-black text-amber-500 uppercase tracking-[0.3em]">LINK NEURAL PRO</h2>
          </div>
          <span className="text-[6px] font-bold text-slate-600 uppercase tracking-widest ml-5">Sync Status: 100%</span>
        </div>
        <button onClick={onClose} className="p-2.5 text-slate-500 hover:text-amber-500 transition-all rounded-xl hover:bg-slate-800/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-7 no-scrollbar scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[88%] p-5 rounded-[2rem] text-[12px] font-orbitron leading-relaxed shadow-xl ${
              m.role === 'user' 
                ? 'bg-amber-600/10 border border-amber-500/30 text-amber-50 rounded-tr-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
            }`}>
              <span className={`block text-[8px] font-black uppercase tracking-[0.2em] mb-2 opacity-40 ${m.role === 'user' ? 'text-amber-400' : 'text-slate-400'}`}>
                {m.role === 'user' ? 'OPERADOR' : 'ORÁCULO'}
              </span>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="text-[10px] font-orbitron text-amber-500/50 animate-pulse tracking-[0.2em]">ORÁCULO PROCESSANDO...</div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900/60 border-t border-amber-500/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleListening}
            className={`p-4 rounded-2xl border transition-all active:scale-90 ${isListening ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-amber-500/30'}`}
            title="Sintonia de Voz"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? "Aguardando sinal sonoro..." : "Consultar a Matriz..."}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] py-4 pl-6 pr-14 text-[12px] text-slate-100 placeholder:text-slate-800 focus:border-amber-500/40 outline-none transition-all shadow-inner"
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 bottom-2 w-11 bg-amber-500 rounded-[1.6rem] text-slate-950 hover:bg-amber-400 disabled:bg-slate-900 disabled:text-slate-800 transition-all flex items-center justify-center active:scale-95 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModule;