# UniRide - Static HTML/CSS/JS Version

A static version of UniRide with Firebase backend support.

## Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** with Google Sign-In
4. Enable **Firestore Database**

### 2. Configure Firebase

Edit `firebase-config.js` and replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Set Up Firestore Rules

In Firebase Console → Firestore → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles: Users can read all, write only their own
    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trips: Anyone can read open trips, authenticated users can create
    match /trips/{tripId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
    
    // Trip members: Authenticated users can manage their own memberships
    match /trip_members/{memberId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
    
    // Ratings: Authenticated users can create ratings
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

### 4. Create Firestore Indexes

For the trips query to work, create a composite index:
- Collection: `trips`
- Fields: `status` (Ascending), `created_at` (Descending)

### 5. Run Locally

You can use any local server. For example:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## Files

- `index.html` - Landing page
- `trips.html` - Browse available trips
- `create.html` - Create a new trip
- `my-trips.html` - View your trips
- `profile.html` - Edit your profile
- `styles.css` - All styles
- `firebase-config.js` - Firebase configuration
- `auth.js` - Authentication logic
- `app.js` - Main application logic

## Features

- ✅ Google Sign-In authentication
- ✅ IIIT email verification badge
- ✅ Create trip requests
- ✅ Browse available trips
- ✅ Request to join trips
- ✅ WhatsApp integration for communication
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support

## Customization

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
  --primary: hsl(171, 77%, 37%);  /* Teal */
  --accent: hsl(38, 92%, 50%);    /* Amber */
  --success: hsl(142, 76%, 36%);  /* Green */
  /* ... */
}
```

### Destinations

Edit the `DESTINATIONS` object in `firebase-config.js` to add or modify destinations.

## License

MIT
