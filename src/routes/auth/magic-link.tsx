import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MagicLinkForm } from '@/forms/auth/MagicLinkForm';
import { useStore } from '@/lib/store';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

// eslint-disable-next-line react-doctor/only-export-components
export const Route = createFileRoute('/auth/magic-link')({
  beforeLoad: () => {
    if (useStore.getState().isAuthenticated) throw redirect({ to: '/todos' });
  },
  component: MagicLinkPage,
});

export function MagicLinkPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            {/* Header content is handled by MagicLinkForm */}
          </CardHeader>
          <CardContent>
            <MagicLinkForm
              onSwitchToLogin={() => {
                void navigate({ to: '/auth/login' });
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
