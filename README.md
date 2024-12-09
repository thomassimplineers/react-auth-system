# React Auth System with Supabase UI

A modern authentication system built with React, Tailwind CSS, and Supabase UI.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your .env file has the correct Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=https://ebwvhbxlmfcytfqzzejb.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

## Social Login Setup

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers
3. Configure each provider:

### Google:
1. Enable Google provider
2. Go to Google Cloud Console
3. Create a new project or use existing
4. Enable Google+ API
5. Configure OAuth consent screen
6. Create credentials (OAuth client ID)
7. Add authorized redirect URI from Supabase
8. Copy Client ID and Secret back to Supabase

### GitHub:
1. Enable GitHub provider
2. Go to GitHub Settings > Developer settings
3. Create new OAuth App
4. Add homepage URL and callback URL from Supabase
5. Copy Client ID and Secret to Supabase

## Features

- Modern UI with Supabase UI components
- Social login support (Google, GitHub)
- Email/Password authentication
- Protected routes
- Error handling with toasts
- Loading states
- Responsive design

## Development

```bash
npm start
```

## Building for Production

```bash
npm run build
```

## Error Handling

The app includes:
- Error boundaries for React errors
- Toast notifications for auth events
- Loading states for async operations

## License

MIT
