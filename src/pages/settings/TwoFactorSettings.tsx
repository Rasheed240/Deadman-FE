/**
 * Two-Factor Authentication Settings Component
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Input,
  Badge,
  Modal,
  ModalFooter,
} from '@/components/ui';
import { Smartphone, Shield, CheckCircle, XCircle, Key, Copy } from 'lucide-react';

export function TwoFactorSettings() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');

  // Fetch 2FA setup data (QR code)
  const { data: setupData, refetch: refetchSetup } = useQuery({
    queryKey: ['2fa', 'setup'],
    queryFn: authApi.setup2FA,
    enabled: false, // Only fetch when user clicks setup
  });

  // Enable 2FA mutation
  const enableMutation = useMutation({
    mutationFn: (data: { totp_code: string }) => authApi.enable2FA(data),
    onSuccess: () => {
      fetchUser();
      queryClient.invalidateQueries({ queryKey: ['2fa'] });
      toast.success('Two-factor authentication enabled successfully');
      setShowSetupModal(false);
      setVerificationCode('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: (data: { password: string }) => authApi.disable2FA(data),
    onSuccess: () => {
      fetchUser();
      queryClient.invalidateQueries({ queryKey: ['2fa'] });
      toast.success('Two-factor authentication disabled');
      setShowDisableModal(false);
      setPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Invalid password');
    },
  });

  const handleSetupClick = () => {
    refetchSetup();
    setShowSetupModal(true);
  };

  const handleEnableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      enableMutation.mutate({ totp_code: verificationCode });
    } else {
      toast.error('Please enter a 6-digit code');
    }
  };

  const handleDisableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      disableMutation.mutate({ password });
    } else {
      toast.error('Please enter your password');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* 2FA Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
              {user?.totp_enabled ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="default" className="flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Disabled
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-1">
                    What is Two-Factor Authentication?
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                    Two-factor authentication (2FA) adds an extra layer of security by
                    requiring a verification code from your phone in addition to your
                    password when logging in.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-1">How it works</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    You'll use an authenticator app (like Google Authenticator or Authy)
                    on your phone to generate time-based verification codes.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                {user?.totp_enabled ? (
                  <Button
                    variant="danger"
                    onClick={() => setShowDisableModal(true)}
                  >
                    Disable 2FA
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleSetupClick}>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Backup Codes */}
      {user?.totp_enabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Backup Codes</CardTitle>
                  <CardDescription>
                    Save these codes in a safe place. You can use them to access your
                    account if you lose your phone.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-surface-50 dark:bg-surface-800/50 rounded-lg p-4 mb-4 border border-surface-200 dark:border-surface-700">
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                  Each code can only be used once. Generate new codes if you run out.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  <div className="bg-white dark:bg-surface-900 p-2 rounded border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100">XXXX-XXXX-XXXX</div>
                  <div className="bg-white dark:bg-surface-900 p-2 rounded border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100">XXXX-XXXX-XXXX</div>
                  <div className="bg-white dark:bg-surface-900 p-2 rounded border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100">XXXX-XXXX-XXXX</div>
                  <div className="bg-white dark:bg-surface-900 p-2 rounded border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100">XXXX-XXXX-XXXX</div>
                  <div className="bg-white dark:bg-surface-900 p-2 rounded border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100">XXXX-XXXX-XXXX</div>
                  <div className="bg-white dark:bg-surface-900 p-2 rounded border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100">XXXX-XXXX-XXXX</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm">
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  Generate New Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Setup 2FA Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title="Enable Two-Factor Authentication"
        description="Scan the QR code with your authenticator app"
        size="lg"
      >
        <div className="space-y-4">
          {setupData && (
            <>
              {/* QR Code */}
              <div className="flex flex-col items-center py-4">
                <div
                  className="bg-white dark:bg-surface-900 p-4 rounded-lg border-2 border-surface-300 dark:border-surface-600 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: setupData.qr_code }}
                />
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 text-center">
                  Scan this QR code with Google Authenticator, Authy, or another
                  authenticator app
                </p>
              </div>

              {/* Manual Entry */}
              <div className="bg-surface-50 dark:bg-surface-800/50 rounded-lg p-4 border border-surface-200 dark:border-surface-700">
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Can't scan the QR code?
                </p>
                <p className="text-xs text-surface-600 dark:text-surface-400 mb-2">
                  Enter this code manually in your authenticator app:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-surface-900 px-3 py-2 rounded border border-surface-200 dark:border-surface-700 font-mono text-sm text-surface-900 dark:text-surface-100">
                    {setupData.secret}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(setupData.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Verification */}
              <form onSubmit={handleEnableSubmit}>
                <Input
                  label="Verification Code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  hint="Enter the 6-digit code from your authenticator app"
                  required
                />

                <ModalFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowSetupModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={enableMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </div>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        title="Disable Two-Factor Authentication"
        description="Enter your password to confirm"
      >
        <form onSubmit={handleDisableSubmit} className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              Disabling 2FA will make your account less secure. You will only need
              your password to log in.
            </p>
          </div>

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDisableModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={disableMutation.isPending}
            >
              Disable 2FA
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
