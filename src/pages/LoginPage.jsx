import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function LoginPage() {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  function handleSubmit(event) {
    event.preventDefault();
    login();
    navigate('/app/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Acesso seguro</p>
          <h1 className="mt-4 text-4xl font-semibold">Gestão das operações hidráulicas em um só lugar.</h1>
          <p className="mt-4 max-w-xl text-sm text-slate-300">
            Este MVP utiliza autenticação simulada, então qualquer e-mail e senha permitem acessar a área operacional.
          </p>
          <div className="mt-8 rounded-[2rem] bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-200">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="font-semibold">Login simulado habilitado</p>
                <p className="text-sm text-slate-300">Ideal para demonstrações e validação de navegação antes da integração com backend.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-soft lg:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">Entrar</h2>
          <p className="mt-2 text-sm text-slate-500">Use qualquer credencial para acessar o protótipo.</p>
          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">E-mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="contato@empresa.com.br"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Senha</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Digite qualquer senha"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-8 w-full rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-500"
          >
            Acessar sistema
          </button>
        </form>
      </div>
    </div>
  );
}
