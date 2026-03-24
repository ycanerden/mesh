-- Run this in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  weight_kg numeric,
  height_cm integer,
  sex text,
  aspirations text,
  training_frequency integer
);

-- Create workout plans table
CREATE TABLE public.workout_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  plan_data jsonb not null, -- Stores the generated weekly plan structure
  status text default 'active'
);

-- Create workout logs table
CREATE TABLE public.workout_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default CURRENT_DATE,
  workout_type text, -- e.g., 'A', 'B', 'C', 'Push', 'Pull'
  exercises jsonb not null, -- Stores the logged sets, weights, and reps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own plans." ON public.workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plans." ON public.workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plans." ON public.workout_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own logs." ON public.workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs." ON public.workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs." ON public.workout_logs FOR UPDATE USING (auth.uid() = user_id);

-- Create a trigger to automatically create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
