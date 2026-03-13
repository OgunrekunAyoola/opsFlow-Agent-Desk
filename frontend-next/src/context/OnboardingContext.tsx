'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type BrandTone = 'professional' | 'friendly' | 'concise';

export interface OnboardingData {
  companyName: string;
  supportEmail: string;
  industry: string;
  teamSize: string;
  brandTone: BrandTone;
  autoSendEnabled: boolean;
  escalationThreshold: number;
}

export interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const defaultData: OnboardingData = {
  companyName: '',
  supportEmail: '',
  industry: '',
  teamSize: '',
  brandTone: 'professional',
  autoSendEnabled: false,
  escalationThreshold: 70,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6)); // Step 6 is celebration
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateData,
        currentStep,
        setStep: setCurrentStep,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
