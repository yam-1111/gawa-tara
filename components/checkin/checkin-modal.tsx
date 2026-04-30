import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CheckinModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: Record<string, unknown>) => void
}

const Slider = ({ label, value, setValue }: { label: string, value: number, setValue: (v: number) => void }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium">{label}</label>
      <span className="text-sm text-muted-foreground">{value}/5</span>
    </div>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => setValue(v)}
          className={`flex-1 h-10 rounded-md transition-colors ${value === v
            ? "bg-primary text-primary-foreground font-bold"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
        >
          {v}
        </button>
      ))}
    </div>
  </div>
)

export function CheckinModal({ isOpen, onClose, onComplete }: CheckinModalProps) {
  const [energy, setEnergy] = React.useState(3)
  const [focus, setFocus] = React.useState(3)
  const [stress, setStress] = React.useState(3)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    const today = new Date().toISOString().split('T')[0]

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ energy, focus, stress, date: today }),
      })

      if (!res.ok) throw new Error("Failed to save checkin")

      const data = await res.json()
      onComplete(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daily State Check-in</DialogTitle>
          <DialogDescription className="sr-only">How are you feeling today?</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Slider label="😄 Energy" value={energy} setValue={setEnergy} />
          <Slider label="🧠 Focus" value={focus} setValue={setFocus} />
          <Slider label="😰 Stress" value={stress} setValue={setStress} />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "✏️ Writing to Journal..." : "Add your feeling to the journal!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
