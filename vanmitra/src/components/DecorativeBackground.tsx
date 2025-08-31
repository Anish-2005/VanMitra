"use client";

import React from "react";
import { motion } from "framer-motion";
import { Leaf, Trees, Mountain, Droplets, Sprout } from "lucide-react";

const seeded = (i: number, salt = 1) => {
  return Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;
};

export default function DecorativeBackground({ count = 6 }: { count?: number }) {
  return (
    <>
      <div className="absolute top-8 right-8 opacity-12 pointer-events-none">
        <Trees size={120} className="text-green-600 rotate-12" />
      </div>
      <div className="absolute bottom-16 left-6 opacity-10 pointer-events-none">
        <Mountain size={140} className="text-green-700" />
      </div>
      <div className="absolute top-1/3 left-12 opacity-8 pointer-events-none">
        <Sprout size={86} className="text-green-500" />
      </div>
      <div className="absolute bottom-36 right-16 opacity-12 pointer-events-none">
        <Droplets size={72} className="text-blue-400" />
      </div>

      {[...Array(count)].map((_, i) => {
        const r1 = seeded(i, 11);
        const r2 = seeded(i, 22);
        const duration = 6 + r1 * 6;
        const top = `${(r2 * 78 + 6).toFixed(6)}%`;
        const left = `${(r1 * 92 + 3).toFixed(6)}%`;
        return (
          <motion.div
            key={`dec-${i}`}
            animate={{ y: [0, -18, 0], x: [0, 12, 0], rotate: [0, 8, 0] }}
            transition={{ duration, repeat: Infinity }}
            style={{ position: "absolute", top, left }}
            aria-hidden
          >
            <div className="absolute text-green-500 opacity-30 pointer-events-none">
              <Leaf size={20} />
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
