-- CreateTable
CREATE TABLE "AiAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT,
    "priority" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "raw" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "aiAssigned" BOOLEAN NOT NULL DEFAULT false,
    "aiSuggestion" TEXT,
    "aiConfidence" REAL,
    "aiResponse" TEXT,
    "aiEvaluatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Task" ("completed", "createdAt", "description", "id", "priority", "title", "updatedAt") SELECT "completed", "createdAt", "description", "id", "priority", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
