"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingOrbsProps {
  className?: string;
}

const FloatingOrbs: React.FC<FloatingOrbsProps> = ({ className = "" }) => {
  const [isClient, setIsClient] = useState(false);

  // Seeded randomness for deterministic positioning
  const seeded = (i: number, salt = 1) =>
    Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;

  const orbs = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Number((seeded(i, 1) * 200 + 100).toFixed(1)),
    x: Number((seeded(i, 2) * 100).toFixed(3)),
    y: Number((seeded(i, 3) * 100).toFixed(3)),
    duration: Number((seeded(i, 4) * 10 + 15).toFixed(2)),
    delay: Number((seeded(i, 5) * 5).toFixed(2))
  })), []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 50%, transparent 100%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.6, 0.2, 0.3]
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default FloatingOrbs;