# replit.md

## Overview

SuturLearn is a comprehensive medical education platform designed to enhance suturing proficiency through interactive video learning, expert feedback, and progress tracking. The application serves four distinct user roles: learners, evaluators, researchers, and administrators, each with dedicated dashboards and functionalities.

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
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **File Upload**: Multer middleware for video/audio processing

### Key Design Decisions
1. **Monolithic Structure**: Single repository containing client, server, and shared code for simplified development and deployment
2. **Type Safety**: Full TypeScript implementation with shared schema definitions between frontend and backend
3. **Component-Based UI**: Modular component architecture using Radix UI primitives for accessibility and consistency
4. **Role-Based Access Control**: Flexible user role system supporting multiple roles per user

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **User Management**: Automatic user creation/updates with role assignment
- **Security**: HTTPS-only cookies with CSRF protection

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

1. **User Authentication**: Replit Auth → Session Creation → Role Assignment
2. **Video Upload**: File Upload → Processing → Database Storage → Metadata Extraction
3. **Feedback Loop**: Video Assignment → Evaluator Review → Rubric Completion → Learner Notification
4. **Progress Tracking**: Activity Recording → Analytics Calculation → Dashboard Display
5. **Data Export**: Query Aggregation → Format Conversion → Download Generation

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service
- **AI Services**: OpenAI API for speech-to-text transcription
- **File Processing**: Native Node.js file system operations

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
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **OPENAI_API_KEY**: OpenAI API access (optional, speech-to-text fallback)
- **REPLIT_DOMAINS**: Allowed domains for OIDC (required)

### Runtime
- **Development**: TSX for hot-reloading TypeScript execution
- **Production**: Node.js running bundled JavaScript with static file serving

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 06, 2025. Initial setup