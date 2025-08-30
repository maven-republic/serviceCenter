"use client";
import { lan, momney } from "@/data/footer";
import { useState } from "react";

export default function FooterSelect2() {
  const [getMoneySelect, setMoneySelect] = useState("Euro");
  const [getLanSelect, setLanSelect] = useState("English");
  const [openMoney, setOpenMoney] = useState(false);
  const [openLan, setOpenLan] = useState(false);

  return (
    <>
      <ul className="m-0 p-0 list-none flex flex-wrap items-center justify-center lg:justify-end gap-3">
        {/* Currency */}
        <li>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenMoney((v) => !v);
                setOpenLan(false);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition"
            >
              <span>{getMoneySelect}</span>
              <svg
                className={`h-4 w-4 transition-transform ${openMoney ? "rotate-180" : ""}`}
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {openMoney && (
              <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg bg-white text-slate-900 shadow-lg ring-1 ring-black/5">
                <ul className="py-1 max-h-60 overflow-auto">
                  {momney.map((item, index) => {
                    const selected = getMoneySelect === item;
                    return (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => {
                            setMoneySelect(item);
                            setOpenMoney(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-100 ${
                            selected ? "font-medium" : ""
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            {selected && <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                            {item}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </li>

        {/* Language */}
        <li>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenLan((v) => !v);
                setOpenMoney(false);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition"
            >
              <span>{getLanSelect}</span>
              <svg
                className={`h-4 w-4 transition-transform ${openLan ? "rotate-180" : ""}`}
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {openLan && (
              <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg bg-white text-slate-900 shadow-lg ring-1 ring-black/5">
                <ul className="py-1 max-h-60 overflow-auto">
                  {lan.map((item, index) => {
                    const selected = getLanSelect === item;
                    return (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => {
                            setLanSelect(item);
                            setOpenLan(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-100 ${
                            selected ? "font-medium" : ""
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            {selected && <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                            {item}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </li>
      </ul>
    </>
  );
}
