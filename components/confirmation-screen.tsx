'use client'

import { CheckCircle, Copy, MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface ConfirmationScreenProps {
  bookingRef: string
  yachtName: string
  date: string
  startTime: number
  endTime: number
  totalPrice: number
  onClose: () => void
}

export default function ConfirmationScreen({
  bookingRef,
  yachtName,
  date,
  startTime,
  endTime,
  totalPrice,
  onClose,
}: ConfirmationScreenProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingRef)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const message = `Hi, I just booked ${yachtName} (Ref: ${bookingRef}) for $${totalPrice}. See you soon!`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank'
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-8 space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-primary" />
        </div>

        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Booking Confirmed!</h2>
          <p className="text-muted-foreground">Your yacht awaits</p>
        </div>

        {/* Booking Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Booking Reference</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono font-bold text-primary">{bookingRef}</p>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {copied && <p className="text-xs text-primary mt-1">Copied!</p>}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Yacht</span>
              <span className="font-medium text-foreground">{yachtName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">{date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium text-foreground">
                {startTime}:00 - {endTime}:00
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary text-lg">${totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Share on WhatsApp
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
          >
            Back to Yachts
          </button>
        </div>
      </div>
    </div>
  )
}
