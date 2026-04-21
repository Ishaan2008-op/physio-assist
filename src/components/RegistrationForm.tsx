import React, { useState } from 'react';
import { UserRole } from '../../types';
import { ChevronRight } from 'lucide-react';

interface RegistrationFormProps {
  onRegister: (role: UserRole, details: { name: string; email: string; mode: 'Standard' | 'MuscleDystrophy' }) => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'Standard' | 'MuscleDystrophy'>('Standard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onRegister(UserRole.PATIENT, { name, email, mode });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 border border-slate-200">
        <h2 className="text-3xl font-black text-slate-800 text-center mb-2">Patient Registration</h2>
        <p className="text-center text-slate-500 mb-8">Begin your recovery journey.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., john.doe@example.com"
              className="w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Condition Type</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'Standard' | 'MuscleDystrophy')}
              className="w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Standard">Standard Injury (e.g., Fracture, ACL)</option>
              <option value="MuscleDystrophy">Muscular Dystrophy</option>
            </select>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-4 rounded-lg text-center font-bold bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-center font-bold bg-brand-600 text-white hover:bg-brand-700 transition-all flex items-center justify-center gap-2 group"
            >
              Register & Begin <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
