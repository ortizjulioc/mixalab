'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Home, Save, X, AlertCircle, User, Headphones, Sliders, Mic } from 'lucide-react'

import BreadcrumbsTitle from '@/components/Breadcrumbs'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Checkbox from '@/components/Checkbox'
import SectionHeader from '@/components/SectionHeader'
import SelectGenres from '@/components/SelectGenres'

import { createCreatorProfileFormData } from '@/utils/submit-creator-profile'
import SocialsInput from '../../securitypass/SocialsInput'

const COUNTRIES = [
    { value: '', label: 'Select a Country' },
    { label: 'Argentina', value: 'AR' },
    { label: 'Australia', value: 'AU' },
    { label: 'Brazil', value: 'BR' },
    { label: 'Canada', value: 'CA' },
    { label: 'France', value: 'FR' },
    { label: 'Germany', value: 'DE' },
    { label: 'India', value: 'IN' },
    { label: 'Japan', value: 'JP' },
    { label: 'Mexico', value: 'MX' },
    { label: 'Spain', value: 'ES' },
    { label: 'United Kingdom', value: 'GB' },
    { label: 'United States', value: 'US' },
    { label: 'Other', value: 'OTHER' },
]

const validationSchema = Yup.object({
    stageName: Yup.string().required('Stage name is required'),
    country: Yup.string().required('Country is required'),
    yearsExperience: Yup.number().min(0).required('Years of experience is required'),
    availability: Yup.string().required('Availability is required'),
    mainDAWs: Yup.array().min(1, 'At least one DAW is required').required('Main DAWs are required'),
    pluginChains: Yup.array().min(1, 'At least one plugin/gear is required').required('Plugin chain/gear list is required'),
    generalGenres: Yup.array().min(1, 'At least one genre is required').required('Genres are required'),
    socialLinks: Yup.array().min(1, 'At least one social link is required').required('Social links are required'),
    portfolioLink: Yup.string().url('Must be a valid URL').notRequired(),
})

