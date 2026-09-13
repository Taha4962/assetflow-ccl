# AssetFlow — Departmental Asset Management System

**Organization**: Central Coalfields Limited (CCL), Government of India
**Department**: Systems Department (ERP)
**Type**: Enterprise Web Application

AssetFlow is an enterprise-grade Departmental Asset Management System designed for Central Coalfields Limited. It manages the complete lifecycle of every organizational asset — from purchase request to final disposal — with strict Role-Based Access Control (RBAC), Department Data Isolation, and a clean Layered Software Architecture.

The core design principle is that **every department manages its own assets independently**. No department can access another department's data.

---

## Tech Stack

### Frontend
- **React.js 18** + **Vite** — Fast SPA framework
- **Tailwind CSS** — Utility-first styling with glassmorphism design
- **Recharts** — Interactive dashboard charts and visualizations
- **React Router DOM v6** — Client-side routing with protected routes
- **Axios** — HTTP client with JWT interceptor
- **React QR Code** — QR code rendering and display
- **date-fns** — Date formatting and calculation
- **Sonner** — Toast notifications
- **Lucide React** — Icon library
- **clsx + tailwind-merge** — Conditional class utilities

### Backend
- **Node.js + Express.js** — REST API server
- **Prisma ORM** — Database access with type-safe queries
- **PostgreSQL** — Relational database
- **JWT (jsonwebtoken)** — Token-based authentication
- **bcryptjs** — Password hashing
- **Zod** — Request validation schemas
- **Helmet** — HTTP security headers
- **CORS** — Cross-origin resource sharing
- **Morgan** — HTTP request logging
- **express-async-errors** — Async error handling

---

## Architecture

AssetFlow follows a **Client-Server Architecture** with a **Layered Backend**.

```
FRONTEND (React.js)
      │
      │  REST API (JSON)
      ▼
BACKEND (Node.js + Express.js)
  ├── Routes Layer         — API endpoint definitions
  ├── Controller Layer     — Request and response handling
  ├── Service Layer        — Business logic and rules
  └── Repository Layer     — All database queries (Prisma)
      │
      ▼
DATABASE (PostgreSQL via Prisma)
```

**No Prisma queries exist outside the Repository layer.**
**No business logic exists inside the Repository layer.**

---

## Database Schema

The database contains **12 models** and **5 enums**.

### Models
| Model | Purpose |
|-------|---------|
| Department | CCL departments (Systems, HR, Finance, etc.) |
| User | All system users across all roles |
| AssetCategory | Asset categories (IT Equipment, Furniture, etc.) |
| Asset | Every physical asset in the organization |
| AssetRequest | Purchase requests raised by Department Managers |
| PurchaseDetail | Financial details entered by Purchase Person |
| AssetAssignment | Employee assignment history for every asset |
| RepairRequest | Maintenance and repair tickets |
| DisposalRecord | End-of-life asset disposal records |
| AuditLog | Immutable action log for every system event |
| StockInventory | Purchase Person warehouse stock register |
| DepartmentBudget | Monthly budget allocation per department |

### Enums
| Enum | Values |
|------|--------|
| Role | super_admin, department_manager, purchase_person, maintenance_person, employee |
| AssetStatus | requested, purchased, delivered, unassigned, active, under_maintenance, disposed |
| RequestStatus | pending, awaiting_approval, approved, rejected, fulfilled_from_stock, purchased, delivered |
| RepairStatus | pending, in_progress, resolved |
| Urgency | low, medium, high |

---

## User Roles

### Super Admin
- Adds, removes, and assigns roles to all users
- Views all departments and their complete asset inventory
- Sets and monitors monthly budget for every department
- Views complete warehouse stock inventory (read-only)
- Views assets organized by category with expandable details
- Monitors all system activity through audit logs

### Department Manager
- Raises asset purchase requests with reason and quantity
- Reviews cost estimates from Purchase Person and approves or rejects
- Enters complete technical details of assets after delivery
- Assigns assets to employees within their department
- Reassigns assets when an employee exits
- Monitors all repair requests in their department
- Marks assets as disposed with reason and date
- Views department budget utilization

### Purchase Person
- Views and processes asset purchase requests
- Manually calculates and enters estimated cost for each request
- Manages warehouse stock register (add, update quantities)
- Fulfils approved requests from existing stock or purchases externally
- Enters complete financial details (vendor, invoice, pricing)
- Confirms delivery and marks assets as delivered

