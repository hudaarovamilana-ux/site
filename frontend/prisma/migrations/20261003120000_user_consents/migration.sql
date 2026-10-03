-- AlterTable
ALTER TABLE "User" ADD COLUMN "consentPdAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "consentHealthAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "consentDocsVersion" TEXT;
