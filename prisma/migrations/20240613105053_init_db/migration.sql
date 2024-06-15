-- CreateTable
CREATE TABLE "books" (
    "code" VARCHAR(100) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "author" VARCHAR(100) NOT NULL,
    "stock" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "members" (
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "penalty_end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "borrowed_books" (
    "id" SERIAL NOT NULL,
    "member_code" VARCHAR(100) NOT NULL,
    "book_code" VARCHAR(100) NOT NULL,
    "borrow_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_date" TIMESTAMP(3),

    CONSTRAINT "borrowed_books_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "borrowed_books" ADD CONSTRAINT "borrowed_books_book_code_fkey" FOREIGN KEY ("book_code") REFERENCES "books"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowed_books" ADD CONSTRAINT "borrowed_books_member_code_fkey" FOREIGN KEY ("member_code") REFERENCES "members"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
