import { Priority, SLAConfig, SLACheckResult, Ticket } from '../types';

export const SLA_MATRIX: Record<Priority, SLAConfig> = {
  P1_CRITICAL: {
    responseHours: 1,
    resolutionHours: 4,
    label: 'P1 - Crítico (4h)',
  },
  P2_HIGH: {
    responseHours: 2,
    resolutionHours: 12,
    label: 'P2 - Alto (12h)',
  },
  P3_MEDIUM: {
    responseHours: 8,
    resolutionHours: 24,
    label: 'P3 - Médio (24h)',
  },
  P4_LOW: {
    responseHours: 24,
    resolutionHours: 48,
    label: 'P4 - Baixo (48h)',
  },
};

export function calculateDueDates(createdAt: Date, priority: Priority) {
  const config = SLA_MATRIX[priority] || SLA_MATRIX.P3_MEDIUM;
  const dueResponseAt = new Date(createdAt.getTime() + config.responseHours * 60 * 60 * 1000);
  const dueResolutionAt = new Date(createdAt.getTime() + config.resolutionHours * 60 * 60 * 1000);
  return {
    dueResponseAt: dueResponseAt.toISOString(),
    dueResolutionAt: dueResolutionAt.toISOString(),
  };
}

export function checkTicketSLA(ticket: Ticket, now: Date = new Date()): SLACheckResult {
  const isResolvedOrClosed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const targetDate = new Date(ticket.dueResolutionAt);
  const createdDate = new Date(ticket.createdAt);

  if (isResolvedOrClosed) {
    const resolvedDate = ticket.resolvedAt ? new Date(ticket.resolvedAt) : now;
    const isLate = resolvedDate.getTime() > targetDate.getTime();
    return {
      status: isLate ? 'RESOLVED_LATE' : 'RESOLVED_ON_TIME',
      remainingMinutes: 0,
      formattedRemaining: isLate ? 'Resolvido c/ atraso' : 'Resolvido no prazo',
      percentElapsed: 100,
      label: isLate ? 'SLA Violado' : 'Concluído no Prazo',
      badgeBg: isLate ? 'bg-rose-500/10' : 'bg-emerald-500/10',
      badgeText: isLate ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
      badgeBorder: isLate ? 'border-rose-500/20' : 'border-emerald-500/20',
      isBreached: isLate,
    };
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const totalDurationMs = targetDate.getTime() - createdDate.getTime();
  const elapsedMs = Math.max(0, now.getTime() - createdDate.getTime());
  const percentElapsed = Math.min(100, Math.round((elapsedMs / (totalDurationMs || 1)) * 100));

  const remainingMinutes = Math.round(diffMs / (60 * 1000));

  if (diffMs <= 0) {
    const overdueMinutes = Math.abs(remainingMinutes);
    const hours = Math.floor(overdueMinutes / 60);
    const mins = overdueMinutes % 60;
    const formatted = hours > 0 ? `+${hours}h ${mins}m atrasado` : `+${mins}m atrasado`;

    return {
      status: 'BREACHED',
      remainingMinutes,
      formattedRemaining: formatted,
      percentElapsed: 100,
      label: 'SLA Estourado',
      badgeBg: 'bg-red-500/15',
      badgeText: 'text-red-600 dark:text-red-400 font-semibold',
      badgeBorder: 'border-red-500/30',
      isBreached: true,
    };
  }

  // Warning when less than 30% of time remaining or less than 1 hour
  const isWarning = remainingMinutes <= 60 || percentElapsed >= 75;

  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  const formatted = hours > 0 ? `${hours}h ${mins}m restantes` : `${mins}m restantes`;

  if (isWarning) {
    return {
      status: 'WARNING',
      remainingMinutes,
      formattedRemaining: formatted,
      percentElapsed,
      label: 'Atenção ao SLA',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-700 dark:text-amber-400 font-medium',
      badgeBorder: 'border-amber-500/30',
      isBreached: false,
    };
  }

  return {
    status: 'HEALTHY',
    remainingMinutes,
    formattedRemaining: formatted,
    percentElapsed,
    label: 'Dentro do Prazo',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    isBreached: false,
  };
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatTimeAgo(isoString: string): string {
  try {
    const past = new Date(isoString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Agora mesmo';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Há ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} d`;
  } catch {
    return 'Recentemente';
  }
}
