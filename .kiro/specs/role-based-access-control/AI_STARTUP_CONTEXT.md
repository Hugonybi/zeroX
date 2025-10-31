# AI Agent Startup Context for RBAC Implementation

## 🎯 Mission
Implement the enhanced Role-Based Access Control (RBAC) system for the Hedera Art Marketplace as specified in `design.md` and `tasks.md`. This system will provide granular permission management for buyers, artists, and admins with a UI-first approach (hide unpermitted actions rather than showing and blocking).

---

## 📋 Specification Files
Read these in order before starting implementation:
1. **`requirements.md`** - Business requirements and acceptance criteria
2. **`design.md`** - Architecture, interfaces, and technical design
3. **`tasks.md`** - Granular implementation tasks with dependencies

---

## 🏗️ Existing Infrastructure Context

### Authentication System (Already Implemented)

**Backend:**
- JWT-based authentication with access + refresh tokens
- Guards: `JwtAuthGuard`, `RolesGuard`, `RefreshTokenGuard`
- Decorator: `@Roles(...roles: string[])`
- Location: `backend/src/common/guards/`, `backend/src/common/decorators/`

**Current RolesGuard Implementation:**
```typescript
// backend/src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass()
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

**Frontend:**
- Auth context: `src/features/auth/AuthContext.tsx`
- Auth hook: `src/features/auth/hooks.ts` exports `useAuth()`
- Protected routes: `src/components/ProtectedRoute.tsx`
- Token storage: localStorage (`auth_token`)

**Current useAuth Interface:**
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials) => Promise<void>;
  signUp: (data) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}
```

### Database Schema (Prisma)

**User Model:**
```prisma
model User {
  id              String           @id @default(uuid())
  email           String           @unique
  passwordHash    String
  role            UserRole         @default(buyer)  // buyer | artist | admin
  name            String
  bio             String?
  kycStatus       KycStatus        @default(none)   // none | pending | verified | rejected
  failedLoginAttempts Int          @default(0)
  lockedUntil     DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  artworks        Artwork[]
  orders          Order[]          @relation("BuyerOrders")
  ownershipTokens OwnershipToken[]
  refreshTokens   RefreshToken[]
}
```

**Roles Enum:** `buyer`, `artist`, `admin`

**Key Relations:**
- `User.artworks` → Artist's created artworks
- `User.orders` → Buyer's purchase orders
- `Artwork.artistId` → Artwork ownership by artist
- `Order.buyerId` → Order ownership by buyer

### Infrastructure

**Docker Services (docker-compose.infrastructure.yml):**
- ✅ PostgreSQL (port 5432) - Already running
- ✅ Redis (port 6379) - Already running, ready for permission caching

**Backend Tech Stack:**
- NestJS + TypeScript
- Prisma ORM
- JWT authentication
- BullMQ job queue (for async tasks)

**Frontend Tech Stack:**
- React + TypeScript
- React Router
- TanStack Query (React Query) for data fetching
- Tailwind CSS

---

## 🎯 Implementation Priorities

### MVP Features (Implement These)
1. ✅ Permission service with role-based and resource-level checks
2. ✅ Resource ownership validation (artists own artworks, buyers own orders)
3. ✅ Enhanced guards (`ResourceOwnershipGuard`, extended `RolesGuard`)
4. ✅ Permission decorators (`@RequirePermission`, `@ResourceOwnership`)
5. ✅ Frontend permission hooks (`usePermissions`)
6. ✅ Permission wrapper components for conditional UI rendering
7. ✅ Role-based navigation filtering
8. ✅ Permission caching with Redis (15min user permissions, 5min resource)
9. ✅ Database migrations for permissions tables

### POST-MVP (Defer These)
- ❌ Real-time permission updates via WebSocket (task 7.3)
- ❌ Fine-grained permission delegation (gallery managers, curators)
- ❌ Time-based permission expiration
- ❌ Advanced audit trails for permission changes

---

## 🔑 Key Business Rules

### KYC Gating Logic
- Artists can create artwork **drafts** (`status='draft'`) without KYC
- Artists must have `kycStatus='verified'` to **publish** artworks (`status='published'`)
- Publishing endpoint must check: `if (user.kycStatus !== 'verified') throw ForbiddenException('KYC verification required')`

