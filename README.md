# Dead Man's Bomb - Frontend

React frontend for the Dead Man's Bomb posthumous message delivery service.

## Tech Stack

- **React 18** + TypeScript
- **Vite 5** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Zustand** - State management
- **React Query** - Server state & caching
- **React Hook Form** + Zod - Form handling & validation
- **Stripe Elements** - Payment UI
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/            # Reusable UI (Button, Input, Card, Modal, Badge)
│   │   └── layout/        # DashboardLayout, navigation
│   ├── pages/
│   │   ├── auth/          # Login, Register
│   │   ├── dashboard/     # Main dashboard
│   │   ├── messages/      # Create, list, detail views
│   │   ├── recipients/    # Recipient management
│   │   ├── checkins/      # Check-in status
│   │   ├── payments/      # Billing & subscriptions
│   │   └── settings/      # Profile, security, 2FA, sessions, data
│   ├── lib/
│   │   ├── api/           # Axios client & endpoint modules
│   │   └── utils.ts       # Helper functions
│   ├── store/             # Zustand auth store
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Router & route definitions
│   └── main.tsx           # Entry point
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Setup

### Prerequisites
- Node.js 20+

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL

# Start dev server
npm run dev
```

### Available Scripts

```bash
npm run dev        # Start development server (port 5173)
npm run build      # Type check + production build
npm run preview    # Preview production build
npm run lint       # ESLint check
npm run type-check # TypeScript type checking
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api/v1` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | - |

## Pages

- `/login` - User authentication
- `/register` - New account registration
- `/dashboard` - Overview with stats & recent activity
- `/messages` - Message list & management
- `/messages/create` - Create new message with rich text editor
- `/messages/:id` - Message detail view
- `/recipients` - Manage recipients & delivery channels
- `/checkins` - Check-in status & history
- `/payments` - Billing, plans & payment history
- `/settings` - Profile, security, 2FA, active sessions, data export

## License

Proprietary - All rights reserved
