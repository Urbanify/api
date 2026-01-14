-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('RESIDENT', 'MANAGER', 'OWNER', 'ADMIN', 'FINANCIAL');

-- CreateEnum
CREATE TYPE "city_status" AS ENUM ('ACTIVE', 'OVERDUE', 'DISABLED', 'DELETED');

-- CreateEnum
CREATE TYPE "issue_status" AS ENUM ('WAITING_FOR_FISCAL', 'WAITING_FOR_PROCEDURE', 'WAITING_FOR_MANAGER', 'WAITING_FOR_MANAGER_RESOLUTION', 'WAITING_FOR_RESOLUTION_VALIDATION', 'SOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "issue_category" AS ENUM ('INFRASTRUCTURE', 'ENVIRONMENT', 'TRANSPORTATION', 'SAFETY', 'COMUNITY');

-- CreateEnum
CREATE TYPE "issue_type" AS ENUM ('ROAD_POTHOLE', 'DAMAGED_SIGNAGE', 'DAMAGED_SIDEWALK', 'STREETLIGHT_OUT', 'FALLEN_WIRES', 'WALL_RISK_OF_COLLAPSE', 'EROSION', 'ABANDONED_CONSTRUCTION', 'FALLEN_TREE', 'TREE_COLLAPSE_RISK', 'ILLEGAL_DEFORESTATION', 'GARBAGE_ACCUMULATION', 'ILLEGAL_WASTE_DISPOSAL', 'SEWAGE_LEAK', 'LACK_OF_SANITATION', 'DEAD_ANIMALS', 'FLOODING', 'DAMAGED_BUS_STOP', 'OBSTRUCTED_BIKE_LANE', 'ILLEGAL_PARKING', 'ABANDONED_VEHICLE', 'FADED_PEDESTRIAN_CROSSWALK', 'DARK_AREA', 'VANDALISM', 'GRAFFITI', 'STRUCTURAL_RISK', 'ILLEGAL_OCCUPATION', 'ILLEGAL_CONSTRUCTION');

-- CreateEnum
CREATE TYPE "IssueHistoryAction" AS ENUM ('REPORTED_ISSUE', 'ASSIGNED_AS_FISCAL', 'ASSIGNED_AS_MANAGER', 'MARKED_AS_UNFOUNDED', 'MARKED_AS_VALID', 'ADDED_RESOLUTION', 'MARKED_AS_SOLVED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cityId" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'RESIDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "status" "city_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_features" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "featureFlagId" UUID NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" UUID NOT NULL,
    "status" "issue_status" NOT NULL DEFAULT 'WAITING_FOR_FISCAL',
    "cityId" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "category" "issue_category" NOT NULL,
    "type" "issue_type" NOT NULL,
    "description" TEXT NOT NULL,
    "reporterId" UUID,
    "fiscalId" UUID,
    "managerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_history" (
    "id" UUID NOT NULL,
    "issueId" UUID NOT NULL,
    "userId" UUID,
    "userName" TEXT NOT NULL,
    "action" "IssueHistoryAction" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_photos" (
    "id" UUID NOT NULL,
    "issueId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "issueId" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "feature_flags_deleted_idx" ON "feature_flags"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "city_features_cityId_featureFlagId_key" ON "city_features"("cityId", "featureFlagId");

-- CreateIndex
CREATE INDEX "issues_cityId_idx" ON "issues"("cityId");

-- CreateIndex
CREATE INDEX "comments_cityId_idx" ON "comments"("cityId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- AddForeignKey
ALTER TABLE "city_features" ADD CONSTRAINT "city_features_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_features" ADD CONSTRAINT "city_features_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_fiscalId_fkey" FOREIGN KEY ("fiscalId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_history" ADD CONSTRAINT "issue_history_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_history" ADD CONSTRAINT "issue_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_photos" ADD CONSTRAINT "issue_photos_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
