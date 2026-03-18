import React, { useState } from 'react';
import { Block, BlockType } from '../types/block.types';
import { BlockItem } from './BlockItem';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { Plus, Type, Hash, Quote, HelpCircle, Info, Book } from 'lucide-react';
import { generateId } from '../../../utils/id';

export const BlockEditor: React.FC = () => {
  const { ideas, activeIdeaId, updateIdea } = useWorkspaceStore();
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const activeIdea = ideas.find(i => i.id === activeIdeaId);
  if (!activeIdea) return null;

  const handleUpdateBlock = async (blockId: string, content: string) => {
    const updatedBlocks = activeIdea.blocks.map(b => 
      b.id === blockId ? { ...b, content } : b
    );
    await updateIdea(activeIdea.id, { blocks: updatedBlocks });
  };

  const handleDeleteBlock = async (blockId: string) => {
    const updatedBlocks = activeIdea.blocks.filter(b => b.id !== blockId);
    await updateIdea(activeIdea.id, { blocks: updatedBlocks });
  };

  const handleChangeBlockType = async (blockId: string, type: BlockType) => {
    const updatedBlocks = activeIdea.blocks.map(b => 
      b.id === blockId ? { ...b, type } : b
    );
    await updateIdea(activeIdea.id, { blocks: updatedBlocks });
  };

  const handleAddBlock = async (type: BlockType = 'paragraph') => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      order: activeIdea.blocks.length
    };
    await updateIdea(activeIdea.id, { blocks: [...activeIdea.blocks, newBlock] });
    setActiveBlockId(newBlock.id);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-8">
      <div className="mb-8">
        <input
          type="text"
          value={activeIdea.title}
          onChange={(e) => updateIdea(activeIdea.id, { title: e.target.value })}
          className="w-full bg-transparent border-none outline-none text-5xl font-bold tracking-tighter text-white placeholder-slate-800"
          placeholder="Ideia Sem Título"
        />
      </div>

      <div className="space-y-1">
        {activeIdea.blocks
          .sort((a, b) => a.order - b.order)
          .map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              isActive={activeBlockId === block.id}
              onUpdate={(content) => handleUpdateBlock(block.id, content)}
              onDelete={() => handleDeleteBlock(block.id)}
              onSelect={() => setActiveBlockId(block.id)}
              onChangeType={(type) => handleChangeBlockType(block.id, type)}
            />
          ))}
      </div>

      <div className="mt-8 flex items-center gap-2 px-4 py-4 border-t border-slate-900">
        <button 
          onClick={() => handleAddBlock('paragraph')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-200 hover:bg-slate-900 transition-all"
        >
          <Plus size={14} />
          Adicionar Bloco
        </button>
        <div className="h-4 w-[1px] bg-slate-800 mx-2" />
        <div className="flex items-center gap-1">
          {[
            { type: 'paragraph', icon: <Type size={14} />, label: 'Texto' },
            { type: 'heading', icon: <Hash size={14} />, label: 'Título' },
            { type: 'quote', icon: <Quote size={14} />, label: 'Citação' },
            { type: 'question', icon: <HelpCircle size={14} />, label: 'Pergunta' },
            { type: 'note', icon: <Info size={14} />, label: 'Nota' },
            { type: 'scripture', icon: <Book size={14} />, label: 'Referência' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => handleAddBlock(item.type as BlockType)}
              className="p-2 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-slate-900 transition-all"
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
