"use client";
import { projectProposal1 } from "@/data/product";
import ProjectProposalCard1 from "../card/ProjectProposalCard1";
import ServiceDetailExtra1 from "../element/ServiceDetailExtra1";
import ProjectPriceWidget1 from "../element/ProjectPriceWidget1";
import ProjectContactWidget1 from "../element/ProjectContactWidget1";
import useScreen from "@/primitives/useScreen";

const skills = [
  "SaaS",
  "Figma",
  "Software Design",
  "Sketch",
  "Prototyping",
  "HTML5",
  "Design",
  "Writing",
];

export default function ProjectDetail1() {
  const isMatchedScreen = useScreen(1216);

  return (
    <section className="pt-[30px]">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main */}
          <div className="lg:col-span-8">
            <div className="column">
              <div className="scrollbalance-inner">
                {/* top info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[30px]">
                  {[
                    { icon: "flaticon-notification-1", title: "Seller Type", text: "Company" },
                    { icon: "flaticon-dollar", title: "Project type", text: "Hourly" },
                    { icon: "flaticon-fifteen", title: "Project Duration", text: "10-15 Hours" },
                    { icon: "flaticon-like-1", title: "Project Level", text: "Expensive" },
                    { icon: "flaticon-translator", title: "Languages", text: "20" },
                    { icon: "flaticon-goal", title: "English Level", text: "Professional" },
                  ].map((it, idx) => (
                    <div key={idx} className="iconbox-style1 contact-style flex items-start">
                      <div className="icon shrink-0">
                        <span className={it.icon} />
                      </div>
                      <div className="details ml-3">
                        <h5 className="title">{it.title}</h5>
                        <p className="text m-0">{it.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* about */}
                <div className="service-about">
                  <h4>Description</h4>
                  <p className="text mb-[30px]">
                    It is a long established fact that a reader will be
                    distracted by the readable content of a page when
                    looking at its layout. The point of using Lorem Ipsum is
                    that it has a more-or-less normal distribution of
                    letters, as opposed to using 'Content here, content
                    here', making it look like readable English.
                  </p>
                  <p className="text mb-[30px]">
                    Many desktop publishing packages and web page editors
                    now use Lorem Ipsum as their default model text, and a
                    search for 'lorem ipsum' will uncover many web sites
                    still in their infancy. Various versions have evolved
                    over the years, sometimes by accident, sometimes on
                    purpose (injected humour and the like).
                  </p>

                  <hr className="opacity-100 my-[60px]" />

                  {/* attachments */}
                  <h4 className="mb-[30px]">Attachments</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2].map((k) => (
                      <div key={k} className="project-attach">
                        <h6 className="title">Project Brief</h6>
                        <p>PDF</p>
                        <span className="icon flaticon-page" />
                      </div>
                    ))}
                  </div>

                  <hr className="opacity-100 mt-[30px] mb-[60px]" />

                  {/* skills */}
                  <h4 className="mb-[30px]">Skills Required</h4>
                  <div className="mb-[60px] flex flex-wrap gap-[10px]">
                    {skills.map((item, i) => (
                      <a key={i} className="tag inline-block">{item}</a>
                    ))}
                  </div>

                  <hr className="opacity-100 mb-[60px]" />

                  {/* proposals */}
                  <h4 className="mb-[30px]">Project Proposals (3)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {projectProposal1.slice(0, 3).map((item, i) => (
                      <ProjectProposalCard1 key={i} data={item} />
                    ))}
                  </div>

                  {/* send proposal */}
                  <div className="bsp_reveiw_wrt mt-[25px]">
                    <h4>Send Your Proposal</h4>
                    <form className="comments_form mt-[30px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="fw500 ff-heading dark-color mb-2 block">
                            Your hourly price
                          </label>
                          <input
                            type="text"
                            placeholder="$99"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="fw500 ff-heading dark-color mb-2 block">
                            Estimated Hours
                          </label>
                          <input
                            type="text"
                            placeholder="4"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="fw500 fz16 ff-heading dark-color mb-2 block">
                            Cover Letter
                          </label>
                          <textarea
                            rows={6}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <ServiceDetailExtra1 />
                        </div>
                        <div className="md:col-span-2">
                          <div className="grid">
                            <a className="ud-btn btn-thm">
                              Submit a Proposal
                              <i className="fal fa-arrow-right-long" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  {/* /send proposal */}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="column">
              <div className={`scrollbalance-inner ${isMatchedScreen ? "lg:sticky lg:top-24" : ""}`}>
                <div className="blog-sidebar lg:ml-auto">
                  <ProjectPriceWidget1 />
                  <ProjectContactWidget1 />
                </div>
              </div>
            </div>
          </div>
          {/* /Sidebar */}
        </div>
      </div>
    </section>
  );
}
