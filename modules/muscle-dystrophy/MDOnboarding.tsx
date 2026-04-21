import React, { useState } from 'react';
import { MDType, MobilityLevel, MDPatientData, Patient } from '../../types';
import { Shield, Info, ArrowRight, Activity, Zap, Heart } from 'lucide-react';

interface MDOnboardingProps {
  onComplete: (data: MDPatientData) => void;
  onCancel: () => void;
}

export const MDOnboarding: React.FC<MDOnboardingProps> = ({ onComplete, onCancel }) => {
  const [formData, setFormData] = useState<MDPatientData>({
    type: MDType.DUCHENNE,
    mobilityLevel: MobilityLevel.MEDIUM,
    affectedMuscleGroups: [],
    fatigueSensitivity: 5,
    useScaffoldSupport: true
  });

  const muscleGroups = ['Upper Arms', 'Shoulders', 'Thighs', 'Lower Legs', 'Wrist/Hands', 'Back/Core'];

  const toggleMuscleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      affectedMuscleGroups: prev.affectedMuscleGroups.includes(group)
        ? prev.affectedMuscleGroups.filter(g => g !== group)
        : [...prev.affectedMuscleGroups, group]
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col p-6 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <header className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Muscle Dystrophy Onboarding</h1>
          <p className="text-slate-500 font-medium">Configure your intelligent recovery scaffold.</p>
        </header>

        <div className="glass-card p-8 space-y-8">
          {/* Condition Type */}
          <section className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} /> Diagnostic Profile
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(MDType).map(t => (
                <button
                  key={t}
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${formData.type === t ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Mobility Level */}
          <section className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Mobility Baseline
            </label>
            <select
              value={formData.mobilityLevel}
              onChange={(e) => setFormData({ ...formData, mobilityLevel: e.target.value as MobilityLevel })}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 outline-brand-600"
            >
              {Object.values(MobilityLevel).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </section>

          {/* Muscle Groups */}
          <section className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Heart size={14} /> Focus Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(group => (
                <button
                  key={group}
                  onClick={() => toggleMuscleGroup(group)}
                  className={`px-4 py-2 rounded-full border-2 text-xs font-bold transition-all ${formData.affectedMuscleGroups.includes(group) ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {group}
                </button>
              ))}
            </div>
          </section>

          {/* Fatigue Sensitivity */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} /> Fatigue Sensitivity
                </label>
                <span className="text-2xl font-black text-brand-600">{formData.fatigueSensitivity}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.fatigueSensitivity}
              onChange={(e) => setFormData({ ...formData, fatigueSensitivity: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-brand-600"
            />
            <p className="text-[10px] text-slate-400 font-medium">Higher sensitivity triggers "Rest Alerts" earlier.</p>
          </section>

          {/* Scaffold Toggle */}
          <section className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                    <Shield size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">Virtual Scaffold Support</h4>
                    <p className="text-[10px] text-slate-500 font-medium">AI-driven assistance layer</p>
                </div>
            </div>
            <button
              onClick={() => setFormData({ ...formData, useScaffoldSupport: !formData.useScaffoldSupport })}
              className={`w-14 h-8 rounded-full transition-all relative ${formData.useScaffoldSupport ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.useScaffoldSupport ? 'left-7' : 'left-1'}`} />
            </button>
          </section>
        </div>

        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-5 bg-white text-slate-400 font-black rounded-3xl border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={() => onComplete(formData)} className="flex-[2] py-5 bg-brand-600 text-white font-black rounded-3xl shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
            Initialize MD Protocol <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
