import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Save } from 'lucide-react';

export type NotificationsState = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  taskReminders: boolean;
};

const NOTIFICATION_ITEMS = [
  { id: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
  { id: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in your browser' },
  { id: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary of your activity' },
  { id: 'taskReminders', label: 'Task Reminders', description: 'Get reminded about upcoming due dates' },
];

export function NotificationsTab({ notifications, setNotifications }: {
  notifications: NotificationsState;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationsState>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified about updates.</CardDescription>
      </CardHeader>
      <CardContent className="gap-y-6">
        {NOTIFICATION_ITEMS.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label={item.label}
              aria-checked={notifications[item.id as keyof typeof notifications]}
              onClick={() =>
                setNotifications(prev => ({
                  ...prev,
                  [item.id]: !prev[item.id as keyof typeof notifications],
                }))
              }
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                notifications[item.id as keyof typeof notifications] ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition',
                  notifications[item.id as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        ))}
        <Button className="gap-2">
          <Save className="size-4" />
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
