"use client"

import { useEffect, useMemo, useState } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"
import { usePathname } from "next/navigation"

const STORAGE_KEY = "lumen_onboarding_done_v1"

export function OnboardingTour() {
  const pathname = usePathname()
  const [run, setRun] = useState(false)
  const [ready, setReady] = useState(false)

  // Only run the tour on the planner page where all targets exist
  const shouldRunOnThisRoute = useMemo(() => pathname === "/dashboard", [pathname])

  const steps: Step[] = useMemo(
    () => [
      {
        target: '[data-tour-id="year-selector"]',
        title: "Switch years",
        content: "Choose any year to plan ahead or review past work.",
      },
      {
        target: '[data-tour-id="manage-tags"]',
        title: "Manage your tags",
        content: "Add, edit, or remove tags like Personal and Work.",
      },
      {
        target: '[data-tour-id="add-task"]',
        title: "Add tasks to a week",
        content: "Click here to add a task to the selected week.",
      },
      {
        target: '[data-tour-id="nav-planner"]',
        title: "Planner",
        content: "Create and view all weekly tasks.",
      },
      {
        target: '[data-tour-id="nav-goals"]',
        title: "Goals",
        content: "Set up to ten major goals for the selected year.",
      },
      {
        target: '[data-tour-id="nav-recurring"]',
        title: "Recurring",
        content: "Create recurring tasks that auto-populate across the year.",
      },
      {
        target: '[data-tour-id="nav-monthly"]',
        title: "Monthly",
        content: "See your monthly breakdowns and summaries.",
      },
      {
        target: '[data-tour-id="nav-wrapped"]',
        title: "Wrapped",
        content: "View and share your yearly wrapped summary.",
      },
    ],
    [],
  )

  // Wait for all required targets to exist before running
  useEffect(() => {
    if (!shouldRunOnThisRoute) return
    if (typeof window === "undefined") return
    const alreadyDone = localStorage.getItem(STORAGE_KEY)
    if (alreadyDone) return

    const checkTargets = () => steps.every((step) => !!document.querySelector(step.target as string))

    if (checkTargets()) {
      setReady(true)
      setRun(true)
      return
    }

    const interval = setInterval(() => {
      if (checkTargets()) {
        clearInterval(interval)
        setReady(true)
        setRun(true)
      }
    }, 400)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      // If not ready after timeout, do not run (targets likely not on this page)
      setReady(false)
    }, 8000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [shouldRunOnThisRoute, steps])

  const handleCallback = (data: CallBackProps) => {
    const { status } = data
    const finished = status === STATUS.FINISHED || status === STATUS.SKIPPED
    if (finished && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "done")
      setRun(false)
    }
  }

  if (!shouldRunOnThisRoute || !ready) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      spotlightPadding={8}
      styles={{
        options: {
          zIndex: 9999,
          overlayColor: "rgba(0, 0, 0, 0.55)",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip",
      }}
      callback={handleCallback}
    />
  )
}

