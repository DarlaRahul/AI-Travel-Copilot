-- ==============================================================================
-- AI Travel Copilot - Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT DEFAULT 'Traveler',
    avatar_url TEXT,
    travel_style TEXT DEFAULT 'Balanced',
    preferred_currency TEXT DEFAULT 'INR',
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT NOT NULL DEFAULT 3,
    travelers_count INT NOT NULL DEFAULT 1,
    budget_inr NUMERIC(12, 2) NOT NULL DEFAULT 50000,
    travel_style TEXT NOT NULL DEFAULT 'Balanced',
    interests JSONB DEFAULT '[]'::jsonb,
    is_luxury BOOLEAN DEFAULT FALSE,
    hotel_info JSONB,
    flight_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips" 
    ON public.trips FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" 
    ON public.trips FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" 
    ON public.trips FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" 
    ON public.trips FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. Itineraries & Trip Days Table
CREATE TABLE IF NOT EXISTS public.trip_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    title TEXT NOT NULL,
    theme TEXT,
    activities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own trip days" 
    ON public.trip_days FOR ALL 
    USING (auth.uid() = user_id);

-- 4. Saved Destinations Table
CREATE TABLE IF NOT EXISTS public.saved_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destination_name TEXT NOT NULL,
    country TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage saved destinations" 
    ON public.saved_destinations FOR ALL 
    USING (auth.uid() = user_id);

-- 5. Saved Flights Table
CREATE TABLE IF NOT EXISTS public.saved_flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    airline TEXT NOT NULL,
    flight_number TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_date DATE NOT NULL,
    price_inr NUMERIC(10, 2) NOT NULL,
    flight_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage saved flights" 
    ON public.saved_flights FOR ALL 
    USING (auth.uid() = user_id);

-- 6. Saved Hotels Table
CREATE TABLE IF NOT EXISTS public.saved_hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hotel_name TEXT NOT NULL,
    city TEXT NOT NULL,
    room_type TEXT,
    nightly_price_inr NUMERIC(10, 2),
    hotel_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage saved hotels" 
    ON public.saved_hotels FOR ALL 
    USING (auth.uid() = user_id);

-- 7. Budgets & Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- Flights, Hotels, Food, Activities, Transport, Misc
    amount_inr NUMERIC(10, 2) NOT NULL,
    description TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own expenses" 
    ON public.expenses FOR ALL 
    USING (auth.uid() = user_id);

-- 8. Auto-create Profile on Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, travel_style, preferred_currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Traveler'),
        COALESCE(NEW.raw_user_meta_data->>'travel_style', 'Balanced'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_currency', 'INR')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
