import React from 'react';
import { FileText, Clock, ArrowRight, Star, MoreVertical } from 'lucide-react';
import { Idea } from '../../../types/app.types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../../stores/workspace.store';

interface RecentActivityListProps {
  ideas: Idea[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ ideas }) => {
  const navigate = useNavigate();
  const { setActiveIdeaId } = useWorkspaceStore();

  const handleOpen = (id: string) => {
    setActiveIdeaId(id);
    navigate('/lab');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock size={20} className="text-indigo-400" />
          Atividade Recente
        </h3>
        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
          Ver Tudo
        </button>
      </div>

      <div className="space-y-3">
        {ideas.map((idea) => (
          <div 
            key={idea.id}
            onClick={() => handleOpen(idea.id)}
            className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/30 flex items-center justify-between group hover:bg-slate-900/60 hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{idea.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    {formatDistanceToNow(new Date(idea.updatedAt), { addSuffix: true, locale: ptBR })}
                  </span>
                  <div className="w-1 h-1 bg-slate-800 rounded-full" />
                  <span className="text-[10px] text-indigo-500/70 font-bold uppercase tracking-widest">
                    Estudo Estrutural
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <Star size={16} />
              </button>
              <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}

        {ideas.length === 0 && (
          <div className="p-12 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
            <FileText size={40} className="text-slate-800 mb-4" />
            <p className="text-slate-500 font-medium">Nenhum estudo iniciado ainda.</p>
            <button 
              onClick={() => navigate('/lab')}
              className="mt-4 text-indigo-400 font-bold text-sm hover:underline"
            >
              Começar primeiro estudo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
