-- CreateEnum
CREATE TYPE "crime_category" AS ENUM ('VIOLENCE', 'THEFT', 'VANDALISM', 'FRAUD', 'DRUGS', 'TRAFFIC');

-- CreateEnum
CREATE TYPE "crime_type" AS ENUM ('ASSAULT', 'ROBBERY', 'ARMED_ROBBERY', 'THREAT', 'BURGLARY', 'VEHICLE_THEFT', 'PICKPOCKET', 'VANDALISM_PROPERTY', 'GRAFFITI', 'PUBLIC_DAMAGE', 'SCAM', 'DOCUMENT_FRAUD', 'CARD_FRAUD', 'DRUG_TRAFFICKING', 'DRUG_USE', 'TRAFFIC_ACCIDENT', 'DUI', 'DANGEROUS_DRIVING');

-- CreateTable
CREATE TABLE "crimes" (
    "id" UUID NOT NULL,
    "category" "crime_category" NOT NULL,
    "type" "crime_type" NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crimes_pkey" PRIMARY KEY ("id")
);
