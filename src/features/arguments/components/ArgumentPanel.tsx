import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { Argument, ArgumentStrength } from '../../../types/app.types';
import { generateId } from '../../../utils/id';
import { Plus, X, ChevronRight, Shield, AlertCircle, Zap, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { ScheduleModal } from './ScheduleModal';

export const ArgumentPanel: React.FC = () => {
  const { ideas, activeIdeaId, updateIdea } = useWorkspaceStore();
  const [isCreating, setIsCreating] = useState(false);
  const [conclusion, setConclusion] = useState('');
  const [selectedPremiseIds, setSelectedPremiseIds] = useState<string[]>([]);
  const [strength, setStrength] = useState<ArgumentStrength>('moderate');
  const [schedulingArg, setSchedulingArg] = useState<Argument | null>(null);

  const activeIdea = ideas.find(i => i.id === activeIdeaId);
  if (!activeIdea) return null;

  const handleCreate = async () => {
    if (!conclusion.trim() || selectedPremiseIds.length === 0) return;

    const newArgument: Argument = {
      id: generateId(),
      conclusion,
      premiseIds: selectedPremiseIds,
      strength,
    };

    await updateIdea(activeIdea.id, {
      arguments: [...activeIdea.arguments, newArgument]
    });

    setConclusion('');
    setSelectedPremiseIds([]);
    setIsCreating(false);
  };

  const togglePremise = (id: string) => {
    setSelectedPremiseIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    await updateIdea(activeIdea.id, {
      arguments: activeIdea.arguments.filter(a => a.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Argumentos</h3>
        <span className="text-[10px] font-mono text-slate-600">{activeIdea.arguments.length} no total</span>
      </div>

      {!isCreating ? (
        <button 
          onClick={() => setIsCreating(true)}
          className="w-full px-4 py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center gap-3 text-indigo-400 hover:bg-indigo-600/20 transition-all"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Construir novo argumento...</span>
        </button>
      ) : (
        <div className="bg-slate-900 border border-indigo-500/30 p-5 rounded-xl space-y-5 shadow-2xl shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Construtor de Argumentos</span>
            <button onClick={() => setIsCreating(false)} className="text-slate-600 hover:text-slate-400">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Conclusão</label>
            <textarea
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Qual é a afirmação final?"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 min-h-[60px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Selecione as Premissas de Suporte</label>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {activeIdea.premises.map(p => (
                <div 
                  key={p.id}
                  onClick={() => togglePremise(p.id)}
                  className={clsx(
                    "p-2 rounded-lg text-xs cursor-pointer border transition-all",
                    selectedPremiseIds.includes(p.id) 
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-200" 
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                  )}
                >
                  {p.text}
                </div>
              ))}
              {activeIdea.premises.length === 0 && (
                <p className="text-[10px] text-slate-600 italic">Nenhuma premissa disponível. Extraia-as primeiro.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(['weak', 'moderate', 'strong'] as ArgumentStrength[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStrength(s)}
                  className={clsx(
                    "px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter transition-all",
                    strength === s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-600 hover:bg-slate-700"
                  )}
                >
                  {s === 'weak' ? 'fraco' : s === 'moderate' ? 'moderado' : 'forte'}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreate}
              disabled={!conclusion.trim() || selectedPremiseIds.length === 0}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-lg transition-all"
            >
              Construir
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {activeIdea.arguments.map((arg) => (
          <div 
            key={arg.id}
            className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all"
          >
            <div className="p-4 border-b border-slate-800/50 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {arg.strength === 'strong' && <Shield size={14} className="text-emerald-400" />}
                {arg.strength === 'moderate' && <Zap size={14} className="text-indigo-400" />}
                {arg.strength === 'weak' && <AlertCircle size={14} className="text-amber-400" />}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conclusão</span>
              </div>
              <button 
                onClick={() => handleDelete(arg.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm font-semibold text-white leading-tight">{arg.conclusion}</p>
              
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Suportado por</span>
                <div className="space-y-1">
                  {arg.premiseIds.map(pid => {
                    const premise = activeIdea.premises.find(p => p.id === pid);
                    return (
                      <div key={pid} className="flex items-start gap-2 text-[11px] text-slate-400">
                        <ChevronRight size={12} className="mt-0.5 text-indigo-500 shrink-0" />
                        <span className="line-clamp-2">{premise?.text || 'Premissa desconhecida'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/50 flex justify-end">
                <button 
                  onClick={() => setSchedulingArg(arg)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all hover:text-white"
                >
                  <Calendar size={12} />
                  Programar Palavra
                </button>
              </div>
            </div>
          </div>
        ))}
        {activeIdea.arguments.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-900 rounded-xl">
            <p className="text-xs text-slate-600 italic">Nenhum argumento construído ainda.</p>
          </div>
        )}
      </div>

      {schedulingArg && (
        <ScheduleModal 
          argument={schedulingArg} 
          onClose={() => setSchedulingArg(null)} 
        />
      )}
    </div>
  );
};
