import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ======================================================================
   AboutUs — "Clinique" White Medical Theme (EN/AR + RTL aware)
   • Clean, bright, clinical aesthetic with soft blues & subtle shadows
   • Sticky scroll‑spy sub‑nav with hamburger (≤1024px), gentle reveals
   • Responsive scroll progress bar (safe‑area aware) + real partner logos
   • Self‑contained styles; pure React + Tailwind + Framer Motion
   • Guaranteed inline footer
====================================================================== */

const STRINGS = {
  en: {
    navAbout: "About",
    navMission: "Mission",
    navWhat: "What we do",
    navValues: "Values",
    navQuality: "Quality",
    navStory: "Story",
    navTeam: "Team",
    navFAQ: "FAQ",

    heroKicker: "ABOUT US",
    heroTitle: "We make cross-border healthcare simple, transparent, and human.",
    heroLead:
      "HealthTrip connects patients with internationally accredited hospitals and top specialists. From first message to full recovery, we coordinate care, travel, and aftercare—so you can focus on getting better.",
    trustedBy: "Trusted by partners worldwide",

    statHospitals: "Partner Hospitals",
    statPatients: "Patients Guided",
    statDestinations: "Destinations",

    missionTitle: "Our Mission",
    missionBody:
      "Empower people to access safe, high-quality medical care anywhere through clear options, fair pricing, and concierge-level support at every step.",
    visionTitle: "Our Vision",
    visionBody:
      "A world where geography never limits healthcare quality—and every patient journey feels coordinated, personal, and stress-free.",

    whatTitle: "What We Do",
    what1T: "Care navigation",
    what1D: "Curated hospitals and doctors matched to your case.",
    what2T: "Medical coordination",
    what2D: "Second opinions, bookings, and medical translation.",
    what3T: "Travel assistance",
    what3D: "Visas, airport pickup, and on-ground coordinators.",
    what4T: "Transparent pricing",
    what4D: "Clear quotes and treatment packages—no surprises.",
    what5T: "Teleconsultation",
    what5D: "Meet specialists online before you fly.",
    what6T: "Aftercare & follow-up",
    what6D: "Recovery plans and remote check-ins post-treatment.",

    valuesTitle: "Our Values",
    val1T: "Patient-first",
    val1D: "We measure success by outcomes and peace of mind.",
    val2T: "Clarity",
    val2D: "No hidden fees. No confusing steps. No guesswork.",
    val3T: "Integrity",
    val3D: "Independent guidance, ethical partners, verified quality.",

    qualityTitle: "Quality & Accreditations",
    qual1T: "JCI Partners",
    qual1D: "We prioritize hospitals accredited by Joint Commission International.",
    qual2T: "ISO Standards",
    qual2D: "Process quality and safety aligned with international standards.",
    qual3T: "Clinical Review",
    qual3D: "Ongoing vetting of doctors, outcomes, and patient feedback.",

    storyTitle: "Our Story",
    story1Y: "2021",
    story1T: "The idea",
    story1D: "Remove friction from medical travel with a concierge model.",
    story2Y: "2022",
    story2T: "First partners",
    story2D: "Signed JCI-accredited hospitals in key destinations.",
    story3Y: "2023–Now",
    story3T: "Scaling service",
    story3D: "Teleconsults, transparent packages, and richer aftercare.",

    teamTitle: "Leadership",

    faqTitle: "FAQ",
    faq1Q: "How do I start?",
    faq1A:
      "Share your case and preferred dates. We’ll reply with hospital/doctor options and a clear quote.",
    faq2Q: "Can I talk to a doctor online first?",
    faq2A: "Yes—book a teleconsultation to validate your plan before you travel.",
    faq3Q: "What’s included in your service?",
    faq3A:
      "Coordination, quotes, scheduling, visa support, airport pickup, translation, and aftercare check-ins.",

    ctaTitle: "Ready to start?",
    ctaLead: "Tell us about your case—average response time under 2 hours.",
    ctaContact: "Contact Us",
    ctaWhatsApp: "WhatsApp",

    fAbout: "About",
    fContact: "Contact",
    fDoctors: "Doctors",
  },
  ar: {
    navAbout: "من نحن",
    navMission: "المهمة",
    navWhat: "ماذا نقدّم",
    navValues: "القيم",
    navQuality: "الجودة",
    navStory: "القصة",
    navTeam: "الفريق",
    navFAQ: "الأسئلة",

    heroKicker: "من نحن",
    heroTitle: "نقدّم رعاية صحية عابرة للحدود—ببساطة وشفافية وإنسانية.",
    heroLead:
      "تربط «هيلث تريب» المرضى بمستشفيات معتمدة دوليًا وأفضل الأطباء. من أول رسالة حتى التعافي التام، ننسّق الرعاية والسفر والمتابعة—لتنعم براحة البال.",
    trustedBy: "موثوق بنا من شركاء حول العالم",

    statHospitals: "مستشفيات شريكة",
    statPatients: "مرضى تمت خدمتهم",
    statDestinations: "وجهات",

    missionTitle: "مهمتنا",
    missionBody:
      "تمكين الجميع من الوصول إلى رعاية آمنة وعالية الجودة أينما كانوا، عبر خيارات واضحة وتسعير عادل ودعم «كونسيرج» في كل خطوة.",
    visionTitle: "رؤيتنا",
    visionBody:
      "عالم لا يقيّد فيه المكان جودة الرعاية—وتكون رحلة المريض منسّقة وشخصية وخالية من التوتر.",

    whatTitle: "ماذا نقدّم",
    what1T: "توجيه الرعاية",
    what1D: "اختيار مستشفيات وأطباء مناسبين لحالتك.",
    what2T: "تنسيق طبي",
    what2D: "آراء ثانية، حجز المواعيد، والترجمة الطبية.",
    what3T: "مساندة السفر",
    what3D: "التأشيرات، الاستقبال من المطار، ومنسّقون ميدانيون.",
    what4T: "تسعير شفاف",
    what4D: "عروض واضحة وباقات علاجية بلا مفاجآت.",
    what5T: "استشارة عن بُعد",
    what5D: "قابل الأطباء عبر الإنترنت قبل السفر.",
    what6T: "رعاية لاحقة",
    what6D: "خطط تعافٍ ومتابعات عن بُعد بعد العلاج.",

    valuesTitle: "قيمنا",
    val1T: "المريض أولًا",
    val1D: "نقيس النجاح بالنتائج وطمأنينة المريض.",
    val2T: "الوضوح",
    val2D: "لا رسوم خفية. لا خطوات مربكة. لا تخمين.",
    val3T: "النزاهة",
    val3D: "إرشاد مستقل وشركاء ملتزمون وجودة مُثبتة.",

    qualityTitle: "الجودة والاعتمادات",
    qual1T: "شركاء JCI",
    qual1D: "نُعطي الأولوية للمستشفيات المعتمدة من اللجنة الدولية المشتركة.",
    qual2T: "معايير ISO",
    qual2D: "جودة العمليات والسلامة وفق المعايير الدولية.",
    qual3T: "مراجعة سريرية",
    qual3D: "تحقّق مستمر من الأطباء والنتائج وآراء المرضى.",

    storyTitle: "قصتنا",
    story1Y: "2021",
    story1T: "البداية",
    story1D: "تخفيف تعقيدات السياحة العلاجية بنموذج «كونسيرج».",
    story2Y: "2022",
    story2T: "أول الشراكات",
    story2D: "اتفاقات مع مستشفيات معتمدة في وجهات رئيسية.",
    story3Y: "2023–حتى الآن",
    story3T: "التوسّع",
    story3D: "استشارات عن بُعد وباقات شفافة ورعاية لاحقة أعمق.",

    teamTitle: "القيادة",

    faqTitle: "الأسئلة الشائعة",
    faq1Q: "كيف أبدأ؟",
    faq1A:
      "شاركنا حالتك وتواريخك المفضلة. سنرسل خيارات الأطباء/المستشفيات وعرضًا واضحًا.",
    faq2Q: "هل يمكن التحدث لطبيب عبر الإنترنت أولًا؟",
    faq2A: "نعم—احجز استشارة عن بُعد لتأكيد خطتك قبل السفر.",
    faq3Q: "ماذا تشمل خدمتكم؟",
    faq3A:
      "التنسيق، العروض، الحجز، دعم التأشيرة، الاستقبال من المطار، الترجمة، والمتابعة بعد العلاج.",

    ctaTitle: "جاهز للبدء؟",
    ctaLead: "أخبرنا بحالتك—متوسط وقت الرد أقل من ساعتين.",
    ctaContact: "اتصل بنا",
    ctaWhatsApp: "واتساب",

    fAbout: "من نحن",
    fContact: "اتصل بنا",
    fDoctors: "الأطباء",
  },
};

