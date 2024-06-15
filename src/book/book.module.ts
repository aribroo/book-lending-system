import { DatabaseModule } from '../common/database/database.module';
import { BookController } from './book.controller';
import { MemberService } from '../member/member.service';
import { BookService } from './book.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  controllers: [BookController],
  providers: [BookService, MemberService],
})
export class BookModule {}
