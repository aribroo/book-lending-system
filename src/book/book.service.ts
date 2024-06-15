import { ReturnBookDto } from './dto/return-book.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DatabaseService } from '../common/database/database.service';
import { FindBorrowedBookDto } from './dto/find-borrowed-book.dto';
import { MemberService } from '../member/member.service';
import { CreateBookDto } from './dto/create-book.dto';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { FindBookDto } from './dto/find-book.dto';

@Injectable()
export class BookService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly memberService: MemberService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<CreateBookDto> {
    try {
      const book = await this.databaseService.book.create({
        data: createBookDto,
      });

      return book;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException('Book code already used');
        }
      }
    }
  }

  async findAll(): Promise<FindBookDto[]> {
    const books = await this.databaseService.book.findMany({
      where: {
        stock: {
          gt: 0,
        },
      },
      select: { code: true, title: true, author: true, stock: true },
    });

    return books;
  }

  async findByCode(bookCode: string): Promise<FindBookDto> {
    const book = await this.databaseService.book.findFirst({
      where: {
        code: bookCode,
      },
      select: { code: true, title: true, author: true, stock: true },
    });

    return book;
  }

  async findBookByMemberCode(
    tx: any,
    memberCode: string,
  ): Promise<FindBorrowedBookDto> {
    const book = await tx.borrowedBook.findFirst({
      where: {
        member_code: memberCode,
        return_date: null,
      },
    });

    return book;
  }

  async findBorrowedBookByMemberCode(
    memberCode: string,
    bookCode: string,
  ): Promise<FindBorrowedBookDto> {
    const book = await this.databaseService.borrowedBook.findFirst({
      where: {
        member_code: memberCode,
        book_code: bookCode,
        return_date: null,
      },
    });

    return book;
  }

  async updateBorrowedBook(
    borrowedId: number,
    returnDate: Date,
  ): Promise<FindBorrowedBookDto> {
    const borrowedBook = await this.databaseService.borrowedBook.update({
      where: {
        id: borrowedId,
      },
      data: {
        return_date: returnDate,
      },
    });

    return borrowedBook;
  }

  async updateStockBook(bookCode: string): Promise<void> {
    await this.databaseService.book.update({
      where: {
        code: bookCode,
      },
      data: {
        stock: {
          increment: 1,
        },
      },
    });
  }

  async borrowBook(borrowBookDto: BorrowBookDto): Promise<any> {
    const isMemberExist = await this.databaseService.member.findUnique({
      where: { code: borrowBookDto.member_code },
    });

    if (!isMemberExist) throw new NotFoundException('Member not found');

    const isBookExist = await this.databaseService.book.findUnique({
      where: { code: borrowBookDto.book_code },
    });

    if (!isBookExist) throw new NotFoundException('Book not found');

    const isMemberPenalty = await this.memberService.isMemberPenalty(
      borrowBookDto.member_code,
    );

    if (isMemberPenalty) {
      throw new BadRequestException(
        'Member is currently penalized and cannot borrow books',
      );
    }

    return this.databaseService.$transaction(
      async (tx) => {
        const borrowedBookByMemberCode = await tx.borrowedBook.findFirst({
          where: {
            member_code: borrowBookDto.member_code,
            return_date: null,
          },
        });

        if (borrowedBookByMemberCode) {
          throw new ConflictException(`Can't borrow more than 2 books`);
        }

        const borrowedBook = await tx.borrowedBook.findFirst({
          where: {
            book_code: borrowBookDto.book_code,
            member_code: {
              not: borrowBookDto.member_code,
            },
            return_date: null,
          },
        });

        if (borrowedBook) {
          throw new ConflictException(
            'Book is already borrowed by other member',
          );
        }

        await tx.book.update({
          data: { stock: { decrement: 1 } },
          where: { code: borrowBookDto.book_code },
        });

        const borrowBook = await tx.borrowedBook.create({
          data: {
            book_code: borrowBookDto.book_code,
            member_code: borrowBookDto.member_code,
          },
        });

        return borrowBook;
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }

  async returnBorrowedBook(returnBookDto: ReturnBookDto): Promise<any> {
    const isMemberExist = await this.memberService.findByCode(
      returnBookDto.member_code,
    );

    if (!isMemberExist) throw new NotFoundException('Member not found');

    const isBookExist = await this.findByCode(returnBookDto.book_code);

    if (!isBookExist) throw new NotFoundException('Book not found');

    const checkBookBorrowedByMemberCode =
      await this.findBorrowedBookByMemberCode(
        returnBookDto.member_code,
        returnBookDto.book_code,
      );

    if (!checkBookBorrowedByMemberCode)
      throw new BadRequestException(
        'The returned book is not a book that the member has borrowed',
      );

    // is book returned after more than 7 days?
    const borrowDate = checkBookBorrowedByMemberCode.borrow_date;
    const returnDate = new Date();

    const diffTime = Math.abs(
      returnDate.getTime() - new Date(borrowDate).getTime(),
    );

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      await this.memberService.giveMemberPenalty(returnBookDto.member_code);
    }

    const updateBorrowedBook = await this.updateBorrowedBook(
      checkBookBorrowedByMemberCode.id,
      returnDate,
    );

    await this.updateStockBook(returnBookDto.book_code);

    return updateBorrowedBook;
  }
}
