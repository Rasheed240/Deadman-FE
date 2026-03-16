/**
 * TypeScript type definitions for Dead Man's Bomb
 */

// ============================================================================
// User & Authentication
// ============================================================================

export type AccountType = 'verified' | 'anonymous' | 'social';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string;
  account_type: AccountType;
  is_premium: boolean;
  premium_expires_at?: string;
  email_verified: boolean;
  email_verified_at?: string;
  is_2fa_enabled: boolean;
  totp_enabled: boolean;
  last_login?: string;
  date_joined: string;
}

export interface UserSession {
  id: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  device_name: string;
  browser: string;
  os: string;
  city?: string;
  country?: string;
  is_current: boolean;
  last_activity: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string;
}

export interface RegisterRequest {
  email?: string;
  username: string;
  password: string;
  password_confirm: string;
  account_type: AccountType;
  terms_accepted: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  requires_2fa?: boolean;
  tokens?: {
    access: string;
    refresh: string;
  };
}

// ============================================================================
// Messages
// ============================================================================

export type MessageStatus = 'draft' | 'active' | 'triggered' | 'sent' | 'cancelled';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'requires_changes';
export type TriggerType = 'scheduled' | 'checkin_failure' | 'manual';

export interface Message {
  id: string;
  user: string;
  title: string;
  encrypted_subject: string;
  encrypted_body: string;
  encryption_iv: string;
  is_encrypted: boolean;
  status: MessageStatus;
  moderation_status: ModerationStatus;
  moderation_submitted_at?: string;
  moderation_approved_at?: string;
  moderation_notes?: string;
  trigger_type: TriggerType;
  scheduled_send_date?: string;
  checkin_schedule?: string;
  trigger_conditions?: any;
  is_sent: boolean;
  sent_at?: string;
  total_recipients: number;
  successful_deliveries: number;
  failed_deliveries: number;
  is_paid: boolean;
  payment?: string;
  created_at: string;
  updated_at: string;
  triggered_at?: string;
}

export interface MessageCreateRequest {
  title: string;
  subject: string;
  body: string;
  user_password: string;
  trigger_type: TriggerType;
  scheduled_send_date?: string;
  checkin_schedule?: string;
}

// ============================================================================
// Recipients
// ============================================================================

export type ChannelType = 'email' | 'whatsapp' | 'sms' | 'twitter_dm' | 'telegram';
export type DeliveryStatus = 'pending' | 'sending' | 'delivered' | 'failed';

export interface RecipientGroup {
  id: string;
  message: string;
  name: string;
  description?: string;
  color_hex?: string;
  delivery_delay_hours: number;
  created_at: string;
  updated_at: string;
}

export interface RecipientChannel {
  id: string;
  recipient: string;
  channel_type: ChannelType;
  priority: number;
  email_address?: string;
  phone_number?: string;
  twitter_username?: string;
  telegram_user_id?: string;
  telegram_username?: string;
  status: DeliveryStatus;
  delivery_attempted_at?: string;
  delivered_at?: string;
  failed_at?: string;
  failure_reason?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
}

export interface Recipient {
  id: string;
  message: string;
  group?: string;
  group_name?: string;
  name: string;
  custom_subject?: string;
  custom_variables?: any;
  individual_delivery_delay_hours: number;
  total_delay_hours: number;
  is_active: boolean;
  channels: RecipientChannel[];
  delivery_attempted_at?: string;
  delivered_at?: string;
  failed_at?: string;
  failure_reason?: string;
  retry_count: number;
  opened_at?: string;
  open_count: number;
  reported_abuse: boolean;
  is_delivered: boolean;
  is_failed: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Check-ins
// ============================================================================

export type CheckInFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type CheckInStatus = 'pending' | 'completed' | 'missed';
export type EscalationLevel = 0 | 1 | 2 | 3;

export interface CheckInSchedule {
  id: string;
  user: string;
  frequency: CheckInFrequency;
  grace_period_days: number;
  enable_escalation: boolean;
  send_email_reminders: boolean;
  send_sms_reminders: boolean;
  is_paused: boolean;
  paused_until?: string;
  pause_reason?: string;
  is_active: boolean;
  next_checkin_due: string;
  last_checkin_at?: string;
  escalation_level: EscalationLevel;
  escalated_at?: string;
  is_overdue: boolean;
  is_in_grace_period: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user: string;
  due_date: string;
  grace_period_end: string;
  status: CheckInStatus;
  completed_at?: string;
  check_in_method?: string;
  reminder_sent_count: number;
  last_reminder_sent_at?: string;
  is_overdue: boolean;
  is_expired: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  user: string;
  name: string;
  email: string;
  phone_number?: string;
  relationship: string;
  priority: number;
  is_verified: boolean;
  verified_at?: string;
  notify_via_email: boolean;
  notify_via_sms: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Payments
// ============================================================================

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';
export type PaymentType = 'message_delivery' | 'subscription' | 'premium_upgrade';

export interface Payment {
  id: string;
  user: string;
  message?: string;
  stripe_payment_intent_id: string;
  payment_type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  recipient_count?: number;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  refund_amount: number;
  is_refunded: boolean;
  payment_method_type?: string;
  card_last4?: string;
  card_brand?: string;
  receipt_url?: string;
  is_successful: boolean;
  can_be_refunded: boolean;
  paid_at?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user: string;
  stripe_subscription_id: string;
  status: string;
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  is_active: boolean;
  created_at: string;
}

// ============================================================================
// Analytics
// ============================================================================

export interface AnalyticsOverview {
  messages: {
    total: number;
    draft: number;
    active: number;
    triggered: number;
    sent: number;
  };
  recipients: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  checkins: {
    total: number;
    completed: number;
    pending: number;
    missed: number;
  };
  payments: {
    total_spent: number;
    successful_payments: number;
    failed_payments: number;
  };
  account: {
    is_premium: boolean;
    is_2fa_enabled: boolean;
    account_type: AccountType;
    member_since: string;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  error: string;
  message?: string;
  detail?: string;
  [key: string]: any;
}
