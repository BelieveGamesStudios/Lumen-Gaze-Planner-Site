import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Target, Repeat, BarChart3, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-accent" />
            <span className="font-semibold text-lg">52-Week Planner</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
          Plan Your Year,
          <br />
          <span className="text-accent">Week by Week</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
          A comprehensive 52-week planner to help you set goals, track tasks, manage recurring items, and visualize your
          progress throughout the year.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Start Planning
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<CalendarDays className="h-8 w-8" />}
            title="52 Week Layout"
            description="Collapsible weekly views with task management and automatic sorting of completed items."
          />
          <FeatureCard
            icon={<Target className="h-8 w-8" />}
            title="Yearly Goals"
            description="Set 5-10 big goals and link tasks directly to them for focused progress tracking."
          />
          <FeatureCard
            icon={<Repeat className="h-8 w-8" />}
            title="Recurring Tasks"
            description="Daily, weekly, biweekly, or monthly tasks automatically placed across your year."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Progress Heatmap"
            description="GitHub-style visualization showing your weekly completion intensity."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for productivity enthusiasts who think in weeks, not days.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <div className="text-accent mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
