import { Idea, Premise, Argument } from '../../types/app.types';

export type NodeType = 'idea' | 'premise' | 'argument' | 'conclusion' | 'objection' | 'counterargument' | 'reference';

export interface GraphNodeData {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
  parentId?: string;
  originalData: Idea | Premise | Argument;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  type: 'support' | 'derivation' | 'opposition';
}
