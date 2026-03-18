import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Idea, User, Block } from '../types/app.types';

/**
 * ÓRION LAB - PDF Export Engine v2.0
 * Robust layout management with pagination, footer reservation, and intelligent spacing.
 */

export const exportStudyToPdf = async (idea: Idea, user?: User) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // --- Layout Constants ---
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const MARGIN_TOP = 25;
  const MARGIN_BOTTOM = 30; // Reserved for footer
  const MARGIN_LEFT = 20;
  const MARGIN_RIGHT = 20;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const SAFE_ZONE_BOTTOM = PAGE_HEIGHT - MARGIN_BOTTOM;

  let cursorY = MARGIN_TOP;

  // --- Helper Functions ---

  const drawPageFooter = (pageNumber: number, totalPages: number) => {
    doc.setPage(pageNumber);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    
    const footerY = PAGE_HEIGHT - 15;
    doc.setDrawColor(240, 240, 240);
    doc.line(MARGIN_LEFT, footerY - 5, PAGE_WIDTH - MARGIN_RIGHT, footerY - 5);
    
    const dateStr = new Date().toLocaleString('pt-BR');
    doc.text(`ÓRION LAB // Documento Analítico - Gerado em ${dateStr}`, MARGIN_LEFT, footerY);
    doc.text(`Página ${pageNumber} de ${totalPages}`, PAGE_WIDTH - MARGIN_RIGHT - 20, footerY);
  };

  const drawPageHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('ÓRION LAB // SISTEMA DE ANÁLISE ESTRUTURAL', MARGIN_LEFT, 15);
  };

  const addNewPage = () => {
    doc.addPage();
    cursorY = MARGIN_TOP;
    drawPageHeader();
  };

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight > SAFE_ZONE_BOTTOM) {
      addNewPage();
      return true;
    }
    return false;
  };

  const renderText = (
    text: string, 
    fontSize: number, 
    fontStyle: string = 'normal', 
    color: [number, number, number] = [0, 0, 0], 
    marginBottom: number = 5,
    indent: number = 0
  ) => {
    const sanitizedText = text.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const effectiveWidth = CONTENT_WIDTH - indent;
    const lines = doc.splitTextToSize(sanitizedText, effectiveWidth);
    const lineHeight = fontSize * 0.3527;

    lines.forEach((line: string, index: number) => {
      ensureSpace(lineHeight + (index === lines.length - 1 ? marginBottom : 0));
      doc.text(line, MARGIN_LEFT + indent, cursorY + lineHeight);
      cursorY += lineHeight;
    });
    
    cursorY += marginBottom;
  };

  const renderSectionTitle = (title: string) => {
    // Section titles should have "keep with next" logic
    // We estimate the title height + some content height
    const titleHeight = 15;
    ensureSpace(titleHeight + 20); // Ensure at least 20mm of content follows
    
    cursorY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(title.toUpperCase(), MARGIN_LEFT, cursorY);
    
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, cursorY + 2, MARGIN_LEFT + 20, cursorY + 2);
    
    cursorY += 12;
  };

  const renderDivider = () => {
    ensureSpace(10);
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_LEFT, cursorY + 5, PAGE_WIDTH - MARGIN_RIGHT, cursorY + 5);
    cursorY += 10;
  };

  // --- Argument Specific Renderers ---

  const translateStrength = (strength: string) => {
    const map: Record<string, string> = {
      'weak': 'Fraca',
      'moderate': 'Moderada',
      'strong': 'Forte'
    };
    return map[strength.toLowerCase()] || strength;
  };

  const measureArgumentBlock = (arg: any, idea: Idea) => {
    let height = 0;
    // Header (Argumento X)
    height += 8;
    // Conclusion
    const conclusionLines = doc.splitTextToSize(arg.conclusion, CONTENT_WIDTH - 10);
    height += conclusionLines.length * 11 * 0.3527 + 6;
    // Strength
    height += 8;
    // Premises
    if (arg.premiseIds && arg.premiseIds.length > 0) {
      height += 6; // Label
      arg.premiseIds.forEach((pid: string) => {
        const p = idea.premises.find(pre => pre.id === pid);
        if (p) {
          const pLines = doc.splitTextToSize(`• ${p.text}`, CONTENT_WIDTH - 15);
          height += pLines.length * 9 * 0.3527 + 2;
        }
      });
    }
    // Notes
    if (arg.notes) {
      const noteLines = doc.splitTextToSize(`Notas Analíticas: ${arg.notes}`, CONTENT_WIDTH - 15);
      height += noteLines.length * 9 * 0.3527 + 4;
    }
    return height + 12;
  };

  const renderArgumentBlock = (arg: any, idx: number, idea: Idea) => {
    const blockHeight = measureArgumentBlock(arg, idea);
    
    // Keep together logic: if it fits on the page, keep it together.
    // If it's too big for a single page, at least ensure we don't start it at the very bottom.
    if (blockHeight < (SAFE_ZONE_BOTTOM - MARGIN_TOP)) {
      ensureSpace(blockHeight);
    } else {
      ensureSpace(40); 
    }

    const startY = cursorY;

    // 1. Header: Argumento X
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`ARGUMENTO ${idx + 1}`, MARGIN_LEFT + 5, cursorY + 5);
    cursorY += 8;

    // 2. Conclusion
    renderText(arg.conclusion, 11, 'bold', [0, 0, 0], 6, 5);

    // 3. Strength Metadata Line
    const strengthText = translateStrength(arg.strength);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(`Força argumentativa: `, MARGIN_LEFT + 5, cursorY + 4);
    const labelWidth = doc.getTextWidth(`Força argumentativa: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(strengthText, MARGIN_LEFT + 5 + labelWidth, cursorY + 4);
    cursorY += 10;

    // 4. Supporting Premises
    const premiseTexts = arg.premiseIds.map((pid: string) => {
      const p = idea.premises.find(pre => pre.id === pid);
      return p ? p.text : null;
    }).filter(Boolean);

    if (premiseTexts.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text('Baseado em:', MARGIN_LEFT + 5, cursorY + 3);
      cursorY += 6;

      premiseTexts.forEach((pt: string) => {
        renderText(`• ${pt}`, 9, 'normal', [80, 80, 80], 2, 8);
      });
      cursorY += 2;
    }

    // 5. Notes
    if (arg.notes) {
      renderText(`Notas Analíticas: ${arg.notes}`, 9, 'italic', [100, 100, 100], 4, 8);
    }

    // Draw a subtle left accent line for the whole block
    const endY = cursorY;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT + 1, startY + 2, MARGIN_LEFT + 1, endY - 4);

    cursorY += 4;
    // Subtle separator between arguments
    doc.setDrawColor(245, 245, 245);
    doc.line(MARGIN_LEFT, cursorY, PAGE_WIDTH - MARGIN_RIGHT, cursorY);
    cursorY += 10;
  };

  // --- Initial Page Setup ---
  drawPageHeader();

  // --- 1. Cover / Title Section ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  
  const titleLines = doc.splitTextToSize(idea.title.toUpperCase(), CONTENT_WIDTH);
  const titleHeight = titleLines.length * 24 * 0.3527;
  
  doc.text(titleLines, MARGIN_LEFT, cursorY + (24 * 0.3527));
  cursorY += titleHeight + 10;

  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  
  renderText(`Documento gerado em: ${dateStr}`, 9, 'normal', [120, 120, 120], 2);
  if (user) {
    renderText(`Analista Responsável: ${user.name}`, 9, 'normal', [120, 120, 120], 10);
  } else {
    cursorY += 8;
  }

  renderDivider();

  // --- 2. Executive Summary ---
  renderSectionTitle('Resumo Executivo');
  const firstParagraph = idea.blocks.find(b => b.type === 'paragraph')?.content || 'Este documento contém a análise estrutural e o mapeamento lógico do estudo em questão.';
  renderText(firstParagraph, 10, 'normal', [60, 60, 60], 10);

  renderDivider();

  // --- 3. Main Content (Blocks) ---
  renderSectionTitle('Desenvolvimento Analítico');

  idea.blocks.sort((a, b) => a.order - b.order).forEach((block: Block) => {
    if (!block.content.trim()) return;

    switch (block.type) {
      case 'heading':
        renderText(block.content, 14, 'bold', [0, 0, 0], 6);
        break;
      case 'quote':
        const quoteLines = doc.splitTextToSize(block.content, CONTENT_WIDTH - 15);
        const qLineHeight = 11 * 0.3527;
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(70, 70, 70);
        
        quoteLines.forEach((line: string) => {
          ensureSpace(qLineHeight + 2);
          
          // Draw vertical line for quote
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(0.5);
          doc.line(MARGIN_LEFT + 2, cursorY, MARGIN_LEFT + 2, cursorY + qLineHeight + 2);
          
          doc.text(line, MARGIN_LEFT + 8, cursorY + qLineHeight);
          cursorY += qLineHeight + 1;
        });
        cursorY += 5;
        break;
      case 'note':
        renderText(block.content, 10, 'normal', [100, 100, 100], 6, 5);
        break;
      case 'scripture':
        // Handle scripture with stable numbering
        const cleanScripture = block.content.replace(/[\u00B2\u00B3\u00B9\u2070-\u207F]/g, (match) => {
          // Fallback for superscripts if they cause issues, though NFC normalization helps
          return match; 
        });
        renderText(cleanScripture, 11, 'bold', [40, 40, 40], 8, 0);
        break;
      case 'question':
        renderText(`Questão de Estudo: ${block.content}`, 11, 'bold', [180, 0, 0], 6);
        break;
      default:
        renderText(block.content, 11, 'normal', [30, 30, 30], 6);
    }
  });

  // --- 4. Analytical Structure (Premises & Arguments) ---
  if (idea.premises.length > 0) {
    renderDivider();
    renderSectionTitle('Estrutura de Premissas');
    idea.premises.forEach((premise, idx) => {
      const typeLabel = premise.type.charAt(0).toUpperCase() + premise.type.slice(1);
      renderText(`${idx + 1}. [${typeLabel}] ${premise.text}`, 10, 'normal', [40, 40, 40], 4);
      if (premise.notes) {
        renderText(`Observação: ${premise.notes}`, 9, 'italic', [100, 100, 100], 4, 5);
      }
    });
  }

  if (idea.arguments.length > 0) {
    renderDivider();
    renderSectionTitle('Construção Argumentativa');
    idea.arguments.forEach((arg, idx) => {
      renderArgumentBlock(arg, idx, idea);
    });
  }

  // --- 5. AI Analysis ---
  if (idea.analysis.length > 0) {
    renderDivider();
    renderSectionTitle('Análise Crítica (IA)');
    idea.analysis.forEach((q) => {
      const typeLabel = q.type.charAt(0).toUpperCase() + q.type.slice(1);
      const severityLabel = q.severity === 'low' ? 'Baixa' : q.severity === 'medium' ? 'Média' : 'Alta';
      
      renderText(`[${typeLabel}] Severidade: ${severityLabel}`, 9, 'bold', [150, 0, 0], 2);
      renderText(q.question, 10, 'normal', [40, 40, 40], 5);
    });
  }

  // --- 6. Graph Summary ---
  renderDivider();
  renderSectionTitle('Mapeamento Relacional');
  renderText(`O estudo "${idea.title}" possui uma estrutura composta por ${idea.premises.length} premissas e ${idea.arguments.length} argumentos principais, formando um grafo de ${1 + idea.premises.length + idea.arguments.length} nós interconectados.`, 10, 'normal', [60, 60, 60], 6);

  // --- Finalize Footers ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    drawPageFooter(i, totalPages);
  }

  // --- Save Document ---
  const sanitizedTitle = idea.title.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
    
  doc.save(`orion-estudo-${sanitizedTitle}.pdf`);
};

export const generateStudyPdfBase64 = async (idea: Idea, user?: User): Promise<string> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // --- Layout Constants ---
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const MARGIN_TOP = 25;
  const MARGIN_BOTTOM = 30;
  const MARGIN_LEFT = 20;
  const MARGIN_RIGHT = 20;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const SAFE_ZONE_BOTTOM = PAGE_HEIGHT - MARGIN_BOTTOM;

  let cursorY = MARGIN_TOP;

  // --- Helper Functions (Duplicate of exportStudyToPdf for now, or refactor) ---
  const drawPageFooter = (pageNumber: number, totalPages: number) => {
    doc.setPage(pageNumber);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const footerY = PAGE_HEIGHT - 15;
    doc.setDrawColor(240, 240, 240);
    doc.line(MARGIN_LEFT, footerY - 5, PAGE_WIDTH - MARGIN_RIGHT, footerY - 5);
    const dateStr = new Date().toLocaleString('pt-BR');
    doc.text(`ÓRION LAB // Documento Analítico - Gerado em ${dateStr}`, MARGIN_LEFT, footerY);
    doc.text(`Página ${pageNumber} de ${totalPages}`, PAGE_WIDTH - MARGIN_RIGHT - 20, footerY);
  };

  const drawPageHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('ÓRION LAB // SISTEMA DE ANÁLISE ESTRUTURAL', MARGIN_LEFT, 15);
  };

  const addNewPage = () => {
    doc.addPage();
    cursorY = MARGIN_TOP;
    drawPageHeader();
  };

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight > SAFE_ZONE_BOTTOM) {
      addNewPage();
      return true;
    }
    return false;
  };

  const renderText = (text: string, fontSize: number, fontStyle: string = 'normal', color: [number, number, number] = [0, 0, 0], marginBottom: number = 5, indent: number = 0) => {
    const sanitizedText = text.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '');
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const effectiveWidth = CONTENT_WIDTH - indent;
    const lines = doc.splitTextToSize(sanitizedText, effectiveWidth);
    const lineHeight = fontSize * 0.3527;
    lines.forEach((line: string, index: number) => {
      ensureSpace(lineHeight + (index === lines.length - 1 ? marginBottom : 0));
      doc.text(line, MARGIN_LEFT + indent, cursorY + lineHeight);
      cursorY += lineHeight;
    });
    cursorY += marginBottom;
  };

  const renderSectionTitle = (title: string) => {
    const titleHeight = 15;
    ensureSpace(titleHeight + 20);
    cursorY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text(title.toUpperCase(), MARGIN_LEFT, cursorY);
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, cursorY + 2, MARGIN_LEFT + 20, cursorY + 2);
    cursorY += 12;
  };

  const renderDivider = () => {
    ensureSpace(10);
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_LEFT, cursorY + 5, PAGE_WIDTH - MARGIN_RIGHT, cursorY + 5);
    cursorY += 10;
  };

  const translateStrength = (strength: string) => {
    const map: Record<string, string> = { 'weak': 'Fraca', 'moderate': 'Moderada', 'strong': 'Forte' };
    return map[strength.toLowerCase()] || strength;
  };

  const measureArgumentBlock = (arg: any, idea: Idea) => {
    let height = 0;
    height += 8;
    const conclusionLines = doc.splitTextToSize(arg.conclusion, CONTENT_WIDTH - 10);
    height += conclusionLines.length * 11 * 0.3527 + 6;
    height += 8;
    if (arg.premiseIds && arg.premiseIds.length > 0) {
      height += 6;
      arg.premiseIds.forEach((pid: string) => {
        const p = idea.premises.find(pre => pre.id === pid);
        if (p) {
          const pLines = doc.splitTextToSize(`• ${p.text}`, CONTENT_WIDTH - 15);
          height += pLines.length * 9 * 0.3527 + 2;
        }
      });
    }
    if (arg.notes) {
      const noteLines = doc.splitTextToSize(`Notas Analíticas: ${arg.notes}`, CONTENT_WIDTH - 15);
      height += noteLines.length * 9 * 0.3527 + 4;
    }
    return height + 12;
  };

  const renderArgumentBlock = (arg: any, idx: number, idea: Idea) => {
    const blockHeight = measureArgumentBlock(arg, idea);
    if (blockHeight < (SAFE_ZONE_BOTTOM - MARGIN_TOP)) { ensureSpace(blockHeight); } else { ensureSpace(40); }
    const startY = cursorY;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`ARGUMENTO ${idx + 1}`, MARGIN_LEFT + 5, cursorY + 5);
    cursorY += 8;
    renderText(arg.conclusion, 11, 'bold', [0, 0, 0], 6, 5);
    const strengthText = translateStrength(arg.strength);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(`Força argumentativa: `, MARGIN_LEFT + 5, cursorY + 4);
    const labelWidth = doc.getTextWidth(`Força argumentativa: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(strengthText, MARGIN_LEFT + 5 + labelWidth, cursorY + 4);
    cursorY += 10;
    const premiseTexts = arg.premiseIds.map((pid: string) => {
      const p = idea.premises.find(pre => pre.id === pid);
      return p ? p.text : null;
    }).filter(Boolean);
    if (premiseTexts.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text('Baseado em:', MARGIN_LEFT + 5, cursorY + 3);
      cursorY += 6;
      premiseTexts.forEach((pt: string) => { renderText(`• ${pt}`, 9, 'normal', [80, 80, 80], 2, 8); });
      cursorY += 2;
    }
    if (arg.notes) { renderText(`Notas Analíticas: ${arg.notes}`, 9, 'italic', [100, 100, 100], 4, 8); }
    const endY = cursorY;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT + 1, startY + 2, MARGIN_LEFT + 1, endY - 4);
    cursorY += 4;
    doc.setDrawColor(245, 245, 245);
    doc.line(MARGIN_LEFT, cursorY, PAGE_WIDTH - MARGIN_RIGHT, cursorY);
    cursorY += 10;
  };

  // --- Start Rendering ---
  drawPageHeader();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  const titleLines = doc.splitTextToSize(idea.title.toUpperCase(), CONTENT_WIDTH);
  const titleHeight = titleLines.length * 24 * 0.3527;
  doc.text(titleLines, MARGIN_LEFT, cursorY + (24 * 0.3527));
  cursorY += titleHeight + 10;
  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  renderText(`Documento gerado em: ${dateStr}`, 9, 'normal', [120, 120, 120], 2);
  if (user) { renderText(`Analista Responsável: ${user.name}`, 9, 'normal', [120, 120, 120], 10); } else { cursorY += 8; }
  renderDivider();
  renderSectionTitle('Resumo Executivo');
  const firstParagraph = idea.blocks.find(b => b.type === 'paragraph')?.content || 'Análise estrutural ÓRION.';
  renderText(firstParagraph, 10, 'normal', [60, 60, 60], 10);
  renderDivider();
  renderSectionTitle('Desenvolvimento Analítico');
  idea.blocks.sort((a, b) => a.order - b.order).forEach((block: Block) => {
    if (!block.content.trim()) return;
    switch (block.type) {
      case 'heading': renderText(block.content, 14, 'bold', [0, 0, 0], 6); break;
      case 'quote':
        const quoteLines = doc.splitTextToSize(block.content, CONTENT_WIDTH - 15);
        const qLineHeight = 11 * 0.3527;
        doc.setFont('helvetica', 'italic'); doc.setFontSize(11); doc.setTextColor(70, 70, 70);
        quoteLines.forEach((line: string) => {
          ensureSpace(qLineHeight + 2);
          doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.5);
          doc.line(MARGIN_LEFT + 2, cursorY, MARGIN_LEFT + 2, cursorY + qLineHeight + 2);
          doc.text(line, MARGIN_LEFT + 8, cursorY + qLineHeight);
          cursorY += qLineHeight + 1;
        });
        cursorY += 5; break;
      case 'note': renderText(block.content, 10, 'normal', [100, 100, 100], 6, 5); break;
      case 'scripture': renderText(block.content, 11, 'bold', [40, 40, 40], 8, 0); break;
      case 'question': renderText(`Questão de Estudo: ${block.content}`, 11, 'bold', [180, 0, 0], 6); break;
      default: renderText(block.content, 11, 'normal', [30, 30, 30], 6);
    }
  });
  if (idea.premises.length > 0) {
    renderDivider(); renderSectionTitle('Estrutura de Premissas');
    idea.premises.forEach((premise, idx) => {
      const typeLabel = premise.type.charAt(0).toUpperCase() + premise.type.slice(1);
      renderText(`${idx + 1}. [${typeLabel}] ${premise.text}`, 10, 'normal', [40, 40, 40], 4);
      if (premise.notes) { renderText(`Observação: ${premise.notes}`, 9, 'italic', [100, 100, 100], 4, 5); }
    });
  }
  if (idea.arguments.length > 0) {
    renderDivider(); renderSectionTitle('Construção Argumentativa');
    idea.arguments.forEach((arg, idx) => { renderArgumentBlock(arg, idx, idea); });
  }
  if (idea.analysis.length > 0) {
    renderDivider(); renderSectionTitle('Análise Crítica (IA)');
    idea.analysis.forEach((q) => {
      const typeLabel = q.type.charAt(0).toUpperCase() + q.type.slice(1);
      const severityLabel = q.severity === 'low' ? 'Baixa' : q.severity === 'medium' ? 'Média' : 'Alta';
      renderText(`[${typeLabel}] Severidade: ${severityLabel}`, 9, 'bold', [150, 0, 0], 2);
      renderText(q.question, 10, 'normal', [40, 40, 40], 5);
    });
  }
  renderDivider(); renderSectionTitle('Mapeamento Relacional');
  renderText(`Estrutura composta por ${idea.premises.length} premissas e ${idea.arguments.length} argumentos.`, 10, 'normal', [60, 60, 60], 6);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) { drawPageFooter(i, totalPages); }

  return doc.output('datauristring').split(',')[1];
};
