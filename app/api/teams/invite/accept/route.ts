import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { invitationId } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get invitation
    const { data: invitation } = await supabase.from("team_invitations").select("*").eq("id", invitationId).single()

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation expired" }, { status: 410 })
    }

    // Verify email matches
    if (invitation.invited_email.toLowerCase() !== (user.email || "").toLowerCase()) {
      return NextResponse.json({ error: "Email does not match" }, { status: 403 })
    }

    // Add user to team
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: invitation.team_id,
      user_id: user.id,
      role: invitation.role,
    })

    if (memberError && !memberError.message.includes("duplicate")) {
      throw memberError
    }

    // Update invitation
    await supabase.from("team_invitations").update({ status: "accepted" }).eq("id", invitationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Accept invitation error:", error)
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 })
  }
}
