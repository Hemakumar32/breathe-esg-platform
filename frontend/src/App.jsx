import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Upload, Database, Activity,
  CheckSquare, CheckCircle, BarChart3,
  Settings, Ruler, Building2, Users, FileText,
  Bell, ChevronDown, Leaf, Lock
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ReviewPage from './pages/ReviewPage';
import LoginPage from './pages/LoginPage';
import IngestionRunsPage from './pages/IngestionRunsPage';
import MyApprovalsPage from './pages/MyApprovalsPage';
import ApprovedDataPage from './pages/ApprovedDataPage';
import DataSourcesPage from './pages/DataSourcesPage';
import ReportsPage from './pages/ReportsPage';
import EmissionFactorsPage from './pages/EmissionFactorsPage';
import UnitsPage from './pages/UnitsPage';
import FacilitiesPage from './pages/FacilitiesPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import LockedRecordsPage from './pages/LockedRecordsPage';

function Sidebar({ isCollapsed, onToggleCollapse }) {
  const location = useLocation();
  const [tooltip, setTooltip] = React.useState(null);
  
  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      ]
    },
    {
      title: 'INGESTION',
      items: [
        { path: '/upload', label: 'Upload Data', icon: <Upload size={18} /> },
        { path: '/sources', label: 'Data Sources', icon: <Database size={18} /> },
        { path: '/runs', label: 'Ingestion Runs', icon: <Activity size={18} /> },
      ]
    },
    {
      title: 'REVIEW',
      items: [
        { path: '/review', label: 'Review Dashboard', icon: <CheckSquare size={18} /> },
        { path: '/approvals', label: 'My Approvals', icon: <CheckCircle size={18} /> },
      ]
    },
    {
      title: 'DATA',
      items: [
        { path: '/approved', label: 'Approved Data', icon: <CheckCircle size={18} /> },
        { path: '/locked-records', label: 'Locked Records', icon: <Lock size={18} /> },
        { path: '/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { path: '/factors', label: 'Emission Factors', icon: <Settings size={18} /> },
        { path: '/units', label: 'Units', icon: <Ruler size={18} /> },
        { path: '/facilities', label: 'Facilities', icon: <Building2 size={18} /> },
        { path: '/users', label: 'Users', icon: <Users size={18} /> },
        { path: '/audit', label: 'Audit Logs', icon: <FileText size={18} /> },
      ]
    }
  ];

  return (
    <React.Fragment>
      <div className={`fixed top-0 left-0 h-screen bg-white flex flex-col border-r border-gray-200 z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`h-20 shrink-0 bg-white border-b border-gray-100 flex items-center transition-all duration-300 ${isCollapsed ? 'px-3 flex-col justify-center gap-2' : 'px-6 justify-between'}`}>
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <Leaf className="text-[#2563eb] fill-[#2563eb] shrink-0" size={24} />
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-[#2563eb] tracking-tight">
                Breathe <span className="font-medium">ESG</span>
              </h1>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-[#2563eb] p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>
        <nav className={`flex-1 overflow-y-auto pb-6 mt-4 space-y-2 ${isCollapsed ? 'collapsed-scrollbar' : 'custom-scrollbar'}`}>
          {menuGroups.map((group, idx) => (
            <React.Fragment key={idx}>
              {group.items.map((item) => {
                const active = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onMouseEnter={(e) => {
                      if (isCollapsed) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ label: item.label, top: rect.top + rect.height / 2, left: rect.right + 12 });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    className={`flex items-center transition-all duration-200 text-[15px] font-semibold ${
                      isCollapsed
                        ? `w-12 h-12 justify-center mx-auto rounded-xl ${active ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/20' : 'text-[#2563eb] hover:bg-[#eff6ff]'}`
                        : `gap-3.5 py-2.5 px-4 mx-3.5 rounded-xl ${active ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/20' : 'text-[#2563eb] hover:bg-[#eff6ff]'}`
                    }`}
                  >
                    <span className={`shrink-0 transition-colors duration-200 ${active ? 'text-white' : 'text-[#2563eb]'}`}>{item.icon}</span>
                    {!isCollapsed && <span className="transition-opacity duration-300">{item.label}</span>}
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
        </nav>
        <div className="p-4 border-t border-[#eff6ff] bg-white shrink-0">
          <button
            onClick={onToggleCollapse}
            className={`flex items-center gap-2 text-[15px] font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors w-full ${isCollapsed ? 'justify-center' : 'px-2'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-[200] px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-md whitespace-nowrap pointer-events-none"
          style={{ top: tooltip.top, left: tooltip.left, transform: 'translateY(-50%)' }}
        >
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></span>
          {tooltip.label}
        </div>
      )}
    </React.Fragment>
  );
}

