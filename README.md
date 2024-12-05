# React Authentication & Chat System

A modern real-time chat application built with React, Supabase, and Tailwind CSS. This application provides a secure and interactive platform for real-time communication with features like user authentication, thread-based messaging, and file sharing.

## Features

### Authentication
- User registration and login
- Profile management with avatars
- Secure authentication via Supabase
- Password reset functionality
- Email verification

### Chat Functionality
- Real-time messaging
- Thread-based conversations
- Image sharing capabilities
- User online/offline status
- Message timestamps
- Real-time typing indicators

### UI/UX
- Modern, responsive design
- Thread management
- User presence indicators
- Image upload and preview
- Error handling and loading states
- Clean and intuitive interface

## Tech Stack
- React (Frontend Framework)
- Supabase (Backend & Authentication)
- Tailwind CSS (Styling)
- Real-time subscriptions
- Vercel (Hosting & Deployment)
- PostgreSQL (Database via Supabase)

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
### Authentication Configuration
- Enable Email authentication
- Configure auth redirects
- Set up email templates

### Database Tables
- `messages` (Chat messages)
- `threads` (Conversation threads)
- `profiles` (User profiles with avatars)
- `user_status` (Online/offline tracking)

### Storage Buckets
- `avatars` (User profile pictures)
- `chat-images` (Shared images in chat)

## Environment Setup
### Development
```bash
npm install    # Install dependencies
npm start      # Start development server
npm run build  # Create production build
```

### Production Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel
3. Deploy application

## Deployment
Currently deployed on Vercel at [your-url-here]

## Security Features
- Secure authentication flow
- Protected API endpoints
- Row Level Security in Supabase
- Secure file upload handling

## Future Improvements
- Mobile responsiveness enhancement
- Dark mode support
- Message reactions
- File attachments
- Voice messages
- Group chat functionality
- Message search
- Admin dashboard

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is open source and available under the MIT License.