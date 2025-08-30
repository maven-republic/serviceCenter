import Undo from "../button/Undo";
import BudgetOption2 from "../option/BudgetOption2";
import CategoryOption1 from "../option/Classification";
import LevelOption1 from "../option/LevelOption1";
import LocationOption1 from "../option/LocationOption1";
import SpeakOption1 from "../option/SpeakOption1";

export default function ListingSidebar5() {
  return (
    <>
      <div className="list-sidebar-style1 hidden lg:block">
        <div className="space-y-5">
          {/* Skills */}
          <div className="mb-[20px] pb-[10px] mt-0">
            <h4 className="mb-3">
              <button
                type="button"
                className="text-left pl-0 pt-0 font-semibold text-slate-900 hover:text-slate-700"
              >
                Skills
              </button>
            </h4>
            <div className="block">
              <CategoryOption1 />
            </div>
          </div>

          {/* Price */}
          <div className="mb-[20px] pb-0">
            <h4 className="mb-3">
              <button
                type="button"
                className="text-left pl-0 font-semibold text-slate-900 hover:text-slate-700"
              >
                Price
              </button>
            </h4>
            <div className="block">
              <div className="px-0 pt-0">
                <div className="range-slider-style1">
                  <BudgetOption2 />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-[20px] pb-[5px]">
            <h4 className="mb-3">
              <button
                type="button"
                className="text-left pl-0 font-semibold text-slate-900 hover:text-slate-700"
              >
                Location
              </button>
            </h4>
            <div className="block">
              <LocationOption1 />
            </div>
          </div>

          {/* Language */}
          <div className="mb-[20px] pb-[5px]">
            <h4 className="mb-3">
              <button
                type="button"
                className="text-left pl-0 font-semibold text-slate-900 hover:text-slate-700"
              >
                Languange
              </button>
            </h4>
            <div className="block">
              <SpeakOption1 />
            </div>
          </div>

          {/* Level */}
          <div className="mb-[20px] pb-[5px]">
            <h4 className="mb-3">
              <button
                type="button"
                className="text-left pl-0 font-semibold text-slate-900 hover:text-slate-700"
              >
                Level
              </button>
            </h4>
            <div className="block">
              <LevelOption1 />
            </div>
          </div>
        </div>

        <Undo />
      </div>
    </>
  );
}
