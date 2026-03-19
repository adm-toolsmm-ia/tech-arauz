'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen">
      {/* ─── Painel Esquerdo — Hero Brand ─── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 xl:w-[55%]">
        {/* Fundo verde petróleo sólido */}
        <div className="absolute inset-0 bg-[hsl(164,85%,15%)]" />

        {/* Pattern hero (símbolo A) como decoração de fundo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/pattern-hero.png')",
            opacity: 0.18,
            mixBlendMode: 'luminosity',
          }}
        />

        {/* Gradiente diagonal para profundidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(164,85%,11%)] via-transparent to-[hsl(164,85%,20%)] opacity-70" />

        {/* Linha de acento laranja no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(19,89%,54%)]" />

        {/* Conteúdo do painel hero */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo grande com respiro */}
          <div>
            <Image
              src="/logo-dark.png"
              alt="Araúz Advogados"
              width={220}
              height={80}
              className="object-contain"
              priority
            />
          </div>

          {/* Texto hero central */}
          <div className="space-y-6">
            <div className="h-0.5 w-12 bg-[hsl(19,89%,54%)]" />
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Portal de Gestão
              <br />
              <span className="text-[hsl(19,89%,60%)]">Corporativo</span>
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-white/60">
              Plataforma centralizada de acompanhamento jurídico, projetos e
              indicadores estratégicos.
            </p>
          </div>

          {/* Slogan rodapé */}
          <div className="space-y-3">
            <Image
              src="/slogan-white.png"
              alt="Araúz — Dentro da Lei"
              width={180}
              height={40}
              className="object-contain opacity-50"
            />
            <p className="text-xs text-white/30">
              © 2026 Tech Arauz • Araúz &amp; Advogados Associados
            </p>
          </div>
        </div>
      </div>

      {/* ─── Painel Direito — Formulário ─── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">

          {/* Logo visível no mobile (oculta no desktop, painel esquerdo faz isso) */}
          <div className="mb-10 flex flex-col items-center lg:hidden">
            <Image
              src="/logo-color.png"
              alt="Araúz Advogados"
              width={180}
              height={65}
              className="object-contain"
              priority
            />
          </div>

          {/* Logo colorida no topo do form (desktop) */}
          <div className="mb-10 hidden lg:block">
            <Image
              src="/logo-color.png"
              alt="Araúz Advogados"
              width={200}
              height={72}
              className="object-contain"
              priority
            />
          </div>

          {/* Cabeçalho do form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
            <p className="mt-1 text-sm text-gray-500">
              Informe suas credenciais para acessar o portal.
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
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

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 outline-none transition-all placeholder:text-gray-400 hover:bg-white focus:border-[hsl(164,85%,15%)] focus:ring-2 focus:ring-[hsl(164,85%,15%)]/20"
                placeholder="nome@arauz.adv.br"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-[hsl(164,85%,15%)] transition-colors hover:text-[hsl(164,65%,25%)]"
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 outline-none transition-all placeholder:text-gray-400 hover:bg-white focus:border-[hsl(164,85%,15%)] focus:ring-2 focus:ring-[hsl(164,85%,15%)]/20"
                placeholder="••••••••"
              />
            </div>

            {/* Botão submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full transform rounded-xl bg-[hsl(19,89%,54%)] px-4 py-3.5 font-bold text-white shadow-lg shadow-[hsl(19,89%,54%)]/25 transition-all hover:bg-[hsl(19,89%,60%)] hover:shadow-[hsl(19,89%,54%)]/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Autenticando...
                </span>
              ) : (
                'Acessar Plataforma'
              )}
            </button>
          </form>

          {/* Rodapé mobile */}
          <p className="mt-10 text-center text-xs text-gray-400 lg:hidden">
            © 2026 Tech Arauz • Araúz &amp; Advogados Associados
          </p>
        </div>
      </div>
    </main>
  );
}
