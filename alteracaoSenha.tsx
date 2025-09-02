import React, { useMemo, useState } from "react";

/**
 * Componente de Alteração de Senha (React + TSX)
 * - Validação client-side (força da senha, confirmação, requisitos mínimos)
 * - Toggle de visibilidade
 * - Indicador de força da senha
 * - Acessível (rótulos, aria-live, mensagens de erro)
 * - API: por padrão chama POST /api/auth/change-password (pode sobrescrever via prop)
 */

export type ChangePasswordProps = {
  onSubmit?: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  className?: string;
};

const passwordRules = {
  minLength: 8,
  hasUpper: /[A-Z]/,
  hasLower: /[a-z]/,
  hasNumber: /\d/,
  hasSymbol: /[^A-Za-z0-9]/,
};

type Strength = "fraca" | "média" | "forte" | "muito forte";

function calcStrength(pw: string): { score: number; label: Strength } {
  if (!pw) return { score: 0, label: "fraca" };
  let score = 0;
  if (pw.length >= passwordRules.minLength) score++;
  if (passwordRules.hasUpper.test(pw)) score++;
  if (passwordRules.hasLower.test(pw)) score++;
  if (passwordRules.hasNumber.test(pw)) score++;
  if (passwordRules.hasSymbol.test(pw)) score++;

  // Normaliza para 0..4
  score = Math.min(4, Math.max(0, score - 1));
  const labels: Strength[] = ["fraca", "média", "forte", "muito forte"];
  return { score, label: labels[score] };
}

export default function ChangePassword({ onSubmit, className }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strength = useMemo(() => calcStrength(newPassword), [newPassword]);

  const validNewPw = useMemo(() => {
    const pw = newPassword;
    return (
      pw.length >= passwordRules.minLength &&
      passwordRules.hasUpper.test(pw) &&
      passwordRules.hasLower.test(pw) &&
      passwordRules.hasNumber.test(pw) &&
      passwordRules.hasSymbol.test(pw)
    );
  }, [newPassword]);

  const passwordsMatch = newPassword === confirmPassword;

  const defaultSubmit = async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || `Erro ${res.status}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validNewPw) {
      setError(
        "A nova senha não atende aos requisitos mínimos (8+ caracteres, maiúscula, minúscula, número e símbolo)."
      );
      return;
    }

    if (!passwordsMatch) {
      setError("A confirmação não confere.");
      return;
    }

    setSubmitting(true);
    try {
      await (onSubmit ?? defaultSubmit)({ currentPassword, newPassword });
      setSuccess("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível alterar a senha.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={"max-w-md mx-auto p-6 " + (className ?? "") }>
      <h1 className="text-2xl font-semibold mb-4">Alterar senha</h1>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Senha atual */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">
            Senha atual
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              className="w-full rounded-xl border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              aria-label={showCurrent ? "Ocultar senha atual" : "Mostrar senha atual"}
              className="absolute inset-y-0 right-2 my-auto text-sm underline"
              onClick={() => setShowCurrent((v) => !v)}
            >
              {showCurrent ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        {/* Nova senha */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
            Nova senha
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNew ? "text" : "password"}
              className="w-full rounded-xl border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              aria-describedby="password-help"
            />
            <button
              type="button"
              aria-label={showNew ? "Ocultar nova senha" : "Mostrar nova senha"}
              className="absolute inset-y-0 right-2 my-auto text-sm underline"
              onClick={() => setShowNew((v) => !v)}
            >
              {showNew ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {/* Barra de força */}
          <div className="mt-2" aria-live="polite">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${((strength.score + 1) / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Força: {strength.label}</p>
          </div>

          {/* Requisitos */}
          <ul id="password-help" className="text-xs text-gray-600 mt-2 list-disc ml-5 space-y-0.5">
            <li>Mínimo de {passwordRules.minLength} caracteres</li>
            <li>Pelo menos 1 letra maiúscula (A–Z)</li>
            <li>Pelo menos 1 letra minúscula (a–z)</li>
            <li>Pelo menos 1 número (0–9)</li>
            <li>Pelo menos 1 símbolo (ex.: !@#$%)</li>
          </ul>
        </div>

        {/* Confirmar nova senha */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
            Confirmar nova senha
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              className="w-full rounded-xl border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
              className="absolute inset-y-0 right-2 my-auto text-sm underline"
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {!passwordsMatch && confirmPassword && (
            <p className="text-sm text-red-600 mt-1">As senhas não conferem.</p>
          )}
        </div>

        {/* Mensagens de feedback */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-green-700" role="status" aria-live="polite">
            {success}
          </div>
        )}

        {/* Botão submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-indigo-600 text-white font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
        >
          {submitting ? "Salvando..." : "Alterar senha"}
        </button>

        {/* Dica de integração */}
        <p className="text-xs text-gray-500 mt-2">
          Dica: passe uma função <code>onSubmit</code> para integrar com sua API. Por padrão, este componente faz
          <code> POST /api/auth/change-password</code> (JSON: {"{"}currentPassword, newPassword{"}"}).
        </p>
      </form>
    </div>
  );
}
