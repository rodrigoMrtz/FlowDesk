import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  AuditLogEntry,
  Department,
  NotificationChannel,
  NotificationDispatch,
  Organization,
  Priority,
  Technician,
  Ticket,
  TicketStatus,
  UserProfile,
  ViewMode,
} from '../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_DISPATCHES,
  INITIAL_ORGANIZATIONS,
  INITIAL_TECHNICIANS,
  INITIAL_TICKETS,
  INITIAL_USERS,
} from '../data/initialData';
import { calculateDueDates, checkTicketSLA } from '../utils/sla';
import { soundManager } from '../utils/audio';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  timestamp: string;
}

interface TicketContextType {
  currentUser: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateCurrentUser: (data: Partial<UserProfile>) => void;
  users: UserProfile[];
  addUser: (data: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  updateUser: (user: UserProfile) => void;
  deleteUser: (id: string) => void;

  organizations: Organization[];
  addOrganization: (data: Omit<Organization, 'id' | 'createdAt'>) => void;
  updateOrganization: (org: Organization) => void;
  deleteOrganization: (id: string) => void;

  technicians: Technician[];
  addTechnician: (data: Omit<Technician, 'id'>) => void;
  updateTechnician: (tech: Technician) => void;
  deleteTechnician: (id: string) => void;

  tickets: Ticket[];
  auditLogs: AuditLogEntry[];
  dispatches: NotificationDispatch[];
  selectedDepartment: Department | 'ALL';
  setSelectedDepartment: (dept: Department | 'ALL') => void;
  selectedPriority: Priority | 'ALL';
  setSelectedPriority: (priority: Priority | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  activeTicketDrawer: Ticket | null;
  setActiveTicketDrawer: (ticket: Ticket | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  isReportsModalOpen: boolean;
  setIsReportsModalOpen: (open: boolean) => void;
  activeToast: ToastAlert | null;
  dismissToast: () => void;
  unreadCount: number;

  createTicket: (data: Partial<Ticket> & { title: string; description: string; department: Department; priority: Priority; requesterName: string; requesterEmail: string; requesterPhone?: string; location?: string }) => Ticket;
  updateTicketStatus: (ticketId: string, newStatus: TicketStatus, authorName?: string) => void;
  updateTicketPriority: (ticketId: string, newPriority: Priority, authorName?: string) => void;
  assignTechnician: (ticketId: string, technicianId: string, authorName?: string) => void;
  addTicketComment: (ticketId: string, content: string, isInternal: boolean, authorName?: string) => void;
  dispatchManualNotification: (ticketId: string, channel: NotificationChannel, customSubject?: string, customBody?: string) => void;
  markNotificationAsRead: (dispatchId: string) => void;
  markAllNotificationsAsRead: () => void;
  resetAllData: () => void;
  filteredTickets: Ticket[];
}

const TicketContext = createContext<TicketContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'omnidesk_auth_user_v1',
  USERS_LIST: 'omnidesk_users_list_v1',
  ORGS: 'omnidesk_orgs_v1',
  TECH: 'omnidesk_techs_v1',
  TICKETS: 'omnidesk_tickets_v1',
  LOGS: 'omnidesk_logs_v1',
  DISPATCHES: 'omnidesk_dispatches_v1',
  THEME: 'omnidesk_darkmode_v1',
  SOUND: 'omnidesk_sound_v1',
};

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORGS);
      return saved ? JSON.parse(saved) : INITIAL_ORGANIZATIONS;
    } catch {
      return INITIAL_ORGANIZATIONS;
    }
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TECH);
      return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
    } catch {
      return INITIAL_TECHNICIANS;
    }
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [dispatches, setDispatches] = useState<NotificationDispatch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISPATCHES);
      return saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
    } catch {
      return INITIAL_DISPATCHES;
    }
  });

  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (currentUser?.role === 'admin') return 'admin_users';
    return 'kanban';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [activeTicketDrawer, setActiveTicketDrawer] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<ToastAlert | null>(null);

  const login = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    soundManager.playChime('success');
    if (user.role === 'admin') {
      setCurrentView('admin_users');
    } else {
      setCurrentView('kanban');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    soundManager.playChime('pop');
  };

  const updateCurrentUser = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    soundManager.playChime('success');
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TECH, JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPATCHES, JSON.stringify(dispatches));
  }, [dispatches]);

  // CRUD Users
  const addUser = (data: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newUser: UserProfile = {
      ...data,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    soundManager.playChime('new');
  };

  const updateUser = (user: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    soundManager.playChime('pop');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    soundManager.playChime('pop');
  };

  // CRUD Organizations
  const addOrganization = (data: Omit<Organization, 'id' | 'createdAt'>) => {
    const newOrg: Organization = {
      ...data,
      id: `org_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrganizations((prev) => [newOrg, ...prev]);
    soundManager.playChime('new');
  };

  const updateOrganization = (org: Organization) => {
    setOrganizations((prev) => prev.map((o) => (o.id === org.id ? org : o)));
    soundManager.playChime('pop');
  };

  const deleteOrganization = (id: string) => {
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
    soundManager.playChime('pop');
  };

  // CRUD Technicians
  const addTechnician = (data: Omit<Technician, 'id'>) => {
    const newTech: Technician = {
      ...data,
      id: `tech_${Date.now()}`,
    };
    setTechnicians((prev) => [newTech, ...prev]);
    addUser({
      name: newTech.name,
      email: newTech.email,
      role: 'technician',
      department: newTech.department,
      avatar: newTech.avatar,
      phone: newTech.phone,
      status: 'Active',
    });
    soundManager.playChime('new');
  };

  const updateTechnician = (tech: Technician) => {
    setTechnicians((prev) => prev.map((t) => (t.id === tech.id ? tech : t)));
    soundManager.playChime('pop');
  };

  const deleteTechnician = (id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
    soundManager.playChime('pop');
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSound = () => setSoundEnabled((prev) => !prev);
  const dismissToast = () => setActiveToast(null);

  const showToast = useCallback((title: string, message: string, channel: NotificationChannel) => {
    setActiveToast({
      id: `toast-${Date.now()}`,
      title,
      message,
      channel,
      timestamp: new Date().toISOString(),
    });
    setTimeout(() => {
      setActiveToast((current) => (current?.title === title ? null : current));
    }, 6000);
  }, []);

  const unreadCount = useMemo(() => {
    return dispatches.filter((d) => !d.read).length;
  }, [dispatches]);

  const recordAudit = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  }, []);

  const sendDispatch = useCallback((
    ticket: Ticket,
    tech: Technician | undefined,
    channel: NotificationChannel,
    triggerEvent: NotificationDispatch['triggerEvent'],
    customSubject?: string,
    customBody?: string
  ) => {
    const recipientName = tech ? tech.name : ticket.requesterName;
    const recipientContact = tech
      ? (channel === 'SMS' ? tech.phone : tech.email)
      : (channel === 'SMS' ? ticket.requesterPhone : ticket.requesterEmail);

    let subject = customSubject;
    let body = customBody;

    if (!subject) {
      if (triggerEvent === 'ASSIGNMENT') {
        subject = `[OmniDesk] Chamado Atribuído: ${ticket.code}`;
      } else if (triggerEvent === 'STATUS_CHANGE') {
        subject = `[OmniDesk] Atualização de Status: ${ticket.code} (${ticket.status})`;
      } else if (triggerEvent === 'SLA_BREACH') {
        subject = `🚨 [URGENTE - SLA VIOLADO] Chamado: ${ticket.code}`;
      } else {
        subject = `[OmniDesk Alerta] ${ticket.code} - ${ticket.title}`;
      }
    }

    if (!body) {
      body = `Notificação OmniDesk para ${ticket.code}: ${ticket.title}.`;
    }

    const newDispatch: NotificationDispatch = {
      id: `disp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ticketId: ticket.id,
      ticketCode: ticket.code,
      ticketTitle: ticket.title,
      recipientName,
      recipientContact,
      channel,
      subject,
      body,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
      read: false,
      triggerEvent,
    };

    setDispatches((prev) => [newDispatch, ...prev]);
    showToast(subject, body, channel);
  }, [showToast]);

  const createTicket = (data: Partial<Ticket> & {
    title: string;
    description: string;
    department: Department;
    priority: Priority;
    requesterName: string;
    requesterEmail: string;
    requesterPhone?: string;
    location?: string;
  }): Ticket => {
    const now = new Date();
    const departmentPrefix = data.department === 'IT' ? 'IT' : data.department === 'HR' ? 'RH' : data.department === 'MAINTENANCE' ? 'FAC' : 'SAC';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `${departmentPrefix}-${randomNum}`;
    const { dueResponseAt, dueResolutionAt } = calculateDueDates(now, data.priority);

    const userOrg = organizations.find((o) => o.id === currentUser?.organizationId);

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      code,
      title: data.title,
      description: data.description,
      department: data.department,
      category: data.category || 'Geral',
      priority: data.priority,
      status: 'NEW', // Sempre criado como Novo na fila
      requesterName: currentUser?.name || data.requesterName,
      requesterEmail: currentUser?.email || data.requesterEmail,
      requesterPhone: currentUser?.phone || data.requesterPhone || '+55 11 90000-0000',
      organizationId: currentUser?.organizationId || userOrg?.id,
      organizationName: currentUser?.organizationName || userOrg?.name,
      assignedTechnicianId: undefined, // Organização nunca atribui técnico ao abrir
      assignedTechnicianName: undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueResponseAt,
      dueResolutionAt,
      tags: data.tags || ['Novo', data.category || 'Demanda'],
      comments: [],
      location: data.location || userOrg?.locations[0] || 'Sede Principal',
      assetTag: data.assetTag,
    };

    setTickets((prev) => [newTicket, ...prev]);

    recordAudit({
      ticketId: newTicket.id,
      ticketCode: newTicket.code,
      authorName: newTicket.requesterName,
      authorRole: currentUser?.role === 'org_user' ? 'Cliente (Organização)' : 'Solicitante',
      action: 'CREATED',
      notes: `Chamado registrado na fila do departamento ${data.department} com prioridade ${data.priority}.`,
    });

    soundManager.playChime(data.priority === 'P1_CRITICAL' ? 'urgent' : 'new');

    return newTicket;
  };

  // STRICT RULE: org_user CANNOT change status
  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus, authorName: string = currentUser?.name || 'Analista') => {
    if (currentUser?.role === 'org_user') {
      return; // Usuários de organização não podem alterar status de chamados
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    const oldStatus = ticket.status;
    const nowIso = new Date().toISOString();
    const isResolving = newStatus === 'RESOLVED' || newStatus === 'CLOSED';

    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: nowIso,
          resolvedAt: isResolving && !t.resolvedAt ? nowIso : t.resolvedAt,
        };
      }
      return t;
    });

    setTickets(updatedTickets);

    recordAudit({
      ticketId,
      ticketCode: ticket.code,
      authorName,
      authorRole: currentUser?.role === 'technician' ? 'Técnico Responsável' : 'Administrador',
      action: 'STATUS_CHANGED',
      fieldChanged: 'Status',
      oldValue: oldStatus,
      newValue: newStatus,
    });

    soundManager.playChime(isResolving ? 'success' : 'pop');
  };

  // STRICT RULE: org_user CANNOT change priority
  const updateTicketPriority = (ticketId: string, newPriority: Priority, authorName: string = currentUser?.name || 'Admin') => {
    if (currentUser?.role === 'org_user') return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.priority === newPriority) return;

    const oldPriority = ticket.priority;
    const now = new Date();
    const { dueResponseAt, dueResolutionAt } = calculateDueDates(now, newPriority);

    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          priority: newPriority,
          dueResponseAt,
          dueResolutionAt,
          updatedAt: now.toISOString(),
        };
      }
      return t;
    });

    setTickets(updatedTickets);

    recordAudit({
      ticketId,
      ticketCode: ticket.code,
      authorName,
      authorRole: currentUser?.role || 'Admin',
      action: 'PRIORITY_CHANGED',
      fieldChanged: 'Prioridade',
      oldValue: oldPriority,
      newValue: newPriority,
    });

    soundManager.playChime(newPriority === 'P1_CRITICAL' ? 'urgent' : 'warning');
  };

  // STRICT RULE: org_user CANNOT assign technicians
  const assignTechnician = (ticketId: string, technicianId: string, authorName: string = currentUser?.name || 'Supervisor') => {
    if (currentUser?.role === 'org_user') return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const oldTechName = ticket.assignedTechnicianName || 'Não atribuído';
    const newTech = technicians.find((t) => t.id === technicianId);
    if (!newTech) return;

    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignedTechnicianId: newTech.id,
          assignedTechnicianName: newTech.name,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTickets(updatedTickets);

    recordAudit({
      ticketId,
      ticketCode: ticket.code,
      authorName,
      authorRole: currentUser?.role || 'Supervisor',
      action: 'ASSIGNED',
      fieldChanged: 'Técnico',
      oldValue: oldTechName,
      newValue: newTech.name,
    });

    soundManager.playChime('pop');
    sendDispatch(ticket, newTech, 'PUSH', 'ASSIGNMENT');
  };

  const addTicketComment = (ticketId: string, content: string, isInternal: boolean, authorName: string = currentUser?.name || 'Usuário') => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !content.trim()) return;

    // Org users cannot add internal notes
    const forceInternal = currentUser?.role === 'org_user' ? false : isInternal;

    const newComment = {
      id: `comm-${Date.now()}`,
      ticketId,
      authorName,
      authorRole: currentUser?.role === 'org_user' ? 'Cliente / Feedback' : currentUser?.role === 'technician' ? 'Técnico' : 'Administrador',
      isInternal: forceInternal,
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          comments: [...t.comments, newComment],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTickets(updatedTickets);

    recordAudit({
      ticketId,
      ticketCode: ticket.code,
      authorName,
      authorRole: currentUser?.role || 'Usuário',
      action: 'COMMENT_ADDED',
      notes: forceInternal ? 'Nota técnica interna adicionada.' : 'Comentário ou feedback adicionado.',
    });

    soundManager.playChime('pop');
  };

  const dispatchManualNotification = (
    ticketId: string,
    channel: NotificationChannel,
    customSubject?: string,
    customBody?: string
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const tech = technicians.find((t) => t.id === ticket.assignedTechnicianId);
    sendDispatch(ticket, tech, channel, 'STATUS_CHANGE', customSubject, customBody);
    soundManager.playChime('new');
  };

  const markNotificationAsRead = (dispatchId: string) => {
    setDispatches((prev) => prev.map((d) => (d.id === dispatchId ? { ...d, read: true } : d)));
  };

  const markAllNotificationsAsRead = () => {
    setDispatches((prev) => prev.map((d) => ({ ...d, read: true })));
  };

  const resetAllData = () => {
    setTickets(INITIAL_TICKETS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDispatches(INITIAL_DISPATCHES);
    setUsers(INITIAL_USERS);
    setOrganizations(INITIAL_ORGANIZATIONS);
    setTechnicians(INITIAL_TECHNICIANS);
    soundManager.playChime('success');
  };

  // Filtered tickets based on strict role relationships
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (currentUser?.role === 'org_user') {
        // Usuário de organização só vê os chamados criados por ele próprio
        if (ticket.requesterEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
          return false;
        }
      } else if (currentUser?.role === 'technician') {
        // Técnico vê chamados do seu departamento ou atribuídos a ele
        const techRecord = technicians.find((t) => t.email.toLowerCase() === currentUser.email.toLowerCase());
        const matchDept = techRecord ? ticket.department === techRecord.department : true;
        if (!matchDept) return false;
      }

      const matchDept = selectedDepartment === 'ALL' || ticket.department === selectedDepartment;
      const matchPriority = selectedPriority === 'ALL' || ticket.priority === selectedPriority;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ticket.code.toLowerCase().includes(q) ||
        ticket.title.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q) ||
        ticket.requesterName.toLowerCase().includes(q) ||
        (ticket.assignedTechnicianName && ticket.assignedTechnicianName.toLowerCase().includes(q)) ||
        ticket.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchDept && matchPriority && matchSearch;
    });
  }, [tickets, selectedDepartment, selectedPriority, searchQuery, currentUser, technicians]);

  return (
    <TicketContext.Provider
      value={{
        currentUser,
        login,
        logout,
        updateCurrentUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        organizations,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        technicians,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        tickets,
        auditLogs,
        dispatches,
        selectedDepartment,
        setSelectedDepartment,
        selectedPriority,
        setSelectedPriority,
        searchQuery,
        setSearchQuery,
        currentView,
        setCurrentView,
        darkMode,
        toggleDarkMode,
        soundEnabled,
        toggleSound,
        activeTicketDrawer,
        setActiveTicketDrawer,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        isReportsModalOpen,
        setIsReportsModalOpen,
        activeToast,
        dismissToast,
        unreadCount,
        createTicket,
        updateTicketStatus,
        updateTicketPriority,
        assignTechnician,
        addTicketComment,
        dispatchManualNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetAllData,
        filteredTickets,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicketContext = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicketContext must be used within a TicketProvider');
  }
  return context;
};
