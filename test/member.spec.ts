import { DatabaseService } from '../src/common/database/database.service';
import { DatabaseModule } from '../src/common/database/database.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('Member API', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    databaseService = app.get(DatabaseService);
  });

  describe('POST /api/members', () => {
    it('should create a new member', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/members')
        .send({
          code: 'M001',
          name: 'Dian Mardian',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.code).toEqual('M001');
      expect(response.body.data.name).toEqual('Dian Mardian');
    });

    afterEach(async () => {
      await databaseService.member.deleteMany();
    });
  });

  describe('GET /api/members', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 9; i++) {
        await databaseService.member.create({
          data: {
            code: `M00${i}`,
            name: `Member ${i}`,
          },
        });
      }
    });

    it('should get all member', async () => {
      const response = await request(app.getHttpServer()).get('/api/members');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toEqual(9);
    });

    afterEach(async () => {
      await databaseService.member.deleteMany();
    });
  });

  describe('GET /api/members/current-borrowed-books', () => {
    beforeEach(async () => {
      await databaseService.book.create({
        data: {
          code: 'JK-45',
          title: 'Harry Potter',
          author: 'J.K Rowling',
          stock: 1,
        },
      });

      await databaseService.member.create({
        data: {
          code: 'M001',
          name: 'Rifki Ari',
        },
      });

      await databaseService.borrowedBook.create({
        data: {
          book_code: 'JK-45',
          member_code: 'M001',
        },
      });
    });

    it('should get all member with borrowed books', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/members/current-borrowed-books',
      );

      expect(response.status).toBe(200);
      expect(response.body.data.length).toEqual(1);
    });

    afterEach(async () => {
      await databaseService.member.deleteMany();
      await databaseService.book.deleteMany();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
