# Dolani Backend Agent Instructions (NestJS)

You are an expert Backend Engineer specializing in NestJS, PostgreSQL, and Indoor Navigation algorithms. You are working on the **Backend Service Subsystem** for "Dolani".

## 🏗️ Project Architecture

- **Framework:** NestJS (v15/Latest) with TypeScript.
- **Database:** PostgreSQL.
- **ORM:** Drizzle ORM (preferred) or TypeORM.
- **Architecture Style:** Modular/Layered (Controllers -> Services -> Data Access).

## 💾 Database Schema (Strictly Follow This)

Reflect these specific tables and relationships in your Entities/DTOs:

1. **`User`**
   - `user_id` (PK), `email`, `password_hash`, `role` (Admin/Student/Faculty).
2. **`Professors`**
   - `professor_id` (PK), `full_name`, `email`, `office_hours`.
   - **FKs:** `user_id` (Link to User), `Location_id` (Office Loc), `Department_id`.
3. **`Building`**
   - `Building_id` (PK), `Name`, `Code` (e.g., "A11").
4. **`Floors`**
   - `Floor_id` (PK), `floor_number`, `floor_plan_image_url`.
   - **FKs:** `Building_id`.
5. **`Departments`**
   - `Department_id` (PK), `Name`.
   - **FKs:** `Location_id` (Main Office).
6. **`Location`** (The core node for navigation)
   - `Location_id` (PK), `Type` (Classroom/Office/Corridor), `Name`, `Room_number`, `Coordinates` (X,Y).
   - **FKs:** `Floor_id`, `Department_id`.
7. **`Beacons`**
   - `beacon_id` (PK), `uuid`, `name`.
   - **FKs:** `Location_id` (The physical location of this beacon).
8. **`Paths`** (Graph Edges)
   - `path_id` (PK), `distance` (Weight).
   - **FKs:** `start_location_id`, `end_location_id`.

## 🧩 Core Modules & Responsibilities

1. **Navigation Module:**
   - Use the `Paths` table to build a graph.
   - Implement **A\* (A-Star)** to find the shortest route between two `Location_id`s.
2. **Beacon Module:**
   - Process RSSI signals. Map a detected `beacon_id` to a `Location` to find the user's start point.
   - Apply **Weighted Moving Average** to smooth signal noise.
3. **User Module:**
   - Manage `User` and `Professors` entities.
   - Allow Faculty to update their `office_hours` in the `Professors` table.

## 🛡️ Coding Standards

- **Thin Controllers:** Keep controllers minimal; business logic belongs in Services.
- **Validation:** Use `class-validator` DTOs for _every_ input.
- **Response:** Return standardized JSON with HTTP codes (200, 201, 400, 404, 500).
