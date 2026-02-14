import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analyticsApi, checkinsApi } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import {
  MessageSquare,
  Users,
  HeartPulse,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  Shield,
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statsConfig = [
  {
    key: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    gradient: 'from-primary-500 to-primary-700',
    shadow: 'shadow-primary-600/20',
    getValue: (a: any) => a?.messages.total || 0,
    getSub: (a: any) => `${a?.messages.active || 0} active`,
  },
  {
    key: 'recipients',
    label: 'Recipients',
    icon: Users,
    gradient: 'from-emerald-500 to-emerald-700',
    shadow: 'shadow-emerald-600/20',
    getValue: (a: any) => a?.recipients.total || 0,
    getSub: (a: any) => `${a?.recipients.delivered || 0} delivered`,
  },
  {
    key: 'checkins',
    label: 'Check-ins',
    icon: HeartPulse,
    gradient: 'from-rose-500 to-rose-700',
    shadow: 'shadow-rose-600/20',
    getValue: (a: any) => a?.checkins.completed || 0,
    getSub: (a: any) => `${a?.checkins.pending || 0} pending`,
  },
  {
    key: 'payments',
    label: 'Total Spent',
    icon: CreditCard,
    gradient: 'from-violet-500 to-violet-700',
    shadow: 'shadow-violet-600/20',
    getValue: (a: any) => formatCurrency(a?.payments.total_spent || 0),
    getSub: (a: any) => `${a?.payments.successful_payments || 0} payments`,
  },
];

export function DashboardPage() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
  });

  const { data: currentCheckin } = useQuery({
    queryKey: ['checkin', 'current'],
    queryFn: checkinsApi.getCurrent,
    retry: false,
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">
            Welcome back! Here's an overview of your account.
          </p>
        </div>
        <Link to="/messages/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </Link>
      </motion.div>

      {/* Check-in Alert */}
      {currentCheckin && currentCheckin.status === 'pending' && (
        <motion.div variants={item}>
          <Card
            variant="bordered"
            className={`${
              currentCheckin.is_overdue
                ? 'border-danger-500/50 bg-danger-50 dark:bg-danger-950/20'
                : 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${
                  currentCheckin.is_overdue
                    ? 'bg-danger-100 dark:bg-danger-900/50'
                    : 'bg-amber-100 dark:bg-amber-900/50'
                }`}>
                  <AlertCircle className={`h-5 w-5 ${
                    currentCheckin.is_overdue ? 'text-danger-600' : 'text-amber-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    currentCheckin.is_overdue
                      ? 'text-danger-900 dark:text-danger-300'
                      : 'text-amber-900 dark:text-amber-300'
                  }`}>
                    {currentCheckin.is_overdue ? 'Check-in Overdue!' : 'Check-in Required'}
                  </p>
                  <p className={`text-sm ${
                    currentCheckin.is_overdue
                      ? 'text-danger-700 dark:text-danger-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    Due {formatRelativeTime(currentCheckin.due_date)}
                  </p>
                </div>
                <Link to="/checkins">
                  <Button size="sm" variant="primary">
                    Check In Now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.key} variant="bordered" className="group hover:border-surface-300 dark:hover:border-surface-600">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">
                      {stat.getValue(analytics)}
                    </p>
                    <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                      {stat.getSub(analytics)}
                    </p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow} transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <motion.div variants={item}>
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Messages</CardTitle>
                <Link to="/messages">
                  <Button size="sm" variant="ghost">
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.messages.total === 0 ? (
                <div className="text-center py-8">
                  <div className="h-14 w-14 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-7 w-7 text-surface-400" />
                  </div>
                  <p className="font-medium text-surface-700 dark:text-surface-300 mb-1">
                    No messages yet
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                    Create your first posthumous message
                  </p>
                  <Link to="/messages/new">
                    <Button size="sm" variant="primary">
                      <Plus className="h-3.5 w-3.5" />
                      Create Message
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                          {analytics?.messages.active || 0} active messages
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {analytics?.messages.draft || 0} drafts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Status */}
        <motion.div variants={item}>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm text-surface-700 dark:text-surface-300">Account Type</span>
                  </div>
                  <Badge variant={analytics?.account.is_premium ? 'warning' : 'default'}>
                    {analytics?.account.is_premium ? 'Premium' : analytics?.account.account_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <span className="text-sm text-surface-700 dark:text-surface-300">2FA Status</span>
                  </div>
                  <Badge variant={analytics?.account.is_2fa_enabled ? 'success' : 'danger'}>
                    {analytics?.account.is_2fa_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-surface-600 dark:text-surface-400" />
                    </div>
                    <span className="text-sm text-surface-700 dark:text-surface-300">Member since</span>
                  </div>
                  <span className="text-sm text-surface-500">
                    {analytics?.account.member_since &&
                      formatRelativeTime(analytics.account.member_since)}
                  </span>
                </div>

                {!analytics?.account.is_2fa_enabled && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                      Enable 2FA for enhanced security
                    </p>
                    <Link to="/settings">
                      <Button size="sm" variant="primary">
                        Enable 2FA
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
