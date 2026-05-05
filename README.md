# 🍀 Gawa Tara?

**Rooted Warmth** — a calm, human-centered task manager that respects your time and energy.  
Plan, prioritize, and reflect without the digital noise.

## 📝 Description

Gawa Tara? is a modern, AI-powered task management application built with Next.js 16 and Supabase It helps users organize their daily tasks with features like priority-based task creation, smart scheduling, habit tracking, and daily check-ins. The app features a warm, minimalist UI inspired by nature, promoting a calm and focused approach to productivity.

## ✨ Key Features

- **AI-Powered Task Creation**: prioritize tasks based on user input and energy levels.
- **Flexible Login**: User can login using their google account or Linkedin.
- **Habit Tracking**: Build positive habits with daily tracking and streak monitoring.
- **Daily Check-ins**: Rate your energy, focus, and stress to get personalized insights and task adjustments.
- **Tag-Based Organization**: Organize tasks with custom tags and colors.
- **Warm, Minimalist UI**: A calming interface with a "Rooted Warmth" aesthetic.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org)
- **Database**: [Supabase](https://supabase.com)
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com), [Shadcn UI](https://ui.shadcn.com)
- **State Management**: React Hooks
- **Data Fetching**: Server Actions, Fetch API

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** 20.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **Supabase Account**: For database and authentication


### 1. Clone the repository
```bash
git clone 
cd gawa-tara
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set up environment variables
Create a `.env` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
gawa-tara/
├── app/                     # Next.js App Router pages
│   ├── (dashboard)/        # Authenticated user routes
│   │   ├── home/
│   │   ├── planner/
│   │   ├── create/
│   │   └── settings/
│   ├── login/              # Login and authentication pages
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # Reusable React components
│   ├── ui/                 # UI primitives (shadcn/ui)
│   └── features/           # Feature-specific components
├── lib/                    # Utility functions and helpers
│   ├── supabase/           # Supabase client and utilities
│   ├── utils/              # General utilities
├── prisma/                 # Prisma ORM configuration
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── styles/                 # Global styles
├── .env                    # Local environment variables (not version controlled)
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## 📖 API Endpoints

### Task Management
- `POST /api/tasks`: Create a new task
- `GET /api/tasks`: Get all tasks
- `GET /api/tasks/[id]`: Get a specific task
- `PUT /api/tasks/[id]`: Update a task
- `DELETE /api/tasks/[id]`: Delete a task

### Scheduling
- `POST /api/schedule`: Create a new schedule block
- `GET /api/schedule`: Get all schedule blocks
- `POST /api/schedule/generate`: Generate a schedule for a date range
- `DELETE /api/schedule/[id]`: Delete a schedule block

### Habits
- `POST /api/habits`: Create a new habit
- `GET /api/habits`: Get all habits
- `POST /api/habits/[id]/log`: Log a habit completion

### Check-ins
- `POST /api/checkin`: Log a daily check-in
- `GET /api/checkin`: Get check-ins for a date range

### User
- `GET /api/user`: Get current user profile
- `POST /api/user/sync-avatar`: Sync user avatar from Supabase
- `POST /api/user/upload`: Upload user avatar

## 🧩 Key Concepts

### Energy-Aware Task Prioritization
Tasks are assigned priority levels (DO, SCHEDULE, DELEGATE, URGENT, DELETE) based on:
- **User's current energy level** (from daily check-ins)
- **Task due date**
- **Task duration**
- **User's schedule availability**

### Smart Scheduling
When generating a schedule, the system considers:
- **Time blocking**: Assigns specific time slots for tasks
- **Buffer time**: Adds breaks between tasks
- **Energy levels**: Schedules high-focus tasks during high-energy periods
- **Task dependencies**: Respects existing commitments

### Habit Tracking
Habits can be:
- **Daily**: Tracked every day
- **Weekly**: Tracked on specific days of the week
- **Specific days**: Tracked on custom dates
- **Streak-based**: Encourages consistency


## 🚀 Deployment

### Vercel
1. Sign in to [Vercel](https://vercel.com)
2. Import the repository
3. Configure environment variables
4. Deploy!

### Supabase
1. Set up your Supabase project
2. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
3. Seed the database (if needed):
   ```bash
   npx prisma db seed
   ```

## ⚖️ License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details.