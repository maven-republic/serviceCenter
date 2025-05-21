'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

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
    <div>
      <div className="mb-4 position-relative">
        <label className="form-label small text-muted">Certification</label>
        <input
          type="text"
          className="form-control rounded-3 px-3 py-2 "
          placeholder="Search for certification."
          value={data.certificationName}
          onChange={(e) => {
            const value = e.target.value
            setCertQuery(value)
            onChange('certificationName', value)
          }}
          onFocus={() => setShowCertList(true)}
          onBlur={() => setTimeout(() => setShowCertList(false), 150)}
        />
        {showCertList && filteredCerts.length > 0 && (
          <ul className="list-group position-absolute w-100 z-10" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredCerts.map(opt => (
              <li
                key={opt.certification_id}
                className="list-group-item list-group-item-action"
                onMouseDown={() => {
                  onChange('certificationName', opt.name)
                  setCertQuery(opt.name)
                  setShowCertList(false)
                }}
                style={{ cursor: 'pointer' }}
              >
                {opt.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4 position-relative">
        <label className="form-label small text-muted">Issuing Organization</label>
        <input
          type="text"
          className="form-control rounded-3 px-3 py-2"
          placeholder="Search for the issuing organization "
          value={data.issuingOrganization}
          onChange={(e) => {
            const value = e.target.value
            setOrgQuery(value)
            onChange('issuingOrganization', value)
          }}
          onFocus={() => setShowInstitutionList(true)}
          onBlur={() => setTimeout(() => setShowInstitutionList(false), 150)}
        />
        {showInstitutionList && filteredInstitutions.length > 0 && (
          <ul className="list-group position-absolute w-100  z-10" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredInstitutions.map(inst => (
              <li
                key={inst.institution_id}
                className="list-group-item list-group-item-action"
                onMouseDown={() => {
                  onChange('issuingOrganization', inst.name)
                  setOrgQuery(inst.name)
                  setShowInstitutionList(false)
                }}
                style={{ cursor: 'pointer' }}
              >
                {inst.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label small text-muted">Issue Date</label>
          <input
            type="date"
            className="form-control rounded-3 px-3 py-2 "
            value={data.issueDate}
            onChange={(e) => onChange('issueDate', e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small text-muted">Expiration Date</label>
          <input
            type="date"
            className="form-control rounded-3 px-3 py-2 "
            value={data.expirationDate}
            onChange={(e) => onChange('expirationDate', e.target.value)}
          />
        </div>
      </div>

      {typeof onRemove === 'function' && (
        <div className="text-end">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}
