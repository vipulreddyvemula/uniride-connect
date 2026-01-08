import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Link } from "react-router-dom";
import { Car, Users, Clock, Shield, MapPin, Sparkles } from "lucide-react";

export default function Index() {
  const { user, signInWithGoogle, loading } = useAuth();

  const features = [
    {
      icon: Shield,
      title: "IIIT Verified",
      description: "Only verified IIIT students for trusted rides",
    },
    {
      icon: Users,
      title: "Find Co-Travelers",
      description: "Match with students going the same way",
    },
    {
      icon: Clock,
      title: "Flexible Timing",
      description: "Set your departure window for best matches",
    },
    {
      icon: MapPin,
      title: "Popular Routes",
      description: "Kochi Airport, Kottayam Railway & more",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm text-white/90">Share rides, save money</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Travel Together<br />
              <span className="text-accent">Save Together</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              UniRide connects IIIT students for shared rides to airports, 
              railway stations, and bus stands. Split costs, make friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/create">
                    <Button size="lg" className="gradient-accent text-lg px-8 h-14 w-full sm:w-auto">
                      <Car className="mr-2 h-5 w-5" />
                      Create Trip
                    </Button>
                  </Link>
                  <Link to="/trips">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 h-14 w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      Find Rides
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5 mr-2"
                  />
                  Sign in with Google
                </Button>
              )}
            </div>
            <p className="mt-6 text-sm text-white/60">
              Use your @iiit.ac.in email to get <VerifiedBadge size="sm" />
            </p>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why UniRide?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built exclusively for the IIIT community to make travel easier and more affordable
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl gradient-primary mb-4">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Create a Trip",
                description: "Set your destination, time window, and seats needed",
              },
              {
                step: "2",
                title: "Find Matches",
                description: "We'll show you students with similar travel plans",
              },
              {
                step: "3",
                title: "Connect & Go",
                description: "Request to join and chat on WhatsApp to coordinate",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-16 w-16 rounded-full gradient-accent flex items-center justify-center text-2xl font-bold text-accent-foreground mb-4 shadow-elevated">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="gradient-primary p-8 md:p-12 text-center shadow-glow">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Ready to share your next ride?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join fellow IIIT students and make travel more affordable and fun.
            </p>
            {user ? (
              <Link to="/create">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elevated">
                  Create Your First Trip
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                onClick={signInWithGoogle}
                disabled={loading}
                className="bg-white text-primary hover:bg-white/90 shadow-elevated"
              >
                Get Started Free
              </Button>
            )}
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2024 UniRide. Made for the IIIT community with ❤️</p>
        </div>
      </footer>
    </div>
  );
}
