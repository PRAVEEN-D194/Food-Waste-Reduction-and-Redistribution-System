-- FoodRescue Relational Database Schema (MySQL)

CREATE DATABASE IF NOT EXISTS foodrescue_db;
USE foodrescue_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    address VARCHAR(255),
    role VARCHAR(30) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Donors Table
CREATE TABLE IF NOT EXISTS donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    organization_name VARCHAR(150),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Receivers Table
CREATE TABLE IF NOT EXISTS receivers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    organization_name VARCHAR(150),
    required_food_type VARCHAR(150),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Farmers Table
CREATE TABLE IF NOT EXISTS farmers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    farm_name VARCHAR(150),
    farm_location VARCHAR(150),
    land_capacity VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Food Items Table
CREATE TABLE IF NOT EXISTS food_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_code VARCHAR(50) NOT NULL UNIQUE,
    food_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity DOUBLE NOT NULL,
    unit VARCHAR(20) NOT NULL,
    donor_user_id BIGINT NOT NULL,
    donation_date DATETIME NOT NULL,
    preparation_date DATETIME,
    expiry_date DATETIME NOT NULL,
    food_condition VARCHAR(100),
    storage_condition VARCHAR(100),
    pickup_location VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Food Requests Table
CREATE TABLE IF NOT EXISTS food_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_item_id BIGINT NOT NULL,
    receiver_user_id BIGINT NOT NULL,
    requested_quantity DOUBLE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id),
    FOREIGN KEY (receiver_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Food Allocations Table
CREATE TABLE IF NOT EXISTS food_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_item_id BIGINT NOT NULL,
    receiver_user_id BIGINT NOT NULL,
    quantity DOUBLE NOT NULL,
    allocation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_date DATETIME,
    pickup_location VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'ALLOCATED',
    notes TEXT,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id),
    FOREIGN KEY (receiver_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Farmer Allocations Table (Expired Food Workflow)
CREATE TABLE IF NOT EXISTS farmer_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_item_id BIGINT NOT NULL,
    farmer_user_id BIGINT NOT NULL,
    quantity DOUBLE NOT NULL,
    pickup_location VARCHAR(255),
    pickup_date DATETIME,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id),
    FOREIGN KEY (farmer_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Food History / Audit Trail Table
CREATE TABLE IF NOT EXISTS food_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_id BIGINT NOT NULL,
    food_code VARCHAR(50),
    food_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    performed_by VARCHAR(150),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_role VARCHAR(30),
    target_user_id BIGINT,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
