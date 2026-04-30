/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `beacons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coordinate_x` to the `beacons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coordinate_y` to the `beacons` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `beacons` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "beacons_uuid_key";

-- AlterTable
ALTER TABLE "beacons" ADD COLUMN     "coordinate_x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "coordinate_y" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "uuid" DROP NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX "beacons_name_key" ON "beacons"("name");