### Admin Permissions
Admins should have these capabilities:
- ✅ Full CRUD on all artworks (view, edit, delete, moderate)
- ✅ Full CRUD on all orders (view, update status, refund)
- ✅ View all users and update KYC status
- ✅ Re-mint failed authenticity/ownership tokens
- ✅ Access admin console (`/admin/*` routes)
- ❌ Admins cannot purchase artworks (buyers only)
- ❌ Admins cannot create artworks (artists only)

### Artist Permissions
- ✅ Create, edit, delete **own** artworks
- ✅ View **own** sales/orders related to their artworks
- ✅ Cannot edit or delete other artists' artworks
- ✅ Cannot purchase artworks (buyers only)
- ✅ Can update **own** profile and bio

### Buyer Permissions
- ✅ Purchase artworks
- ✅ View **own** orders and purchased artworks
- ✅ View certificates for **own** purchases
- ✅ Cannot create or manage artworks
- ✅ Can update **own** profile

---

## 📂 File Structure to Create/Modify

### Backend (Create)
```
backend/src/
├── common/
│   ├── guards/
│   │   ├── resource-ownership.guard.ts      [NEW]
│   │   └── roles.guard.ts                   [MODIFY - extend with permissions]
│   ├── decorators/
│   │   ├── require-permission.decorator.ts  [NEW]
│   │   └── resource-ownership.decorator.ts  [NEW]
│   └── services/
│       └── permission.service.ts            [NEW]
├── modules/
│   └── permissions/
│       ├── permissions.module.ts            [NEW]
│       ├── permissions.service.ts           [NEW]
│       └── dto/                             [NEW]
└── prisma/
    └── migrations/
        └── [timestamp]_add_permissions/     [NEW]
            └── migration.sql
```

### Frontend (Create)
```
src/
├── features/
│   └── permissions/
│       ├── PermissionContext.tsx            [NEW]
│       ├── usePermissions.ts                [NEW]
│       └── PermissionWrapper.tsx            [NEW]
├── components/
│   ├── SiteHeader.tsx                       [MODIFY - role-based nav]
│   └── ProtectedRoute.tsx                   [MODIFY - add permission checks]
└── types/
    └── permissions.ts                       [NEW]
```

### Tests to Create
```
backend/test/
├── unit/
│   ├── permission.service.spec.ts
│   ├── resource-ownership.guard.spec.ts
│   └── roles.guard.spec.ts
└── integration/
    ├── artwork-permissions.e2e.spec.ts
    └── order-permissions.e2e.spec.ts

src/
└── features/permissions/
    └── __tests__/
        ├── usePermissions.test.tsx
        └── PermissionWrapper.test.tsx
```

---

## 🚀 Recommended Implementation Order

### Phase 1: Backend Foundation (Tasks 1.x)
1. Read existing `RolesGuard` and `@Roles` decorator
2. Create permission service interface (`PermissionService`)
3. Create Prisma migration for `permissions`, `role_permissions`, `resource_permissions` tables
4. Implement `PermissionService` with Redis caching
5. Write unit tests for permission service

### Phase 2: Backend Guards & Decorators (Tasks 2.x)
1. Create `@RequirePermission` decorator
2. Create `@ResourceOwnership` decorator
3. Create `ResourceOwnershipGuard`
4. Extend `RolesGuard` to integrate with `PermissionService`
5. Write guard integration tests

### Phase 3: Backend Controller Updates (Tasks 3.x, 6.x)
1. Apply `@ResourceOwnership` to artworks controller (ensure artists only edit own works)
2. Apply resource checks to orders controller (ensure buyers only see own orders)
3. Add KYC checks to artwork publish endpoint
4. Add permission-based data filtering in services
5. Test with different user roles

### Phase 4: Frontend Permission System (Tasks 4.x)
1. Create `usePermissions` hook
2. Create `PermissionWrapper` component
3. Update `AuthContext` to load permissions on login
4. Create permission types/interfaces
5. Write component tests

