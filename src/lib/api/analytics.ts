/**
 * Analytics API
 */
import { api } from './client';
import type { AnalyticsOverview } from '@/types';

export const analyticsApi = {
  // Get analytics overview
  getOverview: async (): Promise<AnalyticsOverview> => {
    return api.get('/analytics/overview/');
  },

  // Get dashboard metrics
  getMetrics: async (params?: {
    type?: 'daily' | 'weekly' | 'monthly';
    start_date?: string;
    end_date?: string;
  }): Promise<any[]> => {
    return api.get('/analytics/metrics/', { params });
  },

  // Get current metrics
  getCurrentMetrics: async (): Promise<any> => {
    return api.get('/analytics/metrics/current/');
  },

  // Get summary statistics
  getSummary: async (): Promise<{
    users: { total: number; verified: number; premium: number };
    messages: { total: number; active: number; triggered: number };
    recipients: { total: number; delivered: number };
    revenue: { total: number; successful_payments: number };
  }> => {
    return api.get('/analytics/metrics/summary/');
  },

  // Track user activity
  trackActivity: async (data: {
    activity_type: 'page_view' | 'button_click' | 'feature_used' | 'error_occurred';
    page_url?: string;
    feature_name?: string;
    metadata?: any;
  }): Promise<void> => {
    await api.post('/analytics/activity/', data);
  },
};
