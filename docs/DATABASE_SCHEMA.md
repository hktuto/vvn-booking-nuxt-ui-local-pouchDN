# Database Schema Documentation

## Overview

This document describes the database schema for the Student Management App using PouchDB as the local-first database. The schema is designed to support a unified class and schedule system optimized for solo teachers and small studios.

## Database Architecture

### Local-First Design
- **PouchDB**: Primary database for local storage
- **Offline Capable**: All operations work without internet connection
- **Future Sync**: Planned CouchDB integration for multi-device synchronization
- **Data Ownership**: Teachers own their data completely

### Database Collections
Each entity type has its own PouchDB database:
- `users` - User accounts and authentication
- `students` - Student profiles and information
- `packages` - Credit packages and pricing
- `locations` - Class venues and locations
- `classes` - Unified class and schedule system
- `studentPackages` - Student package assignments
- `bookings` - Class reservations and attendance
- `transactions` - Payment and credit transactions

## Document Interfaces

### Base Document Interface
All documents extend this base interface:

```typescript
interface PouchDocument {
  _id: string                    // PouchDB document ID
  _rev?: string                  // PouchDB revision
  type: string                   // Document type identifier
  created_at: string             // ISO timestamp
  updated_at: string             // ISO timestamp
}
```

### User Document
Teacher account information and settings.

```typescript
interface UserDocument extends PouchDocument {
  type: 'user'
  username: string               // Unique username
  password_hash: string          // Hashed password
  email?: string                 // Optional email
  phone: string                  // Phone number
  country_code: string           // Country calling code
  role: 'teacher' | 'admin'      // User role
  display_name: string           // Display name
  settings: {
    language: 'en' | 'zh-Hant'   // Preferred language
    timezone: string             // User timezone
    currency: string             // Preferred currency
  }
}
```

### Student Document
Student profile and contact information.

```typescript
interface StudentDocument extends PouchDocument {
  type: 'student'
  name: string                   // Student name
  phone: string                  // Phone number
  country_code: string           // Country calling code
  email: string                  // Optional email
  address: string                // Optional address
  credits: number                // Current credit balance
  notes: string                  // Optional notes
  password_hash: string          // Optional student login
  tags: string[]                 // Student tags for organization
}
```

### Package Document
Credit packages available for purchase.

```typescript
interface PackageDocument extends PouchDocument {
  type: 'package'
  name: string                   // Package name
  description: string            // Package description
  price: number                  // Package price
  credits: number                // Credits included
  duration_days: number          // Validity period
  active: boolean                // Available for purchase
  is_custom?: boolean            // One-off custom package
}
```

### Location Document
Class venues and locations.

```typescript
interface LocationDocument extends PouchDocument {
  type: 'location'
  name: string                   // Location name
  address: string                // Full address
  phone: string                  // Contact phone
  email: string                  // Optional email
  website: string                // Optional website
  active: boolean                // Available for classes
}
```

### Class Document (Unified)
**Unified class and schedule system** - combines traditional class types, schedules, and individual classes into a single entity.

```typescript
interface ClassDocument extends PouchDocument {
  type: 'class'
  name: string                   // Class name (e.g., "Morning Yoga")
  description: string            // Class description
  location_id: string            // Location reference
  day_of_week: number            // 0-6 (Sunday-Saturday)
  start_time: string             // HH:MM format
  end_time: string               // HH:MM format
  max_students: number           // Maximum capacity
  price: number                  // Price per class
  credits_required: number       // Credits needed to book
  active: boolean                // Class is available
  recurring: boolean             // Recurring or one-off
  start_date?: string            // Start date for recurring
  end_date?: string              // End date for recurring
}
```

### Student Package Document
Student package assignments and credit tracking.

```typescript
interface StudentPackageDocument extends PouchDocument {
  type: 'student_package'
  student_id: string             // Student reference
  package_id: string             // Package reference
  credits_purchased: number      // Total credits purchased
  credits_remaining: number      // Remaining credits
  purchase_date: string          // Purchase date
  expiry_date: string            // Expiry date
  status: 'active' | 'expired' | 'completed'
  notes: string                  // Optional notes
  custom_price?: number          // Custom price if different
}
```

### Booking Document
Class reservations and attendance tracking.

```typescript
interface BookingDocument extends PouchDocument {
  type: 'booking'
  student_id: string             // Student reference
  class_id: string               // Class reference
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  credits_used: number           // Credits deducted
  notes: string                  // Optional notes
}
```

### Transaction Document
Payment and credit transaction records.

```typescript
interface TransactionDocument extends PouchDocument {
  type: 'transaction'
  student_id: string             // Student reference
  amount: number                 // Transaction amount
  transaction_type: 'payment' | 'refund' | 'credit_purchase' | 'credit_usage'
  payment_method: 'cash' | 'bank_transfer' | 'credit'
  transaction_date: string       // Transaction date
  description: string            // Transaction description
}
```

