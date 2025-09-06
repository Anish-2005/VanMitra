"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Trees,
  Mountain,
  Droplets,
  Sprout,
  Sun,
  Cloud,
} from "lucide-react";

// Seeded randomness (deterministic but varied)
const seeded = (i: number, salt = 1) =>
  Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;

// Responsive media query hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// Pool of floating icons
const floatIcons = [Leaf, Sprout, Droplets];

export default function DecorativeBackground({ count = 16 }: { count?: number }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const effectiveCount = isMobile ? Math.floor(count / 2) : count;

  return (
    <>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-950 -z-10" />

      {/* Static large elements (depth layers) */}
      <div className="absolute top-8 right-8 opacity-20 pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: [0.9, 1, 0.9], rotate: [-5, -2, -5] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <Trees size={isMobile ? 80 : 140} className="text-green-700" />
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-6 opacity-15 pointer-events-none">
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: [10, -6, 10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mountain size={isMobile ? 100 : 180} className="text-green-800" />
        </motion.div>
      </div>

      <div className="absolute top-1/4 left-12 opacity-20 pointer-events-none">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sun size={isMobile ? 60 : 100} className="text-yellow-400" />
        </motion.div>
      </div>

      <div className="absolute top-1/2 right-16 opacity-15 pointer-events-none">
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cloud size={isMobile ? 80 : 120} className="text-blue-300" />
        </motion.div>
      </div>

      {/* Floating animated icons */}
      {[...Array(effectiveCount)].map((_, i) => {
        const r1 = seeded(i, 11);
        const r2 = seeded(i, 22);
        const duration = 6 + r1 * 8;
        const delay = r2 * 4;
        const top = `${(r2 * 80 + 6).toFixed(2)}%`;
        const left = `${(r1 * 90 + 3).toFixed(2)}%`;

        const Icon = floatIcons[i % floatIcons.length];
        const size = 12 + r1 * 24;
        const opacity = 0.15 + r2 * 0.5;

        return (
          <motion.div
            key={`dec-${i}`}
            animate={{
              y: [0, -30 - r1 * 15, 0],
              x: [0, (r2 > 0.5 ? 14 : -14), 0],
              rotate: [0, r1 * 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ position: "absolute", top, left }}
            aria-hidden
          >
            <div
              className="pointer-events-none"
              style={{
                opacity,
                color: r2 > 0.6 ? "#16a34a" : r1 > 0.5 ? "#15803d" : "#22c55e", // varied greens
              }}
            >
              <Icon size={size} />
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
