import React, { useState, useEffect, useCallback } from 'react';
import type { DataSet, Candidate, AdvancedPredictions, HitRecord, CombinedAnalysis, RectificationRecord, AppSettings } from './types';
import Header from './Header';
import ModuleInput from './ModuleInput';
import ResultDisplay from './ResultDisplay';
import CandidateDisplay from './CandidateDisplay';
import AdvancedPredictionDisplay from './AdvancedPredictionDisplay';
import StatisticsDisplay from './StatisticsDisplay';
import HistoryModal from './HistoryModal';
import ChatModule from './ChatModule';
import Loader from './Loader';
import { runGenerationCycle, parseModules } from './analysisService';
import { INITIAL_HISTORY } from './initialData';

const App: React.FC = () => {
    const [inputHistory, setInputHistory] = useState<DataSet[]>(() => JSON.parse(localStorage.getItem('dh_v25_history') || JSON.stringify(INITIAL_HISTORY)));
    const [hitsHistory, setHitsHistory] = useState<HitRecord[]>(() => JSON.parse(localStorage.getItem('dh_v25_hits') || '[]'));
    const [rectificationHistory, setRectificationHistory] = useState<RectificationRecord[]>(() => JSON.parse(localStorage.getItem('dh_v25_rect') || '[]'));
    const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('dh_v25_settings') || '{"entropy": 0.4, "voiceEnabled": true}'));
    
    const [m1, setM1] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_v25_m1') || '["","","","","","",""]'));
    const [m2, setM2] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_v25_m2') || '["","","","","","",""]'));
    const [m3, setM3] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_v25_m3') || '["","","","","","",""]'));

    // Navegação Histórica do Módulo 3 (Back/Next)
    const [m3History, setM3History] = useState<string[][]>(() => [JSON.parse(localStorage.getItem('dh_v25_m3') || '["","","","","","",""]')]);
    const [m3Idx, setM3Idx] = useState(0);

    const [generatedResult, setGeneratedResult] = useState<DataSet | null>(() => JSON.parse(localStorage.getItem('dh_v25_last_res') || 'null'));
    const [candidates, setCandidates] = useState<Candidate[] | null>(() => JSON.parse(localStorage.getItem('dh_v25_last_cand') || 'null'));
    const [advancedPredictions, setAdvancedPredictions] = useState<AdvancedPredictions | null>(() => JSON.parse(localStorage.getItem('dh_v25_last_adv') || 'null'));
    const [analysisData, setAnalysisData] = useState<CombinedAnalysis | null>(() => JSON.parse(localStorage.getItem('dh_v25_last_ana') || 'null'));

    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(() => localStorage.getItem('dh_v25_locked') === 'true');

    useEffect(() => {
        localStorage.setItem('dh_v25_history', JSON.stringify(inputHistory));
        localStorage.setItem('dh_v25_hits', JSON.stringify(hitsHistory));
        localStorage.setItem('dh_v25_rect', JSON.stringify(rectificationHistory));
        localStorage.setItem('dh_v25_settings', JSON.stringify(settings));
        localStorage.setItem('dh_v25_m1', JSON.stringify(m1));
        localStorage.setItem('dh_v25_m2', JSON.stringify(m2));
        localStorage.setItem('dh_v25_m3', JSON.stringify(m3));
        localStorage.setItem('dh_v25_last_res', JSON.stringify(generatedResult));
        localStorage.setItem('dh_v25_last_cand', JSON.stringify(candidates));
        localStorage.setItem('dh_v25_last_adv', JSON.stringify(advancedPredictions));
        localStorage.setItem('dh_v25_last_ana', JSON.stringify(analysisData));
        localStorage.setItem('dh_v25_locked', isLocked.toString());
    }, [inputHistory, hitsHistory, rectificationHistory, settings, m1, m2, m3, generatedResult, candidates, advancedPredictions, analysisData, isLocked]);

    const speak = useCallback((text: string) => {
        if (!settings.voiceEnabled) return;
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'pt-BR';
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.lang.includes('pt-BR') && (v.name.includes('Maria') || v.name.includes('Luciana') || v.name.includes('Google português do Brasil')));
        if (femaleVoice) msg.voice = femaleVoice;
        msg.rate = 0.9; msg.pitch = 1.2;
        window.speechSynthesis.speak(msg);
    }, [settings.voiceEnabled]);

    const processAutoCorrection = (actualValues: string[]) => {
        if (!generatedResult) return;
        const newHits: HitRecord[] = [];
        const newRects: RectificationRecord[] = [];

        actualValues.forEach((act, idx) => {
            if (!act || act.length < 3) return;
            const gen = generatedResult[idx].join('');
            const type = idx === 6 ? 'Centena' : 'Milhar';
            const rankLabel = idx === 0 ? '1º PRÊMIO' : `${idx + 1}º PRÊMIO`;

            if (gen === act) {
                newHits.push({ id: crypto.randomUUID(), value: gen, type, position: idx + 1, status: 'Acerto', timestamp: Date.now() });
            } else {
                const genSorted = gen.split('').sort().join('');
                const actSorted = act.split('').sort().join('');
                if (genSorted === actSorted) {
                    newHits.push({ id: crypto.randomUUID(), value: gen, type, position: idx + 1, status: 'Quase Acerto', timestamp: Date.now() });
                } else {
                    let matches = 0;
                    const minMatch = type === 'Milhar' ? 3 : 2;
                    for (let i = 0; i < act.length; i++) { if (gen[i] === act[i]) matches++; }
                    if (matches >= minMatch) {
                        newHits.push({ id: crypto.randomUUID(), value: gen, type, position: idx + 1, status: 'Quase Acerto', timestamp: Date.now() });
                    }
                }
            }
            // Salvamento Automático no Histórico de Ajustes
            newRects.push({ id: crypto.randomUUID(), generated: gen, actual: act, type, rankLabel, timestamp: Date.now() });
        });

        if (newHits.length > 0) setHitsHistory(prev => [...newHits, ...prev]);
        if (newRects.length > 0) setRectificationHistory(prev => [...newRects, ...prev]);

        if (newHits.some(h => h.status === 'Acerto')) {
            speak("Ressonância absoluta. Ajustes salvos automaticamente no banco neural.");
        } else if (newHits.some(h => h.status === 'Quase Acerto')) {
            speak("Aproximação detectada. O Oráculo está recalibrando a matriz.");
        } else {
            speak("Dados assimilados. Ajustes de realidade registrados.");
        }
    };

    const handleGenerate = () => {
        if (isLoading || isLocked) return;
        setIsLoading(true);
        speak("Manifestando a matriz. Analisando correntes elite.");
        const parsed = parseModules([m1, m2, m3]);
        setTimeout(() => {
            const res = runGenerationCycle(parsed.modules, inputHistory, hitsHistory, rectificationHistory, settings.entropy);
            setGeneratedResult(res.result);
            setCandidates(res.candidates);
            setAdvancedPredictions(res.advancedPredictions);
            setAnalysisData(res.analysis);
            setIsLoading(false);
            setIsLocked(true); 
            speak("Matriz prevista manifestada. Foco nos três primeiros prêmios.");
        }, 4000);
    };

    const handlePasteM3 = (v: string[]) => {
        processAutoCorrection(v);
        setM1(m2); setM2(m3); setM3(v);
        
        const newHistory = [...m3History.slice(0, m3Idx + 1), v].slice(-50);
        setM3History(newHistory);
        setM3Idx(newHistory.length - 1);

        const numericSet = v.map(line => line.split('').map(Number));
        setInputHistory(prev => [numericSet, ...prev].slice(0, 300));
        setIsLocked(false);
    };

    const handleM3Undo = () => {
        if (m3Idx > 0) {
            const prevVal = m3History[m3Idx - 1];
            setM3(prevVal);
            setM3Idx(m3Idx - 1);
            setIsLocked(false);
        }
    };

    const handleM3Redo = () => {
        if (m3Idx < m3History.length - 1) {
            const nextVal = m3History[m3Idx + 1];
            setM3(nextVal);
            setM3Idx(m3Idx + 1);
            setIsLocked(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#010409] px-4 pt-4 pb-20 gap-8 text-slate-100 flex flex-col overflow-y-auto no-scrollbar selection:bg-amber-500/30 font-orbitron hologram-noise relative max-w-7xl mx-auto">
            <Header onOpenHistory={() => setIsHistoryOpen(true)} onOpenChat={() => setIsChatOpen(true)} isLoading={isLoading} />
            
            <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-amber-500/10 shadow-2xl backdrop-blur-3xl oracle-glow relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[120px] -mr-32 -mt-32"></div>
                <div className="flex justify-between mb-8 items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">Entropia Quântica</span>
                        <span className="text-[20px] text-amber-500 font-black uppercase tracking-widest">Nível: {(settings.entropy * 100).toFixed(0)}%</span>
                    </div>
                    <button onClick={() => setSettings({...settings, voiceEnabled: !settings.voiceEnabled})} className={`p-6 rounded-[2rem] border transition-all active:scale-90 ${settings.voiceEnabled ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path className={settings.voiceEnabled ? "opacity-100" : "opacity-0"} d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    </button>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={settings.entropy} onChange={(e) => setSettings({...settings, entropy: parseFloat(e.target.value)})} className="w-full accent-amber-500 h-4 bg-slate-800 rounded-full cursor-pointer" />
            </div>

            <div className="module-grid shrink-0">
                <ModuleInput id="1" title="CORE-A" values={m1} setValues={setM1} readOnly />
                <ModuleInput id="2" title="CORE-B" values={m2} setValues={setM2} readOnly />
                <ModuleInput 
                    id="3" 
                    title="ONDA-REAL" 
                    values={m3} 
                    setValues={(v) => {setM3(v); setIsLocked(false);}} 
                    onPaste={handlePasteM3} 
                    onUndo={handleM3Undo}
                    onRedo={handleM3Redo}
                    onClear={() => {setM3(Array(7).fill("")); setM3History([Array(7).fill("")]); setM3Idx(0); speak("Memória limpa.");}} 
                />
            </div>

            <button onClick={handleGenerate} disabled={isLoading || isLocked} className={`w-full py-12 font-black rounded-[4rem] uppercase tracking-[0.7em] border-2 transition-all text-[18px] relative overflow-hidden group shrink-0 ${isLoading || isLocked ? 'bg-slate-900/50 border-slate-800 text-slate-700' : 'bg-slate-950 border-amber-600 text-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.3)] active:scale-95'}`}>
                <div className="absolute inset-0 bg-amber-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                {isLoading ? 'ANALISANDO MATRIZ...' : isLocked ? 'MATRIZ MANIFESTADA' : 'INICIAR COLAPSO ELITE'}
            </button>

            {isLoading ? <Loader /> : (
                <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 flex-1">
                    <StatisticsDisplay analysis={analysisData} isLoading={isLoading} />
                    <ResultDisplay result={generatedResult} onMarkHit={(v, t, p, s) => setHitsHistory(prev => [{id: crypto.randomUUID(), value: v, type: t, position: p, status: s || 'Acerto', timestamp: Date.now()}, ...prev])} onManualRectify={(g, a, t, l) => setRectificationHistory(prev => [{id: crypto.randomUUID(), generated: g, actual: a, type: t, rankLabel: l, timestamp: Date.now()}, ...prev])} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <AdvancedPredictionDisplay predictions={advancedPredictions} onMarkHit={(v, t, p, s) => setHitsHistory(prev => [{id: crypto.randomUUID(), value: v, type: t, position: p, status: s || 'Acerto', timestamp: Date.now()}, ...prev])} onManualRectify={(g, a, t, l) => setRectificationHistory(prev => [{id: crypto.randomUUID(), generated: g, actual: a, type: t, rankLabel: l, timestamp: Date.now()}, ...prev])} />
                        <CandidateDisplay candidates={candidates} onMarkHit={(v, t, p, s) => setHitsHistory(prev => [{id: crypto.randomUUID(), value: v, type: t, position: p, status: s || 'Acerto', timestamp: Date.now()}, ...prev])} onManualRectify={(g, a, t, l) => setRectificationHistory(prev => [{id: crypto.randomUUID(), generated: g, actual: a, type: t, rankLabel: l, timestamp: Date.now()}, ...prev])} />
                    </div>
                </div>
            )}

            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} inputHistory={inputHistory} onClearInputHistory={() => setInputHistory([])} onDeleteInputItem={(i) => setInputHistory(prev => prev.filter((_, idx) => idx !== i))} generatedHistory={[]} onClearGeneratedHistory={() => {}} onDeleteGeneratedItem={() => {}} hitsHistory={hitsHistory} onClearHitsHistory={() => setHitsHistory([])} onDeleteHitItem={(i) => setHitsHistory(prev => prev.filter((_, idx) => idx !== i))} rectificationHistory={rectificationHistory} onClearRectificationHistory={() => setRectificationHistory([])} onDeleteRectificationItem={(i) => setRectificationHistory(prev => prev.filter((_, idx) => idx !== i))} />
            <ChatModule isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} voiceEnabled={settings.voiceEnabled} onSpeak={speak} />
        </div>
    );
};

export default App;