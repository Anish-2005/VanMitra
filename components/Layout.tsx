import React from 'react'
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">VanMitra — FRA Atlas & DSS</h1>
          <nav className="space-x-4">
            <Link href="/">Dashboard</Link>
            <Link href="/map">Atlas</Link>
            <Link href="/dss">DSS</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/public">Public</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto p-4">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500">VanMitra • Prototype</footer>
    </div>
  )
}
