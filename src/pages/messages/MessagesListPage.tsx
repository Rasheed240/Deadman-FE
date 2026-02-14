import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { messagesApi } from '@/lib/api';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Plus, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { Message } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function MessagesListPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['messages', statusFilter],
    queryFn: () =>
      messagesApi.list(statusFilter === 'all' ? {} : { status: statusFilter }),
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: 'default', label: 'Draft' },
      active: { variant: 'success', label: 'Active' },
      triggered: { variant: 'warning', label: 'Triggered' },
      sent: { variant: 'info', label: 'Sent' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getModerationBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'warning', label: 'Pending Review' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
      requires_changes: { variant: 'danger', label: 'Requires Changes' },
    };
    const config = variants[status];
    if (!config) return null;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const filters = ['all', 'draft', 'active', 'triggered', 'sent'];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Messages</h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">
            Create and manage your posthumous messages
          </p>
        </div>
        <Link to="/messages/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            Create Message
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              statusFilter === status
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-surface-500 dark:text-surface-400">Loading messages...</p>
        </div>
      ) : data?.results.length === 0 ? (
        <motion.div variants={item}>
          <Card variant="bordered">
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">No messages yet</h3>
              <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-sm mx-auto">
                Create your first posthumous message to ensure your words reach the people who matter.
              </p>
              <Link to="/messages/new">
                <Button variant="primary">
                  <Plus className="h-4 w-4" />
                  Create Your First Message
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {data?.results.map((message: Message) => (
            <motion.div key={message.id} variants={item}>
              <Card variant="bordered" className="group hover:border-surface-300 dark:hover:border-surface-600">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-2">
                        <Link to={`/messages/${message.id}`}>
                          <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {message.title}
                          </h3>
                        </Link>
                        {getStatusBadge(message.status)}
                        {getModerationBadge(message.moderation_status)}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-surface-400 dark:text-surface-500 text-xs">Recipients</p>
                          <p className="font-medium text-surface-900 dark:text-surface-100">{message.total_recipients}</p>
                        </div>
                        <div>
                          <p className="text-surface-400 dark:text-surface-500 text-xs">Trigger</p>
                          <p className="font-medium text-surface-900 dark:text-surface-100 capitalize">{message.trigger_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-surface-400 dark:text-surface-500 text-xs">Created</p>
                          <p className="font-medium text-surface-900 dark:text-surface-100">{formatRelativeTime(message.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-surface-400 dark:text-surface-500 text-xs">Payment</p>
                          <p className="font-medium">
                            {message.is_paid ? (
                              <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">Pending</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {message.scheduled_send_date && (
                        <div className="mt-3 flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400">
                          <Clock className="h-3.5 w-3.5" />
                          Scheduled for {formatDate(message.scheduled_send_date, 'long')}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Link to={`/messages/${message.id}`}>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