function useLang() {
  const [lang, setLang] = useState("en");
  useEffect(() => {
    const update = () => {
      const dir = document.documentElement.getAttribute("dir") || "ltr";
      const htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
      setLang(dir === "rtl" || htmlLang.startsWith("ar") ? "ar" : "en");
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["dir", "lang"] });
    return () => mo.disconnect();
  }, []);
  const t = (k) => (STRINGS[lang] && STRINGS[lang][k]) || k;
  return { lang, t };
}

function useScrollSpy(ids, rootMargin = "-45% 0px -45% 0px") {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { root: null, rootMargin, threshold: 0.01 });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [ids, rootMargin]);
  return active;
}

function NumberCounter({ value = 0, duration = 1200 }) {
  const [n, setN] = useState(0);
  const [run, setRun] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRun(true); io.disconnect(); } }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!run) return;
    let start = null, raf = 0;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setN(Math.round(p * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, value, duration]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
}

// Real partner logos — replace logo paths with your assets under /logos
const PARTNERS = [
  { name: "JCI", logo: "/logos/jci.svg", url: "https://www.jointcommissioninternational.org/" },
  { name: "Cleveland Clinic", logo: "/logos/cleveland-clinic.svg", url: "https://my.clevelandclinic.org/" },
  { name: "Mayo Clinic", logo: "/logos/mayo-clinic.svg", url: "https://www.mayoclinic.org/" },
  { name: "Johns Hopkins Medicine", logo: "/logos/johns-hopkins.svg", url: "https://www.hopkinsmedicine.org/international/" },
  { name: "GE HealthCare", logo: "/logos/ge-healthcare.svg", url: "https://www.gehealthcare.com/" },
  { name: "Siemens Healthineers", logo: "/logos/siemens-healthineers.svg", url: "https://www.siemens-healthineers.com/" },
  { name: "Philips Healthcare", logo: "/logos/philips.svg", url: "https://www.philips.com/healthcare" },
  { name: "Medtronic", logo: "/logos/medtronic.svg", url: "https://www.medtronic.com/" },
  { name: "NHS", logo: "/logos/nhs.svg", url: "https://www.nhs.uk/" },
  { name: "Bumrungrad", logo: "/logos/bumrungrad.svg", url: "https://www.bumrungrad.com/" },
];

