import React from 'react';
import { GraphNodeData } from '../types';

interface GraphEdgeProps {
  source: GraphNodeData;
  target: GraphNodeData;
  isFocused: boolean;
  isSelected: boolean;
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({ source, target, isFocused, isSelected }) => {
  // Calculate path
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  
  // Control point for the curve
  const cx1 = source.x + dx * 0.5;
  const cy1 = source.y;
  const cx2 = source.x + dx * 0.5;
  const cy2 = target.y;

  const path = `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;

  return (
    <g className="pointer-events-none">
      <defs>
        <linearGradient id={`grad-${source.id}-${target.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="50%" stopColor={isSelected ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"} />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>

      {/* Glow effect for selected/focused edges */}
      {isSelected && (
        <path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth="4"
          className="opacity-5 blur-lg"
        />
      )}
      
      <path
        d={path}
        fill="none"
        stroke={`url(#grad-${source.id}-${target.id})`}
        strokeWidth={isSelected ? "1.5" : "1"}
        strokeDasharray={isSelected ? "none" : "3 6"}
        className={`transition-all duration-700 ${!isFocused ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Subtle dot at the target */}
      <circle
        cx={target.x}
        cy={target.y}
        r="2"
        fill={isSelected ? "white" : "rgba(255,255,255,0.1)"}
        className={`transition-all duration-700 ${!isFocused ? 'opacity-0' : 'opacity-100'}`}
      />
    </g>
  );
};
