/**
 * Admin-specific error classes for better error handling and user experience
 */

export class AdminPermissionError extends Error {
  constructor(action: string, resource?: string) {
    const message = resource
      ? `Admin permission required for ${action} on ${resource}`
      : `Admin permission required for action: ${action}`;

    super(message);
    this.name = 'AdminPermissionError';
  }
}

export class AdminOperationError extends Error {
  public readonly code?: string;

  constructor(operation: string, reason: string, code?: string) {
    super(`Admin operation failed: ${operation} - ${reason}`);
    this.name = 'AdminOperationError';
    this.code = code;
  }
}

export class AdminValidationError extends Error {
  constructor(field: string, value: any, requirement: string) {
    super(`Validation failed for ${field}: ${requirement}. Received: ${value}`);
    this.name = 'AdminValidationError';
  }
}

export class AdminNetworkError extends Error {
  constructor(endpoint: string, status?: number, statusText?: string) {
    const message = status
      ? `Network error accessing ${endpoint}: ${status} ${statusText}`
      : `Network error accessing ${endpoint}`;

    super(message);
    this.name = 'AdminNetworkError';
  }
}

export class AdminSessionError extends Error {
  constructor(reason: string = 'Session expired or invalid') {
    super(`Admin session error: ${reason}`);
    this.name = 'AdminSessionError';
  }
}

/**
 * Utility function to determine if an error is admin-related
 */
export function isAdminError(error: Error): boolean {
  return error.name.startsWith('Admin') ||
    error.message.toLowerCase().includes('admin');
}

/**
 * Utility function to get user-friendly error message
 */
export function getAdminErrorMessage(error: Error): string {
  if (error instanceof AdminPermissionError) {
    return 'You do not have permission to perform this action. Please contact your administrator.';
  }

  if (error instanceof AdminSessionError) {
    return 'Your admin session has expired. Please log in again.';
  }

  if (error instanceof AdminValidationError) {
    return `Invalid input: ${error.message}`;
  }

  if (error instanceof AdminNetworkError) {
    return 'Unable to connect to the admin service. Please check your connection and try again.';
  }

  if (error instanceof AdminOperationError) {
    return `Operation failed: ${error.message}`;
  }

  // Generic admin error
  if (isAdminError(error)) {
    return 'An admin-related error occurred. Please try again or contact support.';
  }

  // Generic error
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Utility function to determine error severity
 */
export function getAdminErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
  if (error instanceof AdminPermissionError || error instanceof AdminSessionError) {
    return 'high';
  }

  if (error instanceof AdminValidationError) {
    return 'low';
  }

  if (error instanceof AdminNetworkError) {
    return 'medium';
  }

  if (error instanceof AdminOperationError) {
    return 'high';
  }

  return 'medium';
}

/**
 * Error handler for admin API calls
 */
export function handleAdminApiError(error: any, endpoint: string): never {
  if (error.status === 401) {
    throw new AdminSessionError('Authentication required');
  }

  if (error.status === 403) {
    throw new AdminPermissionError('access admin features');
  }

  if (error.status === 422) {
    throw new AdminValidationError('request', error.body, 'valid admin request format');
  }

  if (error.status >= 500) {
    throw new AdminOperationError('server request', 'Internal server error', error.status.toString());
  }

  if (!error.status) {
    throw new AdminNetworkError(endpoint);
  }

  throw new AdminOperationError(
    'API request',
    error.message || 'Unknown error',
    error.status?.toString()
  );
}