// ============================================================
// API Client — Multi-laptop shared backend communication
// Works across both localhost & network IP (10.104.184.234)
// ============================================================

export async function fetchUsers() {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend /api/users offline, using local fallback:', err);
  }
  return null;
}

export async function apiRegister(userData) {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data.user;
  } catch (err) {
    console.error('API Register Error:', err);
    throw err;
  }
}

export async function apiLogin(credentials) {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data.user;
  } catch (err) {
    console.error('API Login Error:', err);
    throw err;
  }
}

export async function apiUpdateProfile(profileData) {
  try {
    const res = await fetch('/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    return data.user;
  } catch (err) {
    console.error('API Update Profile Error:', err);
    throw err;
  }
}

export async function fetchMessages() {
  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const data = await res.json();
      return data.messages;
    }
  } catch (err) {
    console.warn('Backend /api/messages offline:', err);
  }
  return null;
}

export async function apiSendMessage(message) {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Backend /api/messages send error:', err);
  }
  return false;
}

export async function apiMarkAsRead(userId, partnerId) {
  try {
    await fetch('/api/messages/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, partnerId })
    });
  } catch (err) {
    console.warn('Backend /api/messages/read error:', err);
  }
}

export async function apiSyncDemoUsers(demoUsers) {
  try {
    const res = await fetch('/api/sync-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoUsers })
    });
    if (res.ok) {
      const data = await res.json();
      return data.users;
    }
  } catch (err) {
    console.warn('Backend /api/sync-demo error:', err);
  }
  return null;
}

export async function apiClearDemoUsers() {
  try {
    const res = await fetch('/api/clear-demo', {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      return data.users;
    }
  } catch (err) {
    console.warn('Backend /api/clear-demo error:', err);
  }
  return null;
}
