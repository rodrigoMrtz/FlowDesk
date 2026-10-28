import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { Priority, TicketStatus } from '../types';
import { TicketCard } from './TicketCard';
import { checkTicketSLA } from '../utils/sla';

interface KanbanColumn {
  id: TicketStatus;
  title: string;
  badgeColor: string;
  dotColor: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'NEW', title: 'Novos', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', dotColor: 'bg-blue-500' },
  { id: 'ANALYSIS', title: 'Triagem', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', dotColor: 'bg-purple-500' },
  { id: 'IN_PROGRESS', title: 'Atendimento', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dotColor: 'bg-amber-500' },
  { id: 'PENDING', title: 'Pendente', badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', dotColor: 'bg-orange-500' },
  { id: 'RESOLVED', title: 'Resolvidos', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dotColor: 'bg-emerald-500' },
  { id: 'CLOSED', title: 'Fechados', badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', dotColor: 'bg-slate-500' },
];

export const KanbanBoard: React.FC = () => {
  const {
    filteredTickets,
    updateTicketStatus,
    setIsCreateModalOpen,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
  } = useTicketContext();

  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<TicketStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData('text/plain', ticketId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTicketId(ticketId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TicketStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = (colId: TicketStatus) => {
    if (activeDropCol === colId) {
      setActiveDropCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: TicketStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain') || draggedTicketId;
    if (ticketId) {
      updateTicketStatus(ticketId, colId);
    }
    setActiveDropCol(null);
    setDraggedTicketId(null);
  };

  const breachedCount = filteredTickets.filter((t) => {
    const sla = checkTicketSLA(t);
    return sla.isBreached && t.status !== 'RESOLVED' && t.status !== 'CLOSED';
  }).length;

  const warningCount = filteredTickets.filter((t) => {
    const sla = checkTicketSLA(t);
    return sla.status === 'WARNING' && t.status !== 'RESOLVED' && t.status !== 'CLOSED';
  }).length;

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, título, solicitante..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shrink-0">
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
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {filteredTickets.length}
            </span>
            <span>chamados</span>
          </div>

          {warningCount > 0 && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="tabular-nums font-medium">{warningCount} risco</span>
            </div>
          )}

          {breachedCount > 0 && (
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="tabular-nums font-semibold">{breachedCount} violados</span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Columns Grid - Responsive grid layout fitting the screen width without forced horizontal overflow */}
      <div className="flex-1 overflow-x-auto lg:overflow-x-hidden p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 h-full min-w-[1100px] xl:min-w-0">
          {COLUMNS.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col.id);
            const isDropActive = activeDropCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => handleDragLeave(col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border transition-all duration-150 h-full max-h-full ${
                  isDropActive
                    ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200/70 dark:border-slate-800/70'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                    <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
                      {col.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                      {colTickets.length}
                    </span>
                    {col.id === 'NEW' && (
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        title="Criar novo chamado"
                        className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                  {colTickets.length === 0 ? (
                    <div className="h-24 flex flex-col items-center justify-center border border-dashed border-slate-300/80 dark:border-slate-800 rounded-xl text-center p-3">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Nenhum chamado
                      </p>
                    </div>
                  ) : (
                    colTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
