/**
 * Settings Page - Main layout with tabs
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui';
import { User, Shield, Smartphone, Monitor, Download, Trash2 } from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';
import { SecuritySettings } from './SecuritySettings';
import { TwoFactorSettings } from './TwoFactorSettings';
import { SessionsSettings } from './SessionsSettings';
import { DataSettings } from './DataSettings';

type SettingsTab = 'profile' | 'security' | '2fa' | 'sessions' | 'data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: '2fa' as const, label: 'Two-Factor Auth', icon: Smartphone },
    { id: 'sessions' as const, label: 'Active Sessions', icon: Monitor },
    { id: 'data' as const, label: 'Data & Privacy', icon: Download },
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-surface-900 via-surface-800 to-surface-900 dark:from-surface-50 dark:via-surface-100 dark:to-surface-50 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="mt-1 text-surface-600 dark:text-surface-400 transition-colors duration-300">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div variants={itemVariants}>
          <Card variant="bordered" className="h-fit backdrop-blur-sm bg-surface-50/50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700 rounded-xl transition-colors duration-300">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white shadow-lg shadow-primary-500/30 dark:shadow-primary-500/20'
                          : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 hover:shadow-md'
                      }`}
                    >
                      <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                      <span className={`transition-all duration-300 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Area */}
        <motion.div
          className="lg:col-span-3"
          variants={itemVariants}
        >
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === '2fa' && <TwoFactorSettings />}
            {activeTab === 'sessions' && <SessionsSettings />}
            {activeTab === 'data' && <DataSettings />}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
