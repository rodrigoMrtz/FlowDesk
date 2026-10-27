import React, { useState } from 'react';
import { CheckCircle2, Shield, UserCheck, Wrench, Building2, Lock, Mail, ArrowRight } from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';

export const LoginScreen: React.FC = () => {
  const { login, users } = useTicketContext();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      login(found);
    } else {
      setError('E-mail não encontrado. Selecione um perfil de demonstração abaixo ou cadastre um usuário.');
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    const found = users.find((u) => u.email === demoEmail);
    if (found) {
      login(found);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg mb-1">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">OmniDesk Enterprise</h1>
          <p className="text-xs text-slate-400">
            Sistema de Gestão de Chamados, SLAs e Governança Multi-organização
          </p>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail de Acesso Corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: admin@omnidesk.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
                required
              />
            </div>
          </div>

          {error && <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">{error}</div>}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
            Acesso Rápido por Perfil (Demo)
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Quick Demo Accounts */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin@omnidesk.com')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Carlos Administrador</div>
                <div className="text-[11px] text-slate-400">Admin do Sistema (CRUD de Usuários, Orgs & Técnicos)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('carlos.mendes@empresa.com')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Carlos Mendes</div>
                <div className="text-[11px] text-slate-400">Técnico de Suporte (TI & Infraestrutura)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('ana.rocha@alphacorp.com')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Ana Paula Rocha</div>
                <div className="text-[11px] text-slate-400">Usuário da Organização (Matriz Alpha Corp)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-500 pt-2 font-mono">
          OmniDesk Secure Gateway · WCAG AA Compliant
        </div>
      </div>
    </div>
  );
};
