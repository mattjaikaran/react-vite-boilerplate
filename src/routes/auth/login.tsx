import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LoginForm } from '@/forms/auth/LoginForm';
import { useStore } from '@/lib/store';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

// eslint-disable-next-line react-doctor/only-export-components
export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    if (useStore.getState().isAuthenticated) throw redirect({ to: '/todos' });
  },
  component: LoginPage,
});

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout requireAuth={false}>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              {/* Header content is handled by LoginForm */}
            </CardHeader>
            <CardContent>
              <LoginForm
                onSuccess={() => { void navigate({ to: '/todos' }); }}
                onSwitchToRegister={() => {
                  void navigate({ to: '/auth/register' });
                }}
                onSwitchToMagicLink={() => {
                  void navigate({ to: '/auth/magic-link' });
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthLayout>
  );
}
