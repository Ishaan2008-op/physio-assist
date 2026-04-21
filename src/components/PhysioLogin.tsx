import React, { useState } from 'react';
import { VERIFIED_PHYSIOS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface PhysioLoginProps {
  onLogin: (physio: { name: string; id: string }) => void;
  onCancel: () => void;
}

export const PhysioLogin: React.FC<PhysioLoginProps> = ({ onLogin, onCancel }) => {
  const [physioId, setPhysioId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const physio = VERIFIED_PHYSIOS[physioId.toUpperCase()];
    if (physio) {
      onLogin(physio);
    } else {
      setError('Invalid ID. Please check and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white shadow-lg rounded-2xl p-8 border border-slate-200">
        <h2 className="text-3xl font-black text-slate-800 text-center mb-2">Clinician Portal</h2>
        <p className="text-center text-slate-500 mb-8">Access your patient dashboard.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="physioId" className="block text-sm font-bold text-slate-700 mb-2">Physio ID</label>
            <input
              id="physioId"
              type="text"
              value={physioId}
              onChange={(e) => {
                setPhysioId(e.target.value);
                setError('');
              }}
              placeholder="e.g., PT-88321"
              className={`w-full px-4 py-3 bg-slate-50 rounded-lg border ${error ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-brand-500`}
              required
            />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
          <div className="pt-4 flex flex-col gap-3">
             <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-center font-bold bg-brand-600 text-white hover:bg-brand-700 transition-all flex items-center justify-center gap-2 group"
            >
              Secure Login <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-4 rounded-lg text-center font-bold bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
         <div className="text-xs text-slate-400 mt-6 text-center">
            <p className="font-bold">Demo IDs:</p>
            <p>PT-88321 (Dr. Shrikant Tiwari)</p>
            <p>PT-99402 (Dr. Sarah Connor)</p>
        </div>
      </div>
    </div>
  );
};