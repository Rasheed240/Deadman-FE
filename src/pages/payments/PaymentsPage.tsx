import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { paymentsApi } from '@/lib/api';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge,
} from '@/components/ui';
import { CreditCard, Download, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment } from '@/types';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function PaymentsPage() {
  const { data: payments, isLoading } = useQuery({ queryKey: ['payments'], queryFn: () => paymentsApi.list() });
  const { data: stats } = useQuery({ queryKey: ['payments', 'stats'], queryFn: paymentsApi.getStats });
  const { data: subscription } = useQuery({ queryKey: ['subscription', 'current'], queryFn: paymentsApi.getCurrentSubscription, retry: false });

  const getStatusBadge = (status: string) => {
    const v: Record<string, any> = {
      succeeded: { variant: 'success', label: 'Succeeded' }, failed: { variant: 'danger', label: 'Failed' },
      pending: { variant: 'warning', label: 'Pending' }, cancelled: { variant: 'default', label: 'Cancelled' },
    };
    const config = v[status] || v.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentTypeLabel = (t: string) => ({ message_delivery: 'Message Delivery', subscription: 'Subscription', premium_upgrade: 'Premium Upgrade' }[t] || t);

  const statCards = [
    { label: 'Total Spent', value: formatCurrency(stats?.total_spent || 0), color: 'text-surface-900 dark:text-white' },
    { label: 'Successful', value: stats?.successful_payments || 0, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Refunded', value: formatCurrency(stats?.refunded_amount || 0), color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Total Payments', value: stats?.total_payments || 0, color: 'text-surface-900 dark:text-white' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Payments</h1>
        <p className="mt-1 text-surface-500 dark:text-surface-400">View your payment history and manage subscriptions</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} variant="bordered">
            <CardContent className="p-5 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {subscription && (
        <motion.div variants={item}>
          <Card variant="bordered" className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle>Premium Subscription</CardTitle>
              <CardDescription>Your premium membership details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><p className="text-xs text-surface-500 dark:text-surface-400">Status</p><Badge variant={subscription.is_active ? 'success' : 'danger'} className="mt-1">{subscription.status}</Badge></div>
                <div><p className="text-xs text-surface-500 dark:text-surface-400">Amount</p><p className="font-semibold text-sm text-surface-900 dark:text-white mt-1">{formatCurrency(subscription.amount)}/mo</p></div>
                <div><p className="text-xs text-surface-500 dark:text-surface-400">Period</p><p className="text-xs font-medium text-surface-900 dark:text-white mt-1">{formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}</p></div>
                <div><p className="text-xs text-surface-500 dark:text-surface-400">Auto-renew</p><Badge variant={subscription.cancel_at_period_end ? 'danger' : 'success'} className="mt-1">{subscription.cancel_at_period_end ? 'Cancelled' : 'Active'}</Badge></div>
              </div>
              {subscription.cancel_at_period_end && (
                <div className="mt-4 p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-300">Your subscription will end on {formatDate(subscription.current_period_end)}</p>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                {subscription.cancel_at_period_end ? (
                  <Button size="sm" variant="primary"><RefreshCw className="h-4 w-4" />Reactivate</Button>
                ) : (
                  <Button size="sm" variant="danger">Cancel Subscription</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All your payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-surface-500 dark:text-surface-400">Loading payments...</p>
              </div>
            ) : payments?.results.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-surface-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">No payments yet</h3>
                <p className="text-surface-500 dark:text-surface-400">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {payments?.results.map((payment: Payment) => (
                      <tr key={payment.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-surface-900 dark:text-surface-100">{payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}</td>
                        <td className="px-6 py-4 text-sm text-surface-900 dark:text-surface-100">{getPaymentTypeLabel(payment.payment_type)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-surface-100">{formatCurrency(payment.amount, payment.currency)}</td>
                        <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                        <td className="px-6 py-4 text-sm text-surface-500 dark:text-surface-400">{payment.card_brand && payment.card_last4 ? `${payment.card_brand} **** ${payment.card_last4}` : 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            {payment.receipt_url && <Button size="sm" variant="ghost" onClick={() => window.open(payment.receipt_url, '_blank')}><Download className="h-4 w-4" /></Button>}
                            {payment.can_be_refunded && <Button size="sm" variant="outline">Refund</Button>}
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
      </motion.div>
    </motion.div>
  );
}
