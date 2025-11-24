# FuelEU Maritime Compliance Platform

[![Architecture](https://img.shields.io/badge/Architecture-Hexagonal-purple)](./ARCHITECTURE.md)
[![Live](https://img.shields.io/badge/Live-Vercel-blue)](https://fuel-eu-maritime-henna.vercel.app/)

![Dashboard Screenshot](./docs/screenshot1.png)

## 🎯 Overview

This platform provides a comprehensive solution for monitoring and managing FuelEU Maritime compliance. It implements key regulations, including Articles 20 (Banking) and 21 (Pooling), to help shipping companies track their GHG intensity, manage compliance balances, and optimize their fleet's environmental performance.

The application is built with a strong focus on architectural excellence, clean code, and a user-friendly interface, designed to provide clear insights into complex regulatory data.

The project is deployed and can be seen live at [https://fuel-eu-maritime-henna.vercel.app/](https://fuel-eu-maritime-henna.vercel.app/). The backend and database are deployed on Render.

## 🏗️ Architecture

The system is designed following a **Hexagonal Architecture (Ports & Adapters)** pattern, ensuring a clear separation of concerns and making the core domain logic independent of external frameworks and technologies.

### Backend

The backend is a Node.js TypeScript application structured into:

- `core/`: Contains the pure domain logic, application services, and port interfaces.
- `adapters/`: Implements the ports, connecting the core to external services like HTTP (inbound) and PostgreSQL (outbound).
- `infrastructure/`: Handles database setup, migrations, and server configuration.

This structure promotes testability, maintainability, and allows for easy swapping of external dependencies without affecting the core business rules.

### Frontend

The frontend is a React TypeScript application built with Vite, also adhering to a hexagonal structure. It consumes the backend API and presents the compliance data through an intuitive dashboard.

**Visual Identity & Design System:**
The UI adopts a professional, maritime-themed aesthetic, utilizing an **Emerald Green** and **Teal** primary palette to evoke sustainability. Key design elements include:

- **Color Palette**: Primary (`#10b981` emerald-500), Secondary (`#14b8a6` teal-500), Accent (`#f59e0b` amber-500), with semantic colors for success, warning, and error states.
- **Typography**: `'Inter', sans-serif` for readability, `'JetBrains Mono', monospace` for data.
- **Layout**: A clear header, tab navigation for different sections (Routes, Compare, Banking, Pooling), and a dynamic main content area.
- **Components**: Custom-designed cards, tables, and interactive elements with micro-interactions for an engaging user experience.

For a detailed architectural breakdown, refer to [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🚀 Quick Start

To get the project up and running locally, follow these steps:

### Root Quick Start (recommended for reviewers)

If you want a single command to start both backend and frontend , use the root scripts. This repository includes a root `package.json` that runs both apps concurrently. You can also run the backend in a DB-less mock mode for reviewers who don't have PostgreSQL installed.

```bash
# Install dependencies for both packages
npm run install:all

# Start both backend and frontend together (default: backend uses PostgreSQL if configured)
npm run dev

# Start both, forcing backend to use in-memory mocks (no DB required)
USE_MOCKS=true npm run dev
```

Notes:

- `USE_MOCKS=true` tells the backend to use the in-memory test mocks included in the repo so reviewers can immediately see the UI and API responses without a database.
- If you prefer running services separately, see the per-directory instructions below.

### Prerequisites

- Node.js (v18 or higher)
- npm or Yarn
- PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/your-username/FuelEU-Maritime.git
cd FuelEU-Maritime
```

### 2. Backend Setup

```bash
cd backend
npm install
# Configure your PostgreSQL connection string in a .env file
#.env: DATABASE_URL="postgresql://user:password@host:port/database"
npm run migrate # Run database migrations
npm run seed # Seed initial data (e.g., 5 routes)
npm run dev 
```

The backend server will typically run on `http://localhost:3000`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev 
```

The frontend application will typically run on `http://localhost:5173`.

## ✅ How to Execute Tests

Comprehensive testing is a core part of this project, covering unit, integration, and end-to-end scenarios.

### Backend Tests

```bash
cd backend
npm test
```

This will run Jest tests for the backend, including unit tests for domain logic and integration tests for API endpoints.

### Frontend Tests

```bash
cd frontend
npm test
```

NOTE: test cases for Frontend are not implemented yet

## ✨ Highlights

- **FuelEU Compliance**: Implements critical FuelEU Maritime regulations, specifically Articles 20 (Banking) and 21 (Pooling).
- **Hexagonal Architecture**: A robust, maintainable, and testable architecture with a clear separation of concerns.
- **Type-Safe Development**: Built entirely with TypeScript for enhanced code quality and fewer runtime errors.
- **Comprehensive Testing**: High test coverage across both backend and frontend to ensure reliability.
- **Intuitive UI**: A modern, responsive dashboard designed for clarity and ease of use, featuring interactive charts and data visualizations.
- **API-First Design**: A well-defined API contract between frontend and backend.

## Screenshot and Sample Requests/Responses

### Compare page
![Dashboard Screenshot](./docs/screenshot2.png)

### Banking page

![Dashboard Screenshot](./docs/screenshot3.png)

### Sample API Request

```http
GET /api/routes
```

### Sample API Response

```json
[
  {
    "id": "123bbffb-f6d1-4468-adbd-f924dbe14556",
    "route_id": "route-004",
    "year": 2025,
    "ghg_intensity": "92.0",
    "is_baseline": false,
    "vessel_type": "RoRO",
    "fuel_type": "HFO",
    "fuel_consumption": "4900",
    "distance": "11800",
    "total_emissions": "4300"
  },
  {
    "id": "2df59d72-89fe-400b-ad33-6f475a676d1a",
    "route_id": "route-003",
    "year": 2025,
    "ghg_intensity": "85.0",
    "is_baseline": true,
    "vessel_type": "Tanker",
    "fuel_type": "MGO",
    "fuel_consumption": "5100",
    "distance": "12500",
    "total_emissions": "4700"
  },
  {
    "id": "37a1a939-1fd0-4f0a-b3d2-007a8d9012bc",
    "route_id": "route-005",
    "year": 2025,
    "ghg_intensity": "78.0",
    "is_baseline": false,
    "vessel_type": "Container",
    "fuel_type": "LNG",
    "fuel_consumption": "4950",
    "distance": "11900",
    "total_emissions": "4400"
  },
  {
    "id": "4f6fa22e-0202-43ad-95be-9cf54bedee59",
    "route_id": "route-001",
    "year": 2025,
    "ghg_intensity": "80.0",
    "is_baseline": false,
    "vessel_type": "Container",
    "fuel_type": "HFO",
    "fuel_consumption": "5000",
    "distance": "12000",
    "total_emissions": "4500"
  },
  {
    "id": "80b5d046-71ed-405e-962e-8ec4a785859b",
    "route_id": "route-002",
    "year": 2025,
    "ghg_intensity": "90.0",
    "is_baseline": false,
    "vessel_type": "BulkCarrier",
    "fuel_type": "LNG",
    "fuel_consumption": "4800",
    "distance": "11500",
    "total_emissions": "4200"
  }
]
```

## 📚 Further Documentation

- [AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md): Detailed log of AI agent interactions.
- [REFLECTION.md](./REFLECTION.md): A reflection on the development process, AI usage, and key learnings.
- [ARCHITECTURE.md](./ARCHITECTURE.md): In-depth explanation of the system's architecture.
