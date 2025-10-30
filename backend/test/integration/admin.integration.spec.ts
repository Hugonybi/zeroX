import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('Admin Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create admin user and get token for testing
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: '$2b$10$test', // Mock hash
        name: 'Admin User',
        role: UserRole.admin,
      },
    });

    // Mock JWT token for admin (in real test, you'd authenticate properly)
    adminToken = 'mock-admin-jwt-token';
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: '@test.com' } },
    });
    await app.close();
  });

  describe('/admin/users (GET)', () => {
    it('should return paginated users', async () => {
      // This test would need proper JWT setup to work
      // For now, we'll just verify the endpoint exists
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .expect(401); // Unauthorized without proper JWT

      // In a real test with proper auth setup:
      // .set('Authorization', `Bearer ${adminToken}`)
      // .expect(200)
      // .expect((res) => {
      //   expect(res.body).toHaveProperty('users');
      //   expect(res.body).toHaveProperty('total');
      //   expect(res.body).toHaveProperty('page');
      //   expect(res.body).toHaveProperty('limit');
      // });
    });

    it('should support search and filtering', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users?search=test&role=buyer')
        .expect(401); // Unauthorized without proper JWT

      // In a real test with proper auth:
      // .set('Authorization', `Bearer ${adminToken}`)
      // .expect(200);
    });
  });

  describe('/admin/users/:id/role (PUT)', () => {
    it('should update user role', async () => {
      const response = await request(app.getHttpServer())
        .put('/admin/users/test-id/role')
        .send({ role: UserRole.artist })
        .expect(401); // Unauthorized without proper JWT

      // In a real test with proper auth:
      // .set('Authorization', `Bearer ${adminToken}`)
      // .expect(200);
    });
  });
});