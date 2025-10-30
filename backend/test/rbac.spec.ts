import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/common/guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockExecutionContext = (user: any, roles: string[] | null): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('Role enforcement', () => {
    it('should allow access when no roles are required', () => {
      const context = mockExecutionContext({ userId: '123', role: 'buyer' }, null);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has required role', () => {
      const context = mockExecutionContext({ userId: '123', role: 'artist' }, ['artist']);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['artist']);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const context = mockExecutionContext({ userId: '123', role: 'admin' }, ['admin', 'artist']);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'artist']);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const context = mockExecutionContext({ userId: '123', role: 'buyer' }, ['artist']);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['artist']);

      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });

    it('should deny access when user is not authenticated', () => {
      const context = mockExecutionContext(null, ['admin']);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });

    it('should deny access when buyer tries to access artist endpoint', () => {
      const context = mockExecutionContext({ userId: '123', role: 'buyer' }, ['artist']);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['artist']);

      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });

    it('should deny access when artist tries to access admin endpoint', () => {
      const context = mockExecutionContext({ userId: '123', role: 'artist' }, ['admin']);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });
  });
});
