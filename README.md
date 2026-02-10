# SkinSEOUL

AI-powered skin analysis with personalized K-Beauty product recommendations.

## Features

- **AI Skin Analysis** - Analyze 8 key skin concerns in seconds
- **Smart Recommendations** - Get ingredient suggestions based on your skin
- **K-Beauty Products** - Curated Korean skincare recommendations
- **Multi-Language** - Available in English, Japanese, Chinese
- **Privacy First** - Photos never stored, instant analysis
- **Always Free** - No subscriptions, no hidden fees

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI Vision API (GPT-4o)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/skinseoul-ai.git
cd skinseoul-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials

# Run database migrations (in Supabase SQL Editor)
# See docs/DATABASE_SCHEMA.md

# Seed database
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
skinseoul-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── analyze-skin/  # AI analysis endpoint
│   │   ├── products/      # Product queries
│   │   └── track-event/   # Analytics
│   ├── analyze/           # Analysis page
│   ├── results/           # Results page
│   ├── products/          # Products page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── sitemap.ts         # Sitemap generation
│   └── manifest.ts        # PWA manifest
├── components/            # React components
│   ├── layout/            # Header, Footer
│   ├── analyze/           # Camera, Upload
│   └── results/           # Share, Score
├── lib/                   # Utilities
│   ├── supabase/          # Database client
│   ├── openai.ts          # AI client
│   ├── prompts/           # AI prompts
│   └── recommendation/    # Business logic
├── scripts/               # Seed scripts
├── docs/                  # Documentation
└── public/                # Static assets
```

## Documentation

- [Product Requirements](docs/PRD.md)
- [Technical Stack](docs/TECH_STACK.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Specification](docs/API_SPECIFICATION.md)
- [Development Plan](docs/DEVELOPMENT_PLAN.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Testing Checklist](TESTING.md)

## Contributing

Contributions welcome! Please follow existing code style (ESLint + Prettier enforced).

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## Disclaimer

> **SkinSEOUL is for educational and entertainment purposes only.**
>
> This application is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a qualified dermatologist for medical skin concerns.

## License

MIT License - see [LICENSE](LICENSE)

## Contact

- Website: https://skinseoul.vercel.app
- Email: contact@skinseoul.ai

---

Made with love and K-Beauty science
