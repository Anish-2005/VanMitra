"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure hydration only on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center ml-4">
        <div
          className="p-2 rounded-full bg-transparent border border-transparent"
          style={{ width: 40, height: 40 }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center ml-4">
      <motion.button
        onClick={toggle}
        aria-label="Toggle theme"
        initial={false}
        animate={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))"
              : "linear-gradient(135deg, #d1fae5, #a7f3d0)",
          borderColor:
            theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(5,150,105,0.3)",
          boxShadow:
            theme === "dark"
              ? "0 0 15px rgba(34,197,94,0.3)"
              : "0 0 15px rgba(16,185,129,0.5)",
        }}
        whileHover={{
          scale: 1.1,
          rotate: theme === "dark" ? 10 : -10,
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="relative flex items-center justify-center w-12 h-12 rounded-full border overflow-hidden"
      >
        {/* Animated icon switch */}
        <AnimatePresence mode="wait" initial={false}>
          {theme === "dark" ? (
            <motion.div
              key="sun"
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 90 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-yellow-400"
            >
              <Sun size={22} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ opacity: 0, scale: 0, rotate: 90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: -90 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-emerald-700"
            >
              <Moon size={22} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow:
              theme === "dark"
                ? [
                    "0 0 0px rgba(34,197,94,0)",
                    "0 0 10px rgba(34,197,94,0.5)",
                    "0 0 0px rgba(34,197,94,0)",
                  ]
                : [
                    "0 0 0px rgba(16,185,129,0)",
                    "0 0 12px rgba(16,185,129,0.6)",
                    "0 0 0px rgba(16,185,129,0)",
                  ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>
    </div>
  );
}
