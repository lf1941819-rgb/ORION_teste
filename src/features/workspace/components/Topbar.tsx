import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useAuthStore } from '../../../stores/auth.store';
import { User as UserIcon, Menu, FileText, Loader2, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const { ideas, activeIdeaId, toggleSidebar, setPrintModalOpen } = useWorkspaceStore();
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [imgError, setImgError] = React.useState(false);

  // Reset image error when user changes
  React.useEffect(() => {
    setImgError(false);
  }, [user?.photoUrl]);
  
  const activeIdea = ideas.find(i => i.id === activeIdeaId);

  const handleOpenPrintView = () => {
    if (!activeIdea) return;
    setPrintModalOpen(true);
  };

  return (
    <div className="h-14 border-b border-slate-800/30 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => toggleSidebar(true)}
          className="p-2 text-slate-400 hover:text-white lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>
        {activeIdea ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest hidden sm:inline">Laboratório</span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-slate-100 font-semibold truncate tracking-tight">{activeIdea.title}</span>
          </div>
        ) : (
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Selecione uma ideia</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeIdea && (
          <button
            onClick={handleOpenPrintView}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg border border-slate-800/30 hover:border-indigo-500 transition-all group mr-2"
            title="Visualizar Documento para Impressão"
          >
            <Printer size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Visualizar Impressão</span>
          </button>
        )}

        <div className="flex items-center gap-2 px-1.5 py-1 lg:px-2 lg:py-1 bg-slate-900/30 hover:bg-slate-800/50 rounded-full border border-slate-800/30 transition-all cursor-default group">
          <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-[13px] font-black text-white shrink-0 overflow-hidden ring-2 ring-slate-950 group-hover:ring-indigo-500/50 transition-all shadow-lg shadow-indigo-500/10">
            {user?.photoUrl && !imgError ? (
              <img 
                src={user.photoUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              user?.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-xs text-slate-300 font-bold pr-2 hidden sm:inline tracking-wide">{user?.name}</span>
        </div>
      </div>
    </div>
  );
};
