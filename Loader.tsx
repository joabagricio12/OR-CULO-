
import React, { useState, useEffect } from 'react';

const LOGS = [
    "ACESSANDO NÚCLEO DARK HORSE...",
    "VARRENDO ENTROPIA RESIDUAL...",
    "ISOLANDO RESSONÂNCIA DE RANK 1...",
    "ESTABELECENDO PONTOS DE NÃO-RESISTÊNCIA...",
    "ELIMINANDO IMPOSSIBILIDADES...",
    "COLAPSANDO ONDA NO ALVO...",
    "ORÁCULO PRONTO PARA MANIFESTAÇÃO."
];

const Loader: React.FC = () => {
    const [log, setLog] = useState(0);
    const [excluded, setExcluded] = useState(0);

    useEffect(() => {
        const i = setInterval(() => setLog(p => (p + 1) % LOGS.length), 600);
        // Contador de exclusão acelerado (simulando o colapso de 10.000 possibilidades)
        const e = setInterval(() => {
            setExcluded(p => {
                if (p >= 9999) return 9999;
                return p + Math.floor(Math.random() * 450);
            });
        }, 100);
        return () => { clearInterval(i); clearInterval(e); };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center my-14 animate-in fade-in zoom-in duration-500">
            <div className="relative w-40 h-40">
                {/* Aneis de energia Quântica */}
                <div className="absolute inset-0 border-[6px] border-amber-500/5 rounded-full"></div>
                <div className="absolute inset-0 border-[4px] border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-[1px] border-amber-400/10 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                
                {/* Núcleo de Colapso */}
                <div className="absolute inset-10 bg-amber-500/5 rounded-full animate-pulse flex flex-col items-center justify-center border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                    <span className="text-[14px] font-black text-amber-500 leading-none">{excluded}</span>
                    <span className="text-[5px] text-amber-600/50 font-bold uppercase tracking-widest mt-1">Excluídos</span>
                </div>
            </div>
            <div className="mt-12 flex flex-col items-center gap-4">
                <p className="text-amber-500 font-orbitron font-black tracking-[0.4em] text-[10px] text-center min-w-[320px] uppercase h-4">
                    {LOGS[log]}
                </p>
                <div className="flex gap-4 items-center">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/50"></div>
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
                    </div>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/50"></div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
