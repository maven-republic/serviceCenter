// app/(auth)/register/page.jsx
import Link from "next/link"
import Header from "@/components/header/Header20"
import Footer from "@/components/footer/Footer"

export default function RegisterSelection() {
  return (
     <div className="bgc-thm4"> 
      {/* <Header /> */}
      {/* <section className="our-register"> */}
              <section className="
              ">

        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
              <div className="main-title text-center">
                <h2 className="title">Create An Account</h2>
              </div>
            </div>
          </div>
          
          <div className="row mt-5">
            <div className="col-md-6 mb-4">
              <div className="card h-100 text-center p-5 shadow-sm hover-shadow">
                <div className="card-body">
                  <h3 className="mb-4">Customer</h3>
                  <p className="mb-4">Looking for services from professionals</p>
                  <Link href="/register/customer" className="btn btn-thm btn-lg">
                    Sign up as a Customer
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card h-100 text-center p-5 shadow-sm hover-shadow">
                <div className="card-body">
                  <h3 className="mb-4">Professional</h3>
                  <p className="mb-4">Offering your professional services</p>
                  <Link href="/register/professional" className="btn btn-thm btn-lg">
                    Sign up as a Professional
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  )
}

