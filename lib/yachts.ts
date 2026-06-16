import { supabase } from './supabase'

export interface Yacht {
  id: string
  name: string
  type: string
  image: string | null
  images: string[]
  capacity: number
  hourly_rate: number
  rating: number
  reviews: number
  minimum_booking_hours: number
  offers: string[]
  location: string
  features: string[]
  created_at: string
  updated_at: string
}

export interface YachtInput {
  name: string
  type: string
  image: string | null
  images: string[]
  capacity: number
  hourly_rate: number
  rating: number
  reviews: number
  minimum_booking_hours: number
  offers: string[]
  location: string
  features: string[]
}

export interface Booking {
  id: string
  yacht_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  start_date: string
  end_date: string
  total_price: number
  guest_count: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface BookingInput {
  yacht_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  start_date: string
  end_date: string
  total_price: number
  guest_count: number
  status?: 'pending' | 'confirmed' | 'cancelled'
}

export interface CrewUnavailability {
  id: string
  yacht_id: string
  date: string
  start_hour: number
  end_hour: number
  reason: string | null
  created_at: string
  updated_at: string
}

export interface CrewUnavailabilityInput {
  yacht_id: string
  date: string
  start_hour: number
  end_hour: number
  reason?: string
}

// Fetch all yachts
export async function getYachts() {
  const { data, error } = await supabase.from('yachts').select('*').order('created_at', { ascending: false })
  return { data, error }
}

// Fetch single yacht
export async function getYacht(id: string) {
  const { data, error } = await supabase.from('yachts').select('*').eq('id', id).single()
  return { data, error }
}

// Create yacht
export async function createYacht(yacht: YachtInput) {
  const { data, error } = await supabase.from('yachts').insert(yacht).select().single()
  return { data, error }
}

// Update yacht
export async function updateYacht(id: string, yacht: Partial<YachtInput>) {
  const { data, error } = await supabase.from('yachts').update(yacht).eq('id', id).select()
  return { data: data?.[0] || null, error }
}

// Delete yacht
export async function deleteYacht(id: string) {
  const { error } = await supabase.from('yachts').delete().eq('id', id)
  return { error }
}

// Fetch all bookings
export async function getBookings() {
  const { data, error } = await supabase.from('bookings').select('*, yachts(name)').order('created_at', { ascending: false })
  return { data, error }
}

// Fetch bookings for a specific yacht
export async function getBookingsByYacht(yachtId: string) {
  const { data, error } = await supabase.from('bookings').select('*').eq('yacht_id', yachtId).order('start_date', { ascending: true })
  return { data, error }
}

// Create booking
export async function createBooking(booking: BookingInput) {
  const { data, error } = await supabase.from('bookings').insert(booking).select().single()
  return { data, error }
}

// Update booking
export async function updateBooking(id: string, booking: Partial<BookingInput>) {
  const { data, error } = await supabase.from('bookings').update(booking).eq('id', id).select()
  return { data: data?.[0] || null, error }
}

// Delete booking
export async function deleteBooking(id: string) {
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  return { error }
}

// Fetch crew unavailability for a yacht
export async function getCrewUnavailability(yachtId: string, date?: string) {
  let query = supabase.from('crew_unavailability').select('*').eq('yacht_id', yachtId)
  if (date) {
    query = query.eq('date', date)
  }
  query = query.order('date', { ascending: true })
  const { data, error } = await query
  return { data, error }
}

// Create crew unavailability
export async function createCrewUnavailability(unavailability: CrewUnavailabilityInput) {
  const { data, error } = await supabase.from('crew_unavailability').insert(unavailability).select().single()
  return { data, error }
}

// Update crew unavailability
export async function updateCrewUnavailability(id: string, unavailability: Partial<CrewUnavailabilityInput>) {
  const { data, error } = await supabase.from('crew_unavailability').update(unavailability).eq('id', id).select()
  return { data: data?.[0] || null, error }
}

// Delete crew unavailability
export async function deleteCrewUnavailability(id: string) {
  const { error } = await supabase.from('crew_unavailability').delete().eq('id', id)
  return { error }
}
