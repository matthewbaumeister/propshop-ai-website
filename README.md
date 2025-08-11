# Prop Shop AI - AI-Powered Property Management Platform

A professional B2B property management platform built with modern web technologies and AI capabilities.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Ready for Vercel/Netlify

## ✨ Features

- **Modern Design**: Inspired by enterprise B2B platforms like Scale.com
- **Responsive Layout**: Mobile-first design with professional aesthetics
- **AI Integration**: Ready for AI-powered property management features
- **Dashboard**: Comprehensive B2B tooling interface
- **Authentication**: Built-in user management with Supabase
- **Real-time Data**: Supabase real-time subscriptions
- **Type Safety**: Full TypeScript implementation

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database and auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd propshop-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME="Prop Shop AI"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # B2B dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── layout/           # Layout components (Header, DashboardLayout)
│   ├── sections/         # Page sections (Hero, AICapabilities)
│   └── ui/              # shadcn/ui components
└── lib/                  # Utility functions
    ├── supabase.ts       # Supabase client configuration
    └── utils.ts          # General utilities
```

## 🎨 Design System

The website uses a professional design system inspired by enterprise B2B platforms:

- **Color Palette**: Blue and purple gradients with neutral grays
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Consistent UI components from shadcn/ui
- **Spacing**: Systematic spacing using Tailwind's scale
- **Shadows**: Subtle shadows for depth and hierarchy

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The app is compatible with:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📈 Next Steps

### Immediate (Week 1-2)
1. **Set up Supabase project**
   - Create new Supabase project
   - Configure authentication
   - Set up database tables for properties, tenants, etc.

2. **Add authentication**
   - Implement login/signup flows
   - Add protected routes
   - Set up user profiles

3. **Create database schema**
   - Properties table
   - Tenants table
   - Maintenance tickets
   - Financial records

### Short-term (Month 1)
1. **Build core features**
   - Property management CRUD
   - Tenant management
   - Maintenance tracking
   - Financial reporting

2. **Add AI features**
   - Property valuation AI
   - Market analysis
   - Predictive maintenance
   - Content generation

3. **Implement real-time features**
   - Live notifications
   - Real-time updates
   - Chat functionality

### Long-term (Month 2-3)
1. **Advanced AI capabilities**
   - Custom model fine-tuning
   - Advanced analytics
   - Predictive insights

2. **Enterprise features**
   - Multi-tenant architecture
   - Advanced permissions
   - API integrations
   - White-label options

## 🔒 Security

- Row Level Security (RLS) in Supabase
- Environment variable protection
- Type-safe database queries
- Input validation and sanitization

## 📞 Support

For questions or support:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📄 License

This project is proprietary software for Prop Shop AI.

---

Built with ❤️ using Next.js, TypeScript, and Supabase
