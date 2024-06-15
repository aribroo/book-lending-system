export class FindBorrowedBookDto {
  id: number;
  member_code: string;
  book_code: string;
  borrow_date?: Date;
  return_date?: Date;
}
