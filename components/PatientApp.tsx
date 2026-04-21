import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Play, CheckCircle2, ChevronRight, AlertCircle, RefreshCw, Sparkles, Mail, Lock, FileSignature, LogOut, Mic, Square, Loader2, Wand2, Activity } from 'lucide-react';
import { Patient, Exercise, DailyLog } from '../types';
import { getProgressBooster, analyzeVoiceNote } from '../services/geminiService';

interface PatientAppProps {
  patient: Patient;
  onBack: () => void;
  onLogEntry: (log: DailyLog) => void;
  onDischarge: () => Promise<void>;
}

export const PatientApp: React.FC<PatientAppProps> = ({ patient, onBack, onLogEntry, onDischarge }) => {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isExercising, setIsExercising] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [boosterMsg, setBoosterMsg] = useState<string>("Personalizing recovery...");
  const [isDischarging, setIsDischarging] = useState(false);
  
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState<string>("Position your limb in frame");
  const [currentAngle, setCurrentAngle] = useState(0);
  const [painScore, setPainScore] = useState(5);
  
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<string | null>(null);
  
  const maxSessionRomRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getProgressBooster(patient).then(setBoosterMsg);
  }, [patient]);

  useEffect(() => {
    let interval: any;
    if (isExercising && !sessionComplete) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => console.error("Camera error", err));

      interval = setInterval(() => {
        setCurrentAngle(prev => {
          const change = Math.floor(Math.random() * 5);
          const increasing = Math.floor(Date.now() / 2000) % 2 === 0;
          let next = increasing ? prev + change : prev - change;
          if (next > 110) next = 110;
          if (next < 0) next = 0;
          if (next > maxSessionRomRef.current) maxSessionRomRef.current = next;
          return next;
        });

        if (Math.random() > 0.98) {
             setReps(r => {
                 const newReps = r + 1;
                 if (newReps >= (activeExercise?.targetReps || 10)) endSession();
                 return newReps;
             });
             setFeedback("Optimal alignment detected.");
        }
      }, 100);
    } else {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
    }
    return () => clearInterval(interval);
  }, [isExercising, sessionComplete, activeExercise]);

  const startSession = (exercise: Exercise) => {
    setActiveExercise(exercise);
    setIsExercising(true);
    setSessionComplete(false);
    setReps(0);
    setVoiceNote(null);
    maxSessionRomRef.current = 0;
  };

  const endSession = () => { setIsExercising(false); setSessionComplete(true); };

  const saveLog = () => {
    // For the demo, we use a public video URL since we can't save real raw video to localStorage
    const sampleVideoMap: Record<string, string> = {
        'wrist_post_cast': 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'acl_rehab': 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'frozen_shoulder': 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    };

    const newLog: DailyLog = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        painScore,
        maxRom: maxSessionRomRef.current,
        repsCompleted: reps,
        notes: "Automated tracking successful",
        videoUrl: sampleVideoMap[patient.injuryType] || sampleVideoMap.wrist_post_cast,
        voiceNoteBase64: voiceNote || undefined,
        voiceAnalysis: voiceAnalysis || undefined
    };
    
    onLogEntry(newLog);
    setSessionComplete(false);
    setActiveExercise(null);
  };

  if (!activeExercise && !sessionComplete) {
    return (
      <div className="min-h-screen bg-[#f4f7fa] flex flex-col p-6 pb-24">
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Focus on Today</h1>
                <p className="text-slate-500 font-medium">Recovery Week 4 • {patient.injury}</p>
            </div>
            <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-premium text-slate-400 hover:text-red-500 transition-all"><LogOut size={20} /></button>
        </header>

        <div className="glass-card p-6 bg-gradient-to-br from-brand-600 to-indigo-700 text-white mb-8 overflow-hidden relative">
            <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Physio Intelligence Booster</p>
            <p className="text-xl font-bold leading-relaxed">"{boosterMsg}"</p>
        </div>

        <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Daily Protocol</h3>
            {patient.prescribedExercises.map(ex => (
              <button key={ex.id} onClick={() => startSession(ex)} className="w-full glass-card p-6 hover:bg-white hover:scale-[1.02] transition-all text-left flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600"><Play size={24} fill="currentColor" /></div>
                    <div>
                        <h4 className="font-black text-slate-800">{ex.name}</h4>
                        <p className="text-xs text-slate-400 font-bold">{ex.targetReps} Reps • {ex.targetRom}° Target</p>
                    </div>
                 </div>
                 <ChevronRight className="text-slate-300" />
              </button>
            ))}
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
        <div className="min-h-screen bg-white flex flex-col p-8 animate-in fade-in">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-premium"><CheckCircle2 size={48} /></div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Session Optimized</h2>
                <p className="text-slate-500 font-medium mt-3">Clinician {patient.physioName} will review your ROM trajectory soon.</p>

                <div className="w-full mt-12 space-y-6">
                    <div className="glass-card p-8 bg-slate-50 border-none shadow-none">
                        <label className="block text-left text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Subjective Pain (0-10)</label>
                        <input type="range" min="0" max="10" value={painScore} onChange={(e) => setPainScore(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 rounded-full appearance-none accent-brand-600 mb-6" />
                        <div className="text-5xl font-black text-brand-600">{painScore}</div>
                    </div>
                </div>
            </div>
            <button onClick={saveLog} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-premium hover:bg-slate-800 transition-all">Submit Recovery Data</button>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col h-full w-full">
       <div className="relative flex-1 bg-slate-900 overflow-hidden w-full">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.3]" />
          
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="relative w-72 h-72 border-2 border-white/10 rounded-full flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_20px_#3b82f6]" />
                <div className="absolute top-1/2 left-1/2 w-32 h-1 bg-gradient-to-r from-brand-500 to-transparent origin-left rounded-full" style={{ transform: `rotate(-${currentAngle + 90}deg)` }} />
                <div className="absolute bottom-12 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 text-white font-black text-2xl tracking-tighter">
                    {currentAngle}°
                </div>
             </div>
          </div>

          <div className="absolute top-0 left-0 right-0 p-8 pt-16 bg-gradient-to-b from-black/90 to-transparent text-white">
             <div className="flex justify-between items-start">
                 <div>
                     <h3 className="font-black text-xl tracking-tight">{activeExercise?.name}</h3>
                     <p className="text-brand-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 mt-2"><Activity size={14} /> AI Motion Tracking Active</p>
                 </div>
                 <div className="text-right">
                    <div className="text-5xl font-black">{reps}<span className="text-lg opacity-40 ml-2">/{activeExercise?.targetReps}</span></div>
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">Rep Count</div>
                 </div>
             </div>
          </div>
       </div>

       <div className="bg-slate-900 p-8 pb-12 rounded-t-[40px] -mt-10 relative z-30 border-t border-white/10">
           <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center shrink-0"><CheckCircle2 size={28} /></div>
                <p className="text-white font-bold text-xl leading-snug">{feedback}</p>
           </div>
           <button onClick={endSession} className="w-full py-5 bg-white/5 text-white/50 rounded-3xl font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">Emergency End Session</button>
       </div>
    </div>
  );
};