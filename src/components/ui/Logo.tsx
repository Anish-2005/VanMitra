"use client";

import React from "react";
import { useTheme } from "@/components/ThemeProvider";

type Props = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 40, className = "" }: Props) {
  const { theme } = useTheme();
  const isLight = typeof window !== 'undefined' ? (document.documentElement.getAttribute('data-theme') === 'light' || theme === 'light') : true;

  const bg = isLight ? '#ffffff' : 'none';
  const dot = isLight ? '#064E3B' : '#A7F3D0';
  const accent = isLight ? '#FFFFFF' : '#0F172A';

  return (
    <svg width={size} height={size} viewBox="0 0 256 256" className={className} role="img" aria-label="VanMitra logo">
      <defs>
        <linearGradient id="vmG1" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="vmG2" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="256" height="256" rx="36" ry="36" fill={bg} />

      <g transform="translate(24,16) scale(0.8)">
        <path d="M128 16C78 16 32 62 32 112c0 72 96 176 96 176s96-104 96-176c0-50-46-96-96-96z" fill="url(#vmG1)" />
        <path d="M128 48c-18 0-64 24-80 64 12-12 44-28 80-28s68 16 80 28c-16-40-62-64-80-64z" fill={accent} opacity="0.95" />
        <circle cx="128" cy="128" r="8" fill={dot} />
      </g>

      <g transform="translate(16,208) scale(0.6)">
        <path d="M0 32 C48 0 112 0 160 32 C208 64 272 64 320 32" stroke="url(#vmG2)" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
      </g>
    </svg>
  );
}
