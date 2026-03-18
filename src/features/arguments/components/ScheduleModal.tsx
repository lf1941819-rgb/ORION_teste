import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, CheckCircle2, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Argument } from '../../../types/app.types';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { GoogleService } from '../../../services/google.service';
import { generateStudyPdfBase64 } from '../../../utils/pdf-export';
import { clsx } from 'clsx';

interface ScheduleModalProps {
  argument: Argument;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ argument, onClose }) => {
  const { ideas, activeIdeaId } = useWorkspaceStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ eventUrl?: string; driveUrl?: string } | null>(null);

  const activeIdea = ideas.find(i => i.id === activeIdeaId);

  // Form state
  const [title, setTitle] = useState(`Palavra Programada: ${activeIdea?.title || 'Estudo ÓRION'}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(60); // minutes

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { isAuthenticated } = await GoogleService.getStatus();
      setIsAuthenticated(isAuthenticated);
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await GoogleService.openAuthPopup();
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSchedule = async () => {
    if (!activeIdea) return;
    
    setIsScheduling(true);
    setError(null);
    setStatus('idle');

    try {
      // 1. Generate PDF
      const pdfBase64 = await generateStudyPdfBase64(activeIdea);
      const fileName = `ORION_ESTUDO_${activeIdea.title.replace(/\s+/g, '_').toUpperCase()}.pdf`;

      // 2. Prepare Event Data
      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      
      const description = `
📌 ESTUDO ÓRION LAB: ${activeIdea.title}

💡 ARGUMENTO SELECIONADO:
${argument.conclusion}

✅ PREMISSAS DE SUPORTE:
${argument.premiseIds.map(pid => {
  const p = activeIdea.premises.find(pre => pre.id === pid);
  return `• ${p?.text || 'Premissa'}`;
}).join('\n')}

📝 NOTAS:
${argument.notes || 'Sem notas adicionais.'}

📎 O PDF completo do estudo está anexado a este evento e salvo no seu Google Drive (Pasta ÓRION LAB).
      `.trim();

      const eventData = {
        title,
        description,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // 3. Call API
      const res = await GoogleService.scheduleEvent(eventData, pdfBase64, fileName);

      if (res.success) {
        setStatus('success');
        setResult({ eventUrl: res.eventUrl, driveUrl: res.driveUrl });
      } else {
        throw new Error(res.error || 'Falha ao agendar evento.');
      }
    } catch (err: any) {
      console.error('Scheduling error:', err);
      setError(err.message);
      setStatus('error');
    } finally {
      setIsScheduling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Programar Palavra</h3>
              <p className="text-xs text-slate-500">Google Calendar + Google Drive</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {!isAuthenticated ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-bold">Conectar Google Workspace</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Para agendar eventos e salvar PDFs, precisamos de permissão para acessar seu Google Agenda e Drive.
                </p>
              </div>
              <button 
                onClick={handleConnect}
                className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto"
              >
                Conectar com Google
              </button>
            </div>
          ) : status === 'success' ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-bold">Programação Concluída!</h4>
                <p className="text-sm text-slate-500">
                  O evento foi criado no seu Google Agenda e o PDF foi salvo no seu Drive.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a 
                  href={result?.eventUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Ver no Google Agenda
                  <ExternalLink size={14} />
                </a>
                <a 
                  href={result?.driveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-slate-900 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Ver PDF no Google Drive
                  <ExternalLink size={14} />
                </a>
              </div>
              <button 
                onClick={onClose}
                className="text-xs text-slate-600 hover:text-slate-400 underline"
              >
                Fechar janela
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Event Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Título do Evento</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horário</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input 
                        type="time" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duração (minutos)</label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1 hora e 30 min</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <FileText size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Argumento Selecionado</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 italic">"{argument.conclusion}"</p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && status !== 'success' && (
          <div className="p-6 border-t border-slate-900 bg-slate-900/30 flex items-center justify-between">
            <button 
              onClick={onClose}
              className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSchedule}
              disabled={isScheduling}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center gap-2"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Processando...
                </>
              ) : (
                <>
                  Confirmar Programação
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
