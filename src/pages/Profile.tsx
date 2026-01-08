import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, Phone, Save } from "lucide-react";

export default function Profile() {
  const { user, profile, updateProfile, signInWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ phone: phone || null });
      toast({
        title: "Profile updated",
        description: "Your phone number has been saved.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
              Sign in to view and edit your profile.
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
      <Card className="max-w-lg mx-auto shadow-elevated">
        <CardHeader className="text-center pb-8">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 border-4 border-primary/20 mb-4">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {profile?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{profile?.name}</CardTitle>
            <CardDescription className="text-base mt-1">
              {profile?.email}
            </CardDescription>
            {profile?.is_iiit_verified && (
              <div className="mt-3">
                <VerifiedBadge size="md" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Adding your phone number allows other riders to contact you via WhatsApp.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gradient-primary"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>

          {!profile?.is_iiit_verified && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Sign in with your <strong>@iiit.ac.in</strong> email to get verified!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
