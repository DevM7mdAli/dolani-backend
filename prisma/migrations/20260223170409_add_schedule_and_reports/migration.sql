-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FACULTY', 'IT', 'SECURITY');

-- CreateEnum
CREATE TYPE "DeptType" AS ENUM ('CSD', 'CISD', 'CEE', 'CNCO', 'LABS1', 'LABS2', 'LABS3', 'LABS4', 'ADMINISTRATION', 'STUDENT_AFFAIRS', 'GENERAL');

-- CreateEnum
CREATE TYPE "Equipment" AS ENUM ('PROJECTOR', 'WHITEBOARD', 'COMPUTER', 'SMART_BOARD', 'PRINTER', 'PLUG', 'CHAIRS', 'ERASER', 'AC', 'LIGHT', 'DOOR');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('CLASSROOM', 'OFFICE', 'CORRIDOR', 'LAB', 'THEATER', 'CONFERENCE', 'EXIT', 'ELEVATOR', 'MAIN_HALL', 'RESTROOM', 'STAIRS', 'SERVICE', 'PRAYER_ROOM', 'SERVER_ROOM', 'STORE_ROOM', 'LOCKERS', 'CAFETERIA', 'WAITING_HALL', 'ELECTRICAL_ROOM');

-- CreateEnum
CREATE TYPE "ProfessorStatus" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('PROJECTOR', 'SMART_BOARD', 'COMPUTER', 'PRINTER', 'AC', 'LIGHT', 'DOOR', 'PLUG', 'CLEANLINESS', 'SAFETY', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "role" "Role" NOT NULL DEFAULT 'FACULTY',
    "refresh_token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" SERIAL NOT NULL,
    "floor_number" INTEGER NOT NULL,
    "floor_plan_image_url" TEXT,
    "building_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DeptType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "type" "LocationType" NOT NULL,
    "name" TEXT NOT NULL,
    "room_number" TEXT,
    "near" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "equipment" "Equipment"[],
    "coordinate_x" DOUBLE PRECISION NOT NULL,
    "coordinate_y" DOUBLE PRECISION NOT NULL,
    "floor_id" INTEGER NOT NULL,
    "department_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paths" (
    "id" SERIAL NOT NULL,
    "start_location_id" INTEGER NOT NULL,
    "end_location_id" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beacons" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "operating" BOOLEAN NOT NULL DEFAULT true,
    "signal_count" INTEGER NOT NULL DEFAULT 0,
    "location_id" INTEGER NOT NULL,
    "floor_id" INTEGER NOT NULL,
    "department_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beacons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rssi_readings" (
    "id" SERIAL NOT NULL,
    "beacon_id" INTEGER NOT NULL,
    "rssi" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rssi_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professors" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "ProfessorStatus" NOT NULL DEFAULT 'AVAILABLE',
    "phone_number" TEXT,
    "show_phone" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "location_id" INTEGER,
    "department_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_hours" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_slots" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "course_code" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "course_name_ar" TEXT,
    "day" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "student_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "room" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "professor_id" INTEGER NOT NULL,
    "resolved_by_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IT" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Security" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Security_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_name_key" ON "buildings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_code_key" ON "buildings"("code");

-- CreateIndex
CREATE UNIQUE INDEX "floors_building_id_floor_number_key" ON "floors"("building_id", "floor_number");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "locations_floor_id_room_number_key" ON "locations"("floor_id", "room_number");

-- CreateIndex
CREATE UNIQUE INDEX "paths_start_location_id_end_location_id_key" ON "paths"("start_location_id", "end_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "beacons_uuid_key" ON "beacons"("uuid");

-- CreateIndex
CREATE INDEX "rssi_readings_beacon_id_timestamp_idx" ON "rssi_readings"("beacon_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "professors_email_key" ON "professors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professors_user_id_key" ON "professors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "office_hours_professor_id_day_key" ON "office_hours"("professor_id", "day");

-- CreateIndex
CREATE UNIQUE INDEX "IT_user_id_key" ON "IT"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Security_user_id_key" ON "Security"("user_id");

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paths" ADD CONSTRAINT "paths_start_location_id_fkey" FOREIGN KEY ("start_location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paths" ADD CONSTRAINT "paths_end_location_id_fkey" FOREIGN KEY ("end_location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beacons" ADD CONSTRAINT "beacons_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beacons" ADD CONSTRAINT "beacons_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beacons" ADD CONSTRAINT "beacons_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rssi_readings" ADD CONSTRAINT "rssi_readings_beacon_id_fkey" FOREIGN KEY ("beacon_id") REFERENCES "beacons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_hours" ADD CONSTRAINT "office_hours_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_slots" ADD CONSTRAINT "teaching_slots_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "IT"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IT" ADD CONSTRAINT "IT_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Security" ADD CONSTRAINT "Security_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
