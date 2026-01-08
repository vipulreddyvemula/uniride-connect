import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "./VerifiedBadge";
import { DESTINATIONS, LUGGAGE_SIZES, DestinationType, LuggageSize } from "@/lib/constants";
import { Clock, Users, Luggage, IndianRupee, MessageCircle, UserPlus } from "lucide-react";

interface TripCardProps {
  trip: {
    id: string;
    destination: DestinationType;
    departure_from: string;
    departure_to: string;
    seats_needed: number;
    luggage: LuggageSize;
    budget: number | null;
    status: string;
    created_at: string;
    profiles: {
      name: string;
      avatar_url: string | null;
      is_iiit_verified: boolean;
      phone: string | null;
    };
  };
  onJoinRequest?: () => void;
  onWhatsApp?: () => void;
  showActions?: boolean;
  isOwnTrip?: boolean;
}

export function TripCard({
  trip,
  onJoinRequest,
  onWhatsApp,
  showActions = true,
  isOwnTrip = false,
}: TripCardProps) {
  const destination = DESTINATIONS[trip.destination];
  const luggage = LUGGAGE_SIZES[trip.luggage];
  
  const estimatedCost = Math.round(
    (destination.estimatedCost / trip.seats_needed) * 1.1
  );

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, h:mm a");
  };

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300 animate-fade-in">
      <CardContent className="p-0">
        {/* Header with destination */}
        <div className="gradient-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{destination.icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{destination.label}</h3>
              <p className="text-primary-foreground/80 text-sm">
                {formatTime(trip.departure_from)} - {formatTime(trip.departure_to)}
              </p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={trip.profiles.avatar_url || ""} alt={trip.profiles.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {trip.profiles.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground">{trip.profiles.name}</p>
              {trip.profiles.is_iiit_verified && <VerifiedBadge size="sm" />}
            </div>
          </div>
        </div>

        {/* Trip details */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{trip.seats_needed} seat{trip.seats_needed > 1 ? "s" : ""} needed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Luggage className="h-4 w-4 text-muted-foreground" />
            <span>{luggage.label} luggage</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(trip.created_at), "MMM d")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <IndianRupee className="h-4 w-4" />
            <span>~₹{estimatedCost}/person</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && !isOwnTrip && trip.status === "open" && (
          <div className="p-4 pt-0 flex gap-2">
            {onJoinRequest && (
              <Button
                onClick={onJoinRequest}
                className="flex-1 gradient-accent text-accent-foreground"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Request to Join
              </Button>
            )}
            {trip.profiles.phone && onWhatsApp && (
              <Button
                variant="outline"
                onClick={onWhatsApp}
                className="border-success/30 text-success hover:bg-success/10"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Status badge for own trips */}
        {isOwnTrip && (
          <div className="px-4 pb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                trip.status === "open"
                  ? "bg-success/10 text-success"
                  : trip.status === "matched"
                  ? "bg-accent/10 text-accent"
                  : trip.status === "completed"
                  ? "bg-muted text-muted-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
