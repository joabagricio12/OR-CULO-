import React from 'react';
import type { DataSet } from './types';

interface MemoryDisplayProps {
    generations: DataSet[];
    onClear: () => void;
}

const MemoryDisplay: React.FC<MemoryDisplayProps> = ({ generations, onClear }) => {
    if (generations.length === 0) return null;

    return (
        <div className="mt-8 bg-[#0F0F0F] p-4 rounded-lg border border-[#2E2E2E]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#E6E6E6] font-orbitron text-sm tracking-widest uppercase">
                    Memória Recente (Inércia do Algoritmo)
                </h3>
                <button 
                    onClick={onClear}
                    className="text-xs text-red-500 hover:text-red-400 font-orbitron border border-red-900 bg-red-900/20 px-3 py-1 rounded transition-colors"
                >
                    LIMPAR MEMÓRIA
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generations.map((gen, idx) => (
                    <div key={idx} className="opacity-70 hover:opacity-100 transition-opacity">
                        <div className="text-[10px] text-gray-500 mb-1 text-center font-mono">
                            {idx === 0 ? 'ÚLTIMA' : `ANTERIOR -${idx}`}
                        </div>
                        <div className="bg-black p-2 rounded border border-[#2E2E2E] grid grid-rows-5 gap-1">
                            {gen.map((row, rIdx) => (
                                <div key={rIdx} className="text-center font-orbitron text-[#B89B5E] text-sm tracking-wider">
                                    {row.join('')}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
                *Estas sequências influenciam 15x mais os próximos resultados.
            </p>
        </div>
    );
};

export default MemoryDisplay;