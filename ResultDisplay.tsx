
import React, { useState, useRef, useEffect } from 'react';
import type { DataSet } from './types';

interface ResultDisplayProps {
    result: DataSet | null;
    onMarkHit: (value: string, type: 'Milhar' | 'Centena', position: number, status?: 'Acerto' | 'Quase Acerto') => void;
    onManualRectify: (gen: string, act: string, type: 'Milhar' | 'Centena', rankLabel: string) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onMarkHit, onManualRectify }) => {
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [localVal, setLocalVal] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (openMenu !== null && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [openMenu]);

    const getRankLabel = (idx: number) => {
        if (idx === 0) return "1º Prêmio (Elite)";
        if (idx === 6) return "7º Prêmio (Centena)";
        return `${idx + 1}º Prêmio`;
    };

    const displayData = result || Array(7).fill(null).map((_, i) => i === 6 ? [0, 0, 0] : [0, 0, 0, 0]);

    return (
        <div className="bg-slate-900/60 p-4 rounded-[2rem] border border-amber-900/20 shadow-2xl relative backdrop-blur-3xl flex flex-col gap-3 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/5 blur-[100px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_#f59e0b] ${result ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`}></div>
                    <h2 className="text-[9px] font-orbitron font-black text-amber-500 uppercase tracking-[0.2em]">MATRIZ MANIFESTADA</h2>
                </div>
                {result && <span className="text-[6px] font-black text-amber-600/40 uppercase tracking-widest">Onda Estável</span>}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {displayData.map((row, idx) => {
                    const value = result ? row.join('') : (idx === 6 ? "---" : "----");
                    const type = idx === 6 ? 'Centena' : 'Milhar';
                    const isTop = idx < 3;
                    const rankLabel = getRankLabel(idx);
                    
                    return (
                        <div 
                            key={idx} 
                            style={{ animationDelay: `${idx * 100}ms` }}
                            className={`group relative p-2.5 rounded-[1.4rem] border flex flex-col items-center justify-center transition-all duration-500 ${result ? 'animate-in fade-in slide-in-from-top-1' : ''} ${isTop ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.03)]' : 'bg-slate-950/40 border-slate-800/60'} ${!result && 'opacity-20 grayscale'}`}
                        >
                            <span className={`text-[7px] font-black mb-1.5 uppercase tracking-tighter ${isTop ? 'text-amber-500' : 'text-slate-600'}`}>{idx === 0 ? 'ELITE' : `${idx + 1}º`}</span>
                            <div className={`font-orbitron text-[16px] font-black tracking-tighter leading-none mb-2 ${isTop ? 'text-amber-400' : 'text-slate-100'}`}>{value}</div>

                            <button 
                                disabled={!result}
                                onClick={() => { setOpenMenu(idx); setLocalVal(""); }} 
                                className={`p-1.5 rounded-lg relative z-[45] transition-all ${!result ? 'bg-slate-800 text-slate-700' : (isTop ? 'bg-amber-500 text-slate-950 active:scale-90 shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-amber-500')}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                            </button>

                            {openMenu === idx && (
                                <div onClick={(e) => e.stopPropagation()} className="fixed md:absolute top-1/2 left-1/2 md:top-[-10px] md:left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-y-[-100%] w-[85vw] max-w-[220px] bg-slate-950 rounded-[1.8rem] z-[9999] p-4 flex flex-col gap-3 border border-amber-500 shadow-[0_0_40px_rgba(0,0,0,0.9)] animate-in zoom-in duration-200 backdrop-blur-3xl">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">SINCRONIA</span>
                                            <span className="text-[6px] text-slate-500 font-bold uppercase">{rankLabel}</span>
                                        </div>
                                        <button onClick={() => setOpenMenu(null)} className="w-7 h-7 flex items-center justify-center bg-slate-900 rounded-lg text-amber-500 border border-amber-500/20 text-[14px] font-bold">×</button>
                                    </div>
                                    <input ref={inputRef} type="text" placeholder="VALOR REAL" value={localVal} onChange={(e) => setLocalVal(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-900 border border-slate-800 text-center font-orbitron text-[18px] py-2.5 rounded-xl text-amber-500 outline-none focus:border-amber-500/50 placeholder:text-slate-800" maxLength={idx === 6 ? 3 : 4} inputMode="numeric" />
                                    <div className="flex flex-col gap-1.5">
                                        <button onClick={() => { onMarkHit(value, type, idx + 1, 'Acerto'); setOpenMenu(null); }} className="w-full bg-amber-500 text-slate-950 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest active:scale-95 shadow-md">SALVAR ACERTO</button>
                                        <button onClick={() => { onMarkHit(value, type, idx + 1, 'Quase Acerto'); setOpenMenu(null); }} className="w-full bg-slate-900 border border-amber-500/20 text-amber-500 py-2.5 rounded-xl text-[7px] font-black uppercase tracking-widest active:scale-95">QUASE ACERTO</button>
                                        <button onClick={() => { if (localVal) { onManualRectify(value, localVal, type, rankLabel); setOpenMenu(null); } }} className="w-full bg-amber-950/20 text-amber-400 py-2 rounded-xl text-[7px] font-black uppercase tracking-widest border border-amber-500/10 active:scale-95">RETIFICAR IA</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResultDisplay;
