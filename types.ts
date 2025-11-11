export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export type TeamName = 'High Velocity' | 'Agency' | 'Verticals' | 'BroadlyDuda';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  team?: TeamName;
  password?: string;
}

export enum TaskStatus {
  OPEN = 'Open',
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  QA_REVIEW = 'QA Review',
  WAITING_ON_CUSTOMER = 'Waiting on Customer',
  COMPLETED = 'Completed',
}

export enum TimerState {
  STOPPED = 'stopped',
  RUNNING = 'running',
  PAUSED = 'paused',
}

// A "Task" is now referred to as a "Submission" in the UI
export interface Submission {
  id: string;
  title: string; // PID/AGID/Project Name
  projectType: string;
  submitterName: string;
  developerId: string | null;
  buildDueDate: string | null;
  devTaskHours: number | null;
  qaId: string | null;
  qaDueDate: string | null;
  qaTaskHours: number | null;
  team: TeamName;
  status: TaskStatus;
  createdDate: string;
  loggedHours?: number;
  // Timer related fields
  timerState: TimerState;
  timerStartTime: number | null; // Timestamp when the timer was last started/resumed
  lastTick: number; // The timestamp of the last time elapsed time was calculated
  pauseReason?: string;

  // New fields for CSV import
  projectPartnerName?: string;
  projectPartnerId?: string;
  projectAccountName?: string;
  projectAccountId?: string;
  projectStatus?: string;
  taskTitle?: string;
}

export interface TeamMember {
  name: string;
  buddy: string;
  notes: string;
}

export interface TeamStructure {
  name: TeamName;
  lead: string;
  buildTeam: TeamMember[];
  qaTeam: TeamMember[];
}

export interface SubmissionStats {
    today: number;
    total: number;
}

// NEW: For Error Log Dashboard
export interface ErrorLog {
  id: string;
  submissionId: string;
  description: string;
  reportedById: string;
  timestamp: string;
}

// UPDATED: For Metrics Dashboard to support daily/weekly tracking
export interface UserMetric {
  id: string;
  userId: string;
  timestamp: number; // Unix timestamp for precise timing
  hours: number;
}

// NEW: For DMS Dashboard
export interface DmsDocument {
  id: string;
  title: string;
  content: string;
  authorId: string;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  userId: string; // The user who should see this notification
  text: string;
  timestamp: string;
  read: boolean;
}