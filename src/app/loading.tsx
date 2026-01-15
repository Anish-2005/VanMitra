export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50 to-green-50 dark:from-slate-900 dark:via-green-900 dark:to-emerald-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading VanMitra...</p>
      </div>
    </div>
  );
}