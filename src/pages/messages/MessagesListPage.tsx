/**
 * Messages List Page
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { messagesApi } from '@/lib/api';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { Plus, MessageSquare, Clock, CheckCircle, Send, Trash2 } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { Message } from '@/types';

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-gray-600">
            Create and manage your posthumous messages
          </p>
        </div>
        <Link to="/messages/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Message
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'draft', 'active', 'triggered', 'sent'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      ) : data?.results.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first posthumous message to get started
            </p>
            <Link to="/messages/new">
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Message
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.results.map((message: Message) => (
            <Card key={message.id} variant="bordered" className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link to={`/messages/${message.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                          {message.title}
                        </h3>
                      </Link>
                      {getStatusBadge(message.status)}
                      {getModerationBadge(message.moderation_status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500">Recipients</p>
                        <p className="font-medium text-gray-900">
                          {message.total_recipients}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Trigger Type</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {message.trigger_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">
                          {formatRelativeTime(message.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payment</p>
                        <p className="font-medium text-gray-900">
                          {message.is_paid ? (
                            <span className="text-green-600">✓ Paid</span>
                          ) : (
                            <span className="text-yellow-600">Pending</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {message.scheduled_send_date && (
                      <div className="mt-3 flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Scheduled for {formatDate(message.scheduled_send_date, 'long')}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link to={`/messages/${message.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                    {message.status === 'draft' && (
                      <Link to={`/messages/${message.id}/edit`}>
                        <Button size="sm" variant="primary">
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
