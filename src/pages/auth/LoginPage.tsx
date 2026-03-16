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
import {
  Shield,
  MessageSquare,
  HeartPulse,
  Bomb,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
  {
    icon: Shield,
    title: 'Military-Grade Encryption',
    description: 'AES-128 Fernet encryption with PBKDF2 key derivation. Even we cannot read your messages.',
  },
  {
    icon: HeartPulse,
    title: 'Smart Check-ins',
    description: 'Automated proof-of-life system with customizable schedules and graceful escalation.',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Channel Delivery',
    description: 'Email, SMS, WhatsApp, Telegram, and Twitter DM. Your message finds its way.',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { theme, toggleTheme } = useThemeStore();
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.totpCode);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message === '2FA_REQUIRED') {
        setRequires2FA(true);
        toast('Enter your 2FA verification code');
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left Panel - Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-800 to-primary-950" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-700 rounded-full blur-[128px]" />
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

          {/* Features */}
          <div className="space-y-8 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                Your words live on,
                <br />
                <span className="text-primary-400">even when you don't.</span>
              </h2>
              <p className="mt-4 text-lg text-surface-300">
                Secure posthumous message delivery for the things that matter most.
              </p>
            </motion.div>

            <div className="space-y-5">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.15 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <feature.icon className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-surface-400 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-sm text-surface-500">
            Trusted by people who plan ahead.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
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
              Welcome back
            </h1>
            <p className="mt-2 text-surface-500 dark:text-surface-400">
              Sign in to manage your posthumous messages
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              disabled={isLoading}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {requires2FA && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Fingerprint className="h-4 w-4 text-primary-500" />
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Two-Factor Authentication
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  error={errors.totpCode?.message}
                  {...register('totpCode')}
                  disabled={isLoading}
                />
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded-md border-surface-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800"
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm text-surface-600 dark:text-surface-400"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Sign in
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <span className="text-sm text-surface-500 dark:text-surface-400">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Create account
              </Link>
            </span>
          </div>

          {/* Legal Links */}
          <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-800 text-center text-xs text-surface-400">
            <Link to="/privacy" className="hover:text-surface-600 dark:hover:text-surface-300">
              Privacy Policy
            </Link>
            {' · '}
            <Link to="/terms" className="hover:text-surface-600 dark:hover:text-surface-300">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
