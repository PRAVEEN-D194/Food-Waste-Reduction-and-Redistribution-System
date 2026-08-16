# FoodRescue – Smart Food Waste Management System

**FoodRescue** is a full-stack web application designed to reduce food waste by tracking every food item from donation to distribution, or safely redirecting expired food through an approved non-human agricultural/composting workflow.

---

## 1. Key Features

- **Multi-Role Authentication & Security**: Secure role-based login (BCrypt hashed passwords + JWT tokens) for `Admin`, `Donor`, `Receiver`, and `Farmer`.
- **Admin Dashboard**: Real-time summary metrics, Chart.js analytics graphs (Waste Reduction %, Donated vs Distributed trends, Category breakdowns), user management, allocations, and downloadable CSV reports.
- **Donor Module**: Register donor profile (Hotels, Bakeries, Catering), submit food donations with quantity, expiry date, storage conditions, and pickup location, track donation status history.
- **Receiver Module**: Register institution/shelter profile, browse available non-expired food listings, submit food requests, track approved requests and received allocations.
- **Expired Food Management (Core Special Feature)**:
  - **Automated Expiry Detection**: Background `@Scheduled` task compares `current_date` vs `expiry_date` every minute, automatically updating valid food items to `EXPIRED`.
  - **Admin Expired Food Alert**: Generates notifications when food expires.
  - **Non-Human Redistribution Workflow**: Admin can assign expired food items to registered farmers for composting or agricultural recycling.
  - **Food Safety Compliance Notice**: Displays mandatory food safety disclaimer:
    > *"Expired food must not be distributed to people. It can only be redirected through an approved non-human-use workflow, subject to applicable local food-safety and agricultural rules."*
- **Farmer Portal**: Registered farmers can view assigned expired food allocations, accept/decline allocations, and mark collections completed.
- **Immutable Audit Trail (`FoodHistory`)**: Maintains complete lifecycle history for every food item (Donated &rarr; Available &rarr; Requested &rarr; Allocated &rarr; Expired &rarr; Sent to Farmer &rarr; Completed). Records are never deleted.
- **In-App Notifications**: Real-time notifications for all 4 user roles.

---

## 2. Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, FontAwesome, Chart.js
- **Backend**: Java 17+, Spring Boot 3.2.3, Spring Web REST API, Spring Data JPA, Hibernate, Spring Security, Spring Task Scheduler
- **Database**: MySQL 8.0+ (Relational DB with DDL constraints and foreign keys)
- **Build Tool**: Maven

---

## 3. Demo Credentials

The system initializes automatically with pre-populated seed data on startup. Use any of the following credentials to test different user roles:

| Role | Username / Email | Password | Organization / Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` / `admin@foodrescue.org` | `password123` | System Administrator |
| **Donor (Hotel)** | `abchotel` / `contact@abchotel.com` | `password123` | ABC Grand Hotel & Suites |
| **Donor (Bakery)** | `citybakery` / `info@citybakery.com` | `password123` | City Fresh Bakery Co. |
| **Donor (Catering)** | `apexevents` / `events@apexcatering.com` | `password123` | Apex Event Catering |
| **Receiver (Shelter)** | `hopehaven` / `shelter@hopehaven.org` | `password123` | Hope Haven Shelter |
| **Receiver (Orphanage)** | `sunshinekids` / `care@sunshinekids.org` | `password123` | Sunshine Kids Orphanage |
| **Receiver (Pantry)** | `communitykitchen` / `feed@communitykitchen.org` | `password123` | Metro Community Kitchen |
| **Farmer (Organic)** | `greenfarms` / `contact@greenfields.com` | `password123` | Green Fields Organic Farm (50 Acres) |
| **Farmer (Compost)** | `agricompost` / `info@agricompost.com` | `password123` | AgriEco Soil Solutions (120 Acres) |
| **Farmer (Recycling)** | `sunriselivestock` / `feed@sunriselivestock.com` | `password123` | Sunrise Agricultural Recycling (80 Acres) |

---

## 4. Database Setup & Architecture

### MySQL Database Schema (`schema.sql`)
1. `users`: Stores core credentials, BCrypt hashed passwords, full names, roles, contact info.
2. `donors`: Donor profiles linked 1-to-1 with `users`.
3. `receivers`: Receiver shelter profiles linked 1-to-1 with `users`.
4. `farmers`: Farmer agricultural profiles linked 1-to-1 with `users`.
5. `food_items`: Primary food entries (`food_code`, `category`, `quantity`, `expiry_date`, `status`, etc.).
6. `food_requests`: Receiver food request records.
7. `food_allocations`: Human distribution allocations.
8. `farmer_allocations`: Expired food non-human redistribution records.
9. `food_history`: Immutable audit trail for every status transition and action.
10. `notifications`: Role-based and user-specific in-app notifications.

---

## 5. How to Run the Application

### Prerequisites
- **Java JDK 17** or higher (`java -version`)
- **MySQL Server 8.0+** running on `localhost:3306` (Default DB name: `foodrescue_db`, username: `root`, password: `root` - configured in `application.properties`)

### Steps to Run

1. **Start MySQL Database**: Ensure MySQL service is running.
2. **Build & Run Application**:
   Execute using Maven:
   ```bash
   mvn spring-boot:run
   ```
   Or package into a executable JAR:
   ```bash
   mvn clean package
   java -jar target/food-waste-management-1.0.0.jar
   ```

3. **Access Web Application**:
   Open your browser and navigate to:
   [http://localhost:8080/](http://localhost:8080/)

---

## 6. REST API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new Donor, Receiver, or Farmer | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch current logged in user profile | Authenticated |
| `GET` | `/api/foods` | List/search all food items with filters | Public / Authenticated |
| `POST` | `/api/foods` | Add new food donation entry | Donor / Admin |
| `GET` | `/api/foods/available` | List active available non-expired food | Public / Authenticated |
| `GET` | `/api/foods/expired` | List expired food items needing farmer action | Admin |
| `POST` | `/api/food-requests` | Submit food request | Receiver |
| `PUT` | `/api/food-requests/{id}/approve` | Approve food request | Admin |
| `POST` | `/api/allocations` | Allocate food to receiver | Admin |
| `POST` | `/api/farmer-allocations` | Assign expired food item to farmer | Admin |
| `PUT` | `/api/farmer-allocations/{id}/respond` | Accept or decline expired allocation | Farmer |
| `GET` | `/api/food-history/{foodId}` | Get complete audit history trail for food item | Authenticated |
| `GET` | `/api/reports/dashboard-stats` | Fetch executive stats & chart data | Authenticated |
| `GET` | `/api/reports/csv` | Download monthly waste reduction CSV report | Admin |
