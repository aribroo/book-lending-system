/*
  Warnings:

  - A unique constraint covering the columns `[book_code,return_date]` on the table `borrowed_books` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "borrowed_books_book_code_return_date_key" ON "borrowed_books"("book_code", "return_date");
