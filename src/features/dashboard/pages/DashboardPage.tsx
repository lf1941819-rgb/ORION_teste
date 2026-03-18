import React from 'react';
import { WorkspaceShell } from '../../workspace/components/WorkspaceShell';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useAuthStore } from '../../../stores/auth.store';
import { Book, Network, TrendingUp, Clock, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

// New Components
import { DashboardHero } from '../components/DashboardHero';
import { DashboardStatsGrid } from '../components/DashboardStatsGrid';
import { RecentActivityList } from '../components/RecentActivityList';
import { InsightPanel } from '../components/InsightPanel';
import { QuickActionsPanel } from '../components/QuickActionsPanel';
import { LabSummaryPanel } from '../components/LabSummaryPanel';

const DashboardPage: React.FC = () => {
  const { ideas } = useWorkspaceStore();
  const { user } = useAuthStore();

  const recentIdea = [...ideas].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  const stats = [
    { 
      label: 'Total de Ideias', 
      value: ideas.length, 
      icon: <Book size={20} className="text-indigo-400" />, 
      color: 'bg-indigo-500/10',
      trend: '+2 este mês'
    },
    { 
      label: 'Conexões Lógicas', 
      value: ideas.reduce((acc, curr) => acc + curr.premises.length + curr.arguments.length, 0), 
      icon: <Network size={20} className="text-emerald-400" />, 
      color: 'bg-emerald-500/10',
      trend: 'Alta Densidade'
    },
    { 
      label: 'Análises Críticas', 
      value: ideas.reduce((acc, curr) => acc + curr.analysis.length, 0), 
      icon: <TrendingUp size={20} className="text-amber-400" />, 
      color: 'bg-amber-500/10',
      trend: 'IA Ativa'
    },
    { 
      label: 'Foco no Lab', 
      value: '12.4h', 
      icon: <Zap size={20} className="text-rose-400" />, 
      color: 'bg-rose-500/10',
      trend: '+18%'
    },
  ];

  return (
    <WorkspaceShell>
      <div className="h-full overflow-y-auto custom-scrollbar bg-slate-950">
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
          
          {/* Hero Section */}
          <DashboardHero 
            userName={user?.name.split(' ')[0] || 'Pesquisador'} 
            recentIdea={recentIdea}
          />

          {/* Stats Grid */}
          <DashboardStatsGrid stats={stats} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column - Main Activity */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Recent Activity */}
              <section>
                <RecentActivityList ideas={ideas.slice(0, 5)} />
              </section>

              {/* Lab Summary (Mobile/Tablet only, hidden on Large) */}
              <div className="lg:hidden">
                <LabSummaryPanel ideas={ideas} />
              </div>

              {/* Intellectual Progress Section */}
              <section className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck size={120} />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">Consistência do Laboratório</h3>
                  <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                    Seu laboratório mantém um índice de <span className="text-emerald-400 font-bold">85% de validade lógica</span>. 
                    A maioria dos seus argumentos recentes possui forte base de evidência. Continue revisando as premissas marcadas como "incertas" para elevar a precisão do seu grafo.
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Forte: 64%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Moderada: 28%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fraca: 8%</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Strategy & Actions */}
            <div className="lg:col-span-4 space-y-10">
              
              {/* Quick Actions */}
              <QuickActionsPanel />

              {/* Insight Panel */}
              <InsightPanel />

              {/* Lab Summary (Desktop only) */}
              <div className="hidden lg:block">
                <LabSummaryPanel ideas={ideas} />
              </div>

            </div>

          </div>

          {/* Footer Info */}
          <footer className="pt-10 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
              ÓRION LAB // Sistema de Comando Intelectual
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 cursor-pointer transition-colors">Documentação</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 cursor-pointer transition-colors">Suporte</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 cursor-pointer transition-colors">v2.4.0</span>
            </div>
          </footer>
        </div>
      </div>
    </WorkspaceShell>
  );
};

export default DashboardPage;
