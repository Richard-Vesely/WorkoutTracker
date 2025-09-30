# 💪 Workout Tracker - Next.js + Supabase + Vercel

A modern, responsive workout tracking web application built with Next.js, Supabase, and deployed on Vercel. Features PWA support for mobile installation and real-time data synchronization.

🎯 **Auto-deployment test**: This change will trigger automatic Vercel deployment!

## 🚀 Features

- ✅ **Responsive Design** - Works perfectly on mobile and desktop
- ✅ **PWA Support** - Install on your phone like a native app
- ✅ **Real-time Sync** - Data syncs across all devices
- ✅ **Offline Support** - Continue workouts even without internet
- ✅ **Break Timer** - Automatic rest timer with audio notifications
- ✅ **Drop Sets** - Support for multiple weights per set
- ✅ **Progress Tracking** - Detailed workout history and statistics
- ✅ **Goal Management** - Update exercise goals on the fly

## 🏋️ Pre-configured Workouts

### Push (Chest + Shoulders)
- Bench Press - 4×10
- Incline Bench Press - 4×10  
- Overhead Press Dumbbell - 4×10
- Lateral Raises - 4×20
- Front Shoulders - 4×20

### Pull (Back + Biceps)
- Dumbbell Biceps Curl - 4×20
- Lat Pulldown - 4×20
- Biceps Machine - 4×20
- Triceps Pulldown - 4×20
- Back Extension - 4×15
- Abs - Balloon - 6×15

### Posterior Chain + Core
- Deadlift or Romanian Deadlift - 4×10
- Leg Press - 4×10
- Leg Back Curl - 4×20
- Leg Front Curl - 4×20
- Calf Press - 4×30

## 📋 Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- Git installed
- Supabase account
- Vercel account (for deployment)

### 2. Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd workout-tracker

# Install dependencies
npm install
```

### 3. Supabase Setup

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Wait for setup to complete

#### B. Set up Database
1. Go to your Supabase dashboard
2. Click "SQL Editor" in the sidebar
3. Copy the contents of `src/lib/database.sql`
4. Paste and run the SQL to create tables and sample data

#### C. Get API Keys
1. Go to "Settings" → "API" in your Supabase dashboard
2. Copy your project URL and anon public key

### 4. Environment Variables
```bash
# Copy the example file
cp env.local.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Local Development
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 6. Deploy to Vercel

#### A. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository

#### B. Configure Environment Variables
1. In Vercel dashboard, go to "Settings" → "Environment Variables"
2. Add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### C. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app is live! 🎉

## 📱 Mobile Installation (PWA)

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

### Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **PWA**: next-pwa
- **Deployment**: Vercel
- **Icons**: Lucide React

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── HomeScreen.tsx
│   ├── RoutineSelection.tsx
│   ├── WorkoutInterface.tsx
│   └── BreakTimer.tsx
└── lib/                # Utilities
    ├── supabase.ts     # Supabase client
    ├── store.ts        # Zustand store
    └── database.sql    # Database schema
```

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive data
- HTTPS enforced in production

## 🎯 Usage

1. **Start Workout**: Select from pre-configured routines
2. **Log Sets**: Enter weights, reps, and muscle feeling (1-5)
3. **Break Timer**: Automatic 2-minute timer with audio notification
4. **Progress**: Navigate between exercises, update goals
5. **Complete**: Finish workout and save to database

## 📊 Data Structure

The app uses a normalized database structure:
- `workout_routines` - Exercise routines
- `exercises` - Individual exercises per routine
- `workouts` - Workout sessions
- `workout_sets` - Individual sets with weights and reps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial use.

---

**Built with ❤️ for serious lifters** 💪
