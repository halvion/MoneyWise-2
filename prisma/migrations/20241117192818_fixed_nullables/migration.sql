/*
  Warnings:

  - The primary key for the `MonthHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `YearHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `userId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonthHistory" (
    "userId" TEXT NOT NULL,
    "familyId" TEXT,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" REAL NOT NULL,
    "expense" REAL NOT NULL,

    PRIMARY KEY ("userId", "day", "month", "year")
);
INSERT INTO "new_MonthHistory" ("day", "expense", "familyId", "income", "month", "userId", "year") SELECT "day", "expense", "familyId", "income", "month", "userId", "year" FROM "MonthHistory";
DROP TABLE "MonthHistory";
ALTER TABLE "new_MonthHistory" RENAME TO "MonthHistory";
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'income',
    "isIndividual" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL,
    "categoryIcon" TEXT NOT NULL
);
INSERT INTO "new_Transaction" ("amount", "category", "categoryIcon", "createdAt", "date", "description", "familyId", "id", "isIndividual", "type", "updatedAt", "userId") SELECT "amount", "category", "categoryIcon", "createdAt", "date", "description", "familyId", "id", "isIndividual", "type", "updatedAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_userId_familyId_idx" ON "Transaction"("userId", "familyId");
CREATE TABLE "new_YearHistory" (
    "userId" TEXT NOT NULL,
    "familyId" TEXT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" REAL NOT NULL,
    "expense" REAL NOT NULL,

    PRIMARY KEY ("userId", "month", "year")
);
INSERT INTO "new_YearHistory" ("expense", "familyId", "income", "month", "userId", "year") SELECT "expense", "familyId", "income", "month", "userId", "year" FROM "YearHistory";
DROP TABLE "YearHistory";
ALTER TABLE "new_YearHistory" RENAME TO "YearHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
