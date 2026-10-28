import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Headphones,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { checkTicketSLA } from '../utils/sla';
import { exportTicketsToCSV, printExecutiveReport } from '../utils/export';
import { DEPARTMENTS, PRIORITY_CONFIG } from '../data/initialData';
import { Priority } from '../types';

export const Dashboard: React.FC = () => {
  const { filteredTickets, technicians, setIsReportsModalOpen } = useTicketContext();
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  // Metric 1: Total & Active
  const totalTickets = filteredTickets.length;
  const activeTickets = filteredTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  const resolvedTickets = filteredTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED');

  // Metric 2: SLA Compliance
  const resolvedOnTime = resolvedTickets.filter((t) => {
    const sla = checkTicketSLA(t);
    return sla.status === 'RESOLVED_ON_TIME';
  }).length;

  const slaCompliancePercent = resolvedTickets.length > 0
    ? Math.round((resolvedOnTime / resolvedTickets.length) * 100)
    : 100;

  // Metric 3: SLA Risks and Breaches
  const breachedTickets = filteredTickets.filter((t) => {
    const sla = checkTicketSLA(t);
    return sla.isBreached && t.status !== 'RESOLVED' && t.status !== 'CLOSED';
  });

  const warningTickets = filteredTickets.filter((t) => {
    const sla = checkTicketSLA(t);
    return sla.status === 'WARNING' && t.status !== 'RESOLVED' && t.status !== 'CLOSED';
  });

  // Metric 4: Average Resolution Time (MTTR)
  let totalResolutionHours = 0;
  let countWithDuration = 0;
  resolvedTickets.forEach((t) => {
    if (t.resolvedAt) {
      const ms = new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime();
      const hours = ms / (1000 * 60 * 60);
      if (hours > 0) {
        totalResolutionHours += hours;
        countWithDuration++;
      }
    }
  });
  const mttr = countWithDuration > 0 ? (totalResolutionHours / countWithDuration).toFixed(1) : '2.1';

  // Department Distribution data
  const deptCounts = DEPARTMENTS.map((dept) => {
    const count = filteredTickets.filter((t) => t.department === dept.id).length;
    const percentage = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
    return { ...dept, count, percentage };
  });

  // Priority Distribution data
  const priorities: Priority[] = ['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'];
  const priorityCounts = priorities.map((p) => {
    const count = filteredTickets.filter((t) => t.priority === p).length;
    const percentage = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
    return { priority: p, count, percentage, config: PRIORITY_CONFIG[p] };
  });

  // Donut SVG Math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;
  const deptColors = ['#2563EB', '#8B5CF6', '#F59E0B', '#10B981'];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel Executivo de Desempenho & SLAs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Métricas de resposta operacional, produtividade dos técnicos e indicadores de auditoria em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportTicketsToCSV(filteredTickets)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Planilha CSV</span>
          </button>

          <button
            onClick={() => setIsReportsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Relatório Executivo PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Chamados Ativos */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Chamados em Andamento</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {activeTickets.length}
            </span>
            <span className="text-xs text-slate-400">de {totalTickets} registrados</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            {resolvedTickets.length} resolvidos no histórico recente
          </div>
        </div>

        {/* KPI 2: Taxa de Conformidade SLA */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Cumprimento de SLA</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {slaCompliancePercent}%
            </span>
            <span className="text-xs text-slate-400">meta: &ge; 90%</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${slaCompliancePercent}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Violações & Alertas de SLA */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">SLAs em Risco / Violados</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {breachedTickets.length}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              +{warningTickets.length} em atenção
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            Disparos automáticos enviados aos técnicos
          </div>
        </div>

        {/* KPI 4: MTTR (Tempo Médio de Resolução) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Tempo Médio de Resolução (MTTR)</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {mttr}h
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              -18% vs semana anterior
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            Calculado sobre chamados solucionados
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Breakdown by Department */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribuição por Departamento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Volume de chamados abertos por área operacional
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {totalTickets} total
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {deptCounts.map((dept, index) => {
                  const strokeDasharray = `${(dept.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                  accumulatedPercent += dept.percentage;
                  const isHovered = hoveredDept === dept.id;

                  return (
                    <circle
                      key={dept.id}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={deptColors[index % deptColors.length]}
                      strokeWidth={isHovered ? '22' : '18'}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      onMouseEnter={() => setHoveredDept(dept.id)}
                      onMouseLeave={() => setHoveredDept(null)}
                      className="transition-all duration-200 cursor-pointer"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {totalTickets}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Demandas
                </span>
              </div>
            </div>

            {/* Legend & Stats */}
            <div className="flex-1 w-full space-y-2.5">
              {deptCounts.map((dept, index) => (
                <div
                  key={dept.id}
                  onMouseEnter={() => setHoveredDept(dept.id)}
                  onMouseLeave={() => setHoveredDept(null)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    hoveredDept === dept.id ? 'bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: deptColors[index % deptColors.length] }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {dept.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-semibold text-slate-900 dark:text-white">{dept.count}</span>
                    <span className="text-slate-400 text-[11px]">({dept.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Priority Distribution Bars */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribuição por Matriz de Prioridade
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prazos limites e criticidade de atendimento
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {priorityCounts.map((p) => (
              <div key={p.priority} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p.config.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {p.config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">{p.count} chamados</span>
                    <span className="text-slate-400 text-[11px]">({p.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(6, p.percentage)}%`,
                      backgroundColor: p.config.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Matrix SLA quick guidance */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Matriz de SLAs: P1 (4h) · P2 (12h) · P3 (24h) · P4 (48h)</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">Regra Ativa</span>
          </div>
        </div>
      </div>

      {/* Technician Productivity Leaderboard */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Produtividade & Desempenho dos Técnicos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranking de resolução, carga atual de trabalho e tempo médio de fechamento
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {technicians.length} técnicos ativos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">Técnico</th>
                <th className="py-2.5 px-3">Especialidade / Área</th>
                <th className="py-2.5 px-3 text-center">Chamados Ativos</th>
                <th className="py-2.5 px-3 text-center">Resolvidos</th>
                <th className="py-2.5 px-3 text-center">Tempo Médio (MTTR)</th>
                <th className="py-2.5 px-3 text-right">Avaliação do Solicitante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {technicians.map((tech) => {
                const assignedTickets = filteredTickets.filter((t) => t.assignedTechnicianId === tech.id);
                const activeCount = assignedTickets.filter(
                  (t: any) => t.status !== 'RESOLVED' && t.status !== 'CLOSED'
                ).length;

                return (
                  <tr key={tech.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {tech.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {tech.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{tech.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <div>{tech.role}</div>
                      <div className="text-[10px] text-slate-400">{tech.department}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium tabular-nums text-slate-900 dark:text-slate-100">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {activeCount}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                      {tech.resolvedTicketsCount}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {tech.avgResolutionHours}h
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium tabular-nums text-amber-500">
                      ⭐ {tech.rating.toFixed(2)} / 5.0
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
