import React, { useState } from 'react';
import { Wrench, Plus, Edit2, Trash2, X, Star } from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { Technician, Department } from '../types';
import { maskPhone } from '../utils/masks';

export const AdminTechniciansView: React.FC = () => {
  const { technicians, addTechnician, updateTechnician, deleteTechnician } = useTicketContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Department>('IT');
  const [phone, setPhone] = useState('+55 11 98888-7777');

  const handleOpenCreate = () => {
    setEditingTech(null);
    setName('');
    setEmail('');
    setRole('Analista de Suporte Sr.');
    setDepartment('IT');
    setPhone('+55 11 98888-7777');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tech: Technician) => {
    setEditingTech(tech);
    setName(tech.name);
    setEmail(tech.email);
    setRole(tech.role);
    setDepartment(tech.department);
    setPhone(tech.phone);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingTech) {
      updateTechnician({
        ...editingTech,
        name,
        email,
        role,
        department,
        phone,
      });
    } else {
      addTechnician({
        name,
        email,
        role,
        department,
        phone,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=100&auto=format&fit=crop&q=80`,
        activeTicketsCount: 0,
        resolvedTicketsCount: 0,
        avgResolutionHours: 2.0,
        rating: 5.0,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            Gerenciamento de Técnicos & Especialistas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            CRUD de técnicos responsáveis por responder aos chamados e atender filas operacionais.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Técnico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <div
            key={tech.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-3">
              <img src={tech.avatar} alt={tech.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tech.name}</h3>
                <div className="text-xs text-slate-600 dark:text-slate-400">{tech.role}</div>
                <div className="text-[11px] font-mono text-blue-500">Depto: {tech.department}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 font-mono">
              <div>
                <div className="text-slate-400 text-[10px]">Ativos</div>
                <div className="font-bold text-slate-900 dark:text-white">{tech.activeTicketsCount}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Resolvidos</div>
                <div className="font-bold text-emerald-600">{tech.resolvedTicketsCount}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Rating</div>
                <div className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {tech.rating}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">{tech.email}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(tech)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTechnician(tech.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD Tech */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingTech ? 'Editar Técnico' : 'Novo Técnico de Suporte'}
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail Profissional *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo / Especialidade *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="ex: Especialista em Redes & Infra"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Departamento Atribuído *</label>
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

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Salvar Técnico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
