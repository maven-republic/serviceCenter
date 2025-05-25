"use client"

import { useState } from 'react'
import Header from '@/components/header/Header20'
import Footer from '@/components/footer/Footer'
import ProfessionalAccountCreation from './ProfessionalAccountCreation'

export default function ProfessionalAccountCreationInterface({ searchParams }) {
  const [currentStep, setCurrentStep] = useState(1)

const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8)) // was 8
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const errorMessage = searchParams?.error || null

  return (
    <div>
      <Header />
      <section className="our-register">
        <ProfessionalAccountCreation
          errorMessage={errorMessage}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      </section>
      {/* <Footer /> */}
    </div>
  )
}

