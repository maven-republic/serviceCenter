"use client";
import { useState } from "react";

export default function Breadcumb10({ path }) {
  const [shareToggle, setShareToggle] = useState(false);
  const [saveToggle, setSaveToggle] = useState(false);

  return (
    <section className="breadcumb-section">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex flex-wrap">
          {/* Left */}
          <div className="w-full sm:w-8/12 lg:w-10/12">
            <div className="breadcumb-style1 mb-[10px] sm:mb-0">
              <div className="breadcumb-list">
                {path?.map((item, i) => (
                  <a key={i}>{item}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="w-full sm:w-4/12 lg:w-2/12">
            <div className="flex items-center sm:justify-end">
              {/* Share */}
              <a
                onClick={() => setShareToggle(!shareToggle)}
                className="relative ui-share-toggle"
              >
                <div
                  className={`share-save-widget inline-flex items-center ${
                    shareToggle ? "active" : ""
                  }`}
                >
                  <span className="icon flaticon-share dark-color fz12 mr-[10px]" />
                  <div className="h6 mb-0">Share</div>
                </div>

                {shareToggle && (
                  <div className="ui-social-media">
                    <a>
                      <i className="fa-brands fa-facebook-f" />
                    </a>
                    <a>
                      <i className="fa-brands fa-twitter" />
                    </a>
                    <a>
                      <i className="fa-brands fa-linkedin-in" />
                    </a>
                    <a>
                      <i className="fa-brands fa-pinterest-p" />
                    </a>
                  </div>
                )}
              </a>

              {/* Save */}
              <a onClick={() => setSaveToggle(!saveToggle)}>
                <div
                  className={`share-save-widget inline-flex items-center ml-[15px] ${
                    saveToggle ? "active" : ""
                  }`}
                >
                  <span className="icon flaticon-like dark-color fz12 mr-[10px]" />
                  <div className="h6 mb-0">Save</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
