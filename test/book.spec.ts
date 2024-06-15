import { DatabaseModule } from '../src/common/database/database.module';
import { DatabaseService } from '../src/common/database/database.service';
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

  describe('POST /api/books', () => {
    beforeEach(async () => {
      await databaseService.book.deleteMany();
    });

    it('should create a new book', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/books')
        .send({
          code: 'JK-45',
          title: 'Harry Potter',
          author: 'J.K Rowling',
          stock: 1,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.code).toEqual('JK-45');
      expect(response.body.data.title).toEqual('Harry Potter');
      expect(response.body.data.author).toEqual('J.K Rowling');
      expect(response.body.data.stock).toEqual(1);
    });

    afterEach(async () => {
      await databaseService.book.deleteMany();
    });
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 9; i++) {
        await databaseService.book.create({
          data: {
            code: `JK-${i}`,
            title: `TItle ${i}`,
            author: `Author ${i}`,
            stock: 1,
          },
        });
      }
    });

    it('should get all book', async () => {
      const response = await request(app.getHttpServer()).get('/api/books');

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toEqual(9);
    });

    afterEach(async () => {
      await databaseService.book.deleteMany();
    });
  });

  describe('GET /api/books/borrow', () => {
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

      await databaseService.member.create({
        data: {
          code: 'M002',
          name: 'Farah',
        },
      });
    });

    it('should borrow a book', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/books/borrow')
        .send({
          member_code: 'M001',
          book_code: 'JK-45',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.member_code).toBe('M001');
      expect(response.body.data.book_code).toBe('JK-45');
    });

    it('should fail to borrow a book if the member has already borrowed it', async () => {
      await request(app.getHttpServer()).post('/api/books/borrow').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });

      const response = await request(app.getHttpServer())
        .post('/api/books/borrow')
        .send({
          member_code: 'M001',
          book_code: 'JK-45',
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBe("Can't borrow more than 2 books");
    });

    it('should fail to borrow a book if the book is already borrowed by another member', async () => {
      await request(app.getHttpServer()).post('/api/books/borrow').send({
        member_code: 'M002',
        book_code: 'JK-45',
      });

      const response = await request(app.getHttpServer())
        .post('/api/books/borrow')
        .send({
          member_code: 'M001',
          book_code: 'JK-45',
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBe(
        'Book is already borrowed by other member',
      );
    });

    it('should fail to borrow a book if the member being penalized', async () => {
      const penaltyEndDate = new Date();
      penaltyEndDate.setDate(penaltyEndDate.getDate() + 3);
      await databaseService.member.update({
        data: {
          penalty_end_date: penaltyEndDate,
        },
        where: {
          code: 'M001',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/books/borrow')
        .send({
          member_code: 'M001',
          book_code: 'JK-45',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBe(
        'Member is currently penalized and cannot borrow books',
      );
    });

    afterEach(async () => {
      await databaseService.borrowedBook.deleteMany();
      await databaseService.book.deleteMany();
      await databaseService.member.deleteMany();
    });
  });

  describe('GET /api/books/return', () => {
    let borrowedBook: any;
    beforeEach(async () => {
      await databaseService.book.create({
        data: {
          code: 'JK-45',
          title: 'Harry Potter',
          author: 'J.K Rowling',
          stock: 1,
        },
      });

      await databaseService.book.create({
        data: {
          code: 'SHR-1',
          title: 'A Study in Scarlet',
          author: 'Arthur Conan Doyle',
          stock: 1,
        },
      });

      await databaseService.member.create({
        data: {
          code: 'M001',
          name: 'Rifki Ari',
        },
      });

      borrowedBook = await databaseService.borrowedBook.create({
        data: {
          member_code: 'M001',
          book_code: 'JK-45',
        },
      });
    });

    it('should return a borrowed book', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/books/return')
        .send({
          member_code: 'M001',
          book_code: 'JK-45',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.member_code).toBe('M001');
      expect(response.body.data.book_code).toBe('JK-45');
    });

    it('should fail to return a book if it is not a book that the member has borrowed', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/books/return')
        .send({
          member_code: 'M001',
          book_code: 'SHR-1',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBe(
        'The returned book is not a book that the member has borrowed',
      );
    });

    it('should give penalty to member if returning book after 7 days', async () => {
      await databaseService.borrowedBook.update({
        data: {
          member_code: 'M001',
          book_code: 'JK-45',
          borrow_date: new Date('2024-05-14T00:00:00.000Z'),
        },
        where: {
          id: borrowedBook.id,
        },
      });

      await request(app.getHttpServer()).post('/api/books/return').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });

      const member = await databaseService.member.findFirst({
        where: {
          code: 'M001',
        },
      });

      expect(member.penalty_end_date).not.toBeNull();
    });

    afterEach(async () => {
      await databaseService.borrowedBook.deleteMany();
      await databaseService.book.deleteMany();
      await databaseService.member.deleteMany();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
