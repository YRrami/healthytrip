import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";

/* =====================================================================================
   Destinations — v1.0
   • Filters: search, region, visa type, price tier, specialties (multi), sort, pagination
   • URL sync: q, region, visa, price, specs, sort, page, ps
   • Animated gradient background, RTL-aware, accessible controls
===================================================================================== */

type Lang = "en" | "ar";
const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    title: "Destinations",
    lead: "Explore top cities for medical care and recovery getaways.",
    filters: "Filters",
    searchPlaceholder: "Search city or country…",
    region: "Region",
    all: "All",
    visa: "Visa",
    visa_free: "Visa-free",
    visa_on: "Visa on arrival",
    visa_e: "E‑Visa",
    visa_req: "Visa required",
    price: "Price tier",
    specialties: "Specialties",
    sort: "Sort by",
    sortPopular: "Popularity",
    sortPrice: "Price (low → high)",
    sortFlight: "Flight time (short → long)",
    perPage: "/page",
    results: "results",
    showing: "Showing",
    of: "of",
    clear: "Reset",
    bestFor: "Best for",
    hospitals: "Hospitals",
    months: "Best months",
    details: "View hospitals →",
    contact: "Plan my trip",
  },
  ar: {
    title: "الوجهات",
    lead: "اكتشف أفضل المدن للعلاج وفترات التعافي.",
    filters: "عوامل التصفية",
    searchPlaceholder: "ابحث عن مدينة أو دولة…",
    region: "المنطقة",
    all: "الكل",
    visa: "التأشيرة",
    visa_free: "دون تأشيرة",
    visa_on: "تأشيرة عند الوصول",
    visa_e: "تأشيرة إلكترونية",
    visa_req: "تأشيرة مسبقة",
    price: "فئة السعر",
    specialties: "التخصصات",
    sort: "الترتيب",
    sortPopular: "الأكثر شعبية",
    sortPrice: "السعر (من الأقل)",
    sortFlight: "مدة الطيران (من الأقصر)",
    perPage: "/صفحة",
    results: "نتيجة",
    showing: "عرض",
    of: "من",
    clear: "إعادة تعيين",
    bestFor: "الأفضل لـ",
    hospitals: "مستشفى",
    months: "أفضل الشهور",
    details: "عرض المستشفيات ←",
    contact: "اخطط لرحلتي",
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

/* =============================== Data =============================== */
export interface DestinationItem {
  id: number;
  city: string;
  country: string;
  region: "Middle East" | "Europe" | "Asia" | "Africa";
  priceTier: 1 | 2 | 3; // $/$$/$$$
  specialties: string[]; // EN labels
  visa: "Visa-free" | "Visa on arrival" | "E-Visa" | "Visa required";
  flightHours: number; // approx from Cairo (placeholder)
  hospitalsCount: number;
  bestMonths: string;
  popularity: number; // 0..100
  image?: string;
}

const SPECIALTIES = [
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Neurology",
  "Oncology",
  "Pediatrics",
  "ENT",
  "Ophthalmology",
] as const;

const REGIONS = ["Middle East", "Europe", "Asia", "Africa"] as const;

const DATA: DestinationItem[] = [
  { id: 1, city: "Cairo", country: "Egypt", region: "Africa", priceTier: 1, specialties: ["Cardiology", "Oncology", "Orthopedics"], visa: "Visa required", flightHours: 0.5, hospitalsCount: 45, bestMonths: "Oct–Apr", popularity: 92, image: "/images/destinations/cairo.jpg" },
  { id: 2, city: "Dubai", country: "UAE", region: "Middle East", priceTier: 3, specialties: ["Dermatology", "Orthopedics", "Ophthalmology"], visa: "Visa on arrival", flightHours: 3.5, hospitalsCount: 60, bestMonths: "Nov–Mar", popularity: 95, image: "/images/destinations/dubai.jpg" },
  { id: 3, city: "Istanbul", country: "Turkey", region: "Europe", priceTier: 2, specialties: ["ENT", "Orthopedics", "Dermatology"], visa: "E-Visa", flightHours: 2.0, hospitalsCount: 58, bestMonths: "Apr–Jun, Sep–Oct", popularity: 91, image: "/images/destinations/istanbul.jpg" },
  { id: 4, city: "Bangkok", country: "Thailand", region: "Asia", priceTier: 2, specialties: ["Cardiology", "Orthopedics", "Ophthalmology"], visa: "Visa on arrival", flightHours: 9.0, hospitalsCount: 70, bestMonths: "Nov–Feb", popularity: 93, image: "/images/destinations/bangkok.jpg" },
  { id: 5, city: "Singapore", country: "Singapore", region: "Asia", priceTier: 3, specialties: ["Oncology", "Cardiology", "Neurology"], visa: "Visa required", flightHours: 10.0, hospitalsCount: 35, bestMonths: "All year", popularity: 89, image: "/images/destinations/singapore.jpg" },
  { id: 6, city: "Alexandria", country: "Egypt", region: "Africa", priceTier: 1, specialties: ["Orthopedics", "Dermatology"], visa: "Visa required", flightHours: 1.0, hospitalsCount: 22, bestMonths: "May–Oct", popularity: 75, image: "/images/destinations/alexandria.jpg" },
];

/* =============================== UI helpers =============================== */
const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={`px-3 h-9 rounded-full border text-sm transition ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50"}`}>{children}</button>
);
const Badge: React.FC<{ children: React.ReactNode; tone?: "blue" | "emerald" | "gray" }> = ({ children, tone = "blue" }) => (
  <span className={{
    blue: "px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100",
    emerald: "px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100",
    gray: "px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200",
  }[tone]}>{children}</span>
);
const PriceTag: React.FC<{ tier: 1 | 2 | 3 }> = ({ tier }) => (
  <span className="font-mono tracking-tight" aria-label={`Price tier ${tier}`}>{"$".repeat(tier)}</span>
);

