# React Authentication & Chat System

A modern real-time chat application built with React, Supabase, and Tailwind CSS.

## Features

### Authentication
- User registration and login
- Profile management with avatars
- Secure authentication via Supabase

### Chat Functionality
- Real-time messaging
- Thread-based conversations
- Image sharing capabilities
- User online/offline status

### UI/UX
- Modern, responsive design
- Thread management
- User presence indicators
- Image upload and preview

## Tech Stack
- React
- Supabase (Backend & Authentication)
- Tailwind CSS (Styling)
- Real-time subscriptions

## Setup & Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server: `npm start`

## Supabase Setup Required
- Authentication configuration
- Database tables:
  - messages
  - threads
  - profiles
  - user_status

## Deployment
Currently deployed on Vercel at [your-url-here]

## Future Improvements
- Mobile responsiveness enhancement
- Dark mode support
- Message reactions
- File attachments