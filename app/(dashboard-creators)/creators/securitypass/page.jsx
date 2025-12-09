'use client'
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User, Zap, Headphones, Mic, Sparkles, Sliders, Music } from 'lucide-react';
import Checkbox from '@/components/Checkbox';
import SectionHeader from '@/components/SectionHeader';
import Input from '@/components/Input';
import Select from '@/components/Select';
import SocialsInput from './SocialsInput';
import FileUploadPlaceholder from '@/components/FileUploadPlaceholder';
import Button from '@/components/Button';
import SelectGenres from '@/components/SelectGenres';
import { createCreatorProfileFormData, submitCreatorProfile, validateRequiredFiles } from '@/utils/submit-creator-profile';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { openNotification } from '@/utils/open-notification';

// Lista simplificada de países para el campo de selección
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
];

// Validation Schema using Yup
const validationSchema = Yup.object({
  stageName: Yup.string().required('Stage name is required'),
  country: Yup.string().required('Country is required'),
  yearsExperience: Yup.number().min(0).required('Years of experience is required'),
  availability: Yup.string().required('Availability is required'),
  mainDAWs: Yup.array().min(1, 'At least one DAW is required').required('Main DAWs are required'),
  pluginChains: Yup.array().min(1, 'At least one plugin/gear is required').required('Plugin chain/gear list is required'),
  generalGenres: Yup.array().min(1, 'At least one genre is required').required('Genres are required'),
  socialLinks: Yup.array().min(1, 'At least one social link is required').required('Social links are required'),

  // Conditional validations for roles
  ...(true && {  // Base schema, conditionals added via .when in full schema if needed
    roles: Yup.object({
      mixing: Yup.boolean(),
      mastering: Yup.boolean(),
      recording: Yup.boolean(),
    }).test('at-least-one-role', 'At least one role must be selected', function (value) {
      const { mixing, mastering, recording } = value || {};
      return mixing || mastering || recording;
    }),
  }),

  // Mixing fields (validated if role selected, but for simplicity, require if present)
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

  // Mastering fields
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

  // Recording fields
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

  // Common optional fields
  portfolioLink: Yup.string().url('Must be a valid URL').notRequired(),
});

// Initial Values
const initialValues = {
  stageName: '',
  country: '',
  yearsExperience: '',
  availability: '',
  portfolioLink: '',
  mainDAWs: [],
  pluginChains: [],
  socialLinks: [],
  generalGenres: [],
  roles: {
    mixing: false,
    mastering: false,
    recording: false,
  },
  tunedVocalExampleNeeded: false,
  yearsMixing: '',
  mixingTurnaround: '',
  notableArtists: '',
  mixingGenresList: [],
  yearsMastering: '',
  masteringTurnaround: '',
  loudnessRange: '',
  masteringGenresList: [],
  yearsRecording: '',
  instrumentsPlayed: [],
  recordingGenresList: [],
  studioSetup: '',
};

