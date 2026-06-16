'use client'

import { useState, useEffect } from 'react'
import { getYachts, getBookingsByYacht, createBooking, getCrewUnavailability, createCrewUnavailability, deleteCrewUnavailability, type Yacht } from '@/lib/yachts'
import { supabase } from '@/lib/supabase'
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'

export default function AvailabilityCalendar() {
  const [yachts, setYachts] = useState<Yacht[]>([])
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [crewUnavailability, setCrewUnavailability] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showCrewForm, setShowCrewForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<{ start: number; end: number } | null>(null)
  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    guest_count: 1,
  })
  const [crewForm, setCrewForm] = useState({
    start_hour: 14,
    end_hour: 16,
    reason: '',
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [crewLoading, setCrewLoading] = useState(false)
  const [crewError, setCrewError] = useState('')

  useEffect(() => {
    fetchYachts()
  }, [])

  useEffect(() => {
    if (selectedYacht) {
      fetchBookings(selectedYacht.id)
      fetchCrewUnavailability(selectedYacht.id)

      // Set up real-time subscription for bookings
      const bookingSubscription = supabase
        .channel('bookings-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
          fetchBookings(selectedYacht.id)
        })
        .subscribe()

      // Set up real-time subscription for crew unavailability
      const crewSubscription = supabase
        .channel('crew-unavailability-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crew_unavailability' }, () => {
          fetchCrewUnavailability(selectedYacht.id)
        })
        .subscribe()

      return () => {
        bookingSubscription.unsubscribe()
        crewSubscription.unsubscribe()
      }
    }
  }, [selectedYacht])

  const fetchYachts = async () => {
    setLoading(true)
    try {
      const { data, error } = await getYachts()
      if (error) throw error
      setYachts(data || [])
    } catch (error) {
      console.error('Failed to fetch yachts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async (yachtId: string) => {
    try {
      const { data, error } = await getBookingsByYacht(yachtId)
      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  const fetchCrewUnavailability = async (yachtId: string) => {
    try {
      const { data, error } = await getCrewUnavailability(yachtId)
      if (error) throw error
      setCrewUnavailability(data || [])
    } catch (error) {
      console.error('Failed to fetch crew unavailability:', error)
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedYacht || !selectedDate || !selectedTime) return

    setBookingLoading(true)
    setBookingError('')

    try {
      const startDateTime = new Date(selectedDate)
      startDateTime.setHours(selectedTime.start, 0, 0, 0)
      const endDateTime = new Date(selectedDate)
      endDateTime.setHours(selectedTime.end, 0, 0, 0)
      
      // Validate that the booking is not in the past
      const now = new Date()
      if (startDateTime < now) {
        setBookingError('Cannot book for past dates. Please select a future date and time.')
        setBookingLoading(false)
        return
      }

      const durationHours = selectedTime.end - selectedTime.start
      const totalPrice = durationHours * selectedYacht.hourly_rate

      const { error } = await createBooking({
        yacht_id: selectedYacht.id,
        customer_name: bookingForm.customer_name,
        customer_email: bookingForm.customer_email,
        customer_phone: bookingForm.customer_phone,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        total_price: totalPrice,
        guest_count: bookingForm.guest_count,
        status: 'pending',
      })

      if (error) throw error

      setShowBookingForm(false)
      setSelectedDate(null)
      setSelectedTime(null)
      setBookingForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        guest_count: 1,
      })
      fetchBookings(selectedYacht.id)
    } catch (err) {
      setBookingError('Failed to create booking')
      console.error(err)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCrewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedYacht || !selectedDate) return

    setCrewLoading(true)
    setCrewError('')

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const { error } = await createCrewUnavailability({
        yacht_id: selectedYacht.id,
        date: dateStr,
        start_hour: crewForm.start_hour,
        end_hour: crewForm.end_hour,
        reason: crewForm.reason,
      })

      if (error) throw error

      setShowCrewForm(false)
      setCrewForm({
        start_hour: 14,
        end_hour: 16,
        reason: '',
      })
      fetchCrewUnavailability(selectedYacht.id)
    } catch (err) {
      setCrewError('Failed to set crew unavailability')
      console.error(err)
    } finally {
      setCrewLoading(false)
    }
  }

  const handleDeleteCrewUnavailability = async (id: string) => {
    if (!confirm('Are you sure you want to remove this crew unavailability?')) return
    try {
      const { error } = await deleteCrewUnavailability(id)
      if (error) throw error
      fetchCrewUnavailability(selectedYacht!.id)
    } catch (error) {
      console.error('Failed to delete crew unavailability:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateBooked = (date: Date) => {
    return bookings.some(booking => {
      const start = new Date(booking.start_date)
      const end = new Date(booking.end_date)
      return date >= start && date <= end
    })
  }

  const isDateCrewUnavailable = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return crewUnavailability.some(unavailable => unavailable.date === dateStr)
  }

  const isDateInRange = (date: Date, start: Date, end: Date) => {
    return date >= start && date <= end
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border bg-muted/30" />)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const booked = isDateBooked(date)
      const crewUnavailable = isDateCrewUnavailable(date)
      const today = new Date()
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear()
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())

      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(date)}
          disabled={isPast}
          className={`h-24 border border-border p-2 ${
            booked ? 'bg-red-50' : crewUnavailable ? 'bg-orange-50' : isToday ? 'bg-blue-50' : 'bg-white'
          } hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left`}
        >
          <div className="text-sm font-medium">{day}</div>
          {booked && (
            <div className="mt-1 text-xs text-red-600">Booked</div>
          )}
          {crewUnavailable && !booked && (
            <div className="mt-1 text-xs text-orange-600">Crew Unavailable</div>
          )}
          {isPast && (
            <div className="mt-1 text-xs text-muted-foreground">Past</div>
          )}
        </button>
      )
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">{monthName}</h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    )
  }

  if (loading) {
    return <p>Loading yachts...</p>
  }

  return (
    <div>
      {!selectedYacht ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">Select a Yacht</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yachts.map(yacht => (
              <button
                key={yacht.id}
                onClick={() => setSelectedYacht(yacht)}
                className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <h4 className="font-medium">{yacht.name}</h4>
                <p className="text-sm text-muted-foreground">{yacht.type}</p>
                <p className="text-sm text-muted-foreground">{yacht.location}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedYacht(null)}
            className="mb-4 text-sm text-primary hover:underline"
          >
            ← Back to yacht list
          </button>
          <h3 className="text-lg font-semibold mb-4">
            {selectedYacht.name} - Availability
          </h3>
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-border" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-border" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-50 border border-border" />
              <span>Crew Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-border" />
              <span>Available</span>
            </div>
          </div>
          {renderCalendar()}
          {selectedDate && !showBookingForm && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">
                  Time Slots for {selectedDate.toLocaleDateString()}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCrewForm(true)}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Set Crew Unavailable
                  </button>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
              {showCrewForm && (
                <div className="mb-4 p-4 border border-border rounded-lg bg-orange-50">
                  <h5 className="font-semibold mb-3">Set Crew Unavailable Time</h5>
                  <form onSubmit={handleCrewSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Hour</label>
                        <select
                          value={crewForm.start_hour}
                          onChange={(e) => setCrewForm({ ...crewForm, start_hour: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-input rounded-lg"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{i}:00</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Hour</label>
                        <select
                          value={crewForm.end_hour}
                          onChange={(e) => setCrewForm({ ...crewForm, end_hour: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-input rounded-lg"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i + 1} disabled={i + 1 <= crewForm.start_hour}>{i + 1}:00</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                      <input
                        type="text"
                        value={crewForm.reason}
                        onChange={(e) => setCrewForm({ ...crewForm, reason: e.target.value })}
                        className="w-full px-3 py-2 border border-input rounded-lg"
                        placeholder="e.g., Crew training, maintenance"
                      />
                    </div>
                    {crewError && (
                      <p className="text-red-600 text-sm">{crewError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={crewLoading}
                        className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {crewLoading ? 'Setting...' : 'Set Unavailable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCrewForm(false)}
                        className="px-4 py-2 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <div className="mb-4">
                <h5 className="font-medium mb-2 text-sm text-muted-foreground">Current Crew Unavailability</h5>
                {crewUnavailability.filter(u => u.date === selectedDate.toISOString().split('T')[0]).length > 0 ? (
                  <div className="space-y-2">
                    {crewUnavailability.filter(u => u.date === selectedDate.toISOString().split('T')[0]).map(unavailable => (
                      <div key={unavailable.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                        <div>
                          <span className="font-medium">{unavailable.start_hour}:00 - {unavailable.end_hour}:00</span>
                          {unavailable.reason && <span className="ml-2 text-sm text-muted-foreground">({unavailable.reason})</span>}
                        </div>
                        <button
                          onClick={() => handleDeleteCrewUnavailability(unavailable.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No crew unavailability set for this day</p>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i
                  const isSelected = selectedTime?.start === hour
                  const dateStr = selectedDate!.toISOString().split('T')[0]
                  
                  const isBooked = bookings.some(booking => {
                    const start = new Date(booking.start_date)
                    const end = new Date(booking.end_date)
                    const bookingDate = start.toISOString().split('T')[0]
                    
                    // Check if booking is on the selected date
                    if (bookingDate !== dateStr) return false
                    
                    // Check if the hour falls within the booking time range
                    return hour >= start.getHours() && hour < end.getHours()
                  })
                  
                  const isCrewUnavailable = crewUnavailability.some(unavailable => {
                    return unavailable.date === dateStr && hour >= unavailable.start_hour && hour < unavailable.end_hour
                  })
                  
                  return (
                    <button
                      key={hour}
                      onClick={() => setSelectedTime({ start: hour, end: hour + 1 })}
                      disabled={isBooked || isCrewUnavailable}
                      className={`p-3 rounded-lg border ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-white'
                      } ${isBooked ? 'opacity-50 cursor-not-allowed bg-red-50' : isCrewUnavailable ? 'opacity-50 cursor-not-allowed bg-orange-50' : 'hover:bg-muted'} transition-colors`}
                    >
                      {hour}:00
                    </button>
                  )
                })}
              </div>
              {selectedTime && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
                  >
                    Book {selectedTime.start}:00 - {selectedTime.end}:00
                  </button>
                </div>
              )}
            </div>
          )}
          {!selectedDate && (
            <div className="mt-6">
              <button
                onClick={() => setShowBookingForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
              >
                Create Booking
              </button>
            </div>
          )}
          {showBookingForm && (
            <div className="mt-6 p-4 border border-border rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Create New Booking</h4>
              {selectedDate && selectedTime && (
                <div className="bg-muted p-3 rounded-lg mb-4">
                  <p className="text-sm">
                    <strong>Selected:</strong> {selectedDate.toLocaleDateString()} from {selectedTime.start}:00 to {selectedTime.end}:00
                  </p>
                  <p className="text-sm">
                    <strong>Duration:</strong> {selectedTime.end - selectedTime.start} hours
                  </p>
                  <p className="text-sm">
                    <strong>Price:</strong> ${(selectedTime.end - selectedTime.start) * selectedYacht?.hourly_rate}
                  </p>
                </div>
              )}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={bookingForm.customer_name}
                    onChange={(e) => setBookingForm({ ...bookingForm, customer_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={bookingForm.customer_email}
                    onChange={(e) => setBookingForm({ ...bookingForm, customer_email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.customer_phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    value={bookingForm.guest_count}
                    onChange={(e) => setBookingForm({ ...bookingForm, guest_count: parseInt(e.target.value) })}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {bookingError && (
                  <p className="text-red-600 text-sm">{bookingError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {bookingLoading ? 'Creating...' : 'Create Booking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(false)
                      setSelectedDate(null)
                      setSelectedTime(null)
                    }}
                    className="px-4 py-2 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
