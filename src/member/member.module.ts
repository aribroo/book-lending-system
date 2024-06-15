import { DatabaseModule } from '../common/database/database.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  providers: [MemberService],
  controllers: [MemberController],
})
export class MemberModule {}
