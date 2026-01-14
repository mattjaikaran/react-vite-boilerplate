/**
 * Dashboard Page
 * Main dashboard with stats, charts, and activity overview
 */

import { AreaChart, BarChart, DonutChart, StatCard } from '@/components/charts';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTodoStats, useTodos } from '@/hooks';
import { createFileRoute } from '@tanstack/react-router';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Clock,
  TrendingUp,
} from 'lucide-react';

export const Route = createFileRoute('/dashboard' as any)({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useTodoStats();
  const { data: todosData, isLoading: todosLoading } = useTodos({ limit: 5 });

  // Mock data for charts (in real app, this would come from API)
  const weeklyActivityData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 8 },
    { label: 'Thu', value: 25 },
    { label: 'Fri', value: 15 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 3 },
  ];

  const priorityData = [
    {
      label: 'High',
      value: stats?.byPriority?.high || 5,
      color: 'hsl(0, 84%, 60%)',
    },
    {
      label: 'Medium',
      value: stats?.byPriority?.medium || 12,
      color: 'hsl(38, 92%, 50%)',
    },
    {
      label: 'Low',
      value: stats?.byPriority?.low || 8,
      color: 'hsl(142, 71%, 45%)',
    },
  ];

  const monthlyData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 38 },
    { label: 'Apr', value: 65 },
    { label: 'May', value: 48 },
    { label: 'Jun', value: 73 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your tasks and activity.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tasks"
            value={stats?.total || 0}
            icon={CheckSquare}
            trend={{ value: 12, label: 'from last month' }}
            loading={statsLoading}
          />
          <StatCard
            title="Completed"
            value={stats?.completed || 0}
            icon={TrendingUp}
            trend={{ value: 8, label: 'from last week' }}
            loading={statsLoading}
          />
          <StatCard
            title="Pending"
            value={stats?.pending || 0}
            icon={Clock}
            trend={{
              value: -5,
              label: 'from last week',
              isPositiveGood: false,
            }}
            loading={statsLoading}
          />
          <StatCard
            title="Overdue"
            value={stats?.overdue || 0}
            icon={AlertTriangle}
            trend={{ value: 2, label: 'need attention', isPositiveGood: false }}
            loading={statsLoading}
          />
        </div>

        {/* Charts row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Activity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Tasks completed this week</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart data={weeklyActivityData} height={250} />
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DonutChart
                data={priorityData}
                size={180}
                thickness={25}
                showCenter
                centerValue={stats?.total || 25}
                centerLabel="Total"
                showLegend={false}
              />
            </CardContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                {priorityData.map(item => (
                  <div key={item.label} className="text-center">
                    <div
                      className="mb-1 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Trend
              </CardTitle>
              <CardDescription>Completed tasks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={monthlyData} height={200} />
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your latest task activity</CardDescription>
            </CardHeader>
            <CardContent>
              {todosLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : todosData?.data && todosData.data.length > 0 ? (
                <div className="space-y-3">
                  {todosData.data.map(todo => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          todo.completed
                            ? 'bg-emerald-500'
                            : todo.priority === 'high'
                              ? 'bg-rose-500'
                              : todo.priority === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-sky-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${
                            todo.completed
                              ? 'text-muted-foreground line-through'
                              : ''
                          }`}
                        >
                          {todo.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {todo.priority} priority
                        </p>
                      </div>
                      {todo.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No tasks yet. Create your first task!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
