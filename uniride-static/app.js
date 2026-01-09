// =====================================================
// Main Application Logic
// =====================================================

// =====================================================
// Toast Notifications
// =====================================================

function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// =====================================================
// Date/Time Formatting
// =====================================================

function formatDate(date) {
  const d = new Date(date);
  const options = { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function formatDateTime(date) {
  const d = new Date(date);
  const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return d.toLocaleDateString('en-US', options);
}

// =====================================================
// Trip Functions
// =====================================================

async function fetchTrips(filterDestination = 'all') {
  try {
    let query = tripsRef.where('status', '==', 'open').orderBy('created_at', 'desc');
    
    if (filterDestination !== 'all') {
      query = tripsRef
        .where('status', '==', 'open')
        .where('destination', '==', filterDestination)
        .orderBy('created_at', 'desc');
    }
    
    const snapshot = await query.get();
    const trips = [];
    
    for (const doc of snapshot.docs) {
      const tripData = { id: doc.id, ...doc.data() };
      
      // Fetch user profile
      const profileDoc = await profilesRef.doc(tripData.user_id).get();
      if (profileDoc.exists) {
        tripData.profile = profileDoc.data();
      }
      
      trips.push(tripData);
    }
    
    return trips;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
}

async function fetchMyTrips() {
  if (!currentUser) return [];
  
  try {
    const snapshot = await tripsRef
      .where('user_id', '==', currentUser.uid)
      .orderBy('created_at', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching my trips:', error);
    throw error;
  }
}

async function createTrip(tripData) {
  if (!currentUser) {
    throw new Error('You must be logged in to create a trip');
  }
  
  try {
    const docRef = await tripsRef.add({
      ...tripData,
      user_id: currentUser.uid,
      status: 'open',
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
}

async function joinTrip(tripId) {
  if (!currentUser) {
    throw new Error('You must be logged in to join a trip');
  }
  
  try {
    // Check if already requested
    const existing = await tripMembersRef
      .where('trip_id', '==', tripId)
      .where('user_id', '==', currentUser.uid)
      .get();
    
    if (!existing.empty) {
      throw new Error('You have already requested to join this trip');
    }
    
    // Add member request
    await tripMembersRef.add({
      trip_id: tripId,
      user_id: currentUser.uid,
      status: 'pending',
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update trip status
    await tripsRef.doc(tripId).update({
      status: 'matched',
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error joining trip:', error);
    throw error;
  }
}

async function cancelTrip(tripId) {
  if (!currentUser) {
    throw new Error('You must be logged in');
  }
  
  try {
    await tripsRef.doc(tripId).update({
      status: 'cancelled',
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling trip:', error);
    throw error;
  }
}

// =====================================================
// WhatsApp Integration
// =====================================================

function openWhatsApp(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = encodeURIComponent('Hi! I found your trip on UniRide and would like to join.');
  window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
}

// =====================================================
// Trip Card Rendering
// =====================================================

function renderTripCard(trip, options = {}) {
  const { showActions = true, isOwnTrip = false } = options;
  const destination = DESTINATIONS[trip.destination] || { label: trip.destination, icon: '📍', estimatedCost: 1000 };
  const luggage = LUGGAGE_SIZES[trip.luggage] || { label: trip.luggage };
  const estimatedCost = Math.round((destination.estimatedCost / trip.seats_needed) * 1.1);
  
  const profile = trip.profile || {};
  
  return `
    <div class="card trip-card animate-fade-in">
      <div class="trip-header">
        <div class="trip-destination">
          <span class="trip-destination-icon">${destination.icon}</span>
          <div>
            <div class="trip-destination-label">${destination.label}</div>
            <div class="trip-time">${formatDateTime(trip.departure_from?.toDate?.() || trip.departure_from)} - ${formatDateTime(trip.departure_to?.toDate?.() || trip.departure_to)}</div>
          </div>
        </div>
      </div>
      
      <div class="trip-user">
        <div class="avatar" style="width: 3rem; height: 3rem;">
          ${profile.avatar_url 
            ? `<img src="${profile.avatar_url}" alt="${profile.name}">`
            : `<span>${(profile.name || 'U').charAt(0)}</span>`
          }
        </div>
        <div>
          <div class="trip-user-name">${profile.name || 'User'}</div>
          ${profile.is_iiit_verified 
            ? `<span class="verified-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                IIIT Verified
              </span>`
            : ''
          }
        </div>
      </div>
      
      <div class="trip-details">
        <div class="trip-detail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          </svg>
          <span>${trip.seats_needed} seat${trip.seats_needed > 1 ? 's' : ''} needed</span>
        </div>
        <div class="trip-detail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 20h0a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h0"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>${luggage.label} luggage</span>
        </div>
        <div class="trip-detail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>${formatDate(trip.created_at?.toDate?.() || trip.created_at)}</span>
        </div>
        <div class="trip-detail trip-cost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 3h12"/>
            <path d="M6 8h12"/>
            <path d="m6 13 8.5 8"/>
            <path d="M6 13h3"/>
            <path d="M9 13c6.667 0 6.667-10 0-10"/>
          </svg>
          <span>~₹${estimatedCost}/person</span>
        </div>
      </div>
      
      ${showActions && !isOwnTrip && trip.status === 'open' ? `
        <div class="trip-actions">
          <button class="btn btn-accent" onclick="handleJoinTrip('${trip.id}', '${trip.user_id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Request to Join
          </button>
          ${profile.phone ? `
            <button class="btn btn-outline" style="border-color: var(--success); color: var(--success);" onclick="openWhatsApp('${profile.phone}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </button>
          ` : ''}
        </div>
      ` : ''}
      
      ${isOwnTrip ? `
        <span class="trip-status ${trip.status}">
          ${trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
        </span>
      ` : ''}
    </div>
  `;
}

// =====================================================
// Event Handlers
// =====================================================

async function handleJoinTrip(tripId, tripUserId) {
  if (!currentUser) {
    showToast('Please sign in', 'You need to be logged in to join a trip.', 'error');
    return;
  }
  
  if (currentUser.uid === tripUserId) {
    showToast("That's your trip!", "You can't join your own trip.", 'error');
    return;
  }
  
  try {
    await joinTrip(tripId);
    showToast('Request sent!', "You've requested to join this trip.", 'success');
    
    // Refresh trips if on trips page
    if (typeof loadTrips === 'function') {
      loadTrips();
    }
  } catch (error) {
    showToast('Error', error.message, 'error');
  }
}

// =====================================================
// Profile Functions
// =====================================================

async function updateProfile(data) {
  if (!currentUser) {
    throw new Error('You must be logged in');
  }
  
  try {
    await profilesRef.doc(currentUser.uid).update({
      ...data,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local profile
    currentProfile = { ...currentProfile, ...data };
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
