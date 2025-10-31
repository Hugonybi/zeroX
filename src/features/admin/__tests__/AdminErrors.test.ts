import {
  AdminPermissionError,
  AdminOperationError,
  AdminValidationError,
  AdminNetworkError,
  AdminSessionError,
  isAdminError,
  getAdminErrorMessage,
  getAdminErrorSeverity,
  handleAdminApiError,
} from '../errors';

describe('Admin Error Classes', () => {
  describe('AdminPermissionError', () => {
    it('should create error with action only', () => {
      const error = new AdminPermissionError('delete user');
      expect(error.message).toBe('Admin permission required for action: delete user');
      expect(error.name).toBe('AdminPermissionError');
    });

    it('should create error with action and resource', () => {
      const error = new AdminPermissionError('delete', 'user account');
      expect(error.message).toBe('Admin permission required for delete on user account');
      expect(error.name).toBe('AdminPermissionError');
    });
  });

  describe('AdminOperationError', () => {
    it('should create error with operation and reason', () => {
      const error = new AdminOperationError('user update', 'database connection failed');
      expect(error.message).toBe('Admin operation failed: user update - database connection failed');
      expect(error.name).toBe('AdminOperationError');
    });

    it('should create error with code', () => {
      const error = new AdminOperationError('API request', 'server error', '500');
      expect(error.message).toBe('Admin operation failed: API request - server error');
      expect(error.code).toBe('500');
    });
  });

  describe('AdminValidationError', () => {
    it('should create validation error', () => {
      const error = new AdminValidationError('email', 'invalid@', 'valid email format');
      expect(error.message).toBe('Validation failed for email: valid email format. Received: invalid@');
      expect(error.name).toBe('AdminValidationError');
    });
  });

  describe('AdminNetworkError', () => {
    it('should create network error with endpoint only', () => {
      const error = new AdminNetworkError('/admin/users');
      expect(error.message).toBe('Network error accessing /admin/users');
      expect(error.name).toBe('AdminNetworkError');
    });

    it('should create network error with status', () => {
      const error = new AdminNetworkError('/admin/users', 404, 'Not Found');
      expect(error.message).toBe('Network error accessing /admin/users: 404 Not Found');
    });
  });

  describe('AdminSessionError', () => {
    it('should create session error with default message', () => {
      const error = new AdminSessionError();
      expect(error.message).toBe('Admin session error: Session expired or invalid');
      expect(error.name).toBe('AdminSessionError');
    });

    it('should create session error with custom reason', () => {
      const error = new AdminSessionError('Token revoked');
      expect(error.message).toBe('Admin session error: Token revoked');
    });
  });
});

describe('Error Utility Functions', () => {
  describe('isAdminError', () => {
    it('should identify admin errors', () => {
      expect(isAdminError(new AdminPermissionError('test'))).toBe(true);
      expect(isAdminError(new AdminOperationError('test', 'reason'))).toBe(true);
      expect(isAdminError(new AdminValidationError('field', 'value', 'requirement'))).toBe(true);
      expect(isAdminError(new AdminNetworkError('/test'))).toBe(true);
      expect(isAdminError(new AdminSessionError())).toBe(true);
    });

    it('should identify non-admin errors', () => {
      expect(isAdminError(new Error('Generic error'))).toBe(false);
      expect(isAdminError(new TypeError('Type error'))).toBe(false);
    });

    it('should identify errors with admin in message', () => {
      const error = new Error('Admin access denied');
      expect(isAdminError(error)).toBe(true);
    });
  });

  describe('getAdminErrorMessage', () => {
    it('should return user-friendly messages for admin errors', () => {
      const permissionError = new AdminPermissionError('test');
      expect(getAdminErrorMessage(permissionError)).toBe(
        'You do not have permission to perform this action. Please contact your administrator.'
      );

      const sessionError = new AdminSessionError();
      expect(getAdminErrorMessage(sessionError)).toBe(
        'Your admin session has expired. Please log in again.'
      );

      const validationError = new AdminValidationError('email', 'invalid', 'valid format');
      expect(getAdminErrorMessage(validationError)).toContain('Invalid input:');

      const networkError = new AdminNetworkError('/test');
      expect(getAdminErrorMessage(networkError)).toBe(
        'Unable to connect to the admin service. Please check your connection and try again.'
      );

      const operationError = new AdminOperationError('test', 'failed');
      expect(getAdminErrorMessage(operationError)).toContain('Operation failed:');
    });

    it('should return generic message for unknown errors', () => {
      const genericError = new Error('Something went wrong');
      expect(getAdminErrorMessage(genericError)).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });
  });

  describe('getAdminErrorSeverity', () => {
    it('should return correct severity levels', () => {
      expect(getAdminErrorSeverity(new AdminPermissionError('test'))).toBe('high');
      expect(getAdminErrorSeverity(new AdminSessionError())).toBe('high');
      expect(getAdminErrorSeverity(new AdminValidationError('field', 'value', 'req'))).toBe('low');
      expect(getAdminErrorSeverity(new AdminNetworkError('/test'))).toBe('medium');
      expect(getAdminErrorSeverity(new AdminOperationError('test', 'reason'))).toBe('high');
      expect(getAdminErrorSeverity(new Error('Generic'))).toBe('medium');
    });
  });

  describe('handleAdminApiError', () => {
    it('should throw AdminSessionError for 401 status', () => {
      const mockError = { status: 401 };
      expect(() => handleAdminApiError(mockError, '/test')).toThrow(AdminSessionError);
    });

    it('should throw AdminPermissionError for 403 status', () => {
      const mockError = { status: 403 };
      expect(() => handleAdminApiError(mockError, '/test')).toThrow(AdminPermissionError);
    });

    it('should throw AdminValidationError for 422 status', () => {
      const mockError = { status: 422, body: { message: 'Validation failed' } };
      expect(() => handleAdminApiError(mockError, '/test')).toThrow(AdminValidationError);
    });

    it('should throw AdminOperationError for 5xx status', () => {
      const mockError = { status: 500, message: 'Internal server error' };
      expect(() => handleAdminApiError(mockError, '/test')).toThrow(AdminOperationError);
    });

    it('should throw AdminNetworkError for no status', () => {
      const mockError = { message: 'Network error' };
      expect(() => handleAdminApiError(mockError, '/test')).toThrow(AdminNetworkError);
    });

    it('should throw AdminOperationError for other status codes', () => {
      const mockError = { status: 400, message: 'Bad request' };
      expect(() => handleAdminApiError(mockError, '/test')).toThrow(AdminOperationError);
    });
  });
});