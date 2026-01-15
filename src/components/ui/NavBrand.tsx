"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';

type Props = { isLight: boolean };

export default function NavBrand({ isLight }: Props) {
  return (
    <motion.div
      className="flex items-center gap-4"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div className={`relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden `}>
        <Logo />
      </motion.div>
      <Link href="/">
        <div>
          <motion.h1
            className="text-2xl font-bold tracking-tight"
            style={{
              backgroundImage: isLight
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(to right, white, #a7f3d0, #6ee7b7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            VanMitra
          </motion.h1>
          <motion.p
            className="text-sm font-medium"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={isLight ? { color: '#059669' } : { color: 'var(--primary-300)' }}
          >
            Forest Rights & Asset Mapping Platform
          </motion.p>
        </div>
      </Link>
    </motion.div>
  );
}
