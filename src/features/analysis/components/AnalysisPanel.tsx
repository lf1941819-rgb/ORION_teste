import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { AlertTriangle, HelpCircle, Lightbulb, Search, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export const AnalysisPanel: React.FC = () => {
  const { ideas, activeIdeaId, runAiAnalysis } = useWorkspaceStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const activeIdea = ideas.find(i => i.id === activeIdeaId);

  if (!activeIdea) return null;

  const handleRunAnalysis = async () => {
    if (!activeIdeaId) return;
    setIsAnalyzing(true);
    try {
      await runAiAnalysis(activeIdeaId);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasArguments = activeIdea.arguments.length > 0;
  const hasPremises = activeIdea.premises.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Análise Estrutural</h3>
        <Search size={14} className="text-slate-600" />
      </div>

      <div className="space-y-4">
        {/* AI Analysis Trigger */}
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          {isAnalyzing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {isAnalyzing ? 'Analisando...' : 'Executar Análise IA'}
        </button>

        {/* AI Results Section */}
        {activeIdea.analysis.length > 0 && (
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Insights da IA</span>
            </div>

            <div className="space-y-3">
              {activeIdea.analysis.map((item, i) => (
                <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className={clsx(
                      "text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded",
                      item.severity === 'high' ? "bg-red-500/10 text-red-400" :
                      item.severity === 'medium' ? "bg-amber-500/10 text-amber-400" :
                      "bg-blue-500/10 text-blue-400"
                    )}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">"{item.question}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Problemas Potenciais</span>
          </div>
          
          <ul className="space-y-2">
            {!hasPremises && (
              <li className="text-xs text-slate-400 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                Nenhuma premissa extraída. Argumentos carecem de suporte fundamental.
              </li>
            )}
            {!hasArguments && hasPremises && (
              <li className="text-xs text-slate-400 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                Existem premissas, mas nenhuma conclusão lógica foi estruturada.
              </li>
            )}
            {activeIdea.premises.filter(p => p.type === 'assumption').length > 2 && (
              <li className="text-xs text-slate-400 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                Alta densidade de suposições detectada. Verifique se podem ser apoiadas por evidências.
              </li>
            )}
            {hasArguments && (
              <li className="text-xs text-slate-400 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                Verifique circularidade: A conclusão reafirma uma premissa com palavras diferentes?
              </li>
            )}
          </ul>
        </div>

        {/* Inquiry Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <HelpCircle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Inquérito Crítico</span>
          </div>

          <div className="space-y-3">
            {[
              "Qual suposição oculta é necessária para que esta conclusão se sustente?",
              "Existe um salto causal que não é explicitamente apoiado por uma premissa?",
              "Como a antítese mais forte desafiaria esta estrutura?",
              "Algum termo está sendo usado de forma equívoca (em mais de um sentido)?"
            ].map((q, i) => (
              <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800/50 group hover:border-indigo-500/30 transition-all cursor-help">
                <p className="text-[11px] text-slate-300 leading-relaxed italic">"{q}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lightbulb size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Recomendações</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400">
              1. Mapeie a <span className="text-emerald-500 font-medium">cadeia causal</span> entre suas premissas primárias.
            </p>
            <p className="text-[11px] text-slate-400">
              2. Identifique <span className="text-emerald-500 font-medium">reivindicações normativas</span> e garanta que estejam fundamentadas em valores compartilhados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
