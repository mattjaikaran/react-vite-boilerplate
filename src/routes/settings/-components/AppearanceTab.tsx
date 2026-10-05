import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Palette } from 'lucide-react';

export function AppearanceTab() {
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">
              Starts with your device's color scheme. Toggle between dark and
              light; your choice is saved automatically on this device.
            </p>
          </div>
          <ModeToggle />
        </div>
      </CardContent>
    </Card>
  );
}
