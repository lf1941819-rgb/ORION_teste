import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';

export const GraphLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    { label: 'Idea', color: 'bg-indigo-500' },
    { label: 'Premise', color: 'bg-slate-400' },
    { label: 'Argument', color: 'bg-emerald-500' },
    { label: 'Conclusion', color: 'bg-blue-500' },
    { label: 'Objection', color: 'bg-rose-500' },
    { label: 'Counter', color: 'bg-orange-500' },
  ];

  return (
    <div className="absolute bottom-24 left-10 z-50">
      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
              <Info size={14} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Map Legend</span>
          </div>
          {isOpen ? <ChevronDown size={14} className="text-slate-600" /> : <ChevronUp size={14} className="text-slate-600" />}
        </button>

        {isOpen && (
          <div className="p-3 pt-0 grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full ${item.color} shadow-[0_0_5px_rgba(255,255,255,0.1)]`} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
