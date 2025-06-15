/**
 * Recipients API
 */
import { api } from './client';
import type { Recipient, RecipientGroup, PaginatedResponse } from '@/types';

export const recipientsApi = {
  // ========== Recipients ==========

  // List recipients
  list: async (params?: {
    message?: string;
    group?: string;
    page?: number;
  }): Promise<PaginatedResponse<Recipient>> => {
    return api.get('/recipients/recipients/', { params });
  },

  // Get single recipient
  get: async (id: string): Promise<Recipient> => {
    return api.get(`/recipients/recipients/${id}/`);
  },

  // Create recipient
  create: async (data: any): Promise<Recipient> => {
    return api.post('/recipients/recipients/', data);
  },

  // Update recipient
  update: async (id: string, data: Partial<Recipient>): Promise<Recipient> => {
    return api.patch(`/recipients/recipients/${id}/`, data);
  },

  // Delete recipient
  delete: async (id: string): Promise<void> => {
    return api.delete(`/recipients/recipients/${id}/`);
  },

  // Add channel to recipient
  addChannel: async (
    id: string,
    data: {
      channel_type: string;
      priority: number;
      email_address?: string;
      phone_number?: string;
      twitter_username?: string;
      telegram_user_id?: string;
      telegram_username?: string;
    }
  ): Promise<{ message: string; channel_id: string }> => {
    return api.post(`/recipients/recipients/${id}/add-channel/`, data);
  },

  // Bulk import from CSV
  bulkImport: async (
    messageId: string,
    file: File
  ): Promise<{
    message: string;
    import_id: string;
  }> => {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('message_id', messageId);

    return api.post('/recipients/recipients/bulk-import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get import status
  getImportStatus: async (
    importId: string
  ): Promise<{
    status: string;
    total_rows: number;
    successful_imports: number;
    failed_imports: number;
    errors: any[];
  }> => {
    return api.get(`/recipients/recipients/import-status/?import_id=${importId}`);
  },

  // ========== Recipient Groups ==========

  // List groups
  listGroups: async (messageId?: string): Promise<PaginatedResponse<RecipientGroup>> => {
    const params = messageId ? { message: messageId } : {};
    return api.get('/recipients/groups/', { params });
  },

  // Create group
  createGroup: async (data: {
    message: string;
    name: string;
    description?: string;
    color_hex?: string;
    delivery_delay_hours: number;
  }): Promise<RecipientGroup> => {
    return api.post('/recipients/groups/', data);
  },

  // Update group
  updateGroup: async (id: string, data: Partial<RecipientGroup>): Promise<RecipientGroup> => {
    return api.patch(`/recipients/groups/${id}/`, data);
  },

  // Delete group
  deleteGroup: async (id: string): Promise<void> => {
    return api.delete(`/recipients/groups/${id}/`);
  },
};
