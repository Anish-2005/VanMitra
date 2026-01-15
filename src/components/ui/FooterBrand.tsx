"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

type Props = { isLight: boolean };

export default function FooterBrand({ isLight }: Props) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <motion.div className={`relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden `}>
        <Logo />
      </motion.div>
      <div>
        <div className={`text-base sm:text-lg font-semibold ${isLight ? 'text-green-900' : 'text-white'}`}>
          VanMitra
        </div>
        <div className={`text-xs sm:text-sm ${isLight ? 'text-green-700' : 'text-emerald-300'}`}>
          © {new Date().getFullYear()}:- For tribal land rights
        </div>
      </div>
    </div>
  );
}
