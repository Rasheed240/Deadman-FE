/**
 * Main App Component
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Messages Pages
import { MessagesListPage } from './pages/messages/MessagesListPage';
import { CreateMessagePage } from './pages/messages/CreateMessagePage';
import { MessageDetailPage } from './pages/messages/MessageDetailPage';

// Recipients Pages
import { RecipientsPage } from './pages/recipients/RecipientsPage';

// Check-ins Pages
import { CheckinsPage } from './pages/checkins/CheckinsPage';

// Payments Pages
import { PaymentsPage } from './pages/payments/PaymentsPage';

// Settings Pages
import { SettingsPage } from './pages/settings/SettingsPage';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

// Public Route Wrapper (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const theme = useThemeStore((state) => state.theme);

  // Initialize theme on mount
  useEffect(() => {
    // Apply theme class to html element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch user on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Messages Routes */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/new"
            element={
              <ProtectedRoute>
                <CreateMessagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:id"
            element={
              <ProtectedRoute>
                <MessageDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Recipients Routes */}
          <Route
            path="/recipients"
            element={
              <ProtectedRoute>
                <RecipientsPage />
              </ProtectedRoute>
            }
          />

          {/* Check-ins Routes */}
          <Route
            path="/checkins"
            element={
              <ProtectedRoute>
                <CheckinsPage />
              </ProtectedRoute>
            }
          />

          {/* Payments Routes */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />

          {/* Settings Routes */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'toast-notification',
          style: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '16px',
            boxShadow: theme === 'dark'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: theme === 'dark' ? '#1e293b' : '#ffffff',
            },
            style: {
              background: theme === 'dark' ? '#1e293b' : '#ffffff',
              color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
              border: `1px solid ${theme === 'dark' ? '#10b981' : '#10b981'}`,
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: theme === 'dark' ? '#1e293b' : '#ffffff',
            },
            style: {
              background: theme === 'dark' ? '#1e293b' : '#ffffff',
              color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
              border: `1px solid ${theme === 'dark' ? '#ef4444' : '#ef4444'}`,
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: theme === 'dark' ? '#1e293b' : '#ffffff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
