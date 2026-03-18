import { create } from 'zustand';
import { Idea, Block, Premise, Argument, AnalysisQuestion } from '../types/app.types';
import { generateId } from '../utils/id';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { aiService } from '../services/ai.service';

interface WorkspaceState {
  ideas: Idea[];
  activeIdeaId: string | null;
  isSidebarOpen: boolean;
  isPrintModalOpen: boolean;
  setIdeas: (ideas: Idea[]) => void;
  setActiveIdeaId: (id: string | null) => void;
  toggleSidebar: (open?: boolean) => void;
  setPrintModalOpen: (open: boolean) => void;
  createIdea: (title: string) => Promise<Idea | null>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  runAiAnalysis: (id: string) => Promise<void>;
  extractAiPremises: (id: string) => Promise<void>;
  subscribeToIdeas: () => Unsubscribe | void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  ideas: [],
  activeIdeaId: null,
  isSidebarOpen: false,
  isPrintModalOpen: false,
  setIdeas: (ideas) => set({ ideas }),
  setActiveIdeaId: (id) => set({ activeIdeaId: id }),
  toggleSidebar: (open) => set((state) => ({ isSidebarOpen: open ?? !state.isSidebarOpen })),
  setPrintModalOpen: (open) => set({ isPrintModalOpen: open }),
  
  createIdea: async (title) => {
    const user = auth.currentUser;
    if (!user) return null;

    const newIdea: Idea = {
      id: generateId(),
      title: title === 'Untitled Idea' ? 'Ideia Sem Título' : title,
      blocks: [
        { id: generateId(), type: 'heading', content: title === 'Untitled Idea' ? 'Ideia Sem Título' : title, order: 0 },
        { id: generateId(), type: 'paragraph', content: '', order: 1 }
      ],
      premises: [],
      arguments: [],
      analysis: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add userId for security rules
    const ideaToSave = { ...newIdea, userId: user.uid };

    try {
      await setDoc(doc(db, 'ideas', newIdea.id), ideaToSave);
      set({ activeIdeaId: newIdea.id });
      return newIdea;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `ideas/${newIdea.id}`);
      return null;
    }
  },

  updateIdea: async (id, updates) => {
    const user = auth.currentUser;
    if (!user) return;

    const ideaRef = doc(db, 'ideas', id);
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(ideaRef, updatedData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ideas/${id}`);
    }
  },

  deleteIdea: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'ideas', id));
      if (get().activeIdeaId === id) {
        set({ activeIdeaId: null });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ideas/${id}`);
    }
  },

  runAiAnalysis: async (id) => {
    const idea = get().ideas.find(i => i.id === id);
    if (!idea) return;

    const analysis = await aiService.analyzeIdea(idea);
    await get().updateIdea(id, { analysis });
  },

  extractAiPremises: async (id) => {
    const idea = get().ideas.find(i => i.id === id);
    if (!idea) return;

    const newPremises = await aiService.extractPremises(idea);
    await get().updateIdea(id, { 
      premises: [...idea.premises, ...newPremises] 
    });
  },

  subscribeToIdeas: () => {
    const user = auth.currentUser;
    if (!user) {
      set({ ideas: [] });
      return;
    }

    const q = query(collection(db, 'ideas'), where('userId', '==', user.uid));
    
    return onSnapshot(q, (snapshot) => {
      const ideas = snapshot.docs.map(doc => doc.data() as Idea);
      set({ ideas });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ideas');
    });
  },
}));
