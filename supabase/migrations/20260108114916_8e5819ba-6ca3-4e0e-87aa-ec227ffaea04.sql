-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    is_iiit_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create enum for destinations
CREATE TYPE public.destination_type AS ENUM ('kochi_airport', 'kottayam_railway', 'bus_stand');

-- Create enum for luggage size
CREATE TYPE public.luggage_size AS ENUM ('light', 'medium', 'heavy');

-- Create enum for trip status
CREATE TYPE public.trip_status AS ENUM ('open', 'matched', 'completed', 'cancelled');

-- Create trips table
CREATE TABLE public.trips (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    destination destination_type NOT NULL,
    departure_from TIMESTAMP WITH TIME ZONE NOT NULL,
    departure_to TIMESTAMP WITH TIME ZONE NOT NULL,
    seats_needed INTEGER NOT NULL CHECK (seats_needed > 0 AND seats_needed <= 6),
    luggage luggage_size NOT NULL DEFAULT 'light',
    budget DECIMAL(10, 2),
    status trip_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Trips policies
CREATE POLICY "Trips are viewable by everyone"
ON public.trips FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create trips"
ON public.trips FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
ON public.trips FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
ON public.trips FOR DELETE
USING (auth.uid() = user_id);

-- Create trip_members table for join requests
CREATE TABLE public.trip_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(trip_id, user_id)
);

-- Enable RLS on trip_members
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

-- Trip members policies
CREATE POLICY "Trip members are viewable by everyone"
ON public.trip_members FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can request to join"
ON public.trip_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trip owners can manage members"
ON public.trip_members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.trips t
        WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
);

-- Create ratings table
CREATE TABLE public.ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(trip_id, from_user_id, to_user_id)
);

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone"
ON public.ratings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create ratings"
ON public.ratings FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();