"use client";
import { projectType } from "@/data/listing";
import listingStore from "@/store/listingStore";

export default function ProjectTypeOption1() {
  const getProjectType = listingStore((s) => s.getProjectType);
  const setProjectType = listingStore((s) => s.setProjectType);

  const toggle = (val) => setProjectType(val);

  return (
    <>
      {projectType.map((item, i) => {
        const id = `project-type-${i}`;
        const checked = Array.isArray(getProjectType)
          ? getProjectType.includes(item.title)
          : false;

        return (
          <div key={id} className="mb-5">
            <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
              {/* hidden native checkbox */}
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item.title)}
                className="peer sr-only"
              />
              {/* custom square box */}
              <span
                className={`
                  grid place-content-center h-[18px] w-[18px] rounded-[4px]
                  border-[1.5px] border-slate-400
                  peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-200
                  peer-checked:bg-emerald-500 peer-checked:border-emerald-500
                  transition-colors
                  after:content-[''] after:h-2.5 after:w-1.5 after:rotate-45
                  after:border-b-[2px] after:border-r-[2px] after:border-white
                  after:block after:opacity-0 peer-checked:after:opacity-100
                `}
              />
              <span className="text-slate-800">{item.title}</span>
              <span className="ml-auto text-slate-400">({item.total})</span>
            </label>
          </div>
        );
      })}
    </>
  );
}
