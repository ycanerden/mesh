"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
    {
        question: "What is Habitat?",
        answer: "Habitat is a residency program and launchpad in Leuven designed for ambitious builders. You join for one evening, build a prototype, and launch it to real users.",
    },
    {
        question: "Do I need an idea before joining?",
        answer: "Not necessarily! Many founders join to find problems worth solving or to team up with others who already have an idea. The focus is on execution.",
    },
    {
        question: "What happens during the evening?",
        answer: "We start with a brief kickoff, form teams (if needed), and then sprint toward a working prototype. Mentors circulate to unblock you, and we end with a demo session showing what was shipped.",
    },
    {
        question: "What should I bring?",
        answer: "Just your laptop, charger, and a bias for action. We provide everything else including API credits, mentorship, food, and drinks.",
    },
    {
        question: "Can I join with a co-founder?",
        answer: "Absolutely. You can apply as an existing team or as a solo founder looking for co-founders.",
    },
    {
        question: "What if I can't code?",
        answer: "No problem. With modern low-code/no-code tools and AI (like the Lovable credits we provide), you can build incredible prototypes without writing a single line of code.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-24 md:py-32 bg-white/[0.01] border-t border-white/5">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                        FAQ
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="glass rounded-2xl overflow-hidden transition-colors hover:bg-white/[0.04]"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
                            >
                                <span className="font-medium text-lg pr-8">{faq.question}</span>
                                <span className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-45 text-blue-400' : 'text-neutral-500'}`}>
                                    <Plus className="w-5 h-5" />
                                </span>
                            </button>

                            <AnimatePresence initial={false}>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 pt-0 text-neutral-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
