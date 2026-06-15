'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import CalendarGrid from './calendar-grid'
import PricingBreakdown from './pricing-breakdown'
import ConfirmationScreen from './confirmation-screen'

interface BookingSheetProps {
  isOpen: boolean
  yacht: {
    id: string
    name: string
    hourlyRate: number
  }
  date: string
  duration: number
  onClose: () => void
}

export default function BookingSheet({ isOpen, yacht, date, duration, onClose }: BookingSheetProps) {
  const [selectedTime, setSelectedTime] = useState<{ start: number; end: number } | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  if (!isOpen) return null

  const handleConfirmBooking = () => {
    if (!selectedTime) return
    // Generate booking reference
    const ref = `YCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    setBookingRef(ref)
    setShowConfirmation(true)
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
    setSelectedTime(null)
    onClose()
  }

  const totalPrice = yacht.hourlyRate * (selectedTime ? selectedTime.end - selectedTime.start : duration)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-lg z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">{yacht.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="text-sm font-medium text-foreground">Date</label>
            <p className="mt-1 text-primary font-semibold">{date}</p>
          </div>

          {/* Calendar Grid */}
          <CalendarGrid
            onTimeSelect={(start, end) => setSelectedTime({ start, end })}
            selectedSlots={selectedTime}
          />

          {/* Pricing */}
          <PricingBreakdown
            hourlyRate={yacht.hourlyRate}
            duration={selectedTime ? selectedTime.end - selectedTime.start : duration}
          />

          {/* Validation Message */}
          {selectedTime && selectedTime.end - selectedTime.start < 2 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">Minimum rental is 2 hours</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 space-y-3">
          <button
            onClick={handleConfirmBooking}
            disabled={!selectedTime || selectedTime.end - selectedTime.start < 2}
            className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Booking
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Screen */}
      {showConfirmation && (
        <ConfirmationScreen
          bookingRef={bookingRef}
          yachtName={yacht.name}
          date={date}
          startTime={selectedTime?.start || 0}
          endTime={selectedTime?.end || 0}
          totalPrice={totalPrice}
          onClose={handleCloseConfirmation}
        />
      )}
    </>
  )
}
