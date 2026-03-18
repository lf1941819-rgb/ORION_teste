import React, { useState } from 'react';
import { X, Printer, ArrowLeft, FileDown, Loader2 } from 'lucide-react';
import { Idea } from '../../../types/app.types';
import { useAuthStore } from '../../../stores/auth.store';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';

interface PrintPreviewModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ idea, isOpen, onClose }) => {
  const user = useAuthStore(state => state.user);
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 20;
      let y = margin;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);

      const checkPageBreak = (needed: number) => {
        if (y + needed > 275) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Header
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('ÓRION LAB // Documento Analítico', margin, y);
      doc.text(new Date(idea.createdAt).toLocaleDateString('pt-BR'), pageWidth - margin, y, { align: 'right' });
      
      y += 15;
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      
      const titleLines = doc.splitTextToSize(idea.title, contentWidth);
      doc.text(titleLines, margin, y);
      y += (titleLines.length * 10) + 5;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(`Analista: ${user?.name || 'Não identificado'}`, margin, y);
      doc.text(`ID: ${idea.id.slice(0, 8)}`, pageWidth - margin, y, { align: 'right' });

      y += 10;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      // 1. Content Blocks
      idea.blocks.sort((a, b) => a.order - b.order).forEach(block => {
        checkPageBreak(20);
        doc.setTextColor(0, 0, 0);
        
        if (block.type === 'heading') {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          const lines = doc.splitTextToSize(block.content, contentWidth - 5);
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(1);
          doc.line(margin, y - 1, margin, y + (lines.length * 6));
          doc.text(lines, margin + 5, y + 5);
          y += (lines.length * 7) + 10;
        } else if (block.type === 'quote') {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(80, 80, 80);
          const lines = doc.splitTextToSize(block.content, contentWidth - 10);
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(margin + 2, y, margin + 2, y + (lines.length * 5));
          doc.text(lines, margin + 8, y + 4);
          y += (lines.length * 5) + 10;
        } else if (block.type === 'scripture') {
          doc.setFillColor(248, 250, 252);
          const lines = doc.splitTextToSize(block.content, contentWidth - 10);
          doc.rect(margin, y, contentWidth, (lines.length * 5) + 10, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          doc.text('REFERÊNCIA:', margin + 5, y + 5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(50, 50, 50);
          doc.text(lines, margin + 5, y + 10);
          y += (lines.length * 5) + 20;
        } else {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(block.content, contentWidth);
          doc.text(lines, margin, y);
          y += (lines.length * 6) + 5;
        }
      });

      // 2. Premises Section
      if (idea.premises.length > 0) {
        checkPageBreak(30);
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('ESTRUTURA DE PREMISSAS', margin, y);
        y += 10;
        
        idea.premises.forEach((premise, idx) => {
          checkPageBreak(15);
          doc.setFontSize(9);
          doc.setTextColor(180, 180, 180);
          doc.text(String(idx + 1).padStart(2, '0'), margin, y);
          
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'bold');
          doc.text(`[${premise.type.toUpperCase()}]`, margin + 8, y);
          
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(premise.text, contentWidth - 35);
          doc.text(lines, margin + 30, y);
          y += (lines.length * 5) + 5;
        });
      }

      // 3. Arguments Section
      if (idea.arguments.length > 0) {
        checkPageBreak(30);
        y += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('CONSTRUÇÃO ARGUMENTATIVA', margin, y);
        y += 10;

        idea.arguments.forEach((arg, idx) => {
          checkPageBreak(40);
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(0.5);
          
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          const concLines = doc.splitTextToSize(arg.conclusion, contentWidth - 10);
          doc.text(concLines, margin + 5, y + 5);
          const blockHeight = (concLines.length * 7) + 20;
          doc.line(margin, y, margin, y + blockHeight);
          
          y += (concLines.length * 7) + 5;
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`Validação: ${arg.strength === 'strong' ? 'Forte' : arg.strength === 'moderate' ? 'Moderada' : 'Fraca'}`, margin + 5, y);
          y += 8;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Base de Sustentação:', margin + 5, y);
          y += 5;
          
          doc.setFont('helvetica', 'normal');
          arg.premiseIds.forEach(pid => {
            const p = idea.premises.find(pre => pre.id === pid);
            if (p) {
              const pLines = doc.splitTextToSize(`• ${p.text}`, contentWidth - 15);
              doc.text(pLines, margin + 10, y);
              y += (pLines.length * 5);
            }
          });
          y += 10;
        });
      }

      // 4. AI Analysis Section
      if (idea.analysis.length > 0) {
        checkPageBreak(30);
        y += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38); // red-600
        doc.text('ANÁLISE CRÍTICA (IA)', margin, y);
        y += 10;

        idea.analysis.forEach(q => {
          checkPageBreak(20);
          doc.setFillColor(254, 242, 242);
          const lines = doc.splitTextToSize(q.question, contentWidth - 10);
          doc.rect(margin, y, contentWidth, (lines.length * 5) + 12, 'F');
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(185, 28, 28);
          doc.text(`${q.type.toUpperCase()} // SEVERIDADE: ${q.severity.toUpperCase()}`, margin + 5, y + 5);
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.text(lines, margin + 5, y + 10);
          y += (lines.length * 5) + 18;
        });
      }

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(
          `ÓRION LAB // Documento Analítico // Página ${i} de ${pageCount}`,
          pageWidth / 2,
          285,
          { align: 'center' }
        );
      }

      doc.save(`${idea.title.toLowerCase().replace(/\s+/g, '-')}-analise.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-stone-100 overflow-y-auto print:bg-white print:p-0 print:block print:static orion-print-container"
        >
          {/* Controls - Hidden on print */}
          <div className="sticky top-0 z-[110] bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between print:hidden">
            <button 
              onClick={onClose}
              className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-semibold text-sm"
            >
              <div className="p-1.5 rounded-lg group-hover:bg-indigo-50 transition-colors">
                <ArrowLeft size={16} />
              </div>
              Voltar ao Estudo
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm font-bold text-sm disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FileDown size={18} />
                )}
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
              </button>

              <button 
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold text-sm active:scale-95"
              >
                <Printer size={18} />
                Imprimir
              </button>

              <div className="w-[1px] h-6 bg-slate-200 mx-1" />

              <button 
                type="button"
                onClick={onClose}
                className="p-2.5 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition-colors hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Document Container */}
          <div className="flex-1 py-12 px-4 sm:px-8 print:p-0 print:block orion-print-content">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[297mm] p-[20mm] sm:p-[25mm] text-slate-900 font-serif leading-relaxed relative"
            >
              
              {/* Header */}
              <header className="mb-12 border-b-2 border-slate-900 pb-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-slate-400">
                    ÓRION LAB // Documento Analítico
                  </div>
                  <div className="text-[10px] font-sans font-bold text-slate-400">
                    {new Date(idea.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-bold font-sans tracking-tight mb-4 leading-none text-black">
                  {idea.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm font-sans text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-widest text-[9px]">Analista:</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-widest text-[9px]">ID:</span>
                    <span className="font-mono text-[10px]">{idea.id.slice(0, 8)}</span>
                  </div>
                </div>
              </header>

              {/* Main Content Blocks */}
              <section className="mb-12">
                {idea.blocks.sort((a, b) => a.order - b.order).map((block) => {
                  switch (block.type) {
                    case 'heading':
                      return (
                        <h2 key={block.id} className="text-2xl font-sans font-bold mt-10 mb-4 text-black border-l-4 border-indigo-600 pl-4">
                          {block.content}
                        </h2>
                      );
                    case 'quote':
                      return (
                        <blockquote key={block.id} className="my-8 pl-6 border-l-2 border-slate-200 italic text-slate-700 text-lg leading-relaxed">
                          {block.content}
                        </blockquote>
                      );
                    case 'scripture':
                      return (
                        <div key={block.id} className="my-6 p-6 bg-slate-50 border border-slate-100 rounded-sm font-sans text-sm leading-relaxed text-slate-800">
                          <span className="font-black text-indigo-600 mr-2 uppercase tracking-widest text-[9px]">Referência:</span>
                          {block.content}
                        </div>
                      );
                    case 'question':
                      return (
                        <div key={block.id} className="my-6 p-4 border-2 border-red-100 rounded-lg bg-red-50/30">
                          <div className="text-[9px] font-sans font-black uppercase tracking-widest text-red-500 mb-1">Questão de Estudo</div>
                          <p className="font-sans font-bold text-red-900">{block.content}</p>
                        </div>
                      );
                    case 'note':
                      return (
                        <div key={block.id} className="my-4 text-sm text-slate-500 font-sans italic">
                          {block.content}
                        </div>
                      );
                    default:
                      return (
                        <p key={block.id} className="mb-6 text-justify">
                          {block.content}
                        </p>
                      );
                  }
                })}
              </section>

              {/* Premises Section */}
              {idea.premises.length > 0 && (
                <section className="mb-12 break-inside-avoid">
                  <h3 className="text-xs font-sans font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 flex items-center gap-4">
                    Estrutura de Premissas
                    <div className="flex-1 h-[1px] bg-indigo-100" />
                  </h3>
                  <div className="space-y-4">
                    {idea.premises.map((premise, idx) => (
                      <div key={premise.id} className="flex gap-4 items-start">
                        <span className="font-sans font-bold text-slate-300 text-sm mt-1">{String(idx + 1).padStart(2, '0')}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-sans font-black uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                              {premise.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800">{premise.text}</p>
                          {premise.notes && (
                            <p className="text-xs text-slate-400 mt-1 italic font-sans">{premise.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Arguments Section */}
              {idea.arguments.length > 0 && (
                <section className="mb-12">
                  <h3 className="text-xs font-sans font-black uppercase tracking-[0.3em] text-indigo-600 mb-8 flex items-center gap-4">
                    Construção Argumentativa
                    <div className="flex-1 h-[1px] bg-indigo-100" />
                  </h3>
                  <div className="space-y-12">
                    {idea.arguments.map((arg, idx) => (
                      <div key={arg.id} className="relative pl-8 break-inside-avoid">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-full opacity-20" />
                        
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                              {idx + 1}
                            </div>
                            <div className="text-[9px] font-sans font-black uppercase tracking-widest text-slate-400">
                              Argumento Analítico
                            </div>
                          </div>
                          <h4 className="text-2xl font-sans font-bold text-black leading-tight mb-4">
                            {arg.conclusion}
                          </h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-sans font-bold text-slate-500 uppercase">Validação:</span>
                              <span className={`text-[9px] font-sans font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                arg.strength === 'strong' ? 'bg-emerald-100 text-emerald-700' :
                                arg.strength === 'moderate' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {arg.strength === 'strong' ? 'Forte' : arg.strength === 'moderate' ? 'Moderada' : 'Fraca'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="text-[9px] font-sans font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">Base de Sustentação (Premissas)</div>
                          <ul className="space-y-3">
                            {arg.premiseIds.map(pid => {
                              const p = idea.premises.find(pre => pre.id === pid);
                              return (
                                <li key={pid} className="text-[15px] flex gap-4 items-start text-slate-700 leading-snug">
                                  <span className="text-indigo-600 font-bold mt-0.5">›</span>
                                  <span>{p?.text}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {arg.notes && (
                          <div className="mt-6 p-4 bg-slate-50 border-l-2 border-slate-200 italic text-[13px] text-slate-600 font-sans">
                            <span className="font-bold not-italic mr-2 text-slate-400 uppercase text-[9px] tracking-widest">Nota do Analista:</span>
                            {arg.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Relational Summary */}
              <section className="mb-12 break-inside-avoid">
                <h3 className="text-xs font-sans font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 flex items-center gap-4">
                  Mapeamento Relacional
                  <div className="flex-1 h-[1px] bg-indigo-100" />
                </h3>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-sans font-black text-indigo-600">{idea.blocks.length}</div>
                      <div className="text-[8px] font-sans font-black uppercase tracking-widest text-slate-400">Blocos de Texto</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-sans font-black text-indigo-600">{idea.premises.length}</div>
                      <div className="text-[8px] font-sans font-black uppercase tracking-widest text-slate-400">Premissas Extraídas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-sans font-black text-indigo-600">{idea.arguments.length}</div>
                      <div className="text-[8px] font-sans font-black uppercase tracking-widest text-slate-400">Argumentos Construídos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-sans font-black text-indigo-600">{idea.analysis.length}</div>
                      <div className="text-[8px] font-sans font-black uppercase tracking-widest text-slate-400">Pontos de Análise</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Analysis Section */}
              {idea.analysis.length > 0 && (
                <section className="mb-12 break-inside-avoid">
                  <h3 className="text-xs font-sans font-black uppercase tracking-[0.3em] text-red-600 mb-6 flex items-center gap-4">
                    Análise Crítica (IA)
                    <div className="flex-1 h-[1px] bg-red-100" />
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {idea.analysis.map((q) => (
                      <div key={q.id} className="p-4 bg-red-50/30 border border-red-100 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] font-sans font-black uppercase tracking-widest px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                            {q.type}
                          </span>
                          <span className={`text-[8px] font-sans font-black uppercase tracking-widest ${
                            q.severity === 'high' ? 'text-red-600' :
                            q.severity === 'medium' ? 'text-amber-600' :
                            'text-slate-400'
                          }`}>
                            Severidade: {q.severity === 'high' ? 'Alta' : q.severity === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                        <p className="text-sm font-sans font-medium text-slate-800 leading-snug">{q.question}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Footer Info */}
              <footer className="mt-20 pt-8 border-t border-slate-100 text-center">
                <p className="text-[10px] font-sans font-bold text-slate-300 uppercase tracking-[0.2em]">
                  ÓRION LAB // Sistema de Análise Estrutural e Mapeamento Lógico
                </p>
                <p className="text-[9px] font-sans text-slate-300 mt-2">
                  Este documento foi gerado eletronicamente e representa o estado atual da pesquisa analítica.
                </p>
              </footer>
            </motion.div>
          </div>

          {/* Global Print Styles */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              .orion-print-container, .orion-print-container * {
                visibility: visible !important;
              }
              .orion-print-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                height: auto !important;
                overflow: visible !important;
              }
              .orion-print-content {
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
              }
              .print\\:hidden {
                display: none !important;
              }
              @page {
                margin: 15mm;
                size: A4;
              }
              h1, h2, h3, h4 {
                page-break-after: avoid;
              }
              .break-inside-avoid {
                page-break-inside: avoid;
              }
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
