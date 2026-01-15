"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
   Mail, Phone, MapPin as MapPinIcon,
  Send, MessageSquare, Clock as ClockIcon
} from "lucide-react";
import dynamic from 'next/dynamic';
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { useTheme } from "@/components/ThemeProvider";

// Dynamically import heavy components to reduce initial bundle size
const Footer = dynamic(() => import('@/components/ui/Footer'), { ssr: false });
const ThreeBackground = dynamic(() => import('@/components/ui/ThreeBackground'), { ssr: false });
const DecorativeElements = dynamic(() => import('@/components/ui/DecorativeElements'), { ssr: false });

export default function Contact() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  const isLight = mounted && theme === 'light';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleLogin = async () => {
    try {
      // Mock authentication
      setUser({ email });
      setLoginOpen(false);
      setError("");
    } catch {
      setError("Invalid credentials");
    }
  };

  const handleLogout = async () => {
    setUser(null);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Contact form submitted:", contactForm);
    // Reset form
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  // Container variants for stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
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
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isLight
        ? 'bg-gradient-to-br from-white via-emerald-50 to-green-50 text-slate-900'
        : 'bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white'
      }`}>
      <ThreeBackground />
      <DecorativeElements />
      {/* Mesh Gradient Overlay */}
      <div className={isLight
        ? "fixed inset-0 bg-gradient-to-br from-white/40 via-transparent to-emerald-100/20 pointer-events-none z-1"
        : "fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1"
      } />

      {/* Animated Grid */}
      <div className={isLight
        ? "fixed inset-0 opacity-10 pointer-events-none z-1"
        : "fixed inset-0 opacity-10 pointer-events-none z-1"
      }>
        <div className="absolute inset-0" style={{
          backgroundImage: isLight
            ? `linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)`
            : `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <Navbar />

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
              className={isLight ? "absolute inset-0 bg-white/60 backdrop-blur-sm" : "absolute inset-0 bg-black/60 backdrop-blur-sm"}
              onClick={() => setLoginOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={`relative rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 backdrop-blur-xl ${isLight ? 'bg-white border border-slate-200' : 'bg-gradient-to-br from-slate-800 to-green-800 border border-white/20'
                }`}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h3 className={`text-2xl font-bold mb-6 text-center ${isLight ? 'text-slate-900' : 'text-white'}`}>Welcome Back</h3>
              {error && (
                <motion.p
                  className="text-red-500 mb-4 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <div className="space-y-4">
                <motion.input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                      ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500'
                      : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'
                    }`}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                      ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500'
                      : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'
                    }`}
                  whileFocus={{ scale: 1.02 }}
                />
                <MagneticButton onClick={handleLogin} className="w-full">
                  Sign In
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`relative z-10 w-full max-w-full 2xl:max-w-full mx-auto px-2 sm:px-4 md:px-8 lg:px-12 py-16 ${isLight ? 'text-slate-900' : 'text-white'}`}>
        <motion.div
          className="text-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${isLight
                ? 'bg-green-100 border border-green-200 text-green-800'
                : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300'
              }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <MessageSquare size={16} className={isLight ? 'text-green-600' : 'text-green-400'} />
            <span className="font-medium">Get In Touch</span>
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            <motion.span
              className={isLight
                ? 'text-green-700'
                : 'bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent'
              }
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Contact Us
            </motion.span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <GlassCard className="p-8 mb-8">
                <h2 className={`text-2xl font-bold mb-6 ${isLight ? 'text-slate-800' : 'text-white'}`}>Let&apos;s Connect</h2>
                <p className={`leading-relaxed mb-8 ${isLight ? 'text-slate-700' : 'text-green-100'}`}>
                  Have questions about VanMitra? Need technical support? Want to explore partnership opportunities?
                  We&apos;re here to help you navigate the world of forest rights and geospatial technology.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Email</h3>
                      <p className={isLight ? 'text-blue-700' : 'text-green-300'}>contact@vanmitra.org</p>
                      <p className={isLight ? 'text-blue-700' : 'text-green-300'}>support@vanmitra.org</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Phone</h3>
                      <p className={isLight ? 'text-green-700' : 'text-green-300'}>+91 98765 43210</p>
                      <p className={isLight ? 'text-green-700' : 'text-green-300'}>Mon-Fri, 9:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500">
                      <MapPinIcon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Location</h3>
                      <p className={isLight ? 'text-purple-700' : 'text-green-300'}>Bhopal, Madhya Pradesh</p>
                      <p className={isLight ? 'text-purple-700' : 'text-green-300'}>India</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                      <ClockIcon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Response Time</h3>
                      <p className={isLight ? 'text-amber-700' : 'text-green-300'}>Within 24 hours</p>
                      <p className={isLight ? 'text-amber-700' : 'text-green-300'}>Priority support for urgent issues</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard className={`p-8 ${isLight
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300/60'
                  : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30'
                }`}>
                <h3 className={`text-xl font-bold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MagneticButton variant={isLight ? "outline" : "secondary"} className="text-sm">
                    Documentation
                  </MagneticButton>
                  <MagneticButton variant={isLight ? "outline" : "secondary"} className="text-sm">
                    API Reference
                  </MagneticButton>
                  <MagneticButton variant={isLight ? "outline" : "secondary"} className="text-sm">
                    Support Center
                  </MagneticButton>
                  <MagneticButton variant={isLight ? "outline" : "secondary"} className="text-sm">
                    Community Forum
                  </MagneticButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <GlassCard className="p-8">
                <h2 className={`text-2xl font-bold mb-6 ${isLight ? 'text-slate-800' : 'text-white'}`}>Send us a Message</h2>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                            ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500'
                            : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'
                          }`}
                        required
                      />
                    </motion.div>

                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                            ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500'
                            : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'
                          }`}
                        required
                      />
                    </motion.div>
                  </div>

                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                          ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500'
                          : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'
                        }`}
                      required
                    />
                  </motion.div>

                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <textarea
                      placeholder="Your Message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={6}
                      className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 resize-none ${isLight
                          ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500'
                          : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'
                        }`}
                      required
                    />
                  </motion.div>

                  <MagneticButton type="submit" className="w-full">
                    <div className="flex items-center justify-center">
                      <Send size={18} className="mr-2" />
                      Send Message
                    </div>
                  </MagneticButton>

                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-3xl font-bold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                question: "How do I get started with VanMitra?",
                answer: "Simply create an account and explore our interactive atlas. Our documentation provides step-by-step guides for all features."
              },
              {
                question: "Is VanMitra available for mobile devices?",
                answer: "Yes! VanMitra is fully responsive and works seamlessly on all devices including smartphones and tablets."
              },
              {
                question: "Do you offer training sessions?",
                answer: "We provide comprehensive training programs, webinars, and personalized onboarding sessions for organizations."
              },
              {
                question: "Can I integrate VanMitra with other systems?",
                answer: "Yes, we offer robust APIs and integration options. Contact our technical team to discuss your specific requirements."
              }
            ].map((faq, i) => (
              <motion.div key={i} variants={itemVariants}>
                <GlassCard className="p-6">
                  <h3 className={`text-lg font-semibold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>{faq.question}</h3>
                  <p className={`leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>{faq.answer}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 transform-gpu z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />
    </div>
  );
}