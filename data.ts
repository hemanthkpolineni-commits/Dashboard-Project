import { User, UserRole, Submission, TaskStatus, TeamStructure, TeamName, SubmissionStats, ErrorLog, UserMetric, DmsDocument, Notification, TimerState } from './types';
import { subDays, format, startOfDay, startOfMonth, endOfMonth, addDays } from 'date-fns';

let users: User[] = [
  { id: 'u1', name: 'Hemanth', role: UserRole.ADMIN, password: 'admin' },
  { id: 'u2', name: 'Alice (Developer)', role: UserRole.USER, password: 'user' },
  { id: 'u3', name: 'Akshat', role: UserRole.USER, team: 'High Velocity', password: 'user' },
  { id: 'u4', name: 'Sathish', role: UserRole.USER, team: 'High Velocity', password: 'user' },
  { id: 'u5', name: 'Suriya', role: UserRole.USER, team: 'High Velocity', password: 'user' },
  { id: 'u6', name: 'Srinivasa', role: UserRole.USER, team: 'High Velocity', password: 'user' },
  { id: 'u7', name: 'Pradeep', role: UserRole.USER, team: 'High Velocity', password: 'user' },
  { id: 'u8', name: 'Nishtha', role: UserRole.USER, team: 'High Velocity', password: 'user' },
  { id: 'u9', name: 'Arun', role: UserRole.USER, team: 'High Velocity', password: 'user' },
  { id: 'u10', name: 'Kavin', role: UserRole.USER, team: 'High Velocity', password: 'user' },
  { id: 'u11', name: 'Krishna', role: UserRole.USER, team: 'Agency', password: 'user' },
  { id: 'u12', name: 'Niharika', role: UserRole.USER, team: 'Agency', password: 'user' },
  { id: 'u13', name: 'Sheethal', role: UserRole.USER, team: 'Agency', password: 'user' },
  { id: 'u14', name: 'Priya', role: UserRole.USER, team: 'Agency', password: 'user' },
  { id: 'u15', name: 'Shahzad', role: UserRole.USER, team: 'Agency', password: 'user' },
  { id: 'u16', name: 'Shiraz', role: UserRole.USER, team: 'Agency', password: 'user' },
  { id: 'u17', name: 'Theresa', role: UserRole.USER, team: 'Agency', password: 'user' },
];

let submissions: Submission[] = [
    { 
        id: 's1', 
        title: 'HV Project Alpha', 
        projectType: 'Homepage build',
        submitterName: 'Hemanth',
        developerId: 'u3',
        buildDueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        devTaskHours: 8,
        qaId: 'u8',
        qaDueDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
        qaTaskHours: 4,
        team: 'High Velocity', 
        status: TaskStatus.IN_PROGRESS, 
        createdDate: format(new Date(), 'yyyy-MM-dd'),
        loggedHours: 3.5,
        timerState: TimerState.RUNNING,
        timerStartTime: Date.now() - (3.5 * 3600 * 1000),
        lastTick: Date.now(),
        projectStatus: 'On Track',
        taskTitle: 'Initial Build',
    },
    { 
        id: 's2', 
        title: 'Agency Site Build', 
        projectType: 'Revision',
        submitterName: 'Hemanth',
        developerId: 'u11',
        buildDueDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        devTaskHours: 16,
        qaId: 'u14',
        qaDueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        qaTaskHours: 6,
        team: 'Agency', 
        status: TaskStatus.COMPLETED, 
        createdDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        loggedHours: 16,
        timerState: TimerState.STOPPED,
        timerStartTime: null,
        lastTick: 0,
        projectStatus: 'Completed',
        taskTitle: 'Final Revisions',
    },
];

let errorLogs: ErrorLog[] = [
    { id: 'e1', submissionId: 's1', description: 'API endpoint returning 500 error on form submission.', reportedById: 'u8', timestamp: new Date().toISOString() },
    { id: 'e2', submissionId: 's2', description: 'CSS grid breaking on mobile viewport.', reportedById: 'u14', timestamp: subDays(new Date(), 1).toISOString() },
];

