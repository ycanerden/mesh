import Link from "next/link";
import { ArrowRight, Activity, Dumbbell, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 font-mono selection:bg-orange-500/30">
      <main className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[80vh] text-center">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Open Source AI Fitness Tracker</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">
          GYM BUDDY <span className="text-orange-500">GEMINI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12">
          Your intelligent, personalized workout tracker. Generate custom plans, log workouts effortlessly, and just paste your raw gym notes for AI to parse.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-[#0a0a0f] font-bold rounded-lg transition-all"
          >
            Start Tracking
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-medium rounded-lg transition-all"
          >
            I already have an account
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Generation</h3>
            <p className="text-slate-400 text-sm">Get a weekly training plan based on your exact body stats and fitness aspirations.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Logging</h3>
            <p className="text-slate-400 text-sm">Copy and paste your raw iPhone notes. Our AI parses the exercises, sets, and reps automatically.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
              <Dumbbell className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Iron Progress</h3>
            <p className="text-slate-400 text-sm">Open source design. Clean, terminal-inspired aesthetics with zero distractions.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
