import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";

/* =====================================================================================
   Hospitals & Centers — v1.0
   • Powerful filtering: search, city, accreditation, specialties (multi), services, price, min rating
   • Sorting + pagination + page size + URL sync (q, city, acc, specs, svc, price, min, sort, page, ps)
   • Animated background, RTL-aware text, accessible labels, responsive layout
   • No external deps beyond framer-motion & react-router-dom
===================================================================================== */

/* =============================== i18n (EN/AR) =============================== */
type Lang = "en" | "ar";
const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    title: "Hospitals & Centers",
    lead: "Browse accredited hospitals and specialty centers across top destinations.",
    filters: "Filters",
    searchPlaceholder: "Search hospital or network…",
    city: "City",
    accreditation: "Accreditation",
    all: "All",
    jci: "JCI",
    iso: "ISO 9001",
    specialties: "Specialties",
    services: "Services",
    svc_interpreter: "Interpreter",
    svc_pickup: "Airport pickup",
    svc_inpatient: "Inpatient",
    svc_outpatient: "Outpatient",
    price: "Price tier",
    rating: "Min rating",
    sort: "Sort by",
    sortRating: "Rating (high → low)",
    sortName: "Name (A → Z)",
    sortPrice: "Price (low → high)",
    perPage: "/page",
    clear: "Reset",
    results: "results",
    showing: "Showing",
    of: "of",
    noResults: "No facilities match your filters.",
    view: "View details →",
    contact: "Contact to book",
  },
  ar: {
    title: "المستشفيات والمراكز",
    lead: "تصفح المستشفيات المعتمدة والمراكز المتخصصة في أبرز الوجهات.",
    filters: "عوامل التصفية",
    searchPlaceholder: "ابحث عن مستشفى أو شبكة…",
    city: "المدينة",
    accreditation: "الاعتماد",
    all: "الكل",
    jci: "JCI",
    iso: "ISO 9001",
    specialties: "التخصصات",
    services: "الخدمات",
    svc_interpreter: "مترجم طبي",
    svc_pickup: "استقبال من المطار",
    svc_inpatient: "إقامة داخلية",
    svc_outpatient: "عيادات خارجية",
    price: "فئة السعر",
    rating: "الحد الأدنى للتقييم",
    sort: "الترتيب",
    sortRating: "التقييم (من الأعلى)",
    sortName: "الاسم (أ → ي)",
    sortPrice: "السعر (من الأقل)",
    perPage: "/صفحة",
    clear: "إعادة تعيين",
    results: "نتيجة",
    showing: "عرض",
    of: "من",
    noResults: "لا توجد منشآت مطابقة للفلاتر.",
    view: "عرض التفاصيل ←",
    contact: "تواصل للحجز",
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
export interface Hospital {
  id: number;
  name: string;
  city: string; // EN label
  rating: number; // 0..5
  accreditations: ("JCI" | "ISO 9001")[];
  specialties: string[]; // EN labels for simplicity
  priceTier: 1 | 2 | 3; // $ / $$ / $$$
  beds: number;
  inpatient: boolean;
  outpatient: boolean;
  airportPickup: boolean;
  interpreter: boolean;
  image?: string;
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

const CITIES = ["Cairo", "Alexandria", "Giza", "Dubai", "Istanbul", "Bangkok", "Singapore"] as const;

const DATA: Hospital[] = [
  { id: 1, name: "Cairo Heart Center", city: "Cairo", rating: 4.8, accreditations: ["JCI"], specialties: ["Cardiology"], priceTier: 2, beds: 120, inpatient: true, outpatient: true, airportPickup: true, interpreter: true, image: "/images/hospitals/cairo-heart.jpg" },
  { id: 2, name: "Alex Ortho Clinic", city: "Alexandria", rating: 4.6, accreditations: ["ISO 9001"], specialties: ["Orthopedics"], priceTier: 1, beds: 60, inpatient: false, outpatient: true, airportPickup: false, interpreter: true, image: "/images/hospitals/alex-ortho.jpg" },
  { id: 3, name: "SkinCare Pro Center", city: "Giza", rating: 4.5, accreditations: [], specialties: ["Dermatology"], priceTier: 1, beds: 30, inpatient: false, outpatient: true, airportPickup: false, interpreter: false, image: "/images/hospitals/skincare-pro.jpg" },
  { id: 4, name: "NeuroHub Institute", city: "Cairo", rating: 4.9, accreditations: ["JCI", "ISO 9001"], specialties: ["Neurology"], priceTier: 3, beds: 180, inpatient: true, outpatient: true, airportPickup: true, interpreter: true, image: "/images/hospitals/neurohub.jpg" },
  { id: 5, name: "Kids Care Hospital", city: "Cairo", rating: 4.7, accreditations: ["ISO 9001"], specialties: ["Pediatrics"], priceTier: 2, beds: 150, inpatient: true, outpatient: true, airportPickup: true, interpreter: true, image: "/images/hospitals/kids-care.jpg" },
  { id: 6, name: "VisionOne Eye Center", city: "Cairo", rating: 4.6, accreditations: [], specialties: ["Ophthalmology"], priceTier: 2, beds: 40, inpatient: false, outpatient: true, airportPickup: false, interpreter: true, image: "/images/hospitals/visionone.jpg" },
  { id: 7, name: "Hope Cancer Center", city: "Dubai", rating: 4.7, accreditations: ["JCI"], specialties: ["Oncology"], priceTier: 3, beds: 200, inpatient: true, outpatient: true, airportPickup: true, interpreter: true, image: "/images/hospitals/hope-cancer.jpg" },
  { id: 8, name: "Sinus & Voice Clinic", city: "Istanbul", rating: 4.4, accreditations: [], specialties: ["ENT"], priceTier: 1, beds: 20, inpatient: false, outpatient: true, airportPickup: false, interpreter: true, image: "/images/hospitals/sinus-voice.jpg" },
  { id: 9, name: "Nile Vascular Institute", city: "Cairo", rating: 4.85, accreditations: ["JCI"], specialties: ["Cardiology"], priceTier: 2, beds: 110, inpatient: true, outpatient: true, airportPickup: true, interpreter: true, image: "/images/hospitals/nile-vascular.jpg" },
  { id: 10, name: "Sports Ortho Unit", city: "Giza", rating: 4.5, accreditations: ["ISO 9001"], specialties: ["Orthopedics"], priceTier: 2, beds: 70, inpatient: true, outpatient: true, airportPickup: false, interpreter: true, image: "/images/hospitals/sports-ortho.jpg" },
  { id: 11, name: "DermaCare Studio", city: "Dubai", rating: 4.3, accreditations: [], specialties: ["Dermatology"], priceTier: 2, beds: 35, inpatient: false, outpatient: true, airportPickup: false, interpreter: true, image: "/images/hospitals/dermacare.jpg" },
  { id: 12, name: "Bangkok Retina Center", city: "Bangkok", rating: 4.6, accreditations: ["ISO 9001"], specialties: ["Ophthalmology"], priceTier: 2, beds: 50, inpatient: false, outpatient: true, airportPickup: true, interpreter: true, image: "/images/hospitals/bkk-retina.jpg" },
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

const Badge: React.FC<{ children: React.ReactNode; tone?: "blue" | "emerald" | "gray" }> = ({ children, tone = "blue" }) => (
  <span className={{
    blue: "px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100",
    emerald: "px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100",
    gray: "px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200",
  }[tone]}>{children}</span>
);

const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={`px-3 h-9 rounded-full border text-sm transition ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50"}`}>{children}</button>
);

const PriceTag: React.FC<{ tier: 1 | 2 | 3 }> = ({ tier }) => (
  <span className="font-mono tracking-tight" aria-label={`Price tier ${tier}`}>{"$".repeat(tier)}</span>
);

/* =============================== Page =============================== */
export default function HospitalsAndCenters() {
  const t = useT();
  const prefersReduced = useReducedMotion();
  const [params, setParams] = useSearchParams();

  // state ← URL
  const [q, setQ] = useState<string>(params.get("q") ?? "");
  const qSlow = useDeferredValue(q);
  const [city, setCity] = useState<string>(params.get("city") ?? "");
  const [acc, setAcc] = useState<string>(params.get("acc") ?? ""); // "" | "JCI" | "ISO 9001"
  const [min, setMin] = useState<number>(() => {
    const n = parseFloat(params.get("min") || "0");
    return isFinite(n) ? n : 0;
  });
  const [price, setPrice] = useState<string>(params.get("price") ?? ""); // "" | "1" | "2" | "3"
  const [sort, setSort] = useState<string>(params.get("sort") ?? "rating"); // rating | name | price
  const [page, setPage] = useState<number>(() => {
    const p = parseInt(params.get("page") || "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const ps = parseInt(params.get("ps") || "9", 10);
    return [6, 9, 12].includes(ps) ? ps : 9;
  });
  const [specs, setSpecs] = useState<string[]>(() => (params.get("specs") || "").split(",").filter(Boolean));
  const [services, setServices] = useState<{ interpreter: boolean; pickup: boolean; inpatient: boolean; outpatient: boolean }>(() => {
    const svc = new Set((params.get("svc") || "").split(",").filter(Boolean));
    return {
      interpreter: svc.has("interpreter"),
      pickup: svc.has("pickup"),
      inpatient: svc.has("inpatient"),
      outpatient: svc.has("outpatient"),
    };
  });

  // Keep URL in sync
  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (city) next.set("city", city);
    if (acc) next.set("acc", acc);
    if (min > 0) next.set("min", String(min));
    if (price) next.set("price", price);
    if (sort && sort !== "rating") next.set("sort", sort);
    if (page > 1) next.set("page", String(page));
    if (pageSize !== 9) next.set("ps", String(pageSize));
    if (specs.length) next.set("specs", specs.join(","));
    const svcs: string[] = [];
    if (services.interpreter) svcs.push("interpreter");
    if (services.pickup) svcs.push("pickup");
    if (services.inpatient) svcs.push("inpatient");
    if (services.outpatient) svcs.push("outpatient");
    if (svcs.length) next.set("svc", svcs.join(","));
    setParams(next, { replace: true });
  }, [q, city, acc, min, price, sort, page, pageSize, specs, services, setParams]);

  // Reset to page 1 when filters change (useDeferred for q)
  useEffect(() => { setPage(1); }, [qSlow, city, acc, min, price, sort, specs.join("|"), services.interpreter, services.pickup, services.inpatient, services.outpatient]);

  // Filter + sort
  const filtered = useMemo(() => {
    const needle = qSlow.trim().toLowerCase();
    const accNeedle = acc.trim();
    const priceTier = price ? parseInt(price, 10) : 0;

    const matchesText = (h: Hospital) =>
      !needle || h.name.toLowerCase().includes(needle) || h.city.toLowerCase().includes(needle);
    const matchesCity = (h: Hospital) => !city || h.city.toLowerCase() === city.toLowerCase();
    const matchesAcc = (h: Hospital) => !accNeedle || h.accreditations.includes(accNeedle as never);
    const matchesSpecs = (h: Hospital) => !specs.length || specs.some((s) => h.specialties.map((x) => x.toLowerCase()).includes(s.toLowerCase()));
    const matchesServices = (h: Hospital) => (
      (!services.interpreter || h.interpreter) &&
      (!services.pickup || h.airportPickup) &&
      (!services.inpatient || h.inpatient) &&
      (!services.outpatient || h.outpatient)
    );
    const matchesPrice = (h: Hospital) => !priceTier || h.priceTier === priceTier;
    const matchesRating = (h: Hospital) => h.rating >= min;

    let arr = DATA.filter((h) =>
      matchesText(h) && matchesCity(h) && matchesAcc(h) && matchesSpecs(h) && matchesServices(h) && matchesPrice(h) && matchesRating(h)
    );

    if (sort === "name") arr = arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "price") arr = arr.sort((a, b) => a.priceTier - b.priceTier || b.rating - a.rating);
    else arr = arr.sort((a, b) => b.rating - a.rating);

    return arr;
  }, [qSlow, city, acc, specs, services, price, min, sort]);

  // Pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const from = (current - 1) * pageSize;
  const to = Math.min(from + pageSize, total);
  const pageItems = filtered.slice(from, to);

  const toggleSpec = (s: string) => setSpecs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const setSvc = (k: keyof typeof services, v: boolean) => setServices((prev) => ({ ...prev, [k]: v }));
  const clearAll = () => {
    setQ(""); setCity(""); setAcc(""); setMin(0); setPrice(""); setSort("rating"); setPage(1); setPageSize(9); setSpecs([]);
    setServices({ interpreter: false, pickup: false, inpatient: false, outpatient: false });
  };

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

          {/* Quick specialty chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 justify-center">
            {(["Cardiology","Orthopedics","Dermatology","Neurology"] as const).map((s) => (
              <Chip key={s} active={specs.includes(s.toLowerCase())} onClick={() => toggleSpec(s.toLowerCase())}>{s}</Chip>
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
                  <label htmlFor="city" className="block text-sm text-gray-700">{t("city")}</label>
                  <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50">
                    <option value="">{t("all")}</option>
                    {CITIES.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="acc" className="block text-sm text-gray-700">{t("accreditation")}</label>
                  <select id="acc" value={acc} onChange={(e) => setAcc(e.target.value)} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50">
                    <option value="">{t("all")}</option>
                    <option value="JCI">{t("jci")}</option>
                    <option value="ISO 9001">{t("iso")}</option>
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
                <div>
                  <label htmlFor="min" className="block text-sm text-gray-700">{t("rating")}: <span className="font-medium">{min.toFixed(1)}</span></label>
                  <input id="min" type="range" min={0} max={5} step={0.5} value={min} onChange={(e) => setMin(parseFloat(e.target.value))} className="mt-2 w-full accent-blue-600" />
                </div>
                <div>
                  <label htmlFor="sort" className="block text-sm text-gray-700">{t("sort")}</label>
                  <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50">
                    <option value="rating">{t("sortRating")}</option>
                    <option value="name">{t("sortName")}</option>
                    <option value="price">{t("sortPrice")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ps" className="block text-sm text-gray-700">{t("perPage")}</label>
                  <select id="ps" value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))} className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50">
                    {[6,9,12].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Specialty multi select */}
            <div className="mt-4">
              <p className="text-sm text-gray-700 mb-2">{t("specialties")}</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <Chip key={s} active={specs.includes(s.toLowerCase())} onClick={() => toggleSpec(s.toLowerCase())}>{s}</Chip>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="mt-4">
              <p className="text-sm text-gray-700 mb-2">{t("services")}</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={services.interpreter} onClick={() => setSvc("interpreter", !services.interpreter)}>{t("svc_interpreter")}</Chip>
                <Chip active={services.pickup} onClick={() => setSvc("pickup", !services.pickup)}>{t("svc_pickup")}</Chip>
                <Chip active={services.inpatient} onClick={() => setSvc("inpatient", !services.inpatient)}>{t("svc_inpatient")}</Chip>
                <Chip active={services.outpatient} onClick={() => setSvc("outpatient", !services.outpatient)}>{t("svc_outpatient")}</Chip>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-500 flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-700">{total}</span> {t("results")} {total > 0 && <span className="ml-2 text-gray-400">• {t("showing")} {from + 1}–{to} {t("of")} {total}</span>}
              </div>
              <button onClick={clearAll} className="h-9 px-4 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">{t("clear")}</button>
            </div>
          </div>

          {/* Results */}
          {pageItems.length === 0 ? (
            <div className="mt-10 text-center">
              <div className="text-5xl mb-3">🏥</div>
              <p className="text-gray-600">{t("noResults")}</p>
              <button onClick={clearAll} className="mt-4 h-11 px-5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">{t("clear")}</button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {pageItems.map((h, i) => (
                  <motion.article key={h.id} initial={prefersReduced ? false : { opacity: 0, y: 12, scale: 0.98 }} whileInView={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.45, delay: i * 0.04 }} className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute -z-10 inset-0 opacity-10">
                      <svg viewBox="0 0 1200 200" className="w-full h-full">
                        <defs>
                          <linearGradient id={`hg-${h.id}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#93c5fd" />
                            <stop offset="100%" stopColor="#67e8f9" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="0" width="1200" height="200" fill={`url(#hg-${h.id})`} />
                      </svg>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {h.image ? (
                          <img src={h.image} alt={h.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full grid place-items-center">🏥</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{h.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{h.city} • <PriceTag tier={h.priceTier} /></p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {h.accreditations.map((a) => (
                            <Badge key={a} tone={a === "JCI" ? "emerald" : "blue"}>{a}</Badge>
                          ))}
                          {h.specialties.slice(0, 2).map((s) => (
                            <Badge key={s} tone="gray">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Stars rating={h.rating} />
                        <span className="text-xs text-gray-500">{h.beds} beds</span>
                      </div>
                      <div className="flex gap-2">
                        {h.interpreter && <Badge tone="gray">🗣️ {t("svc_interpreter")}</Badge>}
                        {h.airportPickup && <Badge tone="gray">🛬 {t("svc_pickup")}</Badge>}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link to={`/contact-us?hospital=${encodeURIComponent(h.name)}`} className="h-10 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm grid place-items-center">{t("view")}</Link>
                      <Link to={`/contact-us?inquiry=${encodeURIComponent(h.name)}`} className="h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm grid place-items-center">{t("contact")}</Link>
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
