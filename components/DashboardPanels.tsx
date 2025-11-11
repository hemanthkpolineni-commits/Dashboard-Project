
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Submission, TeamStructure, TeamName, SubmissionStats, User, UserRole, UserMetric, TaskStatus, Notification, TimerState } from '../types';
import { dataService } from '../data';
import { Card, Button, Modal, Input, Select, Table, Thead, Tbody, Tr, Th, Td, IconCalendar, ProgressBar, IconFileText, IconPlus, IconAlertTriangle, IconBarChart, IconUserPlus, IconClipboardList, IconRefreshCw, IconAlertCircle, IconTrendingUp, IconUpload, IconEdit, IconBell, DatePicker, IconPlay, IconStop, IconPause, IconClock, IconCheckCircle, IconDownload, IconTrash, IconBriefcase, StatusBadge } from './ui';
import { format, formatDistanceToNow, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";


// Outlet context type
interface OutletContextType {
  user: User;
  tick: number; // A number that updates every second
}

// Define the exact headers from user request for CSV import
const CSV_HEADERS = {
    PARTNER_NAME: 'project partner name',
    PARTNER_ID: 'project partner id',
    ACCOUNT_NAME: 'project account name',
    ACCOUNT_ID: 'project account id',
    PROJECT_TITLE: 'project title',
    PROJECT_STATUS: 'project status',
    TASK_TITLE: 'task title',
    ASSIGNEE_NAME: 'task assignee full name',
    TASK_STATUS: 'task status',
    CREATED_DATE: 'task created date',
    DUE_DATE: 'task due date',
    TEAM: 'team'
};


// === SUBMISSION MODAL (for Add/Edit) ===
const SubmissionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    user: User;
    submissionToEdit?: Submission | null;
}> = ({ isOpen, onClose, onSave, user, submissionToEdit }) => {
    const isEditMode = !!submissionToEdit;
    
    // Form States
    const [title, setTitle] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [projectPartnerName, setProjectPartnerName] = useState('');
    const [projectPartnerId, setProjectPartnerId] = useState('');
    const [projectAccountName, setProjectAccountName] = useState('');
    const [projectAccountId, setProjectAccountId] = useState('');
    const [projectStatus, setProjectStatus] = useState('');
    const [developerId, setDeveloperId] = useState<string | ''>('');
    const [buildDueDate, setBuildDueDate] = useState<string | null>(null);
    const [team, setTeam] = useState<TeamName | ''>(user.role === UserRole.USER ? user.team || '' : '');
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.PENDING);
    const [createdDate, setCreatedDate] = useState<string | null>(null);

    const submitterName = useMemo(() => isEditMode ? submissionToEdit.submitterName : user.name, [isEditMode, submissionToEdit, user.name]);
    const preselectedTeam = user.role === UserRole.USER ? user.team : undefined;
    
    const developers = useMemo(() => {
        if (!team) return [];
        const allUsers = dataService.getUsers();
        return allUsers.filter(u => u.team === team && u.role === UserRole.USER);
    }, [team]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && submissionToEdit) {
                setTitle(submissionToEdit.title);
                setTaskTitle(submissionToEdit.taskTitle || '');
                setProjectPartnerName(submissionToEdit.projectPartnerName || '');
                setProjectPartnerId(submissionToEdit.projectPartnerId || '');
                setProjectAccountName(submissionToEdit.projectAccountName || '');
                setProjectAccountId(submissionToEdit.projectAccountId || '');
                setProjectStatus(submissionToEdit.projectStatus || '');
                setDeveloperId(submissionToEdit.developerId || '');
                setBuildDueDate(submissionToEdit.buildDueDate || null);
                setTeam(submissionToEdit.team);
                setStatus(submissionToEdit.status);
                setCreatedDate(submissionToEdit.createdDate || null);
            } else {
                // Reset all fields for a new submission
                setTitle('');
                setTaskTitle('');
                setProjectPartnerName('');
                setProjectPartnerId('');
                setProjectAccountName('');
                setProjectAccountId('');
                setProjectStatus('');
                setDeveloperId('');
                setBuildDueDate(null);
                setTeam(user.role === UserRole.USER ? user.team || '' : '');
                setStatus(TaskStatus.PENDING);
                setCreatedDate(format(new Date(), 'yyyy-MM-dd'));
            }
        }
    }, [isOpen, submissionToEdit, isEditMode, user]);
    
    const handleSubmit = () => {
        if (!title || !team) {
            alert('Please fill all required fields: Project Title, and Team.');
            return;
        }
        
        const submissionData = {
            title,
            taskTitle,
            projectPartnerName,
            projectPartnerId,
            projectAccountName,
            projectAccountId,
            projectStatus,
            projectType: taskTitle, // Keep projectType in sync with taskTitle for data model
            submitterName,
            developerId: developerId || null,
            buildDueDate: buildDueDate,
            team,
            status,
            createdDate: createdDate,
        };

        if (isEditMode && submissionToEdit) {
            dataService.updateSubmission(submissionToEdit.id, submissionData);
        } else {
            dataService.addSubmission(submissionData);
        }
        
        onSave();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Submission" : "Add Submission"}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Project Title</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., PID123" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Task Title</label>
                        <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g., Homepage build" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Project Partner Name</label>
                        <Input value={projectPartnerName} onChange={e => setProjectPartnerName(e.target.value)} placeholder="Partner Name"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary">Project Partner ID</label>
                        <Input value={projectPartnerId} onChange={e => setProjectPartnerId(e.target.value)} placeholder="Partner ID"/>
                    </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Project Account Name</label>
                        <Input value={projectAccountName} onChange={e => setProjectAccountName(e.target.value)} placeholder="Account Name"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary">Project Account ID</label>
                        <Input value={projectAccountId} onChange={e => setProjectAccountId(e.target.value)} placeholder="Account ID"/>
                    </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Project Status</label>
                        <Input value={projectStatus} onChange={e => setProjectStatus(e.target.value)} placeholder="e.g., On Hold"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary">Task Status</label>
                        <Select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-text-secondary">Team</label>
                        <Select value={team} onChange={e => { setTeam(e.target.value as TeamName); setDeveloperId(''); }} disabled={!!preselectedTeam}>
                            <option value="" disabled>Select a team</option>
                            {(Object.keys(dataService.getSubmissionsCount()) as TeamName[]).map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Task Assignee Full Name</label>
                        <Select value={developerId} onChange={e => setDeveloperId(e.target.value)} disabled={!team}>
                            <option value="">Select developer...</option>
                            {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Task Created Date</label>
                        <DatePicker value={createdDate} onChange={setCreatedDate} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Task Due Date</label>
                        <DatePicker value={buildDueDate} onChange={setBuildDueDate} />
                    </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>{isEditMode ? "Save Changes" : "Add Submission"}</Button>
                </div>
            </div>
        </Modal>
    );
};

// NEW: My Pending Tasks Card
const MyPendingTasksCard: React.FC<{ user: User; onUpdate: () => void }> = ({ user, onUpdate }) => {
    const pendingTasks = useMemo(() => 
        dataService.getSubmissions().filter(s => 
            s.developerId === user.id && (s.status === TaskStatus.PENDING || s.status === TaskStatus.OPEN)
        )
    , [user.id, onUpdate]);

    const handleStartProject = (submissionId: string) => {
        const now = Date.now();
        dataService.updateSubmission(submissionId, {
            status: TaskStatus.IN_PROGRESS,
            timerState: TimerState.RUNNING,
            timerStartTime: now,
            lastTick: now,
        });
        onUpdate();
    };

    if (pendingTasks.length === 0) {
        return (
            <Card>
                <h2 className="text-xl font-bold mb-4">My Pending Tasks</h2>
                <div className="text-center text-text-secondary py-4">
                    <IconCheckCircle className="w-12 h-12 mx-auto" />
                    <p className="mt-2 font-semibold">All caught up!</p>
                    <p className="text-sm">You have no pending tasks.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4">My Pending Tasks</h2>
            <ul className="space-y-3">
                {pendingTasks.slice(0, 5).map(task => (
                    <li key={task.id} className="flex items-center justify-between p-2 bg-surface-highlight rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-text-primary truncate">{task.title}</p>
                            <p className="text-xs text-text-secondary">
                                Due: {task.buildDueDate ? format(new Date(task.buildDueDate), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                        </div>
                        <Button size="sm" onClick={() => handleStartProject(task.id)} className="!bg-green-500 hover:!bg-green-600 !text-white">
                            <IconPlay className="w-4 h-4" /> Start
                        </Button>
                    </li>
                ))}
            </ul>
        </Card>
    );
};


// === NEW: Quick Actions / My Summary Card ===
const QuickActionsCard: React.FC<{ user: User }> = ({ user }) => {
    if (user.role === UserRole.ADMIN) {
        return (
            <Card>
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                    <Link to="/dashboard/users" className="w-full">
                        <Button variant="ghost" className="w-full justify-start"><IconUserPlus /> <span>Manage Users</span></Button>
                    </Link>
                    <Link to="/dashboard/projects" className="w-full">
                         <Button variant="ghost" className="w-full justify-start"><IconBriefcase /> <span>View All Projects</span></Button>
                    </Link>
                    <Link to="/dashboard/structure" className="w-full">
                         <Button variant="ghost" className="w-full justify-start"><IconUserPlus /> <span>Team Structure</span></Button>
                    </Link>
                </div>
            </Card>
        );
    }

    // Regular User View
    const mySubmissions = dataService.getSubmissions().filter(s => s.developerId === user.id || s.qaId === user.id);
    const inProgressCount = mySubmissions.filter(s => s.status === TaskStatus.IN_PROGRESS).length;
    const inQaCount = mySubmissions.filter(s => s.status === TaskStatus.QA_REVIEW).length;

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4">My Summary</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-surface-highlight rounded-lg">
                    <span className="font-semibold text-text-secondary">Projects In Progress</span>
                    <span className="font-bold text-2xl text-primary">{inProgressCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-highlight rounded-lg">
                    <span className="font-semibold text-text-secondary">Projects in QA</span>
                    <span className="font-bold text-2xl text-purple-400">{inQaCount}</span>
                </div>
                 <Link to="/dashboard/projects" className="w-full block mt-2">
                    <Button variant="primary" className="w-full">View My Projects</Button>
                </Link>
            </div>
        </Card>
    );
};


// === DASHBOARD OVERVIEW PANEL ===
const OverviewStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <Card className={`relative overflow-hidden p-5 shadow-lg transition-transform hover:-translate-y-1`}>
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-text-primary">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                {icon}
            </div>
        </div>
        <div className={`absolute -bottom-10 -right-8 w-24 h-24 ${colorClass} opacity-10 rounded-full`}></div>
    </Card>
);

export const DashboardOverviewPanel: React.FC = () => {
    const { user } = useOutletContext<OutletContextType>();
    const [stats, setStats] = useState<ReturnType<typeof dataService.getDashboardStats> | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const forceRefresh = () => setRefreshKey(k => k + 1);

    useEffect(() => {
        if (user) {
            setStats(dataService.getDashboardStats(user));
            setNotifications(dataService.getNotificationsForUser(user.id));
        }
    }, [user, refreshKey]);

    if (!stats || !user) return <div className="text-center p-10">Loading overview...</div>;

    const teamProjectData = Object.entries(stats.teamProjectCounts).map(([name, count]) => ({ name, projects: count }));
    const projectStatusData = Object.entries(stats.projectStatusCounts).map(([name, value]) => ({ name, value }));
    const taskStatusData = Object.entries(stats.taskStatusCounts).map(([name, value]) => ({ name, value }));

    const TEAM_COLORS: Record<TeamName, string> = {
        'High Velocity': '#8b5cf6',
        'Agency': '#3b82f6',
        'Verticals': '#10b981',
        'BroadlyDuda': '#ec4899',
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const key = payload[0].dataKey;
            return (
                <div className="bg-surface p-2 border border-border rounded-md shadow-lg">
                    <p className="font-bold">{`${label || data.name}`}</p>
                    <p className="text-sm">{`${key === 'value' ? 'Count' : 'Projects'}: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
             <div className="mb-6">
                <h1 className="text-3xl font-bold text-text-primary">Dashboard Overview</h1>
                <p className="text-text-secondary mt-1">Welcome back, {user.name}! Here's a summary of {user.role === UserRole.ADMIN ? 'all team activities' : `the ${user.team} team's activity`}.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <OverviewStatCard title="Total Projects" value={stats.totalSubmissions} icon={<IconClipboardList />} colorClass="bg-blue-500/10 text-blue-500" />
                <OverviewStatCard title="In Progress" value={stats.inProgress} icon={<IconRefreshCw />} colorClass="bg-yellow-500/10 text-yellow-500" />
                <OverviewStatCard title="Pending / QA" value={stats.pending} icon={<IconAlertTriangle />} colorClass="bg-purple-500/10 text-purple-500" />
                <OverviewStatCard title="Errors Reported" value={stats.totalErrors} icon={<IconAlertCircle />} colorClass="bg-red-500/10 text-red-500" />
                <OverviewStatCard title="Avg. Daily Utilization" value={`${stats.avgUtilization.toFixed(2)}h`} icon={<IconTrendingUp />} colorClass="bg-green-500/10 text-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Team Project Load</h2>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamProjectData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <XAxis type="number" stroke="var(--color-text-secondary)" />
                                <YAxis type="category" dataKey="name" stroke="var(--color-text-secondary)" width={100} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-highlight)' }} />
                                <Bar dataKey="projects" barSize={30}>
                                    {teamProjectData.map((entry) => (
                                        <Cell key={entry.name} fill={TEAM_COLORS[entry.name as TeamName] || '#8884d8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary mb-4">Project Status Breakdown</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {projectStatusData.length > 0 ? projectStatusData.map(({ name, value }) => (
                                    <div key={name} className="bg-surface-highlight p-3 rounded-lg text-center transition-transform hover:scale-105">
                                        <p className="text-sm font-medium text-text-secondary truncate" title={name}>{name}</p>
                                        <p className="text-2xl font-bold text-text-primary">{value}</p>
                                    </div>
                                )) : <p className="col-span-full text-center text-text-secondary">No project data available.</p>}
                            </div>
                        </div>
                        <div className="border-t border-border my-6"></div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary mb-4">Task Status Breakdown</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {taskStatusData.length > 0 ? taskStatusData.map(({ name, value }) => (
                                    <div key={name} className="bg-surface-highlight p-3 rounded-lg text-center transition-transform hover:scale-105">
                                        <p className="text-sm font-medium text-text-secondary truncate" title={name}>{name}</p>
                                        <p className="text-2xl font-bold text-text-primary">{value}</p>
                                    </div>
                                )) : <p className="col-span-full text-center text-text-secondary">No task data available.</p>}
                            </div>
                        </div>
                    </Card>
                    <QuickActionsCard user={user} />
                    {user.role !== UserRole.ADMIN && <MyPendingTasksCard user={user} onUpdate={forceRefresh} />}
                </div>
            </div>

            <Card>
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <ul className="space-y-2">
                    {notifications.length > 0 ? notifications.slice(0, 5).map(n => (
                        <li key={n.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-surface-highlight transition-colors">
                            <div className={`flex-shrink-0 p-2 rounded-full ${n.read ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : 'bg-secondary/20 text-secondary'}`}>
                                <IconBell />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-text-primary truncate">{n.text}</p>
                                <p className="text-xs text-text-secondary">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                            </div>
                        </li>
                    )) : (
                        <div className="text-center text-text-secondary py-8">
                            <IconBell />
                            <p className="mt-2">No new notifications.</p>
                        </div>
                    )}
                </ul>
            </Card>
        </div>
    );
};

const PAUSE_REASONS = ["Meeting", "Break", "High Priority Task", "End of Day"];

// === PROJECT DETAIL MODAL ===
const ProjectDetailModal: React.FC<{
  submission: Submission;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ submission, user, isOpen, onClose, onUpdate }) => {
    const { tick } = useOutletContext<OutletContextType>();
    const [currentStatus, setCurrentStatus] = useState(submission.status);
    const [pauseReason, setPauseReason] = useState("");
    const [isPausing, setIsPausing] = useState(false);

    useEffect(() => {
        setCurrentStatus(submission.status);
        setIsPausing(false);
        setPauseReason("");
    }, [submission, isOpen]);

    const handleStatusChange = (newStatus: TaskStatus) => {
        const now = Date.now();
        let update: Partial<Submission> = { status: newStatus };

        // STOP timer if it was running or paused and new status is NOT 'In Progress'
        if (submission.timerState !== TimerState.STOPPED && newStatus !== TaskStatus.IN_PROGRESS) {
            update.timerState = TimerState.STOPPED;
            
            const startTime = submission.timerStartTime || submission.lastTick;
            const elapsedMs = now - startTime;
            const newHours = elapsedMs / (1000 * 3600);
            update.loggedHours = (submission.loggedHours || 0) + newHours;

            dataService.logTimeToMetric({ userId: user.id, hours: newHours });

            update.timerStartTime = null;
        } 
        // START timer if it was stopped and new status IS 'In Progress'
        else if (submission.timerState === TimerState.STOPPED && newStatus === TaskStatus.IN_PROGRESS) {
            update.timerState = TimerState.RUNNING;
            update.timerStartTime = now;
        }
        
        update.lastTick = now;
        dataService.updateSubmission(submission.id, update);
        setCurrentStatus(newStatus);
        onUpdate();
    };

    const handlePause = () => {
        if (!pauseReason) {
            alert("Please select a reason for pausing.");
            return;
        }
        const now = Date.now();
        const elapsedMs = now - (submission.timerStartTime || submission.lastTick);
        const newHours = elapsedMs / (1000 * 3600);
        
        dataService.updateSubmission(submission.id, {
            timerState: TimerState.PAUSED,
            loggedHours: (submission.loggedHours || 0) + newHours,
            pauseReason: pauseReason,
            timerStartTime: null, // Stop counting from here
            lastTick: now,
        });
        
        dataService.logTimeToMetric({ userId: user.id, hours: newHours });
        setIsPausing(false);
        onUpdate();
    };

    const handleResume = () => {
        const now = Date.now();
        dataService.updateSubmission(submission.id, {
            timerState: TimerState.RUNNING,
            timerStartTime: now,
            pauseReason: undefined,
            lastTick: now,
        });
        onUpdate();
    };

    const isAssigned = submission.developerId === user.id || submission.qaId === user.id;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Project Details">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-primary">{submission.title}</h3>
                    <p className="text-sm text-text-secondary">{submission.taskTitle || submission.projectType}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                     <div className="col-span-2 space-y-1">
                        <p className="text-text-secondary">Project Status:</p>
                        <div><StatusBadge status={submission.projectStatus || 'N/A'} /></div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-text-secondary">Partner:</p>
                        <p>{submission.projectPartnerName || 'N/A'} ({submission.projectPartnerId || 'N/A'})</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-text-secondary">Account:</p>
                        <p>{submission.projectAccountName || 'N/A'} ({submission.projectAccountId || 'N/A'})</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-text-secondary">Developer:</p>
                        <p>{dataService.getUserById(submission.developerId || '')?.name || 'N/A'}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-text-secondary">QA:</p>
                        <p>{dataService.getUserById(submission.qaId || '')?.name || 'N/A'}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-text-secondary">Build Due Date:</p>
                        <p>{submission.buildDueDate ? format(new Date(submission.buildDueDate), 'MMM dd, yyyy') : 'N/A'}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-text-secondary">QA Due Date:</p>
                        <p>{submission.qaDueDate ? format(new Date(submission.qaDueDate), 'MMM dd, yyyy') : 'N/A'}</p>
                    </div>
                </div>

                {isAssigned && (
                    <div className="p-4 bg-surface-highlight rounded-lg space-y-3">
                        <h4 className="font-bold">Manage Status & Timer</h4>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium">Status:</label>
                            <Select value={currentStatus} onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}>
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        </div>
                        
                        {submission.timerState === TimerState.RUNNING && !isPausing && (
                            <Button variant="secondary" onClick={() => setIsPausing(true)}><IconPause /> Pause Task</Button>
                        )}
                        {isPausing && (
                            <div className="flex items-center gap-2 p-2 border border-border rounded-md">
                                <Select value={pauseReason} onChange={e => setPauseReason(e.target.value)} className="flex-grow">
                                    <option value="">Select a reason...</option>
                                    {PAUSE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </Select>
                                <Button onClick={handlePause}>Confirm</Button>
                                <Button variant="ghost" onClick={() => setIsPausing(false)}>Cancel</Button>
                            </div>
                        )}
                         {submission.timerState === TimerState.PAUSED && (
                             <div className="flex items-center justify-between p-2 bg-yellow-500/20 rounded-md">
                                 <p className="text-sm font-semibold text-yellow-300">Paused: {submission.pauseReason}</p>
                                 <Button variant="secondary" onClick={handleResume}><IconPlay /> Resume Task</Button>
                             </div>
                        )}
                    </div>
                )}
                 <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={onClose}>Close</Button>
                 </div>
            </div>
        </Modal>
    )
}

// === TIMER STATUS CELL COMPONENT ===
const TimerStatusCell: React.FC<{ submission: Submission }> = ({ submission }) => {
    const { tick } = useOutletContext<OutletContextType>();
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        if (submission.timerState === TimerState.RUNNING && submission.timerStartTime) {
            const now = Date.now();
            const start = submission.timerStartTime;
            const totalSeconds = Math.floor((now - start) / 1000);

            const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(totalSeconds % 60).padStart(2, '0');
            setElapsedTime(`${h}:${m}:${s}`);
        }
    }, [tick, submission.timerState, submission.timerStartTime]);

    switch (submission.timerState) {
        case TimerState.RUNNING:
            return <div className="flex items-center gap-2 text-green-400"><IconPlay className="animate-pulse" /><span className="font-mono text-sm font-semibold">{elapsedTime}</span></div>;
        case TimerState.PAUSED:
            return <div className="flex items-center gap-2 text-yellow-400"><IconPause /><span className="text-sm font-semibold">Paused</span></div>;
        default:
            return <div className="flex items-center gap-2 text-text-secondary"><IconStop /><span className="text-sm">Stopped</span></div>;
    }
};

