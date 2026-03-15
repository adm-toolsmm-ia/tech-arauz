'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
    <main className="bg-primary relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo/Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="group inline-flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-white/15">
              <Image
                src="/assets/logo-arauz-2026.png"
                alt="Tech Arauz Logo"
                width={64}
                height={64}
                className="object-contain p-2"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold tracking-tight text-white">Tech Arauz</span>
              <span className="text-primary-foreground/60 mt-1 text-sm font-medium uppercase tracking-widest">
                Portal Corporativo
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-gray-500">Informe suas credenciais para acessar.</p>
          </div>

          {error && (
            <div className="animate-slide-in-right mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Corporativo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:border-primary focus:ring-primary/20 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 outline-none transition-all placeholder:text-gray-400 hover:bg-white focus:ring-2"
                placeholder="nome@arauz.adv.br"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 text-xs font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:border-primary focus:ring-primary/20 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 outline-none transition-all placeholder:text-gray-400 hover:bg-white focus:ring-2"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hover:bg-accent-hover shadow-accent/20 hover:shadow-accent/40 focus:ring-accent/20 w-full transform rounded-xl bg-accent px-4 py-3.5 font-bold text-white shadow-lg transition-all focus:ring-4 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Autenticando...
                </span>
              ) : (
                'Acessar Plataforma'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-primary-foreground/40 mt-10 text-center text-xs font-medium tracking-wide">
          &copy; 2026 Tech Arauz &bull; Araúz & Advogados Associados
        </p>
      </div>
    </main>
  );
}
