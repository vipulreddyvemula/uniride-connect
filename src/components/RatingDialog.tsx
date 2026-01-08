import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { Loader2 } from "lucide-react";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onSubmit: (rating: number) => Promise<void>;
}

export function RatingDialog({
  open,
  onOpenChange,
  userName,
  onSubmit,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await onSubmit(rating);
      onOpenChange(false);
      setRating(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Trip</DialogTitle>
          <DialogDescription>
            How was your ride with {userName}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-6">
          <StarRating rating={rating} onRate={setRating} size="lg" />
          <p className="text-sm text-muted-foreground">
            {rating === 0
              ? "Tap a star to rate"
              : rating <= 2
              ? "We're sorry to hear that"
              : rating <= 3
              ? "Thanks for your feedback"
              : rating <= 4
              ? "Great experience!"
              : "Excellent! 🎉"}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="gradient-primary"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
