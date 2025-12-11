"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Trash2 } from "lucide-react"
import type { Team, TeamMember } from "@/lib/types"
import { InviteTeamMemberDialog } from "./invite-team-member-dialog"

interface TeamDetailsDialogProps {
  teamId: string
  userId: string
  isOwner: boolean
  onClose: () => void
  onUpdated: () => void
}

export function TeamDetailsDialog({ teamId, userId, isOwner, onClose, onUpdated }: TeamDetailsDialogProps) {
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const { data: teamData } = await supabase.from("teams").select("*").eq("id", teamId).single()

        const { data: membersData } = await supabase.from("team_members").select("*").eq("team_id", teamId)

        setTeam(teamData)
        setMembers(membersData || [])
      } catch (error) {
        console.error("Failed to fetch team details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamDetails()
  }, [teamId, supabase])

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (!isOwner && memberUserId !== userId) return

    try {
      await supabase.from("team_members").delete().eq("id", memberId)
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!team) {
    return null
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{team.name}</DialogTitle>
          {team.description && <DialogDescription>{team.description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6">
          {/* Members Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members ({members.length})
              </h3>
              {isOwner && <InviteTeamMemberDialog teamId={teamId} onInvited={onUpdated} />}
            </div>

            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{member.user_id}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {member.role}
                      </Badge>
                    </div>
                    {(isOwner || member.user_id === userId) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
