
import React, { useState, useEffect } from 'react';
import { UserRole, Patient, DailyLog } from './types';
import { MOCK_PATIENTS, PROTOCOL_MAPPING } from './constants';
import { ClinicalDashboard } from './features/dashboard/ClinicalDashboard';
import { PatientApp } from './features/rehab/PatientApp';
import { RegistrationForm } from './components/RegistrationForm';
import { PhysioLogin } from './components/PhysioLogin';
import { Activity, ShieldCheck, ChevronRight, Stethoscope, User } from 'lucide-react';

const STORAGE_KEY = 'physio_modular_data_v2';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.NONE);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPhysioLoggingIn, setIsPhysioLoggingIn] = useState(false);
  const [currentPhysio, setCurrentPhysio] = useState<{name: string, id: string} | undefined>(undefined);
  
  const [patients, setPatients] = useState<Patient[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY);
          return saved ? JSON.parse(saved) : MOCK_PATIENTS;
      } catch (e) { return MOCK_PATIENTS; }
  });
  
  useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  const reset = () => {
    setCurrentRole(UserRole.NONE);
    setIsRegistering(false);
    setIsPhysioLoggingIn(false);
    setCurrentPhysio(undefined);
  };

  const handleRegistration = (role: UserRole, details: any) => {
    const existing = patients.find(p => p.email.toLowerCase() === details.email.toLowerCase());
    if (existing) {
        setCurrentRole(role);
    } else {
        const newP: Patient = {
            ...MOCK_PATIENTS[0],
            id: `p${Date.now()}`,
            name: details.name,
            email: details.email,
            mode: details.mode,
            injury: details.mode === 'MuscleDystrophy' ? 'Lower Limb Dystrophy' : MOCK_PATIENTS[0].injury,
            injuryType: details.mode === 'MuscleDystrophy' ? 'md_standard' : MOCK_PATIENTS[0].injuryType,
            prescribedExercises: details.mode === 'MuscleDystrophy' ? PROTOCOL_MAPPING.md_standard.exercises : MOCK_PATIENTS[0].prescribedExercises,
            logs: [],
            weeklyReports: []
        };
        setPatients(prev => [newP, ...prev]);
        setCurrentRole(role);
    }
    setIsRegistering(false);
  };

  if (isRegistering) return <RegistrationForm onRegister={handleRegistration} onCancel={reset} />;
  if (isPhysioLoggingIn) return <PhysioLogin onLogin={(p) => { setCurrentPhysio(p); setCurrentRole(UserRole.PHYSIO); setIsPhysioLoggingIn(false); }} onCancel={reset} />;

  if (currentRole === UserRole.PHYSIO) return (
      <ClinicalDashboard 
          patients={patients} 
          onSignOut={reset} 
          currentPhysio={currentPhysio} 
          onPatientUpdate={(updated) => setPatients(prev => prev.map(p => p.id === updated.id ? updated : p))}
      />
  );

  if (currentRole === UserRole.PATIENT) return (
      <PatientApp 
          patient={patients[0]} 
          onBack={reset} 
          onLogEntry={(log) => setPatients(prev => prev.map(p => p.id === patients[0].id ? {...p, logs: [...p.logs, log]} : p))} 
          onUpdatePatient={(updated) => setPatients(prev => prev.map(p => p.id === updated.id ? updated : p))}
      />
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40" />

      <div className="max-w-xl w-full relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-[10px] font-black text-brand-600 uppercase tracking-widest mb-10">
          <ShieldCheck size={14} /> Clinical Intelligence Gateway
        </div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">Physio<span className="text-brand-600">AI</span></h1>
        <p className="text-lg text-slate-500 font-medium mb-12">Next-generation recovery monitoring.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => setIsPhysioLoggingIn(true)} className="glass-card p-8 hover:bg-white hover:-translate-y-1 transition-all text-left group">
            <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-6"><Stethoscope size={28}/></div>
            <h3 className="font-bold text-xl text-slate-800">Clinicians</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed font-medium">Verify evidence and analyze trajectory.</p>
            <div className="flex items-center gap-1 text-brand-600 font-black text-[10px] uppercase tracking-widest mt-6 group-hover:gap-2 transition-all">Portal Access <ChevronRight size={14}/></div>
          </button>

          <button onClick={() => setIsRegistering(true)} className="glass-card p-8 hover:bg-white hover:-translate-y-1 transition-all text-left group border-brand-100">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-6"><User size={28}/></div>
            <h3 className="font-bold text-xl text-slate-800">Patients</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed font-medium">Track exercises with sensorless motion AI.</p>
            <div className="flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-6 group-hover:gap-2 transition-all">Begin Session <ChevronRight size={14}/></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
