"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure client-side hydration only
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder button with no icon until mounted to avoid hydration mismatch
    return (
      <div className="flex items-center ml-4">
        <button
          aria-label="Toggle theme"
          className="p-2 rounded-lg bg-transparent border border-transparent text-transparent transition flex items-center gap-2"
          style={{ width: '40px', height: '40px' }}
        >
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center ml-4">
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className={`p-2 rounded-lg transition flex items-center gap-2 ${
          theme === "dark" 
            ? "bg-white/10 border border-white/10 text-green-100 hover:bg-white/20" 
            : "bg-green-100 border border-green-200 text-green-800 hover:bg-green-200"
        }`}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
}