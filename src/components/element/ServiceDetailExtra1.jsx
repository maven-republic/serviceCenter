"use client";
import { useState } from "react";

const extraService = [
  {
    id: 1,
    title: "100 Words (+2 days)",
    brief: "I will professionally translate english to german",
    price: 25,
    value: "silver",
  },
  {
    id: 2,
    title: "100 Words (+2 days)",
    brief: "I will professionally translate english to german",
    price: 45,
    value: "gold",
  },
  {
    id: 3,
    title: "100 Words (+2 days)",
    brief: "I will professionally translate english to german",
    price: 75,
    value: "platinum",
  },
];

export default function ServiceDetailExtra1() {
  const [getSelect, setSelect] = useState([]);

  const serviceSelectHandler = (value) => {
    setSelect((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="mt-8 mb-10">
      <nav>
        <div className="flex flex-col gap-3">
          {extraService.map((item) => {
            const checked = getSelect.includes(item.value);
            const id = `extra-${item.id}`;

            return (
              <label
                key={item.id}
                htmlFor={id}
                className={`flex items-start justify-between gap-4 rounded-xl border p-4 cursor-pointer transition
                  ${checked ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* hidden native checkbox + custom box */}
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => serviceSelectHandler(item.value)}
                    className="peer sr-only"
                  />
                  <span
                    className="
                      mt-1 grid h-4 w-4 place-content-center rounded-[4px] border border-slate-300
                      peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-200
                      peer-checked:border-emerald-500 peer-checked:bg-emerald-500
                      after:block after:h-2 after:w-1.5 after:rotate-45
                      after:border-b-2 after:border-r-2 after:border-white
                      after:opacity-0 peer-checked:after:opacity-100
                    "
                  />
                  <div>
                    <div className={`font-medium ${checked ? "text-emerald-700" : "text-slate-900"}`}>
                      {item.title}
                    </div>
                    <div className="text-sm text-slate-500">{item.brief}</div>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium
                    ${checked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}
                  `}
                >
                  ${item.price}
                </span>
              </label>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
