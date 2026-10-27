import { Ticket } from '../types';
import { formatDateTime } from './sla';

export function exportTicketsToCSV(tickets: Ticket[], filename: string = 'relatorio-chamados-omnidesk.csv') {
  const headers = [
    'Código',
    'Título',
    'Departamento',
    'Categoria',
    'Prioridade',
    'Status',
    'Solicitante',
    'Email Solicitante',
    'Técnico Responsável',
    'Criado Em',
    'Prazo SLA Resolução',
    'Resolvido Em',
    'Tags',
  ];

  const escapeCSV = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tickets.map((t) => [
    escapeCSV(t.code),
    escapeCSV(t.title),
    escapeCSV(t.department),
    escapeCSV(t.category),
    escapeCSV(t.priority),
    escapeCSV(t.status),
    escapeCSV(t.requesterName),
    escapeCSV(t.requesterEmail),
    escapeCSV(t.assignedTechnicianName || 'Não atribuído'),
    escapeCSV(formatDateTime(t.createdAt)),
    escapeCSV(formatDateTime(t.dueResolutionAt)),
    escapeCSV(t.resolvedAt ? formatDateTime(t.resolvedAt) : 'Pendente'),
    escapeCSV(t.tags.join(', ')),
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printExecutiveReport() {
  window.print();
}
