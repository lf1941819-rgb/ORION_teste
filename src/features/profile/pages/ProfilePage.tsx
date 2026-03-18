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
  const { user } = useAuthStore();
  const [imgError, setImgError] = useState(false);

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
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 flex items-center justify-center ring-4 ring-indigo-500/20">
                  {user?.photoUrl && !imgError ? (
                    <img 
                      src={user.photoUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <User size={64} className="text-slate-600" />
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Identidade Órion</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Nome Completo</label>
                <div className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800/50 rounded-xl text-white">
                  {user?.name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email</label>
                <div className="w-full px-4 py-3 bg-slate-950/30 border border-slate-800/50 rounded-xl text-slate-500">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs text-indigo-400 text-center">
              As informações do seu perfil são gerenciadas através da sua conta Google.
            </div>
          </div>
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
