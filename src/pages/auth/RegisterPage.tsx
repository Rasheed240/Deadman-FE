import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import type { AccountType } from '@/types';
import {
  Bomb,
  Sun,
  Moon,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Ghost,
  Check,
  Lock,
  Users,
  Zap,
} from 'lucide-react';

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

const benefits = [
  { icon: Lock, text: 'End-to-end encrypted messages' },
  { icon: Users, text: 'Multi-channel recipient delivery' },
  { icon: Zap, text: 'Automated check-in system' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const { theme, toggleTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('verified');
  const [showPassword, setShowPassword] = useState(false);

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
      await registerUser(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-surface-900 to-surface-800" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-40 right-20 w-80 h-80 bg-primary-600 rounded-full blur-[128px]" />
          <div className="absolute bottom-40 left-20 w-72 h-72 bg-primary-400 rounded-full blur-[128px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow">
              <Bomb className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Dead Man's</span>
              <span className="text-2xl font-bold text-primary-400"> Bomb</span>
            </div>
          </div>

          {/* Center content */}
          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                Prepare your legacy
                <br />
                <span className="text-primary-400">with confidence.</span>
              </h2>
              <p className="mt-4 text-lg text-surface-300">
                Create encrypted messages that are delivered exactly when and how you want them.
              </p>
            </motion.div>

            <div className="mt-10 space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <benefit.icon className="h-4 w-4 text-primary-400" />
                  </div>
                  <span className="text-surface-300 text-sm">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-sm text-surface-500">
            Join thousands preparing for the unexpected.
          </p>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Theme toggle */}
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-surface-600" />
              )}
            </button>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Bomb className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-surface-900 dark:text-white">Dead Man's</span>
              <span className="text-xl font-bold text-primary-500"> Bomb</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-surface-500 dark:text-surface-400">
              Choose your account type and get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange('verified')}
                  className={`relative p-4 border-2 rounded-xl text-left transition-all duration-200 ${accountType === 'verified'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-1 ring-primary-500/30'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                    }`}
                >
                  {accountType === 'verified' && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <ShieldCheck className={`h-5 w-5 mb-2 ${accountType === 'verified' ? 'text-primary-500' : 'text-surface-400'}`} />
                  <div className="font-semibold text-sm text-surface-900 dark:text-surface-100">Verified</div>
                  <div className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">$2/recipient</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange('anonymous')}
                  className={`relative p-4 border-2 rounded-xl text-left transition-all duration-200 ${accountType === 'anonymous'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-1 ring-primary-500/30'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                    }`}
                >
                  {accountType === 'anonymous' && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <Ghost className={`h-5 w-5 mb-2 ${accountType === 'anonymous' ? 'text-primary-500' : 'text-surface-400'}`} />
                  <div className="font-semibold text-sm text-surface-900 dark:text-surface-100">Anonymous</div>
                  <div className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">$5/recipient</div>
                </button>
              </div>
            </div>

            {accountType === 'verified' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...registerField('email')}
                  disabled={isLoading}
                />
              </motion.div>
            )}

            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              error={errors.username?.message}
              {...registerField('username')}
              disabled={isLoading}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                hint="Mix of letters, numbers, and symbols"
                error={errors.password?.message}
                {...registerField('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              error={errors.password_confirm?.message}
              {...registerField('password_confirm')}
              disabled={isLoading}
            />

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 mt-0.5 rounded-md border-surface-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800"
                {...registerField('terms_accepted')}
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-surface-600 dark:text-surface-400 leading-tight">
                I accept the{' '}
                <Link to="/terms" target="_blank" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms_accepted && (
              <p className="text-xs text-danger-500">{errors.terms_accepted.message}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Create account
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* Sign in link */}
          <div className="mt-8 text-center">
            <span className="text-sm text-surface-500 dark:text-surface-400">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Sign in
              </Link>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