// Main Application Form Component
const App = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Estado para archivos
  const [files, setFiles] = useState({
    mixExampleFile: null,
    masterExampleFile: null,
    performanceExampleFile: null,
    tunedVocalsExampleFile: null,
  });

  // Verificar si ya existe un perfil para este usuario
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/creator-profiles?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            setExistingProfile(data.items[0]);
          }
        }
      } catch (error) {
        console.error('Error checking existing profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkExistingProfile();
  }, [session?.user?.id]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Validar archivos requeridos
        const fileValidation = validateRequiredFiles(values.roles, files);
        if (!fileValidation.valid) {
          openNotification('error', fileValidation.errors.join('\n'));
          setIsSubmitting(false);
          return;
        }

        // Crear FormData
        const formData = createCreatorProfileFormData(values, files, session?.user?.id);

        // Si existe un perfil REJECTED, hacer UPDATE en lugar de CREATE
        if (existingProfile && existingProfile.status === 'REJECTED') {
          // TODO: Implementar endpoint de UPDATE
          openNotification('info', 'Update functionality coming soon...');
          setIsSubmitting(false);
          return;
        }

        // Enviar al API
        const result = await submitCreatorProfile(formData);

        console.log('Creator Profile created successfully:', result);
        openNotification('success', 'Application submitted successfully! Redirecting to dashboard...');

        // Redirigir al dashboard después de un pequeño delay
        setTimeout(() => {
          router.push('/creators/home');
        }, 1500);

      } catch (error) {
        console.error('Error submitting application:', error);
        setSubmitError(error.message);
        openNotification('error', error.message || 'An error occurred while submitting your application');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isValid, dirty } = formik;
  const isAnyRoleSelected = values.roles.mixing || values.roles.mastering || values.roles.recording;

  const handleRoleChange = (role, checked) => {
    setFieldValue(`roles.${role}`, checked);
  };

  const handleTunedVocalChange = (checked) => {
    setFieldValue('tunedVocalExampleNeeded', checked);
  };

  const handleFileChange = (fieldName, file) => {
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  // Mensajes según el estado del perfil
  const getStatusMessage = () => {
    if (!existingProfile) return null;

    const messages = {
      PENDING: {
        title: '⏳ Application Under Review',
        message: 'Your Creator Security Pass application is currently being reviewed by our team. This process typically takes 24-48 hours. You cannot edit your application while it\'s under review.',
        color: 'bg-blue-900/40 border-blue-600',
      },
      APPROVED: {
        title: '✅ Application Approved',
        message: 'Congratulations! Your Creator Security Pass has been approved. You can now access all creator features from your dashboard.',
        color: 'bg-green-900/40 border-green-600',
      },
      REJECTED: {
        title: '❌ Application Rejected',
        message: 'Your application was not approved. Please review the feedback below, make the necessary improvements, and resubmit your application.',
        color: 'bg-red-900/40 border-red-600',
      },
      SUSPENDED: {
        title: '🛡️ Account Suspended',
        message: 'Your Creator Security Pass has been suspended. Please contact support for more information about reactivating your account.',
        color: 'bg-orange-900/40 border-orange-600',
      },
    };

    return messages[existingProfile.status];
  };

  const statusMessage = getStatusMessage();
  const canEdit = !existingProfile || existingProfile.status === 'REJECTED';

  // Mostrar loading mientras verifica el perfil
  if (loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto bg-white/5 p-6 sm:p-10 rounded-xl shadow-2xl border-t-4 border-amber-500">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="ml-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Si no puede editar, mostrar mensaje y botón para volver
  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto bg-white/5 p-6 sm:p-10 rounded-xl shadow-2xl border-t-4 border-amber-500">
        <header className="text-center mb-10">
          <p className="text-sm font-mono text-gray-400 mb-2">MIXA CREATOR SECURITY PASS</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center">
            <Zap className="w-8 h-8 mr-3 text-amber-500" />
            {statusMessage.title}
          </h1>
        </header>

        <div className={`${statusMessage.color} border-2 rounded-xl p-8 mb-6`}>
          <p className="text-gray-200 text-lg text-center mb-6">
            {statusMessage.message}
          </p>

          {existingProfile.status === 'PENDING' && (
            <div className="text-center text-sm text-gray-400">
              <p>Submitted: {new Date(existingProfile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => router.push('/creators/home')}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-xl transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white/5 p-6 sm:p-10 rounded-xl shadow-2xl border-t-4 border-amber-500">
      {/* Header */}
      <header className="text-center mb-10">
        <p className="text-sm font-mono text-gray-400 mb-2">MIXA CREATOR SECURITY PASS</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center">
          <Zap className="w-8 h-8 mr-3 text-amber-500 animate-pulse" />
          Access the Lab. Prove your Precision.
        </h1>
      </header>

      <form onSubmit={formik.handleSubmit} className="space-y-8">

        {/* Role Selection */}
        <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-amber-300">Select Your Role(s)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['mixing', 'mastering', 'recording'].map(role => (
              <label key={role} className="flex items-center p-3 rounded-lg cursor-pointer bg-black hover:bg-gray-900 transition duration-150 ease-in-out border border-transparent has-[:checked]:border-amber-500 has-[:checked]:bg-gray-700/70">
                <Checkbox
                  id={`${role}-checkbox`}
                  checked={values.roles[role]}
                  onChange={(e) => handleRoleChange(role, e.target.checked)}
                  label={
                    role === 'mixing' ? 'Mixing Engineer' :
                      role === 'mastering' ? 'Mastering Engineer' :
                        'Recording Session (Musician)'
                  }
                  className="capitalize text-gray-200"
                  containerClassName="w-full"
                />
              </label>
            ))}
          </div>
          {formik.touched.roles && errors.roles && (
            <p className="text-red-400 text-sm mt-3">{errors.roles}</p>
          )}
          {!isAnyRoleSelected && (
            <p className="text-red-400 text-sm mt-3">Please select at least one role to continue.</p>
          )}
        </div>

        {/* 🔐 GENERAL INFO SECTION (Required for all applicants) */}
        <SectionHeader title="General Info" icon={User} id="general-info" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Row 1: Stage Name & Country */}
          <Input
            label="Stage / Brand Name"
            id="stageName"
            name="stageName"
            required={true}
            placeholder="Miksa-Aurelius or Studio Echo"
            value={values.stageName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.stageName && errors.stageName}
          />
          <Select
            label="Country of Residence"
            id="country"
            name="country"
            required={true}
            options={COUNTRIES}
            value={values.country}
            onChange={(newValue) => setFieldValue('country', newValue)}
            onBlur={handleBlur}
            error={touched.country && errors.country}
          />

          {/* Row 2: Years of Experience & Availability */}
          <Input
            label="Years of Experience"
            id="yearsExperience"
            name="yearsExperience"
            required={true}
            type="number"
            placeholder="5"
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
            required={true}
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

          {/* Row 3: Portfolio Link & Main DAW */}
          <Input
            label="Portfolio or Sample Link (optional)"
            id="portfolioLink"
            name="portfolioLink"
            placeholder="Drive, Dropbox, or website link"
            value={values.portfolioLink}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.portfolioLink && errors.portfolioLink}
          />
          <Select
            label="Main DAW"
            id="mainDaw"
            name="mainDAWs"
            required={true}
            placeholder="Type DAW names, press Enter to add"
            value={values.mainDAWs}
            onChange={(newValue) => setFieldValue('mainDAWs', newValue)}
            onBlur={handleBlur}
            error={touched.mainDAWs && errors.mainDAWs}
            isMulti={true}
            isCreatable={true}
            options={
              [
                { label: 'Ableton Live', value: 'ableton_live' },
                { label: 'FL Studio', value: 'fl_studio' },
                { label: 'Logic Pro', value: 'logic_pro' },
                { label: 'Pro Tools', value: 'pro_tools' },
                { label: 'Cubase', value: 'cubase' },
                { label: 'Studio One', value: 'studio_one' },
                { label: 'Reaper', value: 'reaper' },
                { label: 'Other', value: 'other' },
              ]
            }
          />

          {/* Row 4: Socials (Full Width) */}
          <SocialsInput
            label="Social Media Links"
            name="socialLinks"
            socials={values.socialLinks}
            setSocials={(newSocials) => setFieldValue('socialLinks', newSocials)}
            className="sm:col-span-2"
            required={true}
            error={touched.socialLinks && errors.socialLinks}
          />

          {/* Row 5: Plugin Chain / Gear List (Full Width) */}
          <Select
            label="Plugin Chain / Gear List"
            id="gearList"
            name="pluginChains"
            required={true}
            placeholder="Type gear names, press Enter to add"
            value={values.pluginChains}
            onChange={(newValue) => setFieldValue('pluginChains', newValue)}
            onBlur={handleBlur}
            error={touched.pluginChains && errors.pluginChains}
            isMulti={true}
            isCreatable={true}
            options={
              [
                { label: 'Waves', value: 'waves' },
                { label: 'FabFilter', value: 'fabfilter' },
                { label: 'Universal Audio', value: 'universal_audio' },
                { label: 'iZotope', value: 'izotope' },
                { label: 'Native Instruments', value: 'native_instruments' },
                { label: 'Other', value: 'other' },
              ]
            }
            className="sm:col-span-2"
          />

          {/* Row 6: Genres You Specialize In (Full Width) */}
          <SelectGenres
            label="Genres You Specialize In"
            id="genresSpecialized"
            name="generalGenres"
            required={true}
            value={values.generalGenres}  // This should now be an array like [1, 2, 3]
            onChange={(event) => setFieldValue('generalGenres', event.target.value)}  // ← Extract the value here
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

              {/* Row 1: Years Mixing & Turnaround Time (Paired) */}
              <Input
                label="Years Mixing"
                id="yearsMixing"
                name="yearsMixing"
                required={true}
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
                required={true}
                type="number"
                placeholder="3"
                min="1"
                value={values.mixingTurnaround}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.mixingTurnaround && errors.mixingTurnaround}
              />

              {/* Row 2: Genres You Mix (Full Width) */}
              <SelectGenres
                label="Genres You Mix"
                id="mixingGenres"
                name="mixingGenresList"
                required={true}
                value={values.mixingGenresList}
                onChange={(event) => setFieldValue('mixingGenresList', event.target.value)}
                onBlur={handleBlur}
                error={touched.mixingGenresList && errors.mixingGenresList}
                className="sm:col-span-2"
              />

              {/* Row 3: Notable Artists (Full Width) */}
              <Input
                label="Notable Artists You’ve Worked With (optional)"
                id="notableArtists"
                name="notableArtists"
                placeholder="Artist X, Band Y"
                value={values.notableArtists}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.notableArtists && errors.notableArtists}
                className="sm:col-span-2"
              />

              {/* Row 4: Vocal Tuning Conditional (Full Width) */}
              <div className="sm:col-span-2 space-y-3">
                <label className="text-sm font-medium text-gray-300 block">Do You Tune Vocals? <span className="text-red-400">*</span></label>
                <div className="flex space-x-6">
                  <Checkbox
                    id="tuneVocals-yes"
                    checked={values.tunedVocalExampleNeeded}
                    onChange={(e) => handleTunedVocalChange(e.target.checked)}
                    label="Yes"
                    containerClassName="mr-4"
                  />
                  <Checkbox
                    id="tuneVocals-no"
                    checked={!values.tunedVocalExampleNeeded}
                    onChange={(e) => handleTunedVocalChange(!e.target.checked)}
                    label="No"
                  />
                </div>

                {values.tunedVocalExampleNeeded && (
                  <FileUploadPlaceholder
                    label="Upload Example with Tuned Vocals"
                    id="tunedVocalsExample"
                    required={true}
                    helperText="Upload an audio example showcasing your vocal tuning skill."
                    icon={Sparkles}
                    onChange={(file) => handleFileChange('tunedVocalsExampleFile', file)}
                    accept="audio/*"
                  />
                )}
              </div>

              {/* Row 5: Upload Mix (Full Width, al final) */}
              <FileUploadPlaceholder
                label="Upload 1 Before & After Mix"
                id="mixExample"
                required={true}
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

              {/* Row 1: Years Mastering & Turnaround Time (Paired) */}
              <Input
                label="Years Mastering"
                id="yearsMastering"
                name="yearsMastering"
                required={true}
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
                required={true}
                type="number"
                placeholder="2"
                min="1"
                value={values.masteringTurnaround}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.masteringTurnaround && errors.masteringTurnaround}
              />

              {/* Row 2: Genres You Master (Full Width) */}
              <SelectGenres
                label="Genres You Master"
                id="masteringGenres"
                name="masteringGenresList"
                required={true}
                value={values.masteringGenresList}
                onChange={(event) => setFieldValue('masteringGenresList', event.target.value)}
                onBlur={handleBlur}
                error={touched.masteringGenresList && errors.masteringGenresList}
                className="sm:col-span-2"
              />

              {/* Row 3: Preferred Loudness Range (Full Width) */}
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

              {/* Row 4: Upload Master (Full Width, al final) */}
              <FileUploadPlaceholder
                label="Upload 1 Before & After Master"
                id="masterExample"
                required={true}
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

              {/* Row 1: Years of Recording (1/2) + Spacer */}
              <Input
                label="Years of Recording or Playing"
                id="yearsRecording"
                name="yearsRecording"
                required={true}
                type="number"
                placeholder="10"
                min="0"
                value={values.yearsRecording}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.yearsRecording && errors.yearsRecording}
              />
              {/* Div vacío para mantener la alineación en desktop */}
              <div></div>

              {/* Row 2: Instruments (Full Width MultiSelect) */}
              <Select
                label="What Instruments do you play"
                id="instrumentsPlayed"
                name="instrumentsPlayed"
                required={true}
                placeholder="Type instrument names, press Enter to add"
                value={values.instrumentsPlayed}
                onChange={(newValue) => setFieldValue('instrumentsPlayed', newValue)}
                onBlur={handleBlur}
                error={touched.instrumentsPlayed && errors.instrumentsPlayed}
                isMulti={true}
                isCreatable={true}
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

              {/* Row 3: Genres (Full Width MultiSelect) */}
              <SelectGenres
                label="Genres You Record or Perform"
                id="recordingGenres"
                name="recordingGenresList"
                required={true}
                value={values.recordingGenresList}
                onChange={(event) => setFieldValue('recordingGenresList', event.target.value)}
                onBlur={handleBlur}
                error={touched.recordingGenresList && errors.recordingGenresList}
                className="sm:col-span-2"
              />

              {/* Row 4: Studio Setup (Full Width Text Area) */}
              <Input
                label="Studio Setup (brief description)"
                id="studioSetup"
                name="studioSetup"
                required={true}
                placeholder="Home studio, custom acoustic treatment, Focusrite interface, specific mic models."
                as="textarea"
                value={values.studioSetup}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.studioSetup && errors.studioSetup}
                className="sm:col-span-2"
              />

              {/* Row 5: Upload Example (Full Width, al final) */}
              <FileUploadPlaceholder
                label="Upload Audio or Video Example"
                id="performanceExample"
                required={true}
                helperText="Upload an example showcasing your performance/recording quality."
                icon={Music}
                className="sm:col-span-2"
                onChange={(file) => handleFileChange('performanceExampleFile', file)}
                accept="audio/*,video/*"
              />
            </div>
          </>
        )}

        {/* Submission Button */}
        <div className="pt-8 border-t border-gray-700 mt-10">
          {/* DEBUG: Mostrar errores de validación */}
          {!isValid && Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
              <p className="text-yellow-400 text-sm font-bold mb-2">Validation Errors (Debug):</p>
              <pre className="text-xs text-yellow-300 overflow-auto max-h-40">
                {JSON.stringify(errors, null, 2)}
              </pre>
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}
          <Button
            type="submit"
            disabled={!isAnyRoleSelected || !isValid || !dirty || isSubmitting}
            className={`w-full py-3 rounded-xl text-lg font-bold transition duration-300 ease-in-out ${isAnyRoleSelected && isValid && dirty && !isSubmitting
              ? 'bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-lg shadow-amber-500/50'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Creator Pass Application'}
          </Button>
          {!isAnyRoleSelected && (
            <p className="text-center text-sm text-gray-400 mt-3">You must select at least one role to submit the application.</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default App;