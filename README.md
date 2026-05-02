# OmniBook

OmniBook is a premium, full-stack unified booking platform designed to streamline travel discovery, hotel reservations, and cinema ticket bookings. Built with modern web technologies, it features an editorial-style UI with fluid animations, providing users with a sophisticated and seamless booking experience.

## 🌟 Key Features

- **Travel Discovery & Hotel Booking:** Explore a vast catalog of destinations with rich metadata. Includes multi-faceted filtering based on location, budget, and climate for seasonal travel recommendations.
- **Cinema Booking System:** A robust location-based cinema locator with interactive seat selection, clearly distinguishing between available and booked seats.
- **Secure Authentication:** Integrated with Clerk for seamless, secure user authentication and personalized dashboards.
- **Seamless Payments:** Integrated with Stripe for secure, fast, and reliable transaction processing.
- **Premium Aesthetics:** Editorial-style light theme utilizing glassmorphism, smooth Framer Motion animations, and responsive typography for an elevated user experience.

## 💻 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Frontend Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (via [Neon](https://neon.tech/))
- **Authentication:** [Clerk](https://clerk.com/)
- **Payments:** [Stripe](https://stripe.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun
- A PostgreSQL database (e.g., Neon)
- Clerk API keys
- Stripe API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/omnibook.git
   cd omnibook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Stripe Payments
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Initialize the Database**
   Run the following commands to apply Prisma migrations and seed the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🛠️ Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to catch syntax and style issues.
- `npm run db:migrate`: Applies Prisma migrations to your database.
- `npm run db:seed`: Seeds the database with initial destination and cinema data.
- `npm run db:studio`: Opens Prisma Studio to visually interact with your database.

## 📄 License

This project is licensed under the MIT License.
