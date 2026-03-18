import React, { useState } from 'react';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useAuthStore } from '../../../stores/auth.store';
import { Plus, Book, Trash2, LogOut, Network, X, User as UserIcon, Settings, Edit2, Check, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const SidebarHeader: React.FC<{ onToggle: () => void }> = ({ onToggle }) => (
  <div className="pt-10 pb-8 px-8 flex items-center justify-between">
    <div className="flex flex-col">
      <h2 className="text-xl font-black tracking-[0.2em] leading-none bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
        ÓRION LAB
      </h2>
      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-2.5">
        Intellectual Lab
      </span>
    </div>
    <button 
      onClick={onToggle}
      className="p-2 text-slate-500 hover:text-white lg:hidden transition-colors rounded-full hover:bg-white/5"
    >
      <X size={20} />
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
      "relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-300 group overflow-hidden",
      isActive 
        ? "bg-indigo-600/10 text-indigo-400 shadow-sm shadow-indigo-500/5" 
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    )}
  >
    {isActive && (
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
    )}
    <div className={clsx(
      "transition-transform duration-300 group-hover:scale-110",
      isActive ? "text-indigo-400" : "text-slate-500"
    )}>
      {icon}
    </div>
    {label}
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => toggleSidebar(false)}
        />
      )}

      <div className={clsx(
        "fixed inset-y-0 left-0 w-72 bg-[#050505] border-r border-white/5 flex flex-col z-50 transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 shadow-2xl shadow-black/50",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarHeader onToggle={() => toggleSidebar(false)} />

        <nav className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar">
          <div>
            <div className="flex items-center justify-between mb-3 px-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Navegação</span>
            </div>
            <div className="space-y-1">
              <SidebarNavItem 
                to="/dashboard" 
                icon={<LayoutDashboard size={18} />} 
                label="Dashboard" 
                isActive={location.pathname === '/dashboard'} 
              />
              <SidebarNavItem 
                to="/lab" 
                icon={<Book size={18} />} 
                label="Laboratório" 
                isActive={location.pathname === '/lab'} 
              />
              <SidebarNavItem 
                to="/grafo" 
                icon={<Network size={18} />} 
                label="Visualização em Grafo" 
                isActive={location.pathname === '/grafo'} 
              />
              <SidebarNavItem 
                to="/perfil" 
                icon={<Settings size={18} />} 
                label="Meu Perfil" 
                isActive={location.pathname === '/perfil'} 
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 px-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Ideias Recentes</span>
              <button 
                onClick={handleNewIdea}
                className="p-1.5 hover:bg-indigo-600/20 rounded-lg text-slate-500 hover:text-indigo-400 transition-all group"
                title="Nova Ideia"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            <div className="space-y-1 px-2">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className={clsx(
                    "group relative flex flex-col px-4 py-3 rounded-xl text-[13px] cursor-pointer transition-all duration-300 border border-transparent",
                    activeIdeaId === idea.id 
                      ? "bg-white/5 border-white/5 text-white shadow-lg" 
                      : "text-slate-500 hover:bg-white/[0.02] hover:text-slate-300"
                  )}
                  onClick={() => handleSelectIdea(idea.id)}
                >
                  {activeIdeaId === idea.id && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  )}
                  
                  {editingId === idea.id ? (
                    <form onSubmit={saveTitle} className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        className="flex-1 bg-black border border-indigo-500/50 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={() => saveTitle()}
                        onKeyDown={e => e.key === 'Escape' && cancelEditing()}
                      />
                      <button type="submit" className="text-emerald-400 hover:text-emerald-300 p-1">
                        <Check size={14} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate font-medium tracking-tight pr-4">{idea.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={(e) => startEditing(e, idea.id, idea.title)}
                            className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteIdea(idea.id);
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                          {new Date(idea.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                          {idea.blocks.length} Blocos
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {ideas.length === 0 && (
                <div className="px-4 py-8 text-center border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Nenhuma ideia</p>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex flex-col gap-4">
            <Link 
              to="/perfil"
              className="flex items-center gap-3.5 p-3 group hover:bg-white/5 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/5"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-black group-hover:ring-indigo-500/30 transition-all shadow-lg shadow-indigo-500/10">
                {user?.photoUrl && !imgError ? (
                  <img 
                    src={user.photoUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <UserIcon size={22} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate tracking-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-widest mt-0.5">{user?.email}</p>
              </div>
            </Link>
            
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all duration-300 group"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              Sair do Sistema
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
