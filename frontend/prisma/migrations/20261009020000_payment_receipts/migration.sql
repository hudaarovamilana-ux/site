-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "receiptUuid" TEXT;
ALTER TABLE "Payment" ADD COLUMN "receiptUrl" TEXT;
ALTER TABLE "Payment" ADD COLUMN "receiptClaimedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN "receiptEmailSentAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN "receiptError" TEXT;
