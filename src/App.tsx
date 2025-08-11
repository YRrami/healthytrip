import { useEffect, useMemo, useRef, useState, createContext, useContext, forwardRef } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import doctorImg from "./doctor.png";
import AboutUs from "./pages/AboutUs";
/*****************************************************************************************
 * HealthTrip — v10 (Adds "How to Apply" section + full i18n + RTL doctor image fix)
 * ---------------------------------------------------------------------------------------
 *  • New "How to Apply" section with 5 clear steps and CTA (EN/AR).
 *  • Doctor image in Hero flips to LEFT on Arabic (RTL) automatically.
 *  • More strings localized (badges, cities, buttons, bullets, footer, placeholders).
 *****************************************************************************************/

/* ======================================================================================
   Utility Hooks
====================================================================================== */
function useViewportHeightVar() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);
}

function usePrefersReducedMotionHook() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handle = () => setReduced(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);
  return reduced;
}

function useScrollDirection(threshold = 8) {
  const [dir, setDir] = useState<"up" | "down">("up");
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      const diff = y - last;
      if (!ticking && Math.abs(diff) > threshold) {
        requestAnimationFrame(() => {
          setDir(diff > 0 ? "down" : "up");
          last = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return dir;
}

/* IntersectionObserver reveal for non-Motion elements */
function useReveal<T extends HTMLElement>(options: IntersectionObserverInit = { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }) {
  const reduced = usePrefersReducedMotionHook();
  const ref = useRef<T | null>(null);
  const optsRef = useRef(options);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { el.classList.add("reveal-in"); io.disconnect(); }
    }, optsRef.current);
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);
  return ref;
}

function useCarousel(length: number, interval = 3200) {
  const reduced = usePrefersReducedMotionHook();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced || length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % length), interval);
    return () => clearInterval(id);
  }, [length, interval, reduced]);
  return [index, setIndex] as [number, (i: number) => void];
}

