import React from 'react';
import { Plus, Network, FileText, Download, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../../stores/workspace.store';

export const QuickActionsPanel: React.FC = () => {
  const navigate = useNavigate();
  const { ideas, setActiveIdeaId, createIdea, setPrintModalOpen } = useWorkspaceStore();

  const handleNewStudy = async () => {
    const newIdea = await createIdea('Novo Estudo');
    if (newIdea) {
      navigate('/lab');
    }
  };

  const handleExportRecent = () => {
    if (ideas.length > 0) {
      const recent = [...ideas].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setActiveIdeaId(recent.id);
      setPrintModalOpen(true);
      navigate('/lab');
    }
  };

  const actions = [
    { label: 'Novo Estudo', icon: <Plus size={18} />, onClick: handleNewStudy, color: 'text-emerald-400' },
    { label: 'Ver Grafo', icon: <Network size={18} />, onClick: () => navigate('/grafo'), color: 'text-indigo-400' },
    { label: 'Exportar Estudo', icon: <Download size={18} />, onClick: handleExportRecent, color: 'text-amber-400' },
    { label: 'Pesquisar', icon: <Search size={18} />, onClick: () => navigate('/lab'), color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
