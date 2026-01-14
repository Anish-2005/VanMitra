"use client";

import React from 'react';
import { motion } from 'framer-motion';

type Props = { isLight: boolean };

export default function FooterLinks({ isLight }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      {['Privacy', 'Terms', 'Contact'].map((link, i) => (
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
            style={{ display: 'inline-block' }}
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
  );
}
