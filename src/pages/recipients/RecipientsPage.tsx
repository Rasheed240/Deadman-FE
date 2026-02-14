import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { recipientsApi } from '@/lib/api';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter, Input,
} from '@/components/ui';
import { Plus, Users, Mail, MessageSquare, Phone, Upload } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Recipient } from '@/types';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function RecipientsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => recipientsApi.list(),
  });

  const getChannelIcon = (type: string) => {
    const icons: Record<string, any> = { email: Mail, whatsapp: MessageSquare, sms: Phone, twitter_dm: MessageSquare, telegram: MessageSquare };
    const Icon = icons[type] || Mail;
    return <Icon className="h-3.5 w-3.5" />;
  };

  const getStatusBadge = (recipient: Recipient) => {
    if (recipient.is_delivered) return <Badge variant="success">Delivered</Badge>;
    if (recipient.is_failed) return <Badge variant="danger">Failed</Badge>;
    if (recipient.delivery_attempted_at) return <Badge variant="warning">Retrying</Badge>;
    return <Badge variant="default">Pending</Badge>;
  };

  const stats = [
    { label: 'Total', value: data?.count || 0, color: 'text-surface-900 dark:text-white' },
    { label: 'Delivered', value: data?.results.filter((r) => r.is_delivered).length || 0, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Pending', value: data?.results.filter((r) => !r.is_delivered && !r.is_failed).length || 0, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Failed', value: data?.results.filter((r) => r.is_failed).length || 0, color: 'text-danger-600 dark:text-danger-400' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Recipients</h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">Manage the people who will receive your messages</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowBulkImportModal(true)}>
            <Upload className="h-4 w-4" />Import CSV
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />Add Recipient
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} variant="bordered">
            <CardContent className="p-5 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-surface-500 dark:text-surface-400">Loading recipients...</p>
        </div>
      ) : data?.results.length === 0 ? (
        <motion.div variants={item}>
          <Card variant="bordered">
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">No recipients yet</h3>
              <p className="text-surface-500 dark:text-surface-400 mb-6">Add recipients to your messages to get started</p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />Add Your First Recipient
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {data?.results.map((recipient: Recipient) => (
            <motion.div key={recipient.id} variants={item}>
              <Card variant="bordered" className="group hover:border-surface-300 dark:hover:border-surface-600">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-2">
                        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{recipient.name}</h3>
                        {getStatusBadge(recipient)}
                        {!recipient.is_active && <Badge variant="default">Inactive</Badge>}
                      </div>
                      {recipient.group_name && (
                        <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">Group: {recipient.group_name}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {recipient.channels.map((channel) => (
                          <div key={channel.id} className="flex items-center gap-1 px-2 py-1 bg-surface-100 dark:bg-surface-700 rounded-lg text-xs text-surface-600 dark:text-surface-300">
                            {getChannelIcon(channel.channel_type)}
                            <span className="capitalize">{channel.channel_type.replace('_', ' ')}</span>
                            {channel.status === 'delivered' && <span className="text-emerald-500 ml-0.5">&#10003;</span>}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-surface-400 dark:text-surface-500 text-xs">Delay</p>
                          <p className="font-medium text-surface-900 dark:text-surface-100">{recipient.total_delay_hours}h</p>
                        </div>
                        <div>
                          <p className="text-surface-400 dark:text-surface-500 text-xs">Retries</p>
                          <p className="font-medium text-surface-900 dark:text-surface-100">{recipient.retry_count}</p>
                        </div>
                        {recipient.delivered_at && (
                          <div>
                            <p className="text-surface-400 dark:text-surface-500 text-xs">Delivered</p>
                            <p className="font-medium text-surface-900 dark:text-surface-100">{formatRelativeTime(recipient.delivered_at)}</p>
                          </div>
                        )}
                        {recipient.opened_at && (
                          <div>
                            <p className="text-surface-400 dark:text-surface-500 text-xs">Opened</p>
                            <p className="font-medium text-surface-900 dark:text-surface-100">{recipient.open_count}x</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Recipient" description="Add a new recipient to your messages">
        <div className="text-center py-8">
          <p className="text-surface-500 dark:text-surface-400">Add recipient form will be implemented here</p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary">Add Recipient</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showBulkImportModal} onClose={() => setShowBulkImportModal(false)} title="Bulk Import Recipients" description="Import recipients from a CSV file">
        <div className="text-center py-8">
          <div className="h-14 w-14 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-3">
            <Upload className="h-7 w-7 text-surface-400" />
          </div>
          <p className="text-surface-500 dark:text-surface-400">CSV import functionality will be implemented here</p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBulkImportModal(false)}>Cancel</Button>
          <Button variant="primary">Import</Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}
