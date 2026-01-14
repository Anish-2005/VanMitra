"use client";

import React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';

type NavItem = { name: string; icon: any; route: string };

type Props = {
  navigationItems: NavItem[];
  isLight: boolean;
  user: any;
  handleSignOut: () => void;
  handleSignIn: () => void;
  navigateToPage: (route: string) => void;
};

export default function NavActions({ navigationItems, isLight, user, handleSignOut, handleSignIn, navigateToPage }: Props) {
  return (
    <nav className="hidden md:flex items-center gap-2">
      {navigationItems.map((item, i) => (
        <motion.button
          key={item.name}
          onClick={() => navigateToPage(item.route)}
          className={`group relative px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 backdrop-blur-sm overflow-hidden ${isLight ? 'text-green-800 hover:text-green-900' : 'text-green-200'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isLight ? 'bg-green-100' : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'}`}
            initial={false}
          />
          <div className="relative flex items-center gap-2">
            <item.icon size={16} className={`transition-colors ${isLight ? 'text-green-600 group-hover:text-green-700' : 'text-green-400'}`} />
            <span>{item.name}</span>
          </div>
        </motion.button>
      ))}

      {user ? (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
          <MagneticButton
            onClick={handleSignOut}
            className="ml-6 px-8 py-3 font-semibold rounded-2xl shadow-lg hover:shadow-2xl"
            style={isLight ?
              { background: 'linear-gradient(90deg, #ef4444, #f97316)', color: 'white', border: '1px solid rgba(0,0,0,0.08)' } :
              { background: 'linear-gradient(90deg,var(--destructive),#fb923c)', color: 'var(--card-foreground)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            Sign out
          </MagneticButton>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
          <MagneticButton
            onClick={handleSignIn}
            className="ml-6 px-8 py-3 font-semibold rounded-2xl shadow-lg hover:shadow-2xl"
            style={isLight ?
              { background: 'linear-gradient(90deg, #059669, #047857)', color: 'white', border: '1px solid rgba(0,0,0,0.08)' } :
              { background: 'linear-gradient(90deg,var(--primary-600),var(--primary-700))', color: 'var(--card-foreground)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            Sign in
          </MagneticButton>
        </motion.div>
      )}

      <ThemeToggle />
    </nav>
  );
}
