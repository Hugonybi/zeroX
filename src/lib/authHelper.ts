/**
 * Development helper: Quickly set auth token in browser
 * Run this in the browser console after registration
 */

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
  console.log('✅ Auth token set. Refresh the page or navigate to /artists to test.');
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
  console.log('🗑️  Auth token cleared.');
}

export function getAuthToken() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('📋 Current token:', token.substring(0, 30) + '...');
    return token;
  }
  console.log('⚠️  No auth token found. Register an artist first.');
  return null;
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  const globalWindow = window as unknown as Record<string, unknown>;
  globalWindow.authHelper = {
    setAuthToken,
    clearAuthToken,
    getAuthToken,
  };
  console.log('🔧 Auth helper loaded. Use window.authHelper.setAuthToken(token) in console.');
}
