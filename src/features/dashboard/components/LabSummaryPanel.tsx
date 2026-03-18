import React from 'react';
import { Database, GitBranch, MessageSquare, Activity } from 'lucide-react';
import { Idea } from '../../../types/app.types';

interface LabSummaryPanelProps {
  ideas: Idea[];
}

export const LabSummaryPanel: React.FC<LabSummaryPanelProps> = ({ ideas }) => {
  const totalPremises = ideas.reduce((acc, curr) => acc + curr.premises.length, 0);
  const totalArguments = ideas.reduce((acc, curr) => acc + curr.arguments.length, 0);
  const totalAnalysis = ideas.reduce((acc, curr) => acc + curr.analysis.length, 0);

  const stats = [
    { label: 'Premissas Extraídas', value: totalPremises, icon: <Database size={14} /> },
    { label: 'Argumentos Validados', value: totalArguments, icon: <GitBranch size={14} /> },
    { label: 'Pontos de Análise', value: totalAnalysis, icon: <MessageSquare size={14} /> },
    { label: 'Conexões de Grafo', value: totalPremises + totalArguments, icon: <Activity size={14} /> },
  ];

  return (
    <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Resumo Analítico</h3>
        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest">
          Live Status
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                {stat.label}
              </span>
            </div>
            <span className="text-sm font-black text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
          <span>Saúde do Laboratório</span>
          <span className="text-emerald-400">Excelente</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="w-[85%] h-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
        </div>
      </div>
    </div>
  );
};
