import React, { useState } from 'react';
import { User, Mail, Phone, Building2, Shield, Wrench, Check, Camera, Lock, AlertCircle } from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { maskPhone, validatePhone } from '../utils/masks';

export const UserProfileView: React.FC = () => {
  const { currentUser, updateCurrentUser } = useTicketContext();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && !validatePhone(phone)) {
      setErrorMsg('Formato de telefone inválido. Use (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.');
      return;
    }
    setErrorMsg('');
    updateCurrentUser({
      name,
      phone,
      avatar: avatar || currentUser.avatar,
    });
    setSuccessMsg('Informações de perfil atualizadas com sucesso!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Meu Perfil & Informações da Conta
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualize seus dados de acesso corporativo e atualize suas informações pessoais.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Cover Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative" />

          {/* Profile Header Info */}
          <div className="px-6 pb-6 relative pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md"
                />
                <div className="pt-2 sm:pt-0">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
                  <div className="text-xs text-slate-500 font-mono">{currentUser.email}</div>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 capitalize">
                    {currentUser.role === 'admin' ? 'Administrador do Sistema' : currentUser.role === 'technician' ? 'Técnico de Suporte' : 'Cliente da Organização'}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail Corporativo (Somente Leitura)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full pl-9 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(maskPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-9 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL do Avatar (Foto)</label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-9 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {currentUser.organizationName && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Organização Vinculada</label>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <span>{currentUser.organizationName}</span>
                  </div>
                </div>
              )}

              {currentUser.department && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Departamento Atribuído</label>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono">
                    {currentUser.department}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
