"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

type Props = {
  loginOpen: boolean;
  setLoginOpen: (v: boolean) => void;
  isLight: boolean;
  email: string;
  setEmail: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  error?: string;
  handleLogin: () => Promise<void> | void;
};

export default function LoginModal({ loginOpen, setLoginOpen, isLight, email, setEmail, password, setPassword, error, handleLogin }: Props) {
  return (
    <AnimatePresence>
      {loginOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className={isLight ? "absolute inset-0 bg-white/60 backdrop-blur-sm" : "absolute inset-0 bg-black/60 backdrop-blur-sm"} onClick={() => setLoginOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

          <motion.div className={`relative rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 backdrop-blur-xl ${isLight ? 'bg-white border border-slate-200' : 'bg-gradient-to-br from-slate-800 to-green-800 border border-white/20'}`} initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <h3 className={`text-2xl font-bold mb-6 text-center ${isLight ? 'text-slate-900' : 'text-white'}`}>Welcome Back</h3>
            {error && (<motion.p className="text-red-500 mb-4 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.p>)}

            <div className="space-y-4">
              <motion.input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500' : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'}`} whileFocus={{ scale: 1.02 }} />
              <motion.input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500' : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'}`} whileFocus={{ scale: 1.02 }} />
              <MagneticButton onClick={handleLogin} className="w-full">Sign In</MagneticButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
