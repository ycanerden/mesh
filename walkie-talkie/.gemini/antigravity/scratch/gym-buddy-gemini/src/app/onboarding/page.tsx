'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [sex, setSex] = useState('male');
  const [aspirations, setAspirations] = useState('Build Muscle & Gain Strength');
  const [frequency, setFrequency] = useState('3');
  
  const router = useRouter();

  // Get current user on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        router.push('/login');
      }
    });
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    const updates = {
      id: userId,
      weight_kg: parseFloat(weight),
      height_cm: parseInt(height, 10),
      sex,
      aspirations,
      training_frequency: parseInt(frequency, 10),
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    setLoading(false);
    if (!error) {
      router.push('/dashboard'); // Proceed to main dashboard
    } else {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Check console for details.');
    }
  };

  if (!userId) return null; // Or a loading spinner

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-xl bg-[#111118] border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 relative z-10">
          Tailor Your Journey
        </h1>
        <p className="text-slate-400 mb-8 relative z-10">
          The more we know, the better your AI-generated weekly plan will be. Let's set your baseline.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="75.5"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Height (cm)</label>
              <input
                type="number"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="180"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Biological Sex</label>
            <div className="grid grid-cols-2 gap-4">
              {['male', 'female'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSex(s)}
                  className={`py-3 rounded-xl border capitalize ${
                    sex === s 
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold' 
                      : 'bg-[#0a0a0f] border-slate-800 text-slate-400 hover:border-slate-700'
                  } transition-colors`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Primary Goal</label>
            <select
              value={aspirations}
              onChange={(e) => setAspirations(e.target.value)}
              className="w-full appearance-none bg-[#0a0a0f] border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="Build Muscle & Gain Strength">Build Muscle & Gain Strength</option>
              <option value="Lose Weight & Tone Up">Lose Fat & Tone Up</option>
              <option value="General Health & Conditioning">General Health & Conditioning</option>
              <option value="Powerlifting / Max Strength">Powerlifting / Max Strength</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Training Frequency (Days/Week)</label>
            <div className="flex gap-2 justify-between">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setFrequency(num.toString())}
                  className={`w-14 h-14 rounded-xl border ${
                    frequency === num.toString()
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold' 
                      : 'bg-[#0a0a0f] border-slate-800 text-slate-400 hover:border-slate-700'
                  } transition-colors flex items-center justify-center text-lg`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-[#0a0a0f] font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-8 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving Profile...' : 'Generate My Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}
