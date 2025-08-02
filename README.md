# Student Management App

## Tech Stack
- **Frontend Framework**: Nuxt 3.17.7
- **UI Framework**: Nuxt UI (Tailwind CSS)
- **Server Framework**: Nuxt (Full-stack)
- **Database**: PouchDB (Local-first, with future CouchDB sync)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Internationalization**: @nuxtjs/i18n (English & Traditional Chinese)

## Introduction

This project is a mobile-first student management web application designed for solo teachers and small fitness studios. It allows users to manage students, packages, locations, classes, and bookings in a streamlined, local-first approach.

## Current Features

### ✅ Implemented
- **User Management**: Registration, login, and authentication
- **Student Management**: Add, edit, delete, and search students
- **Package Management**: Create packages with pricing and credit systems
- **Location Management**: Manage class venues and locations
- **Student Packages**: Assign packages to students with custom pricing
- **Local-First Data**: All data stored locally with PouchDB
- **Multi-language**: English and Traditional Chinese support
- **Mobile Responsive**: Optimized for mobile and desktop use

### 🚧 In Development
- **Unified Class & Schedule System**: Combined class and scheduling management
- **Booking System**: Class booking with credit management
- **Transaction Tracking**: Payment and credit usage tracking

## Updated Schema

### User
- `username`: string (required)
- `password_hash`: string (required)
- `email`: string (optional)
- `phone`: string (required)
- `country_code`: string (required)
- `display_name`: string (required)
- `role`: 'teacher' | 'admin' (default: 'teacher')
- `settings`: object (language, timezone, currency)

### Student
- `name`: string (required)
- `phone`: string (required)
- `country_code`: string (required)
- `email`: string (optional)
- `address`: string (optional)
- `credits`: number (default: 0)
- `notes`: string (optional)

### Package
- `name`: string (required)
- `description`: string (optional)
- `price`: number (required)
- `credits`: number (required)
- `duration_days`: number (required)
- `active`: boolean (default: true)
- `is_custom`: boolean (optional, for one-off packages)

### Location
- `name`: string (required)
- `address`: string (required)
- `phone`: string (required)
- `email`: string (optional)
- `website`: string (optional)
- `active`: boolean (default: true)

### Class (Unified with Schedule)
- `name`: string (required)
- `description`: string (optional)
- `location_id`: string (required)
- `day_of_week`: number (0-6, Sunday-Saturday)
- `start_time`: string (HH:MM format)
- `end_time`: string (HH:MM format)
- `max_students`: number (required)
- `price`: number (required)
- `credits_required`: number (required)
- `active`: boolean (default: true)
- `recurring`: boolean (default: true)
- `start_date`: string (optional, for recurring classes)
- `end_date`: string (optional, for recurring classes)

### Student Package
- `student_id`: string (required)
- `package_id`: string (required)
- `credits_purchased`: number (required)
- `credits_remaining`: number (required)
- `purchase_date`: string (required)
- `expiry_date`: string (required)
- `status`: 'active' | 'expired' | 'completed'
- `notes`: string (optional)
- `custom_price`: number (optional)

### Booking
- `student_id`: string (required)
- `class_id`: string (required)
- `status`: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
- `credits_used`: number (required)
- `notes`: string (optional)

### Transaction
- `student_id`: string (required)
- `amount`: number (required)
- `transaction_type`: 'payment' | 'refund' | 'credit_purchase' | 'credit_usage'
- `payment_method`: 'cash' | 'bank_transfer' | 'credit'
- `transaction_date`: string (required)
- `description`: string (required)

## Key Design Decisions

### Unified Class & Schedule System
Instead of separate Class Types, Classes, and Schedules, we've combined them into a single, intuitive system:
- **Simplified Setup**: Teachers can create classes with integrated scheduling
- **Flexible Scheduling**: Support for both recurring and one-off classes
- **Direct Booking**: Students can book directly from class listings
- **Reduced Complexity**: Fewer configuration steps to get started

### Local-First Architecture
- **PouchDB**: Local database for offline-first functionality
- **Future Sync**: Planned CouchDB integration for multi-device sync
- **Data Ownership**: Teachers own their data completely
- **Offline Capable**: Works without internet connection

### Mobile-First Design
- **Responsive UI**: Optimized for mobile devices
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Fast Loading**: Minimal dependencies and optimized performance

## Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

## Project Structure

```
├── components/          # Reusable Vue components
├── composables/         # Nuxt composables (business logic)
├── i18n/               # Internationalization files
├── layouts/            # Page layouts
├── pages/              # Application pages
├── plugins/            # Nuxt plugins (PouchDB setup)
├── utils/              # Utility functions
└── public/             # Static assets
```

## Roadmap

### Phase 1: Local-First (Current)
- ✅ User management and authentication
- ✅ Student and package management
- ✅ Location management
- 🚧 Unified class and schedule system
- 🚧 Booking system
- 🚧 Transaction tracking

### Phase 2: Sync & Advanced Features
- 🔄 CouchDB integration for multi-device sync
- 🔄 Advanced reporting and analytics
- 🔄 Email/SMS notifications
- 🔄 Data export and backup
- 🔄 Advanced scheduling features

## Contributing

This project is designed for solo teachers and small studios. The focus is on simplicity, reliability, and ease of use rather than complex enterprise features.
  
