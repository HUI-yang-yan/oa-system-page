import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  WifiOff
} from 'lucide-react';
import { NavItem } from '../types';
import { subscribeToApiStatus, API_BASE_URL, ApiStatus } from '../services/api';
import { useTranslation } from '../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apiState, setApiState] = useState<ApiStatus>({ status: 'unknown', error: null });
  
  // Safe user parsing to prevent crashes (White Screen fix)
  const [user, setUser] = useState<any>({});
  
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            // Critical Fix: Ensure parsed is an object and not null
            setUser(parsed && typeof parsed === 'object' ? parsed : {});
        }
    } catch (e) {
        console.warn("Failed to parse user from localstorage");
        setUser({});
    }
  }, []);

  useEffect(() => {
    // Subscribe to API connection status
    const unsubscribe = subscribeToApiStatus((statusData) => {
      setApiState(statusData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { label: t('nav.dashboard'), path: '/', icon: <LayoutDashboard size={20} /> },
    { label: t('nav.employees'), path: '/employees', icon: <Users size={20} /> },
    { label: t('nav.leave'), path: '/leave', icon: <CalendarClock size={20} /> },
    { label: t('nav.profile'), path: '/profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">OA</div>
          <span className="text-xl font-bold text-slate-800">System</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-primary font-medium'
                        : 'text-secondary hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <UserCircle size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.realName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.position || 'Employee'}</p>
            </div>
          </div>
          
          <div className="px-3 pb-2">
             <LanguageSwitcher className="w-full justify-center" />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>{t('auth.signout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
        <span className="text-lg font-bold text-slate-800">OA System</span>
        <div className="flex items-center gap-2">
           <LanguageSwitcher />
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-800/50 z-10 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-16 bottom-0 w-64 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-3 rounded-lg ${
                      isActive ? 'bg-slate-100 text-primary' : 'text-slate-600'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-3 w-full text-left text-red-600 mt-4"
              >
                <LogOut size={20} />
                <span>{t('auth.signout')}</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:p-8 p-4 pt-20 md:pt-8">
        <div className="max-w-6xl mx-auto">
          {apiState.status === 'offline' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3 shadow-sm animate-fade-in">
              <WifiOff className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-bold text-orange-800">{t('dash.backendOffline')}</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Could not connect to <code className="bg-orange-100 px-1 py-0.5 rounded text-orange-800">{API_BASE_URL}</code>. 
                  <br/>
                  {t('dash.mockMode')}
                </p>
                {apiState.error && (
                  <div className="mt-2 text-xs font-mono bg-white/50 p-2 rounded border border-orange-100 text-orange-800">
                    <strong>Error:</strong> {apiState.error}
                  </div>
                )}
              </div>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;