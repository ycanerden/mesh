"use client";

import { motion } from "framer-motion";
import { Zap, Rocket, Users, Target } from "lucide-react";

const valueProps = [
    {
        title: "A Residency for Builders",
        description: "5 hours, start to finish. Live with us, build with peers, and raise from the best.",
        icon: Users,
        gradient: "from-blue-500/20 to-blue-500/0",
    },
    {
        title: "Ship tonight",
        description: "Build something real. We believe in learning by doing, not months theorizing alone.",
        icon: Rocket,
        gradient: "from-purple-500/20 to-purple-500/0",
    },
    {
        title: "Real feedback",
        description: "From peers who build. Spend one evening validating with real customers.",
        icon: Target,
        gradient: "from-emerald-500/20 to-emerald-500/0",
    },
    {
        title: "Momentum",
        description: "For the next 30 days. You're more likely to build something worth building when surrounded by 50 others.",
        icon: Zap,
        gradient: "from-orange-500/20 to-orange-500/0",
    },
];

export function ValueProps() {
    return (
        <section id="why-habitat" className="py-24 md:py-32 relative">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center md:text-left mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            Why join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Habitat?</span>
                        </h2>
                        <p className="text-lg text-neutral-400 text-balance">
                            Testing beats planning. Most ideas die in spreadsheets. We provide the low-stakes environment to get real feedback and momentum.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {valueProps.map((prop, idx) => (
                        <motion.div
                            key={prop.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="group relative rounded-3xl overflow-hidden glass p-8 md:p-10 glass-hover"
                        >
                            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${prop.gradient} blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-transform duration-300">
                                    <prop.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-2xl font-bold mb-4">{prop.title}</h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    {prop.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
