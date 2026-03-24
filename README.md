PBIS — Product-Based Inventory System

Complete Technical Documentation

---

Table of Contents

1. Project Overview
2. Description
3. Features
4. Technology Stack
5. Architecture Overview
6. Project Structure
7. Installation Guide
8. Environment Variables
9. Usage Instructions
10. API Endpoints
11. Database Design
12. Background Jobs
13. Deployment Guide
14. Contributing Guidelines
15. License
16. Troubleshooting

---

1. Project Overview

Project Name: PBIS — Product-Based Inventory System Project Type: Full-Stack Web Application Purpose: Multi-location inventory management system for structured inventory counts, stock level tracking, order recommendations, and comprehensive reporting. Target Users: Multi-location businesses requiring professional inventory management with role-based access control.

---

2. Description

PBIS solves the problem of manual, error-prone inventory counting across multiple store or warehouse locations. The system provides a structured workflow where staff submit count sheets per location and inventory list (frequency), and the application automatically calculates order quantities based on par levels and pack sizes.

Key Capabilities:

- Managers and admins can review reports
- Export data to CSV format
- Print count sheets
- Manage complete product catalog
- Manage vendors, brands, and users

Technical Architecture:

| Component          | Technology                               |
| ------------------ | ---------------------------------------- |
| Backend            | Django REST API                          |
| Frontend           | React Single Page Application (SPA)      |
| Production Serving | Django serves React build via WhiteNoise |

---

3. Features

3.1 Authentication & Authorization

| Feature                   | Description                                      |
| ------------------------- | ------------------------------------------------ |
| JWT-based Authentication  | Secure token-based authentication                |
| Automatic Token Refresh   | Seamless session management                      |
| Role-based Access Control | Three distinct user roles: Admin, Manager, Staff |

3.2 Inventory Management

| Feature                       | Description                                        |
| ----------------------------- | -------------------------------------------------- |
| Multi-location Support        | Manage inventory across multiple stores/warehouses |
| Inventory Lists (Frequencies) | Per-location scheduling (Daily, Weekly, etc.)      |
| Count Sheets                  | Draft → Submitted workflow                         |
| Automatic Order Calculation   | Based on par level, order point, and pack size     |

3.3 Visual Indicators

| State        | Color  | Condition                     |
| ------------ | ------ | ----------------------------- |
| Order Needed | Red    | Stock at or below order point |
| OK           | Yellow | Below par, above order point  |
| Over Par     | Green  | Stock exceeds par level       |

3.4 Reporting & Data Management

| Feature           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| Report Generation | Comprehensive inventory reports                        |
| CSV Export        | Export data for external analysis                      |
| Print View        | Formatted printable count sheets                       |
| Soft Delete       | Full audit trail with created/updated/deleted tracking |

3.5 User Interface

| Feature                   | Description                                 |
| ------------------------- | ------------------------------------------- |
| Vendor & Brand Management | Color-coded display for easy identification |
| Paginated Endpoints       | Efficient data loading                      |
| Filterable & Searchable   | Quick data location                         |
| Persistent State          | Redux state survives page refresh           |
| Responsive Design         | Works on desktop, tablet, and mobile        |
| Smooth Animations         | Framer Motion integration                   |

---

4. Technology Stack

4.1 Backend Technologies

| Layer                  | Technology                        | Version   |
| ---------------------- | --------------------------------- | --------- |
| Backend Framework      | Django                            | 5.2       |
| REST Framework         | Django REST Framework             | 3.15      |
| Authentication         | djangorestframework-simplejwt     | JWT-based |
| Token Lifetime         | Access: 5 hours / Refresh: 7 days | —         |
| Database               | PostgreSQL                        | 14+       |
| Database Adapter       | psycopg2-binary                   | —         |
| Database Configuration | dj-database-url                   | —         |
| Static Files (Prod)    | WhiteNoise                        | —         |
| CORS Handling          | django-cors-headers               | —         |
| Data Export            | pandas, openpyxl                  | —         |
| Production Server      | Gunicorn + WSGI                   | —         |
| Package Manager        | Poetry                            | —         |

4.2 Frontend Technologies

| Layer              | Technology       | Version |
| ------------------ | ---------------- | ------- |
| Frontend Framework | React            | 19      |
| Build Tool         | Vite             | 7       |
| State Management   | Redux Toolkit    | 2       |
| State Persistence  | redux-persist    | —       |
| UI Components      | Material UI      | 7       |
| Styling            | Tailwind CSS     | 4       |
| Icons              | Lucide React     | —       |
| Animations         | Framer Motion    | 12      |
| HTTP Client        | Axios            | 1.x     |
| Routing            | React Router DOM | 7       |
| Package Manager    | npm              | —       |

---

5. Architecture Overview

System Architecture Diagram

```
BROWSER
React SPA (Vite / Redux / MUI)
|
HTTP (Axios + JWT Bearer)
|
Django (Gunicorn / WSGI)
├─ users, inventory, counts
├─ locations, frequency, reports
├─ vendor, brand
Django REST Framework + SimpleJWT + WhiteNoise
|
PostgreSQL
```

Production Architecture

| Aspect              | Description                                       |
| ------------------- | ------------------------------------------------- |
| Static File Serving | Django serves compiled React build via WhiteNoise |
| Client-side Routing | Non-API routes fall through to index.html         |
| Build Output        | frontend/dist directory                           |

Development Architecture

| Aspect          | Description                          |
| --------------- | ------------------------------------ |
| Frontend Server | Vite on port 5000                    |
| Backend Server  | Django on port 8000                  |
| API Proxy       | Vite proxies /api requests to Django |

---

6. Project Structure

PBIS/ (Django project config) ├─ PBIS/ (Settings, URLs, WSGI, ASGI) ├─ brand/ ├─ counts/ ├─ frequency/ ├─ inventory/ ├─ locations/ ├─ reports/ ├─ users/ ├─ vendor/ ├─ frontend/ │  └─ src/ │     ├─ api/ │     ├─ components/ │     ├─ context/ │     ├─ hooks/ │     ├─ pages/ │     ├─ routes/ │     ├─ theme/ │     └─ utils/ ├─ manage.py └─ pyproject.toml

Frontend Pages Structure

| Directory      | Purpose              | Redux Slice    |
| -------------- | -------------------- | -------------- |
| loginView/     | Login page           | authSlice      |
| countView/     | Count sheet UI       | countsSlice    |
| catalogView/   | Inventory catalog    | catalogSlice   |
| reportsView/   | Reports, CSV export  | reportsSlice   |
| locationView/  | Location management  | locationsSlice |
| FrequencyView/ | Frequency management | frequencySlice |
| VendorView/    | Vendor management    | VendorSlice    |
| BrandView/     | Brand management     | BrandSlice     |
| userView/      | User management      | usersSlice     |

---

End of Document

