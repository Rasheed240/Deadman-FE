/**
 * Check-ins API
 */
import { api } from './client';
import type {
  CheckInSchedule,
  CheckIn,
  EmergencyContact,
  PaginatedResponse,
} from '@/types';

export const checkinsApi = {
  // ========== Check-in Schedule ==========

  // Get schedule
  getSchedule: async (): Promise<CheckInSchedule> => {
    const response = await api.get<PaginatedResponse<CheckInSchedule>>('/checkins/schedules/');
    return response.results[0];
  },

  // Update schedule
  updateSchedule: async (data: Partial<CheckInSchedule>): Promise<CheckInSchedule> => {
    const schedule = await checkinsApi.getSchedule();
    return api.patch(`/checkins/schedules/${schedule.id}/`, data);
  },

  // Pause check-ins
  pauseCheckins: async (data: {
    days: number;
    reason: string;
  }): Promise<{
    message: string;
    paused_until: string;
  }> => {
    return api.post('/checkins/schedules/pause/', data);
  },

  // Resume check-ins
  resumeCheckins: async (): Promise<{ message: string }> => {
    return api.post('/checkins/schedules/resume/');
  },

  // ========== Check-ins ==========

  // List check-ins
  list: async (params?: { status?: string; page?: number }): Promise<PaginatedResponse<CheckIn>> => {
    return api.get('/checkins/checkins/', { params });
  },

  // Get current pending check-in
  getCurrent: async (): Promise<CheckIn> => {
    return api.get('/checkins/checkins/current/');
  },

  // Complete check-in
  complete: async (data?: {
    magic_token?: string;
    manual?: boolean;
  }): Promise<{
    message: string;
    completed_at: string;
  }> => {
    return api.post('/checkins/checkins/complete/', data || { manual: true });
  },

  // ========== Emergency Contacts ==========

  // List emergency contacts
  listContacts: async (): Promise<PaginatedResponse<EmergencyContact>> => {
    return api.get('/auth/emergency-contacts/');
  },

  // Create emergency contact
  createContact: async (data: {
    name: string;
    email: string;
    phone_number?: string;
    relationship: string;
    priority: number;
    notify_via_email: boolean;
    notify_via_sms: boolean;
  }): Promise<EmergencyContact> => {
    return api.post('/auth/emergency-contacts/', data);
  },

  // Update emergency contact
  updateContact: async (
    id: string,
    data: Partial<EmergencyContact>
  ): Promise<EmergencyContact> => {
    return api.patch(`/auth/emergency-contacts/${id}/`, data);
  },

  // Delete emergency contact
  deleteContact: async (id: string): Promise<void> => {
    return api.delete(`/auth/emergency-contacts/${id}/`);
  },

  // Resend verification
  resendVerification: async (id: string): Promise<{ message: string }> => {
    return api.post(`/auth/emergency-contacts/${id}/resend-verification/`);
  },
};
