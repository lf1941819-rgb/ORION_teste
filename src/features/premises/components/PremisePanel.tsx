import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { Premise, PremiseType } from '../../../types/app.types';
import { generateId } from '../../../utils/id';
import { Plus, X, Tag, FileText, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export const PremiseCreator: React.FC = () => {
  const { ideas, activeIdeaId, updateIdea, extractAiPremises } = useWorkspaceStore();
  const [text, setText] = useState('');
  const [type, setType] = useState<PremiseType>('descriptive');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const activeIdea = ideas.find(i => i.id === activeIdeaId);
  if (!activeIdea) return null;

  const handleCreate = async () => {
    if (!text.trim()) return;

    const newPremise: Premise = {
      id: generateId(),
      text,
      type,
      notes: '',
    };

    await updateIdea(activeIdea.id, {
      premises: [...activeIdea.premises, newPremise]
    });

    setText('');
    setIsExpanded(false);
  };

  const handleAiExtract = async () => {
    if (!activeIdeaId) return;
    setIsExtracting(true);
    try {
      await extractAiPremises(activeIdeaId);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden transition-all">
        {!isExpanded ? (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full px-4 py-3 flex items-center gap-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Extrair nova premissa...</span>
          </button>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nova Premissa</span>
              <button onClick={() => setIsExpanded(false)} className="text-slate-600 hover:text-slate-400">
                <X size={16} />
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Qual é a afirmação central ou observação?"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px] resize-none"
            />

            <div className="flex flex-wrap items-center gap-2">
              {(['base', 'hidden', 'antithesis', 'descriptive', 'normative', 'causal', 'assumption'] as PremiseType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                    type === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                  )}
                >
                  {t === 'base' ? 'base' : t === 'hidden' ? 'oculta' : t === 'antithesis' ? 'antítese' : t === 'descriptive' ? 'descritiva' : t === 'normative' ? 'normativa' : t === 'causal' ? 'causal' : 'suposição'}
                </button>
              ))}
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/10"
            >
              Adicionar Premissa
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleAiExtract}
        disabled={isExtracting}
        className="w-full py-3 px-4 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 disabled:bg-slate-900 disabled:text-slate-600 text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
      >
        {isExtracting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        {isExtracting ? 'Extraindo...' : 'Extrair com IA (Base, Oculta, Antítese)'}
      </button>
    </div>
  );
};

export const PremisePanel: React.FC = () => {
  const { ideas, activeIdeaId, updateIdea } = useWorkspaceStore();
  const activeIdea = ideas.find(i => i.id === activeIdeaId);

  if (!activeIdea) return null;

  const handleDelete = async (id: string) => {
    await updateIdea(activeIdea.id, {
      premises: activeIdea.premises.filter(p => p.id !== id)
    });
  };

  const getPremiseLabel = (type: PremiseType) => {
    switch (type) {
      case 'base': return 'base';
      case 'hidden': return 'oculta';
      case 'antithesis': return 'antítese';
      case 'descriptive': return 'descritiva';
      case 'normative': return 'normativa';
      case 'causal': return 'causal';
      case 'assumption': return 'suposição';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Premissas</h3>
        <span className="text-[10px] font-mono text-slate-600">{activeIdea.premises.length} no total</span>
      </div>

      <PremiseCreator />

      <div className="space-y-3">
        {activeIdea.premises.map((premise) => (
          <div 
            key={premise.id}
            className="group bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <span className={clsx(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                premise.type === 'base' && "bg-indigo-500/10 text-indigo-400",
                premise.type === 'hidden' && "bg-pink-500/10 text-pink-400",
                premise.type === 'antithesis' && "bg-red-500/10 text-red-400",
                premise.type === 'descriptive' && "bg-blue-500/10 text-blue-400",
                premise.type === 'normative' && "bg-purple-500/10 text-purple-400",
                premise.type === 'causal' && "bg-emerald-500/10 text-emerald-400",
                premise.type === 'assumption' && "bg-amber-500/10 text-amber-400"
              )}>
                {getPremiseLabel(premise.type)}
              </span>
              <button 
                onClick={() => handleDelete(premise.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{premise.text}</p>
          </div>
        ))}
        {activeIdea.premises.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-900 rounded-xl">
            <p className="text-xs text-slate-600 italic">Nenhuma premissa extraída ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
