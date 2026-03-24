import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Validate the incoming request body
const reqSchema = z.object({
  userId: z.string(),
  weight: z.number(),
  height: z.number(),
  sex: z.string(),
  aspirations: z.string(),
  frequency: z.number(),
});

// The structure we want Gemini to return
const planSchema = z.object({
  workoutA: z.array(z.object({
    name: z.string(),
    sets: z.number(),
    targetReps: z.number()
  })).describe("Compound focused workout"),
  workoutB: z.array(z.object({
    name: z.string(),
    sets: z.number(),
    targetReps: z.number()
  })).describe("Hypertrophy / Accessory focused workout"),
  workoutC: z.array(z.object({
    name: z.string(),
    sets: z.number(),
    targetReps: z.number()
  })).describe("Hybrid or Weak-point focused workout")
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json();
    const data = reqSchema.parse(body);

    const prompt = `
      You are a world-class personal trainer and strength coach. 
      Create a 3-day (A/B/C) full body workout split for a client with the following profile:
      - Weight: ${data.weight}kg
      - Height: ${data.height}cm
      - Sex: ${data.sex}
      - Primary Goal: ${data.aspirations}
      - Training Frequency: They want to train ${data.frequency} days a week.

      Design Workout A (Compound/Heavy), Workout B (Hypertrophy/Volume), and Workout C (Hybrid/Accessories).
      Keep it to 5-6 exercises per workout.
      Keep the exercise names simple and standard (e.g., 'Barbell Squat', 'Lat Pulldown').
    `;

    // Call Gemini API
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: planSchema,
      prompt: prompt,
    });

    // Create a Supabase client with the user's auth context
    const sbClient = authHeader 
      ? supabase.auth.admin ? supabase : require('@supabase/supabase-js').createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: authHeader } } }
        )
      : supabase;

    // Save the generated plan to Supabase
    const { error } = await sbClient.from('workout_plans').insert({
      user_id: data.userId,
      plan_data: object,
      status: 'active'
    });

    if (error) throw error;

    return Response.json({ success: true, plan: object });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
