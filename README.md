# Theater Ticketing Platform

A full-stack nonprofit theater ticketing system built with React, Node.js, Express, PostgreSQL, and Stripe.

## Features

### User Features
- Browse upcoming shows
- Interactive seat map (350 seats in ~20 rows)
- Multiple ticket types (adult, student, free)
- Stripe payment integration
- Digital tickets with QR codes
- Mobile-optimized experience

### Admin Features
- Manage shows (CRUD operations)
- Block or reserve seats
- View sales reports
- QR code scanning for check-in
- Seat management

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router
- React Query (TanStack Query)
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Stripe API
- QR Code Generation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (local or cloud)
- Stripe account
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd theater-ticketing
```

2. **Set up Backend**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma migrate dev

# Seed database (creates admin user and sample show)
npm run db:seed

# Start development server
npm run dev
```

3. **Set up Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

4. **Configure Environment Variables**

Backend `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/theater_tickets"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Default Admin Credentials
- Email: `admin@theater.com`
- Password: `admin123`

## Project Structure

```
theater-ticketing/
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   └── server.js      # Express server
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Database seed
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context
│   │   └── App.jsx        # Main app
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Shows
- `GET /api/shows` - Get all shows
- `GET /api/shows/:id` - Get single show
- `POST /api/shows` - Create show (admin)
- `PUT /api/shows/:id` - Update show (admin)
- `DELETE /api/shows/:id` - Delete show (admin)

### Tickets
- `GET /api/tickets/my-tickets` - Get user's tickets
- `GET /api/tickets/:id` - Get ticket details
- `GET /api/tickets/:id/qr` - Get QR code

### Stripe
- `POST /api/stripe/create-checkout-session` - Create checkout
- `POST /api/stripe/webhook` - Stripe webhook

### Admin
- `GET /api/admin/reports/show/:showId` - Sales report
- `POST /api/admin/scan` - Scan QR code

## Development

### Running in Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Database Management
```bash
# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Reset database
npx prisma migrate reset
```

## Deployment

### Backend Deployment (AWS EC2 / Render)
1. Set environment variables
2. Run migrations
3. Start server with `npm start`

### Frontend Deployment (Netlify / Vercel)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables

### Database (Supabase / AWS RDS)
1. Create PostgreSQL database
2. Update `DATABASE_URL` in backend
3. Run migrations

## Stripe Setup

1. Create Stripe account
2. Get API keys from dashboard
3. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
4. Copy webhook secret to `.env`

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
