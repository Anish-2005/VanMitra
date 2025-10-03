"use client";

import React from 'react';
import { Server } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AdminHeader({
  title = 'Admin Panel',
  subtitle = 'Administration & Operations',
  isLight = true,
}: {
  title?: string;
  subtitle?: string;
  isLight?: boolean;
}) {
  return (
    <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center border border-emerald-700 shadow-md shrink-0">
            <Server className="text-white" />
          </div>
          <div>
            <h1
              className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                isLight ? 'text-green-700' : 'text-green-200'
              }`}
            >
              {title}
            </h1>
            <p
              className={`text-sm ${
                isLight ? 'text-emerald-700' : 'text-emerald-300'
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Nav */}
        <nav className="flex flex-wrap md:flex-nowrap items-center gap-3">
          <Link
            href="/dashboard"
            className={`text-sm font-medium px-4 py-2 rounded-xl backdrop-blur-sm border transition-colors
              ${
                isLight
                  ? 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                  : 'text-emerald-300 border-white/20 bg-white/5 hover:bg-white/10'
              }`}
          >
            Dashboard
          </Link>
          {/* You can add more nav links here if needed */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
