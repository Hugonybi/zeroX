# Implementation Plan

- [x] 1. Set up backend admin infrastructure
  - Create admin module structure and basic service
  - Add admin-specific DTOs and interfaces
  - Set up admin controller with role guards
  - _Requirements: 1.3, 6.1_

- [x] 1.1 Create admin module and service foundation
  - Generate admin module using NestJS CLI
  - Create AdminService with basic structure and dependency injection
  - Add admin-specific TypeScript interfaces and DTOs
  - _Requirements: 1.3, 6.1_

- [x] 1.2 Implement admin controller with security
  - Create AdminController with proper route structure
  - Apply @Roles('admin') decorator to all admin endpoints
  - Add basic endpoint stubs for dashboard, users, artworks, and system health
  - _Requirements: 1.3, 6.1_

- [x] 1.3 Add admin DTOs and type definitions
  - Create AdminDashboardStats, AdminUserList, and SystemHealthStatus interfaces
  - Add UpdateUserRoleDto with proper validation decorators
  - Define FailedMintOperation and QueueStatus types
  - _Requirements: 1.1, 2.1, 4.1_

- [x] 2. Implement admin dashboard functionality
  - Build dashboard statistics aggregation
  - Create system health monitoring
  - Add basic queue status checking
  - _Requirements: 1.1, 1.2, 5.1_

- [x] 2.1 Create dashboard statistics service methods
  - Implement getDashboardStats method with user, artwork, and order counts
  - Add recent orders counting (24-hour window)
  - Create failed minting operations count query
  - _Requirements: 1.1, 1.2_

- [x] 2.2 Add system health monitoring
  - Implement getSystemHealth method with basic health indicators
  - Add queue status checking using Bull queue methods
  - Create basic error counting from recent operations
  - _Requirements: 5.1, 5.4_

- [x] 2.3 Implement queue status monitoring
  - Add getQueueStatus private method for mint queue monitoring
  - Query waiting, active, completed, and failed job counts
  - Integrate queue status into dashboard statistics
  - _Requirements: 5.2, 5.3_

- [x] 3. Build user management functionality
  - Implement user listing with pagination
  - Add user role update capability
  - Create user search and filtering
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 3.1 Create user listing and pagination
  - Implement getAllUsers method with pagination support
  - Add user count aggregation for artworks and orders
  - Include proper user data selection (exclude sensitive fields)
  - _Requirements: 2.1, 2.5_

- [x] 3.2 Add user role management
  - Implement updateUserRole method with validation
  - Add role transition validation logic
  - Integrate with existing UsersService for role updates
  - _Requirements: 2.2, 2.4_

- [x] 3.3 Create admin action logging
  - Implement logAdminAction private method
  - Add audit logging for user role changes
  - Use existing AuditLog model for tracking admin actions
  - _Requirements: 6.2, 6.3_

- [x] 4. Implement artwork and order oversight
  - Build artwork listing for admin oversight
  - Create failed minting operation handling
  - Add minting retry functionality
  - _Requirements: 3.1, 3.3, 4.1, 4.4_

- [x] 4.1 Create artwork oversight functionality
  - Implement getAllArtworks method with pagination
  - Include artist information and order counts
  - Add basic artwork search capabilities
  - _Requirements: 3.1, 3.5_

- [x] 4.2 Build failed minting operation handling
  - Implement getFailedMints method to query failed operations
  - Include related artwork and buyer information
  - Sort by most recent failures first
  - _Requirements: 4.1, 4.5_

- [x] 4.3 Add minting retry functionality
  - Implement retryMinting method for failed operations
  - Reset order status and re-queue minting job
  - Add proper error handling and validation
  - _Requirements: 4.4, 4.5_

- [x] 4.4 Create mint metadata helper
  - Add buildMintMetadata private method
  - Extract metadata building logic for reuse
  - Ensure consistency with existing minting process
  - _Requirements: 4.4_

- [x] 5. Create frontend admin infrastructure
  - Set up admin page routing and layout
  - Create admin API client and hooks
  - Build basic admin dashboard components
  - _Requirements: 1.1, 1.5_

- [x] 5.1 Set up admin routing and layout
  - Update React Router configuration for admin routes
  - Create AdminLayout component with navigation
  - Add admin route protection with role checking
  - _Requirements: 1.5, 6.1_

