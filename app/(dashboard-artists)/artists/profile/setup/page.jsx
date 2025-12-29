
'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AlertCircle, CheckCircle2, Loader2, Globe } from 'lucide-react'
import Swal from 'sweetalert2'
import SelectGenres from '@/components/SelectGenres'
import useArtistProfiles from '@/hooks/useArtistProfiles'

export default function ArtistSetup() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const {
    artistProfile,
    getArtistProfileByUserId,
    createArtistProfile,
    updateArtistProfile,
    loading: hookLoading
  } = useArtistProfiles()

  const [submitLoading, setSubmitLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    stageName: '',
    bio: '',
    website: '',
    socials: {
      instagram: '',
      spotify: '',
      youtube: '',
      soundcloud: '',
    },
    genreIds: [],
  })

  // Fetch existing profile
  useEffect(() => {
    if (session?.user?.id) {
      getArtistProfileByUserId(session.user.id)
    }
  }, [session?.user?.id, getArtistProfileByUserId])

  // Load existing profile data into form
  useEffect(() => {
    if (artistProfile) {
      setFormData({
        stageName: artistProfile.stageName || '',
        bio: artistProfile.bio || '',
        website: artistProfile.website || '',
        socials: artistProfile.socials || {
          instagram: '',
          spotify: '',
          youtube: '',
          soundcloud: '',
        },
        genreIds: artistProfile.genres?.map(g => g.genreId) || [],
      })
    }
  }, [artistProfile])

  // Validations
  const validateForm = () => {
    const newErrors = {}

    if (!formData.stageName.trim()) {
      newErrors.stageName = 'Stage Name is required'
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Invalid URL format'
    }

    if (formData.genreIds.length === 0) {
      newErrors.genres = 'Select at least one genre'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [platform]: value,
      },
    }))
  }

  const handleAddGenre = (genreIds) => {
    setFormData(prev => ({
      ...prev,
      genreIds,
    }))
    if (errors.genres) {
      setErrors(prev => ({
        ...prev,
        genres: '',
      }))
    }
  }

  const handleRemoveGenre = (genreId) => {
    setFormData(prev => ({
      ...prev,
      genreIds: prev.genreIds.filter(id => id !== genreId),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    setSubmitLoading(true)

    try {
      const payload = {
        ...formData,
        ...((!artistProfile) && { userId: session.user.id }),
      }

      if (artistProfile) {
        // Update existing profile
        await updateArtistProfile(artistProfile.id, payload)
      } else {
        // Create new profile
        await createArtistProfile(payload)
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Artist Profile saved successfully',
        confirmButtonColor: '#f59e0b',
      })

      router.push('/artists/home')
    } catch (error) {
      console.error('Error saving profile:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.error?.message || error?.message || 'Error saving profile',
        confirmButtonColor: '#f59e0b',
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  if (status === 'loading' || hookLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-900/40 border-2 border-red-600/70 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-200">Please log in to access this page</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Artist Profile Setup
        </h1>
        <p className="text-gray-400">
          {artistProfile
            ? 'Update your artist profile information'
            : 'Complete your artist profile to activate project assignment'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stage Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Stage Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="stageName"
            value={formData.stageName}
            onChange={handleInputChange}
            placeholder="Your artist name"
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 ${errors.stageName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-700 focus:ring-amber-500'
              }`}
          />
          {errors.stageName && (
            <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.stageName}</span>
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.bio.length}/500
          </p>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Website
          </label>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className={`flex-1 px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 ${errors.website
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:ring-amber-500'
                }`}
            />
          </div>
          {errors.website && (
            <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.website}</span>
            </p>
          )}
        </div>

        {/* Socials */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Social Networks</h3>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={formData.socials.instagram}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              placeholder="@yourprofile"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Spotify */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Spotify
            </label>
            <input
              type="text"
              value={formData.socials.spotify}
              onChange={(e) => handleSocialChange('spotify', e.target.value)}
              placeholder="spotify.com/artist/..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              YouTube
            </label>
            <input
              type="text"
              value={formData.socials.youtube}
              onChange={(e) => handleSocialChange('youtube', e.target.value)}
              placeholder="youtube.com/@yourprofile"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* SoundCloud */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              SoundCloud
            </label>
            <input
              type="text"
              value={formData.socials.soundcloud}
              onChange={(e) => handleSocialChange('soundcloud', e.target.value)}
              placeholder="soundcloud.com/yourprofile"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Genres */}
        <SelectGenres
          value={formData.genreIds}
          label="Genres"
          name="genreIds"
          required
          placeholder="Search and select genres..."
          onChange={(e) => handleAddGenre(e.target.value)}
          isMulti={true}
        />
        {errors.genres && (
          <p className="text-sm text-red-500 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.genres}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={submitLoading}
            className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2"
          >
            {submitLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{artistProfile ? 'Update Profile' : 'Create Profile'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
