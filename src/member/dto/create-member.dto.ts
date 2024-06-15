import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
