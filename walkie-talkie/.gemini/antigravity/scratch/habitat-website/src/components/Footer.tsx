import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black py-12 md:py-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-black font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                H
                            </div>
                            <span className="text-xl font-bold tracking-tight">Habitat</span>
                        </Link>
                        <p className="text-neutral-400 text-sm max-w-sm balance">
                            A Residency for Builders. Build with peers, launch faster, and join a community that compounds.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Community</h4>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Events</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Participants</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Projects</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Partnerships</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
                    <p>© {new Date().getFullYear()} Habitat. All rights reserved.</p>
                    <p>made with 💙 in Leuven</p>
                </div>
            </div>
        </footer>
    );
}
