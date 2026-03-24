"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";

const testimonials = [
    {
        quote: "Was building alone in Leuven. Week 5 I had a team and users.",
        author: "Leon Dehullu",
        role: "Founder of Stealth startup",
    },
    {
        quote: "Came for the vibe. Stayed because I actually launched and found people who ship.",
        author: "Vincent Demarez",
        role: "Founder of Friday",
    },
];

export function Testimonials() {
    return (
        <section className="py-24 border-y border-white/5 bg-white/[0.02] relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                        What people say
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((test, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.2 }}
                            className="glass p-8 md:p-10 rounded-3xl relative"
                        >
                            <MessageSquareQuote className="w-10 h-10 text-white/20 absolute top-8 right-8" />
                            <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 pr-8">
                                "{test.quote}"
                            </p>
                            <div>
                                <p className="font-semibold text-white">{test.author}</p>
                                <p className="text-sm text-neutral-400">{test.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 flex flex-wrap justify-center gap-12 text-center border-t border-white/10 pt-16">
                    <div className="space-y-2">
                        <p className="text-4xl md:text-5xl font-bold font-mono">200+</p>
                        <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest">Participants</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-4xl md:text-5xl font-bold font-mono">100%</p>
                        <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest">Recommends</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-4xl md:text-5xl font-bold font-mono">50+</p>
                        <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest">MVP Launched</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
