'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Dumbbell, PlusSquare } from 'lucide-react';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (prof && (!prof.weight_kg || !prof.height_cm)) {
        router.push('/onboarding');
        return;
      }
        
      setProfile(prof);

      const { data: plans } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (plans && plans.length > 0) {
        setActivePlan(plans[0]);
      }
    };
    
    fetchData();
  }, [router]);

  const generatePlan = async () => {
    if (!profile) return;
    setGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }) 
        },
        body: JSON.stringify({
          userId: profile.id,
          weight: profile.weight_kg,
          height: profile.height_cm,
          sex: profile.sex,
          aspirations: profile.aspirations,
          frequency: profile.training_frequency
        })
      });
      
      if (res.ok) {
        // Refresh the page data
        window.location.reload();
      } else {
        const error = await res.json();
        alert('Failed to generate plan: ' + (error.error || error.message || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while generating the plan.');
    } finally {
      setGenerating(false);
    }
  };

  if (!profile) {
    return <div className="min-h-[50vh] flex items-center justify-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
          Welcome back, {profile.full_name?.split(' ')[0] || 'Athlete'}
        </h1>
        <div className="flex gap-4 text-sm text-slate-400">
          <span>{profile.weight_kg}kg</span>
          <span>•</span>
          <span>{profile.height_cm}cm</span>
          <span>•</span>
          <span>{profile.aspirations}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Current Plan & Generation) */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-[#111118] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-orange-500" />
                Your Active Plan
              </h2>
            </div>

            {activePlan ? (
              <div className="space-y-6">
                 {/* Display Plan Data */}
                 {Object.entries(activePlan.plan_data).map(([key, workout]: [string, any]) => (
                    <div key={key} className="bg-[#0a0a0f] border border-slate-800 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-orange-500 mb-3 capitalize">
                        {key.replace('workout', 'Workout ')}
                      </h3>
                      <div className="space-y-2">
                        {workout.map((ex: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm items-center py-1 border-b border-slate-800/50 last:border-0 text-slate-300">
                            <span>{ex.name}</span>
                            <span className="text-slate-500 text-xs font-mono">{ex.sets} × {ex.targetReps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={generatePlan}
                    disabled={generating}
                    className="w-full text-center text-xs py-3 border border-orange-500/20 text-orange-500 rounded-xl hover:bg-orange-500/10 transition-colors"
                  >
                    {generating ? 'Regenerating...' : 'Regenerate Plan with Gemini'}
                  </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusSquare className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-white font-bold mb-2">No Active Plan</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                  You don't have a structured workout plan yet. Let our AI build one customized for your goals and stats.
                </p>
                <button
                  onClick={generatePlan}
                  disabled={generating}
                  className="bg-orange-500 hover:bg-orange-600 text-[#0a0a0f] font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {generating ? 'Using Gemini to build...' : 'Generate AI Plan'}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Quick Actions) */}
        <div className="space-y-6">
          <section className="bg-[#111118] border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/log')}
                className="w-full bg-[#0a0a0f] hover:bg-slate-800/50 border border-slate-800 text-left px-4 py-4 rounded-xl transition-colors group flex items-center justify-between"
              >
                <div>
                  <span className="block text-white font-medium mb-1">Log Workout</span>
                  <span className="block text-xs text-slate-500">Manual input or paste Apple Notes</span>
                </div>
                <PlusSquare className="w-5 h-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
