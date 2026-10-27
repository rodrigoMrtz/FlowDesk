export type Priority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export type TicketStatus = 'NEW' | 'ANALYSIS' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';

export type Department = 'IT' | 'HR' | 'MAINTENANCE' | 'CUSTOMER_SUPPORT';

export type NotificationChannel = 'EMAIL' | 'PUSH' | 'SMS';

export type UserRole = 'admin' | 'technician' | 'org_user';

export interface Organization {
  id: string;
  name: string;
  cnpj: string;
  plan: 'Enterprise' | 'Professional' | 'Standard';
  status: 'Active' | 'Inactive';
  contactEmail: string;
  locations: string[]; // Salas e locais da organização gerenciados pelo admin
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  department?: Department;
  avatar: string;
  phone: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface SLAConfig {
  responseHours: number;
  resolutionHours: number;
  label: string;
}

export interface Technician {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: Department;
  avatar: string;
  activeTicketsCount: number;
  resolvedTicketsCount: number;
  avgResolutionHours: number;
  rating: number; // 1 to 5
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorName: string;
  authorRole: string;
  isInternal: boolean;
  content: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  ticketId: string;
  ticketCode: string;
  timestamp: string; // ISO string
  authorName: string;
  authorRole: string;
  action: 'CREATED' | 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'ASSIGNED' | 'COMMENT_ADDED' | 'SLA_BREACH' | 'SLA_WARNING' | 'UPDATED' | 'USER_CREATED' | 'USER_UPDATED' | 'ORG_CREATED';
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
}

export interface NotificationDispatch {
  id: string;
  ticketId: string;
  ticketCode: string;
  ticketTitle: string;
  recipientName: string;
  recipientContact: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED';
  read: boolean;
  triggerEvent: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'PRIORITY_CHANGE' | 'SLA_WARNING' | 'SLA_BREACH' | 'COMMENT';
}

export interface Ticket {
  id: string;
  code: string; // ex: "IT-1042", "HR-208"
  title: string;
  description: string;
  department: Department;
  category: string;
  priority: Priority;
  status: TicketStatus;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  organizationId?: string;
  organizationName?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  dueResponseAt: string; // ISO
  dueResolutionAt: string; // ISO
  respondedAt?: string;
  resolvedAt?: string;
  tags: string[];
  comments: TicketComment[];
  location?: string;
  assetTag?: string;
}

export type SLAStatusType = 'HEALTHY' | 'WARNING' | 'BREACHED' | 'RESOLVED_ON_TIME' | 'RESOLVED_LATE';

export interface SLACheckResult {
  status: SLAStatusType;
  remainingMinutes: number;
  formattedRemaining: string;
  percentElapsed: number;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  isBreached: boolean;
}

export type ViewMode = 'kanban' | 'list' | 'dashboard' | 'reports' | 'admin_users' | 'admin_orgs' | 'admin_technicians';
