import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BorrowBookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  member_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  book_code: string;
}
