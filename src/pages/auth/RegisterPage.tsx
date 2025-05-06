/**
 * Register Page
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import type { AccountType } from '@/types';

const registerSchema = z.object({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
  account_type: z.enum(['verified', 'anonymous']),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
}).refine((data) => {
  if (data.account_type === 'verified' && !data.email) {
    return false;
  }
  return true;
}, {
  message: 'Email is required for verified accounts',
  path: ['email'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('verified');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      account_type: 'verified',
      terms_accepted: false,
    },
  });

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    setValue('account_type', type);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await register(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Dead Man's Bomb</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Choose your account type and create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('verified')}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                      accountType === 'verified'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Verified</div>
                    <div className="text-xs text-gray-500 mt-1">$2/recipient</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('anonymous')}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                      accountType === 'anonymous'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Anonymous</div>
                    <div className="text-xs text-gray-500 mt-1">$5/recipient</div>
                  </button>
                </div>
              </div>

              {accountType === 'verified' && (
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...registerField('email')}
                  disabled={isLoading}
                />
              )}

              <Input
                label="Username"
                type="text"
                placeholder="johndoe"
                error={errors.username?.message}
                {...registerField('username')}
                disabled={isLoading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                hint="At least 8 characters"
                error={errors.password?.message}
                {...registerField('password')}
                disabled={isLoading}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.password_confirm?.message}
                {...registerField('password_confirm')}
                disabled={isLoading}
              />

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  {...registerField('terms_accepted')}
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I accept the{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms_accepted && (
                <p className="text-sm text-danger-600">{errors.terms_accepted.message}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Create account
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
