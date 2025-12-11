import { redirect } from "next/navigation"

export default function TeamsPage() {
  // Redirect away from Teams page since it's been removed
  redirect("/dashboard")
}