## Database Indexes

### Users Database
```javascript
// Username lookup
{ fields: ['type', 'username'] }

// User creation date
{ fields: ['type', 'created_at'] }
```

### Students Database
```javascript
// Name search
{ fields: ['type', 'name'] }

// Phone lookup
{ fields: ['type', 'phone'] }

// Creation date
{ fields: ['type', 'created_at'] }
```

### Packages Database
```javascript
// Name search
{ fields: ['type', 'name'] }

// Active packages
{ fields: ['type', 'active', 'created_at'] }
```

### Locations Database
```javascript
// Name search
{ fields: ['type', 'name'] }

// Active locations
{ fields: ['type', 'active', 'created_at'] }
```

### Classes Database
```javascript
// Location-based queries
{ fields: ['type', 'location_id'] }

// Day and time queries
{ fields: ['type', 'day_of_week', 'start_time'] }

// Active classes
{ fields: ['type', 'active', 'created_at'] }

// Recurring classes
{ fields: ['type', 'recurring', 'active'] }
```

### Student Packages Database
```javascript
// Student packages
{ fields: ['type', 'student_id'] }

// Package assignments
{ fields: ['type', 'package_id'] }

// Active packages
{ fields: ['type', 'status', 'expiry_date'] }
```

### Bookings Database
```javascript
// Student bookings
{ fields: ['type', 'student_id'] }

// Class bookings
{ fields: ['type', 'class_id'] }

// Booking status
{ fields: ['type', 'status', 'created_at'] }
```

### Transactions Database
```javascript
// Student transactions
{ fields: ['type', 'student_id'] }

// Transaction date
{ fields: ['type', 'transaction_date', 'created_at'] }
```

## Data Relationships

### One-to-Many Relationships
- **User** → **Students** (teacher manages students)
- **User** → **Classes** (teacher creates classes)
- **Location** → **Classes** (location hosts classes)
- **Student** → **StudentPackages** (student has packages)
- **Student** → **Bookings** (student makes bookings)
- **Student** → **Transactions** (student has transactions)
- **Package** → **StudentPackages** (package assigned to students)
- **Class** → **Bookings** (class has bookings)

### Many-to-One Relationships
- **StudentPackage** → **Student** (belongs to student)
- **StudentPackage** → **Package** (references package)
- **Booking** → **Student** (made by student)
- **Booking** → **Class** (for specific class)
- **Transaction** → **Student** (belongs to student)
- **Class** → **Location** (held at location)

## Data Validation

### Required Fields
- All documents must have `type`, `created_at`, `updated_at`
- User documents require `username`, `password_hash`, `phone`, `country_code`, `display_name`
- Student documents require `name`, `phone`, `country_code`
- Package documents require `name`, `price`, `credits`, `duration_days`
- Location documents require `name`, `address`, `phone`
- Class documents require `name`, `location_id`, `day_of_week`, `start_time`, `end_time`, `max_students`, `price`, `credits_required`

### Data Types
- **Strings**: `name`, `description`, `phone`, `email`, `address`
- **Numbers**: `price`, `credits`, `max_students`, `day_of_week`
- **Booleans**: `active`, `recurring`
- **Dates**: `created_at`, `updated_at`, `purchase_date`, `expiry_date`
- **Times**: `start_time`, `end_time` (HH:MM format)

## Migration Strategy

### From Traditional to Unified System
The unified class system replaces the traditional three-entity approach:

**Before (Traditional)**:
- ClassType → Schedule → Class

**After (Unified)**:
- Class (with integrated scheduling)

### Migration Steps
1. **Phase 1**: Implement new unified class system
2. **Phase 2**: Migrate existing data (if any)
3. **Phase 3**: Remove old schema components
4. **Phase 4**: Update all references and queries

## Performance Considerations

### Indexing Strategy
- Index on frequently queried fields
- Compound indexes for complex queries
- Avoid over-indexing to maintain write performance

### Query Optimization
- Use specific selectors to limit result sets
- Implement pagination for large datasets
- Cache frequently accessed data

### Storage Optimization
- Minimize document size
- Use efficient data types
- Regular cleanup of old data

## Security Considerations

### Data Privacy
- All data stored locally on user's device
- No cloud storage or third-party access
- User controls all data access

### Authentication
- Password hashing for user accounts
- Session management for web interface
- Optional student login with separate passwords

### Data Integrity
- Validation at document level
- Referential integrity checks
- Backup and restore capabilities

## Future Enhancements

### Sync Capabilities
- CouchDB integration for multi-device sync
- Conflict resolution strategies
- Offline-first with eventual consistency

### Advanced Features
- Document versioning
- Audit trails
- Data export/import
- Backup encryption

### Performance Improvements
- Database compaction
- Query optimization
- Index tuning
- Memory management 