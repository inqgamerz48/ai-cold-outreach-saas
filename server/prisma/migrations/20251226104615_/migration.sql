-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "description" TEXT,
    "rating" REAL,
    "reviewsCount" INTEGER,
    "gmapsUrl" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "jobId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SearchJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("address", "company", "createdAt", "description", "email", "gmapsUrl", "id", "instagram", "jobId", "linkedin", "name", "phone", "rating", "reviewsCount", "tenantId", "twitter", "updatedAt", "website") SELECT "address", "company", "createdAt", "description", "email", "gmapsUrl", "id", "instagram", "jobId", "linkedin", "name", "phone", "rating", "reviewsCount", "tenantId", "twitter", "updatedAt", "website" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_tenantId_idx" ON "Lead"("tenantId");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE TABLE "new_Persona" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "linkedinUrl" TEXT,
    "twitterHandle" TEXT,
    "redditUser" TEXT,
    "email" TEXT,
    "location" TEXT,
    "source" TEXT NOT NULL DEFAULT 'GOOGLE_SERP',
    "jobId" INTEGER NOT NULL,
    "leadId" INTEGER,
    "tenantId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Persona_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SearchJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Persona_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Persona" ("company", "createdAt", "email", "id", "jobId", "leadId", "linkedinUrl", "location", "name", "redditUser", "role", "source", "tenantId", "twitterHandle", "updatedAt") SELECT "company", "createdAt", "email", "id", "jobId", "leadId", "linkedinUrl", "location", "name", "redditUser", "role", "source", "tenantId", "twitterHandle", "updatedAt" FROM "Persona";
DROP TABLE "Persona";
ALTER TABLE "new_Persona" RENAME TO "Persona";
CREATE INDEX "Persona_tenantId_idx" ON "Persona"("tenantId");
CREATE INDEX "Persona_email_idx" ON "Persona"("email");
CREATE TABLE "new_SearchJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'GOOGLE_MAPS',
    "tenantId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SearchJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SearchJob" ("createdAt", "id", "source", "status", "tenantId", "term", "updatedAt") SELECT "createdAt", "id", "source", "status", "tenantId", "term", "updatedAt" FROM "SearchJob";
DROP TABLE "SearchJob";
ALTER TABLE "new_SearchJob" RENAME TO "SearchJob";
CREATE TABLE "new_Tenant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tenant" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
