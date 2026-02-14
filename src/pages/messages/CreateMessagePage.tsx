import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { messagesApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '@/components/ui';
import { ArrowLeft, Clock, HeartPulse, Hand, Shield } from 'lucide-react';

const createMessageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(300),
  body: z.string().min(1, 'Message body is required'),
  user_password: z.string().min(1, 'Password is required for encryption'),
  trigger_type: z.enum(['scheduled', 'checkin_failure', 'manual']),
  scheduled_send_date: z.string().optional(),
});

type CreateMessageFormData = z.infer<typeof createMessageSchema>;

const triggerOptions = [
  { type: 'checkin_failure' as const, icon: HeartPulse, title: 'Check-in Failure', description: 'Send when you miss your check-in' },
  { type: 'scheduled' as const, icon: Clock, title: 'Scheduled', description: 'Send at a specific date/time' },
  { type: 'manual' as const, icon: Hand, title: 'Manual', description: 'Trigger manually when ready' },
];

export function CreateMessagePage() {
  const navigate = useNavigate();
  const [triggerType, setTriggerType] = useState<'scheduled' | 'checkin_failure' | 'manual'>('checkin_failure');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateMessageFormData>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: { trigger_type: 'checkin_failure' },
  });

  const createMutation = useMutation({
    mutationFn: messagesApi.create,
    onSuccess: (data) => {
      toast.success('Message created successfully!');
      navigate(`/messages/${data.id}`);
    },
    onError: (error: any) => { toast.error(error.message || 'Failed to create message'); },
  });

  const onSubmit = (data: CreateMessageFormData) => { createMutation.mutate(data); };

  const handleTriggerTypeChange = (type: 'scheduled' | 'checkin_failure' | 'manual') => {
    setTriggerType(type);
    setValue('trigger_type', type);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/messages')} className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Create Message</h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">Your message will be encrypted with your password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Give your message a title for identification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Message Title" placeholder="My Last Words" hint="Internal name (not sent to recipients)" error={errors.title?.message} {...register('title')} />
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Message Content</CardTitle>
            <CardDescription>This content will be encrypted and sent to your recipients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Email Subject" placeholder="A message from beyond..." error={errors.subject?.message} {...register('subject')} />
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Message Body</label>
              <textarea
                rows={10}
                className="w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all duration-200 resize-y"
                placeholder="Write your message here..."
                {...register('body')}
              />
              {errors.body && <p className="mt-1.5 text-xs text-danger-500">{errors.body.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Trigger Type</CardTitle>
            <CardDescription>How should this message be triggered?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {triggerOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = triggerType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleTriggerTypeChange(opt.type)}
                    className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-1 ring-primary-500/30'
                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-primary-500' : 'text-surface-400'}`} />
                    <h4 className="font-semibold text-sm text-surface-900 dark:text-surface-100">{opt.title}</h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{opt.description}</p>
                  </button>
                );
              })}
            </div>

            {triggerType === 'scheduled' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
                <Input label="Scheduled Date & Time" type="datetime-local" error={errors.scheduled_send_date?.message} {...register('scheduled_send_date')} />
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card variant="bordered" className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Encryption Password
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-400">
              Your message will be encrypted with this password. You'll need it to preview or edit later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input label="Encryption Password" type="password" placeholder="Enter your account password" hint="Use your account password for encryption" error={errors.user_password?.message} {...register('user_password')} />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/messages')}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={createMutation.isPending}>Create Message</Button>
        </div>
      </form>
    </motion.div>
  );
}
