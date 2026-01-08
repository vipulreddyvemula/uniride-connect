import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DESTINATIONS, LUGGAGE_SIZES, DestinationType, LuggageSize } from "@/lib/constants";
import { Plane, Train, Bus, Loader2 } from "lucide-react";

export function CreateTripForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    destination: "" as DestinationType | "",
    departureFrom: "",
    departureTo: "",
    seatsNeeded: 1,
    luggage: "light" as LuggageSize,
    budget: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to create a trip.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.destination || !formData.departureFrom || !formData.departureTo) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("trips").insert({
        user_id: user.id,
        destination: formData.destination,
        departure_from: new Date(formData.departureFrom).toISOString(),
        departure_to: new Date(formData.departureTo).toISOString(),
        seats_needed: formData.seatsNeeded,
        luggage: formData.luggage,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      });

      if (error) throw error;

      toast({
        title: "Trip created!",
        description: "Your trip request has been posted. We'll find matches for you.",
      });

      navigate("/trips");
    } catch (error: any) {
      console.error("Error creating trip:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const destinationIcons = {
    kochi_airport: Plane,
    kottayam_railway: Train,
    bus_stand: Bus,
  };

  return (
    <Card className="max-w-lg mx-auto shadow-elevated">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Trip Request</CardTitle>
        <CardDescription>
          Share your travel plans and find fellow riders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destination *</Label>
            <Select
              value={formData.destination}
              onValueChange={(value: DestinationType) =>
                setFormData((prev) => ({ ...prev, destination: value }))
              }
            >
              <SelectTrigger id="destination">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DESTINATIONS) as DestinationType[]).map((key) => {
                  const Icon = destinationIcons[key];
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {DESTINATIONS[key].label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureFrom">From *</Label>
              <Input
                id="departureFrom"
                type="datetime-local"
                value={formData.departureFrom}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, departureFrom: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureTo">To *</Label>
              <Input
                id="departureTo"
                type="datetime-local"
                value={formData.departureTo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, departureTo: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Seats & Luggage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seats">Seats Needed *</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="6"
                value={formData.seatsNeeded}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seatsNeeded: parseInt(e.target.value) || 1,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="luggage">Luggage Size *</Label>
              <Select
                value={formData.luggage}
                onValueChange={(value: LuggageSize) =>
                  setFormData((prev) => ({ ...prev, luggage: value }))
                }
              >
                <SelectTrigger id="luggage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LUGGAGE_SIZES) as LuggageSize[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {LUGGAGE_SIZES[key].icon} {LUGGAGE_SIZES[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="budget"
                type="number"
                placeholder="Maximum you're willing to spend"
                className="pl-8"
                value={formData.budget}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, budget: e.target.value }))
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-lg h-12"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Trip Request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
