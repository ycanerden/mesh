"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Background glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 mb-8 glass"
                >
                    <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                    200+ People signed up this month
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-balance mb-6"
                >
                    The fastest way to <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        launch your startup
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10 text-balance"
                >
                    A residency in Leuven for those who want to start massive companies.
                    You arrive with an idea. You leave with a prototype, a landing page, and
                    real customers to talk to tomorrow.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                >
                    <Link
                        href="https://www.joinhabitat.eu/apply"
                        target="_blank"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        Apply for Residency
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="#why-habitat"
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-medium rounded-full hover:bg-white/10 border border-white/10 transition-all duration-300 flex items-center justify-center glass-hover"
                    >
                        Learn more
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="mt-24 w-full"
                >
                    <p className="text-sm font-medium text-neutral-500 mb-8 uppercase tracking-widest">Built by founders at</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder for trusted logos, mimicking The Bridge style */}
                        <div className="h-8 font-bold text-xl tracking-tight text-white flex items-center">Sequoia</div>
                        <div className="h-8 font-bold text-xl tracking-tight text-white flex items-center">YCombinator</div>
                        <div className="h-8 font-bold text-xl tracking-tight text-white flex items-center">a16z</div>
                        <div className="h-8 font-bold text-xl tracking-tight text-white flex items-center">Founders Fund</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
