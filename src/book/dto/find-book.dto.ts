export class FindBookDto {
  code: string;
  title: string;
  author: string;
  stock: number;
  created_at?: Date;
  updated_at?: Date;
}
