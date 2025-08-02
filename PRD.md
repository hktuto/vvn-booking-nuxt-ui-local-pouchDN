# Product Requirements Document (PRD)
## Student Management App - Unified Class & Schedule System

### Version: 2.0
### Date: December 2024
### Status: In Development

---

## 1. Executive Summary

### 1.1 Product Vision
A mobile-first, local-first student management application designed specifically for solo teachers and small fitness studios. The app simplifies class management by combining classes and schedules into a unified system, reducing setup complexity while maintaining flexibility.

### 1.2 Target Users
- **Primary**: Solo fitness teachers, yoga instructors, personal trainers
- **Secondary**: Small fitness studios (1-5 instructors)
- **Tertiary**: Dance schools, martial arts studios, wellness centers

### 1.3 Key Value Propositions
- **Simplified Setup**: Get started in minutes, not hours
- **Local-First**: Works offline, data ownership, privacy
- **Mobile-Optimized**: Designed for mobile-first workflows
- **Flexible Scheduling**: Support for recurring and one-off classes
- **Credit System**: Flexible package and credit management

---

## 2. Product Overview

### 2.1 Current Status
- ✅ **Phase 1 Complete**: User management, students, packages, locations
- 🚧 **Phase 2 In Progress**: Unified class & schedule system
- 🔄 **Phase 3 Planned**: Booking system, transactions, reporting

### 2.2 Core Features
1. **User Management**: Registration, authentication, profile management
2. **Student Management**: Student profiles, contact info, credit tracking
3. **Package Management**: Flexible credit packages with pricing
4. **Location Management**: Class venues and contact information
5. **Unified Class System**: Classes with integrated scheduling
6. **Booking System**: Class reservations with credit management
7. **Transaction Tracking**: Payment and credit usage records

---

## 3. Unified Class & Schedule System

### 3.1 Problem Statement
Traditional class management systems require users to:
1. Create class types (e.g., "Yoga", "Pilates")
2. Create schedules (e.g., "Monday 9 AM Yoga")
3. Create individual class instances
4. Manage bookings separately

This creates unnecessary complexity for solo teachers who want to start quickly.

### 3.2 Solution: Unified Approach
Combine all class-related functionality into a single, intuitive system where:
- **One Class Entry** = Complete class definition with scheduling
- **Integrated Scheduling** = Built into class creation
- **Direct Booking** = Students book directly from class listings
- **Flexible Recurring** = Support for both recurring and one-off classes

### 3.3 Class Schema Design
```typescript
interface ClassDocument {
  type: 'class'
  name: string                    // "Morning Yoga", "Evening Pilates"
  description: string             // Class description
  location_id: string            // Where it's held
  day_of_week: number            // 0-6 (Sunday-Saturday)
  start_time: string             // "09:00"
  end_time: string               // "10:00"
  max_students: number           // Capacity
  price: number                  // Price per class
  credits_required: number       // Credits needed to book
  active: boolean                // Is this class available
  recurring: boolean             // Is this a recurring class
  start_date?: string            // When recurring class starts
  end_date?: string              // When recurring class ends (optional)
}
```

### 3.4 User Workflow
1. **Create Class** → Teacher creates "Morning Yoga" class
2. **Set Schedule** → Every Monday 9:00-10:00 at Main Studio
3. **Set Pricing** → $15 per class, 1 credit required
4. **Set Capacity** → Max 12 students
5. **Publish** → Class is immediately available for booking

---

## 4. Technical Architecture

### 4.1 Technology Stack
- **Frontend**: Nuxt 3.17.7 (Vue 3, TypeScript)
- **UI Framework**: Nuxt UI (Tailwind CSS)
- **Database**: PouchDB (Local-first)
- **Future Sync**: CouchDB integration planned
- **Package Manager**: pnpm
- **Internationalization**: @nuxtjs/i18n

### 4.2 Data Architecture
- **Local-First**: All data stored locally on device
- **Offline Capable**: Full functionality without internet
- **Future Sync**: Multi-device synchronization planned
- **Data Ownership**: Teachers own their data completely

