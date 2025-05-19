"use client"

import { useState } from 'react'
import Header from '@/components/header/Header20'
import Footer from '@/components/footer/Footer'
import ProfessionalRegistrationForm from './ProfessionalRegistrationForm'

export default function ProfessionalRegistrationPage({ searchParams }) {
  const [currentStep, setCurrentStep] = useState(1)

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 10))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const errorMessage = searchParams?.error || null

  return (
    <div>
      <Header />
      <section className="our-register">
        <ProfessionalRegistrationForm
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
