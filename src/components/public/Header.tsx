"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "../ui/Logo";

type Props = { isLight: boolean };


export default function Header({ isLight }: Props) {
    return (
        <header className="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-2 sm:px-4 md:px-8 lg:px-12 pt-4 sm:pt-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center overflow-hidden"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Logo size={48} />
                    </motion.div>

                    <Link href="/" className="inline-block">
                        <div className="cursor-pointer">
                            <h1 className={`text-sm font-semibold sm:hidden ${isLight ? 'text-green-800' : 'text-green-200'}`}>Public Map</h1>

                            <div className="hidden sm:block">
                                <h1 className={`text-lg sm:text-2xl font-bold tracking-tight ${isLight ? 'text-green-800' : 'text-green-200'}`}>VanMitra</h1>
                                <p className={`text-xs sm:text-sm ${isLight ? 'text-green-700' : 'text-green-300'}`}>Public map (no PII)</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/" className={`text-sm font-medium px-3 py-1 rounded-lg ${isLight ? 'text-green-700 bg-green-50 border border-green-200' : 'text-white bg-white/5 border border-white/8'}`}>
                        Home
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}