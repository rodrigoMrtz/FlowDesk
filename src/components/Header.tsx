import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  FileSpreadsheet,
  Headphones,
  Kanban,
  List,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  Volume2,
  VolumeX,
  Users,
  Building2,
  Wrench,
  LogOut,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import { useTicketContext } from '../context/TicketContext';
import { Department, ViewMode } from '../types';
import { DEPARTMENTS } from '../data/initialData';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    currentView,
    setCurrentView,
    selectedDepartment,
    setSelectedDepartment,
    unreadCount,
    setIsNotificationCenterOpen,
    setIsCreateModalOpen,
    setIsReportsModalOpen,
    darkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
  } = useTicketContext();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Wordmark & Brand Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            OmniDesk
          </span>
          <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 font-mono">
            {isAdmin ? 'Admin Portal' : currentUser?.role === 'technician' ? 'Painel Técnico' : 'Portal do Cliente'}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links & View Switchers */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
        {isAdmin ? (
          <>
            <button
              onClick={() => setCurrentView('admin_users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentView === 'admin_users'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Usuários
            </button>
            <button
              onClick={() => setCurrentView('admin_orgs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentView === 'admin_orgs'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              Organizações
            </button>
            <button
              onClick={() => setCurrentView('admin_technicians')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentView === 'admin_technicians'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-500" />
              Técnicos
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Ver Chamados
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban Fluxo
            </button>

            <button
              onClick={() => setCurrentView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentView === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista Geral
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Métricas & SLA
            </button>

            <button
              onClick={() => {
                setCurrentView('reports');
                setIsReportsModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                currentView === 'reports'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Relatórios & Exportar
            </button>
          </>
        )}
      </nav>

      {/* Zone 3: Actions & Clean User Dropdown */}
      <div className="flex items-center gap-3 shrink-0">
        {!isAdmin && (
          <div className="hidden md:block">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as Department | 'ALL')}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">🏢 Todos Departamentos</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Silenciar alertas sonoros' : 'Ativar alertas sonoros'}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          onClick={() => setIsNotificationCenterOpen(true)}
          className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Central de Notificações"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Chamado</span>
        </button>

        {/* Clean User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-2 py-1 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <img src={currentUser?.avatar} alt={currentUser?.name} className="w-7 h-7 rounded-full object-cover shadow-xs" />
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[110px]">{currentUser?.name}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in-50 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                <div className="font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{currentUser?.email}</div>
                <div className="text-[10px] text-blue-500 font-semibold uppercase pt-1">
                  Perfil: {currentUser?.role} {currentUser?.organizationName ? `· ${currentUser.organizationName}` : ''}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setCurrentView('profile');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-left border-b border-slate-100 dark:border-slate-800"
                >
                  <UserIcon className="w-4 h-4 text-blue-500" />
                  <span>Meu Perfil</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Sistema (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
