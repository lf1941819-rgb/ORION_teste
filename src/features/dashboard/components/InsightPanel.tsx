import React from 'react';
import { TrendingUp, Lightbulb, Quote, ArrowUpRight } from 'lucide-react';

export const InsightPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white tracking-tight">Estratégia & Insights</h3>
      
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-800 text-white shadow-2xl shadow-indigo-500/20 group">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
          <Quote size={60} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Lightbulb size={20} />
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Insight do Dia</p>
            <p className="text-lg font-serif italic leading-relaxed">
              "A clareza de pensamento precede a precisão da ação. No ÓRION, cada conexão é um passo rumo à verdade estrutural."
            </p>
          </div>
          
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors group/btn">
            Explorar Biblioteca
            <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Progresso Semanal</p>
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-1 h-24">
            {[40, 70, 45, 90, 65, 30, 50].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${i === 3 ? 'bg-indigo-500' : 'bg-slate-800'}`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[8px] font-bold text-slate-600">
                  {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-2 flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-white">12.4h</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Foco Total</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-emerald-400">+18%</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">vs. Ontem</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
