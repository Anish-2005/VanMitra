"use client";

import { useMemo } from 'react';
import { isFeatureEnabled } from '@/lib/featureFlags';

export default function useFeatureFlag(key: string) {
  const enabled = useMemo(() => isFeatureEnabled(key), [key]);
  return enabled;
}
