"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import FooterBrand from './FooterBrand';
import FooterLinks from './FooterLinks';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  const isLight = mounted && theme === 'light';

  return (
    <motion.footer
      className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 py-8 sm:pt-12 mt-24"
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
        <FooterBrand isLight={isLight} />
        <FooterLinks isLight={isLight} />
      </motion.div>
    </motion.footer>
  );
};

export default Footer;