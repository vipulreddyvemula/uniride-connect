// =====================================================
// Firebase Configuration
// Replace with your own Firebase project config
// =====================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// =====================================================
// Firestore Collections Reference
// =====================================================

// Collections:
// - profiles: User profiles (synced with auth)
// - trips: Trip requests
// - trip_members: Join requests for trips
// - ratings: User ratings

const profilesRef = db.collection('profiles');
const tripsRef = db.collection('trips');
const tripMembersRef = db.collection('trip_members');
const ratingsRef = db.collection('ratings');

// =====================================================
// Constants
// =====================================================

const DESTINATIONS = {
  kochi_airport: {
    label: "Kochi Airport",
    icon: "✈️",
    estimatedCost: 2500
  },
  kottayam_railway: {
    label: "Kottayam Railway Station",
    icon: "🚂",
    estimatedCost: 1500
  },
  bus_stand: {
    label: "Bus Stand",
    icon: "🚌",
    estimatedCost: 500
  }
};

const LUGGAGE_SIZES = {
  light: { label: "Light", icon: "🎒" },
  medium: { label: "Medium", icon: "🧳" },
  heavy: { label: "Heavy", icon: "📦" }
};
