/**
 * Main App Component
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

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
          style: {
            background: '#fff',
            color: '#111',
            border: '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
