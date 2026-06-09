# Development Guide - Omar Clinic Pro

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- GitHub account (already set up)
- Supabase account (ready)
- Vercel account (ready)
- Clerk account (to be set up)
- Resend account (to be set up)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/omaralafahgane/omar-clinic-pro.git
cd omar-clinic-pro
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

#### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Then fill in the values from your services:
- Supabase credentials
- Clerk credentials
- Resend API key

#### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` in your browser.

## 📁 Project Structure

```
omar-clinic-pro/
├── app/                          # Next.js app directory
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── patients/           # Patient endpoints
│   │   ├── appointments/       # Appointment endpoints
│   │   └── emails/             # Email endpoints
│   ├── (auth)/                 # Auth pages (login, signup)
│   ├── (dashboard)/            # Dashboard pages (protected)
│   ├── (landing)/              # Landing pages (public)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable React components
│   ├── ui/                     # UI components
│   ├── auth/                   # Auth components
│   ├── dashboard/              # Dashboard components
│   └── landing/                # Landing page components
├── lib/                         # Utility functions
│   ├── supabase.ts            # Supabase client
│   ├── clerk.ts               # Clerk utilities
│   ├── resend.ts              # Resend utilities
│   └── utils.ts               # General utilities
├── types/                       # TypeScript type definitions
│   ├── database.ts            # Database types
│   ├── api.ts                 # API types
│   └── user.ts                # User types
├── styles/                      # Global styles
│   └── globals.css            # Global CSS
├── public/                      # Static assets
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
└── next.config.ts              # Next.js config
```

## 🔄 Git Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/feature-name
```

### Making Commits

```bash
git add .
git commit -m "feat: Add new feature description"
```

### Pushing Changes

```bash
git push origin feature/feature-name
```

### Creating a Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Add description
5. Submit for review

### Commit Message Format

Follow conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🏗️ Building for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## 📊 Project Board

Track all tasks on GitHub Project Board:
- https://github.com/omaralafahgane/omar-clinic-pro/projects

## 🔗 Important Links

- **Repository:** https://github.com/omaralafahgane/omar-clinic-pro
- **Project Board:** https://github.com/omaralafahgane/omar-clinic-pro/projects
- **Issues:** https://github.com/omaralafahgane/omar-clinic-pro/issues
- **Vercel Dashboard:** https://vercel.com
- **Supabase Dashboard:** https://supabase.com
- **Clerk Dashboard:** https://dashboard.clerk.com

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

```bash
# Restart development server
npm run dev
```

## 📝 Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Format code with Prettier
- Use meaningful variable names
- Add comments for complex logic

## 🚀 Deployment

### Automatic Deployment

1. Push to `main` branch
2. GitHub automatically triggers Vercel build
3. Vercel deploys to production

### Manual Deployment

```bash
# Deploy to Vercel
vercel deploy --prod
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated:** June 2026
