import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DatabaseService } from '../common/database/database.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { FindMemberDto } from './dto/find-member.dto';

@Injectable()
export class MemberService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createMemberDto: CreateMemberDto): Promise<CreateMemberDto> {
    try {
      const member = await this.databaseService.member.create({
        data: createMemberDto,
      });
      return member;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException('Member code already used');
        }
      }
    }
  }

  async findAll(): Promise<FindMemberDto[]> {
    const members = await this.databaseService.member.findMany({
      select: { code: true, name: true },
    });
    return members;
  }

  async findByCode(memberCode: string): Promise<FindMemberDto> {
    const member = await this.databaseService.member.findFirst({
      where: {
        code: memberCode,
      },
      select: { code: true, name: true },
    });
    return member;
  }

  async isMemberPenalty(memberCode: string): Promise<boolean> {
    const member = await this.databaseService.member.findFirst({
      where: {
        code: memberCode,
        penalty_end_date: {
          not: null,
        },
      },
    });

    if (!member) {
      return false;
    }

    const today = new Date();

    if (member.penalty_end_date < today) {
      await this.databaseService.member.update({
        data: {
          penalty_end_date: null,
        },
        where: {
          code: memberCode,
        },
      });
      return false;
    }

    return true;
  }

  async giveMemberPenalty(memberCode: string): Promise<void> {
    const penaltyEndDate = new Date();
    penaltyEndDate.setDate(penaltyEndDate.getDate() + 3);

    await this.databaseService.member.update({
      where: {
        code: memberCode,
      },
      data: {
        penalty_end_date: penaltyEndDate,
      },
    });
  }

  async findMembersWithCurrentBorrowedBooks(): Promise<FindMemberDto[]> {
    const membersWithUnreturnedBooks =
      await this.databaseService.member.findMany({
        where: {
          BorrowedBooks: {
            some: {
              return_date: null,
            },
          },
        },
        select: {
          code: true,
          name: true,
          BorrowedBooks: {
            where: {
              return_date: null,
            },
            select: {
              id: true,
              book_code: true,
              borrow_date: true,
              Book: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });

    const result = membersWithUnreturnedBooks.map((m) => {
      const books = m.BorrowedBooks.map((b) => {
        return {
          book_code: b.book_code,
          book_name: b.Book.title,
          borrow_date: b.borrow_date,
        };
      });

      return {
        code: m.code,
        name: m.name,
        total_borrowed_book: books.length,
        books,
      };
    });

    return result;
  }
}
