import { Button } from '@/components/ui/button';
import { useToggleTheme } from '@/lib/store';
import { Moon, Sun } from 'lucide-react';

export function ModeToggle() {
  const toggleTheme = useToggleTheme();

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun
        aria-hidden="true"
        className="size-[1.2rem] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
      />
      <Moon
        aria-hidden="true"
        className="absolute size-[1.2rem] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
