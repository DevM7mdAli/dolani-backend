# Dolani Backend Agent Instructions (NestJS)

You are an Expert Backend Architect specializing in **NestJS**, **PostgreSQL**, and **Location-Based Services (LBS)**. You are building the **Backend Service Subsystem** for the "Dolani" Indoor Navigation System.

## 🏗️ Technical Architecture & Stack

- **Framework:** NestJS (Latest Stable) with TypeScript.
- **Database:** PostgreSQL.
- **ORM:** **Prisma** (Strictly enforced based on `src/prisma`).
- **Auth:** JWT (Access + Refresh Tokens) using Guards and Decorators.
- **Notifications:** Firebase Admin SDK (FCM).
- **Documentation:** OpenAPI (Swagger) is **MANDATORY**.

## 📂 Folder Structure Standards

Respect the existing structure and extend it for new domains:

```text
src/
├── auth/           # [EXISTING] JWT strategies, Guards, Decorators
├── users/          # [EXISTING] User management & Profile logic
├── prisma/         # [EXISTING] PrismaService & Schema
├── navigation/     # [NEW] Pathfinding (A*), Graphs, Location Nodes
├── beacons/        # [NEW] Signal processing, Hardware metadata
├── faculty/        # [NEW] Professor-specific logic (Office hours, Status)
├── notifications/  # [NEW] Firebase integration
└── app.* # Root module
```

## 💾 Database Schema (Strict Implementation)

Your Prisma schema must reflect these exact tables and relationships:

1. **`User`** (`users`)
   - `id` (Int, PK), `email`, `username`, `password_hash`, `name`, `phoneNumber`.
   - `role` (Enum: `ADMIN`, `FACULTY`).
   - `refresh_token` (Hashed).
2. **`Professor`** (`professors`)
   - `id` (Int, PK), `full_name`, `email`.
   - **Relations:**
     - `user` (One-to-One with `User` via `user_id`).
     - `department` (Many-to-One with `Department` via `department_id`).
     - `office` (One-to-One with `Location` via `location_id` - nullable).
     - `office_hours` (One-to-Many with `OfficeHours`).
3. **`OfficeHours`** (`office_hours`)
   - `id` (Int, PK), `day` (Enum: `SUNDAY`...`SATURDAY`), `start_time` (String HH:MM), `end_time`.
   - **Relation:** Belongs to `Professor`.
4. **`Building`** (`buildings`)
   - `id` (Int, PK), `name`, `code` (Unique).
5. **`Floor`** (`floors`)
   - `id` (Int, PK), `floor_number` (Int), `floor_plan_image_url`.
   - **Relation:** Belongs to `Building`.
6. **`Department`** (`departments`)
   - `id` (Int, PK), `name`, `type` (Enum: `CSD`, `CISD`, `CEE`, etc.).
   - **Relations:** Has many `Locations` and `Professors`.
7. **`Location`** (`locations`) - _Graph Node_
   - `id` (Int, PK), `type` (Enum: `CLASSROOM`, `OFFICE`, `CORRIDOR`, `EXIT`, `ELEVATOR`, etc.).
   - `name`, `room_number`.
   - `coordinate_x` (Float), `coordinate_y` (Float).
   - **Relations:** Belongs to `Floor` and `Department`. Has `incoming_paths` and `outgoing_paths`.
8. **`Path`** (`paths`) - _Graph Edge_
   - `id` (Int, PK), `distance` (Float - Weight for A\*).
   - **Relations:** `start_location` and `end_location`.
9. **`Beacon`** (`beacons`)
   - `id` (Int, PK), `uuid` (Unique), `name`, `operating` (Boolean).
   - **Relations:** Linked to `Location` and `Floor`.
10. **`RssiReading`** (`rssi_readings`)
    - `id` (Int, PK), `rssi` (Int), `timestamp`.
    - **Relation:** Belongs to `Beacon`. Used for signal analytics/calibration.

## 🧩 Core Business Logic

### 1. Navigation Module (`src/navigation`)

- **Graph Builder:** On startup, inject\*\* **`PrismaService` to load** **`Locations` and** \*\*`Paths` into an in-memory graph.
- **Algorithm:** Implement **A\* (A-Star)**.
- **Emergency Mode:** If triggered, exclude\*\* **`ELEVATOR` nodes and route strictly to** \*\*`EXIT` nodes.

### 2. Beacon Module (`src/beacons`)

- **Signal Logic:** Apply** \*\***Weighted Moving Average\*\* to RSSI inputs.
- **Resolution:** Resolve a Beacon UUID to a\*\* \*\*`Location` to determine the user's start node.

### 3. Faculty Module (`src/faculty`)

- **Portal:** Professors update\*\* **`office_hours` and** \*\*`status` (Available/Busy).
- **Seeding:** When seeding, create\*\* **`User` first, then** **`Professor` using** \*\*`connect: { id: user.id }`.

## 🛡️ Senior Coding Standards

1. **Strict Typing:** No\*\* **`any`. Use DTOs with** \*\*`class-validator` for all Controller inputs.
2. **Thin Controllers:** Logic goes in Services.
   - _Bad:_ `prisma.user.findMany()` in Controller.
   - _Good:_ `this.usersService.findAll()` in Controller.
3. **Global Filters:** Use\*\* \*\*`AllExceptionsFilter` to catch errors and return uniform JSON.
4. **Config:** Use\*\* \*\*`@nestjs/config` for secrets.
