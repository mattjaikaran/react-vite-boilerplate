/**
 * Feature flag component for conditional rendering
 * Uses Zustand store for feature state
 */

import type { AppConfig } from '@/config';
import { useFeatureEnabled } from '@/lib/store';
import type { ReactNode } from 'react';

interface FeatureFlagProps {
  feature: keyof AppConfig['features'];
  children: ReactNode;
  fallback?: ReactNode;
}

// react-doctor-disable-next-line deslop/unused-export
export function FeatureFlag({
  feature,
  children,
  fallback = null,
}: FeatureFlagProps) {
  const isEnabled = useFeatureEnabled(feature);

  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common features
// react-doctor-disable-next-line deslop/unused-export
export function TodosFeature({
  children,
  fallback,
}: Omit<FeatureFlagProps, 'feature'>) {
  return (
    <FeatureFlag feature="enableTodos" fallback={fallback}>
      {children}
    </FeatureFlag>
  );
}

// react-doctor-disable-next-line deslop/unused-export
export function NotificationsFeature({
  children,
  fallback,
}: Omit<FeatureFlagProps, 'feature'>) {
  return (
    <FeatureFlag feature="enableNotifications" fallback={fallback}>
      {children}
    </FeatureFlag>
  );
}

// react-doctor-disable-next-line deslop/unused-export
export function AnalyticsFeature({
  children,
  fallback,
}: Omit<FeatureFlagProps, 'feature'>) {
  return (
    <FeatureFlag feature="enableAnalytics" fallback={fallback}>
      {children}
    </FeatureFlag>
  );
}

// react-doctor-disable-next-line deslop/unused-export
export function DarkModeFeature({
  children,
  fallback,
}: Omit<FeatureFlagProps, 'feature'>) {
  return (
    <FeatureFlag feature="enableDarkMode" fallback={fallback}>
      {children}
    </FeatureFlag>
  );
}
