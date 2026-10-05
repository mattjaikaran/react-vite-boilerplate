/**
 * Settings Page
 * User preferences and account settings
 */

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useLocalStorage } from '@/hooks';
import { useAuth, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Bell, Palette, Shield, User } from 'lucide-react';
import { AppearanceTab } from './-components/AppearanceTab';
import {
  NotificationsTab,
  type NotificationsState,
} from './-components/NotificationsTab';
import { ProfileTab } from './-components/ProfileTab';
import { SecurityTab } from './-components/SecurityTab';

// TanStack Router requires the named Route registration in this file.
// react-doctor-disable-next-line react-doctor/only-export-components
export const Route = createFileRoute('/settings/')({
  beforeLoad: () => {
    if (!useStore.getState().isAuthenticated)
      throw redirect({ to: '/auth/login' });
  },
  component: SettingsPage,
});

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useLocalStorage<SettingsTab>(
    'settings-tab',
    'profile'
  );
  const { user } = useAuth();

  const [notifications, setNotifications] = useLocalStorage<NotificationsState>(
    'notification-preferences',
    {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: false,
      taskReminders: true,
    }
  );

  return (
    <DashboardLayout>
      <div className="gap-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <nav className="shrink-0 lg:w-64">
            <div className="gap-y-1 lg:sticky lg:top-24">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <tab.icon className="size-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="max-w-2xl flex-1">
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'notifications' && (
              <NotificationsTab
                notifications={notifications}
                setNotifications={setNotifications}
              />
            )}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'appearance' && <AppearanceTab />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
