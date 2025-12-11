import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { teamId, emailOrDisplayName, role } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify user is team admin
    const { data: teamMember } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (!teamMember || teamMember.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        invited_by: user.id,
        invited_email: emailOrDisplayName.toLowerCase(),
        role,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(invitation)
  } catch (error) {
    console.error("Invitation error:", error)
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 })
  }
}
