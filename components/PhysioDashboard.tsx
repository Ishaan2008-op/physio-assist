import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line } from 'recharts';
import { Activity, AlertTriangle, BrainCircuit, Sparkles, Video, Save, X, Menu, LogOut, Mic, UserPlus, Play, Target, TrendingUp, BadgeCheck, Mail, Send } from 'lucide-react';
import { Patient, DailyLog } from '../types';
import { analyzePatientProgress } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface PhysioDashboardProps {
  patients: Patient[];
  onBack: () => void;
  currentPhysio?: { name: string; id: string };
  onPatientUpdate: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
}

export const PhysioDashboard: React.FC<PhysioDashboardProps> = ({ patients, onBack, currentPhysio, onPatientUpdate, onAddPatient }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePatient, setActivePatient] = useState<Patient>(patients[0]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    const p = patients.find(p => p.id === selectedPatientId) || patients[0];
    setActivePatient(p);
    setAnalysis(null);
    setEditingLog(null);
  }, [selectedPatientId, patients]);

  const chartData = activePatient.logs.map((log, index) => ({
    date: log.date.split('-').slice(1).join('/'),
    rom: log.maxRom,
    pain: log.painScore,
    benchmark: activePatient.benchmarkRom[Math.min(index, activePatient.benchmarkRom.length - 1)] || 0
  }));

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzePatientProgress(activePatient);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("AI service temporarily unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveLog = () => {
      if (!editingLog) return;
      const updatedLogs = activePatient.logs.map(log => log.id === editingLog.id ? editingLog : log);
      const updatedPatient = { ...activePatient, logs: updatedLogs };
      onPatientUpdate(updatedPatient);
      setEditingLog(null);
  };

  const physioInitials = currentPhysio?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || "MD";

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                    <Activity size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">PhysioAI</h2>
            </div>
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                <UserPlus size={18} /> New Case
            </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Directory</p>
            {patients.map(p => (
                <button
                    key={p.id}
                    onClick={() => { setSelectedPatientId(p.id); setIsSidebarOpen(false); }}
                    className={`w-full text-left p-4 transition-all duration-300 group flex items-center justify-between ${selectedPatientId === p.id ? 'sidebar-item-active' : 'hover:bg-slate-50 rounded-2xl'}`}
                >
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">{p.name}</span>
                        <span className={`text-[10px] truncate max-w-[140px] ${selectedPatientId === p.id ? 'text-white/70' : 'text-slate-400'}`}>{p.injury}</span>
                    </div>
                    {p.status === 'Behind' && <div className={`w-2 h-2 rounded-full ${selectedPatientId === p.id ? 'bg-white' : 'bg-red-500'} animate-pulse`} />}
                </button>
            ))}
        </nav>
        <div className="p-6 border-t border-slate-100">
            <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm">
                <LogOut size={18} /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content Dashboard */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-6">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl"><Menu /></button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activePatient.name}</h1>
                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Case Monitor Active</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-slate-800">{currentPhysio?.name || "Dr. Staff"}</p>
                    <p className="text-[10px] text-brand-600 font-black tracking-widest uppercase flex items-center justify-end gap-1">
                        <BadgeCheck size={10} /> Verified Portal
                    </p>
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl">{physioInitials}</div>
            </div>
        </header>

        <main className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Target size={24} /></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Peak ROM</p><p className="text-2xl font-black text-slate-900">{activePatient.logs[activePatient.logs.length-1]?.maxRom || 0}°</p></div>
                    </div>
                    <div className="glass-card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><TrendingUp size={24} /></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocol Sync</p><p className="text-2xl font-black text-slate-900">84%</p></div>
                    </div>
                    <div className="glass-card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Activity size={24} /></div>
                        <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pain Trend</p><p className="text-2xl font-black text-slate-900">Stabilizing</p></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Area Chart */}
                        <div className="glass-card p-8">
                            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2"><Activity className="text-brand-600" size={20} /> Clinical Trajectory</h3>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11} as any} />
                                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                        <Area type="monotone" dataKey="rom" stroke="#2563eb" strokeWidth={4} fillOpacity={0.1} fill="#2563eb" name="Actual ROM" />
                                        <Line type="monotone" dataKey="benchmark" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="8 8" dot={false} name="Benchmark" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="glass-card p-8 bg-gradient-to-br from-white to-brand-50/30 border-brand-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-3"><BrainCircuit className="text-brand-600" size={24} /><span className="ai-gradient-text">Gemini Intelligence Report</span></h3>
                                <button onClick={handleAIAnalysis} disabled={isAnalyzing} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-brand-700 flex items-center gap-2 transition-all">
                                    {isAnalyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><Sparkles size={16} /> Analyze</>}
                                </button>
                            </div>
                            {analysis ? (
                                <div className="prose prose-slate prose-sm max-w-none animate-in fade-in slide-in-from-top-2">
                                    <ReactMarkdown>{analysis}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm italic">Analysis required to generate clinical trajectory recommendations.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Session List */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Video size={20} className="text-slate-400" /> Evidence Logs</h3>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                                {activePatient.logs.slice().reverse().map(log => (
                                    <div key={log.id} onClick={() => setEditingLog(log)} className="group p-4 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-brand-100 hover:shadow-xl transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black text-slate-400">{log.date}</span>
                                            {log.videoUrl && <Play size={12} className="text-brand-600" />}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div><p className="text-lg font-black text-slate-900">{log.maxRom}°</p><p className="text-[10px] font-bold text-slate-400 uppercase">ROM</p></div>
                                            <div className="text-right"><p className="text-lg font-black text-slate-900">{log.painScore}/10</p><p className="text-[10px] font-bold text-slate-400 uppercase">Pain</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Action */}
                        <div className="glass-card p-6 bg-slate-900 text-white">
                            <h3 className="text-sm font-black mb-4 flex items-center gap-2"><Mail size={16} /> Patient Feedback</h3>
                            <textarea className="w-full h-24 bg-white/5 rounded-xl p-3 text-xs border border-white/10 outline-none focus:border-brand-400 transition-all resize-none mb-3" placeholder="Write instructions..."></textarea>
                            <button className="w-full py-3 bg-brand-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30">
                                Send Instruction <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>

      {/* Playback & Evidence Modal */}
      {editingLog && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
              <div className="glass-card bg-white w-full max-w-3xl p-8 animate-in zoom-in-95 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Evidence Review</h3>
                      <button onClick={() => setEditingLog(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                          <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video shadow-2xl">
                              {editingLog.videoUrl ? (
                                  <video className="w-full h-full object-cover" controls autoPlay src={editingLog.videoUrl} />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                      <Video size={40} className="mb-4 opacity-20" />
                                      <p className="text-sm font-bold">Metadata Only Log</p>
                                  </div>
                              )}
                              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live ROM: {editingLog.maxRom}°
                              </div>
                          </div>
                      </div>
                      <div className="space-y-6">
                          {editingLog.voiceNoteBase64 && (
                              <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100">
                                  <p className="text-xs font-black text-brand-600 uppercase mb-2 flex items-center gap-2"><Mic size={14} /> Narrative Transcription</p>
                                  <audio controls src={editingLog.voiceNoteBase64} className="w-full h-8 mb-4" />
                                  <p className="text-xs text-slate-600 italic leading-relaxed">"{editingLog.voiceAnalysis || 'Analysis pending transcription...'}"</p>
                              </div>
                          )}
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinician Validation (ROM)</label>
                              <input type="number" value={editingLog.maxRom} onChange={e => setEditingLog({...editingLog, maxRom: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800" />
                          </div>
                          <button onClick={handleSaveLog} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl flex items-center justify-center gap-2"><Save size={20} /> Commit to Record</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};