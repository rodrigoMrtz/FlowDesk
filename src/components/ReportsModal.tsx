import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  Printer,
  X,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { Department, TicketStatus } from '../types';
import { DEPARTMENTS } from '../data/initialData';
import { exportTicketsToCSV, printExecutiveReport } from '../utils/export';
import { checkTicketSLA, formatDateTime } from '../utils/sla';

export const ReportsModal: React.FC = () => {
  const {
    isReportsModalOpen,
    setIsReportsModalOpen,
    filteredTickets,
  } = useTicketContext();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');

  if (!isReportsModalOpen) return null;

  const filtered = filteredTickets.filter((ticket) => {
    if (departmentFilter !== 'ALL' && ticket.department !== departmentFilter) return false;
    if (statusFilter !== 'ALL' && ticket.status !== statusFilter) return false;

    if (period !== 'all') {
      const ticketTime = new Date(ticket.createdAt).getTime();
      const now = Date.now();
      const diffHours = (now - ticketTime) / (1000 * 60 * 60);

      if (period === 'today' && diffHours > 24) return false;
      if (period === 'week' && diffHours > 168) return false;
      if (period === 'month' && diffHours > 720) return false;
    }

    return true;
  });

  // Calculate stats for this filtered subset
  const total = filtered.length;
  const resolved = filtered.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const breached = filtered.filter((t) => {
    const sla = checkTicketSLA(t);
    return sla.isBreached;
  }).length;
  const onTime = resolved - filtered.filter((t) => {
    const sla = checkTicketSLA(t);
    return sla.status === 'RESOLVED_LATE';
  }).length;
  const compliance = resolved > 0 ? Math.round((onTime / resolved) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-4xl h-[680px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Central de Relatórios & Exportação Executiva
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere documentos executivos prontos para impressão/PDF ou planilhas CSV para auditoria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTicketsToCSV(filtered)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV</span>
            </button>

            <button
              onClick={printExecutiveReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar em PDF</span>
            </button>

            <button
              onClick={() => setIsReportsModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar (Hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-100/60 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros:</span>
            </div>

            {/* Period */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todo o Histórico</option>
              <option value="today">Hoje (Últimas 24h)</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Últimos 30 dias</option>
            </select>

            {/* Department */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as any)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Todos Departamentos</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Todos Status</option>
              <option value="NEW">Novos</option>
              <option value="IN_PROGRESS">Em Atendimento</option>
              <option value="PENDING">Pendentes</option>
              <option value="RESOLVED">Resolvidos</option>
            </select>
          </div>

          <div className="font-mono text-slate-500 tabular-nums">
            {filtered.length} chamados no escopo do relatório
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {/* Institutional Report Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  OmniDesk · Relatório Executivo de SLA & Atendimento
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Auditoria Operacional e Cumprimento de Níveis de Serviço
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                <div>Status: Homologado</div>
              </div>
            </div>
          </div>

          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="text-slate-400">Total Filtrado</div>
              <div className="text-lg font-bold font-mono tabular-nums mt-1">{total}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="text-slate-400">Resolvidos</div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                {resolved}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="text-slate-400">Conformidade SLA</div>
              <div className="text-lg font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
                {compliance}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="text-slate-400">SLAs Violados</div>
              <div className="text-lg font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
                {breached}
              </div>
            </div>
          </div>

          {/* Table of Tickets */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Título</th>
                  <th className="py-2.5 px-3">Depto</th>
                  <th className="py-2.5 px-3">Prioridade</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Técnico</th>
                  <th className="py-2.5 px-3">Status do SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((t) => {
                  const sla = checkTicketSLA(t);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-mono font-medium">{t.code}</td>
                      <td className="py-2 px-3 max-w-xs truncate">{t.title}</td>
                      <td className="py-2 px-3">{t.department}</td>
                      <td className="py-2 px-3 font-semibold">{t.priority}</td>
                      <td className="py-2 px-3">{t.status}</td>
                      <td className="py-2 px-3">{t.assignedTechnicianName || '—'}</td>
                      <td className="py-2 px-3">
                        <span className={`font-mono text-[11px] ${sla.badgeText}`}>
                          {sla.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Document Sign-off footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>OmniDesk Enterprise Service Desk · Sistema com Trilha de Auditoria</div>
            <div>Página 1 de 1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
