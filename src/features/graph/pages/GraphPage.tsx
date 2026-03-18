import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { WorkspaceShell } from '../../workspace/components/WorkspaceShell';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { Network } from 'lucide-react';
import { GraphNode } from '../components/GraphNode';
import { GraphEdge } from '../components/GraphEdge';
import { GraphToolbar } from '../components/GraphToolbar';
import { GraphInspectorPanel } from '../components/GraphInspectorPanel';
import { GraphLegend } from '../components/GraphLegend';
import { GraphNodeData, GraphEdgeData } from '../types';

const GraphPage: React.FC = () => {
  const { ideas } = useWorkspaceStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [showSecondary, setShowSecondary] = useState(true);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate Nodes and Edges
  const { nodes, edges } = useMemo(() => {
    const allNodes: GraphNodeData[] = [];
    const allEdges: GraphEdgeData[] = [];
    
    ideas.forEach((idea, ideaIdx) => {
      const ideaX = 400 + ideaIdx * 800;
      const ideaY = 400;

      // Idea Node
      allNodes.push({
        id: idea.id,
        type: 'idea',
        label: idea.title,
        description: idea.blocks.find(b => b.type === 'paragraph')?.content || "Main intellectual document",
        x: ideaX,
        y: ideaY,
        originalData: idea,
      });

      // Premise Nodes
      idea.premises.forEach((premise, pIdx) => {
        const px = ideaX - 300 + (pIdx % 2) * 150;
        const py = ideaY + 250 + Math.floor(pIdx / 2) * 150;
        
        allNodes.push({
          id: premise.id,
          type: 'premise',
          label: premise.text,
          parentId: idea.id,
          x: px,
          y: py,
          originalData: premise,
        });

        allEdges.push({
          id: `edge-${idea.id}-${premise.id}`,
          source: idea.id,
          target: premise.id,
          type: 'support',
        });
      });

      // Argument Nodes
      idea.arguments.forEach((arg, aIdx) => {
        const ax = ideaX + 300 + (aIdx % 2) * 150;
        const ay = ideaY + 250 + Math.floor(aIdx / 2) * 150;

        allNodes.push({
          id: arg.id,
          type: 'argument',
          label: arg.conclusion,
          parentId: idea.id,
          x: ax,
          y: ay,
          originalData: arg,
        });

        allEdges.push({
          id: `edge-${idea.id}-${arg.id}`,
          source: idea.id,
          target: arg.id,
          type: 'derivation',
        });
      });
    });

    return { nodes: allNodes, edges: allEdges };
  }, [ideas]);

  const selectedNode = useMemo(() => 
    nodes.find(n => n.id === selectedNodeId) || null
  , [nodes, selectedNodeId]);

  // Focus Logic: Find connected nodes
  const focusedNodeIds = useMemo(() => {
    if (!selectedNodeId) return nodes.map(n => n.id);
    
    const connected = new Set<string>([selectedNodeId]);
    edges.forEach(edge => {
      if (edge.source === selectedNodeId) connected.add(edge.target);
      if (edge.target === selectedNodeId) connected.add(edge.source);
    });
    
    return Array.from(connected);
  }, [selectedNodeId, edges, nodes]);

  // Canvas Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = { 
        x: touch.clientX - transform.x, 
        y: touch.clientY - transform.y 
      };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setTransform(prev => ({
        ...prev,
        x: touch.clientX - dragStart.current.x,
        y: touch.clientY - dragStart.current.y,
      }));
    } else if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;
      
      const delta = dist / lastTouchDistance.current;
      lastTouchDistance.current = dist;
      
      setTransform(prev => {
        const newScale = Math.min(Math.max(prev.scale * delta, 0.2), 3);
        const actualDelta = newScale / prev.scale;
        
        return {
          scale: newScale,
          x: centerX - (centerX - prev.x) * actualDelta,
          y: centerY - (centerY - prev.y) * actualDelta,
        };
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistance.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    setTransform(prev => {
      const newScale = Math.min(Math.max(prev.scale * delta, 0.2), 3);
      const actualDelta = newScale / prev.scale;
      
      return {
        scale: newScale,
        x: mouseX - (mouseX - prev.x) * actualDelta,
        y: mouseY - (mouseY - prev.y) * actualDelta,
      };
    });
  };

  const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  const zoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.2) }));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });
  const centerGraph = () => {
    if (nodes.length === 0) return;
    const avgX = nodes.reduce((acc, n) => acc + n.x, 0) / nodes.length;
    const avgY = nodes.reduce((acc, n) => acc + n.y, 0) / nodes.length;
    const container = containerRef.current;
    if (!container) return;
    
    setTransform({
      x: container.clientWidth / 2 - avgX,
      y: container.clientHeight / 2 - avgY,
      scale: 1
    });
  };

  return (
    <WorkspaceShell>
      <div className="h-full relative overflow-hidden flex flex-col bg-slate-950">
        {/* Canvas Grid Background */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0),
              radial-gradient(circle at 50% 50%, rgba(79,70,229,0.05) 0%, transparent 70%)
            `,
            backgroundSize: `${60 * transform.scale}px ${60 * transform.scale}px, 100% 100%`,
            backgroundPosition: `${transform.x}px ${transform.y}px, 0 0`
          }}
        />

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-10 bg-gradient-to-b from-slate-950 via-slate-950/40 to-transparent z-40 pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5 pointer-events-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-500 shadow-2xl ring-1 ring-white/5">
                <Network size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-1.5">Reasoning Graph</h1>
                <div className="flex items-center gap-3">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black">Intellectual Laboratory v2.4</p>
                  <span className="w-1 h-1 rounded-full bg-slate-800" />
                  <p className="text-[9px] uppercase tracking-[0.3em] text-indigo-500/60 font-black">Live Engine</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 relative cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onWheel={handleWheel}
          onClick={() => setSelectedNodeId(null)}
        >
          <div 
            className="absolute inset-0 transition-transform duration-75 ease-out"
            style={{ 
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* SVG Layer for Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;
                
                return (
                  <GraphEdge
                    key={edge.id}
                    source={sourceNode}
                    target={targetNode}
                    isFocused={focusedNodeIds.includes(edge.source) || focusedNodeIds.includes(edge.target)}
                    isSelected={selectedNodeId === edge.source || selectedNodeId === edge.target}
                  />
                );
              })}
            </svg>

            {/* Nodes Layer */}
            {nodes.map(node => (
              <GraphNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                isFocused={focusedNodeIds.includes(node.id)}
                onClick={() => setSelectedNodeId(node.id)}
              />
            ))}

            {/* Empty State */}
            {ideas.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-10 shadow-2xl">
                    <Network size={48} className="text-slate-700 stroke-[1]" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Empty Laboratory</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    The reasoning engine is idle. Construct your first logical structure in the laboratory to begin high-fidelity visualization.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* UI Overlays */}
        <GraphToolbar 
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
          onCenter={centerGraph}
          showSecondary={showSecondary}
          onToggleSecondary={() => setShowSecondary(!showSecondary)}
        />
        
        <GraphLegend />
        
        <GraphInspectorPanel 
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
        />

        {/* Bottom Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-slate-950/40 backdrop-blur-md border-t border-white/5 z-40 pointer-events-none">
          <div className="flex items-center gap-8 pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Engine Status: Nominal</span>
            </div>
            <div className="flex items-center gap-4 hidden sm:flex">
              <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Nodes: {nodes.length}
              </div>
              <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Edges: {edges.length}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pointer-events-auto">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hidden sm:inline">ÓRION LAB</span>
            <span className="w-1 h-1 rounded-full bg-slate-800 hidden sm:inline" />
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Visual Reasoning Workspace</span>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
};

export default GraphPage;
