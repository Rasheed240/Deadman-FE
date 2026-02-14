/**
 * Data & Privacy Settings Component
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
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
                <Database className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-1">
                    What's included in the export?
                  </h3>
                  <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1 list-disc list-inside">
                    <li>Your profile information</li>
                    <li>All messages (encrypted content)</li>
                    <li>Recipients and delivery channels</li>
                    <li>Check-in history</li>
                    <li>Payment history</li>
                    <li>Account settings</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-medium mb-1">Security Note</p>
                    <p className="text-amber-800 dark:text-amber-200">
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
      </motion.div>

      {/* Data Usage */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Data Usage</CardTitle>
            <CardDescription>Overview of your account data usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-800 dark:to-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
                <FileText className="h-8 w-8 text-surface-400 dark:text-surface-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">--</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Messages</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-800 dark:to-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
                <Database className="h-8 w-8 text-surface-400 dark:text-surface-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">--</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Recipients</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-800 dark:to-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
                <HardDrive className="h-8 w-8 text-surface-400 dark:text-surface-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">-- MB</p>
                <p className="text-sm text-surface-600 dark:text-surface-400">Storage Used</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 rounded-lg border border-primary-200 dark:border-primary-800">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-50">100%</p>
                <p className="text-sm text-primary-700 dark:text-primary-300">Encrypted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Information */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Privacy & Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-surface-700 dark:text-surface-300">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-surface-400 dark:text-surface-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50 mb-1">
                    End-to-End Encryption
                  </p>
                  <p className="text-surface-600 dark:text-surface-400">
                    All your messages are encrypted with your password using Fernet
                    (AES-128). We cannot access your message content.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Database className="h-5 w-5 text-surface-400 dark:text-surface-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50 mb-1">Data Retention</p>
                  <p className="text-surface-600 dark:text-surface-400">
                    Your data is retained as long as your account is active. Deleted
                    accounts and all associated data are permanently removed after 30
                    days.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-surface-400 dark:text-surface-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50 mb-1">GDPR Rights</p>
                  <p className="text-surface-600 dark:text-surface-400">
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
      </motion.div>

      {/* Delete Account */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card variant="bordered" className="border-danger-300 dark:border-danger-800 bg-danger-50 dark:bg-danger-950/30">
          <CardHeader>
            <CardTitle className="text-danger-900 dark:text-danger-100">Delete Account</CardTitle>
            <CardDescription className="text-danger-700 dark:text-danger-300">
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-danger-900 dark:text-danger-100 mb-1">
                    This action is permanent and cannot be undone
                  </h3>
                  <ul className="text-sm text-danger-800 dark:text-danger-200 space-y-1 list-disc list-inside">
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
      </motion.div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        description="This action cannot be undone"
        size="lg"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 text-danger-600 dark:text-danger-400 flex-shrink-0" />
              <div className="text-sm text-danger-900 dark:text-danger-100">
                <p className="font-medium mb-2">Warning: This is permanent!</p>
                <ul className="space-y-1 list-disc list-inside text-danger-800 dark:text-danger-200">
                  <li>All messages, recipients, and data will be deleted</li>
                  <li>Scheduled deliveries will be cancelled</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
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

          <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-4">
            <p className="text-sm text-surface-700 dark:text-surface-300">
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