let notifications: Notification[] = [
    { id: 'n1', userId: 'u3', text: 'Hemanth assigned you as Developer on project: HV Project Alpha. Due: ' + format(addDays(new Date(), 7), 'MMM dd, yyyy'), timestamp: new Date().toISOString(), read: false },
    { id: 'n2', userId: 'u8', text: 'Hemanth assigned you as QA on project: HV Project Alpha. Due: ' + format(addDays(new Date(), 10), 'MMM dd, yyyy'), timestamp: new Date().toISOString(), read: true },
    { id: 'n3', userId: 'u11', text: 'Hemanth assigned you as Developer on project: Agency Site Build.', timestamp: subDays(new Date(), 1).toISOString(), read: true },
];

// Mock metrics with timestamps
const generateMetrics = (userId: string, dailyHours: number[]): UserMetric[] => {
    return dailyHours.map((hours, i) => ({
        id: `m${userId}${i}${Date.now()}`,
        userId,
        timestamp: startOfDay(subDays(new Date(), i + 1)).getTime(),
        hours,
    }));
};
let userMetrics: UserMetric[] = [
    ...generateMetrics('u3', [7.5, 8, 6, 7, 6.5, 0, 0]), // Akshat (High)
    ...generateMetrics('u4', [6.0, 5.5, 6.2, 5.0, 5.8, 0, 0]), // Sathish (Mid)
    ...generateMetrics('u5', [4.0, 4.5, 5.0, 3.5, 4.2, 0, 0]), // Suriya (Low)
    ...generateMetrics('u11', [8.0, 8.2, 7.5, 6.9, 7.8, 0, 0]), // Krishna (High)
    ...generateMetrics('u12', [3.0, 4.1, 2.5, 5.0, 4.5, 0, 0]), // Niharika (Low)
    // Add data for a previous month for testing filter
    { id: 'm-prev1', userId: 'u3', timestamp: subDays(new Date(), 35).getTime(), hours: 8.5 },
    { id: 'm-prev2', userId: 'u11', timestamp: subDays(new Date(), 40).getTime(), hours: 7.0 },
];

