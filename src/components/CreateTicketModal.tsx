import React, { useState } from 'react';
import { Clock, Plus, Tag, X } from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { Department, Priority } from '../types';
import { DEPARTMENTS, PRIORITY_CONFIG } from '../data/initialData';
import { SLA_MATRIX } from '../utils/sla';

export const CreateTicketModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTicket,
    technicians,
    selectedDepartment,
    currentUser,
    organizations,
  } = useTicketContext();

  const isOrgUser = currentUser?.role === 'org_user';

  // Find organization locations for the current user
  const userOrg = organizations.find((o) => o.id === currentUser?.organizationId) || organizations[0];
  const availableLocations = userOrg?.locations || ['Sede Principal', 'Recepção'];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<Department>(
    selectedDepartment !== 'ALL' ? selectedDepartment : 'IT'
  );
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('P3_MEDIUM');
  
  // Requester prefilled from currentUser if org_user
  const [requesterName, setRequesterName] = useState(currentUser?.name || 'Juliana Ferreira');
  const [requesterEmail, setRequesterEmail] = useState(currentUser?.email || 'juliana.ferreira@empresa.com');
  const [requesterPhone, setRequesterPhone] = useState(currentUser?.phone || '+55 11 98877-6655');
  
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');
  const [tagsInput, setTagsInput] = useState('Suporte, Operacional');
  const [location, setLocation] = useState(availableLocations[0] || 'Sede Principal');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createTicket({
      title,
      description,
      department,
      category: category || 'Geral',
      priority,
      requesterName,
      requesterEmail,
      requesterPhone,
      // Org users cannot assign technicians; technicians will pick up the ticket
      assignedTechnicianId: isOrgUser ? undefined : (assignedTechnicianId || undefined),
      tags,
      location,
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const slaConfig = SLA_MATRIX[priority];

  const CATEGORY_SUGGESTIONS: Record<Department, string[]> = {
    IT: ['Rede e Conexão', 'Hardware e Notebook', 'Acessos e Senhas', 'Segurança da Informação', 'Servidores'],
    HR: ['Admissão e Onboarding', 'Benefícios', 'Folha de Pagamento', 'Treinamento', 'Férias'],
    MAINTENANCE: ['Climatização / Ar', 'Instalação Elétrica', 'Hidráulica', 'Mobiliário', 'Segurança Predial'],
    CUSTOMER_SUPPORT: ['Integração API', 'Erro no Faturamento', 'Bug no Aplicativo', 'Reclamação de SLA', 'Onboarding VIP'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Novo Chamado de Atendimento
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isOrgUser
                ? `Abertura em nome de ${userOrg?.name}. O chamado será encaminhado para a fila dos técnicos.`
                : 'Preencha os dados da demanda e prazos de SLA.'}
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Departamento Responsável *
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value as Department);
                  setCategory('');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nível de Prioridade (Matriz de SLA) *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="P1_CRITICAL">P1 - Crítico (4h)</option>
                <option value="P2_HIGH">P2 - Alto (12h)</option>
                <option value="P3_MEDIUM">P3 - Médio (24h)</option>
                <option value="P4_LOW">P4 - Baixo (48h)</option>
              </select>
            </div>
          </div>

          {/* SLA Preview Banner */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-200 font-mono">
            <span>SLA Estimado: Resposta em {slaConfig.responseHours}h · Resolução em {slaConfig.resolutionHours}h</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase">{slaConfig.label}</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Título Resumido da Demanda *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Falha na conexão de rede / Vazamento no ar condicionado"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Hardware, Redes, Climatização..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-1.5"
            />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_SUGGESTIONS[department]?.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  +{cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descrição Detalhada do Problema *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que ocorreu, impacto e equipamentos envolvidos..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Location Dropdown preselected from organization locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sala / Local Predefinido *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>

            {!isOrgUser && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Atribuir Técnico (Admin / Sup)
                </label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Aguardar técnico pegar chamado</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all"
            >
              Abrir Chamado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
