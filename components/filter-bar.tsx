'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  location: string
  boatType: string
  guests: number
  date: string
  duration: number
}

const locations = ['Miami', 'Malibu', 'San Diego', 'Key West', 'Cancun']
const boatTypes = ['All Boats', 'Speedboat', 'Catamaran', 'Luxury Yacht', 'Sailboat']

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    location: 'Miami',
    boatType: 'All Boats',
    guests: 4,
    date: new Date().toISOString().split('T')[0],
    duration: 1,
  })

  const handleChange = (key: keyof FilterState, value: string | number) => {
    const updatedFilters = { ...filters, [key]: value }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className="w-full bg-white border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Boat Type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Boat Type</label>
            <select
              value={filters.boatType}
              onChange={(e) => handleChange('boatType', e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {boatTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Guests */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Guests</label>
            <select
              value={filters.guests}
              onChange={(e) => handleChange('guests', parseInt(e.target.value))}
              className="px-3 py-2 border border-input rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[2, 4, 6, 8, 10, 12].map((num) => (
                <option key={num} value={num}>
                  {num} guests
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              value={filters.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              className="px-3 py-2 border border-input rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
