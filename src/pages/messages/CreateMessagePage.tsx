/**
 * Create Message Page
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
} from '@/components/ui';
import { ArrowLeft, Lock } from 'lucide-react';

const createMessageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(300),
  body: z.string().min(1, 'Message body is required'),
  user_password: z.string().min(1, 'Password is required for encryption'),
  trigger_type: z.enum(['scheduled', 'checkin_failure', 'manual']),
  scheduled_send_date: z.string().optional(),
});

type CreateMessageFormData = z.infer<typeof createMessageSchema>;

export function CreateMessagePage() {
  const navigate = useNavigate();
  const [triggerType, setTriggerType] = useState<'scheduled' | 'checkin_failure' | 'manual'>('checkin_failure');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateMessageFormData>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      trigger_type: 'checkin_failure',
    },
  });

  const createMutation = useMutation({
    mutationFn: messagesApi.create,
    onSuccess: (data) => {
      toast.success('Message created successfully!');
      navigate(`/messages/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create message');
    },
  });

  const onSubmit = (data: CreateMessageFormData) => {
    createMutation.mutate(data);
  };

  const handleTriggerTypeChange = (type: 'scheduled' | 'checkin_failure' | 'manual') => {
    setTriggerType(type);
    setValue('trigger_type', type);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/messages')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Message</h1>
          <p className="mt-1 text-gray-600">
            Your message will be encrypted with your password
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Give your message a title for identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Message Title"
              placeholder="My Last Words"
              hint="Internal name (not sent to recipients)"
              error={errors.title?.message}
              {...register('title')}
            />
          </CardContent>
        </Card>

        {/* Message Content */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Message Content</CardTitle>
            <CardDescription>
              This content will be encrypted and sent to your recipients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email Subject"
              placeholder="A message from beyond..."
              error={errors.subject?.message}
              {...register('subject')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Body
              </label>
              <textarea
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Write your message here..."
                {...register('body')}
              />
              {errors.body && (
                <p className="mt-1 text-sm text-danger-600">{errors.body.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trigger Type */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Trigger Type</CardTitle>
            <CardDescription>
              How should this message be triggered?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleTriggerTypeChange('checkin_failure')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  triggerType === 'checkin_failure'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-1">
                  Check-in Failure
                </h4>
                <p className="text-sm text-gray-600">
                  Send when you miss your check-in
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerTypeChange('scheduled')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  triggerType === 'scheduled'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-1">Scheduled</h4>
                <p className="text-sm text-gray-600">
                  Send at a specific date/time
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerTypeChange('manual')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  triggerType === 'manual'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-1">Manual</h4>
                <p className="text-sm text-gray-600">
                  Trigger manually when ready
                </p>
              </button>
            </div>

            {triggerType === 'scheduled' && (
              <div className="mt-4">
                <Input
                  label="Scheduled Date & Time"
                  type="datetime-local"
                  error={errors.scheduled_send_date?.message}
                  {...register('scheduled_send_date')}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Encryption */}
        <Card variant="bordered" className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-600" />
              Encryption Password
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Your message will be encrypted with this password. You'll need it to
              preview or edit the message later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              label="Encryption Password"
              type="password"
              placeholder="Enter your account password"
              hint="Use your account password for encryption"
              error={errors.user_password?.message}
              {...register('user_password')}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/messages')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isPending}
          >
            Create Message
          </Button>
        </div>
      </form>
    </div>
  );
}
