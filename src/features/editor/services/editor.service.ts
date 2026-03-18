import { Block, BlockType } from '../types/block.types';
import { generateId } from '../../../utils/id';

export const editorService = {
  createBlock: (type: BlockType = 'paragraph', content: string = '', order: number): Block => ({
    id: generateId(),
    type,
    content,
    order,
  }),
  
  reorderBlocks: (blocks: Block[]): Block[] => {
    return blocks.sort((a, b) => a.order - b.order).map((block, index) => ({
      ...block,
      order: index,
    }));
  },
};
