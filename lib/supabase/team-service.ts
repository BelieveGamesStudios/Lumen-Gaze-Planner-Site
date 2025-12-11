import { createClient } from "@/lib/supabase/server"

export async function inviteTeamMember(teamId: string, emailOrDisplayName: string, role: "admin" | "member") {
  const supabase = await createClient()

  // Check if email or display name
  const isEmail = emailOrDisplayName.includes("@")

  let targetEmail = emailOrDisplayName

  if (!isEmail) {
    // Find user by display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("display_name", emailOrDisplayName)
      .single()

    if (!profile) {
      throw new Error("User not found with that display name")
    }

    // Get email from auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    // We can't directly get another user's email, so we'll create invitation with display name
    targetEmail = emailOrDisplayName
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Check if user is team admin
  const { data: teamMember } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!teamMember) {
    throw new Error("Not a team member")
  }

  if (teamMember.role !== "admin") {
    throw new Error("Only admins can invite members")
  }

  // Create invitation
  const { data: invitation, error } = await supabase
    .from("team_invitations")
    .insert({
      team_id: teamId,
      invited_by: user.id,
      invited_email: targetEmail.toLowerCase(),
      invited_display_name: !isEmail ? emailOrDisplayName : null,
      role,
    })
    .select()
    .single()

  if (error) throw error

  return invitation
}

export async function acceptTeamInvitation(invitationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Get invitation
  const { data: invitation } = await supabase.from("team_invitations").select("*").eq("id", invitationId).single()

  if (!invitation) throw new Error("Invitation not found")

  // Verify invite target: allow match by email OR by invited_display_name matching user's display name
  const inviteEmail = invitation.invited_email
  const inviteDisplayName = invitation.invited_display_name

  const userDisplayName = (user.user_metadata && (user.user_metadata as any).display_name) || null

  const emailMatches = inviteEmail && user.email && inviteEmail.toLowerCase() === user.email.toLowerCase()
  const displayNameMatches = inviteDisplayName && userDisplayName && inviteDisplayName === userDisplayName

  if (!emailMatches && !displayNameMatches) {
    throw new Error("This invitation is not for your account")
  }

  // Add user to team
  await supabase.from("team_members").insert({
    team_id: invitation.team_id,
    user_id: user.id,
    role: invitation.role,
  })

  // Update invitation
  await supabase.from("team_invitations").update({ status: "accepted" }).eq("id", invitationId)
}

export async function rejectTeamInvitation(invitationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Get invitation
  const { data: invitation } = await supabase.from("team_invitations").select("*").eq("id", invitationId).single()

  if (!invitation) throw new Error("Invitation not found")

  // Verify invite target for rejection as well
  const inviteEmailR = invitation.invited_email
  const inviteDisplayNameR = invitation.invited_display_name
  const emailMatchesR = inviteEmailR && user.email && inviteEmailR.toLowerCase() === user.email.toLowerCase()
  const displayNameMatchesR = inviteDisplayNameR && userDisplayName && inviteDisplayNameR === userDisplayName

  if (!emailMatchesR && !displayNameMatchesR) {
    throw new Error("This invitation is not for your account")
  }

  // Update invitation
  await supabase.from("team_invitations").update({ status: "rejected" }).eq("id", invitationId)
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Check if user is team admin
  const { data: teamMember } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!teamMember || teamMember.role !== "admin") {
    throw new Error("Only admins can remove members")
  }

  // Remove member
  await supabase.from("team_members").delete().eq("id", memberId)
}
