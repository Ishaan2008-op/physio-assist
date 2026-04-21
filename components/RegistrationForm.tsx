import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserPlus, ChevronRight, ArrowLeft } from 'lucide-react';

interface RegistrationFormProps {
  onRegister: (role: UserRole, details: any) => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    physioName: '',
    mode: 'Standard' as 'Standard' | 'MuscleDystrophy'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(UserRole.PATIENT, formData);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30" />
      
      <div className="max-w-md w-full relative z-10 glass-card p-10 bg-white/80">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-brand-600/20 transition-transform hover:scale-110">
              <UserPlus size={32} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Onboarding</h2>
           <p className="text-sm text-slate-500 font-medium mt-2 italic">Connect to clinical intelligence protocol.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Identification</label>
            <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium transition-all" placeholder="Legal Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Age</label>
                <input required type="number" className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium" placeholder="24" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
             <div className="space-y-1 text-center">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                <div className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-brand-600 font-black text-sm flex items-center justify-center">PATIENT</div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Electronic Mail</label>
            <input required type="email" className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium" placeholder="ishaan@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Clinician ID / Referral</label>
            <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium" placeholder="Dr. Shrikant Tiwari" value={formData.physioName} onChange={e => setFormData({...formData, physioName: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Recovery Protocol Mode</label>
            <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                <button type="button" onClick={() => setFormData({...formData, mode: 'Standard'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.mode === 'Standard' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'}`}>Standard Rehab</button>
                <button type="button" onClick={() => setFormData({...formData, mode: 'MuscleDystrophy'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.mode === 'MuscleDystrophy' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>MD Support Mode</button>
            </div>
            {formData.mode === 'MuscleDystrophy' && (
                <p className="text-[9px] text-indigo-500 font-bold px-2 mt-2 italic">Optimized for condition-specific safely & scaffold-inspired tracking.</p>
            )}
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-3xl transition-all shadow-xl flex items-center justify-center gap-2 group">
                Begin Protocol <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button type="button" onClick={onCancel} className="w-full mt-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-colors">
                <ArrowLeft size={12} /> Return Home
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" /> HIPAA Secure Encryption
        </div>
      </div>
    </div>
  );
};