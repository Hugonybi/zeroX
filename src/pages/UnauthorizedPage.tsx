import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth/hooks';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-red-200 bg-red-50">
              <span className="text-4xl">🔒</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          {user && (
            <p className="mt-2 text-xs text-gray-500">
              Your account type is: <span className="font-semibold capitalize">{user.role}</span>
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-left">
            <p className="font-semibold text-blue-900 mb-2">Access Requirements:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>Artists:</strong> Can create and manage artworks</li>
              <li>• <strong>Admins:</strong> Can access admin console and moderation tools</li>
              <li>• <strong>Buyers:</strong> Can purchase artworks and view certificates</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
            >
              Go Back
            </Button>
            <Link to="/">
              <Button>
                Return to Gallery
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
