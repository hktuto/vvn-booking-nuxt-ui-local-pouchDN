# Product Requirements Document (PRD)
## Student Management App for Solo Teachers

### Project Overview
A mobile-optimized web application for solo teachers to manage their students, schedules, and bookings efficiently.

### Target Users
- **Primary User**: Solo teachers/instructors
- **Secondary User**: Students (limited functionality)

### Core Value Proposition
Streamlined student and class management system that works seamlessly on mobile devices with offline-first capabilities.

## Technical Requirements

### Tech Stack
- **Frontend**: Nuxt 3.17 + Ionic (mobile-optimized UI)
- **Backend**: Nuxt server-side
- **Database**: Zero-sync (local-first with sync capabilities)
- **Language**: TypeScript
- **Internationalization**: English + Traditional Chinese
- **Package Manager**: pnpm

### System Architecture
- **Database**: Local-first with cloud sync via zero-sync
- **Authentication**: Simple username/password (no social login)
- **Deployment**: Web application (no native app wrapper)
- **Payment**: Transaction tracking only (no payment processing)

## Functional Requirements

### 1. Authentication & User Management
- Teacher login with username/password
- Optional student login (if password is set)
- Session management
- Password reset functionality

### 2. Student Management
- Add/edit/delete students
- Student profiles with contact information
- Credit balance tracking
- Registration status management
- Student search and filtering

### 3. Package Management
- Create/edit packages (credit bundles)
- Define package pricing and duration
- Track package sales and expiration

### 4. Class Type & Schedule Management
- Define different class types
- Create recurring schedules
- Set class capacity and credit costs
- Manage class locations

### 5. Class Instance Management
- Generate class instances from schedules
- Track class status (scheduled, completed, cancelled)
- View class attendance
- Quick class actions

### 6. Booking System
- Student booking for classes
- Booking status management (booked, cancelled, completed)
- Waitlist functionality when classes are full
- Bulk booking operations

### 7. Transaction & Credit Management
- Record package purchases
- Track credit usage per class
- Manual credit adjustments
- Transaction history and reporting

### 8. Reporting & Analytics
- Student attendance reports
- Revenue tracking
- Class utilization statistics
- Export capabilities

### 9. Mobile-First UI
- Responsive design optimized for mobile
- Touch-friendly interfaces
- Offline functionality with sync
- Fast navigation between sections

### 10. Internationalization
- English (default)
- Traditional Chinese
- Easy language switching

## Data Schema (Refined)

### Users
- id: string (primary key)
- username: string (unique)
- password_hash: string
- role: 'teacher' | 'student'
- created_at: timestamp
- updated_at: timestamp

### Students
- id: string (primary key)
- name: string (required)
- password_hash: string (optional)
- registered: boolean (default: false)
- phone: string (required)
- email: string (optional)
- address: string (optional)
- credits: number (default: 0)
- notes: string (optional)
- created_at: timestamp
- updated_at: timestamp

### Packages
- id: string (primary key)
- name: string (required)
- credits: number (required)
- price: number (required)
- duration_days: number (required)
- description: string (optional)
- active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp

### ClassTypes
- id: string (primary key)
- name: string (required)
- description: string (optional)
- default_credit_cost: number (required)
- active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp

### Locations
- id: string (primary key)
- name: string (required)
- address: string (required)
- phone: string (required)
- email: string (optional)
- website: string (optional)
- active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp

### Schedules
- id: string (primary key)
- class_type_id: string (foreign key)
- location_id: string (foreign key)
- max_capacity: number (required)
- weekly_days: string[] (mon, tue, wed, thu, fri, sat, sun)
- start_date: date (required)
- end_date: date (optional)
- start_time: time (required)
- end_time: time (required)
- credit_cost: number (required)
- description: string (optional)
- active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp

### Classes
- id: string (primary key)
- schedule_id: string (foreign key)
- class_type_id: string (foreign key)
- location_id: string (foreign key)
- status: 'scheduled' | 'completed' | 'cancelled'
- date: date (required)
- start_time: time (required)
- end_time: time (required)
- actual_start_time: time (optional)
- actual_end_time: time (optional)
- notes: string (optional)
- created_at: timestamp
- updated_at: timestamp

### Bookings
- id: string (primary key)
- student_id: string (foreign key)
- class_id: string (foreign key)
- status: 'booked' | 'cancelled' | 'completed' | 'no_show'
- booking_time: timestamp
- notes: string (optional)
- created_at: timestamp
- updated_at: timestamp

### Transactions
- id: string (primary key)
- student_id: string (foreign key)
- package_id: string (optional, foreign key)
- class_id: string (optional, foreign key)
- type: 'package_purchase' | 'class_credit' | 'manual_adjustment'
- amount: number (required)
- credit_change: number (required)
- payment_method: 'cash' | 'bank_transfer' | 'other'
- payment_note: string (optional)
- reference_number: string (optional)
- created_at: timestamp
- updated_at: timestamp

## User Stories

### Teacher Stories
1. As a teacher, I want to add new students so I can track their information and credits
2. As a teacher, I want to create class schedules so students can book recurring classes
3. As a teacher, I want to see daily/weekly class schedules so I can prepare for classes
4. As a teacher, I want to record package purchases so students get credits
5. As a teacher, I want to track attendance so I can manage credits accurately
6. As a teacher, I want to see student credit balances so I can inform them when they need to top up
7. As a teacher, I want to view transaction history so I can track business revenue
8. As a teacher, I want to cancel/reschedule classes so students are notified

### Student Stories (Optional)
1. As a student, I want to view my credit balance so I know when to purchase more
2. As a student, I want to see available classes so I can book sessions
3. As a student, I want to view my booking history so I can track my attendance

## Success Metrics
- Time to add a new student: < 2 minutes
- Time to record a package purchase: < 1 minute
- Time to view daily schedule: < 10 seconds
- Mobile usability score: > 90%
- Offline functionality: Basic operations work without internet
- Data sync reliability: 99.9% when connection is restored

## Constraints & Assumptions
- Single teacher use (no multi-tenancy initially)
- Mobile-first design (works on desktop but optimized for mobile)
- No real-time payment processing
- Basic reporting (no advanced analytics)
- English + Traditional Chinese only
- No third-party integrations initially

## Future Considerations
- Multi-teacher support
- Advanced reporting and analytics
- Payment gateway integration
- SMS/Email notifications
- Mobile app wrapper (Capacitor)
- API for third-party integrations