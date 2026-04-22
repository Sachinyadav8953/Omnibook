# OmniBook Project Setup Guide

This guide provides step-by-step instructions to set up and run the OmniBook (Universal Booking Engine) project locally.

## 📋 Prerequisites

Before you start, ensure you have the following installed on your machine:
1. **Node.js** (v18.x or v20.x recommended)
2. **PostgreSQL** (v14 or newer)
3. **Redis** (v6 or newer)
4. **Git**

## 🚀 Step 1: Clone the Repository & Install Dependencies

Open your terminal or command prompt and run the following commands:

\```bash
# Navigate to your projects directory and clone the project
# git clone <repository-url>
cd omnibook

# Install all required npm dependencies
npm install
\```

## ⚙️ Step 2: Set Up Environment Variables

1. Inside the `omnibook` root directory, create a file named `.env` (if it doesn't already exist).
2. Add the following environment variables to the `.env` file. You may need to change the `DATABASE_URL` password based on your local PostgreSQL setup:

\```env
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/omnibook?schema=public"

# Redis connection URL
REDIS_URL="redis://localhost:6379"

# JWT Secret for authentication (you can keep this as is for local development)
JWT_SECRET="omnibook-change-this-to-a-very-long-random-string-in-production"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\```

## 🗄️ Step 3: Configure the Databases

To run this project, PostgreSQL must be running on port 5432 and Redis on port 6379. 
*(If you are using Docker, you can run them easily using `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres` and `docker run --name redis -p 6379:6379 -d redis`).*

1. **Run Database Migrations:**
   This command creates the required tables in your PostgreSQL database based on the Prisma schema.
   \```bash
   npx prisma migrate dev
   \```

2. **Seed the Database:**
   Populate your database with initial data (users, cities, hotels, movies, theatres).
   \```bash
   npm run db:seed
   \```

## 🌐 Step 4: Run the Development Server

Start the Next.js development server:

\```bash
npm run dev
\```

Your project will now be running on [http://localhost:3000](http://localhost:3000).

## 🧰 Useful Commands

Here are some helpful commands you can use during development:

- `npm run db:studio` - Opens Prisma Studio in your browser, a graphical interface to view and edit your PostgreSQL database.
- `npm run db:reset` - Drops the database, runs migrations from scratch, and re-seeds it. Useful if your data gets messed up.
- `npm run lint` - Runs ESLint to find issues in your code.
- `npm run build` - Builds the project for production.

## 📝 To save this guide as a PDF:
If you need this as a PDF, you can simply open this `SETUP.md` file in **VS Code**, right-click the preview, and select "Print", then choose "Save as PDF". You can also view this directly on GitHub where it formats perfectly as a guide.
