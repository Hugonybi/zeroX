import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { TextArea } from '../components/ui/TextArea';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../features/auth/hooks';
import { OrderHistoryList } from '../components/OrderHistoryList';
import { useOrderHistory } from '../hooks/useOrderHistory';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { orders, isLoading: ordersLoading, error: ordersError } = useOrderHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement update user API call
      // For now, just refresh user data
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <TextField
              id="email"
              type="email"
              value={user.email}
              disabled
              className="mt-1"
            />
            <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            {isEditing ? (
              <TextField
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <div className="mt-2">
              <Badge tone={user.role === 'admin' ? 'success' : user.role === 'artist' ? 'info' : 'neutral'}>
                <span className="capitalize">{user.role}</span>
              </Badge>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {user.role === 'admin' && 'Full access to admin console and moderation tools'}
              {user.role === 'artist' && 'Can create and manage artwork listings'}
              {user.role === 'buyer' && 'Can purchase artworks and view certificates'}
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            {isEditing ? (
              <TextArea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="mt-1"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="mt-1 text-gray-900">{user.bio || 'No bio provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Status
            </label>
            <p className="mt-1 text-gray-900 capitalize">{user.kycStatus}</p>
          </div>

          {isEditing && (
            <div className="flex gap-4">
              <Button
                type="submit"
                loading={isLoading}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name,
                    bio: user.bio || '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Order History Section - Only show for buyers */}
      {user.role === 'buyer' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="font-brand text-2xl uppercase tracking-[0.15em]">My Purchases</h2>
            <p className="mt-2 text-sm text-ink-muted">View your order history and certificates</p>
          </div>
          <OrderHistoryList 
            orders={orders} 
            isLoading={ordersLoading} 
            error={ordersError} 
          />
        </div>
      )}
    </div>
  );
}