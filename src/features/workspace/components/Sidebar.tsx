import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useAuthStore } from '../../../stores/auth.store';
import { Plus, Book, Trash2, LogOut, Network, X, User as UserIcon, Settings, Edit2, Check, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const SidebarHeader: React.FC<{ onToggle: () => void }> = ({ onToggle }) => (
  <div className="pt-12 pb-10 px-8 flex items-center justify-center border-b border-white/[0.02] relative">
    <div className="flex flex-col items-center group cursor-default">
      <h2 className="text-2xl font-black tracking-[0.25em] leading-none bg-gradient-to-br from-white via-indigo-300 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm transition-all duration-500 group-hover:tracking-[0.3em] text-center">
        ÓRION
      </h2>
      <div className="flex items-center gap-3 mt-3">
        <div className="h-[1px] w-3 bg-indigo-500/30" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">
          Intellectual Lab
        </span>
        <div className="h-[1px] w-3 bg-indigo-500/30" />
      </div>
    </div>
    <button 
      onClick={onToggle}
      className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 text-slate-500 hover:text-white lg:hidden transition-all duration-300 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 active:scale-95"
    >
      <X size={18} />
    </button>
  </div>
);

const SidebarNavItem: React.FC<{ 
  to: string; 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean;
}> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={clsx(
      "relative flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-500 group overflow-hidden border border-transparent",
      isActive 
        ? "bg-indigo-600/[0.08] text-white border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
        : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 hover:border-white/[0.05]"
    )}
  >
    {isActive && (
      <>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
        <div className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500/10 blur-2xl rounded-full" />
      </>
    )}
    <div className={clsx(
      "transition-all duration-500 flex items-center justify-center",
      isActive ? "text-indigo-400 scale-110" : "text-slate-500 group-hover:text-indigo-400 group-hover:scale-110"
    )}>
      {icon}
    </div>
    <span className="tracking-tight">{label}</span>
  </Link>
);

export const Sidebar: React.FC = () => {
  const { ideas, activeIdeaId, setActiveIdeaId, createIdea, updateIdea, deleteIdea, isSidebarOpen, toggleSidebar } = useWorkspaceStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [imgError, setImgError] = React.useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Reset image error when user changes
  React.useEffect(() => {
    setImgError(false);
  }, [user?.photoUrl]);

  const handleNewIdea = async () => {
    await createIdea('Ideia Sem Título');
    if (window.innerWidth < 1024) toggleSidebar(false);
  };

  const handleSelectIdea = (id: string) => {
    setActiveIdeaId(id);
    if (window.innerWidth < 1024) toggleSidebar(false);
  };

  const startEditing = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const saveTitle = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingId && editTitle.trim()) {
      updateIdea(editingId, { title: editTitle.trim() });
      setEditingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden transition-all duration-500"
          onClick={() => toggleSidebar(false)}
        />
      )}

      <div className={clsx(
        "fixed inset-y-0 left-0 w-80 bg-[#030303] border-r border-white/[0.03] flex flex-col z-50 transition-all duration-700 ease-in-out lg:relative lg:translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarHeader onToggle={() => toggleSidebar(false)} />

        <nav className="flex-1 overflow-y-auto px-5 py-4 space-y-10 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Navegação Principal</span>
              <div className="flex-1 h-[1px] bg-white/[0.03]" />
            </div>
            <div className="space-y-1.5">
              <SidebarNavItem 
                to="/dashboard" 
                icon={<LayoutDashboard size={18} />} 
                label="Painel de Controle" 
                isActive={location.pathname === '/dashboard'} 
              />
              <SidebarNavItem 
                to="/lab" 
                icon={<Book size={18} />} 
                label="Laboratório de Ideias" 
                isActive={location.pathname === '/lab'} 
              />
              <SidebarNavItem 
                to="/grafo" 
                icon={<Network size={18} />} 
                label="Mapa Intelectual" 
                isActive={location.pathname === '/grafo'} 
              />
              <SidebarNavItem 
                to="/perfil" 
                icon={<UserIcon size={18} />} 
                label="Configurações de Perfil" 
                isActive={location.pathname === '/perfil'} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Estudos Recentes</span>
                <div className="flex-1 h-[1px] bg-white/[0.03]" />
              </div>
              <button 
                onClick={handleNewIdea}
                className="ml-3 p-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl transition-all duration-300 group shadow-lg shadow-indigo-500/5 active:scale-90"
                title="Nova Ideia"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
            <div className="space-y-2">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className={clsx(
                    "group relative flex flex-col px-5 py-4 rounded-2xl text-[13px] cursor-pointer transition-all duration-500 border border-transparent",
                    activeIdeaId === idea.id 
                      ? "bg-white/[0.04] border-white/[0.05] text-white shadow-xl shadow-black/20" 
                      : "text-slate-500 hover:bg-white/[0.02] hover:text-slate-300 hover:border-white/[0.02]"
                  )}
                  onClick={() => handleSelectIdea(idea.id)}
                >
                  {activeIdeaId === idea.id && (
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                  )}
                  
                  {editingId === idea.id ? (
                    <form onSubmit={saveTitle} className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        className="flex-1 bg-black border border-indigo-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={() => saveTitle()}
                        onKeyDown={e => e.key === 'Escape' && cancelEditing()}
                      />
                      <button type="submit" className="text-emerald-400 hover:text-emerald-300 p-1.5 transition-colors">
                        <Check size={16} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate font-bold tracking-tight pr-4 text-[13px]">{idea.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={(e) => startEditing(e, idea.id, idea.title)}
                            className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteIdea(idea.id);
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            {new Date(idea.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <div className="w-[1px] h-2 bg-white/[0.05]" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                          {idea.blocks.length} Blocos
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {ideas.length === 0 && (
                <div className="px-5 py-10 text-center border border-dashed border-white/[0.03] rounded-3xl bg-white/[0.01]">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Laboratório Vazio</p>
                  <button 
                    onClick={handleNewIdea}
                    className="mt-4 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest transition-colors"
                  >
                    Iniciar Primeira Ideia
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-white/[0.03] bg-gradient-to-b from-transparent to-black/40">
          <div className="flex flex-col gap-5">
            <Link 
              to="/perfil"
              className="flex items-center gap-4 p-3.5 group hover:bg-white/[0.03] rounded-2xl transition-all duration-500 border border-transparent hover:border-white/[0.05] shadow-sm hover:shadow-xl"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-black group-hover:ring-indigo-500/50 transition-all duration-500 shadow-2xl">
                  {user?.photoUrl && !imgError ? (
                    <img 
                      src={user.photoUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <UserIcon size={24} className="text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#030303] rounded-full shadow-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-black text-white truncate tracking-tight group-hover:text-indigo-300 transition-colors">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-[0.15em] mt-1 opacity-70 group-hover:opacity-100 transition-all">{user?.email}</p>
              </div>
            </Link>
            
            <button
              onClick={logout}
              className="flex items-center justify-center gap-3 w-full py-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-red-400 bg-white/[0.02] hover:bg-red-400/10 border border-white/[0.03] hover:border-red-400/20 rounded-2xl transition-all duration-500 group active:scale-95"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform duration-500" />
              Sair do Sistema
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