let dmsDocuments: DmsDocument[] = [
    { id: 'd1', title: 'Onboarding Guide for New Developers', content: '...', authorId: 'u1', lastUpdated: format(subDays(new Date(), 10), 'yyyy-MM-dd') },
    { id: 'd2', title: 'QA Testing Protocol v2.1', content: '...', authorId: 'u1', lastUpdated: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
    { id: 'd3', title: 'Style Guide for Agency Projects', content: '...', authorId: 'u1', lastUpdated: format(subDays(new Date(), 20), 'yyyy-MM-dd') },
];

const teamStructureData: TeamStructure[] = [
  {
    name: 'High Velocity',
    lead: 'John',
    buildTeam: [
      { name: 'Akshat', buddy: 'Sathish, Srinivasa', notes: '2YOK, Agency SKU' },
      { name: 'Sathish', buddy: 'Srinivasa, Akshat', notes: '-' },
      { name: 'Suriya', buddy: 'Pradeep, Sathish', notes: '-' },
      { name: 'Srinivasa', buddy: 'Akshat, Sathish, Pradeep', notes: '-' },
      { name: 'Pradeep', buddy: 'Suriya, Srinivasa', notes: '-' },
    ],
    qaTeam: [
      { name: 'Nishtha', buddy: 'Kavin, Arun', notes: '2YOK' },
      { name: 'Arun', buddy: 'Nishtha, Kavin', notes: '-' },
      { name: 'Kavin', buddy: 'Nishtha, Pradeep', notes: '-' },
    ],
  },
  {
    name: 'Agency',
    lead: 'Theresa',
    buildTeam: [
      { name: 'Hemanth', buddy: 'Krishna, Sheethal, Nithish', notes: 'IMAU' },
      { name: 'Krishna', buddy: 'Hemanth, Niharika', notes: '-' },
      { name: 'Niharika', buddy: 'Krishna, Sheethal', notes: '-' },
      { name: 'Sheethal', buddy: 'Hemanth, Niharika', notes: 'Agency SKU, QM1P, DW' },
    ],
    qaTeam: [
      { name: 'Priya', buddy: 'Shahzad, Shiraz', notes: 'QM1P, IMAU' },
      { name: 'Shahzad', buddy: 'Priya, Shiraz', notes: 'CJ61' },
      { name: 'Shiraz', buddy: 'Shahzad, Priya, Ana', notes: '-' },
      { name: 'Theresa', buddy: '-', notes: '-' },
    ],
  },
  {
    name: 'Verticals',
    lead: 'Swaminathan',
    buildTeam: [
      { name: 'Geeth', buddy: 'Nithish, JD', notes: '-' },
      { name: 'Nithish', buddy: 'Geeth, JD', notes: '53JK' },
      { name: 'JD', buddy: 'Nithish, Geeth', notes: 'CJ61' },
    ],
    qaTeam: [
      { name: 'Bill', buddy: 'Preet, Jireh', notes: 'Agency SKU' },
      { name: 'Preet', buddy: 'Bill, Jireh', notes: 'Agency SKU, DW' },
      { name: 'Jireh', buddy: 'Bill, Preet', notes: '53JK, Agency SKU' },
    ],
  },
  {
    name: 'BroadlyDuda',
    lead: 'Shivaraman',
    buildTeam: [
      { name: 'Nehemiah', buddy: 'Ana, Shiraz', notes: '-' },
      { name: 'Hemanth', buddy: 'Krishna, Sheethal, Nithish', notes: '-' },
      { name: 'Geethpriya', buddy: 'Nithish, JD', notes: '-' },
      { name: 'Nithish', buddy: 'JD', notes: '-' },
      { name: 'JD', buddy: 'Nithish, Geeth', notes: '-' },
      { name: 'Akshat', buddy: '-', notes: '-' },
      { name: 'Sathish', buddy: 'Srinivasa, Akshat', notes: '-' },
    ],
    qaTeam: [
      { name: 'Ana', buddy: 'Shahzad, Priya, Ana', notes: '-' },
      { name: 'Shiraz', buddy: 'Shahzad, Priya, Ana', notes: '-' },
    ],
  },
];

const validTeamNames = new Set<string>(['High Velocity', 'Agency', 'Verticals', 'BroadlyDuda']);

// A specific type for data coming from the CSV parser to be used in addMultipleSubmissions
type CsvSubmissionData = Partial<Omit<Submission, 'id'>> & {
    assigneeName?: string;
};


export const dataService = {
  getUsers: (): User[] => users,
  getUserById: (id: string): User | undefined => users.find(u => u.id === id),
  getUserByName: (name: string): User | undefined => users.find(u => u.name.toLowerCase() === name.toLowerCase()),
  addUser: (user: Omit<User, 'id'>): User => {
    const newUser = { ...user, id: `u${Date.now()}` };
    users.push(newUser);
    return newUser;
  },
  updateUser: (userId: string, updatedData: Partial<Omit<User, 'id'>>): User | null => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    
    // Don't update password if it's an empty string
    if (updatedData.password === '') {
      delete updatedData.password;
    }

    users[userIndex] = { ...users[userIndex], ...updatedData };
    return users[userIndex];
  },
  deleteUser: (userId: string): void => {
    users = users.filter(u => u.id !== userId);
  },

  getSubmissions: (): Submission[] => submissions,
  getSubmissionById: (id: string): Submission | undefined => submissions.find(s => s.id === id),
  getTeamSubmissions: (teamName: TeamName): Submission[] => submissions.filter(s => s.team === teamName),
  
  getSubmissionsCount: (): Record<TeamName, SubmissionStats> => {
    const today = new Date().toISOString().split('T')[0];
    const counts: Record<TeamName, SubmissionStats> = {
        'High Velocity': { today: 0, total: 0 },
        'Agency': { today: 0, total: 0 },
        'Verticals': { today: 0, total: 0 },
        'BroadlyDuda': { today: 0, total: 0 },
    };

    submissions.forEach(sub => {
        if (counts[sub.team]) {
            counts[sub.team].total++;
            if (sub.createdDate === today) {
                counts[sub.team].today++;
            }
        }
    });

    return counts;
  },

  addSubmission: (newSubmission: Partial<Omit<Submission, 'id' | 'timerState' | 'timerStartTime' | 'lastTick'>>): void => {
    const completeSubmission: Submission = {
      // Default values for all submission fields
      title: 'Untitled',
      projectType: 'N/A',
      submitterName: 'System',
      developerId: null,
      buildDueDate: null,
      devTaskHours: null,
      qaId: null,
      qaDueDate: null,
      qaTaskHours: null,
      team: 'Agency', 
      status: TaskStatus.PENDING,
      createdDate: new Date().toISOString().split('T')[0],
      projectPartnerName: '',
      projectPartnerId: '',
      projectAccountName: '',
      projectAccountId: '',
      projectStatus: '',
      taskTitle: '',
      // Override with provided values
      ...newSubmission,
      // System-generated values
      id: `s${Date.now()}`,
      loggedHours: 0,
      timerState: TimerState.STOPPED,
      timerStartTime: null,
      lastTick: 0,
    };
    submissions.unshift(completeSubmission);
  },

  updateSubmission: (submissionId: string, updatedData: Partial<Omit<Submission, 'id'>>): Submission | null => {
    const subIndex = submissions.findIndex(s => s.id === submissionId);
    if (subIndex === -1) return null;

    const originalSubmission = { ...submissions[subIndex] };
    
    submissions[subIndex] = { ...originalSubmission, ...updatedData };
    const updatedSubmission = submissions[subIndex];
    
    if (updatedData.developerId && updatedData.developerId !== originalSubmission.developerId) {
        const dueDateText = updatedSubmission.buildDueDate ? ` Due: ${format(new Date(updatedSubmission.buildDueDate), 'MMM dd, yyyy')}` : '';
        dataService.addNotification(updatedData.developerId, `${updatedSubmission.submitterName} assigned you as Developer on project: ${updatedSubmission.title}.${dueDateText}`);
    }
    if (updatedData.qaId && updatedData.qaId !== originalSubmission.qaId) {
        const dueDateText = updatedSubmission.qaDueDate ? ` Due: ${format(new Date(updatedSubmission.qaDueDate), 'MMM dd, yyyy')}` : '';
        dataService.addNotification(updatedData.qaId, `${updatedSubmission.submitterName} assigned you as QA on project: ${updatedSubmission.title}.${dueDateText}`);
    }

    return updatedSubmission;
  },

  deleteSubmissions: (ids: string[]): void => {
    const idSet = new Set(ids);
    submissions = submissions.filter(s => !idSet.has(s.id));
  },

  addMultipleSubmissions: (newSubmissions: CsvSubmissionData[]): { successCount: number; errorCount: number; duplicateCount: number; errors: string[] } => {
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];
    const validTaskStatuses = Object.values(TaskStatus);

    newSubmissions.forEach((sub, index) => {
        const rowNum = index + 2;

        if (!sub.title) {
            errors.push(`Row ${rowNum}: 'PROJECT TITLE' is missing.`);
            errorCount++;
            return;
        }

        if (submissions.some(s => s.title === sub.title && s.taskTitle === sub.taskTitle)) {
            duplicateCount++;
            return;
        }

        let finalDeveloperId = sub.developerId || null;
        const assigneeName = sub.assigneeName;
        if (assigneeName && !finalDeveloperId) {
            const team = sub.team;
            if (team && validTeamNames.has(team)) {
                const newUser = dataService.addUser({
                    name: assigneeName,
                    password: 'user', // Default password
                    role: UserRole.USER,
                    team: team,
                });
                finalDeveloperId = newUser.id;
            } else {
                errors.push(`Row ${rowNum}: New assignee '${assigneeName}' found, but team is missing or invalid. Cannot create user.`);
                errorCount++;
                return;
            }
        }
        
        const incomingStatus = sub.status ? String(sub.status).trim() : '';
        let matchedStatus: TaskStatus | undefined;
        if (incomingStatus) {
            const lowerCaseStatus = incomingStatus.toLowerCase();
            for (const validStatus of validTaskStatuses) {
                if (validStatus.toLowerCase() === lowerCaseStatus) {
                    matchedStatus = validStatus;
                    break;
                }
            }
        }
        if (!matchedStatus) {
            errors.push(`Row ${rowNum}: 'TASK STATUS' is missing or invalid. Received: "${incomingStatus || 'empty'}".`);
            errorCount++;
            return;
        }

        if (!sub.team || !validTeamNames.has(sub.team)) {
            errors.push(`Row ${rowNum}: Team is missing or invalid. Assign a valid team or a user who belongs to a team.`);
            errorCount++;
            return;
        }

        submissions.push({
            id: `s${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdDate: sub.createdDate || new Date().toISOString().split('T')[0],
            title: sub.title,
            team: sub.team,
            status: matchedStatus,
            projectType: sub.taskTitle || sub.projectType || 'N/A',
            submitterName: sub.submitterName || 'System',
            developerId: finalDeveloperId,
            buildDueDate: sub.buildDueDate || null,
            devTaskHours: sub.devTaskHours || null,
            qaId: sub.qaId || null,
            qaDueDate: sub.qaDueDate || null,
            qaTaskHours: sub.qaTaskHours || null,
            loggedHours: sub.loggedHours || 0,
            timerState: TimerState.STOPPED,
            timerStartTime: null,
            lastTick: 0,
            projectPartnerName: sub.projectPartnerName,
            projectPartnerId: sub.projectPartnerId,
            projectAccountName: sub.projectAccountName,
            projectAccountId: sub.projectAccountId,
            projectStatus: sub.projectStatus,
            taskTitle: sub.taskTitle,
        });
        successCount++;
    });

    return { successCount, errorCount, duplicateCount, errors };
  },

  getTeamStructure: (): TeamStructure[] => teamStructureData,
  
  getErrorLogs: (): ErrorLog[] => errorLogs,
  
  addErrorLog: (log: { submissionId: string, description: string, reportedById: string }): ErrorLog => {
    const newLog: ErrorLog = {
      id: `e${Date.now()}`,
      submissionId: log.submissionId,
      description: log.description,
      reportedById: log.reportedById,
      timestamp: new Date().toISOString(),
    };
    errorLogs.unshift(newLog); // Add to the top of the list
    return newLog;
  },

  getDmsDocuments: (): DmsDocument[] => dmsDocuments,

  getRawMetrics: (): UserMetric[] => userMetrics,
  
  addMetric: (metric: { userId: string, hours: number, date: string }): UserMetric => {
      const newMetric: UserMetric = {
          id: `m${Date.now()}`,
          userId: metric.userId,
          hours: metric.hours,
          timestamp: startOfDay(new Date(metric.date)).getTime()
      };
      userMetrics.push(newMetric);
      return newMetric;
  },
  
  logTimeToMetric: ({ userId, hours }: { userId: string, hours: number }): void => {
    const todayTimestamp = startOfDay(new Date()).getTime();
    const existingMetric = userMetrics.find(m => m.userId === userId && m.timestamp === todayTimestamp);

    if (existingMetric) {
        existingMetric.hours += hours;
    } else {
        const newMetric: UserMetric = {
            id: `m${Date.now()}`,
            userId,
            hours,
            timestamp: todayTimestamp
        };
        userMetrics.push(newMetric);
    }
  },

  getDashboardStats: (user: User): {
    totalSubmissions: number;
    inProgress: number;
    pending: number;
    completed: number;
    totalErrors: number;
    avgUtilization: number;
    projectStatusCounts: Record<string, number>;
    taskStatusCounts: Record<string, number>;
    teamProjectCounts: Record<TeamName, number>;
  } => {
    const relevantSubmissions = user.role === UserRole.ADMIN 
      ? submissions 
      : submissions.filter(s => s.team === user.team);
    
    const relevantUsers = user.role === UserRole.ADMIN
      ? users.filter(u => u.role === UserRole.USER)
      : users.filter(u => u.team === user.team);

    const relevantUserIds = new Set(relevantUsers.map(u => u.id));

    const totalSubmissions = relevantSubmissions.length;
    const inProgress = relevantSubmissions.filter(s => s.status === TaskStatus.IN_PROGRESS).length;
    const pending = relevantSubmissions.filter(s => s.status === TaskStatus.PENDING || s.status === TaskStatus.QA_REVIEW).length;
    const completed = relevantSubmissions.filter(s => s.status === TaskStatus.COMPLETED).length;

    const relevantErrorLogs = user.role === UserRole.ADMIN
        ? errorLogs
        : errorLogs.filter(log => {
            const sub = submissions.find(s => s.id === log.submissionId);
            return sub && sub.team === user.team;
        });
    const totalErrors = relevantErrorLogs.length;

    const projectStatusCounts: Record<string, number> = {};
    const taskStatusCounts: Record<string, number> = {};
    const teamProjectCounts: Record<TeamName, number> = {
        'High Velocity': 0, 'Agency': 0, 'Verticals': 0, 'BroadlyDuda': 0
    };

    relevantSubmissions.forEach(sub => {
        const pStatus = sub.projectStatus || 'N/A';
        projectStatusCounts[pStatus] = (projectStatusCounts[pStatus] || 0) + 1;
        
        const tStatus = sub.status;
        taskStatusCounts[tStatus] = (taskStatusCounts[tStatus] || 0) + 1;

        if (teamProjectCounts.hasOwnProperty(sub.team)) {
            teamProjectCounts[sub.team]++;
        }
    });

    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    const metricsForPeriod = userMetrics.filter(m => {
        const metricDate = new Date(m.timestamp);
        return relevantUserIds.has(m.userId) && metricDate >= startDate && metricDate <= endDate;
    });

    const userHours: Record<string, { totalHours: number, days: number }> = {};
    relevantUserIds.forEach(id => {
        userHours[id] = { totalHours: 0, days: 0 };
    });

    metricsForPeriod.forEach(m => {
        if (userHours[m.userId]) {
            userHours[m.userId].totalHours += m.hours;
            if (m.hours > 0) userHours[m.userId].days++;
        }
    });
    
    const totalHoursAllUsers = Object.values(userHours).reduce((sum, data) => sum + data.totalHours, 0);
    const totalDaysAllUsers = Object.values(userHours).reduce((sum, data) => sum + data.days, 0);
    const avgUtilization = totalDaysAllUsers > 0 ? totalHoursAllUsers / totalDaysAllUsers : 0;
    
    return {
        totalSubmissions, inProgress, pending, completed, totalErrors, avgUtilization,
        projectStatusCounts, taskStatusCounts, teamProjectCounts,
    };
  },
  
  getNotificationsForUser: (userId: string): Notification[] => {
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addNotification: (userId: string | null, text: string): void => {
      if (!userId) return;
      notifications.unshift({
          id: `n${Date.now()}`,
          userId,
          text,
          timestamp: new Date().toISOString(),
          read: false,
      });
  },

  getFilteredUserMetrics: (filters: { 
    team?: TeamName; 
    userId?: string; 
    lead?: string; 
    startDate?: Date; 
    endDate?: Date 
  }): { user: User; avgHours: number, totalHours: number, days: number }[] => {
    let metrics = userMetrics;

    if (filters.startDate && filters.endDate) {
        const start = filters.startDate.getTime();
        const end = filters.endDate.getTime();
        metrics = metrics.filter(metric => metric.timestamp >= start && metric.timestamp <= end);
    }
    
    let relevantUsers = users.filter(u => u.role === UserRole.USER);

    if (filters.lead) {
        const teamOfLead = teamStructureData.find(t => t.lead === filters.lead);
        if (teamOfLead) {
            relevantUsers = relevantUsers.filter(u => u.team === teamOfLead.name);
        }
    } else if (filters.team) {
        relevantUsers = relevantUsers.filter(u => u.team === filters.team);
    }
    
    if (filters.userId) {
        relevantUsers = relevantUsers.filter(u => u.id === filters.userId);
    }
    
    const relevantUserIds = new Set(relevantUsers.map(u => u.id));
    
    const userMetricsMap: Record<string, { totalHours: number; days: number }> = {};
    
    relevantUserIds.forEach(id => {
        userMetricsMap[id] = { totalHours: 0, days: 0 };
    });

    metrics.forEach(metric => {
      if (relevantUserIds.has(metric.userId)) {
        userMetricsMap[metric.userId].totalHours += metric.hours;
        if (metric.hours > 0) {
          userMetricsMap[metric.userId].days++;
        }
      }
    });

    return Object.keys(userMetricsMap).map(userId => {
      const user = users.find(u => u.id === userId);
      if (!user) return null;
      const data = userMetricsMap[userId];
      const avgHours = data.days > 0 ? data.totalHours / data.days : 0;
      return { user, avgHours, totalHours: data.totalHours, days: data.days };
    }).filter(Boolean) as { user: User; avgHours: number; totalHours: number; days: number }[];
  },
  
  getDailyMetricsForUser: (userId: string, startDate: Date, endDate: Date): UserMetric[] => {
      const start = startDate.getTime();
      const end = endDate.getTime();
      return userMetrics
          .filter(metric => metric.userId === userId && metric.timestamp >= start && metric.timestamp <= end)
          .sort((a, b) => a.timestamp - b.timestamp);
  },
};