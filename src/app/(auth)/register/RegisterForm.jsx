'use client'

import { signup } from './actions'
import Link from "next/link"

export default function RegisterForm({ errorMessage }) {
  return (
    <form method="POST" action={signup}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
            <div className="main-title text-center">
              <h2 className="title">Register</h2>
            </div>
          </div>
        </div>
        <div className="row wow fadeInRight" data-wow-delay="300ms">
          <div className="col-xl-6 mx-auto">
            <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              <div className="mb30">
                <h4>Let's create your account!</h4>
                <p className="text mt20">
                  Already have an account?{" "}
                  <Link href="/login" className="text-thm">
                    Log In!
                  </Link>
                </p>
              </div>
              <div className="mb25">
                <label className="form-label fw500 dark-color">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  placeholder="John"
                  required
                />
              </div>
              <div className="mb25">
                <label className="form-label fw500 dark-color">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  placeholder="Doe"
                  required
                />
              </div> 
              <div className="mb25">
                <label className="form-label fw500 dark-color">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="johndoe@email.com"
                  required
                />
              </div>
              <div className="mb25">
                <label className="form-label fw500 dark-color">
                  Phone Number
                </label> 
                <input
                  id="phone"
                  type="tel" 
                  name="phone"
                  className="form-control"
                  placeholder="123-456-7890"
                  pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
                  required 
                />
              </div>
              <div className='mb25'>
                  <label className='form-label fw500 dark-color'>
                    Who would you like to signup as?
                  </label>
                  <select name='role' className='form-control' required>
                      <option value=''>Select Role</option>   
                      <option value='customer'>Customer</option>
                      <option value='service_provider'>Service Provider</option>
                  </select>
              </div>
              <div className='mb25'>
                  <label className='form-label fw500 dark-color'>
                    Gender
                  </label>
                  <select name='gender' className='form-control' required>
                      <option value=''>Select gender</option>   
                      <option value='male'>Male</option>
                      <option value='female'>Female</option>
                  </select>
              </div>
              <div className="mb15">
                <label className="form-label fw500 dark-color">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="*******"
                  required
                />
              </div>
              <div className='mb25'>
                <label className='form-label fw500 dark-color'>
                    Confirm Password
                    </label>
                    <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    className='form-control'
                    placeholder='*******'
                    required
                    />
              </div> 
              <div className="d-grid mb20">
                <button
                  className="ud-btn btn-thm default-box-shadow2"
                  type="submit"
                >
                  Create Account <i className="fal fa-arrow-right-long" />
                </button>
              </div>
              <div className="hr_content mb20">
                <hr />
                <span className="hr_top_text">OR</span>
              </div>
              <div className="d-md-flex justify-content-between">
                <button
                  className="ud-btn btn-fb fz14 fw400 mb-2 mb-md-0"
                  type="button"
                >
                  <i className="fab fa-facebook-f pr10" /> Continue Facebook
                </button>
                <button
                  className="ud-btn btn-google fz14 fw400 mb-2 mb-md-0"
                  type="button"
                >
                  <i className="fab fa-google" /> Continue Google
                </button>
                <button
                  className="ud-btn btn-apple fz14 fw400"
                  type="button"
                >
                  <i className="fab fa-apple" /> Continue Apple
                </button>
              </div>
              {errorMessage && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
