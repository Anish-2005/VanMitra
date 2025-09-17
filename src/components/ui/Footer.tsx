"use client";

import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <motion.footer
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 to-emerald-900/90 backdrop-blur-xl border border-emerald-700/30 shadow-2xl"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Leaf className="text-white" size={18} />
          </motion.div>
          <div>
            <div className="text-base sm:text-lg font-semibold text-white">VanMitra</div>
            <div className="text-xs sm:text-sm text-emerald-300">© {new Date().getFullYear()}:-   For tribal land rights</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {["Privacy", "Terms", "Contact"].map((link, i) => (
            <a
              key={link}
              href={`/${link.toLowerCase()}`}
              className="text-emerald-200 hover:text-white transition-colors duration-300 relative text-sm sm:text-base"
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
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500 origin-left"
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