# 📍 Dolani - Indoor Navigation Backend

> **Advanced Indoor Positioning & Navigation System for University Campuses**

**Dolani** is a robust backend service engineered with **NestJS** and **TypeScript** to power an indoor navigation solution for the CCSIT building. It leverages **BLE Beacons** for real-time positioning and implements the **A\* (A-Star)** algorithm for optimal pathfinding, guiding students and faculty to classrooms, offices, and facilities.

---

## 🚀 Key Features

- **Map Digitization**: Graph-based representation of buildings, floors, and rooms.
- **Pathfinding Engine**: A\* algorithm to calculate the shortest path between any two locations.
- **BLE Positioning**: Resolves user location via Bluetooth Low Energy (BLE) beacons and RSSI smoothing.
- **Faculty Portal**: Professors can manage office hours and update their availability status in real-time.
- **Admin Dashboard**: Full CRUD capabilities for managing building layouts, beacons, and users.
- **Secure Authentication**: Role-based access control (RBAC) using JWT access and refresh tokens.
- **API Documentation**: Interactive Swagger UI for all endpoints.

---

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11) - Progressive Node.js framework.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (v5.7) - Strictly typed JavaScript.
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Relational database system.
- **ORM**: [Prisma](https://www.prisma.io/) (v6) - Next-generation Node.js and TypeScript ORM.
- **Package Manager**: [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager.
- **Documentation**: [Swagger / OpenAPI](https://swagger.io/) - API description format.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18 or later)
- **pnpm** (v8 or later) - _Install via `npm i -g pnpm`_
- **PostgreSQL** (v14 or later) - Local or cloud instance.
- **Git**

---

## ⚙️ Installation & Setup

Follow these steps to get the project running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/DevM7mdAli/dolani-backend.git
cd dolani-backend
```

### 2. Install Dependencies

Using **pnpm** is recommended for faster installation.

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory by copying the example file.

```bash
cp .env.example .env
```

Open `.env` and configure your database connection string and secrets:

```dotenv
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/dolani_dev"
PORT=8000
JWT_SECRET="your-secure-random-string"
JWT_REFRESH_SECRET="your-secure-random-refresh-string"
```

### 4. Database Migration & Seeding

Ensure your PostgreSQL server is running and the database (e.g., `dolani_dev`) exists. Then, run the migrations to create the schema:

```bash
pnpm prisma migrate dev --name init
```

Populate the database with initial building data (CCSIT layout, rooms, users):

```bash
pnpm prisma db seed
```

---

## 🏃‍♂️ Running the Application

### Development Mode

Runs the application with hot-reload enabled.

```bash
pnpm start:dev
```

_Server will start at `http://localhost:8000`._

### Production Mode

Builds the project and runs the optimized production build.

```bash
pnpm build
pnpm start:prod
```

---

## 📚 API Documentation

Once the server is running, you can access the interactive **Swagger UI** to explore and test the API endpoints.

- **URL**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Format**: OpenAPI 3.0

### Core Endpoints Overview

| Module      | Method | Endpoint                    | Description                                  | Auth Required |
| :---------- | :----- | :-------------------------- | :------------------------------------------- | :------------ |
| **Auth**    | POST   | `/api/auth/login`           | User login (returns access + refresh tokens) | ❌ No         |
| **Nav**     | POST   | `/api/navigation/route`     | Calculate optimal path (A\*)                 | ❌ No         |
| **Nav**     | GET    | `/api/navigation/locations` | List all navigable locations                 | ❌ No         |
| **Beacons** | POST   | `/api/beacons/resolve`      | Resolve Beacon UUID to Location              | ❌ No         |
| **Faculty** | GET    | `/api/faculty`              | List professors & office hours               | ❌ No         |
| **Admin**   | POST   | `/api/admin/buildings`      | Create new building                          | ✅ Admin      |

---

## 🧪 Testing

Run the test suite to ensure system stability.

```bash
# Unit tests
pnpm test

# End-to-end tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

---

## 📂 Project Structure

```text
src/
├── admin/          # AC: Building, Floor, Dept management (Admin Only)
├── auth/           # Authentication strategies (JWT), Guards, Decorators
├── beacons/        # BLE signal processing & location resolution
├── common/         # Global filters, interceptors, and pipes
├── faculty/        # Professor profiles & office hours management
├── navigation/     # A* Pathfinding Engine & Graph Logic
├── navigation/dto/ # Standardized request objects (e.g., NavigateDto)
├── prisma/         # Database service & connection logic
├── users/          # User management layer
├── app.module.ts   # Root application module
└── main.ts         # Application entry point
```

---

## 🤝 Contribution

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/awesome-feature`.
3. Commit your changes: `git commit -m 'Add awesome feature'`.
4. Push to the branch: `git push origin feature/awesome-feature`.
5. Open a Pull Request.
