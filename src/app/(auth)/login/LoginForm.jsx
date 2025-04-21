

'use client'

import { login } from './actions'
import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore';
// import { createClient } from '../../../../utils/supabase/server'

export default function LoginForm({errorMessage}) {
  // const supabase = await createClient()
  // const { data, error } = await supabase.auth.getUser()
  // const { user, fetchUser } = useUserStore()

  // useEffect(()=>{
  //   return () => {
  //     fetchUser(data?.user.id);
  //   }
  // })
  
  return (
    <form action={login}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
            <div className="main-title text-center">
              <h2 className="title">Log In</h2>
            </div>
          </div>
        </div>
        <div className="row wow fadeInRight" data-wow-delay="300ms">
          <div className="col-xl-6 mx-auto">
            <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              <div className="mb30">
                <h4>We're glad to see you again!</h4>
                <p className="text">
                  Don't have an account?{" "}
                  <a href="/register" className="text-thm">
                    Sign Up!
                  </a>
                </p>
              </div>
              <div className="mb20">
                <label className="form-label fw600 dark-color">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="alitfn58@gmail.com"
                  required
                />
              </div>
              <div className="mb15">
                <label className="form-label fw600 dark-color">
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
              <div className="checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb20">
                <label className="custom_checkbox fz14 ff-heading">
                  Remember me
                  <input type="checkbox" defaultChecked="checked" />
                  <span className="checkmark" />
                </label>
                <a className="fz14 ff-heading">Forgot Password?</a>
              </div>
              <div className="d-grid mb20">
                <button className="ud-btn btn-thm" type="submit">
                  Log In <i className="fal fa-arrow-right-long" />
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


//testing branch 