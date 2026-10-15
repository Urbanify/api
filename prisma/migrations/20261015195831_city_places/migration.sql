-- CreateEnum
CREATE TYPE "place_category" AS ENUM ('HEALTH', 'EDUCATION', 'WASTE', 'TOURISM', 'SERVICES', 'LEISURE');

-- CreateTable
CREATE TABLE "city_places" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "place_category" NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "hours" TEXT,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_places_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "city_places_cityId_published_idx" ON "city_places"("cityId", "published");

-- AddForeignKey
ALTER TABLE "city_places" ADD CONSTRAINT "city_places_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
