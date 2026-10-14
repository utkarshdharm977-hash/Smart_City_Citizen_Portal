-- SUPABASE SQL SETUP FOR MUNICIPAL APP + WEBSITE
-- Idempotent script: Safe to run multiple times without errors

-- 1. Create Drivers Table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    truck_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Garbage Trucks Table
CREATE TABLE IF NOT EXISTS public.garbage_trucks (
    id SERIAL PRIMARY KEY,
    vehicle_number TEXT NOT NULL UNIQUE,
    latitude FLOAT,
    longitude FLOAT,
    is_active BOOLEAN DEFAULT false,
    zone TEXT
);

-- 3. Modify Garbage Trucks Table
ALTER TABLE public.garbage_trucks 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.drivers(id),
ADD COLUMN IF NOT EXISTS last_ping_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Create Zones Table
CREATE TABLE IF NOT EXISTS public.zones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'red',
    last_visited TIMESTAMP WITH TIME ZONE,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    radius_meters INTEGER DEFAULT 500
);

-- 5. Create or Alter Complaints Table (Pothole & Civic Reports)
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    citizen_name TEXT DEFAULT 'Local Citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all required columns exist in pre-existing complaints table
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS latitude FLOAT DEFAULT 21.2965,
ADD COLUMN IF NOT EXISTS longitude FLOAT DEFAULT 79.0715,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS after_image_url TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sla_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
ADD COLUMN IF NOT EXISTS is_sensor_detected BOOLEAN DEFAULT false;

-- Sample Zones Data
INSERT INTO public.zones (name, latitude, longitude, radius_meters) VALUES
('Ward 1 - Shivaji Nagar', 21.2965, 79.0715, 300),
('Ward 2 - Gandhi Chowk', 21.2940, 79.0730, 250),
('Ward 3 - Station Road', 21.2920, 79.0700, 300),
('Ward 4 - Market Area', 21.2970, 79.0750, 200),
('Ward 5 - Dattawadi', 21.3000, 79.0720, 350)
ON CONFLICT DO NOTHING;

-- Safe Realtime Publication Helper (Ignores if already added)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'drivers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'zones') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.zones;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'garbage_trucks') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.garbage_trucks;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'complaints') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
    END IF;
END $$;

-- Disable Row Level Security (RLS) for smooth prototyping inserts
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.garbage_trucks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones DISABLE ROW LEVEL SECURITY;
