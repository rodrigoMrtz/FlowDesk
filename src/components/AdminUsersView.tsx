import React, { useState } from 'react';
import { Users, Plus, Shield, Wrench, Building2, Trash2, Edit2, X, Check } from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { UserProfile, UserRole, Department } from '../types';
import { maskPhone } from '../utils/masks';

export const AdminUsersView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, organizations } = useTicketContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('org_user');
  const [department, setDepartment] = useState<Department>('IT');
  const [organizationId, setOrganizationId] = useState('');
  const [phone, setPhone] = useState('+55 11 99999-8888');

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('org_user');
    setDepartment('IT');
    setOrganizationId(organizations[0]?.id || '');
    setPhone('+55 11 99999-8888');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department || 'IT');
    setOrganizationId(user.organizationId || '');
    setPhone(user.phone || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const org = organizations.find((o) => o.id === organizationId);

    if (editingUser) {
      updateUser({
        ...editingUser,
        name,
        email,
        role,
        department: role === 'technician' ? department : undefined,
        organizationId: role === 'org_user' ? organizationId : undefined,
        organizationName: role === 'org_user' ? org?.name : undefined,
        phone,
      });
    } else {
      addUser({
        name,
        email,
        role,
        department: role === 'technician' ? department : undefined,
        organizationId: role === 'org_user' ? organizationId : undefined,
        organizationName: role === 'org_user' ? org?.name : undefined,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=100&auto=format&fit=crop&q=80`,
        phone,
        status: 'Active',
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gerenciamento de Usuários do Sistema
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            CRUD completo de administradores, técnicos responsáveis e usuários das organizações clientes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-4">Usuário</th>
              <th className="py-3 px-4">Perfil (Role)</th>
              <th className="py-3 px-4">Organização / Departamento</th>
              <th className="py-3 px-4">Telefone</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      u.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : u.role === 'technician'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {u.role === 'admin' ? 'Administrador' : u.role === 'technician' ? 'Técnico' : 'Cliente (Org)'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                  {u.role === 'technician' && <span className="font-mono text-blue-500">Depto: {u.department}</span>}
                  {u.role === 'org_user' && <span>{u.organizationName || 'N/A'}</span>}
                  {u.role === 'admin' && <span className="italic text-slate-400">Sistema Global</span>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">{u.phone}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal CRUD User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Perfil (Role) *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="org_user">Usuário da Organização</option>
                    <option value="technician">Técnico de Suporte</option>
                    <option value="admin">Administrador Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {role === 'technician' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Departamento Técnico *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="IT">Tecnologia da Informação (TI)</option>
                    <option value="HR">Recursos Humanos (RH)</option>
                    <option value="MAINTENANCE">Manutenção & Facilities</option>
                    <option value="CUSTOMER_SUPPORT">Atendimento ao Cliente (SAC)</option>
                  </select>
                </div>
              )}

              {role === 'org_user' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Organização Cliente *</label>
                  <select
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.plan})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