/* ======================================================================================
   i18n — super-light EN/AR
====================================================================================== */
type Lang = "en" | "ar";
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({ lang: "en", setLang: () => {}, t: (k) => k });

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    navHome: "Home",
    navAbout: "About Us",
    navDoctors: "Doctors",
    navHospitals: "Hospitals and Centers",
    navDestinations: "Destinations",
    navContact: "Contact Us",
    register: "Register",
    login: "Login",

    heroTitle: "HealthTrip",
    heroSubtitle: "Smarter choices for global care",
    heroBody: "Access world-class hospitals and internationally trained doctors. Discover, compare, and plan your medical journey—all in one place.",
    heroStart: "Start your treatment",
    heroFind: "Find a doctor",

    badgeConcierge: "24/7 concierge",
    badgeJci: "JCI partners",
    badgeTransparent: "Transparent pricing",

    formSpec: "Choose specialty",
    formCity: "Choose city",
    formSearch: "Search",

    specialties: "Specialties",
    about: "About Us",
    aboutBody: "We connect patients to top hospitals and specialists worldwide. Transparent choices, concierge support, and end-to-end planning—so you focus on getting better.",
    aboutI1T: "Accredited hospitals",
    aboutI1D: "We partner with JCI and ISO-accredited centers across major destinations.",
    aboutI2T: "Concierge support",
    aboutI2D: "Travel assistance, medical translation, and on-ground care coordinators.",
    aboutI3T: "Fair, clear pricing",
    aboutI3D: "Upfront treatment packages—compare options before you book.",

    doctors: "Best Doctors",
    doctorsBody: "Meet highly rated specialists trusted by thousands of patients. Book with confidence.",
    viewProfile: "View profile →",
    bookAppointment: "Book appointment",



    teleTitle: "Teleconsultation",
    teleLead: "Schedule a voice or video call with a specialized doctor.",
    teleCTA: "Book online call",




    why: "Why Visit Egypt for Care?",
    whyBody: "Medical excellence meets legendary hospitality—and unforgettable destinations for recovery.",
    whyP1T: "World-class expertise",
    whyP1D: "Highly trained specialists and internationally accredited hospitals.",
    whyP2T: "Affordable excellence",
    whyP2D: "Up to 60% lower costs vs. EU/US for equivalent procedures.",
    whyP3T: "Fast scheduling",
    whyP3D: "Shorter wait times and dedicated care coordinators.",
    whyP4T: "Destination appeal",
    whyP4D: "Recover near the Nile, Red Sea, and timeless heritage sites.",

    howTitle: "How to Apply",
    howLead: "Five simple steps to start your medical journey.",
    howStep1T: "Share your case",
    howStep1D: "Upload medical reports or describe your symptoms and preferred dates.",
    howStep2T: "Get options & a quote",
    howStep2D: "Within 24–48 hours we send hospital/doctor options and transparent pricing.",
    howStep3T: "Confirm & visa support",
    howStep3D: "We secure appointments, invitation letters, and help with visa documents.",
    howStep4T: "Travel & treatment",
    howStep4D: "Airport pickup, translation, and a dedicated care coordinator.",
    howStep5T: "Follow-up & aftercare",
    howStep5D: "We stay with you through recovery and remote check-ins.",
    howCTA: "Start now",






    contactHow: "How to Contact Us",
    contactBody: "Questions, quotes, or second opinions—we’re here 7 days a week.",
    responseTime: "Average response time: under 2 hours.",
    thanks: "Thanks! We’ll get back to you shortly.",
    send: "Send message",
    fullName: "Full name",
    emailLabel: "Email",
    messageLabel: "Message",
    whatsappAction: "Message on WhatsApp",

    hospitalsStat: "Partner Hospitals",
    patientsStat: "Patients Guided",
    destinationsStat: "Destinations",
    callUs: "Call us",
    whatsapp: "WhatsApp",
    email: "Email",
    office: "Office",
    cityCairo: "Garden City, Cairo, Egypt",

    // Cities + specialties (for selects & carousel)
    city_cairo: "Cairo",
    city_dubai: "Dubai",
    city_istanbul: "Istanbul",
    city_bangkok: "Bangkok",
    city_singapore: "Singapore",

    spec_cardiology: "Cardiology",
    spec_neurology: "Neurology",
    spec_orthopedics: "Orthopedics",
    spec_dermatology: "Dermatology",
    spec_oncology: "Oncology",
    spec_pediatrics: "Pediatrics",
    spec_ent: "ENT",
    spec_ophthalmology: "Ophthalmology",

    heroCarousel1T: "Top Hospitals",
    heroCarousel1D: "JCI & ISO partners across 20+ destinations",
    heroCarousel2T: "Care Navigator",
    heroCarousel2D: "Concierge support from quotes to recovery",
    heroCarousel3T: "Real Savings",
    heroCarousel3D: "Up to 60% lower costs for equivalent care",

    comingSoon: "Content coming soon.",
  },
  ar: {
    navHome: "الرئيسية",
    navAbout: "من نحن",
    navDoctors: "الأطباء",
    navHospitals: "المستشفيات والمراكز",
    navDestinations: "الوجهات",
    navContact: "اتصل بنا",
    register: "تسجيل",
    login: "تسجيل الدخول",

    heroTitle: "هيلث تريب",
    heroSubtitle: "اختيارات أذكى للرعاية العالمية",
    heroBody: "وصول إلى مستشفيات عالمية وأطباء ذوي تدريب دولي. اكتشف وقارن وخطّط لرحلتك العلاجية في مكان واحد.",
    heroStart: "ابدأ علاجك",
    heroFind: "ابحث عن طبيب",

    badgeConcierge: "خدمة كونسيرج 24/7",
    badgeJci: "شركاء JCI",
    badgeTransparent: "تسعير شفاف",


    teleTitle: "الاستشارة عن بُعد",
    teleLead: "احجز مكالمة صوتية أو مرئية مع طبيب متخصص.",
    teleCTA: "احجز مكالمة عبر الإنترنت",


    formSpec: "اختر التخصص",
    formCity: "اختر المدينة",
    formSearch: "بحث",

    specialties: "التخصصات",
    about: "من نحن",
    aboutBody: "نربط المرضى بأفضل المستشفيات والمتخصصين حول العالم مع شفافية ودعم كامل حتى تركز على التعافي.",
    aboutI1T: "مستشفيات معتمدة",
    aboutI1D: "نتعاون مع مراكز معتمدة من JCI وISO في أبرز الوجهات.",
    aboutI2T: "دعم كونسيرج",
    aboutI2D: "مساعدة سفر، ترجمة طبية، ومنسقون ميدانيون.",
    aboutI3T: "تسعير عادل وواضح",
    aboutI3D: "باقات علاجية مسبقة—قارن الخيارات قبل الحجز.",

    doctors: "أفضل الأطباء",
    doctorsBody: "تعرّف على متخصصين موثوقين من آلاف المرضى واحجز بثقة.",
    viewProfile: "عرض الملف ←",
    bookAppointment: "احجز موعدًا",

    why: "لماذا مصر للعلاج؟",
    whyBody: "تميز طبي مع ضيافة أسطورية وتجارب تعافٍ لا تُنسى.",
    whyP1T: "خبرة عالمية",
    whyP1D: "متخصصون مدرَّبون ومستشفيات معتمدة دوليًا.",
    whyP2T: "تميز بتكلفة مناسبة",
    whyP2D: "حتى 60% أقل مقارنة بأوروبا/أمريكا لنفس الإجراءات.",
    whyP3T: "حجز سريع",
    whyP3D: "فترات انتظار أقصر ومنسقو رعاية مخصصون.",
    whyP4T: "وجهات جذابة",
    whyP4D: "تعافٍ قرب النيل والبحر الأحمر والمعالم الخالدة.",

    howTitle: "كيفية التقديم",
    howLead: "خمس خطوات بسيطة لبدء رحلتك العلاجية.",
    howStep1T: "شارك حالتك",
    howStep1D: "ارفع التقارير الطبية أو صف الأعراض والتواريخ المفضلة.",
    howStep2T: "احصل على الخيارات والتكلفة",
    howStep2D: "خلال 24–48 ساعة نرسل خيارات الأطباء/المستشفيات وتسعيرًا شفافًا.",
    howStep3T: "التأكيد ودعم التأشيرة",
    howStep3D: "نؤمّن المواعيد وخطابات الدعوة ونساعد في أوراق التأشيرة.",
    howStep4T: "السفر والعلاج",
    howStep4D: "استقبال من المطار، ترجمة، ومنسق رعاية مخصص.",
    howStep5T: "المتابعة والرعاية اللاحقة",
    howStep5D: "نبقى معك حتى التعافي عبر متابعات واتصال عن بُعد.",
    howCTA: "ابدأ الآن",

    contactHow: "كيف تتواصل معنا",
    contactBody: "استفسارات أو عروض أسعار أو آراء ثانية — نحن هنا طوال الأسبوع.",
    responseTime: "متوسط وقت الرد: أقل من ساعتين.",
    thanks: "شكرًا! سنعاود الاتصال بك قريبًا.",
    send: "إرسال",
    fullName: "الاسم الكامل",
    emailLabel: "البريد الإلكتروني",
    messageLabel: "الرسالة",
    whatsappAction: "راسلنا على واتساب",

    hospitalsStat: "مستشفيات شريكة",
    patientsStat: "مرضى تمت خدمتهم",
    destinationsStat: "وجهات",
    callUs: "اتصل بنا",
    whatsapp: "واتساب",
    email: "البريد الإلكتروني",
    office: "المكتب",
    cityCairo: "جاردن سيتي، القاهرة، مصر",

    city_cairo: "القاهرة",
    city_dubai: "دبي",
    city_istanbul: "إسطنبول",
    city_bangkok: "بانكوك",
    city_singapore: "سنغافورة",

    spec_cardiology: "القلب",
    spec_neurology: "الأعصاب",
    spec_orthopedics: "العظام",
    spec_dermatology: "الجلدية",
    spec_oncology: "الأورام",
    spec_pediatrics: "الأطفال",
    spec_ent: "الأنف والأذن والحنجرة",
    spec_ophthalmology: "العيون",

    heroCarousel1T: "أفضل المستشفيات",
    heroCarousel1D: "شركاء JCI وISO في +20 وجهة",
    heroCarousel2T: "ملاح رعاية",
    heroCarousel2D: "دعم كونسيرج من التسعير حتى التعافي",
    heroCarousel3T: "توفير حقيقي",
    heroCarousel3D: "حتى 60% أقل لنفس مستوى الرعاية",

    comingSoon: "المحتوى قيد الإعداد.",
  },
};

function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (k: string) => STRINGS[lang][k] ?? k;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", lang === "ar");
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

function useLang() { return useContext(LangCtx); }

