
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  GlobeAltIcon,
  ChevronRightIcon,
  XMarkIcon,
  WifiIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/solid';
import { useSchoolContext } from '../context/SchoolContext';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSchoolContext();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language === 'ar' ? 'ar' : 'fr';

  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [currentLang]);

  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'fr' : 'ar';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('app_lang', nextLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isDemoMode');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'dashboard', icon: HomeIcon },
    { to: '/students', label: 'students', icon: UsersIcon },
    { to: '/classes', label: 'classes', icon: AcademicCapIcon },
    { to: '/subjects', label: 'subjects', icon: BookOpenIcon },
    { to: '/results', label: 'results', icon: ClipboardDocumentListIcon },
    ...(currentUser?.role === 'admin' ? [{ to: '/approve-results', label: 'approve_results', icon: CheckCircleIcon }] : []),
    { to: '/statistics', label: 'statistics', icon: ChartBarIcon },
    ...(currentUser?.role === 'admin' ? [{ to: '/assignments', label: 'assignments_menu', icon: UserPlusIcon }] : []),
    { to: '/users', label: 'staff_management', icon: Cog6ToothIcon },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.to === location.pathname);
    return item ? t(item.label) : '';
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 ${currentLang === 'ar' ? 'right-0' : 'left-0'} z-[70] w-72 bg-white border-${currentLang === 'ar' ? 'l' : 'r'} border-slate-200 transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : (currentLang === 'ar' ? 'translate-x-full' : '-translate-x-full') + ' lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
                <div className="bg-primary-500 p-2 rounded-xl shadow-lg shadow-primary-200">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                  {t('school_name')}
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                <XMarkIcon className="w-6 h-6" />
              </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 opacity-70">
              {t('layout.mainMenu')}
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 font-black shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.to ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="text-sm">{t(item.label)}</span>
                  </div>
                {location.pathname === item.to && (
                   <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-300"></div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Section Bottom */}
          <div className="p-4 mt-auto border-t border-slate-50 bg-slate-50/30">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 shadow-inner">
                  {currentUser?.fullName ? (
                    <>
                      {currentUser.fullName.charAt(0).toUpperCase()}
                      {currentUser.fullName.split(' ')[1]?.charAt(0)?.toUpperCase() || currentUser.fullName.charAt(1)?.toUpperCase() || ''}
                    </>
                  ) : (
                    'AD'
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {currentUser?.fullName || t('layout.admin_default_name')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {currentUser?.role ? t('role_' + currentUser.role) : t('layout.admin_default_role')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black text-red-500 bg-red-50/50 border border-red-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
            
            {!isOnline && (
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black text-red-500 bg-red-50 p-2 rounded-xl border border-red-100">
                <WifiIcon className="w-3 h-3" />
                <span>{t('layout.offline_mode')}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-4 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{getPageTitle()}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {t('layout.app_tagline')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
               <button 
               onClick={toggleLanguage}
               className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 transition-all font-black"
             >
               <GlobeAltIcon className="w-4 h-4 text-primary-500" />
               <span className="text-sm">{currentLang === 'ar' ? t('lang_switch_fr') : t('lang_switch_ar')}</span>
             </button>
             
             <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
             
             <div className="flex items-center gap-3 cursor-pointer p-1 pr-1 lg:pr-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
               <div className="hidden md:block text-left rtl:text-right">
                 <p className="text-sm font-black text-slate-800 group-hover:text-primary-600 transition-colors">
                   {currentUser?.fullName || t('layout.user_fallback')}
                 </p>
                 <p className="text-[10px] text-primary-600 font-black uppercase tracking-tighter">
                   {currentUser?.role ? t('role_' + currentUser.role) : t('layout.admin_default_role')}
                 </p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 p-0.5 shadow-md group-hover:shadow-primary-100 transition-all">
                 <div className="w-full h-full rounded-[10px] bg-white overflow-hidden border border-white flex items-center justify-center">
                   {currentUser?.fullName ? (
                     <img 
                       src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=fff&color=0ea5e9&bold=true`} 
                       className="w-full h-full object-cover" 
                       alt={currentUser.fullName}
                       onError={(e) => {
                         // Fallback to initials if image fails to load
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const parent = target.parentElement;
                         if (parent) {
                           parent.innerHTML = `<span class="text-primary-600 font-bold text-sm">
                             ${currentUser.fullName.charAt(0).toUpperCase()}${currentUser.fullName.split(' ')[1]?.charAt(0)?.toUpperCase() || ''}
                           </span>`;
                         }
                       }}
                     />
                   ) : (
                     <img src="https://ui-avatars.com/api/?name=Admin&background=fff&color=0ea5e9&bold=true" className="w-full h-full object-cover" alt="User" />
                   )}
                 </div>
               </div>
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
