/**
 * Profile Settings Component
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Input,
  Badge,
} from '@/components/ui';
import { User, Mail, Phone, Calendar, Crown, Save } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function ProfileSettings() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: () => {
      fetchUser();
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Your account information and membership</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user?.account_type === 'verified' ? 'success' : 'warning'}>
                  {user?.account_type === 'verified' ? 'Verified' : 'Anonymous'}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Membership</p>
              <div className="flex items-center gap-2 mt-1">
                {user?.is_premium ? (
                  <Badge variant="info" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="default">Free</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Email Verified</p>
              <div className="mt-1">
                <Badge variant={user?.email_verified ? 'success' : 'danger'}>
                  {user?.email_verified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">2FA Enabled</p>
              <div className="mt-1">
                <Badge variant={user?.totp_enabled ? 'success' : 'default'}>
                  {user?.totp_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium text-sm mt-1">
                {formatDate(user?.date_joined || '', 'short')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Last Login</p>
              <p className="font-medium text-sm mt-1">
                {formatDate(user?.last_login || '', 'short')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
              />

              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={user?.account_type === 'anonymous'}
              hint={
                user?.account_type === 'anonymous'
                  ? 'Email not available for anonymous accounts'
                  : undefined
              }
            />

            <Input
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
              hint="Used for SMS check-in reminders (optional)"
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    email: user?.email || '',
                    phone_number: user?.phone_number || '',
                  })
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email Verification */}
      {user?.account_type === 'verified' && !user?.email_verified && (
        <Card variant="bordered" className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    Verify Your Email
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Please verify your email address to enable check-in reminders
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm">
                Resend Verification Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
