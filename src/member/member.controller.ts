import { ApiCreateMemberResponse } from '../common/swagger/swagger.decorator';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebResponse } from '../common/util/response';
import { FindMemberDto } from './dto/find-member.dto';
import { MemberService } from './member.service';

@ApiTags('Member')
@Controller('/api/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @ApiOperation({ summary: 'Create new member' })
  @ApiCreateMemberResponse()
  async createMember(
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<WebResponse<CreateMemberDto>> {
    const member = await this.memberService.create(createMemberDto);
    return new WebResponse<CreateMemberDto>(member);
  }

  @Get()
  @ApiOperation({ summary: 'Get all member' })
  async getAllMember(): Promise<WebResponse<FindMemberDto[]>> {
    const members = await this.memberService.findAll();
    return new WebResponse<FindMemberDto[]>(members);
  }

  @Get('current-borrowed-books')
  @ApiOperation({ summary: 'Get all member with borrowed books' })
  async getAllMemberWithCurrentBorrowedBooks(): Promise<
    WebResponse<FindMemberDto[]>
  > {
    const members =
      await this.memberService.findMembersWithCurrentBorrowedBooks();
    return new WebResponse<FindMemberDto[]>(members);
  }
}
