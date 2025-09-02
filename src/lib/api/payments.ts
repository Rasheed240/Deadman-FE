/**
 * Payments API
 */
import { api } from './client';
import type { Payment, Subscription, PaginatedResponse } from '@/types';

export const paymentsApi = {
  // ========== Payments ==========

  // List payments
  list: async (params?: { page?: number }): Promise<PaginatedResponse<Payment>> => {
    return api.get('/payments/payments/', { params });
  },

  // Get payment receipt
  getReceipt: async (id: string): Promise<{
    receipt_url: string;
    payment_id: string;
    amount: number;
    currency: string;
    paid_at: string;
  }> => {
    return api.get(`/payments/payments/${id}/receipt/`);
  },

  // Create checkout session
  createCheckout: async (data: {
    message_id: string;
    recipient_count: number;
    success_url: string;
    cancel_url: string;
  }): Promise<{
    session_id: string;
    checkout_url: string;
    message: string;
  }> => {
    return api.post('/payments/payments/create-checkout/', data);
  },

  // Get payment statistics
  getStats: async (): Promise<{
    total_spent: number;
    total_payments: number;
    successful_payments: number;
    refunded_amount: number;
    currency: string;
  }> => {
    return api.get('/payments/payments/stats/');
  },

  // ========== Refunds ==========

  // Request refund
  requestRefund: async (data: {
    payment_id: string;
    reason: string;
    reason_details?: string;
  }): Promise<{
    message: string;
    refund_id: string;
    status: string;
  }> => {
    return api.post('/payments/refunds/request-refund/', data);
  },

  // Get refund status
  getRefundStatus: async (id: string): Promise<{
    refund_id: string;
    status: string;
    amount: number;
    reason: string;
    processed_at: string;
    rejection_reason?: string;
  }> => {
    return api.get(`/payments/refunds/${id}/status/`);
  },

  // ========== Subscriptions ==========

  // Get current subscription
  getCurrentSubscription: async (): Promise<Subscription> => {
    return api.get('/payments/subscriptions/current/');
  },

  // Cancel subscription
  cancelSubscription: async (id: string): Promise<{
    message: string;
    current_period_end: string;
  }> => {
    return api.post(`/payments/subscriptions/${id}/cancel/`);
  },

  // Reactivate subscription
  reactivateSubscription: async (id: string): Promise<{
    message: string;
    current_period_end: string;
  }> => {
    return api.post(`/payments/subscriptions/${id}/reactivate/`);
  },

  // ========== Payment Methods ==========

  // List payment methods
  listPaymentMethods: async (): Promise<any[]> => {
    return api.get('/payments/payment-methods/');
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id: string): Promise<{
    message: string;
    payment_method_id: string;
  }> => {
    return api.post(`/payments/payment-methods/${id}/set-default/`);
  },

  // Remove payment method
  removePaymentMethod: async (id: string): Promise<{ message: string }> => {
    return api.delete(`/payments/payment-methods/${id}/remove/`);
  },
};
