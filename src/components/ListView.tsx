import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  Clock,
  Filter,
  Search,
  User,
  X,
} from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { Priority, Ticket, TicketStatus } from '../types';
import { PRIORITY_CONFIG } from '../data/initialData';
import { checkTicketSLA, formatDateTime } from '../utils/sla';

type SortField = 'code' | 'title' | 'department' | 'priority' | 'status' | 'dueResolutionAt' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const ListView: React.FC = () => {
  const {
    filteredTickets,
    updateTicketStatus,
    setActiveTicketDrawer,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
  } = useTicketContext();

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let valA: string | number = a[sortField] || '';
      let valB: string | number = b[sortField] || '';

      if (sortField === 'dueResolutionAt' || sortField === 'createdAt') {
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sortField, sortOrder]);

  const STATUS_LABELS: Record<TicketStatus, { label: string; badge: string }> = {
    NEW: { label: 'Novo', badge: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
    ANALYSIS: { label: 'Em Análise', badge: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
    IN_PROGRESS: { label: 'Em Atendimento', badge: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' },
    PENDING: { label: 'Pendente', badge: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30' },
    RESOLVED: { label: 'Resolvido', badge: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
    CLOSED: { label: 'Fechado', badge: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' },
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[320px] max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar tabela por chamado, técnico, departamento..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            {(
              [
                { id: 'ALL', label: 'Todas' },
                { id: 'P1_CRITICAL', label: 'P1' },
                { id: 'P2_HIGH', label: 'P2' },
                { id: 'P3_MEDIUM', label: 'P3' },
                { id: 'P4_LOW', label: 'P4' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedPriority(item.id as Priority | 'ALL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedPriority === item.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          {sortedTickets.length} registros listados
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="min-w-[1100px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSort('code')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Código</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Título da Demanda</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('department')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Departamento</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Prioridade</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status de Execução</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Técnico Responsável</th>
                <th
                  onClick={() => handleSort('dueResolutionAt')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>SLA de Resolução</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white select-none whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Criado em</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum chamado encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                sortedTickets.map((ticket) => {
                  const sla = checkTicketSLA(ticket);
                  const pConf = PRIORITY_CONFIG[ticket.priority];
                  const sConf = STATUS_LABELS[ticket.status];

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => setActiveTicketDrawer(ticket)}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-200 tabular-nums whitespace-nowrap">
                        {ticket.code}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {ticket.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {ticket.requesterName}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {ticket.department === 'IT'
                          ? 'TI & Infra'
                          : ticket.department === 'HR'
                          ? 'Recursos Humanos'
                          : ticket.department === 'MAINTENANCE'
                          ? 'Manutenção'
                          : 'Atendimento'}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${pConf.badge}`}>
                          {pConf.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ticket.status}
                          onChange={(e) => updateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                          className={`text-xs font-medium px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-1 focus:ring-blue-500 cursor-pointer ${sConf.badge}`}
                        >
                          <option value="NEW">Novo</option>
                          <option value="ANALYSIS">Em Análise</option>
                          <option value="IN_PROGRESS">Em Atendimento</option>
                          <option value="PENDING">Pendente</option>
                          <option value="RESOLVED">Resolvido</option>
                          <option value="CLOSED">Fechado</option>
                        </select>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {ticket.assignedTechnicianName ? (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                              {ticket.assignedTechnicianName.charAt(0)}
                            </div>
                            <span>{ticket.assignedTechnicianName}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 italic">
                            Não atribuído
                          </span>
                        )}
                      </td>

                      {/* SLA */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {sla.isBreached ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className={`font-mono tabular-nums ${sla.badgeText}`}>
                            {sla.formattedRemaining}
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {formatDateTime(ticket.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
