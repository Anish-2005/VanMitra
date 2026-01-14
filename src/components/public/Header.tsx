"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "../ui/Logo";

type Props = { isLight: boolean };

export default function Header({ isLight }: Props) {
    return (
        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <motion.div className={`relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden `}>
                    <Logo size={48} />
                </motion.div>
                <Link href="/" className="inline-block">
                    <div className="cursor-pointer">
                        <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-green-800' : 'text-green-200'}`}>VanMitra</h1>
                        <p className={`text-sm ${isLight ? 'text-green-700' : 'text-green-300'}`}>Public map (no PII)</p>
                    </div>
                </Link>
            </motion.div>

            <motion.nav className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-0" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <Link href="/" className={`text-sm font-medium px-4 py-2 rounded-xl backdrop-blur-sm border transition-colors ${isLight ? 'text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-800' : 'text-green-300 border-white/20 bg-white/10 hover:bg-white/20 hover:text-green-400'}`}>
                    Home
                </Link>
                <ThemeToggle />
            </motion.nav>
        </header>
    );
}
