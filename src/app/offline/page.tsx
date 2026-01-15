import Link from 'next/link';

export const metadata = {
  title: 'Offline — VanMitra',
  description: 'You are currently offline. Some features may be unavailable.'
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50 to-green-50 dark:from-slate-900 dark:via-green-900 dark:to-emerald-900">
      <div className="text-center px-6">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Offline</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto">It looks like you're offline — some features might be unavailable. Cached content may still be accessible.</p>
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">Return Home</Link>
          <a href="/offline.html" className="inline-flex items-center gap-2 px-5 py-3 border border-emerald-600 text-emerald-600 rounded-lg">Static Fallback</a>
        </div>
      </div>
    </div>
  )
}
