import Link from 'next/link';
import { ArrowRight, Zap, BarChart3, Settings, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-bg-1 via-bg-2 to-bg-3">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-pill text-accent text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>v0.1.0 - Alpha Release</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-fluid-display font-bold tracking-tight">
            Your Portal to{' '}
            <span className="bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">
              VibeMode
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Beautiful dashboard for LLM development. Test models, monitor quotas, manage proxy, track costs—all in one place.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="btn btn-primary group"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="https://github.com/xodapi/vibeport"
              target="_blank"
              className="btn btn-secondary"
            >
              <span>View on GitHub</span>
            </Link>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Model Testing"
            description="Test any LLM model in real-time with instant streaming responses"
            color="accent"
          />
          
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Quota Monitor"
            description="Track VibeMode quotas with beautiful charts and low-balance alerts"
            color="success"
          />
          
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="Proxy Control"
            description="Manage providers, monitor health, configure routing on the fly"
            color="warning"
          />
          
          <FeatureCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Cost Analytics"
            description="Track spending per model, set budgets, optimize costs with AI"
            color="error"
          />
        </div>
        
        {/* Integration Section */}
        <div className="max-w-4xl mx-auto mt-32 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Integrates with Your Stack
          </h2>
          <p className="text-text-muted text-lg">
            Works seamlessly with proxyrs and vimit
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <IntegrationCard
              name="proxyrs"
              description="Rust-based OpenAI-compatible proxy"
              url="https://github.com/xodapi/proxyrs"
              status="connected"
            />
            
            <IntegrationCard
              name="vimit"
              description="VibeMode quota monitor (CLI/TUI/GUI)"
              url="https://github.com/xodapi/vimit"
              status="coming-soon"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-32 pt-12 border-t border-border text-center text-text-muted text-sm">
          <p>
            Made with ❤️ for the LLM developer community •{' '}
            <Link href="https://github.com/xodapi/vibeport" target="_blank" className="text-accent hover:underline">
              GitHub
            </Link>
            {' • '}
            <Link href="/dashboard" className="text-accent hover:underline">
              Dashboard
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'accent' | 'success' | 'warning' | 'error';
}) {
  const colorClasses = {
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };
  
  return (
    <div className="card hover:shadow-md transition-all duration-300 group">
      <div className={`${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function IntegrationCard({
  name,
  description,
  url,
  status,
}: {
  name: string;
  description: string;
  url: string;
  status: 'connected' | 'coming-soon';
}) {
  return (
    <Link
      href={url}
      target="_blank"
      className="card hover:shadow-md transition-all duration-300 group text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
          {name}
        </h3>
        {status === 'connected' ? (
          <span className="badge badge-success">Connected</span>
        ) : (
          <span className="badge badge-warning">Coming Soon</span>
        )}
      </div>
      <p className="text-text-muted text-sm">{description}</p>
    </Link>
  );
}