export default function AboutUs() {
  const { t, lang } = useLang();
  const prefersReduced = useReducedMotion();
  const [navOpen, setNavOpen] = useState(false);

  // Close menu on hash change / section click
  useEffect(() => {
    const handler = () => setNavOpen(false);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Responsive, throttled scroll progress bar (safe-area aware)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? h.scrollTop / max : 0;
        h.style.setProperty("--scroll", String(p));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sections = ["about-hero", "mission", "what", "values", "quality", "story", "team", "faq"];
  const active = useScrollSpy(sections);

  const fadeUp = (delay = 0) => ({
    initial: prefersReduced ? false : { opacity: 0, y: 16 },
    whileInView: prefersReduced ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.5, delay },
  });

  const stats = [
    { key: "statHospitals", value: 120, suffix: "+" },
    { key: "statPatients", value: 35000, suffix: "+" },
    { key: "statDestinations", value: 20, suffix: "+" },
  ];

  const team = [
    { name: "Sara El-Shazly", role: lang === "ar" ? "المديرة التنفيذية والشريكة المؤسسة" : "CEO & Co-Founder" },
    { name: "Omar Nabil", role: lang === "ar" ? "رئيس شراكات الرعاية الطبية" : "Head of Medical Partnerships" },
    { name: "Laila Hassan", role: lang === "ar" ? "قائدة تجربة المرضى" : "Patient Experience Lead" },
  ];

  const NAV = ["about-hero","mission","what","values","quality","story","team","faq"];
  const LABELS = ["navAbout","navMission","navWhat","navValues","navQuality","navStory","navTeam","navFAQ"].map(t);

  return (
    <main className="theme-clinique min-h-screen bg-white text-slate-800 overflow-x-clip">
      {/* Top progress bar (subtle, responsive) */}
      <div className="progress fixed left-0 right-0 top-0 z-[60]">
        <div className="progress__bar" />
      </div>

      {/* Sticky in-page nav with hamburger up to lg (≤1024px) */}
      <div className="sticky top-0 z-50 border-b border-sky-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          {/* Toggle (visible below lg) */}
          <button
            className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-md border border-sky-200 text-slate-700 hover:bg-sky-50 active:scale-[0.98] transition"
            aria-label="Toggle in-page navigation"
            aria-controls="inpage-menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={navOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
            <span className="text-sm font-medium">Sections</span>
          </button>

          {/* Desktop links (≥lg) */}
          <nav className="hidden lg:flex items-center gap-3 h-12">
            {NAV.map((id, i) => (
              <a key={id} href={`#${id}`} className={`px-2.5 py-1.5 rounded-md text-sm transition ${active === id ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-sky-50"}`}>
                {LABELS[i]}
              </a>
            ))}
          </nav>
        </div>
        {/* Collapsible panel (mobile/tablet up to 1024px) */}
        <div id="inpage-menu" className={`lg:hidden overflow-hidden border-t border-sky-100 transition-[max-height,opacity] duration-300 ${navOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"}`}>
          <nav className="grid gap-1 p-3 bg-white/95 backdrop-blur">
            {NAV.map((id, i) => (
              <a key={id} href={`#${id}`} onClick={() => setNavOpen(false)} className={`px-3 py-2 rounded-md text-sm ${active === id ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-sky-50"}`}>
                {LABELS[i]}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* HERO */}
      <section id="about-hero" className="relative overflow-hidden" style={{ minHeight: "56vh" }}>
        {/* soft clinical gradient + grid */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-white" />
        <div className="absolute inset-0 -z-10 subtle-grid" />

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.p {...fadeUp(0.02)} className="text-sm font-semibold tracking-[0.18em] text-sky-700">{t("heroKicker")}</motion.p>
          <motion.h1 {...fadeUp(0.08)} className="mt-3 text-4xl md:text-5xl font-extrabold leading-[1.08] text-balance">
            <span className="text-gradient-medical">{t("heroTitle")}</span>
          </motion.h1>
          <motion.p {...fadeUp(0.16)} className="mt-4 max-w-3xl text-lg text-slate-700">{t("heroLead")}</motion.p>

          {/* Stats */}
          <motion.ul {...fadeUp(0.24)} className="mt-8 grid gap-4 sm:grid-cols-3">
            {[{ key: "statHospitals", value: 120, suffix: "+" },{ key: "statPatients", value: 35000, suffix: "+" },{ key: "statDestinations", value: 20, suffix: "+" }].map((s) => (
              <li key={s.key} className="card">
                <div className="text-3xl md:text-4xl font-extrabold text-sky-700"><NumberCounter value={s.value} />{s.suffix}</div>
                <p className="mt-1 text-slate-600">{t(s.key)}</p>
              </li>
            ))}
          </motion.ul>

          {/* Trusted by — real logos */}
          <motion.div {...fadeUp(0.32)} className="mt-10">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">{t("trustedBy")}</p>
            <div className="ticker" role="list" aria-label={t("trustedBy")}>
              <div className="ticker__track">
                {PARTNERS.map((p) => (
                  <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="logo-pill" aria-label={p.name} role="listitem">
                    <img className="logo-img" src={p.logo} alt={p.name} loading="lazy" decoding="async" draggable={false}
                      onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.parentElement)?.classList.add('logo-fallback'); }}
                    />
                    <span className="sr-only">{p.name}</span>
                  </a>
                ))}
              </div>
              <div className="ticker__track" aria-hidden>
                {PARTNERS.map((p, i) => (
                  <a key={`dup-${i}`} href={p.url} target="_blank" rel="noreferrer" className="logo-pill" aria-label={p.name}>
                    <img className="logo-img" src={p.logo} alt={p.name} loading="lazy" decoding="async" draggable={false}
                      onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.parentElement)?.classList.add('logo-fallback'); }}
                    />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="px-6 py-14 md:py-20">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2">
          <motion.article {...fadeUp(0)} className="panel">
            <h2 className="panel__title">{t("missionTitle")}</h2>
            <p className="panel__body">{t("missionBody")}</p>
          </motion.article>
          <motion.article {...fadeUp(0.08)} className="panel">
            <h3 className="panel__title">{t("visionTitle")}</h3>
            <p className="panel__body">{t("visionBody")}</p>
          </motion.article>
        </div>
      </section>

      {/* What We Do */}
      <section id="what" className="px-6 py-14 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 {...fadeUp(0)} className="section-title">{t("whatTitle")}</motion.h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🧭", tKey: "what1T", dKey: "what1D" },
              { icon: "💬", tKey: "what2T", dKey: "what2D" },
              { icon: "✈️", tKey: "what3T", dKey: "what3D" },
              { icon: "💳", tKey: "what4T", dKey: "what4D" },
              { icon: "🩺", tKey: "what5T", dKey: "what5D" },
              { icon: "🔁", tKey: "what6T", dKey: "what6D" },
            ].map((item, i) => (
              <motion.article key={item.tKey} {...fadeUp(0.02 + i * 0.04)} className="card group">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="text-2xl translate-y-[1px] group-hover:scale-110 transition">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900">{t(item.tKey)}</p>
                    <p className="mt-1 text-slate-600">{t(item.dKey)}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="values" className="px-6 py-14 md:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2 {...fadeUp(0)} className="section-title">{t("valuesTitle")}</motion.h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { tKey: "val1T", dKey: "val1D" },
              { tKey: "val2T", dKey: "val2D" },
              { tKey: "val3T", dKey: "val3D" },
            ].map((v, i) => (
              <motion.article key={v.tKey} {...fadeUp(0.03 + i * 0.05)} className="panel">
                <h3 className="font-semibold text-slate-900">{t(v.tKey)}</h3>
                <p className="mt-2 text-slate-600">{t(v.dKey)}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Quality */}
      <section id="quality" className="px-6 py-14 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 {...fadeUp(0)} className="section-title">{t("qualityTitle")}</motion.h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { tKey: "qual1T", dKey: "qual1D" },
              { tKey: "qual2T", dKey: "qual2D" },
              { tKey: "qual3T", dKey: "qual3D" },
            ].map((q, i) => (
              <motion.article key={q.tKey} {...fadeUp(0.03 + i * 0.05)} className="card">
                <h3 className="font-semibold text-slate-900">{t(q.tKey)}</h3>
                <p className="mt-2 text-slate-600">{t(q.dKey)}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="px-6 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp(0)} className="section-title">{t("storyTitle")}</motion.h2>
          <ol className="relative mt-8 border-s-2 border-sky-100 ps-6 space-y-10">
            {[
              { y: "story1Y", tKey: "story1T", dKey: "story1D" },
              { y: "story2Y", tKey: "story2T", dKey: "story2D" },
              { y: "story3Y", tKey: "story3T", dKey: "story3D" },
            ].map((e, i) => (
              <motion.li key={e.y} {...fadeUp(0.04 + i * 0.06)} className="relative">
                <span className="absolute -start-3 mt-1 h-5 w-5 rounded-full bg-sky-600 shadow-ring" />
                <p className="font-semibold text-slate-900">{t(e.y)} — {t(e.tKey)}</p>
                <p className="text-slate-600">{t(e.dKey)}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team (soft hover tilt) */}
      <section id="team" className="px-6 py-14 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 {...fadeUp(0)} className="section-title">{t("teamTitle")}</motion.h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {team.map((m, i) => (
              <motion.article
                key={m.name}
                {...fadeUp(0.04 + i * 0.05)}
                className="card tilt"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - r.left, y = e.clientY - r.top;
                  const rx = ((y / r.height) - 0.5) * -6;
                  const ry = ((x / r.width) - 0.5) * 6;
                  e.currentTarget.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
                }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)"; }}
              >
                <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-sky-50 to-white ring-1 ring-sky-100 mb-4" aria-hidden />
                <h3 className="font-semibold text-slate-900">{m.name}</h3>
                <p className="text-slate-600 text-sm">{m.role}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-14 md:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeUp(0)} className="section-title">{t("faqTitle")}</motion.h2>
          <motion.div {...fadeUp(0.06)} className="mt-8 divide-y divide-slate-200 rounded-2xl border border-sky-100 bg-white">
            {[
              { q: "faq1Q", a: "faq1A" },
              { q: "faq2Q", a: "faq2A" },
              { q: "faq3Q", a: "faq3A" },
            ].map((item, idx) => (
              <details key={idx} className="group p-5 open:bg-sky-50/40 transition">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-medium text-slate-900">{t(item.q)}</span>
                  <span className="text-sky-700 transition group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-slate-700">{t(item.a)}</p>
              </details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-14 md:pb-20">
        <motion.div {...fadeUp(0)} className="max-w-7xl mx-auto relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-6 md:p-8">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">{t("ctaTitle")}</h3>
              <p className="text-slate-700">{t("ctaLead")}</p>
            </div>
            <div className="flex gap-3">
              <a href="/contact-us" className="btn-primary">{t("ctaContact")}</a>
              <a href="https://wa.me/201234567890" target="_blank" rel="noreferrer" className="btn-outline">{t("ctaWhatsApp")}</a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Inline Footer — guaranteed render */}
      <footer className="bg-white border-t border-sky-100">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} HealthTrip. All rights reserved.</p>
          <nav className="flex gap-4 text-sm text-slate-600">
            <a href="/about-us" className="hover:text-sky-700">{t("fAbout")}</a>
            <a href="/contact-us" className="hover:text-sky-700">{t("fContact")}</a>
            <a href="/doctors" className="hover:text-sky-700">{t("fDoctors")}</a>
          </nav>
        </div>
      </footer>

      {/* Local Styles — clean clinical look + responsive progress + logos */}
      <style>{`
        .theme-clinique { --brand: 201 94% 46%; }
        .text-gradient-medical { background: linear-gradient(90deg,#0369a1,#0284c7,#0ea5e9,#0284c7); -webkit-background-clip:text; background-clip:text; color:transparent; background-size: 200% 100%; animation: textShift 12s ease-in-out infinite; }
        @keyframes textShift { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }

        .subtle-grid { background-image: linear-gradient(to right, rgba(2,132,199,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(2,132,199,.06) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(60% 60% at 50% 0%, #000 60%, transparent 100%); }

        /* Responsive, safe-area aware progress */
        .progress { height: clamp(2px, 0.6vw, 4px); pointer-events:none; top: env(safe-area-inset-top); }
        .progress__bar { width: calc(var(--scroll, 0) * 100%); height: 100%; background: linear-gradient(90deg, #38bdf8, #22d3ee); box-shadow: 0 0 12px #38bdf855; transition: width .12s linear; }
        @media (prefers-reduced-motion: reduce) { .progress__bar { transition: none; } }

        .card { border: 1px solid rgba(2,132,199,.12); background: white; border-radius: 1rem; padding: 1rem; box-shadow: 0 8px 24px rgba(2,132,199,.08); }
        .panel { border: 1px solid rgba(2,132,199,.12); background: linear-gradient(180deg, #fff, #f8fbff); border-radius: 1.25rem; padding: 1.25rem; box-shadow: 0 14px 30px rgba(2,132,199,.08); }
        .panel__title { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        .panel__body { margin-top:.75rem; color:#334155; }
        .section-title { font-weight: 900; font-size: clamp(1.6rem, 3vw, 2.2rem); color:#0f172a; }
        .shadow-ring { box-shadow: 0 0 0 6px rgba(56,189,248,.2); }

        .btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 18px; border-radius:12px; color:white; background: linear-gradient(90deg, #0ea5e9, #0284c7); box-shadow: 0 10px 26px rgba(14,165,233,.35); transition: transform .15s ease, box-shadow .2s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(14,165,233,.45); }
        .btn-outline { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 18px; border-radius:12px; color:#0369a1; border:1px solid #0284c7; background:white; transition: background .2s ease, transform .15s ease; }
        .btn-outline:hover { background:#e0f2fe; transform: translateY(-2px); }

        /* Logo ticker */
        .ticker { position:relative; overflow:hidden; border:1px solid rgba(2,132,199,.12); border-radius:14px; background: #fff; mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%); }
        .ticker__track { display:flex; gap:18px; padding:10px 12px; animation: marquee 26s linear infinite; will-change: transform; }
        @media (max-width: 640px) { .ticker__track { gap: 14px; animation-duration: 30s; } }
        .ticker:hover .ticker__track { animation-play-state: paused; }
        .logo-pill { display:inline-flex; align-items:center; gap:10px; padding:10px 16px; border-radius:9999px; background: #f8fafc; border:1px solid rgba(2,132,199,.12); box-shadow: 0 6px 18px rgba(2,132,199,.06); min-height: 44px; }
        .logo-img { height: 22px; width: auto; object-fit: contain; }
        @media (min-width: 768px) { .logo-img { height: 26px; } }
        .logo-fallback { padding: 10px 16px; font-weight: 600; color:#0369a1; }
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        html[dir="rtl"] .ticker__track { animation-direction: reverse; }

        .tilt { will-change: transform; transition: transform .25s ease; transform-style: preserve-3d; }
        .text-balance { text-wrap: balance; }
      `}</style>
    </main>
  );
}
