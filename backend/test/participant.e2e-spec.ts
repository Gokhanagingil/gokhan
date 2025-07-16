import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { ParticipantModule } from '../src/modules/facilitator/participant/participant.module';
import { Participant, ParticipantStatus } from '../src/modules/facilitator/participant/participant.entity';

describe('ParticipantController (e2e)', () => {
  let app: INestApplication;
  let createdParticipantId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Participant],
          synchronize: true,
        }),
        ParticipantModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/participants (POST)', () => {
    it('should create a new participant', async () => {
      const createParticipantDto = {
        name: 'John Doe',
        role: 'Incident Manager',
        status: ParticipantStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post('/participants')
        .send(createParticipantDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createParticipantDto.name);
      expect(response.body.role).toBe(createParticipantDto.role);
      expect(response.body.status).toBe(createParticipantDto.status);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      createdParticipantId = response.body.id;
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        role: 'Incident Manager',
      };

      await request(app.getHttpServer())
        .post('/participants')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/participants (GET)', () => {
    beforeEach(async () => {
      const createParticipantDto = {
        name: 'Jane Smith',
        role: 'Change Authority',
        status: ParticipantStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post('/participants')
        .send(createParticipantDto)
        .expect(201);

      createdParticipantId = response.body.id;
    });

    it('should return all participants', async () => {
      const response = await request(app.getHttpServer())
        .get('/participants')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('role');
    });
  });

  describe('/participants/:id (GET)', () => {
    beforeEach(async () => {
      const createParticipantDto = {
        name: 'Bob Wilson',
        role: 'Agile Lead',
        status: ParticipantStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post('/participants')
        .send(createParticipantDto)
        .expect(201);

      createdParticipantId = response.body.id;
    });

    it('should return a specific participant', async () => {
      const response = await request(app.getHttpServer())
        .get(`/participants/${createdParticipantId}`)
        .expect(200);

      expect(response.body.id).toBe(createdParticipantId);
      expect(response.body.name).toBe('Bob Wilson');
      expect(response.body.role).toBe('Agile Lead');
    });

    it('should return 404 for non-existent participant', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      
      await request(app.getHttpServer())
        .get(`/participants/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/participants/:id (PATCH)', () => {
    beforeEach(async () => {
      const createParticipantDto = {
        name: 'Alice Brown',
        role: 'Problem Manager',
        status: ParticipantStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post('/participants')
        .send(createParticipantDto)
        .expect(201);

      createdParticipantId = response.body.id;
    });

    it('should update a participant', async () => {
      const updateDto = {
        name: 'Alice Brown-Smith',
        status: ParticipantStatus.INACTIVE,
      };

      const response = await request(app.getHttpServer())
        .patch(`/participants/${createdParticipantId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.status).toBe(updateDto.status);
      expect(response.body.role).toBe('Problem Manager');
    });
  });

  describe('/participants/:id (DELETE)', () => {
    beforeEach(async () => {
      const createParticipantDto = {
        name: 'Charlie Davis',
        role: 'Service Desk Agent',
        status: ParticipantStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .post('/participants')
        .send(createParticipantDto)
        .expect(201);

      createdParticipantId = response.body.id;
    });

    it('should delete a participant', async () => {
      await request(app.getHttpServer())
        .delete(`/participants/${createdParticipantId}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/participants/${createdParticipantId}`)
        .expect(404);
    });
  });
});
