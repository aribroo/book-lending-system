import { ApiResponse } from '@nestjs/swagger';
import { CreateMemberDto } from '../../member/dto/create-member.dto';

export const ApiCreateMemberResponse = () =>
  ApiResponse({
    status: 201,
    description: 'The member has been successfully created.',
    type: CreateMemberDto,
    schema: {
      examples: {
        success: {
          summary: 'Successful response',
          value: {
            code: 'M008',
            name: 'Rifki Ari',
          },
        },
      },
    },
  });
