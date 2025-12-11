"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, Target, Trash2, Edit2, CheckCircle2 } from "lucide-react"
import type { YearlyGoal } from "@/lib/types"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GoalWithProgress extends YearlyGoal {
  linked_tasks: number
  completed_tasks: number
  progress: number
}

interface GoalsClientProps {
  initialGoals: GoalWithProgress[]
  currentYear: number
  userId: string
}

export function GoalsClient({ initialGoals, currentYear, userId }: GoalsClientProps) {
  const [goals, setGoals] = useState<GoalWithProgress[]>(initialGoals)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalWithProgress | null>(null)
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetValue, setTargetValue] = useState("")

  const supabase = createClient()

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTargetValue("")
  }

  const handleCreateGoal = async () => {
    if (!title.trim()) return

    startTransition(async () => {
      const { data, error } = await supabase
        .from("yearly_goals")
        .insert({
          user_id: userId,
          year: currentYear,
          title: title.trim(),
          description: description.trim() || null,
          target_value: targetValue ? Number.parseInt(targetValue) : null,
        })
        .select()
        .single()

      if (!error && data) {
        setGoals([...goals, { ...data, linked_tasks: 0, completed_tasks: 0, progress: 0 }])
        resetForm()
        setIsCreateDialogOpen(false)
      }
    })
  }

  const handleUpdateGoal = async () => {
    if (!editingGoal || !title.trim()) return

    startTransition(async () => {
      const { error } = await supabase
        .from("yearly_goals")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          target_value: targetValue ? Number.parseInt(targetValue) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingGoal.id)

      if (!error) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === editingGoal.id
              ? {
                  ...g,
                  title: title.trim(),
                  description: description.trim() || null,
                  target_value: targetValue ? Number.parseInt(targetValue) : null,
                }
              : g,
          ),
        )
        resetForm()
        setEditingGoal(null)
      }
    })
  }

  const handleDeleteGoal = async () => {
    if (!deleteGoalId) return

    startTransition(async () => {
      const { error } = await supabase.from("yearly_goals").delete().eq("id", deleteGoalId)

      if (!error) {
        setGoals((prev) => prev.filter((g) => g.id !== deleteGoalId))
      }
      setDeleteGoalId(null)
    })
  }

  const openEditDialog = (goal: GoalWithProgress) => {
    setTitle(goal.title)
    setDescription(goal.description || "")
    setTargetValue(goal.target_value?.toString() || "")
    setEditingGoal(goal)
  }

  const completedGoals = goals.filter((g) => g.progress === 100).length
  const overallProgress =
    goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{currentYear} Goals</h1>
          <p className="text-muted-foreground">
            {goals.length} goals · {completedGoals} completed · {overallProgress}% overall
          </p>
        </div>
        {goals.length < 10 && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{goals.length}/10</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{completedGoals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{goals.length - completedGoals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallProgress}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No goals set yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Set 5-10 big goals for the year and link tasks to track your progress.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <Card key={goal.id} className={goal.progress === 100 ? "border-primary/50 bg-primary/5" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    {goal.progress === 100 ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    ) : (
                      <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(goal)}>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteGoalId(goal.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {goal.completed_tasks} of {goal.linked_tasks} linked tasks
                    </span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {goal.target_value && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Target: {goal.current_value || 0} / {goal.target_value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingGoal}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setEditingGoal(null)
            resetForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
            <DialogDescription>
              {editingGoal
                ? "Update your goal details."
                : "Set a big goal for the year. You can link tasks to it to track progress."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">Goal Title</Label>
              <Input
                id="goalTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Read 24 books, Learn Spanish"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalDescription">Description (optional)</Label>
              <Textarea
                id="goalDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this goal important to you?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value (optional)</Label>
              <Input
                id="targetValue"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g., 24 for '24 books'"
              />
              <p className="text-xs text-muted-foreground">Set a numeric target to track quantifiable goals.</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setEditingGoal(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingGoal ? handleUpdateGoal : handleCreateGoal} disabled={isPending || !title.trim()}>
              {isPending ? "Saving..." : editingGoal ? "Save Changes" : "Create Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteGoalId} onOpenChange={() => setDeleteGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the goal. Tasks linked to this goal will be unlinked but not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  )
}
