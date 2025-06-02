/**
 * Dashboard Overview Page
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsApi, checkinsApi } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import {
  MessageSquare,
  Users,
  Heart,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

export function DashboardPage() {
  // Fetch analytics overview
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
  });

  // Fetch current check-in
  const { data: currentCheckin, isLoading: checkinLoading } = useQuery({
    queryKey: ['checkin', 'current'],
    queryFn: checkinsApi.getCurrent,
    retry: false,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      {/* Check-in Alert */}
      {currentCheckin && currentCheckin.status === 'pending' && (
        <Card variant="bordered" className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">
                  Check-in Required
                </p>
                <p className="text-sm text-yellow-700">
                  Your next check-in is due{' '}
                  {formatRelativeTime(currentCheckin.due_date)}
                </p>
              </div>
              <Link to="/checkins">
                <Button size="sm" variant="primary">
                  Check In Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Messages */}
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics?.messages.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.messages.active || 0} active
                </p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recipients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics?.recipients.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.recipients.delivered || 0} delivered
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-ins */}
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-ins</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics?.checkins.completed || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.checkins.pending || 0} pending
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(analytics?.payments.total_spent || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.payments.successful_payments || 0} payments
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Messages</CardTitle>
              <Link to="/messages">
                <Button size="sm" variant="ghost">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.messages.total === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                  <Link to="/messages/new">
                    <Button size="sm" variant="primary" className="mt-3">
                      Create your first message
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  You have {analytics?.messages.draft || 0} draft messages
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">Account Type</span>
                </div>
                <Badge variant={analytics?.account.is_premium ? 'warning' : 'default'}>
                  {analytics?.account.is_premium ? 'Premium' : analytics?.account.account_type}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">2FA Enabled</span>
                </div>
                <Badge
                  variant={analytics?.account.is_2fa_enabled ? 'success' : 'danger'}
                >
                  {analytics?.account.is_2fa_enabled ? 'Yes' : 'No'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Member since</span>
                </div>
                <span className="text-sm text-gray-600">
                  {analytics?.account.member_since &&
                    formatRelativeTime(analytics.account.member_since)}
                </span>
              </div>

              {!analytics?.account.is_2fa_enabled && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Enable 2FA for enhanced security
                  </p>
                  <Link to="/settings/security">
                    <Button size="sm" variant="primary" className="mt-2">
                      Enable 2FA
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
