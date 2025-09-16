// src/components/ProtectedRoute.tsx
'use client';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import ThreeBackground from './ui/ThreeBackground';
import FloatingOrbs from './ui/FloatingOrbs';
import DecorativeElements from './ui/DecorativeElements';
import GlassCard from './ui/GlassCard';
import MagneticButton from './ui/MagneticButton';


// Shared background component to avoid duplication
const AuthBackground = () => (
  <>
    <ThreeBackground />
    <DecorativeElements />
    <FloatingOrbs />

    {/* Mesh Gradient Overlay */}
    <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1" />

    {/* Animated Grid */}
    <div className="fixed inset-0 opacity-10 pointer-events-none z-1">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />
    </div>
  </>
);

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Always declare hooks at the top level
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect after a short delay to show the warning
      const timer = setTimeout(() => {
        router.push('/');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // Countdown effect - only runs when user is not authenticated
  useEffect(() => {
    if (!user && !loading && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, user, loading]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
        <AuthBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <motion.div
            className="text-center max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated Logo/Icon */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={36} className="text-white" />
                </motion.div>
              </div>

              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-green-400/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-emerald-400/20"
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent mb-3">
                VanMitra
              </h2>
              <p className="text-xl text-green-300 font-medium mb-2">Forest Rights Platform</p>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Loader2 size={20} className="text-green-400 animate-spin" />
              <p className="text-green-200">Initializing secure connection...</p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="w-full max-w-xs mx-auto bg-slate-800/50 rounded-full h-1 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Unauthenticated State
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
        <AuthBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
          <motion.div
            className="w-full max-w-lg mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <GlassCard className="p-10 text-center bg-gradient-to-br from-slate-800/95 to-green-900/90 border border-green-400/20 shadow-2xl backdrop-blur-xl">
              {/* Animated Icon */}
              <motion.div
                className="relative mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <Shield size={32} className="text-white" />
                </div>

                {/* Warning pulse */}
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-red-400/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-orange-200 bg-clip-text text-transparent mb-4">
                  Access Restricted
                </h2>

                <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-orange-400 mx-auto rounded-full mb-6"></div>

                <p className="text-green-100 leading-relaxed mb-8 text-lg">
                  This secure area requires authentication to protect sensitive forest rights data and ensure compliance with regulatory standards.
                </p>
              </motion.div>

              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <MagneticButton
                  onClick={() => router.push('/')}
                  className="
    w-full py-4 text-lg font-bold
    bg-gradient-to-r from-green-500 to-emerald-500
    hover:from-green-400 hover:to-emerald-400
    active:scale-95 transform transition-all duration-200
    shadow-lg hover:shadow-2xl
    flex items-center justify-center gap-3
    rounded-xl
    text-white
  "
                >
                  <Lock size={22} className="text-white" />
                  Authenticate & Continue
                  <ArrowRight size={22} className="text-white" />
                </MagneticButton>
<div className="flex items-center justify-center gap-2 text-sm text-green-300">
  <motion.div
    key={countdown}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="flex items-center gap-2"
  >
    <span>Redirecting in</span>
    <motion.span
      className={`font-mono text-lg font-bold ${
        countdown <= 3 ? 'text-red-400' :
        countdown <= 5 ? 'text-yellow-400' :
        'text-green-400'
      }`}
      animate={{
        scale: countdown <= 3 ? [1, 1.2, 1] : 1
      }}
      transition={{
        duration: 0.5,
        repeat: countdown <= 3 ? Infinity : 0
      }}
    >
      {countdown}
    </motion.span>
    <span>seconds ...</span>
  </motion.div>
</div>

              </motion.div>

              {/* Security badges */}
              <motion.div
                className="mt-8 pt-6 border-t border-green-400/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex justify-center items-center gap-4 text-xs text-green-400">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    SSL Encrypted
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    GDPR Compliant
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Secure Access
                  </span>
                </div>
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
