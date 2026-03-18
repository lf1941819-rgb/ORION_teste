import React from 'react';
import { X, Printer, ArrowLeft } from 'lucide-react';
import { Idea } from '../../../types/app.types';
import { useAuthStore } from '../../../stores/auth.store';
import { motion, AnimatePresence } from 'motion/react';

interface PrintPreviewModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ idea, isOpen, onClose }) => {
  const user = useAuthStore(state => state.user);

  const handlePrint = () => {
    window.print();
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
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium"
            >
              <ArrowLeft size={18} />
              Voltar ao Estudo
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold text-sm"
              >
                <Printer size={18} />
                Imprimir / Exportar PDF
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="p-2.5 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition-colors"
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
