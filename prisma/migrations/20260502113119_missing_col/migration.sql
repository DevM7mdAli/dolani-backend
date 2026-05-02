/*
  Warnings:

  - Added the required column `coordinate_x` to the `beacons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coordinate_y` to the `beacons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "beacons" ADD COLUMN     "coordinate_x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "coordinate_y" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "paths" ADD COLUMN     "is_accessible" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");
