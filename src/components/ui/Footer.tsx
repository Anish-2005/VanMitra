"use client";

import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <motion.footer
      className="relative z-10 max-w-7xl mx-auto px-6 py-12 mt-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-3xl bg-gradient-to-r from-slate-800/50 to-green-800/50 backdrop-blur-xl border border-white/10"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Leaf className="text-white" size={20} />
          </motion.div>
          <div>
            <div className="text-lg font-semibold text-white">VanMitra</div>
            <div className="text-green-300">© {new Date().getFullYear()} — For tribal land rights</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Contact"].map((link, i) => (
            <a
              key={link}
              href={`/${link.toLowerCase()}`}
              className="text-green-200 hover:text-white transition-colors relative"
            >
              <motion.span
                whileHover={{ scale: 1.1, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: "inline-block" }}
              >
                {link}
                <motion.div
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 origin-left"
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