/* ======================================================================================
   Data — Specialties + Doctors (keys for i18n)
====================================================================================== */
const specialties: { key: string; icon: string; color: string }[] = [
  { key: "cardiology",    icon: "/icons/cardiology.png",    color: "from-red-400 to-pink-400" },
  { key: "neurology",     icon: "/icons/neurology.png",     color: "from-purple-400 to-indigo-400" },
  { key: "orthopedics",   icon: "/icons/orthopedics.png",   color: "from-green-400 to-emerald-400" },
  { key: "dermatology",   icon: "/icons/dermatology.png",   color: "from-orange-400 to-yellow-400" },
  { key: "oncology",      icon: "/icons/oncology.png",      color: "from-blue-400 to-cyan-400" },
  { key: "pediatrics",    icon: "/icons/pediatrics.png",    color: "from-pink-400 to-rose-400" },
  { key: "ent",           icon: "/icons/ent.png",           color: "from-yellow-400 to-orange-400" },
  { key: "ophthalmology", icon: "/icons/ophthalmology.png", color: "from-teal-400 to-blue-400" },
];

const cities = ["cairo", "dubai", "istanbul", "bangkok", "singapore"] as const;

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  city: string;
  rating: number; // 0..5
  avatar?: string;
}

const bestDoctors: Doctor[] = [
  { id: 1, name: "Dr. Sara El-Shazly", specialty: "Cardiology", hospital: "Cairo Heart Center", city: "Cairo", rating: 4.9, avatar: "/avatars/doc1.png" },
  { id: 2, name: "Dr. Ahmed Farouk", specialty: "Orthopedics", hospital: "Alex Ortho Clinic", city: "Alexandria", rating: 4.8, avatar: "/avatars/doc2.png" },
  { id: 3, name: "Dr. Laila Hassan", specialty: "Dermatology", hospital: "SkinCare Pro", city: "Giza", rating: 4.7, avatar: "/avatars/doc3.png" },
  { id: 4, name: "Dr. Omar Nabil", specialty: "Neurology", hospital: "NeuroHub", city: "Cairo", rating: 4.9, avatar: "/avatars/doc4.png" },
  { id: 5, name: "Dr. Mariam Adel", specialty: "Pediatrics", hospital: "Kids Care Hospital", city: "Cairo", rating: 4.8, avatar: "/avatars/doc5.png" },
  { id: 6, name: "Dr. Karim Mostafa", specialty: "Ophthalmology", hospital: "VisionOne", city: "Cairo", rating: 4.7, avatar: "/avatars/doc6.png" },
];

