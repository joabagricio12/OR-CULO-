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
        <>
            <div className="fixed inset-0 z-[9998]" onClick={onClose}></div>
            <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full right-0 mb-2 bg-slate-950 border border-amber-500/60 shadow-2xl p-3 z-[9999] flex flex-col gap-2 w-[160px] rounded-2xl animate-in zoom-in duration-100 backdrop-blur-3xl">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">SINCRO {type}</span>
                    <button onClick={onClose} className="text-slate-500 text-[14px] leading-none">×</button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map(p => (
                        <button key={p} onClick={() => setSelectedPos(p)} className={`h-6 rounded-lg text-[8px] font-black border transition-all ${selectedPos === p ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>{p}º</button>
                    ))}
                </div>
                <input 
                    ref={inputRef} 
                    type="text" 
                    placeholder="REAL" 
                    value={localRect} 
                    onChange={(e) => onLocalRectChange(e.target.value.replace(/\D/g, ''))} 
                    maxLength={type === 'Centena' ? 3 : 2} 
                    className="w-full bg-slate-900/50 border border-slate-800 text-center font-orbitron text-[14px] py-2 rounded-xl text-amber-500 outline-none placeholder:text-slate-800" 
                    inputMode="numeric" 
                />
                <div className="flex flex-col gap-1.5">
                    <button onClick={() => { onMarkHit(value, type, selectedPos, 'Acerto'); onClose(); }} className="w-full bg-amber-500 text-slate-950 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest active:scale-95 shadow-md">CONFIRMAR ACERTO</button>
                    <div className="grid grid-cols-2 gap-1.5">
                        <button onClick={() => { onMarkHit(value, type, selectedPos, 'Quase Acerto'); onClose(); }} className="bg-slate-900 border border-slate-800 text-slate-500 py-2 rounded-xl text-[6px] font-black uppercase active:scale-95">QUASE</button>
                        <button onClick={() => { if(localRect) { onManualRectify(value, localRect, type, `${selectedPos}º PRÊMIO`); onClose(); } }} className="bg-amber-900/10 text-amber-400 py-2 rounded-xl text-[6px] font-black uppercase active:scale-95">RECALIBRAR</button>
                    </div>
                </div>
            </div>
        </>
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
            <div className="bg-slate-900/40 p-3 rounded-[1.5rem] border border-amber-500/20 relative">
                <h2 className="text-[8px] font-orbitron font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center">
                    <span className={`w-1.5 h-1.5 rounded-full ${predictions ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`}></span>
                    DEZENAS ELITE PRECISÃO
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {eliteData.map((item, idx) => (
                        <div key={idx} className={`flex flex-col items-center bg-amber-500/5 p-3 border border-amber-500/10 rounded-2xl relative ${!predictions && 'opacity-20 grayscale'}`}>
                            <span className="text-[6px] text-amber-600/60 font-black mb-1.5 uppercase">{idx === 0 ? 'PRECISÃO EXATA' : 'VARIAÇÃO ELITE'}</span>
                            <span className="font-orbitron text-[24px] text-amber-400 font-black mb-2.5">{item.value}</span>
                            <button 
                                disabled={!predictions}
                                onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `elite-${idx}`, type: 'Dezena', val: item.value, label: 'ELITE' }); setLocalRect(""); }} 
                                className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase active:scale-95 transition-all shadow-md ${!predictions ? 'bg-slate-800 text-slate-600' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'}`}
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

            <div className={`bg-slate-900/40 p-3 rounded-[1.5rem] border border-slate-800/60 relative flex flex-col gap-3 ${!predictions && 'opacity-30 grayscale'}`}>
                <div className="grid grid-cols-2 gap-3">
                     <div className="flex flex-col gap-2">
                        <h2 className="text-[7px] font-orbitron font-black text-slate-500 mb-1 uppercase text-center tracking-widest">TRÍADE DEZENAS</h2>
                        <div className="flex flex-col gap-1.5">
                            {superTensData.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                                    <span className="font-orbitron text-[14px] text-slate-100 font-black ml-1">{item.value}</span>
                                    <button 
                                        disabled={!predictions}
                                        onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `triad-d-${idx}`, type: 'Dezena', val: item.value, label: 'TRÍADE' }); setLocalRect(""); }} 
                                        className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-amber-500 active:scale-90"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </button>
                                    {activeMenu?.id === `triad-d-${idx}` && (
                                        <PositionMenu value={item.value} type="Dezena" label={activeMenu.label} localRect={localRect} onLocalRectChange={setLocalRect} onClose={() => setActiveMenu(null)} onManualRectify={onManualRectify} onMarkHit={onMarkHit} />
                                    )}
                                </div>
                            ))}
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                        <h2 className="text-[7px] font-orbitron font-black text-slate-500 mb-1 uppercase text-center tracking-widest">TRÍADE CENTENAS</h2>
                        <div className="flex flex-col gap-1.5">
                            {hundredsData.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                                    <span className="font-orbitron text-[14px] text-slate-100 font-black ml-1">{item.value}</span>
                                    <button 
                                        disabled={!predictions}
                                        onClick={(e) => { e.stopPropagation(); setActiveMenu({ id: `triad-c-${idx}`, type: 'Centena', val: item.value, label: 'TRÍADE C' }); setLocalRect(""); }} 
                                        className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-amber-500 active:scale-90"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </button>
                                    {activeMenu?.id === `triad-c-${idx}` && (
                                        <PositionMenu value={item.value} type="Centena" label={activeMenu.label} localRect={localRect} onLocalRectChange={setLocalRect} onClose={() => setActiveMenu(null)} onManualRectify={onManualRectify} onMarkHit={onMarkHit} />
                                    )}
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedPredictionDisplay;