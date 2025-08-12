import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";

/* =====================================================================
   Doctors Page — v2 (better UX):
   - Debounced search, quick chips, slider for min rating
   - Sorting + pagination + page size
   - URL-synced filters (q, spec, city, min, sort, page, ps)
   - RTL aware, animated background, accessible labels
   - No external deps beyond framer-motion + react-router-dom
====================================================================== */

/* =============================== i18n =============================== */
type Lang = "en" | "ar";
const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    heading: "Doctors",
    lead: "Meet highly rated specialists trusted by thousands of patients.",
    filters: "Filters",
    searchPlaceholder: "Search name or hospital…",
    quick: "Popular",
    spec: "Specialty",
    city: "City",
    rating: "Min rating",
    sort: "Sort by",
    clear: "Reset",
    results: "results",
    noResults: "No doctors match your filters.",
    viewProfile: "View profile →",
    book: "Book appointment",
    sortRating: "Rating (high → low)",
    sortName: "Name (A → Z)",
    all: "All",
    showing: "Showing",
    of: "of",
    perPage: "/page",
    prev: "Prev",
    next: "Next",
  },
  ar: {
    heading: "الأطباء",
    lead: "تعرّف على متخصصين موثوقين من آلاف المرضى.",
    filters: "عوامل التصفية",
    searchPlaceholder: "ابحث بالاسم أو المستشفى…",
    quick: "الأشهر",
    spec: "التخصص",
    city: "المدينة",
    rating: "الحد الأدنى للتقييم",
    sort: "الترتيب",
    clear: "إعادة تعيين",
    results: "نتيجة",
    noResults: "لا توجد نتائج مطابقة للفلاتر.",
    viewProfile: "عرض الملف ←",
    book: "احجز موعدًا",
    sortRating: "التقييم (من الأعلى)",
    sortName: "الاسم (أ → ي)",
    all: "الكل",
    showing: "عرض",
    of: "من",
    perPage: "/صفحة",
    prev: "السابق",
    next: "التالي",
  },
};

function useDocLang(): Lang {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => setLang((root.lang as Lang) === "ar" ? "ar" : "en");
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(root, { attributes: true, attributeFilter: ["lang"] });
    return () => mo.disconnect();
  }, []);
  return lang;
}
function useT() {
  const lang = useDocLang();
  return (k: keyof typeof STRINGS["en"]) => STRINGS[lang][k] ?? (k as string);
}

/* =============================== data =============================== */
export interface Doctor {
  id: number;
  name: string;
  specialty: string; // EN label for simplicity
  hospital: string;
  city: string; // EN label
  rating: number; // 0..5
  avatar?: string;
}

const SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "Oncology",
  "Pediatrics",
  "ENT",
  "Ophthalmology",
] as const;

const CITIES = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Dubai",
  "Istanbul",
  "Bangkok",
  "Singapore",
] as const;

const DOCTORS: Doctor[] = [
  { id: 1, name: "Dr. Sara El‑Shazly", specialty: "Cardiology", hospital: "Cairo Heart Center", city: "Cairo", rating: 4.9, avatar: "/avatars/doc1.png" },
  { id: 2, name: "Dr. Ahmed Farouk", specialty: "Orthopedics", hospital: "Alex Ortho Clinic", city: "Alexandria", rating: 4.8, avatar: "/avatars/doc2.png" },
  { id: 3, name: "Dr. Laila Hassan", specialty: "Dermatology", hospital: "SkinCare Pro", city: "Giza", rating: 4.7, avatar: "/avatars/doc3.png" },
  { id: 4, name: "Dr. Omar Nabil", specialty: "Neurology", hospital: "NeuroHub", city: "Cairo", rating: 4.9, avatar: "/avatars/doc4.png" },
  { id: 5, name: "Dr. Mariam Adel", specialty: "Pediatrics", hospital: "Kids Care Hospital", city: "Cairo", rating: 4.8, avatar: "/avatars/doc5.png" },
  { id: 6, name: "Dr. Karim Mostafa", specialty: "Ophthalmology", hospital: "VisionOne", city: "Cairo", rating: 4.7, avatar: "/avatars/doc6.png" },
  { id: 7, name: "Dr. Nour El‑Din", specialty: "Oncology", hospital: "Hope Cancer Center", city: "Dubai", rating: 4.6, avatar: "/avatars/doc7.png" },
  { id: 8, name: "Prof. Hisham Talaat", specialty: "Cardiology", hospital: "Nile Vascular Institute", city: "Cairo", rating: 4.95, avatar: "/avatars/doc8.png" },
  { id: 9, name: "Dr. Rania Gabr", specialty: "ENT", hospital: "Sinus & Voice Clinic", city: "Istanbul", rating: 4.5, avatar: "/avatars/doc9.png" },
  { id: 10, name: "Dr. Youssef Said", specialty: "Orthopedics", hospital: "Sports Ortho Unit", city: "Giza", rating: 4.65, avatar: "/avatars/doc10.png" },
  { id: 11, name: "Dr. Hala Morsi", specialty: "Dermatology", hospital: "DermaCare Studio", city: "Dubai", rating: 4.4, avatar: "/avatars/doc11.png" },
  { id: 12, name: "Dr. Omar Kamel", specialty: "Neurology", hospital: "NeuroHub", city: "Cairo", rating: 4.55, avatar: "/avatars/doc12.png" },
];