/* ======================================================================================
   Cross Sprinkles (decor)
====================================================================================== */
function CrossSprinkles({ count = 60, seed = 1, className = "", opacity = 0.3 }: { count?: number; seed?: number; className?: string; opacity?: number }) {
  const pts = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const x = ((i * (67 + seed * 5)) % 1200) + ((seed * 13) % 20);
      const y = ((i * (113 + seed * 7)) % 800) + ((seed * 7) % 30);
      const s = 0.6 + ((i + seed) % 5) * 0.12;
      return { x, y, s };
    });
  }, [count, seed]);

  return (
    <div className={`absolute inset-0 -z-10 pointer-events-none ${className}`} aria-hidden>
      <svg className="w-full h-full block" viewBox="0 0 1200 800" fill="none">
        {pts.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`} className={`drift-${i % 8}`} opacity={opacity}>
            <rect x="-10" y="-30" width="20" height="60" rx="5" fill="#3b82f6" />
            <rect x="-30" y="-10" width="60" height="20" rx="5" fill="#3b82f6" />
            <rect x="-7" y="-24" width="14" height="48" fill="#93c5fd" opacity="0.18" />
            <rect x="-24" y="-7" width="48" height="14" fill="#93c5fd" opacity="0.18" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function RandomCrossLayer({ count = 96, seed = 2025, className = "", opacity = 0.75 }: { count?: number; seed?: number; className?: string; opacity?: number }) {
  const rng = useMemo(() => mulberry32(seed), [seed]);
  const pts = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const x = Math.floor(rng() * 1200);
      const y = Math.floor(rng() * 800);
      const s = 0.5 + rng() * 1.1;
      const k = Math.floor(rng() * 8);
      return { x, y, s, k };
    });
  }, [count, rng]);
  return (
    <div className={`absolute inset-0 -z-10 pointer-events-none ${className}`} aria-hidden>
      <svg className="w-full h-full block" viewBox="0 0 1200 800" fill="none">
        {pts.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`} className={`drift-${p.k}`} opacity={opacity}>
            <rect x="-10" y="-30" width="20" height="60" rx="5" fill="#3b82f6" />
            <rect x="-30" y="-10" width="60" height="20" rx="5" fill="#3b82f6" />
            <rect x="-7" y="-24" width="14" height="48" fill="#93c5fd" opacity="0.18" />
            <rect x="-24" y="-7" width="48" height="14" fill="#93c5fd" opacity="0.18" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ======================================================================================
   HERO BACKGROUND — Subtle hexes
====================================================================================== */
const HeroCrossField = () => {
  const hexes = useMemo(() => (
    [
      { x: 160, y: 120, s: 1.0, o: 0.08 }, { x: 300, y: 160, s: 0.95, o: 0.07 },
      { x: 520, y: 120, s: 1.05, o: 0.08 }, { x: 740, y: 160, s: 0.98, o: 0.07 },
      { x: 960, y: 120, s: 1.06, o: 0.08 },
      { x: 220, y: 320, s: 1.0,  o: 0.07 }, { x: 480, y: 360, s: 0.96, o: 0.07 },
      { x: 700, y: 320, s: 1.02, o: 0.08 }, { x: 940, y: 360, s: 0.98, o: 0.07 },
    ]
  ), []);

  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden>
      <svg className="w-full h-full block" viewBox="0 0 1200 800" fill="none">
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6fbff" />
            <stop offset="100%" stopColor="#f8fbfe" />
          </linearGradient>
          <filter id="crossShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#60a5fa" floodOpacity="0.25" />
          </filter>
        </defs>

        <rect x="0" y="0" width="1200" height="800" fill="url(#heroGrad)" />

        <g className="hero-pan-slow">
          <g opacity="0.35" stroke="#60a5fa">
            {hexes.map((h, i) => (
              <g key={`hx-${i}`} transform={`translate(${h.x} ${h.y}) scale(${h.s})`} className={`hex float-${i % 4}`}>
                <polygon points="0,-36 31,-18 31,18 0,36 -31,18 -31,-18" fill={`rgba(96,165,250,${h.o})`} strokeWidth="1.1" />
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ======================================================================================
   NAVBAR — Sticky + EN/AR switcher
====================================================================================== */
function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language switcher">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 text-xs rounded-l border ${lang === "en" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
        aria-pressed={lang === "en"}
      >EN</button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`px-2.5 py-1 text-xs rounded-r border ${lang === "ar" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
        aria-pressed={lang === "ar"}
      >AR</button>
    </div>
  );
}

const NAV_LINKS = [
  { key: "navHome", to: "/" },
  { key: "navAbout", to: "/about-us" },
  { key: "navDoctors", to: "/doctors" },
  { key: "navHospitals", to: "/hospitals-and-centers" },
  { key: "navDestinations", to: "/destination" },
  { key: "navContact", to: "/contact-us" },
];

function Navbar({ navOpen, setNavOpen }: { navOpen: boolean; setNavOpen: (v: boolean) => void }) {
  const dir = useScrollDirection();
  const hidden = dir === "down" && window.scrollY > 14;
  const linkBase = "px-1 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-300";
  const { t } = useLang();
  return (
    <nav className={`sticky top-0 z-50 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`} role="navigation" aria-label="Primary" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <Link to="/" className="text-2xl font-bold tracking-tight flex items-center focus:outline-none focus:ring-2 focus:ring-blue-300 rounded" style={{ fontFamily: "cursive" }} aria-label="HealthTrip home">
          <span className="text-gray-800">Health</span>
          <span className="text-blue-500">Trip</span>
        </Link>
        {/* hamburger visible up to lg */}
        <button className="lg:hidden p-3 -mr-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 transition" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation menu" aria-expanded={navOpen} aria-controls="primary-mobile-menu">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={!navOpen ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} /></svg>
        </button>
        {/* desktop links from lg */}
        <div className="hidden lg:flex flex-1 justify-center flex-wrap gap-5 lg:gap-8 text-[14px] lg:text-[15px] font-light text-gray-700">
          {NAV_LINKS.map(({ key, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${linkBase} ${isActive ? "text-blue-600 font-medium" : "hover:text-blue-600"}`}
            >
              {t(key)}
            </NavLink>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-2 ml-4 lg:ml-6">
          <LanguageSwitcher />
          <Link to="/register" className="px-3 py-2 border border-blue-100 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 transition">{t("register")}</Link>
          <Link to="/login" className="px-3 py-2 border border-blue-200 text-blue-700 rounded hover:bg-blue-600 hover:text-white text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95">{t("login")}</Link>
        </div>
      </div>
      <div id="primary-mobile-menu" className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ${navOpen ? "max-h-[70vh]" : "max-h-0"}`} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="bg-white border-t flex flex-col gap-1 p-4 text-gray-700 animate-slide-down">
          {NAV_LINKS.map(({ key, to }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `py-3 px-2 rounded transition ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50"}`} onClick={() => setNavOpen(false)}>
              {t(key)}
            </NavLink>
          ))}
          <div className="flex items-center justify-between pt-2">
            <LanguageSwitcher />
            <div className="flex gap-2">
              <Link to="/register" className="px-3 py-2 border border-blue-100 text-blue-700 rounded hover:bg-blue-50 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]">{t("register")}</Link>
              <Link to="/login" className="px-3 py-2 border border-blue-200 text-blue-700 rounded hover:bg-blue-600 hover:text-white text-xs transition text-center focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]">{t("login")}</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ======================================================================================
   HERO — Parallax, beams, orbs + Auto-Carousel inside
====================================================================================== */
function useParallaxVars(sectionRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0; let lx = 0, ly = 0, tx = 0, ty = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tx = x; ty = y;
      if (!raf) tick();
    };
    const tick = () => {
      lx += (tx - lx) * 0.12; ly += (ty - ly) * 0.12;
      el.style.setProperty("--mx", String(lx));
      el.style.setProperty("--my", String(ly));
      if (Math.abs(tx - lx) > 0.001 || Math.abs(ty - ly) > 0.001) raf = requestAnimationFrame(tick); else raf = 0;
    };
    el.addEventListener("pointermove", onMove);
    return () => { el.removeEventListener("pointermove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, [sectionRef]);
}

function HeroAutoCarousel() {
  const { t } = useLang();
  const slides = [
    { title: t("heroCarousel1T"), desc: t("heroCarousel1D"), icon: "🏥" },
    { title: t("heroCarousel2T"), desc: t("heroCarousel2D"), icon: "🧭" },
    { title: t("heroCarousel3T"), desc: t("heroCarousel3D"), icon: "💳" },
  ];
  const [idx, setIdx] = useCarousel(slides.length, 3800);
  const go = (i: number) => setIdx((i + slides.length) % slides.length);
  return (
    <div className="mt-6 md:mt-7" role="region" aria-roledescription="carousel" aria-label="Hero highlights">
      <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-white/80 backdrop-blur shadow">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {slides.map((s, i) => (
            <div key={i} className="min-w-full px-5 py-4 md:px-6 md:py-5 flex items-center gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl" aria-hidden>{s.icon}</span>
              <div>
                <div className="font-semibold text-gray-900">{s.title}</div>
                <div className="text-sm text-gray-600">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button aria-label="Prev" className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 border border-blue-100 rounded-full p-1.5 shadow hover:bg-white" onClick={() => go(idx - 1)}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button aria-label="Next" className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 border border-blue-100 rounded-full p-1.5 shadow hover:bg-white" onClick={() => go(idx + 1)}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} aria-label={`Go to slide ${i+1}`} onClick={() => go(i)} className={`w-2.5 h-2.5 rounded-full ${i===idx?"bg-blue-600":"bg-blue-200 hover:bg-blue-300"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({ speciality, setSpeciality, city, setCity, onCTA }: { speciality: string; setSpeciality: (v: string) => void; city: string; setCity: (v: string) => void; onCTA: () => void; }) {
  const revealRef = useReveal<HTMLDivElement>();
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { t } = useLang();
  useParallaxVars(sectionRef);

  return (
    <section ref={sectionRef} className="hero-parallax relative overflow-hidden bg-[#f8fbfe]" style={{ minHeight: "calc(var(--vh, 1vh) * 82)" }}>
      {/* Background layers */}
      <HeroCrossField />
      <RandomCrossLayer count={120} seed={2025} opacity={0.75} />
      <CrossSprinkles count={28} seed={42} className="opacity-15" />

      {/* Beams & orbs */}
      <div className="hero-beam hero-beam-1" aria-hidden />
      <div className="hero-beam hero-beam-2" aria-hidden />
      <div className="orb orb-a" aria-hidden data-parallax style={{ ['--px' as any]: '18px', ['--py' as any]: '10px' }} />
      <div className="orb orb-b" aria-hidden data-parallax style={{ ['--px' as any]: '-16px', ['--py' as any]: '8px' }} />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={revealRef} className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 pre-reveal">
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="py-12 md:py-16 lg:py-20 pr-0 lg:pr-20 xl:pr-28 2xl:pr-36 pb-8 md:pb-10 lg:pb-0"
            >
              <h1 className="text-gradient-animate font-extrabold mb-2 md:mb-3 leading-[1.03] text-[clamp(2.3rem,5vw,4rem)]">{t("heroTitle")}</h1>
              <h2 className="font-semibold text-blue-700 mb-2 md:mb-3 leading-[1.06] underline-offset-4 text-[clamp(1.8rem,3.8vw,3rem)]">{t("heroSubtitle")}</h2>
              <p className="text-[17px] md:text-[18px] text-gray-800 mb-6 md:mb-7 max-w-xl">{t("heroBody")}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="chip">{t("badgeConcierge")}</span>
                <span className="chip">{t("badgeJci")}</span>
                <span className="chip">{t("badgeTransparent")}</span>
              </div>

              {/* CTA Row */}
              <div className="flex flex-wrap gap-3">
                <motion.button type="button" whileTap={{ scale: 0.98 }} whileHover={prefersReduced ? undefined : { y: -2 }} className="btn-sheen bg-[#4d97c8] hover:bg-[#3071a9] text-white text-[16px] md:text-[18px] font-semibold px-6 md:px-7 py-2.5 md:py-3 rounded-lg shadow transition-all" onClick={onCTA}>
                    {t("heroStart")}
                  </motion.button>
                <Link to="/doctors" className="px-6 md:px-7 py-2.5 md:py-3 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-[14px] md:text-[16px] transition">{t("heroFind")}</Link>
              </div>

              {/* Auto Carousel inside hero */}
              <HeroAutoCarousel />

              {/* Glass search card */}
              <div className="w-full mt-6 md:mt-7" data-parallax style={{ ['--px' as any]: '10px', ['--py' as any]: '6px' }}>
                <motion.div whileHover={prefersReduced ? undefined : { y: -4 }} className="w-full max-w-xl sm:max-w-2xl mx-auto lg:mx-0 glass-card rounded-xl shadow p-2 border border-blue-100">
                  <form className="grid grid-cols-1 sm:grid-cols-3 gap-2" onSubmit={(e) => e.preventDefault()}>
                    <label className="sr-only" htmlFor="speciality">Specialty</label>
                    <select id="speciality" value={speciality} onChange={(e) => setSpeciality(e.target.value)} className="col-span-1 h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-gray-700 bg-gray-50 text-sm">
                      <option value="">{t("formSpec")}</option>
                      {specialties.map((s) => (
                        <option key={s.key} value={s.key}>{t(`spec_${s.key}`)}</option>
                      ))}
                    </select>
                    <label className="sr-only" htmlFor="city">City</label>
                    <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-1 h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-gray-700 bg-gray-50 text-sm">
                      <option value="">{t("formCity")}</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{t(`city_${c}`)}</option>
                      ))}
                    </select>
                    <button className="col-span-1 h-11 bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg text-sm font-medium">{t("formSearch")}</button>
                  </form>
                </motion.div>
              </div>
            </motion.div>

            {/* Right media spot */}
            <div className="hidden lg:block relative" aria-hidden>
              <div className="ring-spot" data-parallax style={{ ['--px' as any]: '-14px', ['--py' as any]: '10px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Doctor image with subtle float (RTL switches to left) */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hero-doctor hidden lg:block pointer-events-none select-none absolute bottom-0 right-0 z-20 pr-4 lg:pr-8 xl:pr-12"
      >
        <img id="doctor-image" src={doctorImg} alt="Doctor" className="doc-float max-w-[42vw] w-[420px] xl:w-[520px] 2xl:w-[560px] drop-shadow-2xl" draggable={false} />
      </motion.div>
    </section>
  );
}

/* ======================================================================================
   SPECIALTIES CAROUSEL
====================================================================================== */
function SpecialtiesCarousel() {
  const { t } = useLang();
  const [carouselIdx, setCarouselIdx] = useCarousel(specialties.length, 3400);
  const trackRef = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);

  const go = (i: number) => {
    setCarouselIdx(i);
    const card = trackRef.current?.querySelector<HTMLElement>(`[data-index='${i}']`);
    const cardWidth = card?.offsetWidth || 220;
    trackRef.current?.scrollTo({ left: i * (cardWidth + 20), behavior: "smooth" });
  };

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const onEnter = () => (hovering.current = true);
    const onLeave = () => (hovering.current = false);
    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);
    node.addEventListener("focusin", onEnter);
    node.addEventListener("focusout", onLeave);
    return () => {
      node.removeEventListener("mouseenter", onEnter);
      node.removeEventListener("mouseleave", onLeave);
      node.removeEventListener("focusin", onEnter);
      node.removeEventListener("focusout", onLeave);
    };
  }, []);

  useEffect(() => {
    if (hovering.current) return;
    go(carouselIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go((carouselIdx + 1) % specialties.length);
      if (e.key === "ArrowLeft") go((carouselIdx - 1 + specialties.length) % specialties.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [carouselIdx]);

  return (
    <section className="relative bg-white py-16 md:py-24">
      <CrossSprinkles count={35} seed={7} className="opacity-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{t("specialties")}</h2>
          <div className="w-16 md:w-20 h-1 bg-blue-500 mx-auto rounded" />
        </div>
        <div className="relative flex items-center">
          <button aria-label="Previous" className="hidden sm:flex absolute left-0 z-10 bg-white border border-blue-100 shadow rounded-full p-2 text-blue-600 hover:bg-blue-50 transition -translate-y-1/2 top-1/2 active:scale-95" onClick={() => go((carouselIdx - 1 + specialties.length) % specialties.length)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div ref={trackRef} role="region" aria-roledescription="carousel" aria-label="Medical specialties" className="overflow-x-auto flex gap-5 sm:gap-7 snap-x snap-mandatory px-2 sm:px-12 py-2 scrollbar-hide" style={{ width: "100%", scrollBehavior: "smooth" }}>
            {specialties.map((spec, i) => (
              <motion.div
                key={spec.key}
                data-index={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="min-w-[190px] sm:min-w-[210px] flex-shrink-0 snap-center group transition duration-300 cursor-pointer"
              >
                <div className={`bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 text-center shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group-hover:border-blue-200`}>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 bg-gradient-to-br ${spec.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <img src={spec.icon} alt={`${t(`spec_${spec.key}`)} icon`} className="w-8 h-8 object-contain" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{t(`spec_${spec.key}`)}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          <button aria-label="Next" className="hidden sm:flex absolute right-0 z-10 bg-white border border-blue-100 shadow rounded-full p-2 text-blue-600 hover:bg-blue-50 transition -translate-y-1/2 top-1/2 active:scale-95" onClick={() => go((carouselIdx + 1) % specialties.length)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================================
   ABOUT US
====================================================================================== */
function NumberCounter({ value, duration = 1200, prefix = "", suffix = "" }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setN(Math.floor(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value, duration]);
  return <span>{prefix}{n.toLocaleString()}{suffix}</span>;
}

function AboutSection() {
  const prefersReduced = useReducedMotion();
  const { t } = useLang();
  return (
    <section className="relative bg-gradient-to-b from-white to-[#f6fbff] py-16 md:py-24 overflow-hidden">
      <CrossSprinkles count={55} seed={11} className="opacity-25" />
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" aria-hidden />
      <div className="absolute bottom-0 -left-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={prefersReduced ? false : { opacity: 0, y: 20 }} whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{t("about")}</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">{t("aboutBody")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div initial={prefersReduced ? false : { opacity: 0, x: -20 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
            <ul className="space-y-4">
              {[
                { t: t("aboutI1T"), d: t("aboutI1D") },
                { t: t("aboutI2T"), d: t("aboutI2D") },
                { t: t("aboutI3T"), d: t("aboutI3D") },
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow">✓</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.t}</h3>
                    <p className="text-gray-600">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={prefersReduced ? false : { opacity: 0, x: 20 }} whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="grid grid-cols-3 gap-4">
            <div className="col-span-3 sm:col-span-1 bg-white rounded-2xl border border-blue-100 shadow p-6 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600"><NumberCounter value={120} suffix={"+"} /></div>
              <p className="text-gray-600 mt-1">{t("hospitalsStat")}</p>
            </div>
            <div className="col-span-3 sm:col-span-1 bg-white rounded-2xl border border-blue-100 shadow p-6 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600"><NumberCounter value={35} suffix={"k+"} /></div>
              <p className="text-gray-600 mt-1">{t("patientsStat")}</p>
            </div>
            <div className="col-span-3 sm:col-span-1 bg-white rounded-2xl border border-blue-100 shadow p-6 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600"><NumberCounter value={20} suffix={"+"} /></div>
              <p className="text-gray-600 mt-1">{t("destinationsStat")}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================================
   BEST DOCTORS
====================================================================================== */
function StarRow({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < full ? "text-yellow-400" : i === full && half ? "text-yellow-300" : "text-gray-300"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.176 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function BestDoctorsSection() {
  const prefersReduced = useReducedMotion();
  const { t } = useLang();
  return (
    <section className="relative bg-white py-16 md:py-24">
      <CrossSprinkles count={45} seed={17} className="opacity-25" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={prefersReduced ? false : { opacity: 0, y: 20 }} whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t("doctors")}</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{t("doctorsBody")}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {bestDoctors.map((d, i) => (
            <motion.article
              key={d.id}
              initial={prefersReduced ? false : { opacity: 0, y: 20, scale: 0.98 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="absolute -z-10 inset-0 opacity-10">
                <CrossSprinkles count={12} seed={100 + i} />
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
                <StarRow rating={d.rating} />
                <Link to="/doctors" className="text-sm text-blue-700 hover:text-blue-900 font-medium">{t("viewProfile")}</Link>
              </div>
              <motion.button whileTap={{ scale: 0.98 }} className="mt-5 w-full h-10 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">{t("bookAppointment")}</motion.button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================================================
   WHY VISIT EGYPT
====================================================================================== */
function WhyEgyptSection() {
  const prefersReduced = useReducedMotion();
  const { t } = useLang();
  const points = [
    { t: t("whyP1T"), d: t("whyP1D"), icon: "🏥" },
    { t: t("whyP2T"), d: t("whyP2D"), icon: "💳" },
    { t: t("whyP3T"), d: t("whyP3D"), icon: "⏱️" },
    { t: t("whyP4T"), d: t("whyP4D"), icon: "🕌" },
  ];
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <CrossSprinkles count={60} seed={23} className="opacity-25" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
      <div className="absolute -right-10 -top-10 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl" aria-hidden />
      <div className="absolute -left-10 bottom-0 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={prefersReduced ? false : { opacity: 0, y: 20 }} whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t("why")}</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{t("whyBody")}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {points.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: i * 0.05 }} className="bg-white rounded-2xl border border-blue-100 shadow p-6 text-center">
              <div className="text-4xl mb-3" aria-hidden>{p.icon}</div>
              <h3 className="font-semibold text-gray-900">{p.t}</h3>
              <p className="text-gray-600 mt-1">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================================================
   HOW TO APPLY — new section
====================================================================================== */
function HowToApplySection({ onCTA }: { onCTA: () => void }) {
  const prefersReduced = useReducedMotion();
  const { t } = useLang();
  const steps = [
    { n: 1, t: t("howStep1T"), d: t("howStep1D"), icon: "📝" },
    { n: 2, t: t("howStep2T"), d: t("howStep2D"), icon: "📩" },
    { n: 3, t: t("howStep3T"), d: t("howStep3D"), icon: "🛂" },
    { n: 4, t: t("howStep4T"), d: t("howStep4D"), icon: "✈️" },
    { n: 5, t: t("howStep5T"), d: t("howStep5D"), icon: "🩺" },
  ];
  return (
    <section id="how-to-apply" className="relative bg-white py-16 md:py-24 overflow-hidden">
      <CrossSprinkles count={50} seed={33} className="opacity-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={prefersReduced ? false : { opacity: 0, y: 20 }} whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6 }} className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t("howTitle")}</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{t("howLead")}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{s.n}</div>
                <div className="text-2xl" aria-hidden>{s.icon}</div>
              </div>
              <h3 className="font-semibold text-gray-900">{s.t}</h3>
              <p className="text-gray-600 mt-1 text-sm">{s.d}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <motion.button whileTap={{ scale: 0.98 }} className="h-11 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700" onClick={onCTA}>
            {t("howCTA")}
          </motion.button>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================================
   CONTACT — forwardRef so CTA scroll can focus
====================================================================================== */
const ContactSection = forwardRef<HTMLDivElement, {}>(function ContactSection(_, ref) {
  const [sent, setSent] = useState(false);
  const prefersReduced = useReducedMotion();
  const { t } = useLang();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement & { name: HTMLInputElement };
    const fd = new FormData(form);
    setSent(true);
    setTimeout(() => setSent(false), 3500);
    form.reset();
    console.log("Contact form submitted", Object.fromEntries(fd.entries()));
  };

  return (
    <section ref={ref as any} className="relative py-16 md:py-24 overflow-hidden bg-white">
      <CrossSprinkles count={40} seed={77} className="opacity-15" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={prefersReduced ? false : { opacity: 0, y: 16 }} whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.5 }} className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t("contactHow")}</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{t("contactBody")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white border border-blue-100 rounded-2xl shadow p-6">
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="text-sm text-gray-700">{t("fullName")}</label>
                <input id="name" name="name" required className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50" />
              </div>
              <div>
                <label htmlFor="email" className="text-sm text-gray-700">{t("emailLabel")}</label>
                <input id="email" name="email" type="email" required className="mt-1 w-full h-11 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="message" className="text-sm text-gray-700">{t("messageLabel")}</label>
                <textarea id="message" name="message" rows={4} required className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50" />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <p role="status" className={`text-sm ${sent ? "text-green-600" : "text-gray-500"}`}>{sent ? t("thanks") : t("responseTime")}</p>
                <motion.button whileTap={{ scale: 0.98 }} className="h-11 px-5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">{t("send")}</motion.button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl shadow p-6">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="mt-1">📞</span>
                <div>
                  <p className="font-medium text-gray-900">{t("callUs")}</p>
                  <a href="tel:+201234567890" className="text-blue-700 hover:text-blue-900">+20 123 456 7890</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1">💬</span>
                <div>
                  <p className="font-medium text-gray-900">{t("whatsapp")}</p>
                  <a href="https://wa.me/201234567890" target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900">{t("whatsappAction")}</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1">✉️</span>
                <div>
                  <p className="font-medium text-gray-900">{t("email")}</p>
                  <a href="mailto:hello@healthtrip.example" className="text-blue-700 hover:text-blue-900">hello@healthtrip.example</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1">📍</span>
                <div>
                  <p className="font-medium text-gray-900">{t("office")}</p>
                  <p className="text-gray-600">{t("cityCairo")}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
});




/* ======================================================================================
   TELECONSULTATION — new (matches your screenshot style)
====================================================================================== */
function TeleconsultationSection({ onCTA }: { onCTA: () => void }) {
  const prefersReduced = useReducedMotion();
  const { t } = useLang();
  return (
    <section className="relative bg-white py-16 md:py-24">
      <CrossSprinkles count={35} seed={41} className="opacity-15" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:4xl font-extrabold tracking-[0.02em] text-gray-900">
            {t("teleTitle")}
            <span className="align-super text-blue-500 text-xl pl-1">＋</span>
          </h2>
        </div>

        <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 bg-white shadow-sm">
          <div className="dir-aware-row flex items-start gap-5">
            <div className="w-[220px] h-[160px] sm:w-[260px] sm:h-[180px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {/* Replace src with your real image (e.g. /images/teleconsultation.jpg) */}
              <img src="/images/teleconsultation.jpg" alt={t("teleTitle")} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 uppercase tracking-wide">{t("teleTitle")}</h3>
              <p className="text-gray-600 mt-2">{t("teleLead")}</p>
              <motion.button whileTap={{ scale: 0.98 }} className="mt-4 inline-flex items-center justify-center h-11 px-5 rounded-lg border border-blue-700 text-blue-800 hover:bg-blue-50 font-medium" onClick={onCTA}>
                {t("teleCTA")}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}









/* ======================================================================================
   FOOTER + ScrollToTop button
====================================================================================== */
function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-white border-t py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} HealthTrip. All rights reserved.</p>
        <nav className="flex gap-4 text-sm text-gray-600">
          <Link to="/about-us" className="hover:text-blue-700">{t("navAbout")}</Link>
          <Link to="/contact-us" className="hover:text-blue-700">{t("navContact")}</Link>
          <Link to="/doctors" className="hover:text-blue-700">{t("navDoctors")}</Link>
        </nav>
      </div>
    </footer>
  );
}

function ScrollTopBtn() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 40, pointerEvents: show ? "auto" : "none" }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-blue-600 text-white w-12 h-12 flex items-center justify-center hover:bg-blue-700"
    >
      ↑
    </motion.button>
  );
}

/* ======================================================================================
   PAGES
====================================================================================== */
function Placeholder({ title }: { title: string }) {
  const { t } = useLang();
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600">{t("comingSoon")}</p>
      <Footer />
    </main>
  );
}

function AboutPage() {
  return (
    <main>
      <AboutSection />
      <Footer />
    </main>
  );
}
function DoctorsPage() {
  return (
    <main>
      <BestDoctorsSection />
      <Footer />
    </main>
  );
}
function ContactPage() {
  const contactRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return (
    <main>
      <ContactSection ref={contactRef} />
      <Footer />
    </main>
  );
}
function WhyEgyptPage() {
  return (
    <main>
      <WhyEgyptSection />
      <Footer />
    </main>
  );
}
function HospitalsPage() {
  const { t } = useLang();
  return <Placeholder title={t("navHospitals")} />;
}
function RegisterPage() {
  const { t } = useLang();
  return <Placeholder title={t("register")} />;
}
function LoginPage() {
  const { t } = useLang();
  return <Placeholder title={t("login")} />;
}

/* ======================================================================================
   APP ROOT + CTA scroll wiring + global styles for hero effects & RTL
====================================================================================== */
function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function App() {
  useViewportHeightVar();
  const [speciality, setSpeciality] = useState("");
  const [city, setCity] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement | null>(null);

  const onCTA = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const input = contactRef.current?.querySelector<HTMLInputElement>("#name");
      input?.focus();
    }, 450);
  };

  const { t } = useLang(); // available for inline titles if needed

  return (
    <LangProvider>
      <Router>
        <ScrollToTopOnRouteChange />
        <Navbar navOpen={navOpen} setNavOpen={setNavOpen} />
        <Routes>
          <Route path="/" element={
            <main>
              <Hero speciality={speciality} setSpeciality={setSpeciality} city={city} setCity={setCity} onCTA={onCTA} />
              <SpecialtiesCarousel />
              <AboutSection />
              <BestDoctorsSection />
              <WhyEgyptSection />
              <TeleconsultationSection onCTA={onCTA} />
              <HowToApplySection onCTA={onCTA} />
              <ContactSection ref={contactRef} />
              <Footer />
              <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .pre-reveal { opacity: 0; transform: translateY(12px); }
                .reveal-in { opacity: 1; transform: translateY(0); transition: opacity 520ms ease, transform 520ms ease; }
                @keyframes panSlow { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(-0.8%, -0.4%, 0) } 100% { transform: translate3d(0,0,0) } }
                .hero-pan-slow { animation: panSlow 34s ease-in-out infinite; will-change: transform; }
                @keyframes floatA { 0% { transform: translateY(0) } 50% { transform: translateY(-12px) } 100% { transform: translateY(0) } }
                @keyframes floatB { 0% { transform: translateY(0) } 50% { transform: translateY(-9px) } 100% { transform: translateY(0) } }
                @keyframes floatC { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }
                .float-0 { animation: floatA 12s ease-in-out infinite; }
                .float-1 { animation: floatB 11s ease-in-out infinite; }
                .float-2 { animation: floatC 13s ease-in-out infinite; }
                .float-3 { animation: floatB 14s ease-in-out infinite; }
                .drift-0 { animation: floatA 9s ease-in-out infinite; }
                .drift-1 { animation: floatB 10s ease-in-out infinite; }
                .drift-2 { animation: floatC 11s ease-in-out infinite; }
                .drift-3 { animation: floatA 12s ease-in-out infinite; }
                .drift-4 { animation: floatB 10.5s ease-in-out infinite; }
                .drift-5 { animation: floatC 11.5s ease-in-out infinite; }
                .drift-6 { animation: floatA 12.5s ease-in-out infinite; }
                .drift-7 { animation: floatB 13.5s ease-in-out infinite; }
                @keyframes slideDown { 0% { opacity: 0; transform: translateY(-8px) } 100% { opacity: 1; transform: translateY(0) } }
                .animate-slide-down { animation: slideDown 220ms ease-out both; }

                /* Hero special visuals */
                .text-gradient-animate { background: linear-gradient(90deg,#0ea5e9,#2563eb,#0ea5e9); -webkit-background-clip: text; background-clip: text; color: transparent; background-size: 200% 100%; animation: gradShift 8s ease-in-out infinite; }
                @keyframes gradShift { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
                .chip { padding: 6px 10px; border-radius: 9999px; font-size: 12px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
                .btn-sheen { position: relative; overflow: hidden; }
                .btn-sheen::after { content: ""; position: absolute; left: -40%; top: 0; width: 40%; height: 100%; transform: skewX(-20deg); background: linear-gradient( to right, rgba(255,255,255,0.0), rgba(255,255,255,0.35), rgba(255,255,255,0.0) ); animation: sheen 2.8s infinite; }
                @keyframes sheen { 0% { left: -40% } 60% { left: 140% } 100% { left: 140% } }
                .glass-card { background: rgba(255,255,255,0.72); backdrop-filter: blur(10px); }
                .hero-beam { position:absolute; inset: -20% -10% auto -10%; height: 40%; background: radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,0.18), transparent 70%); filter: blur(30px); }
                .hero-beam-2 { inset: auto -10% -20% -10%; height: 50%; background: radial-gradient(60% 60% at 50% 50%, rgba(14,165,233,0.16), transparent 70%); }
                .orb { position:absolute; width: 260px; height: 260px; border-radius: 9999px; background: radial-gradient(circle at 30% 30%, rgba(59,130,246,0.22), rgba(59,130,246,0.05)); filter: blur(6px); mix-blend-mode: multiply; }
                .orb-a { left: -60px; top: -40px; transform: translate(calc(var(--mx,0) * 10px), calc(var(--my,0) * 12px)); }
                .orb-b { right: -60px; bottom: -60px; transform: translate(calc(var(--mx,0) * -12px), calc(var(--my,0) * -9px)); }
                .ring-spot { position:absolute; right: 6%; top: 10%; width: 420px; height: 420px; border-radius: 9999px; background: radial-gradient(closest-side, rgba(14,165,233,0.15), rgba(14,165,233,0.06), transparent 70%); filter: blur(4px); }
                .doc-float { animation: floatA 10s ease-in-out infinite; }

                /* RTL niceties */
                .rtl .ring-spot { right: auto; left: 6%; }
                .hero-doctor { right: 0; }
                .rtl .hero-doctor { right: auto; left: 0; padding-right: 0 !important; padding-left: 1rem !important; }
                @media (min-width: 1024px) { .rtl .hero-doctor { padding-left: 2rem !important; } }
                @media (min-width: 1280px) { .rtl .hero-doctor { padding-left: 3rem !important; } }

                @media (min-width: 820px) and (max-width: 1180px) and (orientation: portrait) { .hero-pan-slow { animation-duration: 36s; } }
                @media (min-width: 820px) and (max-width: 1180px) and (orientation: landscape) { .hero-pan-slow { animation-duration: 32s; } }
                @media (prefers-reduced-motion: reduce) {
                  .hero-pan-slow, .float-0, .float-1, .float-2, .float-3, .drift-0, .drift-1, .drift-2, .drift-3, .drift-4, .drift-5, .drift-6, .drift-7, .doc-float { animation: none !important; }
                  .pre-reveal, .reveal-in { opacity: 1 !important; transform: none !important; transition: none !important; }
                  .btn-sheen::after { display:none; }
                }
              `}</style>
              <ScrollTopBtn />
            </main>
          } />
          {/* Dedicated routes */}
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/hospitals-and-centers" element={<HospitalsPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/destination" element={<WhyEgyptPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </LangProvider>
  );
}

export default App;
