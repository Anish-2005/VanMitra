"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Leaf, Menu, X, Map, FileText, BarChart3, Globe, LayoutDashboard, Sparkles } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { signOut, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import MagneticButton from "./MagneticButton";
import GlassCard from "./GlassCard";
import { useTheme } from "../ThemeProvider";
import ThemeToggle from "./ThemeToggle";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === 'light';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle sign in - open login modal
  const handleSignIn = () => {
    setLoginOpen(true);
    setError("");
  };

  // Handle login form submission
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsSigningIn(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginOpen(false);
      setEmail("");
      setPassword("");
      // User will be automatically redirected by AuthProvider
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError("No account found with this email");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email address");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await signInWithPopup(auth, provider);
      setLoginOpen(false);
      setEmail("");
      setPassword("");
      // User will be automatically redirected by AuthProvider
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Pop-up was blocked by browser");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError("Account exists with different sign-in method");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  // Navigation items with icons
  const navigationItems = [
    { name: "Atlas", icon: Map, route: "/atlas" },
    { name: "OCR", icon: FileText, route: "/ocr" },
    { name: "DSS", icon: BarChart3, route: "/dss" },
    { name: "Public Data", icon: Globe, route: "/public" },
    { name: "Dashboard", icon: LayoutDashboard, route: "/dashboard" }
  ];

  // Navigation function for routing to specific pages
  const navigateToPage = (route: string) => {
    router.push(route);
  };

  const onMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Header */}
      <motion.header
        className="relative z-20 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Logo/Brand */}
        <motion.div
          className="flex items-center gap-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            className={`relative h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden ${isLight ? 'border border-green-200' : 'border border-white/8'}`}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src="/vanmitra.png" alt="VanMitra" className="h-12 w-12 object-contain" />
          </motion.div>
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
        </motion.div>

        {/* Desktop Navigation */}
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
              {/* Hover background effect */}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
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
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
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
          {/* Theme Toggle */}
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Toggle */}
        <motion.button
          className={`md:hidden relative p-3 rounded-2xl backdrop-blur-sm transition-all duration-300 ${isLight ? 'bg-green-50 border border-green-200' : 'bg-white/5 border border-white/6'}`}
          onClick={onMobileMenuToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className={isLight ? "text-green-700" : "text-green-200"} size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className={isLight ? "text-green-700" : "text-green-200"} size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.header>

      {/* Professional Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 backdrop-blur-sm"
              style={isLight
                ? { background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(240,253,244,0.6))' }
                : { background: 'linear-gradient(to bottom, rgba(9, 55, 42, 0.8), rgba(18, 139, 107, 0.6))' }
              }

              onClick={onMobileMenuToggle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Sidebar */}
            <motion.aside
              className="absolute top-0 right-0 w-80 h-full backdrop-blur-xl shadow-2xl"
              style={isLight
                ? { background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(155, 204, 170, 0.6))' }
                : { background: 'linear-gradient(to bottom, rgba(10, 38, 30, 0.8), rgba(11, 84, 36, 0.6))' }
              }

              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-6" style={isLight ? { borderBottom: '1px solid rgba(0,0,0,0.06)' } : { borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={isLight ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : { background: 'linear-gradient(135deg,var(--primary-500),var(--primary-600))' }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <Leaf className="" size={20} style={{ color: 'white' }} />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold" style={isLight ? { color: '#064e3b' } : { color: 'var(--foreground)' }}>VanMitra</h2>
                    <p className="text-xs" style={isLight ? { color: '#059669' } : { color: 'var(--primary-300)' }}>Navigation</p>
                  </div>
                </motion.div>
              </div>

              {/* Navigation Items */}
              <motion.nav
                className="flex flex-col gap-2 p-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2
                    }
                  }
                }}
              >
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => {
                      navigateToPage(item.route);
                      onMobileMenuToggle();
                    }}
                    className={`group relative w-full p-4 rounded-2xl text-left font-medium transition-all duration-300 backdrop-blur-sm border overflow-hidden ${isLight ?
                      'text-green-800 hover:text-green-900 bg-white/50 border-green-100 hover:border-green-300 hover:bg-green-50' :
                      'text-green-100 hover:text-white border-transparent hover:border-white/20 hover:bg-white/10'
                      }`}
                    variants={{
                      hidden: { x: 50, opacity: 0 },
                      visible: {
                        x: 0,
                        opacity: 1,
                        transition: {
                          type: "spring",
                          stiffness: 100,
                          damping: 12
                        }
                      }
                    }}
                    whileHover={{ x: 8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Hover background effect */}
                    <motion.div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isLight ? 'bg-green-100' : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'}`}
                      initial={false}
                    />

                    <div className="relative flex items-center gap-4">
                      <motion.div
                        className={`p-2 rounded-xl transition-colors ${isLight ?
                          'bg-green-100 group-hover:bg-green-200 text-green-700' :
                          'bg-white/10 group-hover:bg-white/20 text-green-400 group-hover:text-emerald-300'
                          }`}
                        whileHover={{ rotate: 5 }}
                      >
                        <item.icon size={18} />
                      </motion.div>
                      <div>
                        <div className={`font-semibold ${isLight ? 'text-green-900' : ''}`}>{item.name}</div>
                        <div className={`text-xs mt-0.5 ${isLight ? 'text-green-600/70' : 'text-green-300/70'}`}>
                          {item.name === "Atlas" && "Interactive mapping"}
                          {item.name === "OCR" && "Document processing"}
                          {item.name === "DSS" && "Decision support"}
                          {item.name === "Public Data" && "Open access data"}
                          {item.name === "Dashboard" && "Analytics & insights"}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}

                {/* Mobile Theme Toggle */}
                {/* Mobile Theme Toggle */}
                <motion.div
                  className={`mt-6 p-4 rounded-2xl shadow-inner border flex flex-col items-center gap-3 ${isLight
                      ? "bg-white/60 border-green-200"
                      : "bg-white/5 border-white/10"
                    }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  
                  <ThemeToggle />
                </motion.div>

              </motion.nav>
              

              {/* User Section */}
              <motion.div
                className={`absolute bottom-0 left-0 right-0 p-6 border-t ${isLight ?
                  'border-green-100 bg-gradient-to-t from-white/20 to-transparent' :
                  'border-white/10 bg-gradient-to-t from-black/20 to-transparent'
                  }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {user ? (
                  <div className="space-y-4">
                    {/* User Info */}
                    <motion.div
                      className={`flex items-center gap-3 p-3 rounded-xl border ${isLight ?
                        'bg-green-50 border-green-200' :
                        'bg-white/5 border-white/10'
                        }`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${isLight ? 'text-green-900' : 'text-white'}`}>
                          {user.email?.split('@')[0]}
                        </p>
                        <p className={isLight ? 'text-green-600 text-xs' : 'text-green-300 text-xs'}>Signed in</p>
                      </div>
                    </motion.div>

                    {/* Sign Out Button */}
                    <MagneticButton
                      onClick={() => {
                        handleSignOut();
                        onMobileMenuToggle();
                      }}
                      className={`w-full font-semibold rounded-xl shadow-lg hover:shadow-2xl border ${isLight ?
                        'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white border-red-300' :
                        'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white border-white/20'
                        }`}
                    >
                      Sign out
                    </MagneticButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <p className={isLight ? 'text-green-700 text-sm mb-4' : 'text-green-300 text-sm mb-4'}>
                        Access all features by signing in
                      </p>
                    </motion.div>

                    <MagneticButton
                      onClick={() => {
                        handleSignIn();
                        onMobileMenuToggle();
                      }}
                      className={`w-full font-semibold rounded-xl shadow-lg hover:shadow-2xl border ${isLight ?
                        'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-green-300' :
                        'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-white/20'
                        }`}
                    >
                      Sign in
                    </MagneticButton>
                  </div>
                )}
                
              </motion.div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {loginOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 backdrop-blur-sm"
              style={isLight ? { background: 'rgba(255,255,255,0.7)' } : { background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setLoginOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <GlassCard className={`p-8 ${isLight ? 'bg-white border border-green-200' : ''}`}>
                <motion.button
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isLight ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  onClick={() => setLoginOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>

                <div className="text-center mb-6">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 mb-4"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <img src="/vanmitra.png" alt="VanMitra" className="h-10 w-10 object-contain" />
                  </motion.div>
                  <h3 className={`text-2xl font-bold mb-2 ${isLight ? 'text-green-900' : 'text-white'}`}>Welcome Back</h3>
                  <p className={isLight ? 'text-green-700' : 'text-green-300'}>Sign in to access VanMitra</p>
                </div>

                {error && (
                  <motion.div
                    className={`mb-6 p-4 rounded-xl backdrop-blur-sm ${isLight ?
                      'bg-red-100 border border-red-300 text-red-800' :
                      'bg-red-900/20 border border-red-700/50 text-red-300'
                      }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {/* Google Sign In Button */}
                  <motion.button
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleSigningIn || isSigningIn}
                    className={`w-full py-4 px-6 rounded-2xl font-medium transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${isLight ?
                      'bg-white border border-green-200 text-green-800 hover:bg-green-50 focus:ring-green-400' :
                      'bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:ring-green-400'
                      }`}
                    whileHover={{ scale: isGoogleSigningIn || isSigningIn ? 1 : 1.02 }}
                    whileTap={{ scale: isGoogleSigningIn || isSigningIn ? 1 : 0.98 }}
                  >
                    {isGoogleSigningIn ? (
                      <>
                        <motion.div
                          className={`w-5 h-5 rounded-full ${isLight ? 'border-2 border-green-300 border-t-green-600' : 'border-2 border-white/30 border-t-white'}`}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className={`w-full border-t ${isLight ? 'border-green-200' : 'border-white/20'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className={`px-4 font-medium ${isLight ?
                        'bg-white text-green-700' :
                        'bg-gradient-to-br from-slate-800 to-green-800 text-green-300'
                        }`}>or</span>
                    </div>
                  </div>

                  {/* Email/Password Sign In Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}
                    className="space-y-4"
                  >
                    <motion.input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-4 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:border-green-400 transition-all ${isLight ?
                        'bg-white border border-green-200 text-green-900 placeholder-green-600 focus:ring-green-400' :
                        'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'
                        }`}
                      whileFocus={{ scale: 1.01 }}
                      disabled={isSigningIn || isGoogleSigningIn}
                    />
                    <motion.input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-4 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:border-green-400 transition-all ${isLight ?
                        'bg-white border border-green-200 text-green-900 placeholder-green-600 focus:ring-green-400' :
                        'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'
                        }`}
                      whileFocus={{ scale: 1.01 }}
                      disabled={isSigningIn || isGoogleSigningIn}
                    />
                    <MagneticButton
                      type="submit"
                      className="w-full py-4"
                      disabled={isSigningIn || isGoogleSigningIn}
                      style={isLight ?
                        { background: 'linear-gradient(90deg, #059669, #047857)', color: 'white' } :
                        { background: 'linear-gradient(90deg,var(--primary-600),var(--primary-700))', color: 'var(--card-foreground)' }
                      }
                    >
                      {isSigningIn ? "Signing In..." : "Sign In"}
                    </MagneticButton>
                  </form>
                </div>

                <div className="mt-6 text-center">
                  <p className={isLight ? 'text-green-700 text-sm' : 'text-green-300 text-sm'}>
                    Don't have an account?{" "}
                    <button
                      className={`underline font-medium transition-colors ${isLight ?
                        'text-green-600 hover:text-green-800' :
                        'text-green-400 hover:text-green-300'
                        }`}
                      onClick={() => {
                        setLoginOpen(false);
                        // Could redirect to sign up page here
                      }}
                    >
                      Contact us
                    </button>
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;