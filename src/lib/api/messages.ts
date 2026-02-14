/**
 * Messages API
 */
import { api } from './client';
import type { Message, MessageCreateRequest, PaginatedResponse } from '@/types';

export const messagesApi = {
  // List messages
  list: async (params?: {
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<Message>> => {
    return api.get('/messages/messages/', { params });
  },

  // Get single message
  get: async (id: string): Promise<Message> => {
    return api.get(`/messages/messages/${id}/`);
  },

  // Create message
  create: async (data: MessageCreateRequest): Promise<Message> => {
    return api.post('/messages/messages/', data);
  },

  // Update message
  update: async (id: string, data: Partial<Message>): Promise<Message> => {
    return api.patch(`/messages/messages/${id}/`, data);
  },

  // Delete message
  delete: async (id: string): Promise<void> => {
    return api.delete(`/messages/messages/${id}/`);
  },

  // Decrypt message
  decrypt: async (id: string, password: string): Promise<{
    subject: string;
    body: string;
  }> => {
    return api.post(`/messages/messages/${id}/decrypt/`, { user_password: password });
  },

  // Activate message (after payment)
  activate: async (id: string): Promise<{ message: string }> => {
    return api.post(`/messages/messages/${id}/activate/`);
  },

  // Manually trigger message
  triggerManual: async (id: string): Promise<{ message: string }> => {
    return api.post(`/messages/messages/${id}/trigger-manual/`);
  },

  // Upload attachment
  uploadAttachment: async (
    id: string,
    file: File
  ): Promise<{ message: string; attachment_id: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(`/messages/messages/${id}/upload-attachment/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get message statistics
  getStats: async (): Promise<{
    total_messages: number;
    draft_messages: number;
    active_messages: number;
    triggered_messages: number;
    sent_messages: number;
  }> => {
    return api.get('/messages/messages/stats/');
  },
};
