"use client";
import Image from "next/image";
import HeroSearch1 from "../element/HeroSearch1";
import { useState } from "react";
import { useRouter } from "next/navigation";

const role = [
  "Graphics & Design",
  "Digital Marketing",
  "Writing & Translation",
  "Video & Animation",
  "Programming & Tech",
];

const popular = ["Designer", "Developer", "Web", "IOS", "PHP", "Senior"];

export default function Hero12() {
  const [getSelectedRole, setSelectedRole] = useState(null);

  // role handler
  const roleHandler = (select) => {
    setSelectedRole(select);
  };
  const router = useRouter();

  // search handler
  const searchHandler = () => {
    router.push("/project-1");
  };
  return (
    <section className="hero-home12 p-0 overflow-hidden">
      <div className="container">
        <div className="row">
          <div className="col-xl-7">
            <div className="home12-hero-content">
              <span className="d-inline-block tag animate-up-1 mb15">
                Get Started
              </span>
              <h1 className="animate-up-1 mb25">
                Freelance Services For <br className="d-none d-xl-block" />
                Your Business
              </h1>
              <p className="text animate-up-2">
                Work with talented people at the most affordable price to get
                the most <br className="d-none d-lg-block" /> out of your time
                and cost
              </p>
              <div className="advance-search-tab bgc-white p10 bdrs4-sm bdrs60 banner-btn position-relative zi1 animate-up-3 mt30">
                <div className="row">
                  <div className="col-md-5 col-lg-6 col-xl-6">
                    <div className="advance-search-field mb10-sm">
                      <HeroSearch1 />
                    </div>
                  </div>
                  <div className="col-md-4 col-lg-4 col-xl-3">
                    <div className="bselect-style1  bdrl1 bdrn-sm">
                      <div className="dropdown bootstrap-select">
                        <button
                          type="button"
                          className="btn dropdown-toggle btn-light"
                          data-bs-toggle="dropdown"
                        >
                          <div className="filter-option">
                            <div className="filter-option-inner">
                              <div className="filter-option-inner-inner">
                                {getSelectedRole !== null
                                  ? getSelectedRole
                                  : "Choose Category"}
                              </div>
                            </div>{" "}
                          </div>
                        </button>
                        <div className="dropdown-menu ">
                          <div className="inner show">
                            <ul className="dropdown-menu inner show">
                              {role.map((item, index) => (
                                <li
                                  onClick={() => roleHandler(item)}
                                  key={index}
                                  className="selected active"
                                >
                                  <a
                                    className={`dropdown-item selected ${
                                      getSelectedRole === item ? "active" : ""
                                    }`}
                                  >
                                    <span className="text">{item}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-lg-2 col-xl-3">
                    <div className="text-center text-xl-start">
                      <button
                        className="ud-btn btn-dark w-100 bdrs60"
                        type="button"
                        onClick={searchHandler}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="animate-up-2 dark-color ff-heading mt30 mb15">
                Popular Searches
              </p>
              <div className="home9-tags at-home12 d-md-flex align-items-center animate-up-4">
                {popular.map((elm, i) => (
                  <a key={i} className="bdrs60 mb-2 mb-md-0" href="#">
                    {elm}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="col-xl-5 d-none d-xl-block">
            <div className="home12-hero-img">
              <div className="position-relative">
                <Image
                  width={196}
                  height={129}
                  className="img-1 bounce-x"
                  src="/images/team/home12-img-1.png"
                  alt=" image "
                />
                <Image
                  width={114}
                  height={114}
                  className="img-2 bounce-y"
                  src="/images/team/home12-img-2.png"
                  alt=" image "
                />
                <Image
                  width={90}
                  height={90}
                  style={{ height: "fit-content" }}
                  className="img-3 bounce-y"
                  src="/images/team/home12-img-3.png"
                  alt=" image "
                />
              </div>
              <Image
                width={810}
                height={860}
                style={{ height: "fit-content" }}
                className="img-0"
                src="/images/about/home12-hero-img.png"
                alt=" image "
              />
              <div className="iconbox-small1 text-start d-flex wow fadeInRight default-box-shadow4 bounce-x animate-up-1">
                <span className="icon flaticon-review"></span>
                <div className="details pl20">
                  <h6 className="mb-1">4.9/5</h6>
                  <p className="text fz13 mb-0">Clients rate professionals</p>
                </div>
              </div>
              <div className="iconbox-small2 text-start d-flex wow fadeInLeft default-box-shadow4 bounce-y animate-up-2">
                <span className="icon flaticon-rocket"></span>
                <div className="details pl20">
                  <h6 className="mb-1">12M+</h6>
                  <p className="text fz13 mb-0">Project Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

