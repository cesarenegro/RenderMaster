import React, { useState } from 'react';
import { User } from '../types';
import { SparklesIcon, BackIcon } from './icons';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      name: email.split('@')[0],
      plan: 'free',
      credits: 5,
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <BackIcon className="w-5 h-5" />
          Back to home
        </button>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <img src="https://i.imgur.com/OXqK4w1.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            {isRegistering ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-slate-400">
            {isRegistering ? 'Join Render Master AI today' : 'Log in to your workspace'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;