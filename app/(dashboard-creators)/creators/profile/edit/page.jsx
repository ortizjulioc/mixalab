'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Home, Save, X, AlertCircle, User, Headphones, Sliders, Mic, Music, Sparkles } from 'lucide-react'

import BreadcrumbsTitle from '@/components/Breadcrumbs'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Checkbox from '@/components/Checkbox'
import SectionHeader from '@/components/SectionHeader'
import SelectGenres from '@/components/SelectGenres'
import FileUploadPlaceholder from '@/components/FileUploadPlaceholder'

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

    // Validación de roles
    roles: Yup.object({
        mixing: Yup.boolean(),
        mastering: Yup.boolean(),
        recording: Yup.boolean(),
    }).test('at-least-one-role', 'At least one service must be selected', function (value) {
        const { mixing, mastering, recording } = value || {}
        return mixing || mastering || recording
    }),

    // Mixing fields (conditional)
    yearsMixing: Yup.number().when('roles.mixing', {
        is: true,
        then: (schema) => schema.min(0).required('Years mixing is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    mixingTurnaround: Yup.number().when('roles.mixing', {
        is: true,
        then: (schema) => schema.min(1).required('Turnaround time is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    mixingGenresList: Yup.array().when('roles.mixing', {
        is: true,
        then: (schema) => schema.min(1, 'At least one mixing genre is required').required('Mixing genres are required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    notableArtists: Yup.string().notRequired(),
    tunedVocalExampleNeeded: Yup.boolean().notRequired(),

    // Mastering fields (conditional)
    yearsMastering: Yup.number().when('roles.mastering', {
        is: true,
        then: (schema) => schema.min(0).required('Years mastering is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    masteringTurnaround: Yup.number().when('roles.mastering', {
        is: true,
        then: (schema) => schema.min(1).required('Turnaround time is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    masteringGenresList: Yup.array().when('roles.mastering', {
        is: true,
        then: (schema) => schema.min(1, 'At least one mastering genre is required').required('Mastering genres are required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    loudnessRange: Yup.string().notRequired(),

    // Recording fields (conditional)
    yearsRecording: Yup.number().when('roles.recording', {
        is: true,
        then: (schema) => schema.min(0).required('Years recording is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    instrumentsPlayed: Yup.array().when('roles.recording', {
        is: true,
        then: (schema) => schema.min(1, 'At least one instrument is required').required('Instruments are required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    recordingGenresList: Yup.array().when('roles.recording', {
        is: true,
        then: (schema) => schema.min(1, 'At least one recording genre is required').required('Recording genres are required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    studioSetup: Yup.string().when('roles.recording', {
        is: true,
        then: (schema) => schema.required('Studio setup is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
})

export default function EditCreatorProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Estado para archivos
    const [files, setFiles] = useState({
        mixExampleFile: null,
        masterExampleFile: null,
        performanceExampleFile: null,
        tunedVocalsExampleFile: null,
    })

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
            // mainDaw es un string simple como "fl_studio"
            mainDAWs: profile?.mainDaw ? [profile.mainDaw] : [],
            // pluginChains es un array de strings como ['fabfilter']
            pluginChains: profile?.pluginChains && Array.isArray(profile.pluginChains)
                ? profile.pluginChains
                : [],
            // socials es un array de objetos {link, platform}
            socialLinks: profile?.socials && Array.isArray(profile.socials)
                ? profile.socials
                : [],
            generalGenres: profile?.genders?.map(g => g.genreId) || [],
            roles: {
                mixing: !!profile?.mixing,
                mastering: !!profile?.masteringEngineerProfile,
                recording: !!profile?.instrumentalist,
            },
            // Mixing fields
            yearsMixing: profile?.mixing?.yearsMixing || 0,
            mixingTurnaround: profile?.mixing?.averageTurnaroundTimeDays || 0,
            mixingGenresList: profile?.mixing?.mixingGenres?.map(g => g.genreId) || [],
            notableArtists: profile?.mixing?.notableArtists || '',
            tunedVocalExampleNeeded: profile?.mixing?.doYouTuneVocals || false,
            // Mastering fields
            yearsMastering: profile?.masteringEngineerProfile?.yearsMastering || 0,
            masteringTurnaround: profile?.masteringEngineerProfile?.averageTurnaroundTimeDays || 0,
            masteringGenresList: profile?.masteringEngineerProfile?.masteringGenres?.map(g => g.genreId) || [],
            loudnessRange: profile?.masteringEngineerProfile?.preferredLoudnessRange || '',
            // Recording fields
            yearsRecording: profile?.instrumentalist?.yearsRecordingOrPlaying || 0,
            // instruments debe ser un array de strings
            instrumentsPlayed: profile?.instrumentalist?.instruments && Array.isArray(profile.instrumentalist.instruments)
                ? profile.instrumentalist.instruments
                : [],
            recordingGenresList: profile?.instrumentalist?.instrumentalistGenres?.map(g => g.genreId) || [],
            studioSetup: profile?.instrumentalist?.studioSetupDescription || '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true)
            setError(null)

            try {
                const formData = createCreatorProfileFormData(values, files, session?.user?.id)

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

    const handleFileChange = (fieldName, file) => {
        setFiles(prev => ({ ...prev, [fieldName]: file }))
    }

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
                <div className="p-8 rounded-2xl liquid-glass text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>

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
                <div className="p-8 border border-orange-500/20 bg-orange-500/5 rounded-2xl liquid-glass text-center relative overflow-hidden">

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
        <div className="space-y-8 pb-20">
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
            <div className="rounded-2xl liquid-glass shadow-2xl shadow-indigo-500/5 overflow-hidden">
                <div className="p-8 space-y-8">
                    <form onSubmit={formik.handleSubmit} className="space-y-10">
                        {/* Role Selection */}
                        <div className="bg-indigo-500/5 p-8 rounded-2xl border border-indigo-500/10 backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all duration-500 group-hover:bg-indigo-600/10"></div>
                            <h3 className="text-xl font-bold mb-4 text-indigo-300 flex items-center gap-2">
                                <Headphones className="w-5 h-5 text-indigo-400" />
                                Select Your Services
                            </h3>
                            <p className="text-sm text-gray-400 mb-6 bg-black/20 p-3 rounded-lg border border-white/5 inline-block">Choose which services you want to offer. You can add or remove services at any time.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {['mixing', 'mastering', 'recording'].map(role => (
                                    <label key={role} className="flex items-center p-4 rounded-xl cursor-pointer bg-black/40 hover:bg-black/60 transition-all duration-300 border border-white/5 hover:border-indigo-500/30 has-[:checked]:border-indigo-500/50 has-[:checked]:bg-indigo-500/10 group/item shadow-lg">
                                        <Checkbox
                                            id={`${role}-checkbox`}
                                            checked={values.roles[role]}
                                            onChange={(e) => setFieldValue(`roles.${role}`, e.target.checked)}
                                            label={
                                                role === 'mixing' ? 'Mixing Engineer' :
                                                    role === 'mastering' ? 'Mastering Engineer' :
                                                        'Recording Session'
                                            }
                                            className="font-semibold text-gray-200 group-hover/item:text-white transition-colors capitalize"
                                            containerClassName="w-full"
                                        />
                                    </label>
                                ))}
                            </div>

                            {!values.roles.mixing && !values.roles.mastering && !values.roles.recording && (
                                <p className="text-yellow-400 text-sm mt-3">Please select at least one service to continue.</p>
                            )}
                        </div>

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

                        {/* 🎧 MIXING ENGINEER SECTION */}
                        {values.roles.mixing && (
                            <>
                                <SectionHeader title="Mixing Engineer" icon={Headphones} id="mixing-engineer" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="Years Mixing"
                                        id="yearsMixing"
                                        name="yearsMixing"
                                        required
                                        type="number"
                                        placeholder="3"
                                        min="0"
                                        value={values.yearsMixing}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.yearsMixing && errors.yearsMixing}
                                    />
                                    <Input
                                        label="Average Turnaround Time (days)"
                                        id="mixingTurnaround"
                                        name="mixingTurnaround"
                                        required
                                        type="number"
                                        placeholder="3"
                                        min="1"
                                        value={values.mixingTurnaround}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.mixingTurnaround && errors.mixingTurnaround}
                                    />

                                    <SelectGenres
                                        label="Genres You Mix"
                                        id="mixingGenres"
                                        name="mixingGenresList"
                                        required
                                        value={values.mixingGenresList}
                                        onChange={(event) => setFieldValue('mixingGenresList', event.target.value)}
                                        onBlur={handleBlur}
                                        error={touched.mixingGenresList && errors.mixingGenresList}
                                        className="sm:col-span-2"
                                    />

                                    <Input
                                        label="Notable Artists You've Worked With (optional)"
                                        id="notableArtists"
                                        name="notableArtists"
                                        placeholder="Artist X, Band Y"
                                        value={values.notableArtists}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.notableArtists && errors.notableArtists}
                                        className="sm:col-span-2"
                                    />

                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-sm font-medium text-gray-300 block">Do You Tune Vocals? <span className="text-red-400">*</span></label>
                                        <div className="flex space-x-6">
                                            <Checkbox
                                                id="tuneVocals-yes"
                                                checked={values.tunedVocalExampleNeeded}
                                                onChange={(e) => setFieldValue('tunedVocalExampleNeeded', e.target.checked)}
                                                label="Yes"
                                                containerClassName="mr-4"
                                            />
                                            <Checkbox
                                                id="tuneVocals-no"
                                                checked={!values.tunedVocalExampleNeeded}
                                                onChange={(e) => setFieldValue('tunedVocalExampleNeeded', !e.target.checked)}
                                                label="No"
                                            />
                                        </div>

                                        {values.tunedVocalExampleNeeded && (
                                            <FileUploadPlaceholder
                                                label="Upload Example with Tuned Vocals"
                                                id="tunedVocalsExample"
                                                helperText="Upload an audio example showcasing your vocal tuning skill."
                                                icon={Sparkles}
                                                onChange={(file) => handleFileChange('tunedVocalsExampleFile', file)}
                                                accept="audio/*"
                                            />
                                        )}
                                    </div>

                                    <FileUploadPlaceholder
                                        label="Upload 1 Before & After Mix"
                                        id="mixExample"
                                        helperText="Please upload one pair of 'before' (raw) and 'after' (mixed) files."
                                        icon={Music}
                                        className="sm:col-span-2"
                                        onChange={(file) => handleFileChange('mixExampleFile', file)}
                                        accept="audio/*"
                                    />
                                </div>
                            </>
                        )}

                        {/* 🔊 MASTERING ENGINEER SECTION */}
                        {values.roles.mastering && (
                            <>
                                <SectionHeader title="Mastering Engineer" icon={Sliders} id="mastering-engineer" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="Years Mastering"
                                        id="yearsMastering"
                                        name="yearsMastering"
                                        required
                                        type="number"
                                        placeholder="2"
                                        min="0"
                                        value={values.yearsMastering}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.yearsMastering && errors.yearsMastering}
                                    />
                                    <Input
                                        label="Average Turnaround Time (days)"
                                        id="masteringTurnaround"
                                        name="masteringTurnaround"
                                        required
                                        type="number"
                                        placeholder="2"
                                        min="1"
                                        value={values.masteringTurnaround}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.masteringTurnaround && errors.masteringTurnaround}
                                    />

                                    <SelectGenres
                                        label="Genres You Master"
                                        id="masteringGenres"
                                        name="masteringGenresList"
                                        required
                                        value={values.masteringGenresList}
                                        onChange={(event) => setFieldValue('masteringGenresList', event.target.value)}
                                        onBlur={handleBlur}
                                        error={touched.masteringGenresList && errors.masteringGenresList}
                                        className="sm:col-span-2"
                                    />

                                    <Input
                                        label="Preferred Loudness Range (LUFS or RMS, optional)"
                                        id="loudnessRange"
                                        name="loudnessRange"
                                        placeholder="-12 LUFS to -8 LUFS"
                                        value={values.loudnessRange}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.loudnessRange && errors.loudnessRange}
                                        className="sm:col-span-2"
                                    />

                                    <FileUploadPlaceholder
                                        label="Upload 1 Before & After Master"
                                        id="masterExample"
                                        helperText="Please upload one pair of 'before' (mixed) and 'after' (mastered) files."
                                        icon={Music}
                                        className="sm:col-span-2"
                                        onChange={(file) => handleFileChange('masterExampleFile', file)}
                                        accept="audio/*"
                                    />
                                </div>
                            </>
                        )}

                        {/* 🎙️ RECORDING SESSION SECTION */}
                        {values.roles.recording && (
                            <>
                                <SectionHeader title="Recording Session (Instrumentalist)" icon={Mic} id="recording-session" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="Years of Recording or Playing"
                                        id="yearsRecording"
                                        name="yearsRecording"
                                        required
                                        type="number"
                                        placeholder="10"
                                        min="0"
                                        value={values.yearsRecording}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.yearsRecording && errors.yearsRecording}
                                    />
                                    <div></div>

                                    <Select
                                        label="What Instruments do you play"
                                        id="instrumentsPlayed"
                                        name="instrumentsPlayed"
                                        required
                                        placeholder="Type instrument names, press Enter to add"
                                        value={values.instrumentsPlayed}
                                        onChange={(newValue) => setFieldValue('instrumentsPlayed', newValue)}
                                        onBlur={handleBlur}
                                        error={touched.instrumentsPlayed && errors.instrumentsPlayed}
                                        isMulti
                                        isCreatable
                                        options={[
                                            { label: 'Guitar', value: 'guitar' },
                                            { label: 'Bass', value: 'bass' },
                                            { label: 'Drums', value: 'drums' },
                                            { label: 'Piano', value: 'piano' },
                                            { label: 'Keyboard', value: 'keyboard' },
                                            { label: 'Vocals', value: 'vocals' },
                                            { label: 'Saxophone', value: 'saxophone' },
                                            { label: 'Trumpet', value: 'trumpet' },
                                            { label: 'Violin', value: 'violin' },
                                            { label: 'Cello', value: 'cello' },
                                            { label: 'Flute', value: 'flute' },
                                            { label: 'Clarinet', value: 'clarinet' },
                                            { label: 'Synthesizer', value: 'synthesizer' },
                                            { label: 'Percussion', value: 'percussion' },
                                        ]}
                                        className="sm:col-span-2"
                                    />

                                    <SelectGenres
                                        label="Genres You Record or Perform"
                                        id="recordingGenres"
                                        name="recordingGenresList"
                                        required
                                        value={values.recordingGenresList}
                                        onChange={(event) => setFieldValue('recordingGenresList', event.target.value)}
                                        onBlur={handleBlur}
                                        error={touched.recordingGenresList && errors.recordingGenresList}
                                        className="sm:col-span-2"
                                    />

                                    <Input
                                        label="Studio Setup (brief description)"
                                        id="studioSetup"
                                        name="studioSetup"
                                        required
                                        placeholder="Home studio, custom acoustic treatment, Focusrite interface, specific mic models."
                                        as="textarea"
                                        value={values.studioSetup}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.studioSetup && errors.studioSetup}
                                        className="sm:col-span-2"
                                    />

                                    <FileUploadPlaceholder
                                        label="Upload Audio or Video Example"
                                        id="performanceExample"
                                        helperText="Upload an example showcasing your performance/recording quality."
                                        icon={Music}
                                        className="sm:col-span-2"
                                        onChange={(file) => handleFileChange('performanceExampleFile', file)}
                                        accept="audio/*,video/*"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex gap-4 justify-end pt-8 border-t border-white/5">
                            <Button
                                type="button"
                                color="gray"
                                onClick={() => router.push('/creators/profile')}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 border-white/10 hover:bg-white/5"
                            >
                                <X size={18} />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                color="blue"
                                loading={isSubmitting}
                                disabled={isSubmitting || (!values.roles.mixing && !values.roles.mastering && !values.roles.recording)}
                                className="bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2 px-8"
                            >
                                <Save size={18} />
                                Save Changes
                            </Button>
                        </div>
                        {!values.roles.mixing && !values.roles.mastering && !values.roles.recording && (
                            <p className="text-center text-sm text-yellow-400 mt-3">You must select at least one service to save changes.</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