function TopHeader({ title, onLogout }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [selectedCorp, setSelectedCorp] = React.useState(localStorage.getItem('selectedCorp') || 'Acme Corporation');
  
  const handleCorpChange = (e) => {
    const val = e.target.value;
    setSelectedCorp(val);
    localStorage.setItem('selectedCorp', val);
    window.dispatchEvent(new Event('corporationChanged'));
  };

  const initialNotifications = [
    { id: 1, message: "SAP data file imported successfully.", time: "5 mins ago", unread: true, path: "/runs" },
    { id: 2, message: "2 Validation issues require review in My Approvals.", time: "15 mins ago", unread: true, path: "/approvals" },
    { id: 3, message: "Natural gas emission factor updated for DEFRA 2024.", time: "1 hour ago", unread: false, path: "/factors" },
  ];

  const [notifications, setNotifications] = React.useState(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialNotifications;
  });

  React.useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleNotificationClick = (n) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
    navigate(n.path);
    setShowNotifications(false);
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getCorpSelectClass = (corp) => {
    let base = "appearance-none pl-9 pr-8 py-2 text-sm font-bold rounded-lg outline-none cursor-pointer transition-all shadow-sm border ";
    if (corp === 'Acme Corporation') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (corp === 'Global Industries') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (corp === 'Tech Solutions Inc') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const getCorpColorClass = (corp) => {
    if (corp === 'Acme Corporation') return "text-blue-500";
    if (corp === 'Global Industries') return "text-emerald-500";
    if (corp === 'Tech Solutions Inc') return "text-purple-500";
    return "text-gray-400";
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        {/* Left side empty since pages already render their own titles */}
      </div>
      <div className="flex items-center gap-6">

        {/* Notifications Icon and Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-lg py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-900">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-bold">{unreadCount} New</span>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.filter(n => n.unread).length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-gray-400 font-semibold">
                    No new notifications
                  </div>
                ) : (
                  notifications.filter(n => n.unread).map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 flex gap-3 items-start bg-blue-50/20"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-gray-900 font-bold">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{n.time}</p>
                      </div>
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* Corporation Dropdown */}
        <div className="relative">
          <Building2 size={16} className={`${getCorpColorClass(selectedCorp)} absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300`} />
          <select 
            value={selectedCorp}
            onChange={handleCorpChange}
            className={getCorpSelectClass(selectedCorp)}
          >
            <option value="Acme Corporation" className="text-blue-700 bg-blue-50 font-bold" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff' }}>Acme Corporation</option>
            <option value="Global Industries" className="text-emerald-700 bg-emerald-50 font-bold" style={{ color: '#047857', backgroundColor: '#ecfdf5' }}>Global Industries</option>
            <option value="Tech Solutions Inc" className="text-purple-700 bg-purple-50 font-bold" style={{ color: '#7e22ce', backgroundColor: '#faf5ff' }}>Tech Solutions Inc</option>
          </select>
          <ChevronDown size={14} className={`${getCorpColorClass(selectedCorp)} absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300`} />
        </div>

        {/* Profile Dropdown wrapped in a border box */}
        <div className="flex items-center gap-3 relative select-none">
           <div 
             onClick={() => setShowDropdown(!showDropdown)}
             className="flex items-center gap-3 cursor-pointer border border-gray-200 hover:bg-gray-50 p-2 rounded-xl shadow-sm transition-all"
           >
             <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
               AS
             </div>
             <div className="text-xs hidden sm:block">
               <p className="font-bold text-gray-900 leading-tight">Aisha Singh</p>
               <p className="text-gray-500 text-[10px] mt-0.5 font-medium">Analyst</p>
             </div>
             <ChevronDown size={14} className="text-gray-400 ml-1" />
           </div>

           {showDropdown && (
             <div className="absolute right-0 top-14 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
               <button 
                 onClick={onLogout}
                 className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors"
               >
                 Log Out
               </button>
             </div>
           )}
        </div>
      </div>
    </header>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(localStorage.getItem('auth') === 'true');

  React.useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    } else if (isAuthenticated && location.pathname === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const getTitle = () => {
    if (location.pathname.startsWith('/review')) return 'Review Dashboard';
    if (location.pathname === '/upload') return 'Upload Data';
    if (location.pathname === '/sources') return 'Data Sources';
    if (location.pathname === '/runs') return 'Ingestion Runs';
    if (location.pathname === '/approvals') return 'My Approvals';
    if (location.pathname === '/approved') return 'Approved Data';
    if (location.pathname === '/locked-records') return 'Locked Audit Records';
    if (location.pathname === '/reports') return 'Reports';
    if (location.pathname === '/factors') return 'Emission Factors';
    if (location.pathname === '/units') return 'Measurement Units';
    if (location.pathname === '/facilities') return 'Facilities';
    if (location.pathname === '/users') return 'Platform Users';
    if (location.pathname === '/audit') return 'Audit Logs';
    return 'Dashboard';
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
        <TopHeader title={getTitle()} onLogout={handleLogout} />
        <main className="flex-1 p-8 overflow-x-hidden w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/sources" element={<DataSourcesPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/runs" element={<IngestionRunsPage />} />
            <Route path="/approvals" element={<MyApprovalsPage />} />
            <Route path="/approved" element={<ApprovedDataPage />} />
            <Route path="/locked-records" element={<LockedRecordsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/factors" element={<EmissionFactorsPage />} />
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