export default function EditCreatorProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.id) return

            try {
                const response = await fetch(`/api/creator-profiles/user/${session.user.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setProfile(data)
                } else {
                    setError('Failed to load profile')
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
                setError('Error loading profile')
            } finally {
                setLoading(false)
            }
        }

        if (status === 'authenticated') {
            fetchProfile()
        }
    }, [session, status])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            stageName: profile?.brandName || '',
            country: profile?.country || '',
            yearsExperience: profile?.yearsOfExperience || 0,
            availability: profile?.availability || 'ON_DEMAND',
            portfolioLink: profile?.portfolio || '',
            mainDAWs: [],
            pluginChains: [],
            socialLinks: [],
            generalGenres: profile?.genders?.map(g => g.genreId) || [],
            roles: {
                mixing: !!profile?.mixing,
                mastering: !!profile?.masteringEngineerProfile,
                recording: !!profile?.instrumentalist,
            },
            // Mixing fields
            yearsMixing: profile?.mixing?.yearsMixing || 0,
            mixingTurnaround: profile?.mixing?.averageTurnaroundTimeDays || 0,
            mixingGenresList: [],
            notableArtists: '',
            tunedVocalExampleNeeded: profile?.mixing?.doYouTuneVocals || false,
            // Mastering fields
            yearsMastering: profile?.masteringEngineerProfile?.yearsMastering || 0,
            masteringTurnaround: profile?.masteringEngineerProfile?.averageTurnaroundTimeDays || 0,
            masteringGenresList: [],
            loudnessRange: profile?.masteringEngineerProfile?.preferredLoudnessRange || '',
            // Recording fields
            yearsRecording: profile?.instrumentalist?.yearsRecordingOrPlaying || 0,
            instrumentsPlayed: profile?.instrumentalist?.instruments || [],
            recordingGenresList: [],
            studioSetup: profile?.instrumentalist?.studioSetupDescription || '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true)
            setError(null)

            try {
                const formData = createCreatorProfileFormData(values, {}, session?.user?.id)

                const response = await fetch(`/api/creator-profiles/${profile.id}`, {
                    method: 'PUT',
                    body: formData,
                })

                if (response.ok) {
                    router.push('/creators/profile')
                } else {
                    const errorData = await response.json()
                    setError(errorData.message || 'Failed to update profile')
                }
            } catch (error) {
                console.error('Error updating profile:', error)
                setError('Error updating profile')
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="space-y-8">
                <BreadcrumbsTitle
                    title="Edit Profile"
                    items={[
                        { label: 'Dashboard', href: '/creators/home', icon: <Home size={18} /> },
                        { label: 'Profile', href: '/creators/profile' },
                        { label: 'Edit' },
                    ]}
                />
                <div className="p-8 border border-white/20 rounded-2xl liquid-glass text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
                    <p className="text-gray-400 mb-6">{error || 'Unable to load your profile'}</p>
                    <Button color="blue" onClick={() => router.push('/creators/profile')}>
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    if (profile.status === 'SUSPENDED') {
        return (
            <div className="space-y-8">
                <BreadcrumbsTitle
                    title="Edit Profile"
                    items={[
                        { label: 'Dashboard', href: '/creators/home', icon: <Home size={18} /> },
                        { label: 'Profile', href: '/creators/profile' },
                        { label: 'Edit' },
                    ]}
                />
                <div className="p-8 border border-orange-500/30 bg-orange-500/10 rounded-2xl liquid-glass text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Suspended</h2>
                    <p className="text-gray-400 mb-6">
                        Your profile is currently suspended. You cannot edit it at this time.
                    </p>
                    <Button color="blue" onClick={() => router.push('/creators/profile')}>
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <BreadcrumbsTitle
                title="Edit Profile"
                items={[
                    { label: 'Dashboard', href: '/creators/home', icon: <Home size={18} /> },
                    { label: 'Profile', href: '/creators/profile' },
                    { label: 'Edit' },
                ]}
            />

            {/* Warning Banner */}
            <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-xl">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-yellow-400 font-medium">Important Notice</p>
                        <p className="text-yellow-400/80 text-sm mt-1">
                            After saving your changes, your profile will be set to PENDING status and will need to be approved again by an administrator.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400">{error}</p>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            <div className="p-8 border border-white/20 rounded-2xl liquid-glass">
                <form onSubmit={formik.handleSubmit} className="space-y-8">
                    {/* General Info Section */}
                    <SectionHeader title="General Info" icon={User} id="general-info" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input
                            label="Stage / Brand Name"
                            id="stageName"
                            name="stageName"
                            required
                            value={values.stageName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.stageName && errors.stageName}
                        />

                        <Select
                            label="Country of Residence"
                            id="country"
                            name="country"
                            required
                            options={COUNTRIES}
                            value={values.country}
                            onChange={(newValue) => setFieldValue('country', newValue)}
                            onBlur={handleBlur}
                            error={touched.country && errors.country}
                        />

                        <Input
                            label="Years of Experience"
                            id="yearsExperience"
                            name="yearsExperience"
                            required
                            type="number"
                            min="0"
                            value={values.yearsExperience}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.yearsExperience && errors.yearsExperience}
                        />

                        <Select
                            label="Availability"
                            id="availability"
                            name="availability"
                            required
                            options={[
                                { label: 'Full-Time', value: 'FULL_TIME' },
                                { label: 'Part-Time', value: 'PART_TIME' },
                                { label: 'On-Demand', value: 'ON_DEMAND' },
                            ]}
                            value={values.availability}
                            onChange={(newValue) => setFieldValue('availability', newValue)}
                            onBlur={handleBlur}
                            error={touched.availability && errors.availability}
                        />

                        <Input
                            label="Portfolio or Sample Link (optional)"
                            id="portfolioLink"
                            name="portfolioLink"
                            value={values.portfolioLink}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.portfolioLink && errors.portfolioLink}
                        />

                        <Select
                            label="Main DAW"
                            id="mainDaw"
                            name="mainDAWs"
                            required
                            placeholder="Type DAW names, press Enter to add"
                            value={values.mainDAWs}
                            onChange={(newValue) => setFieldValue('mainDAWs', newValue)}
                            onBlur={handleBlur}
                            error={touched.mainDAWs && errors.mainDAWs}
                            isMulti
                            isCreatable
                            options={[
                                { label: 'Ableton Live', value: 'ableton_live' },
                                { label: 'FL Studio', value: 'fl_studio' },
                                { label: 'Logic Pro', value: 'logic_pro' },
                                { label: 'Pro Tools', value: 'pro_tools' },
                                { label: 'Cubase', value: 'cubase' },
                                { label: 'Studio One', value: 'studio_one' },
                                { label: 'Reaper', value: 'reaper' },
                            ]}
                        />

                        <SocialsInput
                            label="Social Media Links"
                            name="socialLinks"
                            socials={values.socialLinks}
                            setSocials={(newSocials) => setFieldValue('socialLinks', newSocials)}
                            className="sm:col-span-2"
                            required
                            error={touched.socialLinks && errors.socialLinks}
                        />

                        <Select
                            label="Plugin Chain / Gear List"
                            id="gearList"
                            name="pluginChains"
                            required
                            placeholder="Type gear names, press Enter to add"
                            value={values.pluginChains}
                            onChange={(newValue) => setFieldValue('pluginChains', newValue)}
                            onBlur={handleBlur}
                            error={touched.pluginChains && errors.pluginChains}
                            isMulti
                            isCreatable
                            options={[
                                { label: 'Waves', value: 'waves' },
                                { label: 'FabFilter', value: 'fabfilter' },
                                { label: 'Universal Audio', value: 'universal_audio' },
                                { label: 'iZotope', value: 'izotope' },
                                { label: 'Native Instruments', value: 'native_instruments' },
                            ]}
                            className="sm:col-span-2"
                        />

                        <SelectGenres
                            label="Genres You Specialize In"
                            id="genresSpecialized"
                            name="generalGenres"
                            required
                            value={values.generalGenres}
                            onChange={(event) => setFieldValue('generalGenres', event.target.value)}
                            onBlur={handleBlur}
                            error={touched.generalGenres && errors.generalGenres}
                            className="sm:col-span-2"
                        />
                    </div>

                    <div className="flex gap-4 justify-end pt-4 border-t border-white/10">
                        <Button
                            type="button"
                            color="gray"
                            onClick={() => router.push('/creators/profile')}
                            disabled={isSubmitting}
                            className="flex items-center gap-2"
                        >
                            <X size={18} />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="blue"
                            loading={isSubmitting}
                            className="flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
