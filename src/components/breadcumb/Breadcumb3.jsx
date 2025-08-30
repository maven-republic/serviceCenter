export default function Breadcumb3({ path }) {
  return (
    <>
      <section className="breadcumb-section">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex flex-wrap">
            <div className="w-full">
              <div className="breadcumb-style1">
                <div className="breadcumb-list flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  {path?.map((item, i) => (
                    <a
                      key={i}
                      className="hover:text-slate-800 cursor-pointer transition"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
