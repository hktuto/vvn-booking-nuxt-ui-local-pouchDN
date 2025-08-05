# VVN Booking - Student Management System

A modern, mobile-first student management application built with **Nuxt v4**, designed for teachers and fitness studios. Manage students, packages, classes, and bookings with local-first PouchDB storage.

## 🚀 Features

- **📱 Mobile-First Design**: Optimized for mobile devices with PWA support
- **🔐 User Authentication**: Secure login/registration system
- **👥 Student Management**: Complete student profiles with contact info and credits
- **📦 Package System**: Flexible package management with credit tracking
- **📅 Class Scheduling**: Advanced scheduling with recurring classes
- **📋 Booking Management**: Real-time booking system with capacity tracking
- **💰 Transaction Tracking**: Comprehensive financial tracking
- **📍 Location Management**: Multi-location support
- **🌐 Internationalization**: English and Traditional Chinese support
- **🌙 Dark Mode**: Automatic dark/light mode switching
- **📊 Offline-First**: Works offline with local PouchDB storage

## 🛠 Tech Stack

- **Framework**: [Nuxt v4](https://nuxt.com/) - Vue.js framework
- **UI Library**: [Nuxt UI](https://ui.nuxt.com/) - Modern UI components
- **Database**: [PouchDB](https://pouchdb.com/) - Local-first database
- **State Management**: Nuxt useState - Built-in reactive state
- **TypeScript**: Full type safety
- **PWA**: Progressive Web App capabilities
- **Styling**: Tailwind CSS with dark mode support

## 🏗 Architecture

### Conditional Database Initialization

Our application uses a sophisticated conditional PouchDB initialization system:

- **User-Specific Databases**: Each user gets isolated databases
- **Lazy Loading**: Databases only initialize when needed
- **Authentication-Based**: Database access restricted to authenticated users
- **Automatic Indexing**: Indexes created automatically for optimal performance

### Database Structure

```
User-Specific Databases:
├── {userId}_students
├── {userId}_packages  
├── {userId}_classes
├── {userId}_bookings
├── {userId}_transactions
├── {userId}_locations
└── {userId}_student_packages

Shared Databases:
└── users (for authentication)
```

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd student-zero-sync

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# App configuration
NUXT_PUBLIC_APP_NAME="VVN Booking"
NUXT_PUBLIC_APP_DESCRIPTION="Student Management System"

# PWA configuration
NUXT_PUBLIC_PWA_NAME="VVN Booking"
NUXT_PUBLIC_PWA_SHORT_NAME="VVN Booking"
```

### Nuxt Configuration

The application is configured in `nuxt.config.ts` with:

- **SSR Disabled**: Client-side only for PouchDB compatibility
- **PWA Support**: Progressive Web App features
- **Internationalization**: i18n setup for multiple languages
- **UI Framework**: Nuxt UI integration
- **TypeScript**: Strict type checking

## 🚀 Usage

### First Time Setup

1. **Register**: Create your first admin account
2. **Configure**: Set up your locations and class types
3. **Add Students**: Start adding students to your system
4. **Create Packages**: Set up package offerings
5. **Schedule Classes**: Create your class schedule
6. **Start Booking**: Begin taking student bookings

### Key Workflows

#### Student Management
```typescript
// Add a new student
const { addStudent } = useStudents()
await addStudent({
  name: 'John Doe',
  phone: '+85212345678',
  email: 'john@example.com',
  // ... other fields
})
```

#### Package Management
```typescript
// Create a package
const { addPackage } = usePackages()
await addPackage({
  name: '10-Class Package',
  credits: 10,
  price: 800,
  duration_days: 90,
  // ... other fields
})
```

#### Booking System
```typescript
// Book a student for a class
const { addStudentToBooking } = useBookings()
await addStudentToBooking(bookingId, studentId, creditsUsed, notes)
```

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Install Prompt**: Users can install as native app
- **Background Sync**: Automatic data synchronization
- **Push Notifications**: Real-time updates (future feature)

## 🌐 Internationalization

The application supports multiple languages:

- **English** (en)
- **Traditional Chinese** (zh-Hant)

Language switching is available throughout the application.

## 🔒 Security

- **User Isolation**: Each user's data is completely separated
- **Authentication Required**: Database access restricted to authenticated users
- **Local Storage**: All data stored locally on user's device
- **No Server Dependencies**: No external API calls or data transmission

## 📊 Performance

- **Lazy Loading**: Databases only initialize when needed
- **Automatic Indexing**: Optimized database queries
- **Conditional Initialization**: Public pages don't load databases
- **Memory Efficient**: Minimal memory footprint for unused features

## 🧪 Development

### Project Structure

```
student-zero-sync/
├── app/
│   ├── components/     # Vue components
│   ├── composables/    # Business logic composables
│   ├── pages/          # Application pages
│   ├── utils/          # Utility functions
│   ├── layouts/        # Page layouts
│   ├── middleware/     # Route middleware
│   └── assets/         # Static assets
├── i18n/               # Internationalization
├── docs/               # Documentation
└── public/             # Public assets
```

### Key Composable Pattern

```typescript
// Example: useStudents composable
export const useStudents = () => {
  const { getDB } = useStudentDB()
  
  const loadStudents = async () => {
    const studentsDB = await getDB() // DB and indexes automatically ready
    const studentsCRUD = usePouchCRUD<StudentDocument>(studentsDB)
    return await studentsCRUD.findAll('student')
  }
  
  return { loadStudents }
}
```

### Error Handling

The application uses Nuxt v4's `NuxtErrorBoundary` for global error handling:

```vue
<template>
  <NuxtErrorBoundary>
    <!-- Your app content -->
    <template #error="{ error, clearError }">
      <!-- Error UI -->
    </template>
  </NuxtErrorBoundary>
</template>
```

## 🚀 Deployment

### Build for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

### PWA Deployment

The application can be deployed to any static hosting service:

- **Vercel**: Automatic PWA deployment
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting option
- **Firebase Hosting**: Google's hosting solution

## 📚 Documentation

- [Conditional PouchDB System](./docs/CONDITIONAL_POUCHDB.md) - Database architecture
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Data structure documentation
- [Development Roadmap](./docs/DEVELOPMENT_ROADMAP.md) - Future development plans
- [Transaction Filters](./docs/TRANSACTION_FILTERS.md) - Financial reporting features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check the [documentation](./docs/)
- Review the [development roadmap](./docs/DEVELOPMENT_ROADMAP.md)
- Open an issue on GitHub

## 🔄 Version History

### v2.0.0 (Current)
- **Nuxt v4** upgrade
- **Conditional PouchDB** initialization
- **User-specific databases**
- **Global error handling** with NuxtErrorBoundary
- **Performance optimizations**

### v1.0.0
- Initial release
- Basic student management
- Class scheduling
- Booking system

---

Built with ❤️ using Nuxt v4 and PouchDB
  
