
import React, { useState, useRef, useEffect } from 'react';
import type { Candidate } from './types';

interface CandidateDisplayProps {
    candidates: Candidate[] | null;
    onMarkHit: (value: string, type: 'Milhar', position: number, status?: 'Acerto' | 'Quase Acerto') => void;
    onManualRectify: (gen: string, act: string, type: 'Milhar', rankLabel: string) => void;
}

const CandidateDisplay: React.FC<CandidateDisplayProps> = ({ candidates, onMarkHit, onManualRectify }) => {
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [localVal, setLocalVal] = useState("");
    const [selectedRank, setSelectedRank] = useState(1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeIdx !== null && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [activeIdx]);

    const displayCandidates = candidates?.slice(0, 3) || [{sequence: [0,0,0,0], confidence: 0}, {sequence: [0,0,0,0], confidence: 0}, {sequence: [0,0,0,0], confidence: 0}];

    return (
        <div className="bg-slate-900/80 p-4 rounded-[2rem] border border-slate-800/40 flex flex-col h-full shadow-inner backdrop-blur-md relative">
            <h2 className="text-[7px] font-orbitron font-black text-amber-500 uppercase tracking-[0.2em] mb-3 border-b border-amber-950/30 pb-1.5 text-center">REFORÇO ESTRUTURAL ELITE</h2>
            <div className="flex-1 space-y-2">
                {displayCandidates.map((candidate, index) => {
                    const sequenceStr = candidates ? candidate.sequence.join('') : "----";
                    const rankLabel = `REFORÇO #${index + 1}`;
                    return (
                        <div key={index} className={`flex items-center justify-between bg-slate-950/40 p-3.5 border border-slate-800/60 rounded-[1.2rem] relative ${!candidates && 'opacity-20 grayscale'}`}>
                            <div className="flex flex-col">
                                <span className="text-[5px] text-amber-600/50 font-bold mb-0.5 uppercase tracking-widest">REFORÇO #{index + 1}</span>
                                <span className="font-orbitron text-[18px] font-black text-slate-100 leading-none tracking-wider">{sequenceStr}</span>
                            </div>
                            <button 
                                disabled={!candidates}
                                onClick={(e) => { e.stopPropagation(); setActiveIdx(index); setLocalVal(""); }} 
                                className={`p-3 rounded-xl z-[120] border border-slate-700 active:scale-90 transition-all ${!candidates ? 'bg-slate-900 text-slate-800' : 'bg-slate-800/50 text-slate-400 hover:text-amber-500'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>

                            {activeIdx === index && (
                                <div onClick={(e) => e.stopPropagation()} className="fixed md:absolute top-1/2 left-1/2 md:top-0 md:left-auto md:right-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-[110%] md:translate-y-0 h-auto w-[80vw] max-w-[200px] bg-slate-950 border border-amber-500 rounded-[1.6rem] z-[9999] p-4 flex flex-col gap-3 shadow-[0_0_30px_rgba(0,0,0,1)] animate-in slide-in-from-right-2 duration-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">AJUSTE</span>
                                            <span className="text-[5px] text-slate-600 font-bold uppercase">{rankLabel}</span>
                                        </div>
                                        <button onClick={() => setActiveIdx(null)} className="w-6 h-6 flex items-center justify-center bg-slate-900 rounded-lg text-amber-500 border border-amber-500/20 text-[12px] font-bold">×</button>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1">
                                        {[1, 2, 3, 4, 5].map(r => (
                                            <button key={r} onClick={() => setSelectedRank(r)} className={`h-7 rounded-lg text-[9px] font-black border transition-all ${selectedRank === r ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>{r}º</button>
                                        ))}
                                    </div>
                                    <input ref={inputRef} type="text" placeholder="REAL" value={localVal} onChange={(e) => setLocalVal(e.target.value.replace(/\D/g, ''))} maxLength={4} className="w-full bg-slate-900 border border-slate-800 text-center font-orbitron text-[16px] py-2 rounded-xl text-amber-500 outline-none placeholder:text-slate-800" inputMode="numeric" />
                                    <div className="flex flex-col gap-1.5">
                                        <button onClick={() => { onMarkHit(sequenceStr, 'Milhar', selectedRank, 'Acerto'); setActiveIdx(null); }} className="w-full bg-amber-600 text-white py-3 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg active:scale-95">SALVAR ACERTO</button>
                                        <button onClick={() => { onMarkHit(sequenceStr, 'Milhar', selectedRank, 'Quase Acerto'); setActiveIdx(null); }} className="w-full bg-slate-900 border border-amber-500/20 text-amber-500 py-2.5 rounded-xl text-[7px] font-black uppercase active:scale-95">QUASE</button>
                                        <button onClick={() => { if(localVal) { onManualRectify(sequenceStr, localVal, 'Milhar', `${selectedRank}º PRÊMIO`); setActiveIdx(null); } }} className="w-full bg-amber-900/10 text-amber-200 py-2 rounded-xl text-[7px] font-black uppercase active:scale-95">RETIFICAR</button>
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

export default CandidateDisplay;
