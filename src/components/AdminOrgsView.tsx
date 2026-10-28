import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, X, CheckCircle2, MapPin } from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { Organization } from '../types';
import { maskCNPJ } from '../utils/masks';

export const AdminOrgsView: React.FC = () => {
  const { organizations, addOrganization, updateOrganization, deleteOrganization } = useTicketContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [plan, setPlan] = useState<'Enterprise' | 'Professional' | 'Standard'>('Enterprise');
  const [contactEmail, setContactEmail] = useState('');
  const [locationsInput, setLocationsInput] = useState('');

  const handleOpenCreate = () => {
    setEditingOrg(null);
    setName('');
    setCnpj('');
    setPlan('Enterprise');
    setContactEmail('');
    setLocationsInput('Sede Principal - Andar 2, Recepção - Térreo, Sala de Reunião 01');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org);
    setName(org.name);
    setCnpj(org.cnpj);
    setPlan(org.plan);
    setContactEmail(org.contactEmail);
    setLocationsInput(org.locations?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cnpj.trim()) return;

    const locations = locationsInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    if (editingOrg) {
      updateOrganization({
        ...editingOrg,
        name,
        cnpj,
        plan,
        contactEmail,
        locations: locations.length > 0 ? locations : ['Sede Principal'],
      });
    } else {
      addOrganization({
        name,
        cnpj,
        plan,
        status: 'Active',
        contactEmail,
        locations: locations.length > 0 ? locations : ['Sede Principal'],
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Gerenciamento de Organizações & Salas / Locais
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controle de contratos, planos e predefinição de salas e locais para abertura de chamados sem erros.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova Organização
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map((org) => (
          <div
            key={org.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                  {org.plan}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {org.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{org.name}</h3>
              <div className="text-xs font-mono text-slate-500">CNPJ: {org.cnpj}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Contato: {org.contactEmail}</div>

              {/* Locations preview */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  Salas / Locais cadastrados ({org.locations?.length || 0}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {org.locations?.map((loc) => (
                    <span
                      key={loc}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Criado em {new Date(org.createdAt).toLocaleDateString('pt-BR')}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(org)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteOrganization(org.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD Org */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingOrg ? 'Editar Organização e Locais' : 'Nova Organização Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Empresa / Organização *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CNPJ *</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                    placeholder="00.000.000/0001-00"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Plano *</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Professional">Professional</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Salas / Locais da Organização (separados por vírgula)
                </label>
                <textarea
                  value={locationsInput}
                  onChange={(e) => setLocationsInput(e.target.value)}
                  placeholder="Ex: Sede Principal - Andar 2, Recepção, Sala 304, Data Center"
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Estes locais aparecerão como menu dropdown para os usuários desta organização ao abrirem chamados.
                </p>
              </div>

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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Salvar Organização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