### 4.3 Security & Privacy
- **Local Storage**: No cloud dependencies
- **Password Hashing**: Secure authentication
- **Data Encryption**: PouchDB encryption capabilities
- **Privacy First**: No data collection or analytics

---

## 5. User Interface Design

### 5.1 Design Principles
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Minimal Setup**: Get started with minimal configuration
- **Progressive Disclosure**: Show complexity only when needed

### 5.2 Key Screens

#### 5.2.1 Classes List (`/classes`)
- **Grid Layout**: Class cards with key information
- **Search & Filter**: By name, location, day, time
- **Quick Actions**: Edit, delete, view bookings
- **Status Indicators**: Active/inactive, capacity status

#### 5.2.2 Class Form (`/classes/add`, `/classes/[id]/edit`)
- **Integrated Form**: Class details + scheduling in one form
- **Location Selection**: Dropdown with active locations
- **Time Picker**: Intuitive time selection
- **Day Selection**: Checkbox for recurring days
- **Pricing Section**: Price and credit requirements
- **Capacity Setting**: Maximum student limit

#### 5.2.3 Class Detail (`/classes/[id]`)
- **Class Information**: Complete class details
- **Schedule Display**: Visual schedule representation
- **Booking List**: Current and upcoming bookings
- **Capacity Status**: Available spots and waitlist
- **Quick Actions**: Edit, duplicate, deactivate

### 5.3 Navigation Structure
```
Dashboard
├── Students
├── Locations
├── Classes (Unified)
├── Packages
├── Bookings
└── Transactions
```

---

## 6. Feature Specifications

### 6.1 Class Management

#### 6.1.1 Create Class
- **Required Fields**: Name, location, day, time, capacity, price, credits
- **Optional Fields**: Description, end date for recurring classes
- **Validation**: Time conflicts, location availability, valid dates
- **Default Values**: Active = true, recurring = true

#### 6.1.2 Edit Class
- **Full Edit**: All fields editable
- **Schedule Changes**: Handle existing bookings when schedule changes
- **Capacity Changes**: Notify affected students if capacity reduced
- **Price Changes**: Apply to future bookings only

#### 6.1.3 Delete/Deactivate Class
- **Soft Delete**: Deactivate instead of hard delete
- **Booking Impact**: Handle existing bookings
- **Student Notification**: Inform affected students
- **Data Preservation**: Keep historical data

### 6.2 Scheduling Features

#### 6.2.1 Recurring Classes
- **Weekly Pattern**: Same day/time each week
- **Date Range**: Optional start/end dates
- **Holiday Handling**: Skip specific dates
- **Exception Dates**: One-time cancellations

#### 6.2.2 One-Off Classes
- **Single Instance**: One-time class events
- **Special Events**: Workshops, special sessions
- **Flexible Timing**: Any day/time combination
- **No Recurring Logic**: Simplified management

#### 6.2.3 Schedule Conflicts
- **Location Conflicts**: Prevent double-booking locations
- **Time Overlaps**: Detect and warn about time conflicts
- **Teacher Conflicts**: Future: prevent teacher double-booking
- **Student Conflicts**: Future: prevent student double-booking

### 6.3 Booking Integration

#### 6.3.1 Direct Booking
- **From Class List**: Book directly from class card
- **From Class Detail**: Detailed booking view
- **Credit Check**: Verify student has sufficient credits
- **Capacity Check**: Verify class has available spots

#### 6.3.2 Booking Management
- **Booking Status**: Confirmed, cancelled, completed, no-show
- **Credit Deduction**: Automatic credit deduction on booking
- **Booking History**: Complete booking records
- **Cancellation Policy**: Handle cancellations and refunds

---

## 7. Implementation Roadmap

### 7.1 Phase 2: Unified Class System (Current)
**Timeline**: December 2024 - January 2025

#### 7.1.1 Week 1-2: Core Class Management
- [ ] Update database schema (remove ClassType, Schedule)
- [ ] Create enhanced ClassDocument interface
- [ ] Implement useClasses composable
- [ ] Create ClassForm component with integrated scheduling
- [ ] Build ClassCard component

