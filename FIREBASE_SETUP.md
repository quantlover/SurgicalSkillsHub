# Firebase Setup Guide for SutureLearn

This guide will help you set up Firebase Authentication and Firestore with maximum security for your SutureLearn application.

## Prerequisites

- A Google account
- Firebase CLI (optional, for deployment)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter "SutureLearn" as project name
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set up Authentication

1. In your Firebase project console, click "Authentication" in the left sidebar
2. Click "Get started" if it's your first time
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Toggle "Enable" to ON
6. Enter your project support email
7. Click "Save"

## Step 3: Configure Authorized Domains

1. In Authentication → Settings → Authorized domains
2. Click "Add domain"
3. Add your Replit development URL (e.g., `your-repl-name.replit.dev`)
4. After deployment, add your production domain (e.g., `your-app.replit.app`)

## Step 4: Set up Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" for maximum security
4. Select a location closest to your users
5. Click "Done"

## Step 5: Deploy Security Rules

Copy the contents from `firestore.rules` file in your project and paste them into the Firestore Rules tab:

1. Go to Firestore Database → Rules
2. Replace the default rules with the content from `firestore.rules`
3. Click "Publish"

## Step 6: Get Configuration Values

1. Go to Project Settings (gear icon in left sidebar)
2. Scroll down to "Your apps" section
3. Click on the web app icon (</>)
4. Enter "SutureLearn Web" as app name
5. Copy the configuration values:
   - `apiKey`
   - `projectId` 
   - `appId`

## Step 7: Add Secrets to Replit

In your Replit project:

1. Open the Secrets tab (lock icon in left sidebar)
2. Add these three secrets:
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `VITE_FIREBASE_APP_ID`: Your Firebase app ID

## Security Features Implemented

### Authentication Security
- Google OAuth only (no password-based auth)
- Automatic session management
- Secure token handling
- Automatic sign-out on token expiration

### Firestore Security Rules
- **Zero access for unauthenticated users**
- Role-based access control (RBAC)
- Users can only access their own data
- Evaluators can only create/edit their feedback
- Researchers and admins have read-only analytics access
- Strict validation on all write operations

### Data Protection
- All user data is scoped to authenticated users only
- Cross-user data access is prevented
- Role validation on all operations
- Automatic user profile creation with minimal data

## Testing the Setup

1. Restart your Replit application
2. Visit your app URL
3. Click "Sign In with Google"
4. You should be redirected to Google OAuth
5. After signing in, you should see the role selection page
6. Test accessing different dashboards

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to Authorized domains in Firebase Auth settings

2. **"Missing or insufficient permissions"**
   - Check that Firestore rules are properly deployed
   - Verify user authentication status

3. **"FirebaseError: Firebase: No Firebase App"**
   - Verify all three environment variables are set correctly
   - Restart the Replit application

### Debugging

Enable Firebase debugging by adding this to your browser console:
```javascript
firebase.firestore().enableNetwork();
```

For authentication debugging:
```javascript
firebase.auth().onAuthStateChanged(user => console.log('Auth state:', user));
```

## Production Deployment

When deploying to production:

1. Add your production domain to Firebase Authorized domains
2. Ensure all secrets are properly configured in production environment
3. Monitor Firebase Console for authentication and database usage
4. Set up Firebase usage alerts for billing protection

## Security Best Practices

1. **Never expose Firebase config in client code** - Use environment variables
2. **Regularly review Firestore security rules** - Test with Firebase Rules Playground
3. **Monitor authentication logs** - Check for suspicious activity
4. **Set up billing alerts** - Prevent unexpected charges
5. **Use least privilege principle** - Give users minimum required permissions

Your SutureLearn application now has enterprise-level security with Firebase!