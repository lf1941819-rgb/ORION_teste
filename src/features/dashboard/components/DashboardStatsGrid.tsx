import React from 'react';
import { motion } from 'motion/react';
import { Book, Network, TrendingUp, Clock, ShieldCheck, Zap } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

interface DashboardStatsGridProps {
  stats: Stat[];
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="relative overflow-hidden p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/30 transition-all group"
        >
          {/* Subtle background glow */}
          <div className={`absolute top-0 right-0 w-16 h-16 ${stat.color.replace('/10', '/5')} blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity`} />
          
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            {stat.trend && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {stat.trend}
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
