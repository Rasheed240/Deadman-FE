/**
 * Security Settings Component
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
} from '@/components/ui';
import { Lock, Key, AlertTriangle, Save, Shield, UserCheck } from 'lucide-react';

export function SecuritySettings() {
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ duration: 0.3 }}
      >
        <Card variant="bordered" className="rounded-xl">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                name="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={handleInputChange}
                placeholder="Enter current password"
                required
              />

              <Input
                label="New Password"
                name="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                hint="Minimum 8 characters"
                required
              />

              <Input
                label="Confirm New Password"
                name="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
              />

              <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <Key className="h-5 w-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-sky-900 dark:text-sky-100">
                    <p className="font-medium mb-1">Password Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-sky-800 dark:text-sky-200">
                      <li>At least 8 characters long</li>
                      <li>Mix of uppercase and lowercase letters</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      confirm_password: '',
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={changePasswordMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Warning */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card variant="bordered" className="rounded-xl border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Important: Message Encryption
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Your password is used to encrypt your messages. If you change your
                  password, you will need to re-enter your OLD password to decrypt
                  existing messages, then re-encrypt them with your new password. This
                  is a security feature to ensure only you can access your messages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Tips */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card variant="bordered" className="rounded-xl">
          <CardHeader>
            <CardTitle>Password Security Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-surface-700 dark:text-surface-300">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-100 mb-1">
                    Use a strong, unique password
                  </p>
                  <p className="text-surface-600 dark:text-surface-400">
                    Don't reuse passwords from other websites. Consider using a password
                    manager.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-100 mb-1">
                    Enable Two-Factor Authentication
                  </p>
                  <p className="text-surface-600 dark:text-surface-400">
                    Add an extra layer of security by requiring a verification code from
                    your phone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-100 mb-1">
                    Never share your password
                  </p>
                  <p className="text-surface-600 dark:text-surface-400">
                    Dead Man's Bomb staff will never ask for your password. Keep it
                    private and secure.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
