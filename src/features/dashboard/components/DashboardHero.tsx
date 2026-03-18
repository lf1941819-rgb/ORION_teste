import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Layout, GitBranch, Plus } from 'lucide-react';
import { Idea } from '../../../types/app.types';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../../stores/workspace.store';

interface DashboardHeroProps {
  userName: string;
  recentIdea?: Idea;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ userName, recentIdea }) => {
  const navigate = useNavigate();
  const { setActiveIdeaId, createIdea } = useWorkspaceStore();

  const handleContinue = () => {
    if (recentIdea) {
      setActiveIdeaId(recentIdea.id);
      navigate('/lab');
    }
  };

  const handleNewStudy = () => {
    createIdea('Novo Estudo');
    navigate('/lab');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 lg:p-12"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={12} />
            Centro de Comando ÓRION
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">
            Olá, {userName}. <br />
            <span className="text-slate-500">Seu laboratório está pronto.</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
            Continue explorando as fronteiras do conhecimento. Suas conexões lógicas e argumentos estruturados estão salvos e aguardando sua próxima análise.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button 
              onClick={handleNewStudy}
              className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 group"
            >
              <Plus size={18} />
              Novo Estudo
            </button>
            <button 
              onClick={() => navigate('/grafo')}
              className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <GitBranch size={18} className="text-indigo-400" />
              Ver Grafo
            </button>
          </div>
        </div>

        {recentIdea && (
          <div className="lg:w-80 shrink-0">
            <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estudo Recente</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
                {recentIdea.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Layout size={12} />
                  {recentIdea.blocks.length} blocos
                </div>
                <div className="w-1 h-1 bg-slate-800 rounded-full" />
                <div className="flex items-center gap-1">
                  <GitBranch size={12} />
                  {recentIdea.arguments.length} argumentos
                </div>
              </div>
              <button 
                onClick={handleContinue}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                Continuar Estudo
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
