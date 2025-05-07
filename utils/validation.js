// utils/validation.js

/**
 * Validate email format.
 * @param {string} email
 * @returns {string} Error message or empty string if valid.
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Please enter an email'
    if (!re.test(email)) return 'Please enter a valid email address'
    return ''
}

/**
 * Validate password strength.
 * @param {string} password
 * @returns {string} Error message or empty string if valid.
 */
export function validatePassword(password) {
    if (!password) return 'Password is required'
    const errors = []
    if (password.length < 8) errors.push('Be at least 8 characters long')
    if (!/[A-Z]/.test(password)) errors.push('Include at least one uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('Include at least one lowercase letter')
    if (!/[0-9]/.test(password)) errors.push('Include at least one number')
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Include at least one special character')
    return errors.length ?
        `Your password must: ${errors.join(', ')}` :
        ''
}

/**
 * Validate that password and confirmation match.
 * @param {string} password
 * @param {string} confirm
 * @returns {string} Error message or empty string if valid.
 */
export function validateConfirmPassword(password, confirm) {
    if (!confirm) return 'Please confirm your password'
    if (password !== confirm) return 'Passwords do not match'
    return ''
}

/**
 * Validate first name.
 * @param {string} name
 * @returns {string} Error message or empty string if valid.
 */
export function validateFirstName(name) {
    if (!name) return 'First name is required'
    if (name.length < 2) return 'First name must be at least 2 characters'
    if (!/^[a-zA-Z\s-']+$/.test(name)) return 'Only letters, spaces, hyphens & apostrophes allowed'
    return ''
}

/**
 * Validate last name.
 * @param {string} name
 * @returns {string} Error message or empty string if valid.
 */
export function validateLastName(name) {
    if (!name) return 'Last name is required'
    if (name.length < 2) return 'Last name must be at least 2 characters'
    if (!/^[a-zA-Z\s-']+$/.test(name)) return 'Only letters, spaces, hyphens & apostrophes allowed'
    return ''
}

/**
 * Validate experience selection.
 * @param {string|number} exp
 * @returns {string} Error message or empty string if valid.
 */
export function validateExperience(exp) {
    if (!exp) return 'Please select your years of experience'
    return ''
}

/**
 * Validate street address.
 * @param {string} addr
 * @returns {string} Error message or empty string if valid.
 */
export function validateStreetAddress(addr) {
    if (!addr) return 'Street address is required'
    if (addr.length < 5) return 'Please enter a complete street address'
    return ''
}

/**
 * Validate city/town.
 * @param {string} city
 * @returns {string} Error message or empty string if valid.
 */
export function validateCity(city) {
    if (!city) return 'City/Town is required'
    if (city.length < 2) return 'Please enter a valid city or town name'
    return ''
}

/**
 * Validate parish selection.
 * @param {string} parish
 * @returns {string} Error message or empty string if valid.
 */
export function validateParish(parish) {
    if (!parish) return 'Please select a parish'
    return ''
}

/**
 * Validate phone number (10 digits).
 * @param {string} phone
 * @returns {string} Error message or empty string if valid.
 */
export function validatePhone(phone) {
    if (!phone) return 'Phone number is required'
    const digits = phone.replace(/[-()\s]/g, '')
    if (!/^\d{10}$/.test(digits)) return 'Please enter a valid 10-digit phone number'
    return ''
}

export function validateInstitutionId(val) {
    if (!val) return 'Please select or add an institution'
    return ''
}
export function validateDegree(val) {
    if (!val) return 'Please enter your degree'
    return ''
}
export function validateFieldOfStudy(val) {
    if (!val) return 'Please enter your field of study'
    return ''
}

export function validateEndDate(startDate, endDate) {
    if (!startDate) return 'Start date is required.'
  
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return 'End date must be after start date.'
    }
  
    return ''
  }
  

  export function validateWorkExperienceEntry(entry) {
    if (!entry.position || entry.position.trim().length < 2) {
      return 'Job title is required and must be at least 2 characters.'
    }
  
    if (!entry.start_date) {
      return 'Start date is required.'
    }
  
    if (entry.end_date && new Date(entry.end_date) < new Date(entry.start_date)) {
      return 'End date must be after start date.'
    }
  
    if (!entry.company_id && !entry.freeform_company_name) {
      return 'Please select or enter a company name.'
    }
  
    return ''
  }
  