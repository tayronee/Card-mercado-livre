import React, { useState } from "react";

// If you're using Next.js (App Router), you can place this file at: app/login/page.tsx
// TailwindCSS recommended. If you don't have it, replace className strings with your CSS.
// This component handles:
// - Email & password with basic validation
// - Show/Hide password toggle
// - Remember me checkbox
// - Disable button while submitting
// - Keyboard & screen-reader accessibility
// - Minimal error handling example calling /api/login (adjust to your backend)

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Simple client-side validation
    if (!validateEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // Example request — change the endpoint/body to your backend
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Falha ao autenticar. Verifique suas credenciais.");
      }

      // On success, redirect the user (Next.js example)
      // If not using Next.js, use window.location.href
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard"; // ajuste a rota desejada
      }
    } catch (err: any) {
      setError(err.message ?? "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <section className="bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
          {/* Brand / Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="size-12 rounded-2xl bg-indigo-600 shadow-md flex items-center justify-center text-white font-bold">
              {/* Replace with your logo */}
              <span className="sr-only">Sua marca</span>
              <span aria-hidden>∑</span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 text-center">Acesse sua conta</h1>
          <p className="text-slate-500 text-center mt-1">Bem-vindo de volta! Faça login para continuar.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                aria-invalid={!!error && !validateEmail(email)}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-12 text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
                  aria-invalid={!!error && password.length < 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 my-1 px-3 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l18 18"/>
                      <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"/>
                      <path d="M16.24 16.24A9.76 9.76 0 0 1 12 18c-5 0-9-6-9-6a17.46 17.46 0 0 1 4.21-4.62"/>
                      <path d="M9.88 5.17A9.76 9.76 0 0 1 12 6c5 0 9 6 9 6a17.46 17.46 0 0 1-2.53 3.34"/>
                    </svg>
                  ) : (
                    // Eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="text-sm text-slate-600">Lembrar-me</span>
              </label>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-white font-semibold shadow-md hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs uppercase tracking-wider text-slate-400">ou</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Socials (optional) */}
          <div className="grid grid-cols-1 gap-3">
            <button className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100">
              Continuar com Google
            </button>
            <button className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100">
              Continuar com GitHub
            </button>
          </div>
        </section>

        {/* Footer small print */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Protegido por medidas de segurança. Ao continuar, você concorda com nossos Termos e Política de Privacidade.
        </p>
      </div>
    </main>
  );
}
