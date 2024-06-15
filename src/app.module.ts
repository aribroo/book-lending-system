import { DatabaseModule } from './common/database/database.module';
import { MemberModule } from './member/member.module';
import { BookModule } from './book/book.module';
import { ConfigModule } from '@nestjs/config';
import Configs from './common/config/index';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Configs,
    }),
    DatabaseModule,
    MemberModule,
    BookModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
