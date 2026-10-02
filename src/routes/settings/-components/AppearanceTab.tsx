import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Globe, Palette, Save } from 'lucide-react';

export function AppearanceTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5" />
          Appearance
        </CardTitle>
        <CardDescription>Customize how the app looks on your device.</CardDescription>
      </CardHeader>
      <CardContent className="gap-y-6">
        <div>
          <Label className="text-base">Theme</Label>
          <p className="mb-4 text-sm text-muted-foreground">Select your preferred color scheme.</p>
          <div className="grid grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map(theme => (
              <button
                key={theme}
                type="button"
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                  'hover:border-primary/50',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
              >
                <div
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
        </div>

        <div>
          <Label className="flex items-center gap-2 text-base">
            <Globe className="size-4" />
            Language
          </Label>
          <p className="mb-4 text-sm text-muted-foreground">Select your preferred language.</p>
          <select className="w-full rounded-md border bg-background p-2">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <Button className="gap-2">
          <Save className="size-4" />
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
