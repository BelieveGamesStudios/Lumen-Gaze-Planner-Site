import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CalendarDays className="h-8 w-8 text-accent" />
            <span className="font-bold text-xl">52-Week Planner</span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error ? (
                <p className="text-sm text-muted-foreground mb-4">Error: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  An unspecified error occurred during authentication.
                </p>
              )}
              <Link href="/auth/login">
                <Button className="w-full">Try Again</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
