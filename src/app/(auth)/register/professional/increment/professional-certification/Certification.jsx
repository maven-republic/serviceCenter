'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarIcon, Award, Building } from "lucide-react"
import Calendar from './Calendar'

export default function Certification({ data, onChange, onRemove }) {
  const supabase = useSupabaseClient()

  const [certOptions, setCertOptions] = useState([])
  const [certQuery, setCertQuery] = useState('')
  const [filteredCerts, setFilteredCerts] = useState([])
  const [showCertList, setShowCertList] = useState(false)

  const [institutions, setInstitutions] = useState([])
  const [orgQuery, setOrgQuery] = useState('')
  const [filteredInstitutions, setFilteredInstitutions] = useState([])
  const [showInstitutionList, setShowInstitutionList] = useState(false)

  useEffect(() => {
    const fetchCertifications = async () => {
      const { data, error } = await supabase
        .from('certification')
        .select('certification_id, name')
        .order('name')
      if (!error) setCertOptions(data)
    }

    const fetchInstitutions = async () => {
      const { data, error } = await supabase
        .from('institution')
        .select('institution_id, name')
        .order('name')
      if (!error) setInstitutions(data)
    }

    fetchCertifications()
    fetchInstitutions()
  }, [supabase])

  useEffect(() => {
    if (certQuery.trim()) {
      const matches = certOptions.filter(cert =>
        cert.name.toLowerCase().includes(certQuery.toLowerCase())
      )
      setFilteredCerts(matches)
      setShowCertList(true)
    } else {
      setFilteredCerts([])
      setShowCertList(false)
    }
  }, [certQuery, certOptions])

  useEffect(() => {
    if (orgQuery.trim()) {
      const matches = institutions.filter(inst =>
        inst.name.toLowerCase().includes(orgQuery.toLowerCase())
      )
      setFilteredInstitutions(matches)
      setShowInstitutionList(true)
    } else {
      setFilteredInstitutions([])
      setShowInstitutionList(false)
    }
  }, [orgQuery, institutions])

  return (
    <div className="space-y-6">
      {/* Certification Name */}
      <div className="space-y-2 relative">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Award className="h-4 w-4" />
          Certification
        </Label>
        <Input
          type="text"
          placeholder="Search for certification..."
          value={data.certificationName}
          onChange={(e) => {
            const value = e.target.value
            setCertQuery(value)
            onChange('certificationName', value)
          }}
          onFocus={() => setShowCertList(true)}
          onBlur={() => setTimeout(() => setShowCertList(false), 150)}
          className="transition-all duration-200"
        />
        
        {showCertList && filteredCerts.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto shadow-lg">
            <CardContent className="p-0">
              {filteredCerts.map(opt => (
                <button
                  key={opt.certification_id}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0"
                  onMouseDown={() => {
                    onChange('certificationName', opt.name)
                    setCertQuery(opt.name)
                    setShowCertList(false)
                  }}
                >
                  {opt.name}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Issuing Organization */}
      <div className="space-y-2 relative">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Building className="h-4 w-4" />
          Issuing Organization
        </Label>
        <Input
          type="text"
          placeholder="Search for the issuing organization..."
          value={data.issuingOrganization}
          onChange={(e) => {
            const value = e.target.value
            setOrgQuery(value)
            onChange('issuingOrganization', value)
          }}
          onFocus={() => setShowInstitutionList(true)}
          onBlur={() => setTimeout(() => setShowInstitutionList(false), 150)}
          className="transition-all duration-200"
        />
        
        {showInstitutionList && filteredInstitutions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto shadow-lg">
            <CardContent className="p-0">
              {filteredInstitutions.map(inst => (
                <button
                  key={inst.institution_id}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0"
                  onMouseDown={() => {
                    onChange('issuingOrganization', inst.name)
                    setOrgQuery(inst.name)
                    setShowInstitutionList(false)
                  }}
                >
                  {inst.name}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Issue Date
          </Label>
          <Calendar
            value={data.issueDate}
            onChange={(value) => onChange('issueDate', value)}
            placeholder="Select issue date"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Expiration Date
          </Label>
          <Calendar
            value={data.expirationDate}
            onChange={(value) => onChange('expirationDate', value)}
            placeholder="Select expiration date"
          />
        </div>
      </div>

      {/* Remove Button */}
      {typeof onRemove === 'function' && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            Remove Certification
          </Button>
        </div>
      )}
    </div>
  )
}