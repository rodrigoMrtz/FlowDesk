import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Inbox,
  Mail,
  MessageSquare,
  Play,
  Send,
  Smartphone,
  Sparkles,
  Volume2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { NotificationChannel, NotificationDispatch } from '../types';
import { formatDateTime, formatTimeAgo } from '../utils/sla';

export const NotificationCenterModal: React.FC = () => {
  const {
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    dispatches,
    tickets,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dispatchManualNotification,
  } = useTicketContext();

  const [activeTab, setActiveTab] = useState<'feed' | 'simulator' | 'preview'>('feed');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<NotificationChannel | 'ALL'>('ALL');

  // Simulator state
  const [simulatorTicketId, setSimulatorTicketId] = useState<string>(tickets[0]?.id || '');
  const [simulatorChannel, setSimulatorChannel] = useState<NotificationChannel>('SMS');
  const [simulatorTemplate, setSimulatorTemplate] = useState<'ASSIGNMENT' | 'SLA_BREACH' | 'SLA_WARNING' | 'CUSTOM'>('SLA_BREACH');
  const [customMsg, setCustomMsg] = useState<string>('');

  // Preview state
  const [previewDispatch, setPreviewDispatch] = useState<NotificationDispatch | null>(
    dispatches[0] || null
  );

  if (!isNotificationCenterOpen) return null;

  const filteredDispatches = dispatches.filter((d) => {
    if (selectedChannelFilter === 'ALL') return true;
    return d.channel === selectedChannelFilter;
  });

  const handleRunSimulator = () => {
    if (!simulatorTicketId) return;
    const ticket = tickets.find((t) => t.id === simulatorTicketId);
    if (!ticket) return;

    let subject = '';
    let body = '';

    if (simulatorTemplate === 'SLA_BREACH') {
      subject = `🚨 [URGENTE - SLA VIOLADO] ${ticket.code}`;
      body = `ATENÇÃO: O chamado ${ticket.code} ultrapassou o tempo estipulado de SLA. Solicitamos priorização imediata na fila de atendimento!`;
    } else if (simulatorTemplate === 'SLA_WARNING') {
      subject = `⚠️ [Atenção ao SLA] ${ticket.code}`;
      body = `Aviso: Resta menos de 1 hora para vencimento do SLA do chamado ${ticket.code}.`;
    } else if (simulatorTemplate === 'ASSIGNMENT') {
      subject = `[OmniDesk] Novo Chamado Atribuído: ${ticket.code}`;
      body = `Você foi atribuído ao chamado ${ticket.code} - ${ticket.title}.`;
    } else {
      subject = `[Alerta Personalizado] ${ticket.code}`;
      body = customMsg || `Alerta manual enviado para a equipe responsável por ${ticket.code}.`;
    }

    dispatchManualNotification(ticket.id, simulatorChannel, subject, body);
    setActiveTab('feed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] sm:h-[650px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Central de Notificações
                <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-medium">
                  Push · SMS · E-mail
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Disparos em tempo real para os técnicos e gestores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Marcar lidas
            </button>
            <button
              onClick={() => setIsNotificationCenterOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Feed ({dispatches.length})
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Simulador
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Preview Dispositivo
            </button>
          </div>

          {activeTab === 'feed' && (
            <div className="hidden sm:flex items-center gap-1">
              {(['ALL', 'PUSH', 'SMS', 'EMAIL'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannelFilter(ch)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    selectedChannelFilter === ch
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {ch === 'ALL' ? 'Todos' : ch}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Feed */}
        {activeTab === 'feed' && (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filteredDispatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                <Inbox className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">Nenhum disparo encontrado.</p>
              </div>
            ) : (
              filteredDispatches.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    markNotificationAsRead(item.id);
                    setPreviewDispatch(item);
                  }}
                  className={`flex items-start justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    !item.read ? 'bg-blue-50/20 dark:bg-blue-950/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        item.channel === 'SMS'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : item.channel === 'EMAIL'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {item.channel === 'SMS' && <Smartphone className="w-4 h-4" />}
                      {item.channel === 'EMAIL' && <Mail className="w-4 h-4" />}
                      {item.channel === 'PUSH' && <Bell className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {item.ticketCode}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">
                          {item.channel}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          {item.recipientName}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.subject}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {item.body}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                    <span className="text-[11px] font-mono tabular-nums text-slate-400">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                    {!item.read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Simulator */}
        {activeTab === 'simulator' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white dark:bg-slate-900">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Simulador de Alertas em Tempo Real
              </div>
              Teste o envio de notificações Push, SMS e E-mail para os técnicos.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chamado de Teste
                </label>
                <select
                  value={simulatorTicketId}
                  onChange={(e) => setSimulatorTicketId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.title.slice(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Canal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SMS', 'EMAIL', 'PUSH'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSimulatorChannel(ch)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                        simulatorChannel === ch
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Gatilho
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSimulatorTemplate('SLA_BREACH')}
                  className={`p-3 text-left rounded-xl border text-xs transition-all ${
                    simulatorTemplate === 'SLA_BREACH'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 ring-1 ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-semibold text-rose-600 dark:text-rose-400">SLA Violado</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorTemplate('SLA_WARNING')}
                  className={`p-3 text-left rounded-xl border text-xs transition-all ${
                    simulatorTemplate === 'SLA_WARNING'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-semibold text-amber-600 dark:text-amber-400">Atenção ao SLA</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorTemplate('ASSIGNMENT')}
                  className={`p-3 text-left rounded-xl border text-xs transition-all ${
                    simulatorTemplate === 'ASSIGNMENT'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-semibold text-blue-600 dark:text-blue-400">Atribuição</div>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunSimulator}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Disparar Alerta Imediato
            </button>
          </div>
        )}

        {/* Tab 3: Preview */}
        {activeTab === 'preview' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col sm:flex-row items-center justify-center gap-8 bg-slate-100 dark:bg-slate-950">
            <div className="w-64 h-[380px] bg-slate-900 rounded-[32px] border-4 border-slate-700 shadow-xl p-3 flex flex-col">
              <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-2" />
              <div className="flex-1 overflow-y-auto p-2 bg-slate-950 rounded-2xl text-[11px] text-slate-200 space-y-2">
                <div className="font-bold text-blue-400 text-[10px]">PUSH NOTIFICATION</div>
                <div>{previewDispatch?.body || 'Alerta OmniDesk'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
