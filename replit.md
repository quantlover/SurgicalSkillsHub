# replit.md

## Overview

SutureLearn is a comprehensive medical education platform designed to enhance suturing proficiency through interactive video learning, expert feedback, and progress tracking. The application serves four distinct user roles: learners, evaluators, researchers, and administrators, each with dedicated dashboards and functionalities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Spartan Green medical theme
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: Firebase Firestore with comprehensive security rules
- **Authentication**: Firebase Auth with Google OAuth
- **Session Management**: Firebase Authentication token management
- **File Upload**: Multer middleware for video/audio processing
- **Security**: Zero-trust architecture with role-based access control

### Key Design Decisions
1. **Monolithic Structure**: Single repository containing client, server, and shared code for simplified development and deployment
2. **Type Safety**: Full TypeScript implementation with shared schema definitions between frontend and backend
3. **Component-Based UI**: Modular component architecture using Radix UI primitives for accessibility and consistency
4. **Role-Based Access Control**: Flexible user role system supporting multiple roles per user

## Key Components

### Authentication System
- **Provider**: Firebase Auth with Google OAuth integration
- **Session Storage**: Firebase Authentication tokens with automatic management
- **User Management**: Automatic user profile creation in Firestore with role assignment
- **Security**: Maximum security with Firebase Auth tokens, no unauthorized access allowed

### Video Management
- **Upload**: Multer-based file upload with size and type validation (500MB limit)
- **Processing**: Basic video processing pipeline with duration extraction and thumbnail generation
- **Storage**: File system storage with database metadata tracking
- **Categories**: Support for "practice" and "reference" video types

### Feedback System
- **Rubric-Based**: Structured feedback with numerical ratings (1-5 scale)
- **Voice Input**: Browser-based speech recognition with OpenAI Whisper fallback
- **Text Feedback**: Rich text commentary with minimum length requirements
- **Review Workflow**: Pending assignment system for evaluators

### Progress Tracking
- **Metrics**: Video completion, feedback received, skill assessments
- **Analytics**: User progress visualization with charts and statistics
- **Learning Paths**: Structured progression through suturing techniques

## Data Flow

1. **User Authentication**: Google OAuth → Firebase Auth → Firestore Profile Creation → Role Assignment
2. **Video Upload**: File Upload → Processing → Firestore Storage → Metadata Extraction
3. **Feedback Loop**: Video Assignment → Evaluator Review → Rubric Completion → Learner Notification
4. **Progress Tracking**: Activity Recording → Analytics Calculation → Dashboard Display
5. **Data Export**: Secure Query Aggregation → Format Conversion → Download Generation
6. **Security Validation**: Every request validated against Firestore security rules

## External Dependencies

### Core Dependencies
- **Database**: Firebase Firestore with security rules
- **Authentication**: Firebase Auth with Google OAuth
- **AI Services**: OpenAI API for speech-to-text transcription
- **File Processing**: Native Node.js file system operations
- **Security**: Firebase security rules engine

### Development Dependencies
- **Build Tool**: Vite for frontend bundling
- **Database Migration**: Drizzle Kit for schema management
- **Type Checking**: TypeScript compiler
- **CSS Processing**: PostCSS with Tailwind CSS

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React application to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied during deployment

### Environment Configuration
- **VITE_FIREBASE_API_KEY**: Firebase API key (required)
- **VITE_FIREBASE_PROJECT_ID**: Firebase project ID (required)
- **VITE_FIREBASE_APP_ID**: Firebase app ID (required)
- **OPENAI_API_KEY**: OpenAI API access (optional, speech-to-text fallback)

### Runtime
- **Development**: TSX for hot-reloading TypeScript execution
- **Production**: Node.js running bundled JavaScript with static file serving

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 06, 2025. Initial setup
- August 16, 2025. Implemented maximum security with Firebase Auth and Firestore. Zero unauthorized access allowed, comprehensive role-based security rules, Google OAuth integration.
- August 16, 2025. Completed comprehensive video analytics system with detailed performance metrics, engagement tracking, learning progress analysis, and full export report functionality. Analytics dashboard accessible at `/analytics` with real-time tracking capabilities.