- [x] 5.2 Create admin API client
  - Build AdminApiClient class with all admin endpoints
  - Add proper error handling and response typing
  - Integrate with existing fetch-based API pattern
  - _Requirements: 1.1, 6.1_

- [x] 5.3 Implement admin React Query hooks
  - Create useAdminDashboard hook with auto-refresh
  - Add useAdminUsers hook with pagination support
  - Implement useUpdateUserRole mutation hook
  - _Requirements: 1.1, 2.1_

- [x] 6. Build admin dashboard UI components
  - Create dashboard statistics display
  - Build system health status indicators
  - Add quick action buttons and navigation
  - _Requirements: 1.1, 1.2, 5.1_

- [x] 6.1 Create admin dashboard page
  - Build main AdminPage component with layout
  - Add dashboard header and navigation
  - Integrate loading states and error handling
  - _Requirements: 1.1, 1.5_

- [x] 6.2 Build dashboard statistics grid
  - Create AdminStatsGrid component for metrics display
  - Add visual indicators for warnings (failed mints)
  - Style with consistent design system
  - _Requirements: 1.1, 1.2_

- [x] 6.3 Add system health indicators
  - Create AdminSystemHealth component
  - Display queue status and error counts
  - Add health status color coding
  - _Requirements: 5.1, 5.4_

- [x] 7. Implement user management UI
  - Build user listing table with pagination
  - Create role selection and update functionality
  - Add user search and filtering interface
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 7.1 Create user management page
  - Build AdminUserManagement component with table layout
  - Add pagination controls and page navigation
  - Include loading states and error handling
  - _Requirements: 2.1, 2.5_

- [x] 7.2 Build user role management interface
  - Create RoleSelect component for role changes
  - Add confirmation dialogs for role updates
  - Implement optimistic updates with error rollback
  - _Requirements: 2.2, 2.4_

- [x] 7.3 Add user search and filtering
  - Implement basic search functionality by email
  - Add role-based filtering options
  - Create search input and filter controls
  - _Requirements: 2.5_

- [x] 8. Build order and system monitoring UI
  - Create failed minting operations interface
  - Add minting retry functionality
  - Build system monitoring dashboard
  - _Requirements: 4.1, 4.4, 5.1_

- [x] 8.1 Create failed minting operations interface
  - Build FailedMintsTable component
  - Display failed operations with relevant details
  - Add retry buttons with confirmation dialogs
  - _Requirements: 4.1, 4.5_

- [x] 8.2 Implement minting retry functionality
  - Create useRetryMinting mutation hook
  - Add retry confirmation and success feedback
  - Update failed mints list after successful retry
  - _Requirements: 4.4, 4.5_

- [x] 8.3 Build system monitoring interface
  - Create SystemMonitoring component
  - Display queue status and recent errors
  - Add refresh capabilities and real-time updates
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 9. Add admin security and audit features
  - Implement admin action confirmation dialogs
  - Add audit logging display
  - Create admin session management
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 9.1 Create admin action confirmations
  - Add confirmation dialogs for sensitive operations
  - Implement role change confirmation with details
  - Add minting retry confirmation with order information
  - _Requirements: 6.4_

- [x] 9.2 Build audit logging interface
  - Create AdminAuditLog component for recent actions
  - Display admin actions with timestamps and details
  - Add basic filtering by action type
  - _Requirements: 6.3_

- [x] 9.3 Add admin error boundaries and security
  - Create AdminErrorBoundary for error handling
  - Add admin-specific error messages and recovery
  - Implement proper admin route protection
  - _Requirements: 6.1, 6.5_

- [x] 10. Integration and testing setup
  - Connect all admin components to backend APIs
  - Add error handling and loading states
  - Test admin workflows end-to-end
  - _Requirements: 1.1, 6.1_

- [x] 10.1 Complete API integration
  - Connect all frontend components to backend endpoints
  - Add proper error handling for all API calls
  - Implement loading states and user feedback
  - _Requirements: 1.1, 6.1_

- [x] 10.2 Add comprehensive error handling
  - Implement error boundaries for admin sections
  - Add toast notifications for success/error states
  - Create fallback UI for failed operations
  - _Requirements: 6.1_

- [x] 10.3 Test admin functionality end-to-end
  - Test complete admin user journey from login to actions
  - Verify role-based access control works correctly
  - Test all admin operations with proper data validation
  - _Requirements: 1.1, 2.1, 4.1, 6.1_