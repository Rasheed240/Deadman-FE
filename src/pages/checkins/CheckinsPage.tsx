/**
 * Check-ins Page
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { checkinsApi } from '@/lib/api';
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
  Heart,
  CheckCircle,
  AlertCircle,
  Clock,
  Pause,
  Play,
  Settings as SettingsIcon,
  Users as UsersIcon,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export function CheckinsPage() {
  const queryClient = useQueryClient();
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseDays, setPauseDays] = useState('7');
  const [pauseReason, setPauseReason] = useState('');
  const [showEmergencyContactsModal, setShowEmergencyContactsModal] = useState(false);

  // Fetch schedule
  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['checkin-schedule'],
    queryFn: checkinsApi.getSchedule,
  });

  // Fetch current check-in
  const { data: currentCheckin } = useQuery({
    queryKey: ['checkin', 'current'],
    queryFn: checkinsApi.getCurrent,
    retry: false,
  });

  // Fetch check-in history
  const { data: history } = useQuery({
    queryKey: ['checkins'],
    queryFn: () => checkinsApi.list(),
  });

  // Fetch emergency contacts
  const { data: emergencyContacts } = useQuery({
    queryKey: ['emergency-contacts'],
    queryFn: checkinsApi.listContacts,
  });

  // Complete check-in mutation
  const completeMutation = useMutation({
    mutationFn: () => checkinsApi.complete({ manual: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin'] });
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      toast.success('Check-in completed successfully!');
    },
  });

  // Pause check-ins mutation
  const pauseMutation = useMutation({
    mutationFn: (data: { days: number; reason: string }) =>
      checkinsApi.pauseCheckins(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin-schedule'] });
      setShowPauseModal(false);
      setPauseDays('7');
      setPauseReason('');
      toast.success('Check-ins paused successfully');
    },
  });

  // Resume check-ins mutation
  const resumeMutation = useMutation({
    mutationFn: checkinsApi.resumeCheckins,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin-schedule'] });
      toast.success('Check-ins resumed successfully');
    },
  });

  const handlePause = () => {
    if (!pauseReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    pauseMutation.mutate({
      days: parseInt(pauseDays),
      reason: pauseReason,
    });
  };

  const getFrequencyDisplay = (frequency: string) => {
    const displays: Record<string, string> = {
      daily: 'Every Day',
      weekly: 'Every Week',
      monthly: 'Every Month',
      custom: 'Custom',
    };
    return displays[frequency] || frequency;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Check-ins</h1>
        <p className="mt-1 text-gray-600">
          Regular check-ins ensure your messages are only sent when necessary
        </p>
      </div>

      {/* Current Check-in Status */}
      {currentCheckin && currentCheckin.status === 'pending' && (
        <Card
          variant="bordered"
          className={`${
            currentCheckin.is_overdue
              ? 'border-red-300 bg-red-50'
              : 'border-yellow-300 bg-yellow-50'
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    currentCheckin.is_overdue
                      ? 'bg-red-200'
                      : 'bg-yellow-200'
                  }`}
                >
                  {currentCheckin.is_overdue ? (
                    <AlertCircle className="h-6 w-6 text-red-700" />
                  ) : (
                    <Clock className="h-6 w-6 text-yellow-700" />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      currentCheckin.is_overdue
                        ? 'text-red-900'
                        : 'text-yellow-900'
                    }`}
                  >
                    {currentCheckin.is_overdue
                      ? 'Check-in Overdue!'
                      : 'Check-in Due Soon'}
                  </h3>
                  <p
                    className={`text-sm ${
                      currentCheckin.is_overdue
                        ? 'text-red-700'
                        : 'text-yellow-700'
                    }`}
                  >
                    Due {formatRelativeTime(currentCheckin.due_date)}
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => completeMutation.mutate()}
                isLoading={completeMutation.isPending}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Complete Check-in
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="bordered" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Check-in Schedule</CardTitle>
              {schedule?.is_paused ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => resumeMutation.mutate()}
                  isLoading={resumeMutation.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPauseModal(true)}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduleLoading ? (
              <p className="text-gray-600">Loading schedule...</p>
            ) : schedule ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getFrequencyDisplay(schedule.frequency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grace Period</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {schedule.grace_period_days} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Check-in</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(schedule.next_checkin_due, 'long')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Check-in</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {schedule.last_checkin_at
                        ? formatRelativeTime(schedule.last_checkin_at)
                        : 'Never'}
                    </p>
                  </div>
                </div>

                {schedule.is_paused && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-900">
                      Check-ins are paused
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Until: {formatDate(schedule.paused_until!, 'long')}
                    </p>
                    <p className="text-sm text-yellow-700">
                      Reason: {schedule.pause_reason}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Badge variant={schedule.send_email_reminders ? 'success' : 'default'}>
                    Email Reminders: {schedule.send_email_reminders ? 'On' : 'Off'}
                  </Badge>
                  <Badge variant={schedule.send_sms_reminders ? 'success' : 'default'}>
                    SMS Reminders: {schedule.send_sms_reminders ? 'On' : 'Off'}
                  </Badge>
                  <Badge variant={schedule.enable_escalation ? 'warning' : 'default'}>
                    Escalation: {schedule.enable_escalation ? 'On' : 'Off'}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-gray-600">No schedule configured</p>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Emergency Contacts</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEmergencyContactsModal(true)}
              >
                <UsersIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {emergencyContacts?.results.length === 0 ? (
              <div className="text-center py-4">
                <UsersIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">
                  No emergency contacts
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowEmergencyContactsModal(true)}
                >
                  Add Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {emergencyContacts?.results.slice(0, 3).map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-600">{contact.relationship}</p>
                    </div>
                    <Badge variant={contact.is_verified ? 'success' : 'warning'} size="sm">
                      {contact.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
                {emergencyContacts && emergencyContacts.results.length > 3 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    fullWidth
                    onClick={() => setShowEmergencyContactsModal(true)}
                  >
                    View all ({emergencyContacts.results.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Check-in History */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Check-in History</CardTitle>
          <CardDescription>Recent check-in activity</CardDescription>
        </CardHeader>
        <CardContent>
          {history?.results.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No check-in history yet</p>
          ) : (
            <div className="space-y-3">
              {history?.results.slice(0, 10).map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        checkin.status === 'completed'
                          ? 'bg-green-100'
                          : checkin.status === 'missed'
                          ? 'bg-red-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {checkin.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : checkin.status === 'missed' ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {checkin.status === 'completed'
                          ? 'Check-in completed'
                          : checkin.status === 'missed'
                          ? 'Check-in missed'
                          : 'Check-in pending'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Due: {formatDate(checkin.due_date)}
                      </p>
                    </div>
                  </div>
                  {checkin.completed_at && (
                    <p className="text-sm text-gray-600">
                      {formatRelativeTime(checkin.completed_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pause Modal */}
      <Modal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        title="Pause Check-ins"
        description="Temporarily pause your check-in schedule"
      >
        <div className="space-y-4">
          <Input
            label="Duration (days)"
            type="number"
            min="1"
            max="90"
            value={pauseDays}
            onChange={(e) => setPauseDays(e.target.value)}
            hint="Maximum 90 days"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Hospitalization, vacation, etc."
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
            />
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowPauseModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePause}
              isLoading={pauseMutation.isPending}
            >
              Pause Check-ins
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Emergency Contacts Modal - Placeholder */}
      <Modal
        isOpen={showEmergencyContactsModal}
        onClose={() => setShowEmergencyContactsModal(false)}
        title="Emergency Contacts"
        description="Manage your emergency contacts"
        size="lg"
      >
        <div className="text-center py-8">
          <p className="text-gray-600">
            Emergency contacts management will be implemented here
          </p>
        </div>
      </Modal>
    </div>
  );
}
