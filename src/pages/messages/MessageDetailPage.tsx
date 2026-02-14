import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { messagesApi } from '@/lib/api';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Modal, ModalFooter, Input,
} from '@/components/ui';
import { ArrowLeft, Lock, Eye, Send, Users, CreditCard } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<{ subject: string; body: string } | null>(null);

  const { data: message, isLoading } = useQuery({
    queryKey: ['message', id],
    queryFn: () => messagesApi.get(id!),
    enabled: !!id,
  });

  const decryptMutation = useMutation({
    mutationFn: (password: string) => messagesApi.decrypt(id!, password),
    onSuccess: (data) => {
      setDecryptedContent(data);
      setShowDecryptModal(false);
      setDecryptPassword('');
      toast.success('Message decrypted successfully');
    },
    onError: () => { toast.error('Failed to decrypt. Check your password.'); },
  });

  const triggerMutation = useMutation({
    mutationFn: () => messagesApi.triggerManual(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message', id] });
      toast.success('Message triggered successfully');
    },
  });

  const handleDecrypt = () => {
    if (!decryptPassword) { toast.error('Please enter your password'); return; }
    decryptMutation.mutate(decryptPassword);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-surface-500 dark:text-surface-400">Loading message...</p>
      </div>
    );
  }

  if (!message) {
    return <div className="text-center py-16"><p className="text-surface-500 dark:text-surface-400">Message not found</p></div>;
  }

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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/messages')} className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white truncate">{message.title}</h1>
            {getStatusBadge(message.status)}
          </div>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Created {formatRelativeTime(message.created_at)}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {message.status === 'draft' && !message.is_paid && (
            <Link to={`/messages/${id}/payment`}>
              <Button variant="primary"><CreditCard className="h-4 w-4" />Pay & Activate</Button>
            </Link>
          )}
          {message.status === 'active' && message.trigger_type === 'manual' && (
            <Button variant="danger" onClick={() => triggerMutation.mutate()} isLoading={triggerMutation.isPending}>
              <Send className="h-4 w-4" />Trigger Now
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="p-5 text-center">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary-600/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{message.total_recipients}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Recipients</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-5 text-center">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Trigger Type</p>
            <p className="text-base font-semibold text-surface-900 dark:text-white capitalize">{message.trigger_type.replace('_', ' ')}</p>
            {message.scheduled_send_date && <p className="text-xs text-surface-400 mt-1">{formatDate(message.scheduled_send_date, 'long')}</p>}
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-5 text-center">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Payment</p>
            <Badge variant={message.is_paid ? 'success' : 'warning'} className="text-sm px-3 py-1">{message.is_paid ? 'Paid' : 'Pending'}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-surface-400" />Encrypted Content</CardTitle>
              <CardDescription>Enter your password to decrypt</CardDescription>
            </div>
            <Button size="sm" variant="primary" onClick={() => setShowDecryptModal(true)}><Eye className="h-4 w-4" />Decrypt</Button>
          </div>
        </CardHeader>
        {decryptedContent && (
          <CardContent>
            <div className="rounded-xl bg-surface-50 dark:bg-surface-900 p-6 space-y-4 border border-surface-200 dark:border-surface-700">
              <div>
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Subject</p>
                <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">{decryptedContent.subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Body</p>
                <p className="text-surface-800 dark:text-surface-200 whitespace-pre-wrap leading-relaxed">{decryptedContent.body}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recipients ({message.total_recipients})</CardTitle>
            <Link to={`/messages/${id}/recipients`}><Button size="sm" variant="outline">Manage Recipients</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {message.total_recipients === 0 ? (
            <div className="text-center py-8">
              <div className="h-14 w-14 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-3">
                <Users className="h-7 w-7 text-surface-400" />
              </div>
              <p className="text-surface-500 dark:text-surface-400 mb-4">No recipients added yet</p>
              <Link to={`/messages/${id}/recipients`}><Button size="sm" variant="primary">Add Recipients</Button></Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                <span className="text-surface-500 dark:text-surface-400">Delivered</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100">{message.successful_deliveries}</span>
              </div>
              <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                <span className="text-surface-500 dark:text-surface-400">Failed</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100">{message.failed_deliveries}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showDecryptModal} onClose={() => setShowDecryptModal(false)} title="Decrypt Message" description="Enter your password to view the message content">
        <div className="space-y-4">
          <Input label="Password" type="password" placeholder="Enter your password" value={decryptPassword} onChange={(e) => setDecryptPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()} />
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDecryptModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleDecrypt} isLoading={decryptMutation.isPending}>Decrypt</Button>
          </ModalFooter>
        </div>
      </Modal>
    </motion.div>
  );
}
