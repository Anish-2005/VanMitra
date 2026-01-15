"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Droplets, Leaf, Mountain, Sprout, Sun, Trees } from "lucide-react";

const DecorativeElements = () => {
  const [isClient, setIsClient] = useState(false);

  // Seeded randomness for deterministic positioning
  const seeded = (i: number, salt = 1) =>
    Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;

  // Floating icons pool - forest/nature themed
  const floatIcons = [Leaf, Sprout, Droplets, Trees];

  useEffect(() => {
    const id = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(id);
  }, []);

  // Don't render on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Static large elements with depth layers */}
      <div className="absolute top-12 right-12 opacity-10 pointer-events-none z-1">
        <motion.div
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: [0.9, 1, 0.9], rotate: [-5, -2, -5] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        >
          <Trees size={120} className="text-green-600" />
        </motion.div>
      </div>

      <div className="absolute bottom-16 left-8 opacity-8 pointer-events-none z-1">
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: [10, -8, 10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mountain size={140} className="text-green-700" />
        </motion.div>
      </div>

      <div className="absolute top-1/3 left-16 opacity-12 pointer-events-none z-1">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sun size={80} className="text-yellow-500" />
        </motion.div>
      </div>

      <div className="absolute top-2/3 right-20 opacity-10 pointer-events-none z-1">
        <motion.div
          animate={{ x: [0, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cloud size={100} className="text-blue-400" />
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
        const opacity = Number((0.08 + r2 * 0.15).toFixed(3));

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
            <div
              style={{
                opacity,
                color: r2 > 0.7 ? "#16a34a" : r1 > 0.6 ? "#15803d" : r2 > 0.4 ? "#22c55e" : "#10b981",
              }}
            >
              <Icon size={size} />
            </div>
          </motion.div>
        );
      })}
    </>
  );
};
export default DecorativeElements;