import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { checkinsApi } from '@/lib/api';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Modal, ModalFooter, Input,
} from '@/components/ui';
import { CheckCircle, AlertCircle, Clock, Pause, Play, Users as UsersIcon } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function CheckinsPage() {
  const queryClient = useQueryClient();
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseDays, setPauseDays] = useState('7');
  const [pauseReason, setPauseReason] = useState('');
  const [showEmergencyContactsModal, setShowEmergencyContactsModal] = useState(false);

  const { data: schedule, isLoading: scheduleLoading } = useQuery({ queryKey: ['checkin-schedule'], queryFn: checkinsApi.getSchedule });
  const { data: currentCheckin } = useQuery({ queryKey: ['checkin', 'current'], queryFn: checkinsApi.getCurrent, retry: false });
  const { data: history } = useQuery({ queryKey: ['checkins'], queryFn: () => checkinsApi.list() });
  const { data: emergencyContacts } = useQuery({ queryKey: ['emergency-contacts'], queryFn: checkinsApi.listContacts });

  const completeMutation = useMutation({
    mutationFn: () => checkinsApi.complete({ manual: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin'] });
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      toast.success('Check-in completed successfully!');
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (data: { days: number; reason: string }) => checkinsApi.pauseCheckins(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin-schedule'] });
      setShowPauseModal(false);
      setPauseDays('7');
      setPauseReason('');
      toast.success('Check-ins paused successfully');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: checkinsApi.resumeCheckins,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin-schedule'] });
      toast.success('Check-ins resumed successfully');
    },
  });

  const handlePause = () => {
    if (!pauseReason.trim()) { toast.error('Please provide a reason'); return; }
    pauseMutation.mutate({ days: parseInt(pauseDays), reason: pauseReason });
  };

  const getFrequencyDisplay = (f: string) => ({ daily: 'Every Day', weekly: 'Every Week', monthly: 'Every Month', custom: 'Custom' }[f] || f);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Check-ins</h1>
        <p className="mt-1 text-surface-500 dark:text-surface-400">Regular check-ins ensure your messages are only sent when necessary</p>
      </motion.div>

      {currentCheckin && currentCheckin.status === 'pending' && (
        <motion.div variants={item}>
          <Card variant="bordered" className={`${currentCheckin.is_overdue ? 'border-danger-500/50 bg-danger-50 dark:bg-danger-950/20' : 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20'}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${currentCheckin.is_overdue ? 'bg-danger-100 dark:bg-danger-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                    {currentCheckin.is_overdue ? <AlertCircle className="h-6 w-6 text-danger-600 dark:text-danger-400" /> : <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${currentCheckin.is_overdue ? 'text-danger-900 dark:text-danger-300' : 'text-amber-900 dark:text-amber-300'}`}>
                      {currentCheckin.is_overdue ? 'Check-in Overdue!' : 'Check-in Due Soon'}
                    </h3>
                    <p className={`text-sm ${currentCheckin.is_overdue ? 'text-danger-700 dark:text-danger-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      Due {formatRelativeTime(currentCheckin.due_date)}
                    </p>
                  </div>
                </div>
                <Button variant="primary" size="lg" onClick={() => completeMutation.mutate()} isLoading={completeMutation.isPending}>
                  <CheckCircle className="h-5 w-5" />Complete Check-in
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Check-in Schedule</CardTitle>
                {schedule?.is_paused ? (
                  <Button size="sm" variant="primary" onClick={() => resumeMutation.mutate()} isLoading={resumeMutation.isPending}>
                    <Play className="h-4 w-4" />Resume
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setShowPauseModal(true)}>
                    <Pause className="h-4 w-4" />Pause
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduleLoading ? (
                <p className="text-surface-500 dark:text-surface-400">Loading schedule...</p>
              ) : schedule ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-surface-500 dark:text-surface-400">Frequency</p><p className="text-base font-semibold text-surface-900 dark:text-white">{getFrequencyDisplay(schedule.frequency)}</p></div>
                    <div><p className="text-xs text-surface-500 dark:text-surface-400">Grace Period</p><p className="text-base font-semibold text-surface-900 dark:text-white">{schedule.grace_period_days} days</p></div>
                    <div><p className="text-xs text-surface-500 dark:text-surface-400">Next Check-in</p><p className="text-base font-semibold text-surface-900 dark:text-white">{formatDate(schedule.next_checkin_due, 'long')}</p></div>
                    <div><p className="text-xs text-surface-500 dark:text-surface-400">Last Check-in</p><p className="text-base font-semibold text-surface-900 dark:text-white">{schedule.last_checkin_at ? formatRelativeTime(schedule.last_checkin_at) : 'Never'}</p></div>
                  </div>

                  {schedule.is_paused && (
                    <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-300">Check-ins are paused</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Until: {formatDate(schedule.paused_until!, 'long')}</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">Reason: {schedule.pause_reason}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={schedule.send_email_reminders ? 'success' : 'default'}>Email: {schedule.send_email_reminders ? 'On' : 'Off'}</Badge>
                    <Badge variant={schedule.send_sms_reminders ? 'success' : 'default'}>SMS: {schedule.send_sms_reminders ? 'On' : 'Off'}</Badge>
                    <Badge variant={schedule.enable_escalation ? 'warning' : 'default'}>Escalation: {schedule.enable_escalation ? 'On' : 'Off'}</Badge>
                  </div>
                </>
              ) : (
                <p className="text-surface-500 dark:text-surface-400">No schedule configured</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Emergency Contacts</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowEmergencyContactsModal(true)}>
                  <UsersIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {emergencyContacts?.results.length === 0 ? (
                <div className="text-center py-4">
                  <div className="h-12 w-12 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-2">
                    <UsersIcon className="h-6 w-6 text-surface-400" />
                  </div>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">No emergency contacts</p>
                  <Button size="sm" variant="primary" onClick={() => setShowEmergencyContactsModal(true)}>Add Contact</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {emergencyContacts?.results.slice(0, 3).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-surface-900 dark:text-surface-100">{contact.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{contact.relationship}</p>
                      </div>
                      <Badge variant={contact.is_verified ? 'success' : 'warning'} size="sm">{contact.is_verified ? 'Verified' : 'Pending'}</Badge>
                    </div>
                  ))}
                  {emergencyContacts && emergencyContacts.results.length > 3 && (
                    <Button size="sm" variant="ghost" fullWidth onClick={() => setShowEmergencyContactsModal(true)}>
                      View all ({emergencyContacts.results.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Check-in History</CardTitle>
            <CardDescription>Recent check-in activity</CardDescription>
          </CardHeader>
          <CardContent>
            {history?.results.length === 0 ? (
              <p className="text-surface-500 dark:text-surface-400 text-center py-8">No check-in history yet</p>
            ) : (
              <div className="space-y-2">
                {history?.results.slice(0, 10).map((checkin) => (
                  <div key={checkin.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${checkin.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/50' : checkin.status === 'missed' ? 'bg-danger-100 dark:bg-danger-900/50' : 'bg-surface-100 dark:bg-surface-700'}`}>
                        {checkin.status === 'completed' ? <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : checkin.status === 'missed' ? <AlertCircle className="h-4 w-4 text-danger-600 dark:text-danger-400" /> : <Clock className="h-4 w-4 text-surface-600 dark:text-surface-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-surface-900 dark:text-surface-100">{checkin.status === 'completed' ? 'Check-in completed' : checkin.status === 'missed' ? 'Check-in missed' : 'Check-in pending'}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">Due: {formatDate(checkin.due_date)}</p>
                      </div>
                    </div>
                    {checkin.completed_at && <p className="text-sm text-surface-500 dark:text-surface-400">{formatRelativeTime(checkin.completed_at)}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Modal isOpen={showPauseModal} onClose={() => setShowPauseModal(false)} title="Pause Check-ins" description="Temporarily pause your check-in schedule">
        <div className="space-y-4">
          <Input label="Duration (days)" type="number" min="1" max="90" value={pauseDays} onChange={(e) => setPauseDays(e.target.value)} hint="Maximum 90 days" />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Reason</label>
            <textarea rows={3} className="w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="e.g., Hospitalization, vacation, etc." value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} />
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowPauseModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handlePause} isLoading={pauseMutation.isPending}>Pause Check-ins</Button>
          </ModalFooter>
        </div>
      </Modal>

      <Modal isOpen={showEmergencyContactsModal} onClose={() => setShowEmergencyContactsModal(false)} title="Emergency Contacts" description="Manage your emergency contacts" size="lg">
        <div className="text-center py-8">
          <p className="text-surface-500 dark:text-surface-400">Emergency contacts management will be implemented here</p>
        </div>
      </Modal>
    </motion.div>
  );
}
