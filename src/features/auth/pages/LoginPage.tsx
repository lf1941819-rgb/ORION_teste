import React from 'react';
import { LoginForm } from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-12 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/20 rotate-12">
            <span className="text-3xl font-black text-white -rotate-12">O</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">ÓRION LAB</h1>
          <p className="text-slate-500 text-sm uppercase tracking-[0.3em] font-black">Intellectual Command Center</p>
        </div>
        
        <div className="bg-slate-900/40 p-10 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl">
          <LoginForm />
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-black">
            Powered by Advanced Reasoning Engines
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
