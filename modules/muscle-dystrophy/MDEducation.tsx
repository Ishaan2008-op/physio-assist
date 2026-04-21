import React from 'react';
import { BookOpen, Shield, Zap, Activity, Info } from 'lucide-react';

export const MDEducation: React.FC = () => {
  const sections = [
    {
      title: "What is Muscle Dystrophy?",
      content: "Muscular dystrophy refers to a group of genetic diseases that cause progressive weakness and loss of muscle mass. It occurs when mutations interfere with the production of proteins needed to form healthy muscle.",
      icon: <Info className="text-brand-600" />
    },
    {
      title: "The Importance of Assisted Movement",
      content: "Unlike traditional sports rehab, MD therapy focuses on maintaining functionality without overexertion. Assisted movement ensures muscle fibers remain active without triggering accelerated degeneration through fatigue.",
      icon: <Activity className="text-emerald-600" />
    },
    {
      title: "Scaffold-Inspired Therapy",
      content: "This application uses bio-inspired logic. Imagine a 'virtual scaffold' supporting your limb—our AI tracking acts as this scaffold, providing real-time feedback to prevent unsafe ranges of motion and fatigue-induced injury.",
      icon: <Shield className="text-indigo-600" />
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="header space-y-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Clinical Knowledge Hub</h3>
        <p className="text-slate-500 font-medium px-2">Understanding your recovery journey and the technology behind it.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section, idx) => (
          <div key={idx} className="glass-card p-8 bg-white border-none shadow-premium hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                {section.icon}
              </div>
              <h4 className="font-black text-slate-900 text-lg tracking-tight">{section.title}</h4>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-8 rounded-3xl text-white relative overflow-hidden">
        <Zap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
        <h4 className="font-black text-xl mb-4">Latest Research Reference</h4>
        <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
          Inspired by research from IIT Kanpur and ScienceDirect on Hall-effect myokinemetric sensing and bio-inspired artificial muscles.
        </p>
        <div className="flex gap-4">
            <a href="https://www.iitk.ac.in/new/bio-inspired-artificial-muscle-developed-at-smss-lab" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">IITK Lab</a>
            <a href="https://www.sciencedirect.com/science/article/abs/pii/S0924424722003478" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">ScienceDirect</a>
        </div>
      </div>
    </div>
  );
};
