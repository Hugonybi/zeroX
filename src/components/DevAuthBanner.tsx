import { useAuth } from '../features/auth/hooks';
import { Button } from "./ui/Button";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function DevAuthBanner() {
  const { user, isAuthenticated, signOut } = useAuth();

  const handleAutoGenerate = async () => {
    try {
      // Register a test artist account
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `artist-${Date.now()}@test.com`,
          password: 'Test123!@#',
          name: 'Dev Test Artist',
          role: 'artist',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      // Refresh the page to trigger auth initialization
      window.location.reload();
    } catch (err) {
      console.error('Failed to generate token:', err);
    }
  };

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs shadow-lg">
      <div className="flex items-start gap-3">
        <span className="text-base">🔐</span>
        <div className="flex-1 space-y-2">
          <p className="font-semibold uppercase tracking-[0.2em] text-amber-900">Dev Auth Helper</p>
          {isAuthenticated ? (
            <>
              <p className="text-amber-700">
                Logged in as: <code className="rounded bg-amber-100 px-1">{user?.email}</code>
              </p>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <p className="text-amber-700">Not authenticated</p>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleAutoGenerate}
              >
                Auto-Generate Artist Account
              </Button>
              <p className="text-xs text-amber-600">
                💡 Creates a test artist account and logs you in automatically
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