### Maintenance Person
- Receives repair requests directly from employees
- Updates repair status: Pending → In Progress → Resolved
- Adds resolution notes for every completed repair
- Views all requests relevant to their maintenance category

### Employee
- Views all assets currently assigned to them
- Scans QR code on any physical asset to view complete details
- Raises repair requests for their assigned assets
- Tracks status of their submitted repair requests

---

## Asset Lifecycle

Every asset follows this exact lifecycle without exception:

```
Department Manager raises request
          │
          ▼
Purchase Person reviews and enters estimated cost
          │
          ▼
Department Manager reviews cost and decides:
    ├── APPROVE → Purchase Person proceeds
    ├── EDIT    → Returns for new costing
    └── REJECT  → Request permanently closed
          │
          ▼
Purchase Person fulfils:
    ├── From warehouse stock
    └── External purchase
          │
          ▼
Purchase Person marks as DELIVERED
          │
          ▼
Department Manager enters technical details
Asset status → UNASSIGNED
          │
          ▼
Department Manager assigns to employee
Asset status → ACTIVE
QR Code auto-generated
          │
          ▼
Employee raises repair request if needed
Asset status → UNDER MAINTENANCE → ACTIVE
          │
          ▼
Department Manager marks disposal
Asset status → DISPOSED (preserved in history)
```

---

## Folder Structure

```
asset-flow/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── RoleGuard.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ErrorMessage.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   └── ui/
│   │   │       ├── Modal.jsx
│   │   │       ├── Badge.jsx
│   │   │       └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UserManagementPage.jsx
│   │   │   │   ├── DepartmentManagementPage.jsx
│   │   │   │   ├── DepartmentDetailPage.jsx
│   │   │   │   ├── CategoryManagementPage.jsx
│   │   │   │   └── BudgetManagementPage.jsx
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── manager/
│   │   │   │   ├── ManagerDashboard.jsx
│   │   │   │   ├── AssetRequestsPage.jsx
│   │   │   │   ├── ManagerAssetsPage.jsx
│   │   │   │   ├── AssetDetailPage.jsx
│   │   │   │   ├── AssignAssetPage.jsx
│   │   │   │   ├── CompleteAssetDetailsPage.jsx
│   │   │   │   └── QRPrintPage.jsx
│   │   │   ├── purchase/
│   │   │   │   ├── PurchaseDashboard.jsx
│   │   │   │   ├── PurchaseRequestsPage.jsx
│   │   │   │   ├── PurchaseAssetsPage.jsx
│   │   │   │   ├── RegisterAssetPage.jsx
│   │   │   │   └── StockManagementPage.jsx
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeAssetsPage.jsx
│   │   │   │   └── EmployeeRepairsPage.jsx
│   │   │   ├── maintenance/
│   │   │   │   └── MaintenanceRequestsPage.jsx
│   │   │   ├── shared/
│   │   │   │   ├── EmployeeDashboard.jsx
│   │   │   │   ├── MaintenanceDashboard.jsx
│   │   │   │   └── NotFoundPage.jsx
│   │   │   └── AssetScanPage.jsx
|   |   │   └── pageImports.js
│   │   ├── routes/
│   |   |   ├── ProtectedRoleRoute.jsx
│   |   |   └── routeConfig.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── deptService.js
│   │   │   ├── categoryService.js
│   │   │   ├── requestService.js
│   │   │   ├── assetService.js
│   │   │   ├── budgetService.js
│   │   │   ├── dashboardService.js
│   │   │   ├── repairService.js
│   │   │   └── stockService.js
│   │   └── utils/
│   │       ├── formatters.js
│   │       └── constants.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── department.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── request.controller.js
│   │   │   ├── asset.controller.js
│   │   │   ├── budget.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── employee.controller.js
│   │   │   ├── repair.controller.js
│   │   │   └── stock.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── department.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── repositories/
│   │   │   ├── user.repository.js
│   │   │   ├── department.repository.js
│   │   │   ├── category.repository.js
│   │   │   ├── request.repository.js
│   │   │   ├── asset.repository.js
│   │   │   ├── assignment.repository.js
│   │   │   ├── audit.repository.js
│   │   │   ├── budget.repository.js
│   │   │   ├── dashboard.repository.js
│   │   │   ├── disposal.repository.js
│   │   │   ├── repair.repository.js
│   │   │   └── stock.repository.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── department.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── request.routes.js
│   │   │   ├── asset.routes.js
│   │   │   ├── budget.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── employee.routes.js
│   │   │   ├── repair.routes.js
│   │   │   └── stock.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── department.service.js
│   │   │   ├── category.service.js
│   │   │   ├── request.service.js
│   │   │   ├── asset.service.js
│   │   │   ├── assignment.service.js
│   │   │   ├── budget.service.js
│   │   │   ├── dashboard.service.js
│   │   │   ├── disposal.service.js
│   │   │   ├── qr.service.js
│   │   │   ├── repair.service.js
│   │   │   └── stock.service.js
│   │   └── utils/
│   │       ├── prismaClient.js
│   │       ├── jwt.js
│   │       ├── zodSchemas.js
│   │       ├── responseHandler.js
│   │       └── logger.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Setup and Running Locally

### Prerequisites
- Node.js v18 or above
- PostgreSQL database (local or Neon cloud)
- npm

### 1. Clone and navigate
```bash
cd asset-flow
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Update DATABASE_URL in .env with your PostgreSQL connection string
# For Neon: postgresql://user:password@host/dbname?sslmode=require

