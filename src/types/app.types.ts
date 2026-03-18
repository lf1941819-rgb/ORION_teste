export type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  password?: string;
};

export type Session = {
  user: User;
  token: string;
};

export type BlockType = 'paragraph' | 'heading' | 'quote' | 'note' | 'scripture' | 'question';

export type Block = {
  id: string;
  type: BlockType;
  content: string;
  order: number;
};

export type PremiseType = 'base' | 'hidden' | 'antithesis' | 'descriptive' | 'normative' | 'causal' | 'assumption';

export type Premise = {
  id: string;
  text: string;
  type: PremiseType;
  sourceBlockId?: string;
  notes?: string;
};

export type ArgumentStrength = 'weak' | 'moderate' | 'strong';

export type Argument = {
  id: string;
  conclusion: string;
  premiseIds: string[];
  strength: ArgumentStrength;
  notes?: string;
};

export type AnalysisQuestion = {
  id: string;
  question: string;
  type: 'critical' | 'clarity' | 'evidence' | 'consistency';
  severity: 'low' | 'medium' | 'high';
};

export type Idea = {
  id: string;
  title: string;
  blocks: Block[];
  premises: Premise[];
  arguments: Argument[];
  analysis: AnalysisQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type AppState = {
  ideas: Idea[];
  activeIdeaId: string | null;
};
