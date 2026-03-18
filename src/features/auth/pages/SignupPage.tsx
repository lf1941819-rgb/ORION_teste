import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm } from '../components/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-white">ÓRION LAB</h1>
          <p className="text-slate-400">Crie sua conta para começar a estruturar seus pensamentos.</p>
        </div>
        
        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-2xl">
          <SignupForm />
        </div>

        <p className="text-slate-500 text-sm">
          Já tem uma conta?{' '}
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
