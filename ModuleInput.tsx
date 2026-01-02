
import React, { useCallback } from 'react';

interface ModuleInputProps {
    id: string;
    title: string;
    values: string[];
    setValues: (values: string[]) => void;
    onPaste?: (newValues: string[]) => void;
    onClear?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    readOnly?: boolean;
}

const ModuleInput: React.FC<ModuleInputProps> = ({ 
    id, title, values, setValues, onPaste, onClear, onUndo, onRedo, readOnly = false 
}) => {
    
    const handlePaste = useCallback(async (e?: React.MouseEvent) => {
        if (readOnly) return;
        if (e) e.preventDefault();
        
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            
            const lines = text.split(/\r?\n/)
                .map(line => line.trim().replace(/\s/g, ''))
                .filter(line => line.length > 0);
            
            const newValues = Array(7).fill('');
            const linesToPaste = lines.slice(0, 7);
            
            for (let i = 0; i < 7; i++) {
                if (i < linesToPaste.length) {
                    newValues[i] = i < 6 ? linesToPaste[i].substring(0, 4) : linesToPaste[i].substring(0, 3);
                } else {
                    newValues[i] = values[i] || '';
                }
            }
            
            if (onPaste) onPaste(newValues);
            else setValues(newValues);
        } catch (err) {
            console.error("Erro ao acessar área de transferência.", err);
            alert("Permita o acesso à área de transferência para usar o botão Colar.");
        }
    }, [values, setValues, onPaste, readOnly]);

    const handleInputChange = (index: number, val: string) => {
        if (readOnly) return;
        const numericVal = val.replace(/\D/g, '');
        const limit = index === 6 ? 3 : 4;
        const newValues = [...values];
        newValues[index] = numericVal.substring(0, limit);
        setValues(newValues);
    };

    return (
        <div className={`p-4 module-card flex flex-col gap-2.5 min-w-0 h-full ${readOnly ? 'border-slate-800/40 bg-slate-900/40' : 'border-cyan-500/20 shadow-2xl'}`}>
            <div className="flex items-center justify-between mb-1 px-1 h-[32px] shrink-0">
                <h2 className={`text-[8px] font-orbitron font-black uppercase tracking-tighter truncate max-w-[70%] ${readOnly ? 'text-slate-600' : 'text-slate-500'}`}>
                    {title}
                </h2>
                
                {!readOnly && (
                    <button 
                        type="button"
                        onClick={handlePaste}
                        className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 active:scale-90 transition-all shadow-lg hover:bg-cyan-500/20"
                        title="Colar Dados"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                    </button>
                )}
            </div>

            <div className="space-y-1.5 flex-1">
                {values.map((val, index) => (
                    <div key={index} className={`flex items-center h-8 border rounded-xl overflow-hidden transition-all ${readOnly ? 'border-slate-800/20 bg-slate-950/20' : 'border-slate-800/40 bg-slate-950/40 focus-within:border-cyan-500/40 focus-within:ring-2 focus-within:ring-cyan-500/5'}`}>
                        <span className={`text-[6px] font-black w-7 text-center border-r shrink-0 select-none ${readOnly ? 'text-slate-800 border-slate-800/20' : 'text-slate-700 border-slate-800/40'}`}>
                            {index === 6 ? '7º' : index + 1}
                        </span>
                        <input 
                            type="text" 
                            value={val} 
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            readOnly={readOnly}
                            className={`w-full bg-transparent text-center font-orbitron text-[13px] font-black outline-none caret-cyan-500 tracking-widest ${readOnly ? 'text-slate-700' : 'text-slate-100'}`} 
                            placeholder={index === 6 ? "---" : "----"}
                            inputMode="numeric"
                        />
                    </div>
                ))}
            </div>

            <div className={`flex items-center justify-center gap-2 rounded-2xl p-2 mt-1 border shadow-inner h-[42px] shrink-0 ${readOnly ? 'bg-slate-950/20 border-slate-900/40' : 'bg-slate-950/60 border-slate-800/80'}`}>
                {!readOnly && (
                    <>
                        <button 
                            onClick={onUndo} 
                            className="p-2 text-slate-600 hover:text-amber-500 transition-colors active:scale-90" 
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <button 
                            onClick={onRedo} 
                            className="p-2 text-slate-600 hover:text-amber-500 transition-colors active:scale-90" 
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                        
                        <div className="w-[1.5px] h-4 bg-slate-800 mx-1 opacity-50"></div>
                        
                        <button 
                            onClick={onClear} 
                            className="p-2 text-slate-600 hover:text-red-500 transition-colors active:scale-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </>
                )}
                {readOnly && (
                    <div className="flex items-center gap-2 opacity-10">
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                        <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuleInput;
