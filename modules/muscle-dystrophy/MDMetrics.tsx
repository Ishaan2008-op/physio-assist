import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Zap, Activity, Info, AlertTriangle } from 'lucide-react';
import { DailyLog } from '../../types';

interface MDMetricsProps {
  logs: DailyLog[];
}

export const MDMetrics: React.FC<MDMetricsProps> = ({ logs }) => {
  const chartData = logs.slice(-7).map((log, i) => ({
    date: log.date.split('-').slice(1).join('/'),
    stability: log.stabilityScore || 0,
    fatigue: log.fatigueIndex || 0,
    degradation: log.movementDegradation || 0
  }));

  const latest = logs[logs.length - 1] || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stability Score</h4>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-slate-900">{latest.stabilityScore || 0}%</span>
            <span className="text-[10px] font-bold text-emerald-500 mb-1">Optimum Range</span>
          </div>
        </div>

        <div className="glass-card p-6 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fatigue Index</h4>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-slate-900">{latest.fatigueIndex || 0}/10</span>
            <span className={`text-[10px] font-bold mb-1 ${(latest.fatigueIndex || 0) > 7 ? 'text-red-500' : 'text-slate-400'}`}>
                {(latest.fatigueIndex || 0) > 7 ? 'High Risk' : 'Normal'}
            </span>
          </div>
        </div>

        <div className="glass-card p-6 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Degradation Rate</h4>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-slate-900">{latest.movementDegradation || 0}%</span>
            <span className="text-[10px] font-bold text-slate-400 mb-1">Session Baseline</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 bg-white h-72">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Stability vs. Fatigue Trends</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '12px' }}
              labelStyle={{ color: '#64748b', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="stability" stroke="#10b981" fillOpacity={1} fill="url(#colorStability)" strokeWidth={3} />
            <Area type="monotone" dataKey="fatigue" stroke="#f59e0b" fillOpacity={1} fill="url(#colorFatigue)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {(latest.fatigueIndex || 0) > 7 && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 animate-pulse">
            <AlertTriangle className="text-red-500 shrink-0" />
            <div>
                <p className="text-red-900 font-bold text-sm">Critical Alert: High Overexertion Detected</p>
                <p className="text-red-700 text-xs mt-1">The system has detected a rapid decline in stability. Please cease exercises and consult your physiotherapist.</p>
            </div>
        </div>
      )}
    </div>
  );
};