/* =============================== UI helpers =============================== */
const Stars: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < full ? "text-yellow-400" : i === full && half ? "text-yellow-300" : "text-gray-300"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.176 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 h-9 rounded-full border text-sm transition ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50"}`}
  >
    {children}
  </button>
);

/* =============================== page =============================== */
export default function Doctors() {
  const t = useT();
  const prefersReduced = useReducedMotion();
  const [params, setParams] = useSearchParams();

  // state from URL (with fallbacks)
  const [q, setQ] = useState<string>(params.get("q") ?? "");
  const qSlow = useDeferredValue(q);
  const [spec, setSpec] = useState<string>(params.get("spec") ?? "");
  const [city, setCity] = useState<string>(params.get("city") ?? "");
  const [min, setMin] = useState<number>(() => {
    const n = parseFloat(params.get("min") || "0");
    return isFinite(n) ? n : 0;
  });
  const [sort, setSort] = useState<string>(params.get("sort") ?? "rating"); // rating | name
  const [page, setPage] = useState<number>(() => {
    const p = parseInt(params.get("page") || "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const ps = parseInt(params.get("ps") || "9", 10);
    return [6, 9, 12].includes(ps) ? ps : 9;
  });

  // keep URL in sync
  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (spec) next.set("spec", spec);
    if (city) next.set("city", city);
    if (min > 0) next.set("min", String(min));
    if (sort && sort !== "rating") next.set("sort", sort);
    if (page > 1) next.set("page", String(page));
    if (pageSize !== 9) next.set("ps", String(pageSize));
    setParams(next, { replace: true });
  }, [q, spec, city, min, sort, page, pageSize, setParams]);

  // When filters change, go back to page 1
  useEffect(() => {
    setPage(1);
  }, [qSlow, spec, city, min, sort]);

  const filtered = useMemo(() => {
    const needle = qSlow.trim().toLowerCase();
    const byText = (d: Doctor) =>
      !needle ||
      d.name.toLowerCase().includes(needle) ||
      d.hospital.toLowerCase().includes(needle) ||
      d.specialty.toLowerCase().includes(needle) ||
      d.city.toLowerCase().includes(needle);

    const bySpec = (d: Doctor) => !spec || d.specialty.toLowerCase() === spec.toLowerCase();
    const byCity = (d: Doctor) => !city || d.city.toLowerCase() === city.toLowerCase();
    const byRating = (d: Doctor) => d.rating >= min;

    let arr = DOCTORS.filter((d) => byText(d) && bySpec(d) && byCity(d) && byRating(d));

    if (sort === "name") arr = arr.sort((a, b) => a.name.localeCompare(b.name));
    else arr = arr.sort((a, b) => b.rating - a.rating);

    return arr;
  }, [qSlow, spec, city, min, sort]);

  // pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(Math.max(1, page), pages);
  const from = (clampedPage - 1) * pageSize;
  const to = Math.min(from + pageSize, total);
  const pageItems = filtered.slice(from, to);

  const clearAll = () => {
    setQ("");
    setSpec("");
    setCity("");
    setMin(0);
    setSort("rating");
    setPage(1);
    setPageSize(9);
  };

  return (
    <main className="relative bg-white">
      {/* Animated backdrop */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10" aria-hidden>
          <div className="mesh m-[-20%] w-[140%] h-[140%]" />
          <style>{`
            .mesh{
              background:
                radial-gradient(40% 35% at 20% 20%, rgba(59,130,246,0.16), transparent 60%),
                radial-gradient(35% 35% at 80% 30%, rgba(14,165,233,0.14), transparent 65%),
                radial-gradient(45% 45% at 40% 80%, rgba(99,102,241,0.12), transparent 60%),
                linear-gradient(180deg, #ffffff 0%, #f6fbff 100%);
              filter: blur(10px);
              ${useReducedMotion() ? "" : "animation: meshMove 26s ease-in-out infinite alternate;"}
            }
            @keyframes meshMove{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-1.5%,-1%,0) scale(1.02)}100%{transform:translate3d(1%,0.6%,0) scale(1.01)}}
          `}</style>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 text-center"
          >
            {t("heading")}
          </motion.h1>
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 }}
            className="mt-3 md:mt-5 text-gray-600 max-w-3xl mx-auto text-center"
          >
            {t("lead")}
          </motion.p>

          {/* Quick chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 justify-center">
            <span className="text-xs uppercase tracking-wide text-gray-500">{t("quick")}</span>
            {(["Cardiology","Orthopedics","Dermatology","Neurology"] as const).map((s) => (
              <Chip key={s} active={spec === s.toLowerCase()} onClick={() => setSpec(spec === s.toLowerCase() ? "" : s.toLowerCase())}>{s}</Chip>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-6 md:mt-8 bg-white/90 backdrop-blur border border-blue-100 rounded-2xl shadow p-4 md:p-5">
            <div className="flex flex-col xl:flex-row xl:items-end gap-3 xl:gap-4">
              <div className="flex-1">
                <label htmlFor="q" className="block text-sm text-gray-700">{t("filters")}</label>
                <input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
                <div>
                  <label htmlFor="spec" className="block text-sm text-gray-700">{t("spec")}</label>
                  <select
                    id="spec"
                    value={spec}
                    onChange={(e) => setSpec(e.target.value)}
                    className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50"
                  >
                    <option value="">{t("all")}</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s.toLowerCase()}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm text-gray-700">{t("city")}</label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50"
                  >
                    <option value="">{t("all")}</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c.toLowerCase()}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="min" className="block text-sm text-gray-700">{t("rating")}: <span className="font-medium">{min.toFixed(1)}</span></label>
                  <input
                    id="min"
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={min}
                    onChange={(e) => setMin(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label htmlFor="sort" className="block text-sm text-gray-700">{t("sort")}</label>
                  <select
                    id="sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50"
                  >
                    <option value="rating">{t("sortRating")}</option>
                    <option value="name">{t("sortName")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ps" className="block text-sm text-gray-700">{t("perPage")}</label>
                  <select
                    id="ps"
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                    className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50"
                  >
                    {[6,9,12].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button onClick={clearAll} className="h-11 px-4 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 whitespace-nowrap">{t("clear")}</button>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{total}</span> {t("results")}
              {total > 0 && (
                <span className="ml-2 text-gray-400">• {t("showing")} {from + 1}–{to} {t("of")} {total}</span>
              )}
            </div>
          </div>

          {/* Results */}
          {pageItems.length === 0 ? (
            <div className="mt-10 text-center">
              <div className="text-5xl mb-3">🩺</div>
              <p className="text-gray-600">{t("noResults")}</p>
              <button onClick={clearAll} className="mt-4 h-11 px-5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">{t("clear")}</button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {pageItems.map((d, i) => (
                  <motion.article
                    key={d.id}
                    initial={prefersReduced ? false : { opacity: 0, y: 12, scale: 0.98 }}
                    whileInView={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: i * 0.04 }}
                    className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden"
                  >
                    <div className="absolute -z-10 inset-0 opacity-10">
                      <svg viewBox="0 0 1200 200" className="w-full h-full">
                        <defs>
                          <linearGradient id={`g-${d.id}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#93c5fd" />
                            <stop offset="100%" stopColor="#67e8f9" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="0" width="1200" height="200" fill={`url(#g-${d.id})`} />
                      </svg>
                    </div>

                    <div className="flex items-center gap-4">
                      <img src={d.avatar || "/avatars/placeholder.png"} alt={d.name} className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-50" loading="lazy" />
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{d.name}</h3>
                        <p className="text-sm text-gray-600">{d.specialty} • {d.hospital}</p>
                        <p className="text-xs text-gray-500">{d.city}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Stars rating={d.rating} />
                      <Link to={`/contact-us?doctor=${encodeURIComponent(d.name)}`} className="text-sm text-blue-700 hover:text-blue-900 font-medium">{t("viewProfile")}</Link>
                    </div>

                    <motion.button whileTap={{ scale: 0.98 }} className="mt-5 w-full h-10 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">{t("book")}</motion.button>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    className="h-10 px-3 rounded-lg border border-blue-200 text-blue-700 disabled:opacity-40"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={clampedPage === 1}
                  >
                    {t("prev")}
                  </button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      className={`h-10 w-10 rounded-lg border ${clampedPage === i + 1 ? "bg-blue-600 text-white border-blue-600" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="h-10 px-3 rounded-lg border border-blue-200 text-blue-700 disabled:opacity-40"
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={clampedPage === pages}
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer (local) */}
      <footer className="bg-white border-t py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} HealthTrip. All rights reserved.</p>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link to="/about-us" className="hover:text-blue-700">About</Link>
            <Link to="/contact-us" className="hover:text-blue-700">Contact</Link>
            <Link to="/doctors" className="hover:text-blue-700">Doctors</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
