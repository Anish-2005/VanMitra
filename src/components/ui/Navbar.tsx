"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { signOut, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import MagneticButton from "./MagneticButton";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
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

  // Navigation function for routing to specific pages
  const navigateToPage = (pageName: string) => {
    const routes: { [key: string]: string } = {
      "Atlas": "/atlas",
      "OCR": "/ocr",
      "DSS": "/dss",
      "Public Data": "/public",
      "Technology": "/technology",
      "Roadmap": "/roadmap",
      "Dashboard": "/dashboard"
    };

    const route = routes[pageName];
    if (route) {
      router.push(route);
    }
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
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Leaf className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
              VanMitra
            </h1>
            <p className="text-xs text-green-300">Forest Rights & Asset Mapping Platform</p>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {["Atlas", "OCR", "DSS", "Public Data", "Technology", "Roadmap", "Dashboard"].map((item, i) => (
            <motion.button
              key={item}
              onClick={() => navigateToPage(item)}
              className="px-4 py-2 rounded-full text-sm font-medium text-green-100 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item}
            </motion.button>
          ))}
          {user ? (
            <motion.button
              onClick={handleSignOut}
              className="ml-4 px-8 py-4 rounded-full font-semibold transition-all duration-300 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-lg hover:shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign out
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSignIn}
              className="ml-4 px-8 py-4 rounded-full font-semibold transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign in
            </motion.button>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <motion.button
          className="md:hidden p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
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
                <X className="text-green-200" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="text-green-200" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onMobileMenuToggle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="absolute top-0 right-0 w-80 h-full bg-gradient-to-b from-slate-800 to-green-900 backdrop-blur-xl border-l border-white/20 p-6 shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <motion.nav
                className="flex flex-col gap-4 mt-16"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {["Atlas", "OCR", "DSS", "Public Data", "Technology", "Roadmap", "Dashboard"].map((item) => (
                  <motion.button
                    key={item}
                    onClick={() => {
                      navigateToPage(item);
                      onMobileMenuToggle();
                    }}
                    className="text-lg font-medium text-green-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                    variants={{
                      hidden: { y: 50, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                          type: "spring",
                          stiffness: 100,
                          damping: 12
                        }
                      }
                    }}
                    whileHover={{ x: 10 }}
                  >
                    {item}
                  </motion.button>
                ))}

                {/* Mobile Auth Buttons */}
                <motion.div
                  className="mt-8 pt-6 border-t border-white/20"
                  variants={{
                    hidden: { y: 50, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 12,
                        delay: 0.7
                      }
                    }
                  }}
                >
                  {user ? (
                    <motion.button
                      onClick={() => {
                        handleSignOut();
                        onMobileMenuToggle();
                      }}
                      className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-lg hover:shadow-2xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign out
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => {
                        handleSignIn();
                        onMobileMenuToggle();
                      }}
                      className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-2xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign in
                    </motion.button>
                  )}
                </motion.div>
              </motion.nav>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setLoginOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative bg-gradient-to-br from-slate-800 to-green-800 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 border border-white/20 backdrop-blur-xl"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setLoginOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="text-white" size={20} />
              </motion.button>

              <h3 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h3>
              {error && (
                <motion.p
                  className="text-red-400 mb-4 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <div className="space-y-4">
                {/* Google Sign In Button */}
                <motion.button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSigningIn || isSigningIn}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-medium transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isGoogleSigningIn || isSigningIn ? 1 : 1.02 }}
                  whileTap={{ scale: isGoogleSigningIn || isSigningIn ? 1 : 0.98 }}
                >
                  {isGoogleSigningIn ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
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
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gradient-to-br from-slate-800 to-green-800 text-green-300">or</span>
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-green-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    whileFocus={{ scale: 1.02 }}
                    disabled={isSigningIn || isGoogleSigningIn}
                  />
                  <motion.input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-green-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    whileFocus={{ scale: 1.02 }}
                    disabled={isSigningIn || isGoogleSigningIn}
                  />
                  <MagneticButton
                    type="submit"
                    className="w-full"
                    disabled={isSigningIn || isGoogleSigningIn}
                  >
                    {isSigningIn ? "Signing In..." : "Sign In"}
                  </MagneticButton>
                </form>
              </div>

              <div className="mt-6 text-center">
                <p className="text-green-300 text-sm">
                  Don't have an account?{" "}
                  <button
                    className="text-green-400 hover:text-green-300 underline"
                    onClick={() => {
                      setLoginOpen(false);
                      // Could redirect to sign up page here
                    }}
                  >
                    Contact us
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;