#### 7.1.2 Week 3-4: Class Pages & UI
- [ ] Create `/classes` list page
- [ ] Implement search and filtering
- [ ] Add class detail page (`/classes/[id]`)
- [ ] Create class edit functionality
- [ ] Add delete/deactivate features

#### 7.1.3 Week 5-6: Advanced Features
- [ ] Implement schedule conflict detection
- [ ] Add recurring class logic
- [ ] Create weekly calendar view
- [ ] Add bulk operations (duplicate, batch edit)
- [ ] Implement class status management

### 7.2 Phase 3: Booking System (Planned)
**Timeline**: January 2025 - February 2025

#### 7.2.1 Booking Core
- [ ] Create BookingDocument interface
- [ ] Implement useBookings composable
- [ ] Build booking form and validation
- [ ] Create booking list and detail views

#### 7.2.2 Booking Integration
- [ ] Integrate booking with class system
- [ ] Implement credit management
- [ ] Add capacity tracking
- [ ] Create booking notifications

### 7.3 Phase 4: Transactions & Reporting (Planned)
**Timeline**: February 2025 - March 2025

#### 7.4.1 Transaction System
- [ ] Create TransactionDocument interface
- [ ] Implement payment tracking
- [ ] Add refund and credit adjustment
- [ ] Create financial reports

#### 7.4.2 Advanced Features
- [ ] Email/SMS notifications
- [ ] Data export functionality
- [ ] Backup and restore features
- [ ] Performance optimizations

---

## 8. Success Metrics

### 8.1 User Experience Metrics
- **Setup Time**: < 5 minutes to create first class
- **Task Completion**: > 90% success rate for common tasks
- **User Satisfaction**: > 4.5/5 rating for ease of use
- **Mobile Performance**: < 2 second load times

### 8.2 Technical Metrics
- **Offline Functionality**: 100% core features work offline
- **Data Integrity**: Zero data loss incidents
- **Performance**: Smooth 60fps interactions
- **Accessibility**: WCAG 2.1 AA compliance

### 8.3 Business Metrics
- **Adoption Rate**: > 80% feature adoption within 30 days
- **Retention**: > 90% monthly active users
- **Support Requests**: < 5% of users require support
- **Feature Usage**: > 70% of users use core features weekly

---

## 9. Risk Assessment

### 9.1 Technical Risks
- **PouchDB Limitations**: Local storage limits on mobile devices
- **Sync Complexity**: Future CouchDB integration challenges
- **Performance**: Large dataset handling on mobile devices
- **Browser Compatibility**: PouchDB support across browsers

### 9.2 Mitigation Strategies
- **Data Optimization**: Efficient data structures and indexing
- **Progressive Enhancement**: Graceful degradation for older devices
- **Testing Strategy**: Comprehensive mobile and browser testing
- **Backup Strategy**: Local backup and export capabilities

### 9.3 User Experience Risks
- **Learning Curve**: Users accustomed to traditional systems
- **Feature Overload**: Too many options overwhelming users
- **Mobile Limitations**: Screen size constraints
- **Offline Confusion**: Users expecting cloud sync

### 9.4 Mitigation Strategies
- **Onboarding**: Guided setup and tutorials
- **Progressive Disclosure**: Show advanced features only when needed
- **Mobile-First Design**: Optimize for mobile workflows
- **Clear Communication**: Explain offline-first benefits

---

## 10. Conclusion

The unified Class & Schedule system represents a significant improvement in user experience for solo teachers and small studios. By combining traditionally separate concepts into a single, intuitive interface, we reduce setup complexity while maintaining flexibility and power.

The local-first architecture ensures data ownership and offline functionality, while the mobile-first design optimizes for the most common use case. This approach positions the application as a modern, user-friendly alternative to complex enterprise systems.

The implementation roadmap provides a clear path forward, with each phase building upon the previous one to create a comprehensive student management solution.