import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';

export const SignupForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await login();
      navigate('/lab');
    } catch (err: any) {
      console.error('Signup: Google signup failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md flex flex-col items-center">
      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full py-4 px-6 bg-white hover:bg-slate-50 disabled:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 group"
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google" 
          className="w-5 h-5"
        />
        <span>{loading ? 'Conectando...' : 'Criar Conta com Google'}</span>
      </button>
      
      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">
        Acesso Seguro via Google Auth
      </p>
    </div>
  );
};
