/**
 * Recipients Management Page
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { recipientsApi } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
} from '@/components/ui';
import { Plus, Users, Mail, MessageSquare, Phone, Upload } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Recipient } from '@/types';

export function RecipientsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => recipientsApi.list(),
  });

  const getChannelIcon = (type: string) => {
    const icons: Record<string, any> = {
      email: Mail,
      whatsapp: MessageSquare,
      sms: Phone,
      twitter_dm: MessageSquare,
      telegram: MessageSquare,
    };
    const Icon = icons[type] || Mail;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (recipient: Recipient) => {
    if (recipient.is_delivered) {
      return <Badge variant="success">Delivered</Badge>;
    }
    if (recipient.is_failed) {
      return <Badge variant="danger">Failed</Badge>;
    }
    if (recipient.delivery_attempted_at) {
      return <Badge variant="warning">Retrying</Badge>;
    }
    return <Badge variant="default">Pending</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipients</h1>
          <p className="mt-1 text-gray-600">
            Manage the people who will receive your messages
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowBulkImportModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Recipient
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {data?.count || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Recipients</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {data?.results.filter((r) => r.is_delivered).length || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Delivered</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {data?.results.filter((r) => !r.is_delivered && !r.is_failed).length || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {data?.results.filter((r) => r.is_failed).length || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipients List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipients...</p>
        </div>
      ) : data?.results.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No recipients yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add recipients to your messages to get started
            </p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recipient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.results.map((recipient: Recipient) => (
            <Card key={recipient.id} variant="bordered" className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recipient.name}
                      </h3>
                      {getStatusBadge(recipient)}
                      {!recipient.is_active && (
                        <Badge variant="default">Inactive</Badge>
                      )}
                    </div>

                    {recipient.group_name && (
                      <p className="text-sm text-gray-600 mb-3">
                        Group: {recipient.group_name}
                      </p>
                    )}

                    {/* Channels */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {recipient.channels.map((channel) => (
                        <div
                          key={channel.id}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          {getChannelIcon(channel.channel_type)}
                          <span className="capitalize">
                            {channel.channel_type.replace('_', ' ')}
                          </span>
                          {channel.status === 'delivered' && (
                            <span className="text-green-600 ml-1">✓</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Delay</p>
                        <p className="font-medium text-gray-900">
                          {recipient.total_delay_hours}h
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Retry Count</p>
                        <p className="font-medium text-gray-900">
                          {recipient.retry_count}
                        </p>
                      </div>
                      {recipient.delivered_at && (
                        <div>
                          <p className="text-gray-500">Delivered</p>
                          <p className="font-medium text-gray-900">
                            {formatRelativeTime(recipient.delivered_at)}
                          </p>
                        </div>
                      )}
                      {recipient.opened_at && (
                        <div>
                          <p className="text-gray-500">Opened</p>
                          <p className="font-medium text-gray-900">
                            {recipient.open_count}x
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Recipient Modal - Placeholder */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Recipient"
        description="Add a new recipient to your messages"
      >
        <div className="text-center py-8">
          <p className="text-gray-600">
            Add recipient form will be implemented here
          </p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">Add Recipient</Button>
        </ModalFooter>
      </Modal>

      {/* Bulk Import Modal - Placeholder */}
      <Modal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        title="Bulk Import Recipients"
        description="Import recipients from a CSV file"
      >
        <div className="text-center py-8">
          <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            CSV import functionality will be implemented here
          </p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBulkImportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">Import</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
