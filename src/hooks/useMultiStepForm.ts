// src/hooks/useMultiStepForm.ts
import { useState, useCallback } from 'react';

interface UseMultiStepFormOptions<T> {
  initialData: T;
  totalSteps: number;
  onSubmit?: (data: T) => Promise<void> | void;
}

interface UseMultiStepFormReturn<T> {
  currentStep: number;
  formData: T;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  updateFormData: (data: Partial<T>) => void;
  resetForm: () => void;
  handleSubmit: () => Promise<void>;
}

export function useMultiStepForm<T extends Record<string, unknown>>({
  initialData,
  totalSteps,
  onSubmit,
}: UseMultiStepFormOptions<T>): UseMultiStepFormReturn<T> {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<T>(initialData);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setCurrentStep(1);
  }, [initialData]);

  const handleSubmit = useCallback(async () => {
    if (onSubmit) {
      await onSubmit(formData);
    }
  }, [formData, onSubmit]);

  return {
    currentStep,
    formData,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateFormData,
    resetForm,
    handleSubmit,
  };
}