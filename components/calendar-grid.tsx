'use client'

import { useState } from 'react'

interface CalendarGridProps {
  onTimeSelect: (startTime: number, endTime: number) => void
  selectedSlots: { start: number; end: number } | null
}

export default function CalendarGrid({ onTimeSelect, selectedSlots }: CalendarGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const isAvailable = (hour: number) => {
    // Mock availability - some hours are booked
    const bookedHours = [2, 3, 4, 14, 15, 16]
    return !bookedHours.includes(hour)
  }

  const isSelected = (hour: number) => {
    if (!selectedSlots) return false
    return hour >= selectedSlots.start && hour < selectedSlots.end
  }

  const getSlotColor = (hour: number) => {
    if (isSelected(hour)) return 'bg-primary text-primary-foreground'
    if (!isAvailable(hour)) return 'bg-muted text-muted-foreground cursor-not-allowed'
    return 'bg-white border border-input text-foreground hover:bg-muted cursor-pointer'
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Select Time</h3>
      <div className="grid grid-cols-6 gap-2">
        {hours.map((hour) => (
          <button
            key={hour}
            onClick={() => {
              if (isAvailable(hour)) {
                // Simple logic: select 2-hour minimum block
                onTimeSelect(hour, hour + 2)
              }
            }}
            disabled={!isAvailable(hour)}
            className={`p-2 rounded text-sm font-medium transition-colors ${getSlotColor(hour)}`}
          >
            {hour}:00
          </button>
        ))}
      </div>
      {selectedSlots && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedSlots.start}:00 - {selectedSlots.end}:00
        </p>
      )}
    </div>
  )
}
