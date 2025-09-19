"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Droplets, Leaf, Mountain, Sprout, Sun, Trees } from "lucide-react";
import { useTheme } from "../ThemeProvider";

const DecorativeElements = () => {
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  // Seeded randomness for deterministic positioning
  const seeded = (i: number, salt = 1) =>
    Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;

  // Floating icons pool - forest/nature themed
  const floatIcons = [Leaf, Sprout, Droplets, Trees];

  // Don't render on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  const isLight = mounted && theme === 'light';

  // Color definitions for both themes
  const colors = {
    light: {
      trees: "#059669",       // Darker green
      mountain: "#047857",    // Even darker green
      sun: "#d97706",         // Amber/orange
      cloud: "#0ea5e9",       // Sky blue
      floatIcons: ["#065f46", "#047857", "#059669", "#0d9488"] // Various green shades
    },
    dark: {
      trees: "#16a34a",       // Medium green
      mountain: "#15803d",    // Dark green
      sun: "#eab308",         // Yellow
      cloud: "#60a5fa",       // Light blue
      floatIcons: ["#16a34a", "#22c55e", "#10b981", "#0d9488"] // Various green shades
    }
  };

  const currentColors = isLight ? colors.light : colors.dark;

  return (
    <>
      {/* Static large elements with depth layers */}
      <div className="absolute top-12 right-12 pointer-events-none z-1">
        <motion.div
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: [0.9, 1, 0.9], rotate: [-5, -2, -5] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: isLight ? 0.06 : 0.1 }}
        >
          <Trees size={120} style={{ color: currentColors.trees }} />
        </motion.div>
      </div>

      <div className="absolute bottom-16 left-8 pointer-events-none z-1">
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: [10, -8, 10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: isLight ? 0.05 : 0.08 }}
        >
          <Mountain size={140} style={{ color: currentColors.mountain }} />
        </motion.div>
      </div>

      <div className="absolute top-1/3 left-16 pointer-events-none z-1">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: isLight ? 0.08 : 0.12 }}
        >
          <Sun size={80} style={{ color: currentColors.sun }} />
        </motion.div>
      </div>

      <div className="absolute top-2/3 right-20 pointer-events-none z-1">
        <motion.div
          animate={{ x: [0, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: isLight ? 0.06 : 0.1 }}
        >
          <Cloud size={100} style={{ color: currentColors.cloud }} />
        </motion.div>
      </div>

      {/* Floating animated icons */}
      {[...Array(20)].map((_, i) => {
        const r1 = seeded(i, 11);
        const r2 = seeded(i, 22);
        const duration = Number((8 + r1 * 10).toFixed(2));
        const delay = Number((r2 * 5).toFixed(2));
        const top = `${(r2 * 75 + 8).toFixed(2)}%`;
        const left = `${(r1 * 85 + 5).toFixed(2)}%`;

        const Icon = floatIcons[i % floatIcons.length];
        const size = Number((14 + r1 * 20).toFixed(1));
        const opacity = isLight 
          ? Number((0.04 + r2 * 0.08).toFixed(3))  // Lower opacity for light mode
          : Number((0.08 + r2 * 0.15).toFixed(3)); // Higher opacity for dark mode

        // Choose color based on theme and randomness
        const colorIndex = Math.floor(r1 * currentColors.floatIcons.length);
        const color = currentColors.floatIcons[colorIndex];

        return (
          <motion.div
            key={`float-${i}`}
            animate={{
              y: [0, Number((-25 - r1 * 20).toFixed(1)), 0],
              x: [0, (r2 > 0.5 ? 18 : -18), 0],
              rotate: [0, Number((r1 * 20).toFixed(1)), 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ position: "absolute", top, left }}
            aria-hidden
            className="pointer-events-none z-1"
          >
            <div style={{ opacity, color }}>
              <Icon size={size} />
            </div>
          </motion.div>
        );
      })}
    </>
  );
};
export default DecorativeElements;