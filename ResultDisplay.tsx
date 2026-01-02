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
        if (idx === 0) return "1º PRÊMIO";
        if (idx === 6) return "7º PRÊMIO";
        return `${idx + 1}º PRÊMIO`;
    };

    const displayData = result || Array(7).fill(null).map((_, i) => i === 6 ? [0, 0, 0] : [0, 0, 0, 0]);

    return (
        <div className="bg-slate-900/60 p-2 rounded-[1.5rem] border border-amber-900/20 shadow-2xl relative backdrop-blur-3xl flex flex-col gap-1.5 overflow-visible shrink-0">
            <div className="flex items-center gap-1.5 px-1">
                <div className={`w-1 h-1 rounded-full ${result ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`}></div>
                <h2 className="text-[7px] font-orbitron font-black text-amber-500 uppercase tracking-widest">MATRIZ PREVISTA</h2>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {displayData.map((row, idx) => {
                    const value = result ? row.join('') : (idx === 6 ? "---" : "----");
                    const type = idx === 6 ? 'Centena' : 'Milhar';
                    const isTop = idx < 1; 
                    const rankLabel = getRankLabel(idx);
                    
                    return (
                        <div 
                            key={idx} 
                            className={`group relative p-1 rounded-xl border flex flex-col items-center justify-center transition-all ${isTop ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950/40 border-slate-800/40'} ${!result && 'opacity-20 grayscale'}`}
                        >
                            <span className={`text-[5px] font-black mb-0.5 tracking-tighter ${isTop ? 'text-amber-500' : 'text-slate-600'}`}>{idx === 0 ? 'ELITE' : `${idx + 1}º`}</span>
                            <div className={`font-orbitron text-[10px] font-black tracking-tight leading-none mb-1 ${isTop ? 'text-amber-400' : 'text-slate-300'}`}>{value}</div>

                            <button 
                                disabled={!result}
                                onClick={() => { setOpenMenu(idx); setLocalVal(""); }} 
                                className={`p-1 rounded-md z-10 transition-all ${!result ? 'text-slate-800' : (isTop ? 'bg-amber-500 text-slate-950 scale-90 active:scale-75 shadow-sm' : 'text-slate-500 hover:text-amber-500')}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                            </button>

                            {/* POP-OVER ULTRA COMPACTO */}
                            {openMenu === idx && (
                                <>
                                    <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenu(null)}></div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-[100px] bg-slate-950/95 border border-amber-500/50 rounded-lg z-[9999] p-1 flex flex-col gap-1 shadow-2xl animate-in zoom-in duration-100 backdrop-blur-3xl">
                                        <div className="flex justify-between items-center px-0.5">
                                            <span className="text-[5px] font-black text-amber-500 uppercase">{idx+1}º</span>
                                            <button onClick={() => setOpenMenu(null)} className="text-slate-600 hover:text-white text-[9px]">×</button>
                                        </div>
                                        <input 
                                            ref={inputRef} 
                                            type="text" 
                                            placeholder="VAL" 
                                            value={localVal} 
                                            onChange={(e) => setLocalVal(e.target.value.replace(/\D/g, ''))} 
                                            className="w-full bg-slate-900 border border-slate-800 text-center font-orbitron text-[9px] py-1 rounded-md text-amber-500 outline-none" 
                                            maxLength={idx === 6 ? 3 : 4} 
                                            inputMode="numeric" 
                                        />
                                        <button onClick={() => { onMarkHit(value, type, idx + 1, 'Acerto'); setOpenMenu(null); }} className="w-full bg-amber-500 text-slate-950 py-1 rounded-md text-[6px] font-black uppercase active:scale-95">ACERTO</button>
                                        <div className="grid grid-cols-2 gap-0.5">
                                            <button onClick={() => { onMarkHit(value, type, idx + 1, 'Quase Acerto'); setOpenMenu(null); }} className="bg-slate-900 border border-slate-800 text-slate-500 py-1 rounded-md text-[4px] font-black uppercase active:scale-95">QUASE</button>
                                            <button onClick={() => { if (localVal) { onManualRectify(value, localVal, type, rankLabel); setOpenMenu(null); } }} className="bg-slate-900 border border-amber-900/20 text-amber-600 py-1 rounded-md text-[4px] font-black uppercase active:scale-95">AJUSTE</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResultDisplay;