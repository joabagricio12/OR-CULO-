
import React, { useState, useRef, useEffect } from 'react';
import type { AdvancedPredictions } from './types';

interface PositionMenuProps {
    value: string;
    type: 'Centena' | 'Dezena';
    label: string;
    localRect: string;
    onLocalRectChange: (val: string) => void;
    onClose: () => void;
    onManualRectify: (gen: string, act: string, type: 'Centena' | 'Dezena', rankLabel: string) => void;
    onMarkHit: (value: string, type: 'Centena' | 'Dezena', position: number, status?: 'Acerto' | 'Quase Acerto') => void;
}

interface AdvancedPredictionDisplayProps {
    predictions: AdvancedPredictions | null;
    onMarkHit: (value: string, type: 'Centena' | 'Dezena', position: number, status?: 'Acerto' | 'Quase Acerto') => void;
    onManualRectify: (gen: string, act: string, type: 'Centena' | 'Dezena', rankLabel: string) => void;
}

const PositionMenu: React.FC<PositionMenuProps> = ({ 
    value, type, label, localRect, onLocalRectChange, onClose, onManualRectify, onMarkHit 
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedPos, setSelectedPos] = useState(1);

    useEffect(() => {
        if (inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div onClick={(e) => e.stopPropagation()} className="fixed md:absolute top-1/2 left-1/2 md:top-full md:left-auto md:right-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 mt-2 bg-slate-950 border border-amber-500 shadow-[0_0_30px_rgba(0,0,0,0.9)] p-4 z-[9999] flex flex-col gap-3 min-w-[200px] rounded-[1.6rem] animate-in zoom-in duration-200 backdrop-blur-3xl">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">RANK</span>
                    <span className="text-[6px] text-slate-500 font-bold uppercase">{label}</span>
                </div>
                <button onClick={onClose} className="w-6 h-6 flex items-center justify-center bg-slate-900 rounded-lg text-amber-500 border border-amber-500/20 text-[14px] font-bold">×</button>
            </div>
            <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map(p => (
                    <button key={p} onClick={() => setSelectedPos(p)} className={`h-8 rounded-lg text-[10px] font-black border transition-all ${selectedPos === p ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>{p}º</button>
                ))}
            </div>
            <input ref={inputRef} type="text" placeholder="REAL" value={localRect} onChange={(e) => onLocalRectChange(e.target.value.replace(/\D/g, ''))} maxLength={type === 'Centena' ? 3 : 2} className="w-full bg-slate-900 border border-slate-800 text-center font-orbitron text-[18px] py-2 rounded-xl text-amber-500 outline-none placeholder:text-slate-800" inputMode="numeric" />
            <div className="flex flex-col gap-1.5">
                <button onClick={() => { onMarkHit(value, type, selectedPos, 'Acerto'); onClose(); }} className="w-full bg-amber-500 text-slate-950 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest active:scale-95 shadow-lg">SALVAR ACERTO</button>
                <button onClick={() => { onMarkHit(value, type, selectedPos, 'Quase Acerto'); onClose(); }} className="w-full bg-slate-900 border border-amber-500/20 text-amber-500 py-2.5 rounded-xl text-[7px] font-black uppercase active:scale-95">QUASE</button>
                <button onClick={() => { if(localRect) { onManualRectify(value, localRect, type, `${selectedPos}º PRÊMIO`); onClose(); } }} className="w-full bg-amber-900/10 text-amber-200 py-2 rounded-xl text-[7px] font-black uppercase active:scale-95">RETIFICAR</button>
            </div>
        </div>
    );
};

const AdvancedPredictionDisplay: React.FC<AdvancedPredictionDisplayProps> = ({ predictions, onMarkHit, onManualRectify }) => {
    const [activeMenu, setActiveMenu] = useState<{ id: string, type: 'Centena' | 'Dezena', val: string, label: string } | null>(null);
    const [localRect, setLocalRect] = useState("");

    const eliteData = predictions?.eliteTens || [{value: "--"}, {value: "--"}];
    const superTensData = predictions?.superTens.slice(0, 3) || [{value: "--"}, {value: "--"}, {value: "--"}];
    const hundredsData = predictions?.hundreds.slice(0, 3) || [{value: "---"}, {value: "---"}, {value: "---"}];

    return (
        <div className="flex flex-col gap-3 h-full relative">
            <div className="bg-slate-900 rounded-[2rem] border border-amber-500/40 relative z-[40] shadow-[0_0_20px_rgba(245,158,11,0.1)] overflow-hidden">
                <div className="bg-slate-950/60 p-4 rounded-[1.8rem] relative overflow-hidden">
                    <h2 className="text-[9px] font-orbitron font-black text-amber-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2 justify-center">
                        <span className={`w-2 h-2 rounded-full ${predictions ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]' : 'bg-slate-800'}`}></span>
                        DEZENAS ELITE
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {eliteData.map((item, idx) => (
                            <div key={idx} className={`flex flex-col items-center bg-amber-500/5 p-4 border border-amber-500/10 rounded-[1.5rem] relative ${!predictions && 'opacity-20 grayscale'}`}>
                                <span className="font-orbitron text-[28px] text-amber-400 font-black mb-2 tracking-tighter drop-shadow-md">{item.value}</span>
                                <button 
                                    disabled={!predictions}
                                    onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `elite-${idx}`, type: 'Dezena', val: item.value, label: 'ELITE 1º PRÊMIO' }); setLocalRect(""); }} 
                                    className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all ${!predictions ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'}`}
                                >
                                    MARCAR
                                </button>
                                {activeMenu?.id === `elite-${idx}` && (
                                    <PositionMenu value={item.value} type="Dezena" label={activeMenu.label} localRect={localRect} onLocalRectChange={setLocalRect} onClose={() => setActiveMenu(null)} onManualRectify={onManualRectify} onMarkHit={onMarkHit} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`bg-slate-900/40 p-4 rounded-[2rem] border border-slate-800/60 backdrop-blur-xl relative transition-all ${activeMenu?.id.includes('triad-d') ? 'z-[999]' : 'z-[30]'} ${!predictions && 'opacity-30 grayscale'}`}>
                <h2 className="text-[7px] font-orbitron font-black text-slate-500 mb-3 uppercase tracking-[0.2em] text-center">TRÍADE DEZENAS</h2>
                <div className="grid grid-cols-3 gap-2">
                    {superTensData.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center bg-slate-950/40 p-2.5 rounded-[1.2rem] relative border border-slate-800/40">
                            <span className="font-orbitron text-[18px] text-slate-100 font-black mb-2 tracking-tight">{item.value}</span>
                            <button 
                                disabled={!predictions}
                                onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `triad-d-${idx}`, type: 'Dezena', val: item.value, label: 'TRÍADE DEZENA' }); setLocalRect(""); }} 
                                className={`p-2 rounded-lg border border-slate-700 active:scale-90 transition-all ${!predictions ? 'bg-slate-900 text-slate-800' : 'bg-slate-800 text-slate-500 hover:text-amber-500'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                            {activeMenu?.id === `triad-d-${idx}` && (
                                <PositionMenu value={item.value} type="Dezena" label={activeMenu.label} localRect={localRect} onLocalRectChange={setLocalRect} onClose={() => setActiveMenu(null)} onManualRectify={onManualRectify} onMarkHit={onMarkHit} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className={`bg-slate-900/40 p-4 rounded-[2rem] border border-slate-800/60 backdrop-blur-xl flex-1 relative transition-all ${activeMenu?.id.includes('triad-c') ? 'z-[999]' : 'z-[20]'} ${!predictions && 'opacity-30 grayscale'}`}>
                <h2 className="text-[7px] font-orbitron font-black text-slate-500 mb-3 uppercase tracking-[0.2em] text-center">TRÍADE CENTENAS</h2>
                <div className="space-y-1.5">
                    {hundredsData.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-[1.2rem] relative border border-slate-800/40">
                            <span className="font-orbitron text-[18px] text-slate-100 font-black tracking-[0.2em]">{item.value}</span>
                            <button 
                                disabled={!predictions}
                                onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `triad-c-${idx}`, type: 'Centena', val: item.value, label: 'TRÍADE CENTENA' }); setLocalRect(""); }} 
                                className={`p-3 rounded-xl border border-slate-700 active:scale-90 transition-all ${!predictions ? 'bg-slate-900 text-slate-800' : 'bg-slate-800 text-slate-500 hover:text-amber-500'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                            {activeMenu?.id === `triad-c-${idx}` && (
                                <PositionMenu value={item.value} type="Centena" label={activeMenu.label} localRect={localRect} onLocalRectChange={setLocalRect} onClose={() => setActiveMenu(null)} onManualRectify={onManualRectify} onMarkHit={onMarkHit} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvancedPredictionDisplay;
