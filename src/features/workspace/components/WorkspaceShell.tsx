import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface WorkspaceShellProps {
  children: React.ReactNode;
}

const Background: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-950">
    {/* Sketch Image Layer */}
    <div className="absolute inset-0 opacity-30">
      <img 
        src="https://img.cdndsgni.com/preview/13293350.jpg"
        alt="Jesus Christ Sketch"
        className="w-full h-full object-cover grayscale brightness-150 contrast-125"
        referrerPolicy="no-referrer"
      />
    </div>
    
    {/* Simple overlay for contrast */}
    <div className="absolute inset-0 bg-slate-950/20" />
  </div>
);

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      <Background />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
};
