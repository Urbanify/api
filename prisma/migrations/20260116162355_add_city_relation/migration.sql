/*
  Warnings:

  - The `cityId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `cityId` on the `issues` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "comments_authorId_idx";

-- DropIndex
DROP INDEX "comments_cityId_idx";

-- DropIndex
DROP INDEX "issues_cityId_idx";

-- AlterTable
ALTER TABLE "issues" DROP COLUMN "cityId",
ADD COLUMN     "cityId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "cityId",
ADD COLUMN     "cityId" UUID;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
