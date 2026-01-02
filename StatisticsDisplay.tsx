
import React, { useEffect, useState } from 'react';
import type { CombinedAnalysis } from './types';

interface StatisticsDisplayProps {
    analysis?: CombinedAnalysis | null;
    isLoading?: boolean;
}

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({ analysis, isLoading = false }) => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const [scanData, setScanData] = useState<number[]>(Array(10).fill(0));

    useEffect(() => {
        let interval: any;
        if (isLoading) {
            interval = setInterval(() => {
                setScanData(digits.map(() => Math.random() * 80 + 20));
            }, 80);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    if (!analysis && !isLoading) return null;

    const displayData = isLoading ? scanData : digits.map(d => 
        (analysis?.inputAnalysis.globalDigitFreq[d] || 0) + 
        (analysis?.historicalAnalysis.historicalDigitFreq[d] || 0)
    );
    const maxFreq = Math.max(...displayData) || 1;

    return (
        <div className={`bg-slate-900/50 p-2 rounded-xl border transition-all h-16 ${isLoading ? 'border-cyan-500/50' : 'border-slate-800 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-1 px-1">
                <h2 className="text-[6px] font-orbitron font-bold text-slate-500 tracking-widest uppercase">Fluxo de Ressonância Neural</h2>
                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
            </div>

            <div className="flex items-end justify-between gap-1 h-8 border-b border-slate-800 pb-0.5 px-1">
                {displayData.map((val, i) => {
                    const height = (val / maxFreq) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                            <div 
                                className={`w-full transition-all duration-300 ${isLoading ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                style={{ height: `${Math.max(10, height)}%` }}
                            ></div>
                            <span className="text-[5px] font-bold text-slate-500 mt-1">{i}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatisticsDisplay;
