import Undo from "../button/Undo";
import BudgetOption2 from "../option/BudgetOption2";
import CategoryOption1 from "../option/Classification";
import DesignToolOption1 from "../option/DesignToolOption1";
import EnglishLevelOption1 from "../option/EnglishLevelOption1";
import LocationOption1 from "../option/LocationOption1";
import ProjectTypeOption1 from "../option/ProjectTypeOption1";
import SpeakOption1 from "../option/SpeakOption1";

export default function ListingSidebar2() {
  return (
    <>
      <div className="list-sidebar-style1 hidden lg:block">
        {/* sections with Upwork-style spacing & dividers */}
        <div className="divide-y divide-slate-200">
          {/* Categories */}
          <section className="py-6 first:pt-0">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Categories</h4>
            <div className="space-y-3">
              <CategoryOption1 />
              <button className="inline-flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
                </svg>
                Show More
              </button>
            </div>
          </section>

          {/* Project type */}
          <section className="py-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Project type</h4>
            <div className="space-y-3">
              <ProjectTypeOption1 />
            </div>
          </section>

          {/* Price */}
          <section className="py-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Price</h4>
            <div className="pt-2">
              <BudgetOption2 />
            </div>
          </section>

          {/* Skills */}
          <section className="py-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Skills</h4>
            <div className="space-y-3">
              <DesignToolOption1 />
            </div>
          </section>

          {/* Location */}
          <section className="py-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Location</h4>
            <div className="space-y-3">
              <LocationOption1 />
            </div>
          </section>

          {/* Language */}
          <section className="py-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Language</h4>
            <div className="space-y-3">
              <SpeakOption1 />
            </div>
          </section>

          {/* English Level */}
          <section className="py-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">English Level</h4>
            <div className="space-y-3">
              <EnglishLevelOption1 />
            </div>
          </section>
        </div>

        <div className="mt-6">
          <Undo />
        </div>
      </div>
    </>
  );
}
