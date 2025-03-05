/**
 * Authentication API
 */
import { api, setTokens, clearTokens } from './client';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@/types';

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    if (response.access && response.refresh) {
      setTokens(response.access, response.refresh);
    }
    return response;
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    if (response.access && response.refresh && !response.requires_2fa) {
      setTokens(response.access, response.refresh);
    }
    return response;
  },

  // Logout
  logout: async (): Promise<void> => {
    clearTokens();
    // Optionally call backend to invalidate session
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      // Ignore error, tokens are cleared anyway
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    return api.get<User>('/auth/profile/me/');
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    return api.patch<User>('/auth/profile/me/', data);
  },

  // Change password
  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }): Promise<{ message: string }> => {
    return api.post('/auth/profile/change-password/', data);
  },

  // Setup 2FA
  setup2FA: async (): Promise<{
    qr_code: string;
    secret: string;
    manual_entry_key: string;
  }> => {
    return api.post('/auth/profile/setup-2fa/');
  },

  // Enable 2FA
  enable2FA: async (data: { totp_code: string }): Promise<{
    message: string;
    backup_codes: string[];
  }> => {
    return api.post('/auth/profile/enable-2fa/', data);
  },

  // Disable 2FA
  disable2FA: async (data: { password: string }): Promise<{ message: string }> => {
    return api.post('/auth/profile/disable-2fa/', data);
  },

  // Request password reset
  requestPasswordReset: async (data: { email: string }): Promise<{ message: string }> => {
    return api.post('/auth/password-reset/request/', data);
  },

  // Confirm password reset
  confirmPasswordReset: async (data: {
    token: string;
    new_password: string;
  }): Promise<{ message: string }> => {
    return api.post('/auth/password-reset/confirm/', data);
  },

  // Get active sessions
  getSessions: async (): Promise<any[]> => {
    return api.get('/auth/profile/sessions/');
  },

  // Revoke session
  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    return api.post(`/auth/profile/sessions/${sessionId}/revoke/`);
  },

  // Revoke all other sessions
  revokeAllSessions: async (): Promise<{ message: string }> => {
    return api.post('/auth/profile/sessions/revoke-all/');
  },

  // Export user data (GDPR)
  exportData: async (): Promise<any> => {
    return api.get('/auth/profile/export-data/');
  },

  // Delete account
  deleteAccount: async (password: string): Promise<{ message: string }> => {
    return api.post('/auth/profile/delete-account/', { password });
  },
};
