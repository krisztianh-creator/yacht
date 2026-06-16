'use client'

import { useState, useEffect } from 'react'
import { getYachts, deleteYacht, type Yacht } from '@/lib/yachts'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function YachtsList({ onEdit }: { onEdit: (yacht: Yacht) => void }) {
  const [yachts, setYachts] = useState<Yacht[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchYachts()
  }, [])

  const fetchYachts = async () => {
    setLoading(true)
    try {
      const { data, error } = await getYachts()
      if (error) throw error
      setYachts(data || [])
    } catch (err) {
      setError('Failed to fetch yachts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this yacht?')) return

    try {
      const { error } = await deleteYacht(id)
      if (error) throw error
      await fetchYachts()
    } catch (err) {
      setError('Failed to delete yacht')
      console.error(err)
    }
  }

  if (loading) {
    return <p>Loading yachts...</p>
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <div className="space-y-4">
      {yachts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No yachts found. Add your first yacht to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Capacity</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Hourly Rate</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Min Hours</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {yachts.map((yacht) => (
                <tr key={yacht.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground">{yacht.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{yacht.type}</td>
                  <td className="py-3 px-4 text-muted-foreground">{yacht.capacity}</td>
                  <td className="py-3 px-4 text-muted-foreground">${yacht.hourly_rate}</td>
                  <td className="py-3 px-4 text-muted-foreground">{yacht.minimum_booking_hours}h</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(yacht)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(yacht.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
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
