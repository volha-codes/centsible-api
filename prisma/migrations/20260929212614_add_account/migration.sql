-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "startingBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
