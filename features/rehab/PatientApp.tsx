import React, { useState, useRef, useEffect } from 'react';
import { Play, CheckCircle2, ChevronRight, LogOut, Activity, Sparkles, Target, TrendingUp, Calendar, BrainCircuit, Video, ArrowLeft, X, Save, Clock, PieChart as PieIcon, Shield, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, PieChart, Pie, Cell } from 'recharts';
import { Patient, Exercise, DailyLog, MDPatientData } from '../../types';
import { getProgressBooster, analyzePatientProgress, analyzeMDMetrics } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { MDOnboarding } from '../../modules/muscle-dystrophy/MDOnboarding';
import { MDMetrics } from '../../modules/muscle-dystrophy/MDMetrics';
import { MDEducation } from '../../modules/muscle-dystrophy/MDEducation';

interface PatientAppProps {
  patient: Patient;
  onBack: () => void;
  onLogEntry: (log: DailyLog) => void;
  onUpdatePatient?: (updated: Patient) => void;
}

type PatientTab = 'protocol' | 'progress' | 'md-insights' | 'education';

export const PatientApp: React.FC<PatientAppProps> = ({ patient, onBack, onLogEntry, onUpdatePatient }) => {
  const [activeTab, setActiveTab] = useState<PatientTab>('protocol');
  const [activeEx, setActiveEx] = useState<Exercise | null>(null);
  const [isExercising, setIsExercising] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [angle, setAngle] = useState(0);
  const [reps, setReps] = useState(0);
  const [pain, setPain] = useState(5);
  const [booster, setBooster] = useState("Calibrating your recovery protocol...");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [mdAnalysis, setMDAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mdStability, setMdStability] = useState(95);
  const [mdFatigue, setMdFatigue] = useState(2);
  const [mdAlert, setMdAlert] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxRomRef = useRef(0);
  const movementHistoryRef = useRef<number[]>([]);

  // Fetch AI Booster on load
  useEffect(() => {
    getProgressBooster(patient).then(setBooster);
  }, [patient]);

  // AI analysis for the patient-facing dashboard
  const triggerAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzePatientProgress(patient);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Unable to reach clinical intelligence. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI MD analysis
  const triggerMDAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeMDMetrics(patient);
      setMDAnalysis(result);
    } catch (e) {
      setMDAnalysis("Condition analysis offline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Motion Tracking Simulation Logic
  useEffect(() => {
    let interval: any;
    if (isExercising) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => { if (videoRef.current) videoRef.current.srcObject = s; })
        .catch(console.error);

      interval = setInterval(() => {
        setAngle(p => {
          let next = Math.sin(Date.now() / 800) * 40 + 40;
          
          // Adaptive Feedback for MD
          if (patient.mode === 'MuscleDystrophy' && patient.mdData) {
              const degradationFactor = (10 - patient.mdData.fatigueSensitivity) / 10;
              movementHistoryRef.current.push(next);
              if (movementHistoryRef.current.length > 50) {
                  const recent = movementHistoryRef.current.slice(-20);
                  const variance = Math.max(...recent) - Math.min(...recent);
                  setMdStability(Math.max(60, 100 - (variance / 2)));
                  
                  // Fatigue detection
                  if (movementHistoryRef.current.length % 30 === 0) {
                      setMdFatigue(prev => Math.min(10, prev + 0.1));
                  }

                  // Risk detection
                  if (mdFatigue > (10 - patient.mdData.fatigueSensitivity)) {
                      setMdAlert("Warning: Excessive fatigue detected. Support mode activated. Slow down.");
                  }
                  if (mdFatigue > 9) {
                      setMdAlert("CRITICAL: Extreme overexertion. Session auto-aborting in 5s.");
                      setTimeout(() => {
                          setIsExercising(false);
                          setIsFinished(true);
                      }, 5000);
                  }
              }
          }

          if (next > maxRomRef.current) maxRomRef.current = next;
          return Math.floor(next);
        });
        
        const repThreshold = patient.mode === 'MuscleDystrophy' ? 0.95 : 0.985;
        if (Math.random() > repThreshold) {
            setReps(r => {
                const next = r + 1;
                if (next >= (activeEx?.targetReps || 10)) {
                    setIsExercising(false);
                    setIsFinished(true);
                }
                return next;
            });
        }
      }, 100);
    } else {
        if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        movementHistoryRef.current = [];
        setMdAlert(null);
    }
    return () => clearInterval(interval);
  }, [isExercising, activeEx, patient.mode, patient.mdData, mdFatigue]);

  // Graph Data Preparation
  const chartData = patient.logs.map((log, i) => ({
    date: log.date.split('-').slice(1).join('/'),
    rom: log.maxRom,
    benchmark: patient.benchmarkRom[Math.min(i, patient.benchmarkRom.length - 1)] || 0
  }));

  // Consistency Logic
  const consistency = 88; // Simulated metric
  const pieData = [
    { name: 'Completed', value: consistency },
    { name: 'Missed', value: 100 - consistency },
  ];
  const COLORS = ['#2563eb', '#f1f5f9'];

  const submitLog = () => {
    onLogEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      painScore: pain,
      maxRom: Math.floor(maxRomRef.current),
      repsCompleted: reps,
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      stabilityScore: patient.mode === 'MuscleDystrophy' ? mdStability : undefined,
      fatigueIndex: patient.mode === 'MuscleDystrophy' ? Math.floor(mdFatigue) : undefined,
      movementDegradation: patient.mode === 'MuscleDystrophy' ? Math.floor(Math.random() * 10) : undefined,
      isAssisted: patient.mode === 'MuscleDystrophy' && patient.mdData?.useScaffoldSupport
    });
    setIsFinished(false);
    setActiveEx(null);
    setMdFatigue(2);
    setMdStability(95);
  };

  // --- RENDERING VIEWS ---

  if (patient.mode === 'MuscleDystrophy' && !patient.mdData) {
    return <MDOnboarding onCancel={onBack} onComplete={(data) => {
        if (onUpdatePatient) {
            onUpdatePatient({ ...patient, mdData: data });
        }
    }} />;
  }

  if (isExercising) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative bg-slate-900 overflow-hidden">
          <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.2]"/>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64 border-2 border-white/10 rounded-full flex items-center justify-center">
               <div className="absolute top-1/2 left-1/2 w-32 h-1 bg-gradient-to-r from-brand-500 to-transparent origin-left rounded-full" style={{ transform: `rotate(-${angle + 90}deg)` }} />
               <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 text-white font-black text-4xl shadow-2xl">{angle}°</div>
            </div>
          </div>
          <div className="absolute top-12 left-8 right-8 flex justify-between items-start text-white">
            <div>
                <h3 className="font-black text-2xl tracking-tight">{activeEx?.name}</h3>
                <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                    <Activity size={12} className="animate-pulse" /> {patient.mode === 'MuscleDystrophy' ? 'MD Scaffold Active' : 'Sensorless Motion AI'}
                </p>
                {patient.mode === 'MuscleDystrophy' && (
                    <div className="mt-4 flex gap-3">
                        <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase">Stability: {mdStability}%</div>
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${mdFatigue > 7 ? 'bg-orange-500/50' : 'bg-white/10'}`}>Fatigue: {Math.floor(mdFatigue)}/10</div>
                    </div>
                )}
            </div>
            <div className="text-right">
                <p className="text-5xl font-black">{reps}<span className="text-sm opacity-40 ml-1">/{activeEx?.targetReps}</span></p>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Completed</p>
            </div>
          </div>
          {mdAlert && (
            <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 p-8 text-center pointer-events-none">
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-orange-500 text-white rounded-3xl font-black uppercase tracking-widest animate-bounce shadow-2xl">
                    <Zap size={20} /> {mdAlert}
                </div>
            </div>
          )}
        </div>
        <div className="bg-slate-900 p-8 pb-12 rounded-t-[40px] -mt-10 relative z-30 border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4 text-white mb-8">
             <div className="w-12 h-12 bg-brand-500/20 text-brand-400 rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 size={24}/></div>
             <p className="font-bold text-lg leading-tight">
                {patient.mode === 'MuscleDystrophy' 
                  ? "Gentle, controlled movements only. The scaffold is tracking your muscle stability in real-time."
                  : "Focus on smooth, controlled extension through the full ROM."}
             </p>
          </div>
          <button onClick={() => { setIsExercising(false); setActiveEx(null); }} className="w-full py-4 text-white/30 font-black uppercase tracking-widest text-[10px] border border-white/10 rounded-2xl hover:bg-white/5 transition-all">Abort Session</button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col justify-center items-center text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-premium animate-bounce"><CheckCircle2 size={32}/></div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Session Optimized</h2>
        <p className="text-slate-500 mt-4 max-w-xs font-medium italic">Trajectory data recorded. Tell us how you're feeling to update your clinical record.</p>
        
        <div className="w-full max-w-sm mt-12 space-y-8">
          <div className="glass-card p-10 bg-slate-50 border-none shadow-none">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Subjective Pain (0-10)</label>
            <input type="range" min="0" max="10" value={pain} onChange={e => setPain(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 rounded-full appearance-none accent-brand-600 mb-8 cursor-pointer"/>
            <p className="text-7xl font-black text-brand-600">{pain}</p>
          </div>
          <button onClick={submitLog} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-premium hover:bg-slate-800 transition-all active:scale-95">Commit to Protocol</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="bg-white/80 backdrop-blur-md px-6 py-5 border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20"><Activity size={20}/></div>
                <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">{patient.name}</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recovery Hub</span>
                </div>
            </div>
            <button onClick={onBack} className="p-3 text-slate-300 hover:text-red-500 transition-all"><LogOut size={20}/></button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto mt-6">
            <div className={`p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-hide ${patient.mode === 'MuscleDystrophy' ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                <button onClick={() => setActiveTab('protocol')} className={`whitespace-nowrap flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'protocol' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Protocol</button>
                <button onClick={() => setActiveTab('progress')} className={`whitespace-nowrap flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'progress' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Progress</button>
                {patient.mode === 'MuscleDystrophy' && (
                    <>
                        <button onClick={() => setActiveTab('md-insights')} className={`whitespace-nowrap flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'md-insights' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>MD Insights</button>
                        <button onClick={() => setActiveTab('education')} className={`whitespace-nowrap flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'education' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Education</button>
                    </>
                )}
            </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {activeTab === 'protocol' && (
                <div className="space-y-8">
                    {/* Mode Highlight Badge */}
                    {patient.mode === 'MuscleDystrophy' && (
                        <div className="px-4 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                            <Shield size={12} /> MD Mode: Assisted Recovery Active
                        </div>
                    )}
                    {/* Intelligence Booster */}
                    <div className="glass-card p-6 bg-gradient-to-br from-brand-600 to-indigo-700 text-white relative overflow-hidden shadow-xl shadow-brand-600/20">
                        <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                        <div className="flex items-center gap-2 mb-3">
                            <BrainCircuit size={16} className="text-white/60" />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Intelligence Insight</p>
                        </div>
                        <p className="text-lg font-bold leading-tight">"{booster}"</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Assigned Tasks</h3>
                        {patient.prescribedExercises.map(ex => (
                            <button key={ex.id} onClick={() => { setActiveEx(ex); setIsExercising(true); }} className={`w-full glass-card p-6 flex justify-between items-center hover:bg-white hover:scale-[1.02] transition-all border-l-4 group ${patient.mode === 'MuscleDystrophy' ? 'border-l-indigo-600' : 'border-l-brand-600'}`}>
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${patient.mode === 'MuscleDystrophy' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white'}`}><Play size={24} fill="currentColor"/></div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-800 text-lg">{ex.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> {ex.targetReps} Reps</span>
                                            {ex.targetRom > 0 && <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest flex items-center gap-1"><Target size={12}/> {ex.targetRom}°</span>}
                                            {ex.isLowImpact && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1"><Zap size={12}/> Low Impact</span>}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform"/>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-6 bg-blue-50/50 border-blue-100">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Logs</p>
                            <p className="text-3xl font-black text-blue-600">{patient.logs.length}</p>
                        </div>
                        <div className="glass-card p-6 bg-indigo-50/50 border-indigo-100">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Consistency</p>
                            <p className="text-3xl font-black text-indigo-600">{consistency}%</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'progress' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Visual Progress Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Area Chart: ROM Trajectory */}
                        <div className="glass-card p-8">
                            <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2 mb-8">
                                <TrendingUp className="text-brand-600" size={16}/> Recovery Trajectory
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10} as any} />
                                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                        <Area type="monotone" dataKey="rom" stroke="#2563eb" fill="#2563eb" fillOpacity={0.05} strokeWidth={4} />
                                        <Line type="monotone" dataKey="benchmark" stroke="#cbd5e1" strokeDasharray="6 6" dot={false} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart: Consistency */}
                        <div className="glass-card p-8 flex flex-col items-center">
                            <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2 mb-8 self-start">
                                <PieIcon className="text-brand-600" size={16}/> Protocol Consistency
                            </h3>
                            <div className="h-64 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-slate-900">{consistency}%</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Compliant</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gemini AI Recovery Insights */}
                    <div className="glass-card p-8 bg-gradient-to-br from-white to-brand-50/20 border-brand-100">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="text-brand-600" size={20}/>
                                <span className="font-black text-slate-900 ai-gradient-text uppercase tracking-widest text-[10px]">Clinical recovery review</span>
                            </div>
                            <button onClick={triggerAIAnalysis} disabled={isAnalyzing} className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all flex items-center gap-2">
                                {isAnalyzing ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><Sparkles size={12}/> Analyze Progress</>}
                            </button>
                        </div>
                        {analysis ? (
                            <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:font-medium animate-in fade-in duration-700">
                                <ReactMarkdown>{analysis}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-slate-400 text-xs italic">Generate a detailed AI clinical analysis of your physical trajectory.</p>
                            </div>
                        )}
                    </div>

                    {/* Session History */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Clinical Session Vault</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {patient.logs.slice().reverse().map(log => (
                                <div key={log.id} className="glass-card p-5 bg-white border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center"><Calendar size={18}/></div>
                                        <div>
                                            <p className="font-black text-slate-900">{log.date}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Extension Achieved: {log.maxRom}°</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-brand-600">{log.painScore}/10 Pain</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Verified Entry</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'md-insights' && patient.mode === 'MuscleDystrophy' && (
                <div className="space-y-8">
                     <MDMetrics logs={patient.logs} />
                     
                     {/* MD Intelligence Report */}
                     <div className="glass-card p-8 bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <Activity className="text-indigo-600" size={20}/>
                                <span className="font-black text-slate-900 ai-gradient-text uppercase tracking-widest text-[10px]">MD Clinical Intelligence</span>
                            </div>
                            <button onClick={triggerMDAnalysis} disabled={isAnalyzing} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
                                {isAnalyzing ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><Sparkles size={12}/> Analyze Condition</>}
                            </button>
                        </div>
                        {mdAnalysis ? (
                            <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:font-medium animate-in fade-in duration-700">
                                <ReactMarkdown>{mdAnalysis}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-slate-400 text-xs italic">Generate a detailed MD-specific analysis of your muscle stability and fatigue.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'education' && (
                <MDEducation />
            )}
        </div>
      </main>
    </div>
  );
};