"use client"

import * as React from "react"
import { CheckinModal } from "./checkin-modal"
import { usePathname } from "next/navigation"

export function CheckinProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const pathname = usePathname()

  const checkCheckinStatus = React.useCallback(async () => {
    // Check if we've already checked today in local storage
    const today = new Date().toISOString().split('T')[0]
    const lastCheckinDate = localStorage.getItem('lastCheckinDate')

    if (lastCheckinDate === today) {
      return // Already checked in today locally
    }

    try {
      const res = await fetch(`/api/checkin?date=${today}`)
      if (res.ok) {
        const data = await res.json()
        if (data.energy === null) {
          setIsModalOpen(true)
        } else {
          localStorage.setItem('lastCheckinDate', today)
        }
      }
    } catch (err) {
      console.error("Failed to check checkin status:", err)
    }
  }, [])

  React.useEffect(() => {
    // Initial check on mount
    checkCheckinStatus()

    // Set up 30 minute interval
    const intervalId = setInterval(() => {
      checkCheckinStatus()
    }, 30 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [checkCheckinStatus])

  const handleComplete = (_data: Record<string, unknown>) => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('lastCheckinDate', today)
    setIsModalOpen(false)

    // Force a reload of the page to apply any state adaptations (like in home page)
    // if we happen to be on the home page.
    if (pathname === '/home' || pathname === '/') {
      window.location.reload()
    }
  }

  return (
    <>
      {children}
      <CheckinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleComplete}
      />
    </>
  )
}
