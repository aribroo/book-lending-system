import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReturnBookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  member_code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  book_code: string;
}
