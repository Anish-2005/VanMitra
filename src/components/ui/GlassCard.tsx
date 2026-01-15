"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

// Glass Card Component
const GlassCard = ({ children, className = "", hover = true, ...props }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  const isLight = mounted && theme === 'light';

  return (
    <motion.div
      className={`backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 ${
        isLight
          ? 'bg-white/80 border border-green-200/60 hover:border-green-300/80 text-slate-900'
          : 'bg-white/10 border border-white/20 hover:border-green-400/30 text-white'
      } ${className}`}
      whileHover={hover ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;