### Phase 5: Frontend UI Integration (Tasks 5.x)
1. Update `SiteHeader` for role-based navigation
2. Modify artwork cards to show role-appropriate actions
3. Create role-specific dashboard components
4. Add conditional action buttons
5. Test UI with different roles

### Phase 6: Integration & Testing (Tasks 7.x)
1. Update `ProtectedRoute` with permission validation
2. Test complete user journeys (buyer, artist, admin)
3. Validate permission caching and invalidation
4. E2E tests for permission flows

---

## 🧪 Testing Strategy

### Unit Tests (Required for each component)
- Permission service: test role checks, resource checks, caching
- Guards: test permission denial, ownership validation
- Hooks: test permission loading, role checks

### Integration Tests
- Artwork CRUD with different roles
- Order access with buyer vs non-buyer
- Admin moderation endpoints

### E2E Scenarios
```typescript
describe('Artist Artwork Management', () => {
  it('should allow artist to edit own artwork', async () => {
    // Create artist user, create artwork, edit it
  });
  
  it('should prevent artist from editing other artist artwork', async () => {
    // Create two artists, artist1 tries to edit artist2's work
  });
});

describe('Buyer Order Access', () => {
  it('should allow buyer to view own orders', async () => {
    // Create buyer, purchase artwork, view order
  });
  
  it('should prevent buyer from viewing other buyer orders', async () => {
    // Create two buyers, buyer1 tries to view buyer2's order
  });
});
```

---

## ⚠️ Important Constraints

### Security
- Never expose admin endpoints to non-admin users
- Always validate resource ownership in guards, not just services
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data in `resource_permissions` table

### Performance
- Cache user permissions for **15 minutes** in Redis
- Cache resource permissions for **5 minutes** in Redis
- Use bulk permission checks for list views (avoid N+1 queries)
- Index `resource_permissions` table on `(user_id, resource_type, resource_id)`

### User Experience
- **Hide** unpermitted buttons/actions, don't show disabled buttons
- Show clear fallback messages for permission denials
- Load permissions silently on login, don't block UI
- Use optimistic UI updates where appropriate

### Backward Compatibility
- Existing `@Roles()` decorator must continue to work
- Don't break current auth flows
- Maintain existing API contracts for frontend

---

## 🔍 Code Review Checklist

Before marking a task complete, verify:
- [ ] TypeScript types are properly defined (no `any`)
- [ ] Tests are written and passing
- [ ] Guards throw appropriate exceptions (`ForbiddenException`, `UnauthorizedException`)
- [ ] Redis caching is implemented with TTL
- [ ] Database indexes are created for permission queries
- [ ] Frontend components render conditionally based on permissions
- [ ] No sensitive data exposed in client-side code
- [ ] Migration is reversible (has `down` migration)
- [ ] Audit logs capture permission checks (optional for MVP)

---

## 📞 Escalation Points

If you encounter these issues, flag for human review:
- Conflicting permission requirements in existing controllers
- Performance degradation in permission checks (>100ms)
- Circular dependencies between guards/services
- Redis connection failures in production
- Complex multi-resource permission scenarios not covered in spec

---

## 🎬 Getting Started Command

```bash
# 1. Ensure infrastructure is running
cd backend
docker compose -f docker-compose.infrastructure.yml up -d

# 2. Verify Redis is accessible
redis-cli ping  # Should return "PONG"

# 3. Read existing auth code
# - backend/src/common/guards/roles.guard.ts
# - backend/src/common/decorators/roles.decorator.ts
# - src/features/auth/AuthContext.tsx

# 4. Start with task 1.1: Create permission service interface
```

---

## ✅ Success Criteria

Implementation is complete when:
1. All tasks in `tasks.md` marked as `[MVP]` are completed
2. Unit tests pass for permission service and guards
3. Integration tests pass for artwork/order permissions
4. Frontend renders different UI based on user role
5. Artists can only manage their own artworks
6. Buyers can only view their own orders
7. Admins can access all resources
8. KYC verification required before publishing artworks
9. Permission caching reduces database queries by >80%
10. No breaking changes to existing auth flows

---

**Now begin with task 1.1 from `tasks.md`!** 🚀
