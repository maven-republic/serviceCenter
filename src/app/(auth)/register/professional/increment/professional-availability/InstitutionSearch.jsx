'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import SearchableDropdown from './SearchableDropdown'

export default function InstitutionSearch({ value, onChange }) {
  const supabase = useSupabaseClient()
  const [institutions, setInstitutions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchInstitutions = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('institution')
          .select('institution_id, name, type, location')
          .order('name')
        
        if (!error) {
          // Add subtitle for better display
          const institutionsWithSubtitle = data.map(inst => ({
            ...inst,
            subtitle: inst.type || inst.location || null
          }))
          setInstitutions(institutionsWithSubtitle)
        }
      } catch (error) {
        console.error('Error fetching institutions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstitutions()
  }, [supabase])

  return (
    <SelectWithSearch
      label="Issuing Organization"
      placeholder="Search for the issuing organization"
      value={value}
      options={institutions}
      onValueChange={onChange}
      displayField="name"
      valueField="name"
      isLoading={isLoading}
      noResultsMessage="No institutions found"
    />
  )
}