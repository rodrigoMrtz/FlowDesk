import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  History,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Shield,
  Smartphone,
  Tag,
  User,
  X,
} from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { Priority, TicketStatus } from '../types';
import { PRIORITY_CONFIG } from '../data/initialData';
import { checkTicketSLA, formatDateTime, formatTimeAgo } from '../utils/sla';

export const TicketDetailModal: React.FC = () => {
  const {
    activeTicketDrawer,
    setActiveTicketDrawer,
    auditLogs,
    dispatches,
    technicians,
    updateTicketStatus,
    updateTicketPriority,
    assignTechnician,
    addTicketComment,
    dispatchManualNotification,
    currentUser,
  } = useTicketContext();

  const [activeTab, setActiveTab] = useState<'details' | 'audit' | 'notifications'>('details');
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  if (!activeTicketDrawer) return null;

  const ticket = activeTicketDrawer;
  const sla = checkTicketSLA(ticket);
  const pConf = PRIORITY_CONFIG[ticket.priority];
  const isOrgUser = currentUser?.role === 'org_user';

  const ticketAuditLogs = auditLogs.filter((log) => log.ticketId === ticket.id);
  const ticketDispatches = dispatches.filter((d) => d.ticketId === ticket.id);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTicketComment(ticket.id, commentText, isInternalComment);
    setCommentText('');
  };

  const departmentLabel =
    ticket.department === 'IT'
      ? 'Tecnologia da Informação'
      : ticket.department === 'HR'
      ? 'Recursos Humanos'
      : ticket.department === 'MAINTENANCE'
      ? 'Manutenção & Facilities'
      : 'Atendimento ao Cliente';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-4xl h-[92vh] sm:h-[700px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100">
              {ticket.code}
            </span>
            <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              <span>{departmentLabel}</span>
              <span className="mx-1.5">·</span>
              <span>Criado {formatTimeAgo(ticket.createdAt)}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTicketDrawer(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action ribbon - Locked for org_user, editable for technicians and admin */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Status:</span>
            {isOrgUser ? (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold uppercase text-[11px]">
                {ticket.status}
              </span>
            ) : (
              <select
                value={ticket.status}
                onChange={(e) => updateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                className="font-medium px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="NEW">Novo</option>
                <option value="ANALYSIS">Em Análise</option>
                <option value="IN_PROGRESS">Em Atendimento</option>
                <option value="PENDING">Pendente</option>
                <option value="RESOLVED">Resolvido</option>
                <option value="CLOSED">Fechado</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Prioridade:</span>
            {isOrgUser ? (
              <span className="font-medium text-slate-800 dark:text-slate-200">{pConf.label}</span>
            ) : (
              <select
                value={ticket.priority}
                onChange={(e) => updateTicketPriority(ticket.id, e.target.value as Priority)}
                className="font-medium px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="P1_CRITICAL">P1 - Crítico</option>
                <option value="P2_HIGH">P2 - Alto</option>
                <option value="P3_MEDIUM">P3 - Médio</option>
                <option value="P4_LOW">P4 - Baixo</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Técnico Responsável:</span>
            {isOrgUser ? (
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {ticket.assignedTechnicianName || 'Aguardando Técnico assumir'}
              </span>
            ) : (
              <select
                value={ticket.assignedTechnicianId || ''}
                onChange={(e) => assignTechnician(ticket.id, e.target.value)}
                className="font-medium px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Não atribuído (Pegar chamado)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* SLA Banner */}
        <div className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between text-xs ${sla.badgeBg} ${sla.badgeBorder}`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span className={`font-mono tabular-nums font-semibold ${sla.badgeText}`}>
              SLA: {sla.formattedRemaining}
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-80">Limite: {formatDateTime(ticket.dueResolutionAt)}</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-4 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'details' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
            }`}
          >
            Detalhes & Feedback ({ticket.comments.length})
          </button>
          {!isOrgUser && (
            <>
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'audit' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
                }`}
              >
                Auditoria ({ticketAuditLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'notifications' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
                }`}
              >
                Disparos ({ticketDispatches.length})
              </button>
            </>
          )}
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-slate-900">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">{ticket.title}</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {ticket.description}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">Solicitante</div>
                <div className="text-slate-700 dark:text-slate-300">{ticket.requesterName}</div>
                <div className="text-slate-500 font-mono text-[11px]">{ticket.requesterEmail}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">Organização & Local</div>
                <div className="text-slate-700 dark:text-slate-300">{ticket.organizationName || 'Matriz'}</div>
                <div className="text-slate-500 text-[11px]">📍 {ticket.location || 'Sede'}</div>
              </div>
            </div>

            {/* Comments / Feedback List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isOrgUser ? 'Histórico & Feedback' : 'Comentários & Notas Técnicas'}
              </h3>
              <div className="space-y-3">
                {ticket.comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex justify-between font-semibold mb-1 text-[11px]">
                      <span className="text-slate-900 dark:text-white">{c.authorName} ({c.authorRole})</span>
                      <span className="font-mono text-slate-400">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{c.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendComment} className="pt-2 space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isOrgUser
                      ? 'Escreva seu feedback ou resposta sobre o atendimento...'
                      : 'Escreva uma nota técnica ou comentário...'
                  }
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />

                <div className="flex items-center justify-between">
                  {!isOrgUser && (
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Nota Interna (visível apenas para equipe)</span>
                    </label>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 ml-auto"
                  >
                    {isOrgUser ? 'Enviar Feedback' : 'Adicionar Comentário'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'audit' && !isOrgUser && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white dark:bg-slate-900 text-xs">
            {ticketAuditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>{log.authorName} ({log.action})</span>
                  <span className="font-mono text-slate-400">{formatDateTime(log.timestamp)}</span>
                </div>
                {log.notes && <p className="text-slate-600 dark:text-slate-400">{log.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notifications' && !isOrgUser && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white dark:bg-slate-900 text-xs">
            {ticketDispatches.map((disp) => (
              <div key={disp.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>[{disp.channel}] {disp.subject}</span>
                  <span className="font-mono text-slate-400">{formatDateTime(disp.timestamp)}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{disp.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
