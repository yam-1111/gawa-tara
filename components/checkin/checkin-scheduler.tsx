"use client"

import * as React from "react"
import { CheckinModal } from "./checkin-modal"

export function CheckinScheduler() {
  const [isCheckinModalOpen, setIsCheckinModalOpen] = React.useState(false)

  React.useEffect(() => {
    const checkCheckinStatus = async () => {
      const today = new Date().toISOString().split('T')[0]
      try {
        const res = await fetch(`/api/checkin?date=${today}`)
        if (res.ok) {
          const checkin = await res.json()
          if (!checkin || checkin.energy === null || checkin.energy === undefined) {
            setIsCheckinModalOpen(true)
          }
        } else {
          // If 404 or other error, assume no check-in
          setIsCheckinModalOpen(true)
        }
      } catch (err) {
        console.error("Failed to fetch checkin status:", err)
      }
    }

    // Check on mount
    checkCheckinStatus()

    // Check every 30 minutes
    const interval = setInterval(() => {
      checkCheckinStatus()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleCheckinComplete = () => {
    setIsCheckinModalOpen(false)
  }

  return (
    <CheckinModal
      isOpen={isCheckinModalOpen}
      onClose={() => setIsCheckinModalOpen(false)}
      onComplete={handleCheckinComplete}
    />
  )
}
