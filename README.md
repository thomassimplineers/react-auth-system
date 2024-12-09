# React Auth System with Supabase UI

A modern authentication system built with React, Tailwind CSS, and Supabase UI.

## Features

- Modern UI with Supabase UI components
- Social login support (Google, GitHub)
- Email/Password authentication
- Protected routes
- Error handling with toast notifications
- Loading states
- Responsive design

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment variables are already configured with:
   ```
   REACT_APP_SUPABASE_URL=https://ebwvhbxlmfcytfqzzejb.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=[your-existing-key]
   ```

## Development

```bash
npm start
```

## Social Login Setup

### Google Setup:
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google
3. Configure OAuth in Google Cloud Console:
   - Create project if needed
   - Enable Google+ API
   - Set up OAuth consent screen
   - Create credentials
   - Add authorized redirect URI from Supabase
   - Copy Client ID and Secret to Supabase

### GitHub Setup:
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable GitHub
3. In GitHub:
   - Go to Settings > Developer settings
   - Create OAuth App
   - Add callback URL from Supabase
   - Copy Client ID and Secret to Supabase

## Error Handling

The app includes:
- Error boundaries for React errors
- Toast notifications for auth events
- Loading states for async operations

## File Structure

```
src/
  ├── components/
  │   ├── Auth/
  │   │   ├── LoginForm.jsx
  │   │   ├── SignUpForm.jsx
  │   │   └── ProtectedRoute.jsx
  │   └── ErrorBoundary.jsx
  ├── contexts/
  │   └── AuthContext.jsx
  ├── lib/
  │   └── supabaseClient.js
  └── App.jsx
```

## License

MIT