import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Shield, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background selection:bg-primary/30">
      <header className="flex h-20 items-center justify-between border-b border-border/40 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-sm font-bold text-primary-foreground">NX</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">NexusHR VX</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Command Your Fleet
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              NexusHR VX v2.0 is live
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
              The Cockpit for the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">AI-Powered Enterprise</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Hire, deploy, and manage fully autonomous AI beings as your workforce. Mission control meets talent marketplace for executives building the future of work.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                  Deploy Your First Agent <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border bg-background hover:bg-accent hover:text-accent-foreground">
                  View Capabilities
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card/50 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-foreground">Command a Fleet of 105+ Specialized Roles</h2>
              <p className="mt-4 text-muted-foreground">From data analysts to creative directors, instantly provision the talent your organization needs.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Bot, title: "Autonomous Agents", desc: "Deploy agents that require zero hand-holding. They plan, execute, and deliver." },
                { icon: Zap, title: "Instant Onboarding", desc: "No training period. Your AI team is productive from second one." },
                { icon: Shield, title: "Enterprise Grade", desc: "SOC2 compliant, secure data handling, and comprehensive audit logs." },
                { icon: BarChart3, title: "Command Center", desc: "Real-time oversight of tasks, utilization, and performance across the fleet." },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="font-mono text-[10px] font-bold text-primary-foreground">NX</span>
            </div>
            <span className="text-sm font-bold text-foreground">NexusHR VX</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NexusHR. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
