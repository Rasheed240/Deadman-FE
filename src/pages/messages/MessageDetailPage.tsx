/**
 * Message Detail Page
 */
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { messagesApi } from '@/lib/api';
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
import {
  ArrowLeft,
  Lock,
  Eye,
  Send,
  Users,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<{
    subject: string;
    body: string;
  } | null>(null);

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
    onError: () => {
      toast.error('Failed to decrypt. Check your password.');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => messagesApi.activate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message', id] });
      toast.success('Message activated successfully');
    },
  });

  const triggerMutation = useMutation({
    mutationFn: () => messagesApi.triggerManual(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message', id] });
      toast.success('Message triggered successfully');
    },
  });

  const handleDecrypt = () => {
    if (!decryptPassword) {
      toast.error('Please enter your password');
      return;
    }
    decryptMutation.mutate(decryptPassword);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading message...</p>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Message not found</p>
      </div>
    );
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/messages')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{message.title}</h1>
            {getStatusBadge(message.status)}
          </div>
          <p className="mt-1 text-gray-600">
            Created {formatRelativeTime(message.created_at)}
          </p>
        </div>

        <div className="flex gap-2">
          {message.status === 'draft' && !message.is_paid && (
            <Link to={`/messages/${id}/payment`}>
              <Button variant="primary">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay & Activate
              </Button>
            </Link>
          )}
          {message.status === 'active' && message.trigger_type === 'manual' && (
            <Button
              variant="danger"
              onClick={() => triggerMutation.mutate()}
              isLoading={triggerMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Trigger Now
            </Button>
          )}
        </div>
      </div>

      {/* Message Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">
                {message.total_recipients}
              </p>
              <p className="text-sm text-gray-600">Recipients</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Trigger Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {message.trigger_type.replace('_', ' ')}
              </p>
              {message.scheduled_send_date && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(message.scheduled_send_date, 'long')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Payment Status</p>
              <Badge variant={message.is_paid ? 'success' : 'warning'} className="text-base px-3 py-1">
                {message.is_paid ? 'Paid' : 'Pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Content */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-400" />
                Message Content (Encrypted)
              </CardTitle>
              <CardDescription>
                Enter your password to decrypt and view the message
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowDecryptModal(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Decrypt & View
            </Button>
          </div>
        </CardHeader>
        {decryptedContent && (
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Subject:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {decryptedContent.subject}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Body:</p>
                <div className="prose max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {decryptedContent.body}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recipients */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recipients ({message.total_recipients})</CardTitle>
            <Link to={`/messages/${id}/recipients`}>
              <Button size="sm" variant="outline">
                Manage Recipients
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {message.total_recipients === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No recipients added yet</p>
              <Link to={`/messages/${id}/recipients`}>
                <Button size="sm" variant="primary">
                  Add Recipients
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Delivered:</span>
                <span className="font-medium">{message.successful_deliveries}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium">{message.failed_deliveries}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decrypt Modal */}
      <Modal
        isOpen={showDecryptModal}
        onClose={() => setShowDecryptModal(false)}
        title="Decrypt Message"
        description="Enter your password to decrypt the message content"
      >
        <div className="space-y-4">
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={decryptPassword}
            onChange={(e) => setDecryptPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
          />

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowDecryptModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDecrypt}
              isLoading={decryptMutation.isPending}
            >
              Decrypt
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
