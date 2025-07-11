"use client"

import { useState } from 'react'
import Header from '@/components/header/Header20'
import Footer from '@/components/footer/Footer'
import ProfessionalAccountCreation from './ProfessionalAccountCreation'
import ProgressionIndicator from './ProgressionIndicator'

export default function ProfessionalAccountCreationInterface({ searchParams }) {
  const [currentStep, setCurrentStep] = useState(1)

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const errorMessage = searchParams?.error || null

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Progression Indicator */}
        {/* <ProgressionIndicator currentStep={currentStep} /> */}
        
        {/* Registration Form */}
        <ProfessionalAccountCreation
          errorMessage={errorMessage}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      </main>
      
      {/* <Footer /> */}
    </div>
  )
}