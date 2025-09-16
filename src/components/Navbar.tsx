"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";

interface NavbarProps {
  user: { email: string } | null;
  onLogin: () => void;
  onLogout: () => void;
  onMobileMenuToggle: () => void;
  mobileOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  onMobileMenuToggle,
  mobileOpen
}) => {
  const router = useRouter();

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
              onClick={onLogout}
              className="ml-4 px-8 py-4 rounded-full font-semibold transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign out
            </motion.button>
          ) : (
            <motion.button
              onClick={onLogin}
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
              </motion.nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;