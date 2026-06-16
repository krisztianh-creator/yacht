'use client'

import { useState, useEffect } from 'react'
import { getBookings, updateBooking, deleteBooking, type Booking } from '@/lib/yachts'
import { supabase } from '@/lib/supabase'
import { Trash2, Check, X } from 'lucide-react'

export default function BookingsList() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()

    // Set up real-time subscription
    const subscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data, error } = await getBookings()
      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id: string) => {
    try {
      const { error } = await updateBooking(id, { status: 'confirmed' })
      if (error) throw error
      fetchBookings()
    } catch (error) {
      console.error('Failed to confirm booking:', error)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      const { error } = await updateBooking(id, { status: 'cancelled' })
      if (error) throw error
      fetchBookings()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    try {
      const { error } = await deleteBooking(id)
      if (error) throw error
      fetchBookings()
    } catch (error) {
      console.error('Failed to delete booking:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return <p>Loading bookings...</p>
  }

  return (
    <div>
      {bookings.length === 0 ? (
        <p className="text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground">Yacht</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Email</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Start Date</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">End Date</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Guests</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Total Price</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">{booking.yachts?.name || 'Unknown'}</td>
                  <td className="py-3 px-4">{booking.customer_name}</td>
                  <td className="py-3 px-4">{booking.customer_email}</td>
                  <td className="py-3 px-4">{booking.customer_phone || '-'}</td>
                  <td className="py-3 px-4">{new Date(booking.start_date).toLocaleString()}</td>
                  <td className="py-3 px-4">{new Date(booking.end_date).toLocaleString()}</td>
                  <td className="py-3 px-4">{booking.guest_count || 1}</td>
                  <td className="py-3 px-4">${booking.total_price}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirm(booking.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
