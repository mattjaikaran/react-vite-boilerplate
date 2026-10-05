import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSetTheme, useTheme } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Palette } from 'lucide-react';

const themes = ['light', 'dark', 'system'] as const;

export function AppearanceTab() {
  const selectedTheme = useTheme();
  const setTheme = useSetTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5" aria-hidden="true" />
          Appearance
        </CardTitle>
        <CardDescription>
          Customize how the app looks on your device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset>
          <legend className="text-base font-medium">Theme</legend>
          <p className="mb-4 text-sm text-muted-foreground">
            System follows your device's color scheme. Changes are saved
            automatically on this device.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(theme => (
              <button
                key={theme}
                type="button"
                aria-pressed={selectedTheme === theme}
                onClick={() => setTheme(theme)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors hover:border-primary/50',
                  selectedTheme === theme ? 'border-primary' : 'border-border'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-20 w-full rounded-md',
                    theme === 'light'
                      ? 'border bg-white'
                      : theme === 'dark'
                        ? 'bg-zinc-900'
                        : 'bg-gradient-to-r from-white to-zinc-900'
                  )}
                />
                <span className="text-sm font-medium capitalize">{theme}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
