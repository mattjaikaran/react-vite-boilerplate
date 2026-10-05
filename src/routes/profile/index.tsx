/**
 * Profile Page
 * User profile view and quick stats
 */

import { apiErrorMessage } from '@/api/error';
import {
  authGetCurrentUserOptions,
  todoListTodosOptions,
} from '@/api/generated/@tanstack/react-query.gen';
import type { PaginatedResponseSchemaTodoSchema } from '@/api/generated/types.gen';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { AvatarImage } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useAuth, useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { Calendar, Mail, MapPin, Settings } from 'lucide-react';

// TanStack Router requires the named Route registration in this file.
// react-doctor-disable-next-line react-doctor/only-export-components
export const Route = createFileRoute('/profile/')({
  beforeLoad: () => {
    if (!useStore.getState().isAuthenticated)
      throw redirect({ to: '/auth/login' });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { data: profileData, error: profileError } = useQuery({
    ...authGetCurrentUserOptions(),
    enabled: isAuthenticated,
  });
  const countQueries = useQueries({
    queries: [{}, { completed: true }, { completed: false }].map(query => ({
      ...todoListTodosOptions({ query: { ...query, page_size: 1 } }),
      select: (data: PaginatedResponseSchemaTodoSchema) => data.count,
      enabled: isAuthenticated,
    })),
  });
  const statsError = countQueries.find(query => query.error)?.error;
  const stats = {
    total: countQueries[0].data ?? 0,
    completed: countQueries[1].data ?? 0,
    pending: countQueries[2].data ?? 0,
  };
  const activeUser = profileData || user;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {(profileError || statsError) && (
          <p role="alert" className="text-sm text-destructive">
            {apiErrorMessage(profileError || statsError)}
          </p>
        )}
        {/* Profile header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser?.firstName || activeUser?.email || 'U')}&size=96`}
                  alt={activeUser?.firstName || 'User'}
                  size={96}
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  {activeUser?.firstName && activeUser?.lastName
                    ? `${activeUser.firstName} ${activeUser.lastName}`
                    : 'User'}
                </h1>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="size-4" />
                    {activeUser?.email || 'No email'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    Joined{' '}
                    {activeUser?.dateJoined
                      ? formatDate(activeUser.dateJoined)
                      : 'date unavailable'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {activeUser?.location || 'Location not set'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 size-4" />
                    Account Settings
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/settings">
                    <Settings className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500">
                {stats?.completed || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">
                {stats?.pending || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completion Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.total
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity section */}
        <Card>
          <CardHeader>
            <CardTitle>Example Activity</CardTitle>
            <CardDescription>
              Illustrative layout, not account activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: 'Completed task',
                  item: 'Review documentation',
                  time: '2 hours ago',
                },
                {
                  action: 'Created task',
                  item: 'Update dependencies',
                  time: '5 hours ago',
                },
                {
                  action: 'Updated profile',
                  item: 'Changed email',
                  time: '1 day ago',
                },
                {
                  action: 'Completed task',
                  item: 'Fix login bug',
                  time: '2 days ago',
                },
              ].map(activity => (
                <div
                  key={`${activity.action}-${activity.item}`}
                  className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="size-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>
                      {' · '}
                      <span className="text-muted-foreground">
                        {activity.item}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
