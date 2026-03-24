'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Dumbbell, LogOut, Activity, PlusSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="border-b border-slate-800 bg-[#0a0a0f] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-orange-500" />
          <span className="font-bold tracking-tight text-white hidden sm:inline-block">GYM BUDDY <span className="text-orange-500">GEMINI</span></span>
        </Link>

        {session ? (
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
              <span>Track</span>
            </Link>
            <Link href="/plan" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <PlusSquare className="w-4 h-4" />
              <span>Plan</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline-block">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="text-sm px-4 py-2 bg-orange-500 hover:bg-orange-600 text-[#0a0a0f] font-bold rounded-lg transition-colors">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
