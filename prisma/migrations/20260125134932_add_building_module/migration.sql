-- CreateEnum
CREATE TYPE "building_status" AS ENUM ('STARTED', 'DONE');

-- CreateTable
CREATE TABLE "buildings" (
    "id" UUID NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "building_status" NOT NULL,
    "value" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expectedEndDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "completionPercentage" DOUBLE PRECISION NOT NULL,
    "company" TEXT NOT NULL,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);
