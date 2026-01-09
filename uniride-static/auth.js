// =====================================================
// Authentication Module
// =====================================================

let currentUser = null;
let currentProfile = null;

// =====================================================
// Auth State Listener
// =====================================================

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  
  if (user) {
    // Fetch or create profile
    currentProfile = await fetchOrCreateProfile(user);
    updateUIForLoggedInUser();
  } else {
    currentProfile = null;
    updateUIForLoggedOutUser();
  }
  
  // Hide loading states
  document.querySelectorAll('#auth-loading').forEach(el => el.style.display = 'none');
});

// =====================================================
// Profile Functions
// =====================================================

async function fetchOrCreateProfile(user) {
  try {
    const doc = await profilesRef.doc(user.uid).get();
    
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    
    // Create new profile
    const isIIITVerified = user.email?.endsWith('@iiit.ac.in') || false;
    
    const profileData = {
      user_id: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      avatar_url: user.photoURL || null,
      phone: null,
      is_iiit_verified: isIIITVerified,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await profilesRef.doc(user.uid).set(profileData);
    return { id: user.uid, ...profileData };
    
  } catch (error) {
    console.error('Error fetching/creating profile:', error);
    return null;
  }
}

// =====================================================
// Sign In / Sign Out
// =====================================================

async function signInWithGoogle() {
  try {
    await auth.signInWithPopup(googleProvider);
    showToast('Welcome!', 'You have successfully signed in.', 'success');
  } catch (error) {
    console.error('Sign in error:', error);
    showToast('Sign In Failed', error.message, 'error');
  }
}

async function signOut() {
  try {
    await auth.signOut();
    showToast('Signed Out', 'You have been signed out.', 'success');
    // Redirect to home
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Sign out error:', error);
    showToast('Error', 'Failed to sign out.', 'error');
  }
}

// =====================================================
// UI Updates
// =====================================================

function updateUIForLoggedInUser() {
  // Hide sign in buttons
  document.querySelectorAll('#btn-signin, #hero-signin, #cta-signin').forEach(el => {
    if (el) el.style.display = 'none';
  });
  
  // Show logged in elements
  const userMenu = document.getElementById('user-menu');
  if (userMenu) userMenu.style.display = 'block';
  
  const heroLoggedIn = document.getElementById('hero-logged-in');
  if (heroLoggedIn) heroLoggedIn.style.display = 'flex';
  
  const ctaCreate = document.getElementById('cta-create');
  if (ctaCreate) ctaCreate.style.display = 'inline-flex';
  
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  if (mobileToggle) mobileToggle.style.display = 'flex';
  
  // Show desktop nav
  const navDesktop = document.getElementById('nav-desktop');
  if (navDesktop) {
    navDesktop.innerHTML = `
      <a href="index.html" class="nav-link ${isCurrentPage('index.html') ? 'active' : ''}">Home</a>
      <a href="trips.html" class="nav-link ${isCurrentPage('trips.html') ? 'active' : ''}">Find Rides</a>
      <a href="create.html" class="nav-link ${isCurrentPage('create.html') ? 'active' : ''}">Create Trip</a>
      <a href="my-trips.html" class="nav-link ${isCurrentPage('my-trips.html') ? 'active' : ''}">My Trips</a>
    `;
  }
  
  // Update user info
  if (currentProfile) {
    const userInitial = document.getElementById('user-initial');
    if (userInitial) userInitial.textContent = currentProfile.name?.charAt(0) || 'U';
    
    const userName = document.getElementById('user-name');
    if (userName) userName.textContent = currentProfile.name?.split(' ')[0] || 'User';
    
    const dropdownName = document.getElementById('dropdown-name');
    if (dropdownName) dropdownName.textContent = currentProfile.name;
    
    const dropdownEmail = document.getElementById('dropdown-email');
    if (dropdownEmail) dropdownEmail.textContent = currentProfile.email;
    
    const dropdownVerified = document.getElementById('dropdown-verified');
    if (dropdownVerified) {
      dropdownVerified.style.display = currentProfile.is_iiit_verified ? 'inline-flex' : 'none';
    }
    
    // Update avatar if available
    if (currentProfile.avatar_url) {
      const avatar = document.getElementById('user-avatar');
      if (avatar) {
        avatar.innerHTML = `<img src="${currentProfile.avatar_url}" alt="${currentProfile.name}">`;
      }
    }
  }
}

function updateUIForLoggedOutUser() {
  // Show sign in buttons
  document.querySelectorAll('#btn-signin, #hero-signin, #cta-signin').forEach(el => {
    if (el) el.style.display = 'inline-flex';
  });
  
  // Hide logged in elements
  const userMenu = document.getElementById('user-menu');
  if (userMenu) userMenu.style.display = 'none';
  
  const heroLoggedIn = document.getElementById('hero-logged-in');
  if (heroLoggedIn) heroLoggedIn.style.display = 'none';
  
  const ctaCreate = document.getElementById('cta-create');
  if (ctaCreate) ctaCreate.style.display = 'none';
  
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  if (mobileToggle) mobileToggle.style.display = 'none';
  
  // Hide desktop nav
  const navDesktop = document.getElementById('nav-desktop');
  if (navDesktop) navDesktop.innerHTML = '';
  
  // Hide mobile nav
  const navMobile = document.getElementById('nav-mobile');
  if (navMobile) navMobile.classList.remove('show');
}

// =====================================================
// Helpers
// =====================================================

function isCurrentPage(page) {
  const path = window.location.pathname;
  if (page === 'index.html') {
    return path === '/' || path.endsWith('index.html');
  }
  return path.endsWith(page);
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function toggleMobileMenu() {
  const navMobile = document.getElementById('nav-mobile');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');
  
  if (navMobile) {
    navMobile.classList.toggle('show');
    
    if (navMobile.classList.contains('show')) {
      menuIcon.style.display = 'none';
      closeIcon.style.display = 'block';
    } else {
      menuIcon.style.display = 'block';
      closeIcon.style.display = 'none';
    }
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const userMenu = document.getElementById('user-menu');
  const dropdown = document.getElementById('user-dropdown');
  
  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});
