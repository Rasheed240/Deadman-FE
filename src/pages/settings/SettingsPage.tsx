/**
 * Settings Page - Main layout with tabs
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import { User, Shield, Smartphone, Monitor, Download, Trash2 } from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';
import { SecuritySettings } from './SecuritySettings';
import { TwoFactorSettings } from './TwoFactorSettings';
import { SessionsSettings } from './SessionsSettings';
import { DataSettings } from './DataSettings';

type SettingsTab = 'profile' | 'security' | '2fa' | 'sessions' | 'data';

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card variant="bordered" className="h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === '2fa' && <TwoFactorSettings />}
          {activeTab === 'sessions' && <SessionsSettings />}
          {activeTab === 'data' && <DataSettings />}
        </div>
      </div>
    </div>
  );
}
