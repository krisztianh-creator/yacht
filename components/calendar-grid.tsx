'use client'

import { useState } from 'react'

interface CalendarGridProps {
  onTimeSelect: (startTime: number, endTime: number) => void
  selectedSlots: { start: number; end: number } | null
  minimumBookingHours: number
  crewUnavailability?: any[]
  bookings?: any[]
  date?: string
}

export default function CalendarGrid({ onTimeSelect, selectedSlots, minimumBookingHours, crewUnavailability = [], bookings = [], date }: CalendarGridProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const isAvailable = (hour: number) => {
    // Check if hour is in crew unavailability
    const isCrewUnavailable = crewUnavailability.some(unavailable => {
      return hour >= unavailable.start_hour && hour < unavailable.end_hour
    })
    
    // Check if hour is already booked
    let isBooked = false
    if (date) {
      isBooked = bookings.some(booking => {
        const start = new Date(booking.start_date)
        const end = new Date(booking.end_date)
        const bookingDate = start.toISOString().split('T')[0]
        const selectedDate = new Date(date).toISOString().split('T')[0]
        
        // Check if booking is on the selected date
        if (bookingDate !== selectedDate) return false
        
        // Check if the hour falls within the booking time range
        return hour >= start.getHours() && hour < end.getHours()
      })
    }
    
    return !isCrewUnavailable && !isBooked
  }

  const isSelected = (hour: number) => {
    if (!selectedSlots) return false
    return hour >= selectedSlots.start && hour < selectedSlots.end
  }

  const getSlotColor = (hour: number) => {
    if (isSelected(hour)) return 'bg-amber-500 text-white font-bold'
    if (!isAvailable(hour)) return 'bg-muted text-muted-foreground line-through cursor-not-allowed'
    return 'bg-white border border-input text-foreground hover:bg-muted cursor-pointer'
  }

  const timeBlocks = [
    { name: 'Morning', hours: [6, 7, 8, 9, 10, 11], label: '6AM-12PM' },
    { name: 'Afternoon', hours: [12, 13, 14, 15, 16, 17], label: '12PM-6PM' },
    { name: 'Evening', hours: [18, 19, 20, 21, 22, 23], label: '6PM-12AM' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Select Time</h3>
      
      {timeBlocks.map((block) => (
        <div key={block.name} className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">{block.name}</h4>
            <span className="text-xs text-muted-foreground">({block.label})</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {block.hours.map((hour) => (
              <button
                key={hour}
                onClick={() => {
                  if (isAvailable(hour)) {
                    // Use yacht-specific minimum booking hours
                    onTimeSelect(hour, hour + minimumBookingHours)
                  }
                }}
                disabled={!isAvailable(hour)}
                className={`p-2 rounded text-sm font-medium transition-colors ${getSlotColor(hour)}`}
              >
                {hour}:00
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedSlots && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedSlots.start}:00 - {selectedSlots.end}:00
        </p>
      )}
    </div>
  )
}
