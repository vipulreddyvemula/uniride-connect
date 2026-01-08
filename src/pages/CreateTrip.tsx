import { useAuth } from "@/hooks/useAuth";
import { CreateTripForm } from "@/components/CreateTripForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function CreateTrip() {
  const { user, signInWithGoogle, loading } = useAuth();

  if (!user) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto shadow-elevated">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full gradient-primary mb-4">
              <LogIn className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sign in to Continue</h2>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to create a trip request.
            </p>
            <Button
              onClick={signInWithGoogle}
              disabled={loading}
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
      <CreateTripForm />
    </div>
  );
}
