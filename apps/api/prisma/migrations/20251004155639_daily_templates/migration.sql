/*
  Warnings:

  - You are about to drop the `PointLedger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `points` on the `User` table. All the data in the column will be lost.
  - Added the required column `date` to the `Redemption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PointLedger_userId_at_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PointLedger";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Task";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskCompletion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Redemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Redemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Redemption" ("createdAt", "id", "rewardId", "userId") SELECT "createdAt", "id", "rewardId", "userId" FROM "Redemption";
DROP TABLE "Redemption";
ALTER TABLE "new_Redemption" RENAME TO "Redemption";
CREATE INDEX "Redemption_userId_date_idx" ON "Redemption"("userId", "date");
CREATE TABLE "new_Reward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reward" ("active", "cost", "createdAt", "id", "title", "updatedAt") SELECT "active", "cost", "createdAt", "id", "title", "updatedAt" FROM "Reward";
DROP TABLE "Reward";
ALTER TABLE "new_Reward" RENAME TO "Reward";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "updatedAt") SELECT "createdAt", "email", "id", "name", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TaskCompletion_userId_date_idx" ON "TaskCompletion"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletion_userId_templateId_date_key" ON "TaskCompletion"("userId", "templateId", "date");
