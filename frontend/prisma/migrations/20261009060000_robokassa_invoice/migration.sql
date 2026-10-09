-- AlterTable
CREATE SEQUENCE IF NOT EXISTS "Payment_invoiceNumber_seq";
ALTER TABLE "Payment" ADD COLUMN "invoiceNumber" INTEGER;
UPDATE "Payment" SET "invoiceNumber" = nextval('"Payment_invoiceNumber_seq"') WHERE "invoiceNumber" IS NULL;
ALTER TABLE "Payment" ALTER COLUMN "invoiceNumber" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "invoiceNumber" SET DEFAULT nextval('"Payment_invoiceNumber_seq"');
ALTER SEQUENCE "Payment_invoiceNumber_seq" OWNED BY "Payment"."invoiceNumber";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber");
