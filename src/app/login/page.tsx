'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 justify-center group">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 backdrop-blur-sm group-hover:bg-white/20 transition-all">
              <span className="text-brand-500 font-bold text-2xl">A</span>
            </div>
            <span className="text-2xl font-semibold text-white tracking-tight">Tech Arauz</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 border border-white/10">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-medium text-gray-900">Acesso Restrito</h2>
            <p className="text-sm text-gray-500 mt-1">Informe suas credenciais para continuar.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Corporativo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="nome@arauz.adv.br"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 px-4 rounded-lg font-medium shadow-md shadow-brand-600/20 focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Autenticando...' : 'Acessar Plataforma'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-brand-200/60 text-xs mt-8 font-light">
          &copy; 2026 Tech Arauz - Araúz & Advogados Associados
        </p>
      </div>
    </main>
  );
}
