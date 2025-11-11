import React, { useState, useContext, createContext, ReactNode, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { User, UserRole, TeamName, Submission } from './types';
import { dataService } from './data';
import { Card, Button, IconUser, IconLock, IconArrowRight, IconPublic, IconLogout, IconUserPlus, IconPlus, IconEdit, IconAlertTriangle, IconBarChart, IconFileText, IconBriefcase, IconSun, IconMoon } from './components/ui';
import { DashboardOverviewPanel, UserManagement, TeamStructurePanel, ErrorLogsPanel, MetricsPanel, DMSPanel, ProjectsPanel } from './components/DashboardPanels';

// === THEME CONTEXT ===
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType>(null!);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
const useTheme = () => useContext(ThemeContext);


// === AUTHENTICATION CONTEXT ===
interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType>(null!);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, pass: string) => {
    const foundUser = dataService.getUsers().find(u => u.name === username && u.password === pass);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };
  const logout = () => { setUser(null); };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
const useAuth = () => useContext(AuthContext);


// === ROUTE GUARDS ===
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  if (!user) { return <Navigate to="/login" replace />; }
  return <>{children}</>;
};

const AdminOnlyRoute = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    if (user?.role !== UserRole.ADMIN) {
        return <Navigate to="/dashboard/overview" replace />;
    }
    return <>{children}</>;
};

// === LOGIN PAGE ===
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = (to: string) => { window.location.hash = to; };

  useEffect(() => {
    document.body.className = 'login-gradient text-white';
    return () => { document.body.className = 'bg-background text-text-primary'; }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = auth.login(username, password);
    if (success) {
      navigate('/dashboard/overview');
    } else {
      setError('Invalid username or password.');
    }
  };
  
  const VendastaLogo = () => (
      <svg width="48" height="48" viewBox="0 0 100 100" className="mx-auto">
          <path d="M50,5L95,27.5V72.5L50,95L5,72.5V27.5L50,5Z" fill="#34D399"/>
          <path d="M50,12.5L87.5,31.25V68.75L50,87.5L12.5,68.75V31.25L50,12.5Z" fill="white"/>
          <path d="M50,20L80,35V65L50,80L20,65V35L50,20Z" fill="#34D399"/>
          <path d="M50,50L72.5,38.75V61.25L50,72.5Z" fill="white"/>
          <path d="M50,50L27.5,38.75V61.25L50,72.5Z" fill="#E5E7EB"/>
      </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 space-y-6 rounded-2xl glassmorphism">
        <div className="text-center space-y-4">
            <VendastaLogo />
            <p className="text-4xl tracking-widest font-light">VENDASTA</p>
            <h1 className="text-xl font-bold">Vendasta Websites CRM</h1>
            <p className="text-gray-300 text-sm">Sign in to access your dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><IconUser /></span>
                <input type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required 
                className="w-full bg-white/10 border border-gray-500 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-white text-white"/>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><IconLock /></span>
                <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required 
                className="w-full bg-white/10 border border-gray-500 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-white text-white"/>
            </div>
          </div>
           <div>
            <label className="text-sm font-medium">Role</label>
             <select className="w-full bg-white/10 border border-gray-500 rounded-md py-2 px-3 mt-1 focus:outline-none focus:ring-2 focus:ring-white text-white">
                <option className="bg-gray-700">Select your role</option>
                <option className="bg-gray-700">Master Admin</option>
                <option className="bg-gray-700">Developer</option>
                <option className="bg-gray-700">QA</option>
            </select>
           </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <Button type="submit" className="w-full !bg-white !text-secondary hover:!bg-gray-200 !font-bold">
            <span>Sign In</span><IconArrowRight />
          </Button>
        </form>
        <div className="text-center">
            <a href="#" className="text-sm text-gray-300 hover:underline">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

// === PUBLIC DASHBOARD ===
const PublicDashboard = () => (
    <div>
        <Header />
        <div className="p-8">
            <h1 className="text-3xl font-bold">Public Submissions Overview</h1>
        </div>
    </div>
);


// === LAYOUT COMPONENTS ===
const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = (to: string) => { window.location.hash = to; };
    
    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <header className="bg-header-bg text-text-primary shadow-md border-b border-border">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/dashboard/overview" className="flex items-center">
                        <span className="font-bold text-xl">Vendasta Websites CRM</span>
                    </Link>
                    <div className="flex items-center space-x-6 text-sm font-medium">
                        <Link to="/public" className="text-text-secondary hover:text-text-primary transition-colors duration-200 flex items-center gap-2"><IconPublic /><span>Public Overview</span></Link>
                         <button onClick={toggleTheme} className="text-text-secondary hover:text-text-primary">
                            {theme === 'dark' ? <IconSun /> : <IconMoon />}
                        </button>
                        {user && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                                </div>
                                <img className="h-10 w-10 rounded-full object-cover bg-gray-500" src={`https://i.pravatar.cc/150?u=${user.id}`} alt="avatar" />
                                <button onClick={handleLogout} title="Logout" className="text-text-secondary hover:text-text-primary"><IconLogout /></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

const Sidebar = () => {
    const { user } = useAuth();
    
    const allMenuItems = [
        { name: 'Overview', path: '/dashboard/overview', icon: <IconPublic />, adminOnly: false },
        { name: 'Projects', path: '/dashboard/projects', icon: <IconBriefcase />, adminOnly: false },
        { name: 'Error Logs', path: '/dashboard/errors', icon: <IconAlertTriangle />, adminOnly: false },
        { name: 'Metrics', path: '/dashboard/metrics', icon: <IconBarChart />, adminOnly: false },
        { name: 'DMS', path: '/dashboard/dms', icon: <IconFileText />, adminOnly: false },
        { name: 'User Management', path: '/dashboard/users', icon: <IconUser />, adminOnly: true },
        { name: 'Team Structure', path: '/dashboard/structure', icon: <IconUserPlus />, adminOnly: true }
    ];

    const menuItems = allMenuItems.filter(item => !item.adminOnly || user?.role === UserRole.ADMIN);
    
    return (
        <aside className="w-64 bg-surface flex-shrink-0 p-4 border-r border-border">
            <nav className="flex flex-col space-y-2">
                {menuItems.map(item => (
                    <NavLink key={item.name} to={item.path}
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive ? 'bg-secondary text-white' : 'text-text-secondary hover:bg-surface-highlight hover:text-text-primary'}`
                        }>
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

const DashboardLayout = () => {
    const { user } = useAuth();
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!user) return null; // Should be handled by ProtectedRoute, but good for safety

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet context={{ user, tick }} />
            </main>
        </div>
      </div>
    );
};

// === MAIN APP COMPONENT ===
export default function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
            <HashRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/public" element={<PublicDashboard />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<DashboardOverviewPanel />} />
                <Route path="projects" element={<ProjectsPanel />} />
                <Route path="errors" element={<ErrorLogsPanel />} />
                <Route path="metrics" element={<MetricsPanel />} />
                <Route path="dms" element={<DMSPanel />} />
                <Route path="users" element={<AdminOnlyRoute><UserManagement /></AdminOnlyRoute>} />
                <Route path="structure" element={<AdminOnlyRoute><TeamStructurePanel /></AdminOnlyRoute>} />
                </Route>

                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
            </HashRouter>
        </AuthProvider>
    </ThemeProvider>
  );
}
