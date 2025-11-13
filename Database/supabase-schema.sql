-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create motorcycle_shops table
CREATE TABLE IF NOT EXISTS public.motorcycle_shops (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER CHECK (reviews_count >= 0),
    phone TEXT,
    website TEXT,
    business_type TEXT,
    hours TEXT,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    place_id TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_motorcycle_shops_country ON public.motorcycle_shops(country);
CREATE INDEX IF NOT EXISTS idx_motorcycle_shops_city ON public.motorcycle_shops(city);
CREATE INDEX IF NOT EXISTS idx_motorcycle_shops_created_by ON public.motorcycle_shops(created_by);
CREATE INDEX IF NOT EXISTS idx_motorcycle_shops_location ON public.motorcycle_shops(latitude, longitude);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorcycle_shops ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Policies for motorcycle_shops table
-- Public can view all shops
CREATE POLICY "Anyone can view shops"
    ON public.motorcycle_shops FOR SELECT
    TO public
    USING (true);

-- Authenticated users can insert shops
CREATE POLICY "Authenticated users can insert shops"
    ON public.motorcycle_shops FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Users can update their own shops, and admins can update any.
DROP POLICY IF EXISTS "Users can update their own shops" ON public.motorcycle_shops;
DROP POLICY IF EXISTS "Admins can update any shop" ON public.motorcycle_shops;
CREATE POLICY "Users and admins can update shops"
    ON public.motorcycle_shops FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = created_by) OR 
        (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true))
    );

-- Only admins can delete shops
CREATE POLICY "Only admins can delete shops"
    ON public.motorcycle_shops FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motorcycle_shops_updated_at
    BEFORE UPDATE ON public.motorcycle_shops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create default admin user (optional - run after creating auth user)
-- UPDATE public.users SET is_admin = true WHERE email = 'admin@example.com';