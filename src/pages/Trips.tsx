import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TripCard } from "@/components/TripCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DESTINATIONS, DestinationType, LuggageSize } from "@/lib/constants";
import { Loader2, Search, Filter, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface Trip {
  id: string;
  destination: DestinationType;
  departure_from: string;
  departure_to: string;
  seats_needed: number;
  luggage: LuggageSize;
  budget: number | null;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    avatar_url: string | null;
    is_iiit_verified: boolean;
    phone: string | null;
  };
}

export default function Trips() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDestination, setFilterDestination] = useState<DestinationType | "all">("all");

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("trips")
        .select(`
          *,
          profiles!trips_user_id_fkey (
            name,
            avatar_url,
            is_iiit_verified,
            phone
          )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (filterDestination !== "all") {
        query = query.eq("destination", filterDestination);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      console.error("Error fetching trips:", error);
      toast({
        title: "Error",
        description: "Failed to load trips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [filterDestination]);

  const handleJoinRequest = async (tripId: string, tripUserId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to join a trip.",
        variant: "destructive",
      });
      return;
    }

    if (user.id === tripUserId) {
      toast({
        title: "That's your trip!",
        description: "You can't join your own trip.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add trip member
      const { error: memberError } = await supabase.from("trip_members").insert({
        trip_id: tripId,
        user_id: user.id,
      });

      if (memberError) throw memberError;

      // Update trip status to matched
      const { error: tripError } = await supabase
        .from("trips")
        .update({ status: "matched" })
        .eq("id", tripId);

      if (tripError) throw tripError;

      toast({
        title: "Request sent!",
        description: "You've requested to join this trip.",
      });

      fetchTrips();
    } catch (error: any) {
      console.error("Error joining trip:", error);
      toast({
        title: "Error",
        description: error.message.includes("duplicate")
          ? "You've already requested to join this trip."
          : "Failed to join trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      "Hi! I found your trip on UniRide and would like to join."
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Find Rides</h1>
          <p className="text-muted-foreground">
            Browse available trips from fellow IIIT students
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={filterDestination}
            onValueChange={(value: DestinationType | "all") =>
              setFilterDestination(value)
            }
          >
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All destinations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All destinations</SelectItem>
              {(Object.keys(DESTINATIONS) as DestinationType[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {DESTINATIONS[key].icon} {DESTINATIONS[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchTrips} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No trips found</h3>
          <p className="text-muted-foreground mb-6">
            {filterDestination !== "all"
              ? "Try changing your filter or check back later."
              : "Be the first to create a trip!"}
          </p>
          <Link to="/create">
            <Button className="gradient-primary">Create a Trip</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onJoinRequest={() => handleJoinRequest(trip.id, trip.user_id)}
              onWhatsApp={
                trip.profiles.phone
                  ? () => handleWhatsApp(trip.profiles.phone!)
                  : undefined
              }
              isOwnTrip={user?.id === trip.user_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
