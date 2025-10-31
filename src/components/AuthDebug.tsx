import { useAuth } from '../features/auth/hooks';

/**
 * Debug component to show authentication status
 * Remove this in production
 */
export function AuthDebug() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">🔐 Auth Debug</h3>
      <div className="text-sm space-y-1">
        <p>Status: {isLoading ? '⏳ Loading...' : isAuthenticated ? '✅ Authenticated' : '❌ Not logged in'}</p>
        {user && (
          <>
            <p>User: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </>
        )}
        {!isAuthenticated && !isLoading && (
          <p className="text-yellow-300">⚠️ You need to log in</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Cookies: {document.cookie ? 'Present' : 'None'}
        </p>
      </div>
    </div>
  );
}
