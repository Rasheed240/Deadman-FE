import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  HeartPulse,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  Bomb,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Recipients', href: '/recipients', icon: Users },
  { name: 'Check-ins', href: '/checkins', icon: HeartPulse },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const currentPage = navigation.find((item) =>
    location.pathname.startsWith(item.href)
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30">
                <Bomb className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-surface-900 dark:text-white">
                  Dead Man's
                </span>
                <span className="text-lg font-bold text-primary-500"> Bomb</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
                    }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`} />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="px-4 py-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary-400" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-primary-600' : 'bg-surface-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-600/20">
                  {user?.username?.slice(0, 2).toUpperCase()}
                </div>
                {user?.is_premium && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-amber-900" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                  {user?.email || 'Anonymous'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleLogout}
              className="justify-start text-surface-500 hover:text-danger-600 dark:hover:text-danger-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center px-6 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 mr-3 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {currentPage && (
              <>
                <currentPage.icon className="h-5 w-5 text-surface-400 dark:text-surface-500" />
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {currentPage.name}
                </h2>
              </>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {user?.is_premium && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Premium
                </span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Encrypted
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
