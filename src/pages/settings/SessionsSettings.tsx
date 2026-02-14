/**
 * Active Sessions Settings Component
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Badge,
  Modal,
  ModalFooter,
} from '@/components/ui';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Calendar,
  Shield,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { UserSession } from '@/types';

export function SessionsSettings() {
  const queryClient = useQueryClient();
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);

  // Fetch active sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: authApi.getSessions,
  });

  // Revoke session mutation
  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session revoked successfully');
      setShowRevokeModal(false);
      setSelectedSession(null);
    },
    onError: () => {
      toast.error('Failed to revoke session');
    },
  });

  // Revoke all sessions mutation
  const revokeAllMutation = useMutation({
    mutationFn: authApi.revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('All other sessions revoked successfully');
    },
    onError: () => {
      toast.error('Failed to revoke sessions');
    },
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const handleRevokeClick = (session: UserSession) => {
    setSelectedSession(session);
    setShowRevokeModal(true);
  };

  const handleRevoke = () => {
    if (selectedSession) {
      revokeMutation.mutate(selectedSession.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Sessions Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage devices that are currently logged into your account
                </CardDescription>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => revokeAllMutation.mutate()}
                isLoading={revokeAllMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Revoke All Other Sessions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="text-sm text-sky-900 dark:text-sky-100">
                  <p className="font-medium mb-1">Security Tip</p>
                  <p className="text-sky-800 dark:text-sky-200">
                    Review your active sessions regularly. If you see any unfamiliar
                    devices or locations, revoke those sessions immediately and change
                    your password.
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-surface-600 dark:text-surface-400">Loading sessions...</p>
              </div>
            ) : sessions?.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                <p className="text-surface-600 dark:text-surface-400">No active sessions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions?.map((session: UserSession, index: number) => {
                  const DeviceIcon = getDeviceIcon(session.device_type);
                  const isCurrent = session.is_current;

                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        isCurrent
                          ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950/30'
                          : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 hover:border-surface-300 dark:hover:border-surface-600 hover:shadow-md dark:hover:shadow-surface-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div
                            className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                              isCurrent
                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700'
                                : 'bg-gradient-to-br from-surface-200 to-surface-300 dark:from-surface-700 dark:to-surface-800'
                            }`}
                          >
                            <DeviceIcon
                              className={`h-6 w-6 ${
                                isCurrent ? 'text-white' : 'text-surface-600 dark:text-surface-300'
                              }`}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                                {session.device_name || 'Unknown Device'}
                              </h3>
                              {isCurrent && (
                                <Badge variant="success" size="sm">
                                  Current Session
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-1 text-sm text-surface-600 dark:text-surface-400">
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                <span>
                                  {session.browser} on {session.os}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {session.city && session.country
                                    ? `${session.city}, ${session.country}`
                                    : session.ip_address}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Last active {formatRelativeTime(session.last_activity)}
                                </span>
                              </div>

                              <div className="text-xs text-surface-500 dark:text-surface-500">
                                Created: {formatDate(session.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {!isCurrent && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevokeClick(session)}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Session Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-surface-700 dark:text-surface-300">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50 mb-1">
                    What is a session?
                  </p>
                  <p className="text-surface-600 dark:text-surface-400">
                    A session is created each time you log in from a device. It stays
                    active until you log out or revoke it.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50 mb-1">
                    Suspicious activity?
                  </p>
                  <p className="text-surface-600 dark:text-surface-400">
                    If you notice any sessions you don't recognize, revoke them
                    immediately and change your password. Enable two-factor
                    authentication for additional security.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 flex items-center justify-center flex-shrink-0">
                  <Monitor className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50 mb-1">Session expiry</p>
                  <p className="text-surface-600 dark:text-surface-400">
                    Sessions automatically expire after 7 days of inactivity for security
                    purposes. You'll need to log in again after that.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revoke Session Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke Session"
        description="Are you sure you want to revoke this session?"
      >
        <div className="space-y-4">
          {selectedSession && (
            <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-surface-700 dark:text-surface-300">Device:</span>{' '}
                  <span className="text-surface-900 dark:text-surface-100">
                    {selectedSession.device_name || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-surface-700 dark:text-surface-300">Location:</span>{' '}
                  <span className="text-surface-900 dark:text-surface-100">
                    {selectedSession.city && selectedSession.country
                      ? `${selectedSession.city}, ${selectedSession.country}`
                      : selectedSession.ip_address}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-surface-700 dark:text-surface-300">Last Active:</span>{' '}
                  <span className="text-surface-900 dark:text-surface-100">
                    {formatRelativeTime(selectedSession.last_activity)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              This will immediately log out this device. If this wasn't you, consider
              changing your password.
            </p>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowRevokeModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRevoke}
              isLoading={revokeMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Revoke Session
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
