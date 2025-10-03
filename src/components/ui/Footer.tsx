"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { useTheme } from "../ThemeProvider";

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';

  return (
    <motion.footer
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <motion.div
        className={`flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 p-6 sm:p-8 rounded-3xl backdrop-blur-xl border shadow-2xl ${
          isLight
            ? 'bg-gradient-to-br from-white via-green-50 to-emerald-100 border-green-300/80 shadow-lg'
            : 'bg-gradient-to-r from-slate-900/90 to-emerald-900/90 border-emerald-700/30'
        }`}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div
            className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden ${
              isLight
                ? 'bg-transparent border border-green-200'
                : 'bg-transparent border border-white/10'
            }`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <img src="/vanmitra.png" alt="VanMitra" className="h-8 w-8 object-contain" />
          </motion.div>
          <div>
            <div className={`text-base sm:text-lg font-semibold ${
              isLight ? 'text-green-900' : 'text-white'
            }`}>
              VanMitra
            </div>
            <div className={`text-xs sm:text-sm ${
              isLight ? 'text-green-700' : 'text-emerald-300'
            }`}>
              © {new Date().getFullYear()}:- For tribal land rights
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {["Privacy", "Terms", "Contact"].map((link, i) => (
            <a
              key={link}
              href={`/${link.toLowerCase()}`}
              className={`transition-colors duration-300 relative text-sm sm:text-base ${
                isLight
                  ? 'text-green-800 hover:text-green-900 font-medium'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <motion.span
                whileHover={{ scale: 1.05, y: -1 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: "inline-block" }}
              >
                {link}
                <motion.div
                  className={`absolute -bottom-1 left-0 w-full h-0.5 origin-left ${
                    isLight
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700'
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  }`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span>
            </a>
          ))}
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;