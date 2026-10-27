import React, { useEffect, useState } from 'react';
import { Clock, MessageSquare, AlertCircle, History } from 'lucide-react';
import { Ticket } from '../types';
import { PRIORITY_CONFIG } from '../data/initialData';
import { checkTicketSLA } from '../utils/sla';
import { useTicketContext } from '../context/TicketContext';

interface TicketCardProps {
  ticket: Ticket;
  onDragStart: (e: React.DragEvent, ticketId: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onDragStart }) => {
  const { setActiveTicketDrawer, auditLogs } = useTicketContext();
  const [slaResult, setSlaResult] = useState(() => checkTicketSLA(ticket));

  // Count audit logs for this ticket
  const ticketAuditCount = auditLogs.filter((l) => l.ticketId === ticket.id).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setSlaResult(checkTicketSLA(ticket));
    }, 10000);
    return () => clearInterval(timer);
  }, [ticket]);

  const priorityConf = PRIORITY_CONFIG[ticket.priority];

  const departmentShort =
    ticket.department === 'IT'
      ? 'TI & Infra'
      : ticket.department === 'HR'
      ? 'Recursos Humanos'
      : ticket.department === 'MAINTENANCE'
      ? 'Manutenção'
      : 'Atendimento';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={() => setActiveTicketDrawer(ticket)}
      className="group relative p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top row: Code + Priority + Department */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
            {ticket.code}
          </span>
          <span aria-hidden="true">·</span>
          <span>{departmentShort}</span>
        </div>

        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${priorityConf.badge}`}>
          {priorityConf.label.split(' - ')[0]}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {ticket.title}
      </h4>

      {/* Description Snippet */}
      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
        {ticket.description}
      </p>

      {/* SLA Status Bar */}
      <div
        className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs mb-3 ${slaResult.badgeBg} ${slaResult.badgeBorder}`}
      >
        <div className="flex items-center gap-1.5">
          {slaResult.isBreached ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          )}
          <span className={`text-[11px] font-mono tabular-nums ${slaResult.badgeText}`}>
            {slaResult.formattedRemaining}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          {slaResult.label}
        </span>
      </div>

      {/* Footer: Requester & Assignee & Audit Count */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[100px]" title={`Solicitante: ${ticket.requesterName}`}>
            {ticket.requesterName.split(' ')[0]}
          </span>
          {/* Audit trail badge */}
          <div
            className="flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            title={`${ticketAuditCount} eventos na trilha de auditoria`}
          >
            <History className="w-3 h-3 text-blue-500" />
            <span>{ticketAuditCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ticket.comments.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MessageSquare className="w-3 h-3" />
              <span>{ticket.comments.length}</span>
            </div>
          )}

          {ticket.assignedTechnicianName ? (
            <div
              className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
              title={`Atribuído a: ${ticket.assignedTechnicianName}`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                {ticket.assignedTechnicianName.charAt(0)}
              </div>
              <span className="truncate max-w-[80px]">
                {ticket.assignedTechnicianName.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
              Aguardando Técnico
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
