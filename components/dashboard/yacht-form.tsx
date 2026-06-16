'use client'

import { useState, useEffect, useRef } from 'react'
import { createYacht, updateYacht, type Yacht, type YachtInput } from '@/lib/yachts'
import { supabase } from '@/lib/supabase'
import { X, Upload } from 'lucide-react'

interface YachtFormProps {
  yacht?: Yacht
  onSuccess: () => void
  onCancel: () => void
}

export default function YachtForm({ yacht, onSuccess, onCancel }: YachtFormProps) {
  const [formData, setFormData] = useState<YachtInput>({
    name: '',
    type: 'Luxury Yacht',
    image: null,
    images: [],
    capacity: 10,
    hourly_rate: 500,
    rating: 4.5,
    reviews: 0,
    minimum_booking_hours: 2,
    offers: [],
    location: 'Dubai Harbour',
    features: [],
  })
  const [newOffer, setNewOffer] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (yacht) {
      setFormData({
        name: yacht.name,
        type: yacht.type,
        image: yacht.image,
        images: yacht.images || [],
        capacity: yacht.capacity,
        hourly_rate: yacht.hourly_rate,
        rating: yacht.rating,
        reviews: yacht.reviews,
        minimum_booking_hours: yacht.minimum_booking_hours,
        offers: yacht.offers,
        location: yacht.location,
        features: yacht.features,
      })
    }
  }, [yacht])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('yacht-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('yacht-images')
        .getPublicUrl(filePath)

      // Add to images array and set as main image if it's the first one
      const newImages = [...formData.images, publicUrl]
      setFormData({
        ...formData,
        images: newImages,
        image: formData.image || publicUrl
      })

      // Clear the file input so user can upload another image
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError('Failed to upload image')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (yacht) {
        const { error } = await updateYacht(yacht.id, formData)
        if (error) {
          console.error('Update error:', error)
          throw new Error(error.message || 'Failed to update yacht')
        }
      } else {
        const { error } = await createYacht(formData)
        if (error) {
          console.error('Create error:', error)
          throw new Error(error.message || 'Failed to create yacht')
        }
      }
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save yacht'
      setError(errorMessage)
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  const addOffer = () => {
    if (newOffer.trim()) {
      setFormData({ ...formData, offers: [...formData.offers, newOffer.trim()] })
      setNewOffer('')
    }
  }

  const removeOffer = (index: number) => {
    setFormData({
      ...formData,
      offers: formData.offers.filter((_, i) => i !== index),
    })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {yacht ? 'Edit Yacht' : 'Add New Yacht'}
        </h2>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Luxury Yacht">Luxury Yacht</option>
              <option value="Catamaran">Catamaran</option>
              <option value="Speedboat">Speedboat</option>
              <option value="Sailboat">Sailboat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Capacity *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
              min="1"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hourly Rate ($) *
            </label>
            <input
              type="number"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Min Booking Hours *
            </label>
            <input
              type="number"
              value={formData.minimum_booking_hours}
              onChange={(e) => setFormData({ ...formData, minimum_booking_hours: parseInt(e.target.value) })}
              required
              min="1"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rating
            </label>
            <input
              type="number"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
              min="0"
              max="5"
              step="0.1"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Images
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="flex-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  disabled={uploading}
                  className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : <Upload className="w-4 h-4" />}
                </button>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Yacht image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index)
                          setFormData({
                            ...formData,
                            images: newImages,
                            image: newImages[0] || null
                          })
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Offers */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Offers
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newOffer}
              onChange={(e) => setNewOffer(e.target.value)}
              placeholder="e.g., Free 1 Hour Jet Ski Ride"
              className="flex-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addOffer}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.offers.map((offer, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded"
              >
                {offer}
                <button
                  type="button"
                  onClick={() => removeOffer(index)}
                  className="hover:text-amber-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Features
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="e.g., 3 bedroom, 1 kitchen"
              className="flex-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : yacht ? 'Update Yacht' : 'Add Yacht'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
