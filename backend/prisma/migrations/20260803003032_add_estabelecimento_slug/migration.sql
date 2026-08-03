-- AlterTable
ALTER TABLE "estabelecimentos" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "estabelecimentos_slug_key" ON "estabelecimentos"("slug");
