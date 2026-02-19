# Data Model: RIC Recycling Scanner

**Date**: February 17, 2026  
**Feature**: [RIC Recycling Scanner](spec.md)  
**Database**: PostgreSQL with PostGIS extension

## Core Entities

### User
**Purpose**: Track individuals using the recycling scanner service
**Storage**: PostgreSQL table

**Fields**:
- `id` (UUID, primary key)
- `session_id` (string, for anonymous usage tracking)
- `street_address` (text, optional - for location-based results)
- `geocoded_location` (PostGIS point, derived from street_address)
- `total_points` (integer, default 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `last_scan_at` (timestamp, nullable)

**Relationships**: 
- One-to-many with Scan entities
- Many-to-one with RecyclingCapability (via location)

**Validation Rules**:
- Session ID required for anonymous users
- Street address must be geocodable when provided
- Points cannot be negative
- Total points calculated from successful scans

### RicCode
**Purpose**: Master data for recycling identification codes (1-7)
**Storage**: PostgreSQL table (reference data)

**Fields**:
- `code` (integer, primary key, 1-7)
- `plastic_type` (string, e.g., "PET", "HDPE")  
- `description` (text, e.g., "Polyethylene Terephthalate")
- `general_recyclability` (enum: recyclable, not_recyclable, conditional)
- `common_products` (text array, e.g., ["water bottles", "soda containers"])
- `recycling_notes` (text, general guidance)

**Relationships**:
- One-to-many with Scan entities
- Many-to-many with RecyclingCapability (location-specific availability)

**State Transitions**: Static reference data, minimal changes

### Scan
**Purpose**: Record each recycling check performed by users
**Storage**: PostgreSQL table

**Fields**:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to User)
- `ric_code` (integer, foreign key to RicCode)
- `is_recyclable_locally` (boolean, based on user location)
- `points_awarded` (integer, typically 1-5 points)
- `scan_method` (enum: camera, manual_entry)
- `location_used` (PostGIS point, copied from user location at scan time)
- `created_at` (timestamp)

**Relationships**:
- Many-to-one with User
- Many-to-one with RicCode
- Many-to-one with RecyclingCapability (via location)

**Validation Rules**:
- RIC code must exist in RicCode table
- Points awarded must be positive
- Location required for accurate recyclability determination
- Each scan generates exactly one point entry

### RecyclingCapability  
**Purpose**: Location-specific recycling facility capabilities
**Storage**: PostgreSQL table with PostGIS spatial indexing

**Fields**:
- `id` (UUID, primary key)
- `facility_name` (string, waste management provider)
- `service_area` (PostGIS polygon, geographic coverage area)
- `accepted_ric_codes` (integer array, which RIC codes accepted)
- `facility_type` (enum: curbside, drop_off, special_collection)
- `address` (text, facility location)
- `contact_info` (text, optional)
- `notes` (text, special instructions or limitations)
- `last_updated` (timestamp, data freshness tracking)

**Relationships**:
- Many-to-many with RicCode (via accepted_ric_codes)
- Spatial relationship with User locations (via PostGIS)

**Validation Rules**:
- Service area must be valid polygon
- Accepted RIC codes must reference valid RicCode entries
- Last updated timestamp required for data quality
- Facility name and service area required

## Data Relationships

### Primary Flow:
1. **User** provides location → geocoded to PostGIS point
2. **User** scans **RicCode** → creates **Scan** record  
3. **Scan** checks **RecyclingCapability** via spatial query for recyclability
4. **Scan** awards points based on engagement (not just recyclability)

### Spatial Queries:
- Find RecyclingCapability where user location intersects service_area
- Street-level precision via PostGIS point-in-polygon operations
- Efficient spatial indexing for real-time lookup performance

### Data Integrity:
- Foreign key constraints on all relationships
- Spatial validation on geographic fields
- Enum constraints on categorical fields
- Timestamp triggers for audit trails

## Performance Considerations

### Indexing Strategy:
- Spatial index on RecyclingCapability.service_area (PostGIS GIST)
- B-tree index on User.geocoded_location for proximity searches  
- Compound index on (ric_code, location) for recyclability queries
- Time-series index on Scan.created_at for analytics

### Query Optimization:
- Precompute common location/RIC combinations
- Cache facility lookup results with 15-minute TTL
- Partition Scan table by date for historical data management
- Use PostGIS spatial functions for efficient geographic queries

### Data Volume Planning:
- **Users**: ~10K-100K records for medium city
- **Scans**: ~100K-1M transactions annually
- **RecyclingCapability**: ~200-1K facility records
- **RicCode**: Static 7 records (rarely changes)