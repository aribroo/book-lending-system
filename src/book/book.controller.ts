import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { WebResponse } from '../common/util/response';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { FindBookDto } from './dto/find-book.dto';
import { BookService } from './book.service';

@ApiTags('Book')
@Controller('/api/books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: 'Create new book' })
  async createBook(
    @Body() createBookDto: CreateBookDto,
  ): Promise<WebResponse<CreateBookDto>> {
    const book = await this.bookService.create(createBookDto);
    return new WebResponse<CreateBookDto>(book);
  }
  
  @Get()
  @ApiOperation({ summary: 'Get all book' })
  async getAllBook(): Promise<WebResponse<FindBookDto[]>> {
    const books = await this.bookService.findAll();
    return new WebResponse<FindBookDto[]>(books);
  }

  @Post('borrow')
  @ApiOperation({ summary: 'Borrow a book' })
  async borrowBook(
    @Body() borrowBookDto: BorrowBookDto,
  ): Promise<WebResponse<BorrowBookDto>> {
    const borrowBook = await this.bookService.borrowBook(borrowBookDto);
    return new WebResponse<BorrowBookDto>(borrowBook);
  }

  @Post('return')
  @ApiOperation({ summary: 'Return a borrowed book' })
  async returnBorrowedBook(
    @Body() returnBookDto: ReturnBookDto,
  ): Promise<WebResponse<ReturnBookDto>> {
    const returnBook = await this.bookService.returnBorrowedBook(returnBookDto);
    return new WebResponse<ReturnBookDto>(returnBook);
  }
}
