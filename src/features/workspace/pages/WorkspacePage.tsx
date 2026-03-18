import React, { useState } from 'react';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { BlockEditor } from '@/src/features/editor/components/BlockEditor';
import { PremisePanel } from '@/src/features/premises/components/PremisePanel';
import { ArgumentPanel } from '@/src/features/arguments/components/ArgumentPanel';
import { AnalysisPanel } from '@/src/features/analysis/components/AnalysisPanel';
import { useWorkspaceStore } from '@/src/stores/workspace.store';
import { clsx } from 'clsx';
import { Layout, FileText, GitBranch, Search, X } from 'lucide-react';
import { PrintPreviewModal } from '../components/PrintPreviewModal';

const WorkspacePage: React.FC = () => {
  const { activeIdeaId, ideas, isPrintModalOpen, setPrintModalOpen } = useWorkspaceStore();
  const [rightPanel, setRightPanel] = useState<'premises' | 'arguments' | 'analysis'>('premises');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const activeIdea = ideas.find(i => i.id === activeIdeaId);

  if (!activeIdeaId) {
    return (
      <WorkspaceShell>
        <div className="h-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-transparent flex items-center justify-center text-slate-700 mb-6 mx-auto">
              <Layout size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Bem-vindo ao ÓRION LAB</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Selecione uma ideia existente na barra lateral ou crie uma nova para iniciar seu processo de raciocínio estrutural.
            </p>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <div className="flex h-full overflow-hidden relative">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <BlockEditor />
          
          {/* Mobile Toggle for Right Panel */}
          <button 
            onClick={() => setIsRightPanelOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg lg:hidden z-30"
          >
            <Search size={24} />
          </button>
        </div>

        {/* Right Inspector Panel */}
        <div className={clsx(
          "fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-950/40 backdrop-blur-xl border-l border-slate-900 flex flex-col overflow-hidden z-40 transition-transform duration-300 lg:relative lg:translate-x-0",
          isRightPanelOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Panel Tabs */}
          <div className="flex border-b border-slate-900 items-center">
            <button 
              onClick={() => setIsRightPanelOpen(false)}
              className="p-4 text-slate-400 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
            <div className="flex flex-1">
              {[
                { id: 'premises', icon: <FileText size={14} />, label: 'Premissas' },
                { id: 'arguments', icon: <GitBranch size={14} />, label: 'Argumentos' },
                { id: 'analysis', icon: <Search size={14} />, label: 'Análise IA' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightPanel(tab.id as any)}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
                    rightPanel === tab.id 
                      ? "text-indigo-400 border-indigo-500 bg-indigo-500/5" 
                      : "text-slate-600 border-transparent hover:text-slate-400 hover:bg-slate-900/50"
                  )}
                >
                  <span className="hidden sm:inline">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {rightPanel === 'premises' && <PremisePanel />}
            {rightPanel === 'arguments' && <ArgumentPanel />}
            {rightPanel === 'analysis' && <AnalysisPanel />}
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {activeIdea && (
        <PrintPreviewModal 
          idea={activeIdea}
          isOpen={isPrintModalOpen}
          onClose={() => setPrintModalOpen(false)}
        />
      )}
    </WorkspaceShell>
  );
};

export default WorkspacePage;
