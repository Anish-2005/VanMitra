// Lightweight feature flag accessor. Flags can be set at build-time using NEXT_PUBLIC_ prefixed env vars.
export function isFeatureEnabled(key: string): boolean {
  try {
    const envKey = `NEXT_PUBLIC_FEATURE_${key.toUpperCase()}`;
    const val = process.env[envKey as keyof NodeJS.ProcessEnv];
    if (!val) return false;
    return ['1', 'true', 'on', 'yes'].includes(String(val).toLowerCase());
  } catch {
    return false;
  }
}
