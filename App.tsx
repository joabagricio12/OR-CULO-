
import React, { useState, useEffect } from 'react';
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
    const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('dh_v25_settings') || '{"entropy": 0.45, "voiceEnabled": true}'));
    
    const [m1, setM1] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_v25_m1') || '["","","","","","",""]'));
    const [m2, setM2] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_v25_m2') || '["","","","","","",""]'));
    const [m3, setM3] = useState<string[]>(() => JSON.parse(localStorage.getItem('dh_v25_m3') || '["","","","","","",""]'));

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

    const speak = (text: string) => {
        if (!settings.voiceEnabled) return;
        window.speechSynthesis.cancel();
        
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'pt-BR';
        
        // Priorizando uma voz feminina suave e clara
        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = ['Google português do Brasil', 'Maria', 'Luciana', 'Microsoft Maria'];
        const femaleVoice = voices.find(v => 
            preferredVoices.some(pv => v.name.includes(pv)) || 
            (v.lang.includes('pt-BR') && (v.name.includes('Female') || v.name.includes('Feminino')))
        );
        
        if (femaleVoice) msg.voice = femaleVoice;
        
        msg.rate = 0.92; // Suavidade e clareza
        msg.pitch = 1.05; // Timbre levemente feminino e refinado
        msg.volume = 1;
        
        window.speechSynthesis.speak(msg);
    };

    const handleGenerate = () => {
        if (isLoading || isLocked) return;
        setIsLoading(true);
        speak("Manifestando a matriz. Estou colapsando as dimensões de probabilidade para encontrar sua milhar.");
        
        const parsed = parseModules([m1, m2, m3]);
        setTimeout(() => {
            const res = runGenerationCycle(parsed.modules, inputHistory, hitsHistory, rectificationHistory, settings.entropy);
            setGeneratedResult(res.result);
            setCandidates(res.candidates);
            setAdvancedPredictions(res.advancedPredictions);
            setAnalysisData(res.analysis);
            setIsLoading(false);
            setIsLocked(true); 
            speak("Onda manifestada com sucesso. Os padrões foram isolados.");
        }, 4500);
    };

    const handlePasteM3 = (v: string[]) => {
        setM1(m2); setM2(m3); setM3(v);
        const numericSet = v.map(line => line.split('').map(Number));
        setInputHistory(prev => [numericSet, ...prev].slice(0, 250));
        setIsLocked(false);
        speak("Dados sincronizados. Minha percepção da matriz foi atualizada.");
    };

    const toggleVoice = () => {
        const newVal = !settings.voiceEnabled;
        setSettings({...settings, voiceEnabled: newVal});
        if (newVal) {
            speak("Voz ativa. Sinta a minha presença.");
        } else {
            window.speechSynthesis.cancel();
        }
    };

    return (
        <div className="min-h-screen bg-[#010409] px-3 pt-2 pb-12 gap-3 text-slate-100 flex flex-col overflow-y-auto no-scrollbar selection:bg-amber-500/30 font-orbitron hologram-noise relative">
            <Header 
                onOpenHistory={() => setIsHistoryOpen(true)} 
                onOpenChat={() => setIsChatOpen(true)}
                isLoading={isLoading} 
            />
            
            <div className="bg-slate-900/40 p-4 rounded-[2.2rem] border border-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.03)] backdrop-blur-3xl oracle-glow relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16"></div>
                <div className="flex justify-between mb-2.5 items-end">
                    <div className="flex flex-col">
                        <span className="text-[6px] text-slate-500 font-black uppercase tracking-[0.3em]">Ruído Quântico</span>
                        <span className="text-[11px] text-amber-500 font-black uppercase tracking-widest">Entropia: {(settings.entropy * 100).toFixed(0)}%</span>
                    </div>
                    <button 
                        onClick={toggleVoice}
                        className={`p-3 rounded-2xl border transition-all shadow-lg active:scale-90 ${settings.voiceEnabled ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}
                        title={settings.voiceEnabled ? "Silenciar Oráculo" : "Ativar Voz"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path className={settings.voiceEnabled ? "opacity-100" : "opacity-0"} d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    </button>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={settings.entropy} onChange={(e) => setSettings({...settings, entropy: parseFloat(e.target.value)})} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
            </div>

            <div className="module-grid shrink-0">
                <ModuleInput id="1" title="ALPHA-CORE" values={m1} setValues={setM1} readOnly />
                <ModuleInput id="2" title="BETA-SYNC" values={m2} setValues={setM2} readOnly />
                <ModuleInput id="3" title="ONDA-REAL" values={m3} setValues={(v) => {setM3(v); setIsLocked(false);}} onPaste={handlePasteM3} onClear={() => {setM3(Array(7).fill("")); speak("Memória de curto prazo limpa. Estou pronta para novos dados.");}} />
            </div>

            <button onClick={handleGenerate} disabled={isLoading || isLocked} className={`w-full py-6 font-black rounded-[2.5rem] uppercase tracking-[0.3em] border-2 transition-all text-[11px] relative overflow-hidden group shrink-0 ${isLoading || isLocked ? 'bg-slate-900/50 border-slate-800 text-slate-700' : 'bg-slate-950 border-amber-600 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.25)] active:scale-95'}`}>
                <div className="absolute inset-0 bg-amber-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                {isLoading ? 'ANALISANDO MATRIZ...' : isLocked ? 'ONDA MANIFESTADA' : 'INICIAR COLAPSO'}
            </button>

            {isLoading ? <Loader /> : (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 flex-1">
                    <StatisticsDisplay analysis={analysisData} isLoading={isLoading} />
                    <div className="grid grid-cols-1 gap-4">
                        <ResultDisplay result={generatedResult} onMarkHit={(v, t, p, s) => setHitsHistory(prev => [{id: crypto.randomUUID(), value: v, type: t, position: p, status: s || 'Acerto', timestamp: Date.now()}, ...prev])} onManualRectify={(g, a, t, l) => setRectificationHistory(prev => [{id: crypto.randomUUID(), generated: g, actual: a, type: t, rankLabel: l, timestamp: Date.now()}, ...prev])} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AdvancedPredictionDisplay predictions={advancedPredictions} onMarkHit={(v, t, p, s) => setHitsHistory(prev => [{id: crypto.randomUUID(), value: v, type: t, position: p, status: s || 'Acerto', timestamp: Date.now()}, ...prev])} onManualRectify={(g, a, t, l) => setRectificationHistory(prev => [{id: crypto.randomUUID(), generated: g, actual: a, type: t, rankLabel: l, timestamp: Date.now()}, ...prev])} />
                            <CandidateDisplay candidates={candidates} onMarkHit={(v, t, p, s) => setHitsHistory(prev => [{id: crypto.randomUUID(), value: v, type: t, position: p, status: s || 'Acerto', timestamp: Date.now()}, ...prev])} onManualRectify={(g, a, t, l) => setRectificationHistory(prev => [{id: crypto.randomUUID(), generated: g, actual: a, type: t, rankLabel: l, timestamp: Date.now()}, ...prev])} />
                        </div>
                    </div>
                </div>
            )}

            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} inputHistory={inputHistory} onClearInputHistory={() => setInputHistory([])} onDeleteInputItem={(i) => setInputHistory(prev => prev.filter((_, idx) => idx !== i))} generatedHistory={[]} onClearGeneratedHistory={() => {}} onDeleteGeneratedItem={() => {}} hitsHistory={hitsHistory} onClearHitsHistory={() => setHitsHistory([])} onDeleteHitItem={(i) => setHitsHistory(prev => prev.filter((_, idx) => idx !== i))} rectificationHistory={rectificationHistory} onClearRectificationHistory={() => setRectificationHistory([])} onDeleteRectificationItem={(i) => setRectificationHistory(prev => prev.filter((_, idx) => idx !== i))} />
            
            <ChatModule 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
              voiceEnabled={settings.voiceEnabled}
              onSpeak={speak}
            />
        </div>
    );
};

export default App;
