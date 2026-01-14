"use client";

import React from "react";
import { useTheme } from "@/components/ThemeProvider";

type Props = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 40, className = "" }: Props) {
  const { theme } = useTheme();
  const isLight = typeof window !== 'undefined' ? (document.documentElement.getAttribute('data-theme') === 'light' || theme === 'light') : (theme === 'light');

  // theme-aware colors
  const primaryA = isLight ? '#10B981' : '#059669';
  const primaryB = isLight ? '#059669' : '#0EA5A4';
  const waterA = isLight ? '#60A5FA' : '#38BDF8';
  const bgFill = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.02)';
  const frameStroke = isLight ? 'rgba(5,150,105,0.08)' : 'rgba(255,255,255,0.06)';

  return (
    <svg
  width="512"
  height="512"
  viewBox="0 0 512 512"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
>

  <circle
    cx="256"
    cy="256"
    r="220"
    stroke="#2EE59D"
    strokeWidth="18"
  />

  <circle
    cx="256"
    cy="256"
    r="180"
    stroke="#1FAF78"
    strokeWidth="10"
    strokeDasharray="14 14"
  />

  <path
    d="M136 300C176 260 216 280 256 250C296 220 336 230 376 210"
    stroke="#0E3D2F"
    strokeWidth="12"
    strokeLinecap="round"
  />
  <path
    d="M136 340C176 300 216 320 256 290C296 260 336 270 376 250"
    stroke="#0E3D2F"
    strokeWidth="10"
    strokeLinecap="round"
  />

  <path
    d="M256 140
       C210 180 190 230 256 300
       C322 230 302 180 256 140Z"
    fill="#2EE59D"
  />

  <rect
    x="246"
    y="290"
    width="20"
    height="70"
    rx="6"
    fill="#1FAF78"
  />

  <line x1="256" y1="120" x2="256" y2="390" stroke="#2EE59D" strokeWidth="6"/>
  <line x1="120" y1="256" x2="390" y2="256" stroke="#2EE59D" strokeWidth="6"/>

  <circle
    cx="256"
    cy="256"
    r="14"
    fill="#0E3D2F"
    stroke="#2EE59D"
    strokeWidth="6"
  />

</svg>

  );
}
