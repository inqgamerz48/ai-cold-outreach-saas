-- CreateTable
CREATE TABLE "Persona" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "linkedinUrl" TEXT,
    "email" TEXT,
    "location" TEXT,
    "source" TEXT NOT NULL DEFAULT 'GOOGLE_SERP',
    "jobId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Persona_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SearchJob" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
