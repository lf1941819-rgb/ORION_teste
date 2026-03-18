import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { User, Camera, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

const Background: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Grid Pattern */}
    <div 
      className="absolute inset-0 opacity-[0.1]" 
      style={{ 
        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
    />
    
    {/* Atmospheric Glows */}
    <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/30 blur-[120px] animate-pulse-slow" />
    <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/25 blur-[100px] animate-pulse-slower" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-indigo-900/20 blur-[140px]" />
  </div>
);

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateUser({ name, photoUrl });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 relative overflow-hidden">
      <Background />
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center gap-4">
          <Link 
            to="/lab" 
            className="p-2 hover:bg-slate-900/50 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Meu Perfil</h1>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 flex items-center justify-center ring-4 ring-indigo-500/20">
                  {photoUrl && !imgError ? (
                    <img 
                      src={photoUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <User size={64} className="text-slate-600" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Identidade Órion</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white transition-all"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email (Não editável)</label>
                <div className="w-full px-4 py-3 bg-slate-950/30 border border-slate-800/50 rounded-xl text-slate-500">
                  {user?.email}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-400">URL da Foto de Perfil</label>
                  {photoUrl && (
                    <button 
                      type="button"
                      onClick={() => { setPhotoUrl(''); setImgError(false); }}
                      className="text-[10px] text-red-400 hover:text-red-300 uppercase font-bold"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setImgError(false);
                  }}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white transition-all"
                  placeholder="https://exemplo.com/foto.jpg"
                />
                <p className="text-[10px] text-slate-500">Insira um link direto para uma imagem (JPG, PNG, etc.)</p>
                {imgError && photoUrl && (
                  <p className="text-[10px] text-red-400">Não foi possível carregar a imagem deste link.</p>
                )}
              </div>
            </div>

            {message && (
              <div className={clsx(
                "p-4 rounded-xl text-sm font-medium",
                message.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              )}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save size={20} />
                  Salvar Alterações
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Segurança</h3>
          <p className="text-sm text-slate-400 mb-4">Seu acesso é protegido por autenticação de dois fatores via Google.</p>
          <a 
            href="https://myaccount.google.com/security" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Gerenciar conta Google
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
