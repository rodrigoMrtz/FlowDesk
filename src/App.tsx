import React from 'react';
import { TicketProvider, useTicketContext } from './context/TicketContext';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { Dashboard } from './components/Dashboard';
import { AdminUsersView } from './components/AdminUsersView';
import { AdminOrgsView } from './components/AdminOrgsView';
import { AdminTechniciansView } from './components/AdminTechniciansView';
import { TicketDetailModal } from './components/TicketDetailModal';
import { CreateTicketModal } from './components/CreateTicketModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ReportsModal } from './components/ReportsModal';
import { ToastNotification } from './components/ToastNotification';
import { LoginScreen } from './components/LoginScreen';
import { UserProfileView } from './components/UserProfileView';

const AppContent: React.FC = () => {
  const { currentUser, currentView } = useTicketContext();

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'kanban' && <KanbanBoard />}
        {currentView === 'list' && <ListView />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'reports' && <Dashboard />}
        {currentView === 'admin_users' && <AdminUsersView />}
        {currentView === 'admin_orgs' && <AdminOrgsView />}
        {currentView === 'admin_technicians' && <AdminTechniciansView />}
        {currentView === 'profile' && <UserProfileView />}
      </main>

      {/* Floating Overlays & Modals */}
      <TicketDetailModal />
      <CreateTicketModal />
      <NotificationCenterModal />
      <ReportsModal />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <TicketProvider>
      <AppContent />
    </TicketProvider>
  );
}