# Push database schema
npx prisma db push

# Seed initial data
npm run seed

# Start development server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/assetflow"
JWT_SECRET="your-secure-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

For Neon PostgreSQL, add `?sslmode=require` to the DATABASE_URL.

---

---

## Key Features

### Authentication and Security
- JWT token-based authentication with role detection
- Role-based routing and redirection after login
- Department-level data isolation enforced at backend
- bcrypt password hashing
- Helmet security headers on all responses

### Super Admin
- Complete user management with CRUD and soft delete
- Department and category management
- Monthly budget setting and monitoring for all departments
- Read-only warehouse stock visibility
- Assets by category with expandable detail view
- Department detail view with staff, assets, budget, and activity tabs

### Department Manager
- Asset purchase request workflow
- Review cost estimates from Purchase Person
- Approve, edit and resubmit, or reject requests
- Two-step asset registration (financial then technical)
- Asset assignment and reassignment with full history
- QR code generation and print page
- Asset detail page with 5 tabs: Details, Purchase Info, Assignments, Repairs, Audit Trail
- Repair request monitoring
- Asset disposal with reason and history

### Purchase Person
- Manual cost estimation and submission to Department Manager
- Warehouse stock management (add, update, view)
- Fulfil approved requests from stock or external purchase
- Complete financial detail entry (vendor, invoice, pricing)
- Delivery confirmation workflow

### Maintenance Person
- Repair request queue filtered by category
- Status update workflow: Pending → In Progress → Resolved
- Resolution notes per ticket

### Employee
- Personal asset dashboard
- QR code scanning for any physical asset
- Repair request submission with urgency level
- Repair request status tracking

### QR Code System
- Auto-generated on asset assignment
- Contains unique asset URL
- Requires authenticated login to view full details
- Print-friendly label with Asset Code, Name, Department
- Works on any mobile device with camera

### Budget Management
- Monthly budget allocation per department by Super Admin
- Real-time utilization tracking
- Budget warning shown to manager during approval
- Complete budget history preserved per month
- Manager sees remaining budget when reviewing costs

### Stock and Warehouse
- Purchase Person maintains digital stock register
- Quantity delta updates with reason tracking
- Low stock alerts at quantity below 5
- Out of stock indicators
- Stock fulfils approved requests automatically with quantity deduction
- Super Admin read-only view of complete warehouse

### Audit Trail
- Every important action logged automatically
- Immutable records — never edited or deleted
- Viewable per asset in Asset Detail page
- Includes: who, what action, when, description

---

## API Response Format

All API responses follow a consistent format:

```json
// Success
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}

// Error
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## Security Architecture

| Security Layer | Implementation |
|---------------|----------------|
| Authentication | JWT token verified on every protected route |
| Authorization | Role middleware checks permissions per endpoint |
| Department Isolation | Middleware prevents cross-department data access |
| Password Security | bcrypt with 10 rounds |
| Input Validation | Zod schemas on all POST and PUT requests |
| HTTP Security | Helmet middleware on all responses |
| Error Handling | Centralized error middleware with no stack trace leak |

---

## Project Context

This system was designed and built as an Industrial Training Project at Central Coalfields Limited (CCL), a Government of India PSU under Coal India Limited, during the training period August–September 2026 in the Systems Department (ERP).

The core requirement from the mentor was that every department manages its own assets independently. This principle is enforced throughout the system at both the backend middleware level and the frontend routing level.