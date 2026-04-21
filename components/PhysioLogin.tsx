import React, { useState } from 'react';
import { VERIFIED_PHYSIOS } from '../constants';
import { ShieldCheck, Stethoscope, AlertCircle, ArrowRight, Lock, Activity } from 'lucide-react';

interface PhysioLoginProps {
  onLogin: (physio: { name: string; id: string }) => void;
  onCancel: () => void;
}

export const PhysioLogin: React.FC<PhysioLoginProps> = ({ onLogin, onCancel }) => {
  const [licenseId, setLicenseId] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    setTimeout(() => {
        const physio = VERIFIED_PHYSIOS[licenseId];
        if (physio) {
            onLogin(physio);
        } else {
            setError('Registry Identification Failed.');
            setIsVerifying(false);
        }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/5 rounded-full blur-[120px]" />
      <div className="max-w-md w-full relative z-10 glass-card p-10">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center text-white shadow-2xl mb-6">
              <Stethoscope size={32} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinician Portal</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Secure Institutional Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Medical License ID</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <Lock size={18} />
                </div>
                <input 
                required
                type="text" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none font-mono text-slate-800 transition-all"
                placeholder="PT-88321"
                value={licenseId}
                onChange={e => setLicenseId(e.target.value)}
                />
            </div>
            <p className="text-[10px] text-brand-500 mt-2 text-right font-black italic">DEMO ACCESS: PT-88321</p>
          </div>

          {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
              </div>
          )}

          <div className="pt-2">
            <button 
                type="submit" 
                disabled={isVerifying}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait group"
            >
                {isVerifying ? 'Authenticating Registry...' : <>Verify & Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
            <button type="button" onClick={onCancel} className="w-full mt-4 text-slate-400 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest transition-colors">
                Cancel Authentication
            </button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-white" />
                <div className="w-6 h-6 rounded-full bg-slate-200 border border-white" />
                <div className="w-6 h-6 rounded-full bg-slate-300 border border-white" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Trust</span>
        </div>
      </div>
    </div>
  );
};