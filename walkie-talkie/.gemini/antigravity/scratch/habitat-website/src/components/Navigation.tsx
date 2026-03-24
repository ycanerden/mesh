"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navigation() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setIsScrolled(latest > 20);
    });

    return (
        <motion.header
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={cn(
                "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
                isScrolled ? "bg-black/60 backdrop-blur-md border-b border-white/10" : "bg-transparent"
            )}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-black font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                        H
                    </div>
                    <span className="text-xl font-bold tracking-tight">Habitat</span>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
                    <Link href="#why-habitat" className="hover:text-white transition-colors">
                        Why Habitat?
                    </Link>
                    <Link href="#perks" className="hover:text-white transition-colors">
                        Perks
                    </Link>
                    <Link href="#faq" className="hover:text-white transition-colors">
                        FAQ
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link
                        href="https://www.joinhabitat.eu"
                        target="_blank"
                        className="text-sm font-medium hover:text-white transition-colors hidden sm:block text-neutral-300"
                    >
                        Login
                    </Link>
                    <Link
                        href="https://www.joinhabitat.eu/apply"
                        target="_blank"
                        className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors"
                    >
                        Apply Now
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}
