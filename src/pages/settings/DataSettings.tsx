/**
 * Data & Privacy Settings Component
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Modal,
  ModalFooter,
  Input,
} from '@/components/ui';
import {
  Download,
  Trash2,
  AlertTriangle,
  Database,
  Shield,
  FileText,
  HardDrive,
} from 'lucide-react';

export function DataSettings() {
  const logout = useAuthStore((state) => state.logout);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: authApi.exportData,
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deadmansbomb-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    },
    onError: () => {
      toast.error('Failed to export data');
    },
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: (password: string) => authApi.deleteAccount(password),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete account');
    },
  });

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    deleteMutation.mutate(deletePassword);
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download a copy of all your data in JSON format (GDPR compliant)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Database className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  What's included in the export?
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Your profile information</li>
                  <li>All messages (encrypted content)</li>
                  <li>Recipients and delivery channels</li>
                  <li>Check-in history</li>
                  <li>Payment history</li>
                  <li>Account settings</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-medium mb-1">Security Note</p>
                  <p className="text-yellow-800">
                    Your exported data will contain encrypted message content. You'll
                    need your password to decrypt messages, which is not included in
                    the export for security reasons.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => exportMutation.mutate()}
                isLoading={exportMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Usage */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Data Usage</CardTitle>
          <CardDescription>Overview of your account data usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Messages</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Recipients</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <HardDrive className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">-- MB</p>
              <p className="text-sm text-gray-600">Storage Used</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-600">Encrypted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Privacy & Data Protection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  End-to-End Encryption
                </p>
                <p className="text-gray-600">
                  All your messages are encrypted with your password using Fernet
                  (AES-128). We cannot access your message content.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Database className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Data Retention</p>
                <p className="text-gray-600">
                  Your data is retained as long as your account is active. Deleted
                  accounts and all associated data are permanently removed after 30
                  days.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">GDPR Rights</p>
                <p className="text-gray-600">
                  You have the right to access, export, and delete your data at any
                  time. We comply with all GDPR requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="sm">
              Privacy Policy
            </Button>
            <Button variant="outline" size="sm">
              Terms of Service
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card variant="bordered" className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Delete Account</CardTitle>
          <CardDescription className="text-red-700">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  This action is permanent and cannot be undone
                </h3>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>All your messages will be permanently deleted</li>
                  <li>Scheduled messages will be cancelled</li>
                  <li>Recipients will no longer receive your messages</li>
                  <li>Active subscriptions will be cancelled</li>
                  <li>Your data cannot be recovered after deletion</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        description="This action cannot be undone"
        size="lg"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="text-sm text-red-900">
                <p className="font-medium mb-2">Warning: This is permanent!</p>
                <ul className="space-y-1 list-disc list-inside text-red-800">
                  <li>All messages, recipients, and data will be deleted</li>
                  <li>Scheduled deliveries will be cancelled</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <Input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              required
            />
          </div>

          <Input
            label="Enter your password to confirm"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Password"
            required
          />

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Before you go:</strong> Remember to download your data if you
              need a copy. Once deleted, we cannot recover your account or messages.
            </p>
          </div>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletePassword('');
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Permanently Delete Account
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
