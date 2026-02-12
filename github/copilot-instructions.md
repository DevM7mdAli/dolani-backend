# Dolani Backend Agent Instructions (NestJS + Prisma)

[cite_start]You are an expert Backend Engineer specializing in NestJS, PostgreSQL, and Indoor Navigation algorithms[cite: 1]. [cite_start]You are working on the **Backend Service Subsystem** for "Dolani," an indoor navigation system for the CCSIT building (A11)[cite: 2, 52, 175].

## 🏗️ Project Architecture

- [cite_start]**Framework:** NestJS (Latest) with TypeScript[cite: 2, 738].
- **Database:** PostgreSQL via **Prisma ORM** (evident from project structure).
- [cite_start]**Architecture:** Modular/Layered (Controllers -> Services -> Data Access)[cite: 3].
- [cite_start]**Standards:** Use `class-validator` for DTOs and return standardized JSON with appropriate HTTP codes[cite: 16, 17].

## 💾 Database Schema (Strictly Follow This)

[cite_start]Reflect these specific tables and relationships in your Prisma schema and service logic[cite: 4]:

1. [cite_start]**User**: `user_id` (PK), `email`, `password_hash`, `role` (Admin/Student/Faculty)[cite: 4].
2. **Professors**: `professor_id` (PK), `full_name`, `email`, `office_hours`. [cite_start]FKs: `user_id`, `Location_id`, `Department_id`[cite: 5].
3. [cite_start]**Building**: `Building_id` (PK), `Name`, `Code` (e.g., "A11")[cite: 6].
4. **Floors**: `Floor_id` (PK), `floor_number`, `floor_plan_image_url`. [cite_start]FK: `Building_id`[cite: 6, 7].
5. **Departments**: `Department_id` (PK), `Name`. [cite_start]FK: `Location_id`[cite: 7].
6. **Location**: `Location_id` (PK), `Type` (Classroom/Office/Corridor), `Name`, `Room_number`, `Coordinates` (X,Y). [cite_start]FKs: `Floor_id`, `Department_id`[cite: 8, 9].
7. **Beacons**: `beacon_id` (PK), `uuid`, `name`. [cite_start]FK: `Location_id`[cite: 9, 10].
8. **Paths**: `path_id` (PK), `distance` (Weight). [cite_start]FKs: `start_location_id`, `end_location_id`[cite: 10, 11].

## 🧩 Core Logic Requirements

1. [cite_start]**Navigation Module:** - Implement **A\* (A-Star)** to find the shortest route between two `Location_id`s using the `Paths` graph[cite: 12, 350].
2. [cite_start]**Beacon Module:** - Process RSSI signals from the mobile app[cite: 13, 811].
   - [cite_start]Apply a **Weighted Moving Average** filter to smooth signal noise before determining location[cite: 14, 576, 1025].
3. [cite_start]**Faculty Module:** - Allow Faculty to update `office_hours` and status[cite: 15, 664].
   - [cite_start]Manage real-time availability (Green/Red/Gray status)[cite: 850, 851, 852, 853].

## 🛡️ Important Constraints

- [cite_start]**Do not** hallucinate table names or relationships not listed in the schema[cite: 4].
- [cite_start]**Positioning:** Remember that positioning is BLE-based (local), not Wi-Fi based, to ensure stability[cite: 574, 575].
- [cite_start]**Security:** Use JWT for authentication and enforce role-based access control (RBAC)[cite: 610, 706].
