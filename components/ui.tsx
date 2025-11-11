import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, isToday, isValid } from 'date-fns';


// === ICONS ===
export const IconPublic = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
export const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
export const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
export const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
export const IconArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>;
export const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
export const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
export const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
export const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
export const IconUserPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>;
export const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
export const IconAlertTriangle = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
export const IconBarChart = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
export const IconFileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
export const IconBriefcase = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
export const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
export const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconCalendarInput = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconChevronUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const IconChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
// FIX: Updated IconPlay to accept props to handle className, and corrected kebab-case attributes to camelCase.
export const IconPlay = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
export const IconStop = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;
export const IconPause = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
export const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
export const IconSun = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
export const IconMoon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;


// Icons for overview stats
export const IconClipboardList = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
export const IconRefreshCw = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 12M20 20l-1.5-1.5A9 9 0 012.5 12" /></svg>;
export const IconCheckCircle = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const IconAlertCircle = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
export const IconBell = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;


// === STATUS BADGE ===
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (s: string) => {
    if (!s || s.toLowerCase() === 'n/a') return 'bg-gray-500/10 text-gray-400';
    const lowerStatus = s.toLowerCase();
    
    if (lowerStatus.includes('risk')) return 'bg-red-500/10 text-red-400';
    if (lowerStatus.includes('on track') || lowerStatus.includes('in progress')) return 'bg-green-500/10 text-green-400';
    if (lowerStatus.includes('completed')) return 'bg-blue-500/10 text-blue-400';
    if (lowerStatus.includes('pending') || lowerStatus.includes('review') || lowerStatus.includes('hold') || lowerStatus.includes('customer') || lowerStatus.includes('open')) return 'bg-yellow-500/10 text-yellow-400';
    
    return 'bg-gray-500/10 text-gray-400';
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block capitalize whitespace-nowrap ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};


// === CARD ===
interface CardProps {
  children: ReactNode;
  className?: string;
}
export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-surface rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

// === BUTTON ===
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}
export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = "rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover focus:ring-primary text-gray-900',
    secondary: 'bg-secondary hover:bg-indigo-500 focus:ring-secondary text-white',
    ghost: 'bg-transparent hover:bg-surface-highlight focus:ring-gray-400 text-text-secondary border border-border',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  };
  // FIX: Add support for a 'size' prop to control button padding and text size.
  const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2',
  };
  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// === INPUT & SELECT ===
const inputBaseClasses = "w-full bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder:text-gray-500";
export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className={inputBaseClasses} {...props} />;
export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select className={inputBaseClasses} {...props} />;

// === DATE PICKER ===
interface DatePickerProps {
    value: string | null; // Expects 'yyyy-MM-dd'
    onChange: (date: string | null) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayDate, setDisplayDate] = useState(new Date());
    const containerRef = useRef<HTMLDivElement>(null);
    const inputFormat = 'dd/MM/yyyy';
    const outputFormat = 'yyyy-MM-dd';

    useEffect(() => {
        const parsedDate = value ? parse(value, outputFormat, new Date()) : new Date();
        if (isValid(parsedDate)) {
            setDisplayDate(parsedDate);
        } else {
            setDisplayDate(new Date());
        }
    }, [value, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const monthStart = startOfMonth(displayDate);
    const monthEnd = endOfMonth(displayDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const selectedDate = value ? parse(value, outputFormat, new Date()) : null;

    const handleDateSelect = (day: Date) => {
        onChange(format(day, outputFormat));
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <Input
                    type="text"
                    readOnly
                    value={value && isValid(parse(value, outputFormat, new Date())) ? format(parse(value, outputFormat, new Date()), inputFormat) : ''}
                    onClick={() => setIsOpen(!isOpen)}
                    placeholder={inputFormat}
                    className="cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <IconCalendarInput />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-72 bg-surface rounded-lg shadow-lg border border-border p-3">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-text-primary">{format(displayDate, 'MMMM yyyy')}</span>
                        <div className="flex items-center">
                            <button type="button" onClick={() => setDisplayDate(subMonths(displayDate, 1))} className="p-1 rounded-full hover:bg-surface-highlight"><IconChevronUp /></button>
                            <button type="button" onClick={() => setDisplayDate(addMonths(displayDate, 1))} className="p-1 rounded-full hover:bg-surface-highlight"><IconChevronDown /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-text-secondary mb-2">
                        {daysOfWeek.map((day, i) => <div key={i}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, i) => (
                            <button
                                type="button"
                                key={i}
                                onClick={() => handleDateSelect(day)}
                                className={`
                                    w-full aspect-square text-sm rounded-md flex items-center justify-center transition-colors
                                    ${format(day, 'M') !== format(displayDate, 'M') ? 'text-gray-500' : 'text-text-primary'}
                                    ${isToday(day) && !isSameDay(day, selectedDate || 0) ? 'border border-gray-400' : ''}
                                    ${selectedDate && isValid(selectedDate) && isSameDay(day, selectedDate) ? 'bg-primary text-gray-900 font-bold' : 'hover:bg-surface-highlight'}
                                `}
                            >
                                {format(day, 'd')}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                         <Button type="button" variant="ghost" className="text-sm !py-1 !px-3 font-semibold" onClick={() => { onChange(null); setIsOpen(false); }}>Clear</Button>
                         <Button type="button" variant="ghost" className="text-sm !py-1 !px-3 font-semibold" onClick={() => handleDateSelect(new Date())}>Today</Button>
                    </div>
                </div>
            )}
        </div>
    );
};


// === TABLE ===
export const Table: React.FC<{ children: ReactNode }> = ({ children }) => <div className="overflow-x-auto"><table className="w-full text-left border-collapse">{children}</table></div>;
export const Thead: React.FC<{ children: ReactNode }> = ({ children }) => <thead className="bg-surface-highlight">{children}</thead>;
export const Tbody: React.FC<{ children: ReactNode }> = ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>;
// FIX: Updated Tr to safely handle className prop, consistent with Th/Td.
export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => <tr className={`hover:bg-surface-highlight ${className || ''}`} {...props}>{children}</tr>;
export const Th: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({ children, className, ...props }) => <th className={`p-3 text-xs font-semibold text-text-secondary uppercase tracking-wider ${className || ''}`} {...props}>{children}</th>;
export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => <td className={`p-3 text-sm text-text-primary ${className || ''}`} {...props}>{children}</td>;

// === MODAL ===
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl'
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = '2xl' }) => {
  if (!isOpen) return null;
  const sizeClasses = {
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className={`bg-surface rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-text-primary">
            <IconX />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// === PROGRESS BAR ===
export const ProgressBar: React.FC<{ progress: number, text: string }> = ({ progress, text }) => {
  const getProgressColor = (p: number) => {
    if (p >= 100) return 'bg-green-500';
    if (p >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  return (
    <div className="flex items-center gap-2">
      <div className="w-full bg-gray-600 rounded-full h-2.5">
        <div
          className={`${getProgressColor(progress)} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      <span className="text-sm font-semibold text-text-secondary w-12 text-right">{text}</span>
    </div>
  );
};