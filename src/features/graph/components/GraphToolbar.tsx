import React from 'react';
import { 
  Plus, 
  Search, 
  Maximize, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  EyeOff,
  LayoutGrid
} from 'lucide-react';

interface GraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onCenter: () => void;
  showSecondary: boolean;
  onToggleSecondary: () => void;
}

export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onCenter,
  showSecondary,
  onToggleSecondary
}) => {
  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-full shadow-2xl z-50">
      <div className="flex items-center gap-0.5 pr-1 border-r border-white/5">
        <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Add Node">
          <Plus size={16} />
        </button>
        <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Search">
          <Search size={16} />
        </button>
      </div>

      <div className="flex items-center gap-0.5 px-1 border-r border-white/5">
        <button onClick={onZoomIn} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button onClick={onZoomOut} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button onClick={onReset} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Reset View">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="flex items-center gap-0.5 px-1 border-r border-white/5">
        <button onClick={onCenter} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Center Graph">
          <Maximize size={16} />
        </button>
        <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Auto Layout">
          <LayoutGrid size={16} />
        </button>
      </div>

      <div className="flex items-center gap-0.5 pl-1">
        <button 
          onClick={onToggleSecondary}
          className={`p-2 rounded-full transition-all ${showSecondary ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          title={showSecondary ? "Hide Secondary Connections" : "Show Secondary Connections"}
        >
          {showSecondary ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    </div>
  );
};
