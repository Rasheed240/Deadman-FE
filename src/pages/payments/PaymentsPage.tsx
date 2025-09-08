/**
 * Payments Page
 */
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
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
  CreditCard,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import type { Payment } from '@/types';

export function PaymentsPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.list(),
  });

  const { data: stats } = useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: paymentsApi.getStats,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: paymentsApi.getCurrentSubscription,
    retry: false,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      succeeded: { variant: 'success', label: 'Succeeded' },
      failed: { variant: 'danger', label: 'Failed' },
      pending: { variant: 'warning', label: 'Pending' },
      cancelled: { variant: 'default', label: 'Cancelled' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      message_delivery: 'Message Delivery',
      subscription: 'Subscription',
      premium_upgrade: 'Premium Upgrade',
    };
    return labels[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-gray-600">
          View your payment history and manage subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats?.total_spent || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Spent</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {stats?.successful_payments || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Successful</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {formatCurrency(stats?.refunded_amount || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Refunded</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_payments || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription */}
      {subscription && (
        <Card variant="bordered" className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle>Premium Subscription</CardTitle>
            <CardDescription>Your premium membership details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={subscription.is_active ? 'success' : 'danger'}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold">
                  {formatCurrency(subscription.amount)}/month
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Period</p>
                <p className="text-sm font-medium">
                  {formatDate(subscription.current_period_start)} -{' '}
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Auto-renew</p>
                <Badge variant={subscription.cancel_at_period_end ? 'danger' : 'success'}>
                  {subscription.cancel_at_period_end ? 'Cancelled' : 'Active'}
                </Badge>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-900">
                  Your subscription will end on{' '}
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              {subscription.cancel_at_period_end ? (
                <Button size="sm" variant="primary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reactivate Subscription
                </Button>
              ) : (
                <Button size="sm" variant="danger">
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : payments?.results.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payments yet
              </h3>
              <p className="text-gray-600">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments?.results.map((payment: Payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paid_at
                          ? formatDate(payment.paid_at)
                          : formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPaymentTypeLabel(payment.payment_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.card_brand && payment.card_last4
                          ? `${payment.card_brand} •••• ${payment.card_last4}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {payment.receipt_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(payment.receipt_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {payment.can_be_refunded && (
                            <Button size="sm" variant="outline">
                              Request Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