// === UPLOAD PROGRESS MODAL ===
const UploadProgressModal: React.FC<{
    status: 'idle' | 'uploading' | 'success' | 'error';
    result: { success: number; error: number; duplicates: number; errors: string[] };
    onClose: () => void;
}> = ({ status, result, onClose }) => {
    if (status === 'idle') return null;

    const renderContent = () => {
        switch (status) {
            case 'uploading':
                return (
                    <div className="flex flex-col items-center justify-center p-8">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-lg font-semibold">Processing CSV...</p>
                        <p className="text-text-secondary">Please wait while we import your projects.</p>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center p-8">
                        <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-xl font-bold">Upload Complete</h3>
                        <p className="mt-2 text-text-secondary">The dashboard is now updated with the new data.</p>
                        <div className="mt-6 flex justify-center gap-4">
                            <div className="bg-green-500/10 text-green-500 p-3 rounded-lg flex-1">
                                <p className="font-bold text-2xl">{result.success}</p>
                                <p className="text-xs">Projects Added</p>
                            </div>
                            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg flex-1">
                                <p className="font-bold text-2xl">{result.error}</p>
                                <p className="text-xs">Rows Failed</p>
                            </div>
                            {result.duplicates > 0 && (
                                <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-lg flex-1">
                                    <p className="font-bold text-2xl">{result.duplicates}</p>
                                    <p className="text-xs">Duplicates Skipped</p>
                                </div>
                            )}
                        </div>
                        {result.errors.length > 0 && (
                            <div className="mt-4 text-left bg-surface-highlight p-3 rounded-lg max-h-40 overflow-y-auto">
                                <p className="font-semibold text-sm mb-2 text-text-primary">Error Details (showing first {Math.min(5, result.errors.length)}):</p>
                                <ul className="text-xs text-red-400 list-disc list-inside space-y-1">
                                    {result.errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center p-8">
                        <IconAlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h3 className="mt-4 text-xl font-bold">Upload Failed</h3>
                        <p className="mt-2 text-text-secondary">
                            There was an error processing your file. Please check the console for details and ensure your CSV format is correct.
                        </p>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="CSV Upload Status" size="md">
            {renderContent()}
            <div className="flex justify-end p-4 border-t border-border bg-surface rounded-b-lg">
                <Button onClick={onClose} disabled={status === 'uploading'}>Close</Button>
            </div>
        </Modal>
    );
};


// === PROJECTS PANEL ===
export const ProjectsPanel: React.FC = () => {
    const { user, tick } = useOutletContext<OutletContextType>();
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'my' | 'all'>('my');

    // Filter states
    const [filterText, setFilterText] = useState('');
    const [filterTeam, setFilterTeam] = useState<TeamName | ''>('');
    const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
    
    // Selection state for deletion
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // State for upload modal
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadResult, setUploadResult] = useState({ success: 0, error: 0, duplicates: 0, errors: [] as string[] });

    const isTeamMember = user?.role === UserRole.USER;
    const isAdmin = user?.role === UserRole.ADMIN;

    const filteredSubmissions = useMemo(() => {
        if (!user) return [];
        const allSubmissions = dataService.getSubmissions();
        const baseSubmissions = user.role === UserRole.ADMIN ? allSubmissions : allSubmissions.filter(s => s.team === user.team);
        
        const mySubmissions = isTeamMember && viewMode === 'my' 
            ? baseSubmissions.filter(s => s.developerId === user.id || s.qaId === user.id)
            : baseSubmissions;

        return mySubmissions.filter(sub => {
            const lowerCaseFilter = filterText.toLowerCase();
            const searchMatch = !filterText || 
                sub.title.toLowerCase().includes(lowerCaseFilter) ||
                (sub.taskTitle && sub.taskTitle.toLowerCase().includes(lowerCaseFilter)) ||
                (sub.projectPartnerName && sub.projectPartnerName.toLowerCase().includes(lowerCaseFilter)) ||
                (sub.projectAccountName && sub.projectAccountName.toLowerCase().includes(lowerCaseFilter));
            
            const teamMatch = !filterTeam || sub.team === filterTeam;
            const statusMatch = !filterStatus || sub.status === filterStatus;

            return searchMatch && teamMatch && statusMatch;
        });

    }, [user, refreshKey, viewMode, filterText, filterTeam, filterStatus]);
    
    const handleEditClick = (submission: Submission) => {
        setSelectedSubmission(submission);
        setAddEditModalOpen(true);
    };

    const handleRowClick = (submission: Submission) => {
        setSelectedSubmission(submission);
        setDetailModalOpen(true);
    };

    const handleCloseAllModals = () => {
        setAddEditModalOpen(false);
        setDetailModalOpen(false);
        setSelectedSubmission(null);
    };
    
    const forceRefresh = () => setRefreshKey(k => k + 1);

    const handleStartProject = (submissionId: string) => {
        const now = Date.now();
        dataService.updateSubmission(submissionId, {
            status: TaskStatus.IN_PROGRESS,
            timerState: TimerState.RUNNING,
            timerStartTime: now,
            lastTick: now,
        });
        forceRefresh();
    };

    const handleSelectId = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleDeleteSelected = () => {
        dataService.deleteSubmissions(Array.from(selectedIds));
        setSelectedIds(new Set());
        setDeleteConfirmOpen(false);
        forceRefresh();
    };


    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadStatus('uploading');
        setUploadResult({ success: 0, error: 0, duplicates: 0, errors: [] });

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            
            await new Promise(res => setTimeout(res, 500));

            try {
                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length <= 1) throw new Error('CSV is empty or has only a header row.');
                
                const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
                
                const requiredHeaders = [CSV_HEADERS.PROJECT_TITLE, CSV_HEADERS.TASK_STATUS];
                const missingHeaders = requiredHeaders.filter(rh => !header.includes(rh));
                if (missingHeaders.length > 0) throw new Error(`CSV is missing required columns: ${missingHeaders.join(', ')}.`);
                
                const hasTeam = header.includes(CSV_HEADERS.TEAM);
                const hasAssignee = header.includes(CSV_HEADERS.ASSIGNEE_NAME);
                if (!hasTeam && !hasAssignee) throw new Error(`CSV must contain either a '${CSV_HEADERS.TEAM.toUpperCase()}' or a '${CSV_HEADERS.ASSIGNEE_NAME.toUpperCase()}' column.`);
                
                const headerMap = header.reduce((acc, curr, index) => ({ ...acc, [curr]: index }), {} as Record<string, number>);

                const submissionsToCreate = lines.slice(1).map(line => {
                    const values = line.split(',').map(field => field.trim().replace(/"/g, ''));
                    const getVal = (key: string) => values[headerMap[key]] || '';
                    
                    const assigneeName = getVal(CSV_HEADERS.ASSIGNEE_NAME);
                    const assignee = assigneeName ? dataService.getUserByName(assigneeName) : null;
                    const team = (getVal(CSV_HEADERS.TEAM) || assignee?.team) as TeamName | undefined;
                    
                    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
                    const createdDate = getVal(CSV_HEADERS.CREATED_DATE) && dateFormatRegex.test(getVal(CSV_HEADERS.CREATED_DATE)) ? getVal(CSV_HEADERS.CREATED_DATE) : new Date().toISOString().split('T')[0];
                    const dueDate = getVal(CSV_HEADERS.DUE_DATE) && dateFormatRegex.test(getVal(CSV_HEADERS.DUE_DATE)) ? getVal(CSV_HEADERS.DUE_DATE) : null;

                    return {
                        projectPartnerName: getVal(CSV_HEADERS.PARTNER_NAME),
                        projectPartnerId: getVal(CSV_HEADERS.PARTNER_ID),
                        projectAccountName: getVal(CSV_HEADERS.ACCOUNT_NAME),
                        projectAccountId: getVal(CSV_HEADERS.ACCOUNT_ID),
                        title: getVal(CSV_HEADERS.PROJECT_TITLE),
                        projectStatus: getVal(CSV_HEADERS.PROJECT_STATUS),
                        taskTitle: getVal(CSV_HEADERS.TASK_TITLE),
                        assigneeName: assigneeName,
                        developerId: assignee ? assignee.id : null,
                        status: getVal(CSV_HEADERS.TASK_STATUS) as TaskStatus,
                        createdDate: createdDate,
                        buildDueDate: dueDate,
                        team: team,
                        submitterName: user.name,
                    };
                });
                
                const result = dataService.addMultipleSubmissions(submissionsToCreate);
                setUploadResult({ success: result.successCount, error: result.errorCount, duplicates: result.duplicateCount, errors: result.errors });
                setUploadStatus('success');
                forceRefresh();

            } catch (error: any) {
                console.error("CSV Upload Error:", error);
                setUploadResult(prev => ({ ...prev, errors: [error.message] }));
                setUploadStatus('error');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };
    
    const handleDownloadCsv = () => {
        const headers = [
            "Project Partner Name", "Project Partner ID", "Project Account Name", "Project Account ID",
            "Project Title", "Project Status", "Task Title", "Task Assignee Full Name",
            "Task Status", "Task Created Date", "Task Due Date", "Team"
        ];

        const rows = filteredSubmissions.map(sub => {
            const developer = sub.developerId ? dataService.getUserById(sub.developerId) : null;
            return [
                sub.projectPartnerName, sub.projectPartnerId, sub.projectAccountName, sub.projectAccountId,
                sub.title, sub.projectStatus, sub.taskTitle, developer ? developer.name : 'Unassigned',
                sub.status, sub.createdDate, sub.buildDueDate, sub.team
            ].map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "projects_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const triggerFileUpload = () => fileInputRef.current?.click();
    
    if (!user) return null;

    const allTeams = Object.keys(dataService.getSubmissionsCount()) as TeamName[];
    const allStatuses = Object.values(TaskStatus);

    return (
        <>
        <UploadProgressModal status={uploadStatus} result={uploadResult} onClose={() => setUploadStatus('idle')} />
        <SubmissionModal isOpen={isAddEditModalOpen} onClose={handleCloseAllModals} onSave={() => { forceRefresh(); handleCloseAllModals(); }} user={user} submissionToEdit={selectedSubmission} />
        {selectedSubmission && <ProjectDetailModal isOpen={isDetailModalOpen} onClose={handleCloseAllModals} submission={selectedSubmission} user={user} onUpdate={() => { forceRefresh(); setSelectedSubmission(dataService.getSubmissionById(selectedSubmission.id) || null)}} />}
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Confirm Deletion" size="md">
            <p>Are you sure you want to delete {selectedIds.size} selected project(s)? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-6">
                <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleDeleteSelected}>Delete</Button>
            </div>
        </Modal>

        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">{isAdmin ? "All Team Projects" : `${user.team} Team Projects`}</h2>
                        <p className="text-sm text-text-secondary mt-1">Overview of all project submissions.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         {isAdmin && (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleCsvUpload} accept=".csv" className="hidden" />
                                <Button onClick={triggerFileUpload} variant="ghost"><IconUpload/> Upload CSV</Button>
                                <Button onClick={handleDownloadCsv} variant="ghost"><IconDownload/> Download CSV</Button>
                            </>
                        )}
                        {isAdmin && selectedIds.size > 0 && (
                           <Button onClick={() => setDeleteConfirmOpen(true)} variant="danger"><IconTrash /> Delete Selected ({selectedIds.size})</Button>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-surface-highlight rounded-md">
                    <Input placeholder="Search projects..." value={filterText} onChange={e => setFilterText(e.target.value)} />
                    <Select value={filterTeam} onChange={e => setFilterTeam(e.target.value as TeamName)}>
                        <option value="">All Teams</option>
                        {allTeams.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                    <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus)}>
                        <option value="">All Statuses</option>
                        {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>


                {isTeamMember && (
                    <div className="flex items-center gap-2 p-1 bg-surface-highlight rounded-lg mb-4 w-fit">
                        <button onClick={() => setViewMode('my')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'my' ? 'bg-surface shadow' : 'text-text-secondary'}`}>My Projects</button>
                        <button onClick={() => setViewMode('all')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'all' ? 'bg-surface shadow' : 'text-text-secondary'}`}>All Projects</button>
                    </div>
                )}

                {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                        <IconCalendar />
                        <p className="mt-4 font-semibold">No projects match the current filters.</p>
                    </div>
                ) : (
                    <Table>
                        <Thead>
                            <Tr>
                                {isAdmin ? <Th className="w-10"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === filteredSubmissions.length} className="bg-surface border-border" /></Th> : <Th className="w-10"></Th>}
                                <Th>Project Partner Name</Th>
                                <Th>Project Partner ID</Th>
                                <Th>Project Account Name</Th>
                                <Th>Project Account ID</Th>
                                <Th>Project Title</Th>
                                <Th>Project Status</Th>
                                <Th>Task Title</Th>
                                <Th>Task Assignee Full Name</Th>
                                <Th>Task Status</Th>
                                <Th>Task Created Date</Th>
                                <Th>Task Due Date</Th>
                                <Th>Team</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredSubmissions.map((sub) => {
                                const developer = sub.developerId ? dataService.getUserById(sub.developerId) : null;
                                return (
                                    <Tr key={sub.id} className={`${selectedIds.has(sub.id) ? 'bg-primary/10' : ''}`}>
                                        {isAdmin ? (
                                            <Td onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" checked={selectedIds.has(sub.id)} onChange={() => handleSelectId(sub.id)} className="bg-surface border-border"/>
                                            </Td>
                                        ) : <Td></Td>}
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer">{sub.projectPartnerName || 'N/A'}</Td>
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer">{sub.projectPartnerId || 'N/A'}</Td>
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer">{sub.projectAccountName || 'N/A'}</Td>
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer">{sub.projectAccountId || 'N/A'}</Td>
                                        <Td onClick={() => handleRowClick(sub)} className="font-medium cursor-pointer">{sub.title}</Td>
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer"><StatusBadge status={sub.projectStatus || 'N/A'} /></Td>
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer">{sub.taskTitle || 'N/A'}</Td>
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer">{developer ? developer.name : 'Unassigned'}</Td>
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer"><StatusBadge status={sub.status} /></Td>
                                        <Td onClick={() => handleRowClick(sub)} className="whitespace-nowrap cursor-pointer">
                                            {sub.createdDate ? format(new Date(sub.createdDate), 'yyyy-MM-dd') : 'N/A'}
                                        </Td>
                                        <Td onClick={() => handleRowClick(sub)} className="whitespace-nowrap cursor-pointer">
                                            {sub.buildDueDate ? format(new Date(sub.buildDueDate), 'yyyy-MM-dd') : 'N/A'}
                                        </Td>
                                        <Td onClick={() => handleRowClick(sub)} className="cursor-pointer">{sub.team}</Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                {(sub.status === TaskStatus.PENDING || sub.status === TaskStatus.OPEN) && sub.developerId === user.id && (
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); handleStartProject(sub.id); }}
                                                        className="!bg-green-500 hover:!bg-green-600 !text-white"
                                                        title="Start Project"
                                                    >
                                                        <IconPlay className="w-4 h-4" />
                                                        <span>Start</span>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleEditClick(sub); }}
                                                    className="!p-2"
                                                    title="Edit Submission"
                                                >
                                                    <IconEdit />
                                                </Button>
                                            </div>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                )}
            </Card>
        </div>
        </>
    );
};


// === ADD ERROR LOG MODAL ===
const AddErrorLogModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
    reporterId: string;
}> = ({ isOpen, onClose, onAdd, reporterId }) => {
    const [submissionId, setSubmissionId] = useState('');
    const [description, setDescription] = useState('');
    const allSubmissions = useMemo(() => dataService.getSubmissions(), []);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const handleSubmit = () => {
        if (!submissionId || !description) {
            alert('Please select a submission and provide a description.');
            return;
        }
        dataService.addErrorLog({
            submissionId,
            description,
            reportedById: reporterId,
        });
        onAdd();
        onClose();
    };

    const handleSubmissionChange = (id: string) => {
        setSubmissionId(id);
        setSelectedSubmission(dataService.getSubmissionById(id) || null);
    };

    useEffect(() => {
        if (isOpen) {
            setSubmissionId('');
            setDescription('');
            setSelectedSubmission(null);
        }
    }, [isOpen]);
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Error Log">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Project</label>
                    <Select value={submissionId} onChange={e => handleSubmissionChange(e.target.value)}>
                        <option value="" disabled>Select a project</option>
                        {allSubmissions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </Select>
                </div>
                
                {selectedSubmission && (
                    <div className="p-3 bg-surface-highlight rounded-md text-sm text-text-secondary space-y-1">
                        <p><strong>Task Title:</strong> {selectedSubmission.taskTitle || 'N/A'}</p>
                        <p><strong>Assignee:</strong> {dataService.getUserById(selectedSubmission.developerId || '')?.name || 'N/A'}</p>
                        <p><strong>Team:</strong> {selectedSubmission.team}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-text-secondary">Description</label>
                    <textarea 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe the error in detail..."
                        rows={4}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder:text-gray-500"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>Add Log</Button>
                </div>
            </div>
        </Modal>
    );
};


// === ERROR LOGS PANEL ===
export const ErrorLogsPanel: React.FC = () => {
    const { user } = useOutletContext<OutletContextType>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const errorLogs = useMemo(() => {
        const allLogs = dataService.getErrorLogs();
        if (user?.role === UserRole.ADMIN) {
            return allLogs;
        }
        return allLogs.filter(log => {
            const sub = dataService.getSubmissionById(log.submissionId);
            return sub && sub.team === user.team;
        });
    }, [user, refreshKey]);

    return (
        <>
            <AddErrorLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={() => setRefreshKey(k => k + 1)}
                reporterId={user.id}
            />
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Error Logs</h2>
                        <p className="mt-1 text-text-secondary text-sm">
                            {user.role === UserRole.ADMIN ? 'Track all reported errors.' : `A log of errors for the ${user.team} team.`}
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}><IconPlus/> Add Error Log</Button>
                </div>
                <Table>
                    <Thead><Tr>
                        <Th>Project Title</Th>
                        <Th>Task Title</Th>
                        <Th>Assignee</Th>
                        <Th>Team</Th>
                        <Th>Description</Th>
                        <Th>Reported By</Th>
                        <Th>Timestamp</Th>
                    </Tr></Thead>
                    <Tbody>
                        {errorLogs.map(log => {
                            const submission = dataService.getSubmissionById(log.submissionId);
                            const reporter = dataService.getUserById(log.reportedById);
                            const assignee = submission ? dataService.getUserById(submission.developerId || '') : null;
                            return (
                                <Tr key={log.id}>
                                    <Td><span className="font-medium">{submission?.title || 'N/A'}</span></Td>
                                    <Td>{submission?.taskTitle || 'N/A'}</Td>
                                    <Td>{assignee?.name || 'Unassigned'}</Td>
                                    <Td>{submission?.team || 'N/A'}</Td>
                                    <Td>{log.description}</Td>
                                    <Td>{reporter?.name || 'Unknown'}</Td>
                                    <Td>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Card>
        </>
    );
};

// === METRICS PANEL ===
const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-surface-highlight p-3 rounded-lg text-center">
    <p className="text-sm font-semibold text-text-secondary">{title}</p>
    <p className="text-2xl font-bold text-text-primary">{value}</p>
  </div>
);

const AddUtilizationModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: () => void; }> = ({ isOpen, onClose, onAdd }) => {
    const [userId, setUserId] = useState('');
    const [hours, setHours] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const users = useMemo(() => dataService.getUsers().filter(u => u.role === UserRole.USER), []);

    const handleSubmit = () => {
        if (!userId || !hours || !date) {
            alert('Please fill all fields');
            return;
        }
        dataService.addMetric({ userId, hours: parseFloat(hours), date });
        onAdd();
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Utilization Entry">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary">User</label>
                    <Select value={userId} onChange={e => setUserId(e.target.value)}>
                        <option value="" disabled>Select a user</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Date</label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Hours Worked</label>
                    <Input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g., 7.5" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>Add Entry</Button>
                </div>
            </div>
        </Modal>
    );
};


export const MetricsPanel: React.FC = () => {
    const { user } = useOutletContext<OutletContextType>();
    const isAdmin = user.role === UserRole.ADMIN;

    const [refreshKey, setRefreshKey] = useState(0); // Used to force re-renders on data change
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // View state
    const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
    const [currentWeek, setCurrentWeek] = useState(new Date());

    // Filter state (only used by admin)
    const [selectedTeam, setSelectedTeam] = useState<TeamName | ''>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [selectedLead, setSelectedLead] = useState<string>('');

    // AI Insights State
    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setAiLoading] = useState(false);

    // For non-admins, filters are locked to their own ID
    const finalSelectedMemberId = isAdmin ? selectedMemberId : user.id;

    // Derived Date Range for filtering
    const { startDate, endDate } = useMemo(() => {
        if (viewMode === 'weekly') {
            return {
                startDate: startOfWeek(currentWeek, { weekStartsOn: 1 }),
                endDate: endOfWeek(currentWeek, { weekStartsOn: 1 }),
            };
        }
        // Monthly view
        const monthDate = selectedMonth ? new Date(selectedMonth + '-02') : new Date();
        return {
            startDate: startOfMonth(monthDate),
            endDate: endOfMonth(monthDate),
        };
    }, [viewMode, currentWeek, selectedMonth]);

    // Data for filters
    const teams = useMemo(() => dataService.getTeamStructure().map(t => t.name), []);
    const leads = useMemo(() => [...new Set(dataService.getTeamStructure().map(t => t.lead))], []);
    const months = useMemo(() => {
        const monthSet = new Set(dataService.getRawMetrics().map(m => format(new Date(m.timestamp), 'yyyy-MM')));
        return Array.from(monthSet).sort().reverse().map(m => ({
            value: m,
            label: format(new Date(m + '-02'), 'MMMM yyyy')
        }));
    }, [refreshKey]);
    const members = useMemo(() => {
        const allUsers = dataService.getUsers().filter(u => u.role === UserRole.USER);
        if (selectedTeam) {
            return allUsers.filter(u => u.team === selectedTeam);
        }
        return allUsers;
    }, [selectedTeam]);

    // Determine if we should show the detailed daily view
    const isDetailedView = viewMode === 'weekly' && !!finalSelectedMemberId;

    const filteredMetrics = useMemo(() => {
        if (isDetailedView) return []; // Summary data not needed for detailed view
        return dataService.getFilteredUserMetrics({
            team: selectedTeam || undefined,
            userId: finalSelectedMemberId || undefined,
            lead: selectedLead || undefined,
            startDate,
            endDate,
        });
    }, [selectedTeam, finalSelectedMemberId, selectedLead, startDate, endDate, refreshKey, isDetailedView]);

    const dailyMetrics = useMemo(() => {
        if (!isDetailedView) return [];
        return dataService.getDailyMetricsForUser(finalSelectedMemberId, startDate, endDate);
    }, [isDetailedView, finalSelectedMemberId, startDate, endDate, refreshKey]);

    const handleGenerateInsights = async () => {
        if (!aiQuery.trim()) {
            setAiResponse("Please enter a question to get insights.");
            return;
        }
        setAiLoading(true);
        setAiResponse('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const dataToAnalyze = isDetailedView ? dailyMetrics : filteredMetrics;
            const dataString = JSON.stringify(dataToAnalyze.map(d => isDetailedView ? d : ({ ...d, user: d.user.name })), null, 2);

            const prompt = `
                You are a productivity analyst for a software development team manager.
                Your task is to analyze the provided JSON data about user productivity metrics and answer the user's question.
                Provide a clear, concise, and insightful answer based *only* on the data. Format your response in Markdown.

                Here is the data for the selected period:
                \`\`\`json
                ${dataString}
                \`\`\`

                User's Question: "${aiQuery}"

                Analysis:
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            });

            setAiResponse(response.text);

        } catch (e) {
            console.error("AI Insight generation failed:", e);
            setAiResponse("Sorry, an error occurred while generating insights. Please check the console for more details.");
        } finally {
            setAiLoading(false);
        }
    };
    
    // FIX: Corrected all calculations within periodStats to ensure they operate on numbers.
    const periodStats = useMemo(() => {
        const metricsToSummarize = isDetailedView 
            ? [{ totalHours: dailyMetrics.reduce((acc, m) => acc + m.hours, 0), days: dailyMetrics.filter(m => m.hours > 0).length }]
            : filteredMetrics;

        let totalHours = 0;
        let totalDays = 0;
        let activeMembers = 0;

        metricsToSummarize.forEach(metric => {
            totalHours += metric.totalHours;
            totalDays += metric.days;
            if (metric.totalHours > 0) {
                activeMembers++;
            }
        });

        const avgUtilization = totalDays > 0 ? totalHours / totalDays : 0;
        
        // Define targets
        const TARGET_WEEKLY_HOURS_PER_PERSON = 38;
        const TARGET_MONTHLY_HOURS_PER_PERSON = 165; // Approx 38 * 4.33 weeks

        // Correctly calculate the number of members the target is for.
        // It should be based on the number of people in the filter, not just those with logged hours.
        const numberOfTargetMembers = isDetailedView ? 1 : filteredMetrics.length;

        const targetHours = viewMode === 'weekly'
            ? numberOfTargetMembers * TARGET_WEEKLY_HOURS_PER_PERSON
            : numberOfTargetMembers * TARGET_MONTHLY_HOURS_PER_PERSON;
            
        const uncompletedHours = Math.max(0, targetHours - totalHours);

        return {
            totalHours: totalHours.toFixed(1),
            avgUtilization: avgUtilization.toFixed(2),
            activeMembers,
            targetHours: targetHours.toFixed(1),
            uncompletedHours: uncompletedHours.toFixed(1)
        };
    }, [filteredMetrics, dailyMetrics, isDetailedView, finalSelectedMemberId, viewMode]);
    
    const calculateScore = (avgHours: number): { score: number; text: string } => {
        if (avgHours >= 6.8) return { score: 100, text: '100%' };
        if (avgHours >= 5.8) return { score: 80, text: '80%' };
        if (avgHours >= 4.8) return { score: 60, text: '60%' };
        const score = Math.max(0, Math.round((avgHours / 4.8) * 60));
        return { score, text: `<60%` };
    };
    
    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTeam = e.target.value as TeamName | '';
        setSelectedTeam(newTeam);
        setSelectedMemberId('');
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonth(e.target.value);
        setViewMode('monthly'); // Force monthly view when a month is selected
    };

    return (
        <>
            {isAdmin && <AddUtilizationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={() => setRefreshKey(k => k + 1)} />}
            <Modal isOpen={isAiModalOpen} onClose={() => setAiModalOpen(false)} title="AI-Powered Productivity Insights" size="2xl">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Ask a question about the current data view</label>
                        <textarea
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            placeholder="e.g., Who are the top 3 most utilized team members and are they meeting their targets?"
                            rows={3}
                            className="w-full bg-surface-highlight border border-border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder:text-gray-500"
                        />
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={handleGenerateInsights} disabled={isAiLoading}>
                            {isAiLoading ? 'Thinking...' : 'Generate Insights'}
                        </Button>
                    </div>
                    { (isAiLoading || aiResponse) && (
                        <div className="mt-4 p-4 bg-surface-highlight rounded-md max-h-96 overflow-y-auto">
                            <h4 className="font-semibold mb-2">Analysis Result:</h4>
                            {isAiLoading ? (
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span>Generating insights with Thinking Mode...</span>
                                </div>
                            ) : (
                               <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br />') }}></div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">User Utilization Metrics</h2>
                        <p className="text-sm text-text-secondary mt-1">Track and analyze team productivity and hours logged.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => setAiModalOpen(true)}>Get AI Insights</Button>
                        <div className="flex items-center gap-1 p-1 bg-surface-highlight rounded-lg">
                            <button onClick={() => setViewMode('monthly')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'monthly' ? 'bg-surface shadow' : 'text-text-secondary'}`}>Monthly</button>
                            <button onClick={() => setViewMode('weekly')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'weekly' ? 'bg-surface shadow' : 'text-text-secondary'}`}>Weekly</button>
                        </div>
                        {isAdmin && <Button onClick={() => setIsModalOpen(true)}><IconPlus /> Add Entry</Button>}
                    </div>
                </div>

                {isAdmin && (
                    <Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="text-xs font-semibold text-text-secondary">Filter by Team</label>
                                <Select value={selectedTeam} onChange={handleTeamChange}>
                                    <option value="">All Teams</option>
                                    {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-text-secondary">Filter by Member</label>
                                <Select value={finalSelectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} disabled={!members.length}>
                                    <option value="">All Members</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </Select>
                            </div>
                            {viewMode === 'monthly' ? (
                                <div>
                                    <label className="text-xs font-semibold text-text-secondary">Select Month</label>
                                    <Select value={selectedMonth} onChange={handleMonthChange}>
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </Select>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-2 bg-surface-highlight rounded-md">
                                    <Button variant="ghost" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>Prev</Button>
                                    <div className="text-center">
                                        <p className="font-semibold">{format(startDate, 'MMM dd')}</p>
                                        <p className="text-xs text-text-secondary">{format(endDate, 'MMM dd, yyyy')}</p>
                                    </div>
                                    <Button variant="ghost" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>Next</Button>
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-semibold text-text-secondary">Filter by Lead</label>
                                <Select value={selectedLead} onChange={e => setSelectedLead(e.target.value)}>
                                    <option value="">All Leads</option>
                                    {leads.map(l => <option key={l} value={l}>{l}</option>)}
                                </Select>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard title="Total Hours" value={periodStats.totalHours} />
                    <StatCard title="Avg Daily Utilization" value={`${periodStats.avgUtilization}h`} />
                    <StatCard title="Active Members" value={periodStats.activeMembers.toString()} />
                    <StatCard title="Target Hours" value={periodStats.targetHours} />
                    <StatCard title="Uncompleted Hours" value={periodStats.uncompletedHours} />
                </div>

                <Card>
                    <h3 className="text-lg font-bold mb-4">
                        {isDetailedView ? `Daily Breakdown for ${dataService.getUserById(finalSelectedMemberId)?.name}` : 'User Utilization Summary'}
                    </h3>
                    {isDetailedView ? (
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyMetrics} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="timestamp" tickFormatter={(ts) => format(new Date(ts), 'EEE, dd')} stroke="var(--color-text-secondary)" />
                                    <YAxis stroke="var(--color-text-secondary)" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)'}}
                                        labelFormatter={(ts) => format(new Date(ts), 'MMM dd, yyyy')}
                                    />
                                    <Bar dataKey="hours" fill="var(--color-primary)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <Table>
                            <Thead><Tr>
                                <Th>User</Th>
                                <Th>Team</Th>
                                <Th>Avg Daily Hours</Th>
                                <Th>Total Hours</Th>
                                <Th>Active Days</Th>
                                <Th>Productivity Score</Th>
                            </Tr></Thead>
                            <Tbody>
                                {filteredMetrics.map(({ user, avgHours, totalHours, days }) => {
                                    const { score, text } = calculateScore(avgHours);
                                    return (
                                        <Tr key={user.id}>
                                            <Td>{user.name}</Td>
                                            <Td>{user.team}</Td>
                                            <Td className="font-semibold">{avgHours.toFixed(2)}h</Td>
                                            <Td>{totalHours.toFixed(1)}h</Td>
                                            <Td>{days}</Td>
                                            <Td><ProgressBar progress={score} text={text} /></Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    )}
                </Card>
            </div>
        </>
    );
};


// === DMS PANEL ===
export const DMSPanel: React.FC = () => {
    const documents = useMemo(() => dataService.getDmsDocuments(), []);
    return (
        <Card>
            <h2 className="text-xl font-bold mb-4">Document Management System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => (
                    <Card key={doc.id} className="hover:shadow-xl transition-shadow cursor-pointer">
                        <h3 className="font-bold text-primary">{doc.title}</h3>
                        <p className="text-xs text-text-secondary mt-2">
                            Author: {dataService.getUserById(doc.authorId)?.name || 'Unknown'} | Last Updated: {doc.lastUpdated}
                        </p>
                    </Card>
                ))}
            </div>
        </Card>
    );
};


// === USER MANAGEMENT PANEL (Admin Only) ===
const UserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    userToEdit: User | null;
}> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const isEditMode = !!userToEdit;
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.USER);
    const [team, setTeam] = useState<TeamName | ''>('');

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && userToEdit) {
                setName(userToEdit.name);
                setRole(userToEdit.role);
                setTeam(userToEdit.team || '');
                setPassword(''); // Clear password for security
            } else {
                setName('');
                setRole(UserRole.USER);
                setTeam('');
                setPassword('');
            }
        }
    }, [isOpen, userToEdit, isEditMode]);

    const handleSubmit = () => {
        if (!name || (isEditMode ? false : !password)) {
            alert('Please fill in all required fields.');
            return;
        }
        
        const userData = { name, role, team: team || undefined, password };
        
        if (isEditMode && userToEdit) {
            dataService.updateUser(userToEdit.id, userData);
        } else {
            dataService.addUser(userData);
        }
        onSave();
        onClose();
    };

    const teams = useMemo(() => dataService.getTeamStructure().map(t => t.name), []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit User' : 'Add User'}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary">Password</label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isEditMode ? 'Leave blank to keep current password' : ''} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Role</label>
                        <Select value={role} onChange={e => setRole(e.target.value as UserRole)}>
                            {Object.values(UserRole).map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Team</label>
                        <Select value={team} onChange={e => setTeam(e.target.value as TeamName)}>
                            <option value="">No Team</option>
                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>{isEditMode ? 'Save Changes' : 'Add User'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export const UserManagement: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const forceRefresh = () => setRefreshKey(k => k + 1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const users = useMemo(() => dataService.getUsers(), [refreshKey]);

    const handleAddClick = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            dataService.deleteUser(userToDelete.id);
            forceRefresh();
            setUserToDelete(null);
            setDeleteConfirmOpen(false);
        }
    };

    return (
        <>
            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={() => { forceRefresh(); setIsModalOpen(false); }}
                userToEdit={userToEdit}
            />
            <Modal 
                isOpen={isDeleteConfirmOpen} 
                onClose={() => setDeleteConfirmOpen(false)} 
                title="Confirm Deletion" 
                size="md"
            >
                <p>Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.</p>
                <div className="flex justify-end gap-2 pt-6">
                    <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Delete User</Button>
                </div>
            </Modal>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">User Management</h2>
                        <p className="mt-1 text-text-secondary text-sm">Add, edit, or remove users from the system.</p>
                    </div>
                    <Button variant="primary" onClick={handleAddClick}><IconUserPlus/> Add User</Button>
                </div>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Role</Th>
                            <Th>Team</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users.map(u => (
                            <Tr key={u.id}>
                                <Td className="font-medium">{u.name}</Td>
                                <Td className="capitalize">{u.role}</Td>
                                <Td>{u.team || 'N/A'}</Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(u)}><IconEdit /> Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteClick(u)}><IconTrash /> Delete</Button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Card>
        </>
    );
};

// === TEAM STRUCTURE PANEL (Admin Only) ===
export const TeamStructurePanel: React.FC = () => {
    const teamData = useMemo(() => dataService.getTeamStructure(), []);
    const [selectedTeam, setSelectedTeam] = useState<TeamStructure>(teamData[0]);

    const TeamCard: React.FC<{ team: TeamStructure; memberType: 'buildTeam' | 'qaTeam' }> = ({ team, memberType }) => (
        <Card>
            <h3 className="font-bold text-lg mb-2 capitalize">{memberType === 'buildTeam' ? 'Build Team' : 'QA Team'}</h3>
            <ul className="space-y-2">
                {team[memberType].map(member => (
                    <li key={member.name} className="p-2 bg-surface-highlight rounded-md text-sm">
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-xs text-text-secondary">Buddy: {member.buddy}</p>
                        {member.notes && <p className="text-xs text-text-secondary">Notes: {member.notes}</p>}
                    </li>
                ))}
            </ul>
        </Card>
    );
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Team Structure & Buddies</h2>
             <div className="flex items-center gap-2 p-1 bg-surface-highlight rounded-lg w-fit">
                {teamData.map(team => (
                    <button 
                        key={team.name}
                        onClick={() => setSelectedTeam(team)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${selectedTeam.name === team.name ? 'bg-surface shadow text-primary' : 'text-text-secondary hover:bg-surface'}`}
                    >
                        {team.name}
                    </button>
                ))}
            </div>

            <Card>
                <h3 className="text-xl font-bold mb-4">{selectedTeam.name}</h3>
                <p className="text-text-secondary mb-4">Team Lead: <span className="font-semibold text-text-primary">{selectedTeam.lead}</span></p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TeamCard team={selectedTeam} memberType="buildTeam" />
                    <TeamCard team={selectedTeam} memberType="qaTeam" />
                </div>
            </Card>
        </div>
    );
};
