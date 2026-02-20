# Data Model: Rescan - Recycling Scanner Web Application

**Purpose**: Define data entities, relationships, and validation rules for the recycling scanner system
**Created**: 2026-02-19
**Feature**: [spec.md](spec.md)

## Entity Overview

The Rescan application uses a simple two-table data model designed for educational clarity and environmental tracking. The architecture emphasizes straightforward relationships and clear business logic suitable for high school STEM learning objectives.

## Entity Definitions

### Address Entity

**Purpose**: Tracks recycling points by street address for location-based environmental impact measurement

```javascript
Address {
  street_address: String    // Primary Key, user-entered address
  points_total: Integer     // Cumulative recycling points earned
  created_date: DateTime    // Account creation timestamp  
  last_updated: DateTime    // Most recent activity timestamp
}
```

**Validation Rules**:
- `street_address`: Required, non-empty, max 255 characters, trimmed whitespace
- `points_total`: Non-negative integer, defaults to 0
- `created_date`: Auto-generated on record creation
- `last_updated`: Auto-updated on any record modification

**Business Rules**:
- Street addresses are case-insensitive for lookup (normalized to lowercase)
- Points can only increase (no point deduction functionality)
- Address serves as natural primary key for simplicity

**Educational Value**: Demonstrates primary keys, data validation, and business logic implementation

### ScanSession Entity

**Purpose**: Records individual recycling scans for audit trail and learning reinforcement

```javascript
ScanSession {
  session_id: String        // Primary Key, UUID generated
  address: String          // Foreign Key to Address.street_address
  material_type: String    // AI-identified material (e.g., "1 PET", "5 PP")
  is_recyclable: Boolean   // Recyclability determination for user's location
  points_awarded: Integer  // Points earned (100 recyclable, 10 non-recyclable)
  scan_timestamp: DateTime // When scan occurred
  image_analysis_result: Text // Full AI response for educational review
}
```

**Validation Rules**:
- `session_id`: UUID v4 format, auto-generated, unique
- `address`: Must exist in Address table, required
- `material_type`: Required, max 50 characters (format: "number TYPE")
- `is_recyclable`: Boolean, required
- `points_awarded`: Must be 10 or 100 based on business logic
- `scan_timestamp`: Auto-generated on creation
- `image_analysis_result`: Optional text for debugging/learning

**Business Rules**:
- Each scan creates exactly one session record
- Points awarded: 100 if recyclable, 10 if not recyclable, 0 for errors
- Material type must follow pattern: digit + space + material code
- Session records are append-only (no updates or deletes)

**Educational Value**: Teaches foreign keys, referential integrity, audit logging, and data normalization

## Entity Relationships

```text
Address ||--o{ ScanSession
  |            |
  |            +-- session_id (PK)
  |            +-- address (FK)
  |            +-- material_type
  |            +-- is_recyclable  
  |            +-- points_awarded
  |            +-- scan_timestamp
  |            +-- image_analysis_result
  +-- street_address (PK)
  +-- points_total (calculated)
  +-- created_date
  +-- last_updated
```

**Relationship Type**: One-to-Many (One Address has Many ScanSessions)

**Referential Integrity**: 
- Address must exist before ScanSession can be created
- Deleting Address would cascade delete all related ScanSessions
- Foreign key constraint enforced at database level

## State Transitions

### Address Lifecycle
1. **New**: Created when user first enters address → `points_total = 0`
2. **Active**: Accumulates points through scan sessions → `points_total += points_awarded`
3. **Dormant**: No recent activity but data preserved for learning continuity

### ScanSession Lifecycle
1. **Created**: User initiates scan → Session record created with timestamp
2. **Processing**: AI analyzes image → Material type and recyclability determined
3. **Completed**: Points calculated and awarded → Address points updated
4. **Archived**: Permanent record for educational review and audit trail

## Data Access Patterns

### Read Operations (Educational Focus: Query Optimization)
```sql
-- P1: Address lookup for points display
SELECT street_address, points_total 
FROM Address 
WHERE LOWER(street_address) = LOWER(?)

-- P2: Scan history for learning review
SELECT material_type, is_recyclable, points_awarded, scan_timestamp
FROM ScanSession 
WHERE address = ?
ORDER BY scan_timestamp DESC
```

### Write Operations (Educational Focus: Transaction Management)
```sql
-- P1: Create new address
INSERT INTO Address (street_address, points_total, created_date, last_updated)
VALUES (?, 0, NOW(), NOW())

-- P2: Record scan and update points (requires transaction)
BEGIN TRANSACTION;
  INSERT INTO ScanSession (session_id, address, material_type, is_recyclable, points_awarded, scan_timestamp, image_analysis_result)
  VALUES (?, ?, ?, ?, ?, NOW(), ?);
  
  UPDATE Address 
  SET points_total = points_total + ?, last_updated = NOW()
  WHERE street_address = ?;
COMMIT;
```

## Index Strategy

**Educational Purpose**: Demonstrate performance optimization concepts

```sql
-- Primary key indexes (automatic)
CREATE INDEX pk_address ON Address(street_address);
CREATE INDEX pk_session ON ScanSession(session_id);

-- Foreign key index for join performance
CREATE INDEX idx_session_address ON ScanSession(address);

-- Query optimization for scan history
CREATE INDEX idx_session_timestamp ON ScanSession(address, scan_timestamp DESC);
```

## Educational Learning Objectives

**Database Concepts Taught**:
- Primary and foreign keys
- Referential integrity constraints
- Data normalization (3NF achieved)
- Transaction management for data consistency
- Index design for query performance

**Programming Concepts Reinforced**:
- Data validation and sanitization
- Error handling for database operations
- Asynchronous operations (database queries)
- Business logic separation from data access

**Environmental Education Integration**:
- Data model directly supports recycling awareness goals
- Audit trail enables reflection on environmental choices
- Points system gamifies sustainable behavior learning

## Implementation Notes

**Database**: SQLite for easy classroom setup and visualization
**Tools**: DB Browser for SQLite for educational data exploration
**Deployment Strategy**: SQLite files are portable and perfect for educational demonstrations

This data model balances educational clarity with real-world relevance, ensuring students learn fundamental database concepts while building meaningful environmental awareness tools.