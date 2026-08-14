# VibePort

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/xodapi/vibeport/actions/workflows/ci.yml/badge.svg)](https://github.com/xodapi/vibeport/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

**Your local control center for proxyrs** - A privacy-conscious dashboard for testing models, monitoring proxy health, analyzing usage, and estimating costs.

**Current release:** `v0.3.0` (release candidate)

---

## ✨ Features

### 🎯 Model Testing
- **Instant Playground** - Test configured models through proxyrs
- **Side-by-Side Comparison** - Compare two model outputs and latency
- **Streaming Responses** - See tokens as they arrive
- **Prompt Library** - Save and reuse your best prompts
- **Readable Responses** - Render assistant text with JSON fallback

### 📊 Quota Monitoring
- Planned. Vimit server integration is not implemented yet.

### 🔄 Proxy Management
- **Live Dashboard** - Real-time proxyrs metrics
- **Health Monitoring** - Provider and circuit diagnostics
- **Request History** - Privacy-safe aggregate analytics

### 💰 Cost Analytics
- **Per-Model Costs** - Browser-local rates configured in Settings
- **Export Reports** - Server aggregate CSV/JSON plus local cost CSV/JSON
- **Transparent Estimates** - Missing rates remain unavailable, never zero

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Proxy running on `http://127.0.0.1:3001` ([proxyrs](https://github.com/xodapi/proxyrs))
- Optional: Vimit server for quota monitoring ([vimit](https://github.com/xodapi/vimit))

### Installation

```bash
# Clone
git clone https://github.com/xodapi/vibeport.git
cd vibeport

# Install dependencies
npm ci --ignore-scripts

# Configure
cp .env.example .env.local
# Edit .env.local with your proxy URL

# Run development server
npm run dev

# Open http://localhost:3000
```

### Docker (Alternative)

```bash
docker build -t vibeport .
docker run -p 3000:3000 vibeport
```

---

## ⚙️ Configuration

Create `.env.local`:

```bash
# Proxy API
NEXT_PUBLIC_PROXY_URL=http://127.0.0.1:3001

# Reserved for a future Vimit server integration
NEXT_PUBLIC_VIMIT_URL=http://127.0.0.1:3002
```

---

## 🏗️ Tech Stack

**Frontend:**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

**Data & State:**
- [SWR](https://swr.vercel.app/) - Data fetching & caching
- [Zustand](https://github.com/pmndrs/zustand) - State management

**Charts & Visualization:**
- [Recharts](https://recharts.org/) - Composable charting library

**Integrations:**
- [proxyrs](https://github.com/xodapi/proxyrs) - Rust-based LLM proxy
- [vimit](https://github.com/xodapi/vimit) - Planned quota monitor integration

---

## 📁 Project Structure

```
vibeport/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/       # Dashboard layout group
│   │   │   ├── page.tsx       # Home dashboard
│   │   │   ├── models/        # Model playground
│   │   │   ├── usage/         # Usage analytics
│   │   │   └── settings/      # Settings & config
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── charts/            # Chart components
│   │   ├── models/            # Model-specific components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── api/               # API clients
│   │   │   ├── proxy.ts       # Proxy API
│   │   │   └── vimit.ts       # Vimit API
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   └── styles/                # Additional styles
├── public/                    # Static assets
├── .env.example               # Example environment
└── package.json
```

---

## 🎨 Design System

**Colors** (Dark Mode First):
```css
Background: #0A0D12 → #0F131C → #161D2B
Surface: #1E2636
Border: #2A3444
Text: #E4E4E7
Accent: #38BDF8 (cyan)
Success: #6EE7B7 (emerald)
Warning: #F59E0B (amber)
Error: #F43F5E (rose)
```

**Typography:**
- Display: Inter (tight tracking, bold)
- Body: Inter (relaxed line-height)
- Mono: JetBrains Mono (code blocks)

**Components:**
- Fully rounded (16px+ radius on cards, 999px pills)
- Consistent spacing scale (4, 8, 12, 16, 24, 32, 48)
- Smooth transitions (150-300ms)
- Subtle shadows (no harsh borders)

---

## 🔌 API Integration

### Proxy API

```typescript
// lib/api/proxy.ts
const proxyClient = {
  // Test model
  testModel: async (model: string, prompt: string) => {
    const res = await fetch(`${PROXY_URL}/v1/chat/completions`, {
      method: 'POST',
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] })
    });
    return res.json();
  },
  
  // Get metrics
  getMetrics: async () => {
    const res = await fetch(`${PROXY_URL}/metrics?window=300000&days=7`);
    return res.json();
  }
};
```

### Vimit API (Future)

```typescript
// lib/api/vimit.ts
const vimitClient = {
  // Get quota status
  getQuotas: async () => {
    const res = await fetch(`${VIMIT_URL}/api/quotas`);
    return res.json();
  }
};
```

---

## 🚢 Deployment

### Private deployment (recommended)

VibePort is designed to reach a local or private `proxyrs` instance. Deploy it on the same machine or private network as the proxy, behind HTTPS and access control.

See the full [deployment guide](docs/DEPLOYMENT.md), including Docker, reverse-proxy, and production-checklist instructions.

### Self-Hosted

```bash
# Build
npm run build

# Start production server
npm run start

# Or use PM2
pm2 start npm --name "vibeport" -- start
```

### Docker

```dockerfile
# Provide a Dockerfile for your chosen runtime
docker build -t vibeport .
docker run -p 3000:3000 -e NEXT_PUBLIC_PROXY_URL=http://host.docker.internal:3001 vibeport
```

---

## 🛠️ Development

### Scripts

```bash
npm run dev          # Development server (hot reload)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm test             # Unit tests
npm run format       # Prettier format
```

### Code Quality

- **ESLint** - Linting with Next.js rules
- **Prettier** - Code formatting
- **TypeScript** - Strict type checking
- **Husky** - Pre-commit hooks
- **Conventional Commits** - Commit message format

---

## 📊 Roadmap

### v0.3.0 - Current
- [x] Model playground with streaming and readable non-streaming responses
- [x] Side-by-side model comparison
- [x] Saved prompts and prompt history in localStorage
- [x] Proxy dashboard, provider diagnostics, and usage analytics
- [x] Browser-local cost estimates and CSV/JSON exports
- [x] CI, accessibility improvements, deployment documentation

### Next
- [ ] Vimit quota page, once a server API is available
- [ ] WebSocket live monitoring, once proxyrs exposes a WebSocket endpoint
- [ ] Budget alerts and notification preferences

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

**Development Flow:**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Commit Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting)
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Related Projects

**LLM Developer Toolkit:**
- **[proxyrs](https://github.com/xodapi/proxyrs)** - Rust-based OpenAI-compatible proxy (v1.7.0)
- **[vimit](https://github.com/xodapi/vimit)** - Planned quota monitor integration
- **vibeport** (this project) - Web dashboard for unified management

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - Amazing React framework
- [Lucide](https://lucide.dev/) - Icon library

---

## 📬 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/xodapi/vibeport/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/xodapi/vibeport/discussions)

---

**Made with ❤️ for the LLM developer community**

[![GitHub Stars](https://img.shields.io/github/stars/xodapi/vibeport?style=social)](https://github.com/xodapi/vibeport)
