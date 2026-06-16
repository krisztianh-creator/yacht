'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import YachtsList from '@/components/dashboard/yachts-list'
import YachtForm from '@/components/dashboard/yacht-form'
import BookingsList from '@/components/dashboard/bookings-list'
import AvailabilityCalendar from '@/components/dashboard/availability-calendar'
import { type Yacht } from '@/lib/yachts'
import { Plus, Home } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAdmin, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('yachts')
  const [showForm, setShowForm] = useState(false)
  const [editingYacht, setEditingYacht] = useState<Yacht | undefined>()
  const [selectedYachtId, setSelectedYachtId] = useState<string | undefined>()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, isAdmin, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleEdit = (yacht: Yacht) => {
    setEditingYacht(yacht)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingYacht(undefined)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingYacht(undefined)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingYacht(undefined)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">yacht. Admin</h1>
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 px-4 py-2 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('yachts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'yachts'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-input text-foreground hover:bg-muted'
            }`}
          >
            Yachts
          </button>
          <button
            onClick={() => setActiveTab('add-ons')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'add-ons'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-input text-foreground hover:bg-muted'
            }`}
          >
            Add-ons
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'availability'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-input text-foreground hover:bg-muted'
            }`}
          >
            Availability
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-input text-foreground hover:bg-muted'
            }`}
          >
            Bookings
          </button>
        </div>

        {/* Content */}
        {activeTab === 'yachts' && (
          <div className="space-y-6">
            {showForm ? (
              <YachtForm
                yacht={editingYacht}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            ) : (
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Yachts Management</h2>
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Yacht
                  </button>
                </div>
                <YachtsList onEdit={handleEdit} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-ons' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add-ons Management</h2>
              <button className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors">
                Add Add-on
              </button>
            </div>
            <p className="text-muted-foreground">Add-ons management coming soon...</p>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Availability Calendar</h2>
            <AvailabilityCalendar />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Bookings</h2>
            <BookingsList />
          </div>
        )}
      </div>
    </div>
  )
}