/* =============================== Page =============================== */
export default function Destination() {
  const t = useT();
  const prefersReduced = useReducedMotion();
  const [params, setParams] = useSearchParams();

  // state ← URL
  const [q, setQ] = useState<string>(params.get("q") ?? "");
  const qSlow = useDeferredValue(q);
  const [region, setRegion] = useState<string>(params.get("region") ?? "");
  const [visa, setVisa] = useState<string>(params.get("visa") ?? ""); // Visa-free | Visa on arrival | E-Visa | Visa required
  const [price, setPrice] = useState<string>(params.get("price") ?? ""); // 1|2|3
  const [sort, setSort] = useState<string>(params.get("sort") ?? "popular"); // popular|price|flight
  const [page, setPage] = useState<number>(() => {
    const p = parseInt(params.get("page") || "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const ps = parseInt(params.get("ps") || "9", 10);
    return [6, 9, 12].includes(ps) ? ps : 9;
  });
  const [specs, setSpecs] = useState<string[]>(() => (params.get("specs") || "").split(",").filter(Boolean));

  // URL sync
  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (region) next.set("region", region);
    if (visa) next.set("visa", visa);
    if (price) next.set("price", price);
    if (sort && sort !== "popular") next.set("sort", sort);
    if (page > 1) next.set("page", String(page));
    if (pageSize !== 9) next.set("ps", String(pageSize));
    if (specs.length) next.set("specs", specs.join(","));
    setParams(next, { replace: true });
  }, [q, region, visa, price, sort, page, pageSize, specs, setParams]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [qSlow, region, visa, price, sort, specs.join("|")]);

  const toggleSpec = (s: string) => setSpecs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const clearAll = () => {
    setQ(""); setRegion(""); setVisa(""); setPrice(""); setSort("popular"); setPage(1); setPageSize(9); setSpecs([]);
  };

  // Filtering + sorting
  const filtered = useMemo(() => {
    const needle = qSlow.trim().toLowerCase();
    const priceTier = price ? parseInt(price, 10) : 0;
    const matchesText = (d: DestinationItem) => !needle || d.city.toLowerCase().includes(needle) || d.country.toLowerCase().includes(needle);
    const matchesRegion = (d: DestinationItem) => !region || d.region.toLowerCase() === region.toLowerCase();
    const matchesVisa = (d: DestinationItem) => !visa || d.visa.toLowerCase() === visa.toLowerCase();
    const matchesPrice = (d: DestinationItem) => !priceTier || d.priceTier === priceTier;
    const matchesSpecs = (d: DestinationItem) => !specs.length || specs.some((s) => d.specialties.map((x) => x.toLowerCase()).includes(s.toLowerCase()));

    let arr = DATA.filter((d) => matchesText(d) && matchesRegion(d) && matchesVisa(d) && matchesPrice(d) && matchesSpecs(d));

    if (sort === "price") arr = arr.sort((a, b) => a.priceTier - b.priceTier || b.popularity - a.popularity);
    else if (sort === "flight") arr = arr.sort((a, b) => a.flightHours - b.flightHours || b.popularity - a.popularity);
    else arr = arr.sort((a, b) => b.popularity - a.popularity);

    return arr;
  }, [qSlow, region, visa, price, specs, sort]);

  // Pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const from = (current - 1) * pageSize;
  const to = Math.min(from + pageSize, total);
  const pageItems = filtered.slice(from, to);

  return (
    <main className="relative bg-white">
      {/* Animated background */}
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
          <motion.h1 initial={prefersReduced ? false : { opacity: 0, y: 10 }} animate={prefersReduced ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 text-center">{t("title")}</motion.h1>
          <motion.p initial={prefersReduced ? false : { opacity: 0, y: 10 }} animate={prefersReduced ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.04 }} className="mt-3 md:mt-5 text-gray-600 max-w-3xl mx-auto text-center">{t("lead")}</motion.p>

          {/* Quick chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 justify-center">
            {(["Cardiology","Orthopedics","Dermatology","Ophthalmology"] as const).map((s) => (
              <Chip key={s} active={specs.includes(s.toLowerCase())} onClick={() => setSpecs((prev) => prev.includes(s.toLowerCase()) ? prev.filter((x) => x !== s.toLowerCase()) : [...prev, s.toLowerCase()])}>{s}</Chip>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-6 md:mt-8 bg-white/90 backdrop-blur border border-blue-100 rounded-2xl shadow p-4 md:p-5">
            <div className="flex flex-col xl:flex-row xl:items-end gap-3 xl:gap-4">
              <div className="flex-1">
                <label htmlFor="q" className="block text-sm text-gray-700">{t("filters")}</label>
                <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 flex-1">
                <div>
                  <label htmlFor="region" className="block text-sm text-gray-700">{t("region")}</label>
                  <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50">
                    <option value="">{t("all")}</option>
                    {REGIONS.map((r) => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="visa" className="block text-sm text-gray-700">{t("visa")}</label>
                  <select id="visa" value={visa} onChange={(e) => setVisa(e.target.value)} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50">
                    <option value="">{t("all")}</option>
                    <option value="visa-free">{t("visa_free")}</option>
                    <option value="visa on arrival">{t("visa_on")}</option>
                    <option value="e-visa">{t("visa_e")}</option>
                    <option value="visa required">{t("visa_req")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm text-gray-700">{t("price")}</label>
                  <select id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50">
                    <option value="">{t("all")}</option>
                    <option value="1">$</option>
                    <option value="2">$$</option>
                    <option value="3">$$$</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700">{t("specialties")}</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {SPECIALTIES.map((s) => (
                      <Chip key={s} active={specs.includes(s.toLowerCase())} onClick={() => toggleSpec(s.toLowerCase())}>{s}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="sort" className="block text-sm text-gray-700">{t("sort")}</label>
                  <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50">
                    <option value="popular">{t("sortPopular")}</option>
                    <option value="price">{t("sortPrice")}</option>
                    <option value="flight">{t("sortFlight")}</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-500 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700">{total}</span> {t("results")} {total > 0 && <span className="ml-2 text-gray-400">• {t("showing")} {from + 1}–{to} {t("of")} {total}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="ps" className="text-gray-700">{t("perPage")}</label>
                  <select id="ps" value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))} className="h-9 px-2 border border-gray-200 rounded-lg bg-gray-50">
                    {[6,9,12].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button onClick={clearAll} className="h-9 px-4 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">{t("clear")}</button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {pageItems.length === 0 ? (
            <div className="mt-10 text-center">
              <div className="text-5xl mb-3">🗺️</div>
              <p className="text-gray-600">No destinations match your filters.</p>
              <button onClick={clearAll} className="mt-4 h-11 px-5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">{t("clear")}</button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {pageItems.map((d, i) => (
                  <motion.article key={d.id} initial={prefersReduced ? false : { opacity: 0, y: 12, scale: 0.98 }} whileInView={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.45, delay: i * 0.04 }} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all">
                    <div className="h-40 w-full bg-gray-100 overflow-hidden">
                      {d.image ? (
                        <img src={d.image} alt={`${d.city}, ${d.country}`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full grid place-items-center">🗺️</div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{d.city}, {d.country}</h3>
                        <PriceTag tier={d.priceTier} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone="emerald">{d.hospitalsCount} {t("hospitals")}</Badge>
                        <Badge tone="gray">✈️ {d.flightHours}h</Badge>
                        <Badge tone="blue">🛂 {d.visa}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600"><span className="font-medium text-gray-700">{t("bestFor")}:</span> {d.specialties.slice(0,3).join(", ")}</p>
                      <p className="mt-1 text-xs text-gray-500">📅 {t("months")}: {d.bestMonths}</p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link to={`/hospitals-and-centers?city=${encodeURIComponent(d.city.toLowerCase())}`} className="h-10 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm grid place-items-center">{t("details")}</Link>
                        <Link to={`/contact-us?destination=${encodeURIComponent(d.city)}`} className="h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm grid place-items-center">{t("contact")}</Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button className="h-10 px-3 rounded-lg border border-blue-200 text-blue-700 disabled:opacity-40" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1}>Prev</button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button key={i} className={`h-10 w-10 rounded-lg border ${current === i + 1 ? "bg-blue-600 text-white border-blue-600" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="h-10 px-3 rounded-lg border border-blue-200 text-blue-700 disabled:opacity-40" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={current === pages}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
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
