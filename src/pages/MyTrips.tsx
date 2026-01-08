import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TripCard } from "@/components/TripCard";
import { RatingDialog } from "@/components/RatingDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DestinationType, LuggageSize } from "@/lib/constants";
import { Loader2, Car, LogIn, CheckCircle, XCircle } from "lucide-react";
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

export default function MyTrips() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [joinedTrips, setJoinedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [tripToRate, setTripToRate] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch my created trips
      const { data: created, error: createdError } = await supabase
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (createdError) throw createdError;
      setMyTrips(created || []);

      // Fetch trips I've joined
      const { data: memberships, error: memberError } = await supabase
        .from("trip_members")
        .select("trip_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      if (memberships && memberships.length > 0) {
        const tripIds = memberships.map((m) => m.trip_id);
        const { data: joined, error: joinedError } = await supabase
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
          .in("id", tripIds)
          .order("created_at", { ascending: false });

        if (joinedError) throw joinedError;
        setJoinedTrips(joined || []);
      }
    } catch (error: any) {
      console.error("Error fetching trips:", error);
      toast({
        title: "Error",
        description: "Failed to load your trips.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const handleCompleteTrip = async (trip: Trip) => {
    try {
      const { error } = await supabase
        .from("trips")
        .update({ status: "completed" })
        .eq("id", trip.id);

      if (error) throw error;

      setTripToRate(trip);
      setRatingDialogOpen(true);
      fetchTrips();
    } catch (error: any) {
      console.error("Error completing trip:", error);
      toast({
        title: "Error",
        description: "Failed to complete trip.",
        variant: "destructive",
      });
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from("trips")
        .update({ status: "cancelled" })
        .eq("id", tripId);

      if (error) throw error;

      toast({
        title: "Trip cancelled",
        description: "Your trip has been cancelled.",
      });

      fetchTrips();
    } catch (error: any) {
      console.error("Error cancelling trip:", error);
      toast({
        title: "Error",
        description: "Failed to cancel trip.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitRating = async (rating: number) => {
    if (!tripToRate || !user) return;

    try {
      const { error } = await supabase.from("ratings").insert({
        trip_id: tripToRate.id,
        from_user_id: user.id,
        to_user_id: tripToRate.user_id,
        rating,
      });

      if (error) throw error;

      toast({
        title: "Thanks for rating!",
        description: "Your feedback helps build trust in our community.",
      });
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto shadow-elevated">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full gradient-primary mb-4">
              <LogIn className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sign in to View</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to see your trips and joined rides.
            </p>
            <Button
              onClick={signInWithGoogle}
              disabled={authLoading}
              className="gradient-primary"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Trips</h1>

      <Tabs defaultValue="created" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="created">Created ({myTrips.length})</TabsTrigger>
          <TabsTrigger value="joined">Joined ({joinedTrips.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="created">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : myTrips.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No trips created yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by creating your first trip request.
                </p>
                <Link to="/create">
                  <Button className="gradient-primary">Create Trip</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTrips.map((trip) => (
                <div key={trip.id}>
                  <TripCard trip={trip} showActions={false} isOwnTrip />
                  {trip.status === "open" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleCancelTrip(trip.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                  {trip.status === "matched" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 gradient-primary"
                        onClick={() => handleCompleteTrip(trip)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : joinedTrips.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No joined trips yet</h3>
                <p className="text-muted-foreground mb-6">
                  Browse available rides and join one!
                </p>
                <Link to="/trips">
                  <Button className="gradient-primary">Find Rides</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  showActions={false}
                  onWhatsApp={
                    trip.profiles.phone
                      ? () => {
                          const cleanPhone = trip.profiles.phone!.replace(/\D/g, "");
                          window.open(
                            `https://wa.me/${cleanPhone}`,
                            "_blank"
                          );
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {tripToRate && (
        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          userName={tripToRate.profiles.name}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  );
}
