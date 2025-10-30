interface AdminLoadingStateProps {
  type?: 'dashboard' | 'table' | 'form' | 'card' | 'full-page';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function AdminLoadingState({ 
  type = 'card', 
  message = 'Loading...', 
  showProgress = false, 
  progress = 0 
}: AdminLoadingStateProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return <DashboardSkeleton />;
      case 'table':
        return <TableSkeleton />;
      case 'form':
        return <FormSkeleton />;
      case 'full-page':
        return <FullPageSkeleton message={message} showProgress={showProgress} progress={progress} />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <div className="animate-pulse">
      {renderSkeleton()}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>
      
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-gray-100 rounded-lg border border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg border border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-gray-200 rounded-full"></div>
        <div className="w-32 h-10 bg-gray-200 rounded-full"></div>
      </div>
      
      {/* Table skeleton */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-100 last:border-b-0">
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form fields */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-100 rounded-lg border border-gray-200"></div>
        </div>
      ))}
      
      {/* Buttons */}
      <div className="flex space-x-3">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-100 rounded w-20"></div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

function FullPageSkeleton({ message, showProgress, progress }: { message: string; showProgress: boolean; progress: number }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md">
        {/* Loading spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          {showProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Loading message */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Loading Admin Panel</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        
        {/* Progress bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        )}
        
        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Specialized loading components for specific admin sections
export function AdminDashboardLoading() {
  return <AdminLoadingState type="dashboard" message="Loading dashboard statistics..." />;
}

export function AdminTableLoading() {
  return <AdminLoadingState type="table" message="Loading data..." />;
}

export function AdminFormLoading() {
  return <AdminLoadingState type="form" message="Loading form..." />;
}

export function AdminCardLoading() {
  return <AdminLoadingState type="card" message="Loading..." />;
}

export function AdminFullPageLoading({ message = "Loading admin panel...", progress }: { message?: string; progress?: number }) {
  return (
    <AdminLoadingState 
      type="full-page" 
      message={message} 
      showProgress={progress !== undefined} 
      progress={progress || 0} 
    />
  );
}