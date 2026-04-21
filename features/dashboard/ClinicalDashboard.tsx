
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { Activity, BrainCircuit, Sparkles, Video, Play, Target, TrendingUp, Menu, LogOut, UserPlus, BadgeCheck, Mail, Send, X, Save, Mic } from 'lucide-react';
import { Patient, DailyLog } from '../../types';
import { analyzePatientProgress, analyzeMDMetrics } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Shield, Zap, AlertTriangle, Activity as ActivityIcon } from 'lucide-react';

interface ClinicalDashboardProps {
  patients: Patient[];
  onSignOut: () => void;
  currentPhysio?: { name: string; id: string };
  onPatientUpdate: (patient: Patient) => void;
}

export const ClinicalDashboard: React.FC<ClinicalDashboardProps> = ({ patients, onSignOut, currentPhysio, onPatientUpdate }) => {
  const [selectedId, setSelectedId] = useState(patients[0].id);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeLog, setActiveLog] = useState<DailyLog | null>(null);

  const activePatient = patients.find(p => p.id === selectedId) || patients[0];

  const chartData = activePatient.logs.map((log, i) => ({
    date: log.date.split('-').slice(1).join('/'),
    rom: log.maxRom,
    benchmark: activePatient.benchmarkRom[Math.min(i, activePatient.benchmarkRom.length - 1)] || 0
  }));

  const triggerAI = async () => {
    setIsAnalyzing(true);
    let result;
    if (activePatient.mode === 'MuscleDystrophy') {
        result = await analyzeMDMetrics(activePatient);
    } else {
        result = await analyzePatientProgress(activePatient);
    }
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const saveLogEdit = () => {
    if (!activeLog) return;
    const updated = { ...activePatient, logs: activePatient.logs.map(l => l.id === activeLog.id ? activeLog : l) };
    onPatientUpdate(updated);
    setActiveLog(null);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      {/* Sidebar Feature */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white"><Activity size={18}/></div>
          <span className="font-black text-slate-800 uppercase tracking-tighter">PhysioAI</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {patients.map(p => (
            <button key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedId === p.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 border-brand-600' : 'hover:bg-slate-50 border-transparent'}`}>
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-sm">{p.name}</p>
                {p.mode === 'MuscleDystrophy' && <Shield size={12} className={selectedId === p.id ? 'text-white' : 'text-indigo-600'} />}
              </div>
              <p className={`text-[9px] uppercase font-black tracking-widest ${selectedId === p.id ? 'text-white/60' : 'text-slate-400'}`}>{p.injuryType.replace('_',' ')}</p>
              {p.mode === 'MuscleDystrophy' && (
                <div className={`mt-2 text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${selectedId === p.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                    MD Supportive
                </div>
              )}
            </button>
          ))}
        </nav>
        <button onClick={onSignOut} className="p-6 border-t border-slate-100 flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors">
          <LogOut size={16}/> Sign Out
        </button>
      </aside>

      {/* Analytics Feature */}
      <main className="flex-1 overflow-auto flex flex-col scrollbar-hide">
        <header className="bg-white/80 backdrop-blur-md px-8 py-5 border-b border-slate-200 sticky top-0 z-30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2"><Menu/></button>
            <h1 className="text-xl font-black text-slate-900">{activePatient.name} <span className="text-brand-600 ml-1">Dashboard</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900">{currentPhysio?.name}</p>
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Institution ID: {currentPhysio?.id}</p>
             </div>
             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">{currentPhysio?.name[0]}</div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
           {activePatient.mode === 'MuscleDystrophy' && (
               <div className="p-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-between shadow-xl shadow-indigo-600/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Shield size={20}/></div>
                        <div>
                            <h2 className="font-black text-sm uppercase tracking-widest">Muscle Dystrophy Support Mode Active</h2>
                            <p className="text-[10px] font-bold text-white/70">Scaffold-inspired tracking & fatigue mitigation logic enabled.</p>
                        </div>
                    </div>
                    {activePatient.mdData && (
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase text-white/50">Type: {activePatient.mdData.type}</p>
                            <p className="text-[10px] font-black uppercase text-white/50">Mobility: {activePatient.mdData.mobilityLevel}</p>
                        </div>
                    )}
               </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-blue-500">
                <Target className="text-blue-500 mb-2" size={20}/>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peak ROM</p>
                <p className="text-2xl font-black">{activePatient.logs[activePatient.logs.length-1]?.maxRom || 0}°</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-indigo-500">
                <Shield className="text-indigo-500 mb-2" size={20}/>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stability Avg</p>
                <p className="text-2xl font-black">
                    {activePatient.mode === 'MuscleDystrophy' 
                        ? (activePatient.logs.reduce((acc, l) => acc + (l.stabilityScore || 0), 0) / (activePatient.logs.length || 1)).toFixed(0) + '%'
                        : '84%'}
                </p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-orange-500">
                <Zap className="text-orange-500 mb-2" size={20}/>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fatigue Sensitivity</p>
                <p className="text-2xl font-black">
                    {activePatient.mode === 'MuscleDystrophy' ? activePatient.mdData?.fatigueSensitivity || 'N/A' : 'PHASE 2'}
                </p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                <BadgeCheck className="text-emerald-500 mb-2" size={20}/>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recovery Level</p>
                <p className="text-2xl font-black">{activePatient.mode === 'MuscleDystrophy' ? 'PROTECTIVE' : 'PHASE 2'}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-8">
                  <h3 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-widest">Trajectory Monitoring</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10} as any} />
                        <Tooltip />
                        <Area type="monotone" dataKey="rom" stroke="#2563eb" fill="#2563eb" fillOpacity={0.05} strokeWidth={3} />
                        <Line type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-8 border-brand-100 bg-gradient-to-br from-white to-brand-50/20">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="text-brand-600"/>
                      <span className="font-black text-slate-900 ai-gradient-text uppercase tracking-widest text-sm">Intelligence Report</span>
                    </div>
                    <button onClick={triggerAI} disabled={isAnalyzing} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-black shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all">
                      {isAnalyzing ? "Processing..." : "Generate Analysis"}
                    </button>
                  </div>
                  {analysis ? <div className="prose prose-sm prose-slate max-w-none"><ReactMarkdown>{analysis}</ReactMarkdown></div> : <p className="text-slate-400 text-xs italic">Awaiting clinical trajectory computation...</p>}
                </div>
              </div>

              <div className="space-y-8">
                 <div className="glass-card p-6">
                   <h3 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Evidence Vault</h3>
                   <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                      {activePatient.logs.slice().reverse().map(log => (
                        <div key={log.id} onClick={() => setActiveLog(log)} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-brand-100 hover:bg-white transition-all cursor-pointer group">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase">{log.date}</span>
                              <Play size={12} className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"/>
                           </div>
                           <div className="flex justify-between items-end">
                              <div><p className="text-lg font-black">{log.maxRom}°</p><p className="text-[10px] font-bold text-slate-400 uppercase">ROM</p></div>
                              <div className="text-right">
                                  {activePatient.mode === 'MuscleDystrophy' && log.stabilityScore && (
                                      <div className="flex items-center gap-1 text-[8px] font-black text-indigo-500 uppercase mb-1">
                                          <Shield size={8} /> Stability: {log.stabilityScore}%
                                      </div>
                                  )}
                                  <p className="text-lg font-black">{log.painScore}/10</p><p className="text-[10px] font-bold text-slate-400 uppercase">PAIN</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Review Overlay Feature */}
      {activeLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="glass-card bg-white w-full max-w-2xl p-8 shadow-2xl overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black tracking-tight">Session Review</h3>
                <button onClick={() => setActiveLog(null)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
             </div>
             <div className="aspect-video bg-slate-900 rounded-3xl mb-6 relative overflow-hidden shadow-inner">
                {activeLog.videoUrl ? <video className="w-full h-full object-cover" src={activeLog.videoUrl} controls autoPlay /> : <div className="flex flex-col items-center justify-center h-full text-slate-500"><Video size={48} className="opacity-20 mb-4"/><p className="text-sm font-bold">Metadata-Only Capture</p></div>}
             </div>
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Adjusted ROM</p>
                   <input type="number" value={activeLog.maxRom} onChange={e => setActiveLog({...activeLog, maxRom: parseInt(e.target.value)})} className="w-full bg-transparent font-black text-xl text-brand-600 outline-none"/>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pain Score</p>
                   <input type="number" value={activeLog.painScore} onChange={e => setActiveLog({...activeLog, painScore: parseInt(e.target.value)})} className="w-full bg-transparent font-black text-xl text-red-500 outline-none"/>
                </div>
             </div>
             <button onClick={saveLogEdit} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
               <Save size={18}/> Commit Validation
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
