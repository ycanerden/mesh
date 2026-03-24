"use client";

import { motion } from "framer-motion";
import { Sparkles, Trophy, Coffee } from "lucide-react";

export function Perks() {
    const perks = [
        {
            title: "1:1 Support",
            description: "Mentorship for everything you're building",
            icon: Trophy,
        },
        {
            title: "Free lovable credits",
            description: "Get 1 month free lovable pro, our treat",
            icon: Sparkles,
        },
        {
            title: "Free fuel",
            description: "Ramen, coffee, and pizza included",
            icon: Coffee,
        },
    ];

    return (
        <section id="perks" className="py-24 md:py-32">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16 md:mb-24">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                        Plus, the perks
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {perks.map((perk, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="glass p-8 rounded-3xl flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/80 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                <perk.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{perk.title}</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed max-w-[200px]">
                                {perk.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
