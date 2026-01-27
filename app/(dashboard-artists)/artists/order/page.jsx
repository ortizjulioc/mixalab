'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import useServiceRequests from '@/hooks/useServiceRequests';
import { openNotification } from '@/utils/open-notification';

// --- Imports ---
import Step1_Strategy from '@/components/wizard/Step1_Strategy';
import Step2_Assets from '@/components/wizard/Step2_Assets';
import Step3_Review from '@/components/wizard/Step3_Review';
import { SERVICE_CHECKLISTS } from '@/components/wizard/constants';

export default function NewRequestPage() {
  const router = useRouter();
  const { createServiceRequest, loading: submitting } = useServiceRequests();

  // --- State Configuration ---
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Project Info
    projectName: '',
    artistName: '',
    projectType: '', // SINGLE, EP, ALBUM
    description: '',
    genreIds: [],

    // Service Strategy
    services: '', // MIXING, MASTERING
    mixingType: '', // STUDIO_MIX, LIVE_MIX, ESSENTIAL_MIX
    tier: '',     // BRONZE, SILVER, GOLD, PLATINUM

    // Assets
    demoFile: null,
    stemsFile: null,

    // Add-ons
    addOns: {}, // { addonId: boolean | { quantity: number } | { option: boolean } }

    // Final Review & Checklist
    checklist: [], // Array of indices
    legalName: '',
    termsAccepted: false
  });

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  // --- Validation Logic ---
  const validateStep = (step) => {
    switch (step) {
      case 1: // Project & Strategy
        if (!formData.projectName?.trim()) return { valid: false, msg: 'Project Name is required' };
        if (!formData.artistName?.trim()) return { valid: false, msg: 'Artist Name is required' };
        if (!formData.projectType) return { valid: false, msg: 'Please select a Project Type' };
        if (!formData.genreIds || formData.genreIds.length === 0) return { valid: false, msg: 'Select at least one Genre' };

        if (!formData.services) return { valid: false, msg: 'Please select a Service' };
        if (formData.services === 'MIXING' && !formData.mixingType) return { valid: false, msg: 'Select a Mixing Type' };
        if (!formData.tier) return { valid: false, msg: 'Please select a Quality Tier' };
        return { valid: true };

      case 2: // Assets
        // Demo is optional, but Stems are critical usually. Let's make Stems required.
        if (!formData.stemsFile) return { valid: false, msg: 'Please upload your Stems/Multitrack file' };
        return { valid: true };

      case 3: // Review
        const requiredChecklist = SERVICE_CHECKLISTS[formData.services] || [];
        if (requiredChecklist.length > 0) {
          // Check if all items are checked
          if (!formData.checklist || formData.checklist.length !== requiredChecklist.length) {
            return { valid: false, msg: `Please confirm all ${formData.services === 'MIXING' ? 'Mixing' : 'Mastering'} requirements.` };
          }
        }

        if (!formData.legalName?.trim()) return { valid: false, msg: 'Legal Name signature is required' };
        if (!formData.termsAccepted) return { valid: false, msg: 'You must accept the Terms of Service' };
        return { valid: true };

      default:
        return { valid: true };
    }
  };

  // --- Navigation Handlers ---
  const handleNext = () => {
    const { valid, msg } = validateStep(currentStep);
    if (!valid) {
      openNotification('error', msg);
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    // Final re-validation
    const { valid, msg } = validateStep(3);
    if (!valid) {
      openNotification('error', msg);
      return;
    }

    try {
      const submissionData = {
        ...formData,
        genreIds: JSON.stringify(formData.genreIds),
        // Group acceptance fields into a single object expected by backend
        acceptance: {
          checklist: formData.checklist,
          legalName: formData.legalName,
          termsAccepted: formData.termsAccepted,
          checklistItems: SERVICE_CHECKLISTS[formData.services] || [] // Optionally saving the text too for record
        }
      };

      const success = await createServiceRequest(submissionData);
      if (success) {
        // Redirect to matching page instead of listing
        router.push(`/artists/matching/${success.data.id}`);
      }
    } catch (error) {
      console.error('Submission failed', error);
      openNotification('error', 'Failed to submit request');
    }
  };

  // --- Steps Configuration ---
  const steps = [
    { number: 1, title: 'Strategy', subtitle: 'Project & Service' },
    { number: 2, title: 'Assets', subtitle: 'Files & Extras' },
    { number: 3, title: 'Launch', subtitle: 'Review & Submit' }
  ];

  const calculateProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  return (
    <div className="text-white p-4 pb-12 w-full max-w-full overflow-x-hidden">
      {/* Max Width Container */}
      <div className="max-w-4xl mx-auto w-full">

        {/* Header & Steps */}
        <div className="mb-12">
          {/* Progress Bar */}
          <div className="relative h-1 bg-zinc-800 rounded-full mb-8 max-w-2xl mx-auto">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${calculateProgress()}%` }}
            />

            {/* Step Indicators */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between">
              {steps.map((step) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;

                return (
                  <div key={step.number} className="relative flex flex-col items-center group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ${isCompleted ? 'bg-amber-500 border-amber-500' :
                        isCurrent ? 'bg-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' :
                          'bg-zinc-900 border-zinc-700'
                      }`}>
                      {isCompleted ? (
                        <CheckCircle2 size={14} className="text-black" />
                      ) : (
                        <span className={`text-xs font-bold ${isCurrent ? 'text-amber-500' : 'text-gray-500'}`}>
                          {step.number}
                        </span>
                      )}
                    </div>

                    <div className={`absolute top-10 flex flex-col items-center w-32 text-center transition-all duration-300 ${isCurrent ? 'opacity-100 transform translate-y-0' : 'opacity-60'}`}>
                      <span className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-500'}`}>{step.title}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider hidden md:block">{step.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="mt-16 mb-8">
          {currentStep === 1 && (
            <Step1_Strategy
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
            />
          )}
          {currentStep === 2 && (
            <Step2_Assets
              formData={formData}
              handleFileChange={handleFileChange}
              setFormData={setFormData}
            />
          )}
          {currentStep === 3 && (
            <Step3_Review
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
            />
          )}
        </div>

        {/* FOOTER NAVIGATION (Static at bottom) */}
        <div className="mt-12 border-t border-zinc-800 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || submitting}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${currentStep === 1
                  ? 'text-zinc-600 cursor-not-allowed'
                  : 'text-white hover:bg-zinc-800'
                }`}
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden md:block">
                Step {currentStep} of {steps.length}: <span className="text-white font-medium">{steps[currentStep - 1].title}</span>
              </span>

              <button
                onClick={handleNext}
                disabled={submitting}
                className="group flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold shadow-lg shadow-amber-900/20 hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{currentStep === steps.length ? (submitting ? 'Launching...' : 'Submit Request') : 'Continue'}</span>
                {currentStep === steps.length ? (
                  submitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin ml-2" />
                  ) : (
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                  )
                ) : (
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
