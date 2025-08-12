// src/pages/AboutUs.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

/* =============================== i18n =============================== */
type Lang = "en" | "ar";

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    title: "About Us",
    lead:
      "We connect patients to top hospitals and internationally trained specialists. Transparent choices, concierge support, and end-to-end planning—so you focus on getting better.",
    statsHospitals: "Partner Hospitals",
    statsPatients: "Patients Guided",
    statsDestinations: "Destinations",
    valuesTitle: "Our Values",
    v1T: "Patient-first",
    v1D: "Your safety, comfort, and outcomes guide every decision we make.",
    v2T: "Transparency",
    v2D: "Clear options and upfront pricing—no surprises.",
    v3T: "Excellence",
    v3D: "We partner with accredited hospitals and leading specialists only.",
    missionTitle: "Our Mission",
    missionBody:
      "Make cross-border healthcare simple, safe, and financially predictable for every patient.",
    timelineTitle: "How We Work",
    t1T: "Understand your case",
    t1D: "Share reports or describe symptoms, goals, and preferred dates.",
    t2T: "Match & quote",
    t2D: "Within 24–48 hours we send treatment options and transparent quotes.",
    t3T: "Confirm & prepare",
    t3D: "We secure appointments, letters, and visa support if needed.",
    t4T: "Travel & treatment",
    t4D: "Airport pickup, translation, and on-ground coordination.",
    t5T: "Aftercare",
    t5D: "Remote follow-ups and a dedicated point of contact.",
    certsTitle: "Accreditations & Partners",
    faqTitle: "Frequently Asked Questions",
    f1Q: "How fast do I get options and a price?",
    f1A: "Typically within 24–48 hours after you share your case details.",
    f2Q: "Do you help with visas and travel?",
    f2A: "Yes. We provide invitation letters and concierge support end-to-end.",
    f3Q: "Are hospitals accredited?",
    f3A: "We prioritize JCI/ISO-accredited centers and verified specialists.",
    ctaTitle: "Ready to begin?",
    ctaLead: "Tell us about your case and we’ll guide you step-by-step.",
    ctaBtn: "Contact us",
    footerAbout: "About",
    footerContact: "Contact",
    footerDoctors: "Doctors",
    rights: "All rights reserved.",
  },
  ar: {
    title: "من نحن",
    lead:
      "نربط المرضى بأفضل المستشفيات والمتخصصين ذوي التدريب الدولي. خيارات شفافة ودعم كونسيرج وتخطيط شامل—لتُركّز على التعافي.",
    statsHospitals: "مستشفيات شريكة",
    statsPatients: "مرضى تمت خدمتهم",
    statsDestinations: "وجهات",
    valuesTitle: "قيمنا",
    v1T: "المريض أولاً",
    v1D: "سلامتك وراحتك ونتائجك هي ما يوجّه كل قراراتنا.",
    v2T: "الشفافية",
    v2D: "خيارات واضحة وتسعير مُسبق بلا مفاجآت.",
    v3T: "التميّز",
    v3D: "نتعامل فقط مع مستشفيات معتمدة ومتخصصين موثوقين.",
    missionTitle: "رسالتنا",
    missionBody:
      "جعل الرعاية الصحية عبر الحدود بسيطة وآمنة ويمكن التنبؤ بتكلفتها لكل مريض.",
    timelineTitle: "آلية عملنا",
    t1T: "فهم حالتك",
    t1D: "أرسل التقارير أو صف الأعراض والأهداف والتواريخ المفضلة.",
    t2T: "التطابق والتسعير",
    t2D: "خلال 24–48 ساعة نرسل الخيارات والتكلفة بشفافية.",
    t3T: "التأكيد والتجهيز",
    t3D: "نثبّت المواعيد وخطابات الدعوة وندعم إجراءات التأشيرة.",
    t4T: "السفر والعلاج",
    t4D: "استقبال من المطار، ترجمة، ومنسق رعاية على الأرض.",
    t5T: "الرعاية اللاحقة",
    t5D: "متابعات عن بُعد ونقطة اتصال مخصصة لك.",
    certsTitle: "الاعتمادات والشركاء",
    faqTitle: "الأسئلة الشائعة",
    f1Q: "متى سأحصل على الخيارات والتسعير؟",
    f1A: "عادة خلال 24–48 ساعة بعد مشاركة تفاصيل الحالة.",
    f2Q: "هل تساعدون في التأشيرة والسفر؟",
    f2A: "نعم، نوفر خطابات الدعوة ودعم كونسيرج كامل.",
    f3Q: "هل المستشفيات معتمدة؟",
    f3A: "نُعطي الأولوية لمراكز معتمدة من JCI/ISO ومتخصصين موثوقين.",
    ctaTitle: "جاهز للبدء؟",
    ctaLead: "شاركنا حالتك وسنرشدك خطوة-بخطوة.",
    ctaBtn: "اتصل بنا",
    footerAbout: "من نحن",
    footerContact: "اتصل بنا",
    footerDoctors: "الأطباء",
    rights: "جميع الحقوق محفوظة.",
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
  return useMemo(() => {
    const pack = STRINGS[lang];
    return (k: keyof typeof pack) => pack[k] ?? (k as string);
  }, [lang]);
}

/* ============================ tiny helpers ============================ */
function NumberCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf = 0;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setN(Math.floor(value * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n.toLocaleString()}</>;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-blue-100 rounded-2xl shadow p-6 ${className ?? ""}`}>{children}</div>
);

/* ========================= creative backdrops ========================= */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MeshBackdrop: React.FC = () => {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="mesh m-[-20%] w-[140%] h-[140%]" />
      <style>{`
        .mesh {
          background:
            radial-gradient(40% 35% at 20% 20%, rgba(59,130,246,0.18), transparent 60%),
            radial-gradient(35% 35% at 80% 30%, rgba(14,165,233,0.16), transparent 65%),
            radial-gradient(45% 45% at 40% 80%, rgba(99,102,241,0.14), transparent 60%),
            radial-gradient(30% 40% at 75% 80%, rgba(20,184,166,0.16), transparent 65%),
            linear-gradient(180deg, #ffffff 0%, #f6fbff 100%);
          filter: blur(10px);
          ${reduced ? "" : "animation: meshShift 24s ease-in-out infinite alternate;"}
          transform: translate3d(0,0,0);
        }
        @keyframes meshShift {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-2%, -1.5%, 0) scale(1.02); }
          100% { transform: translate3d(1.5%, 1%, 0) scale(1.01); }
        }
      `}</style>
    </div>
  );
};

const OrbsBackdrop: React.FC = () => {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <style>{`
        .orb { position:absolute; width: 360px; height: 360px; border-radius: 9999px;
          background: radial-gradient(circle at 30% 30%, rgba(59,130,246,0.18), rgba(59,130,246,0.05));
          mix-blend-mode: multiply; filter: blur(6px); }
        .orb-a { top: -60px; left: -60px; ${reduced ? "" : "animation: floatA 14s ease-in-out infinite;"} }
        .orb-b { right: -80px; top: 20%; background: radial-gradient(circle at 30% 30%, rgba(14,165,233,0.16), rgba(14,165,233,0.05)); ${reduced ? "" : "animation: floatB 16s ease-in-out infinite;"} }
        .orb-c { left: 10%; bottom: -120px; background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.16), rgba(99,102,241,0.05)); ${reduced ? "" : "animation: floatC 18s ease-in-out infinite;"} }
        @keyframes floatA { 0%{ transform: translateY(0) } 50%{ transform: translateY(-12px) } 100%{ transform: translateY(0)} }
        @keyframes floatB { 0%{ transform: translateY(0) } 50%{ transform: translateY(-9px) } 100%{ transform: translateY(0)} }
        @keyframes floatC { 0%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } 100%{ transform: translateY(0)} }
      `}</style>
    </div>
  );
};

const GridBackdrop: React.FC = () => {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800">
        <defs>
          <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dbeafe" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="url(#p)" className={`grid-pan ${reduced ? "no-pan" : ""}`} />
      </svg>
      <style>{`
        .grid-pan { transform: translate3d(0,0,0); ${reduced ? "" : "animation: panSlow 28s ease-in-out infinite;"} opacity:.6 }
        .no-pan { animation: none !important; }
        @keyframes panSlow {
          0% { transform: translate3d(0,0,0); opacity: 0.55; }
          50% { transform: translate3d(-1.2%, -0.8%, 0); opacity: 0.7; }
          100% { transform: translate3d(0,0,0); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
};

const SparklesLayer: React.FC<{ count?: number; seed?: number; className?: string }> = ({
  count = 64,
  seed = 2025,
  className = "",
}) => {
  const reduced = useReducedMotion();
  const pts = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }).map(() => ({
      x: Math.floor(rng() * 100),
      y: Math.floor(rng() * 100),
      d: 5 + Math.floor(rng() * 8),
    }));
  }, [count, seed]);
  return (
    <div className={`absolute inset-0 -z-10 pointer-events-none ${className}`} aria-hidden>
      {pts.map((p, i) => (
        <span
          key={i}
          className="sparkle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.d}px`,
            height: `${p.d}px`,
            animationDuration: `${6 + (i % 5)}s`,
          }}
        />
      ))}
      <style>{`
        .sparkle {
          position: absolute; border-radius: 9999px;
          background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.0) 60%);
          box-shadow: 0 0 12px rgba(147,197,253,0.75), 0 0 24px rgba(59,130,246,0.35);
          transform: translateZ(0);
          ${reduced ? "" : "animation-name: twinkle, drift;"}
          animation-timing-function: ease-in-out, ease-in-out;
          animation-iteration-count: infinite, infinite;
          animation-direction: alternate, alternate;
        }
        @keyframes twinkle { from { opacity: .35; } to { opacity: 1; } }
        @keyframes drift { from { transform: translate3d(-4px,-2px,0) scale(1); } to { transform: translate3d(4px,2px,0) scale(1.06);} }
      `}</style>
    </div>
  );
};

const ECGRibbon: React.FC = () => {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -z-10 opacity-30 pointer-events-none" aria-hidden>
      <svg viewBox="0 0 1200 140" className="w-full h-[90px]">
        <defs>
          <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <path
          d="
          M0,70 L90,70 100,70 110,40 120,100 130,70 220,70
          230,70 240,40 250,100 260,70 350,70
          360,70 370,45 380,95 390,70 480,70
          490,70 500,40 510,100 520,70 610,70
          620,70 630,45 640,95 650,70 740,70
          750,70 760,40 770,100 780,70 870,70
          880,70 890,45 900,95 910,70 1000,70
          1010,70 1020,40 1030,100 1040,70 1130,70
          1140,70 1150,45 1160,95 1170,70 1200,70"
          fill="none"
          stroke="url(#ecgGrad)"
          strokeWidth="3"
          className="ecg"
        />
      </svg>
      <style>{`
        .ecg {
          ${reduced ? "" : "stroke-dasharray: 12 22; animation: ecgMove 3.6s linear infinite;"}
        }
        @keyframes ecgMove {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -200; }
        }
      `}</style>
    </div>
  );
};

const MorphBlob: React.FC<{ className?: string; color?: string }> = ({
  className = "",
  color = "rgba(59,130,246,0.12)",
}) => {
  const reduced = useReducedMotion();
  return (
    <div className={`absolute ${className}`} aria-hidden>
      <div className="blob" />
      <style>{`
        .blob {
          width: 520px; height: 520px; filter: blur(10px); background: ${color};
          ${reduced ? "" : "animation: blobMorph 18s ease-in-out infinite;"} transform: translateZ(0);
        }
        @keyframes blobMorph {
          0% { border-radius: 52% 48% 41% 59% / 45% 39% 61% 55%; transform: rotate(0deg) scale(1); }
          33% { border-radius: 41% 59% 62% 38% / 43% 57% 43% 57%; transform: rotate(20deg) scale(1.03); }
          66% { border-radius: 60% 40% 35% 65% / 60% 40% 60% 40%; transform: rotate(-12deg) scale(0.98); }
          100% { border-radius: 52% 48% 41% 59% / 45% 39% 61% 55%; transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  );
};

/* =============================== page =============================== */
const AboutUs: React.FC = () => {
  const t = useT();
  const prefersReduced = useReducedMotion();

  const values = [
    { title: t("v1T"), desc: t("v1D"), icon: "❤️" },
    { title: t("v2T"), desc: t("v2D"), icon: "🔎" },
    { title: t("v3T"), desc: t("v3D"), icon: "🏆" },
  ] as const;

  const timeline = [
    { step: 1, title: t("t1T"), desc: t("t1D") },
    { step: 2, title: t("t2T"), desc: t("t2D") },
    { step: 3, title: t("t3T"), desc: t("t3D") },
    { step: 4, title: t("t4T"), desc: t("t4D") },
    { step: 5, title: t("t5T"), desc: t("t5D") },
  ] as const;

  const faqs = [
    { q: t("f1Q"), a: t("f1A") },
    { q: t("f2Q"), a: t("f2A") },
    { q: t("f3Q"), a: t("f3A") },
  ] as const;

  return (
    <main className="bg-white">
      {/* HERO — mesh, orbs, sparkles */}
      <section className="relative overflow-hidden">
        <MeshBackdrop />
        <OrbsBackdrop />
        <SparklesLayer className="opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 text-center"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-4 md:mt-6 text-gray-600 max-w-3xl mx-auto text-center text-lg"
          >
            {t("lead")}
          </motion.p>

          {/* Stats */}
          <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <Card className="text-center backdrop-blur">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600">
                <NumberCounter value={120} />+
              </div>
              <p className="text-gray-600 mt-1">{t("statsHospitals")}</p>
            </Card>
            <Card className="text-center backdrop-blur">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600">
                <NumberCounter value={35000} />+
              </div>
              <p className="text-gray-600 mt-1">{t("statsPatients")}</p>
            </Card>
            <Card className="text-center backdrop-blur">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600">
                <NumberCounter value={20} />+
              </div>
              <p className="text-gray-600 mt-1">{t("statsDestinations")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* MISSION — grid + ECG ribbon */}
      <section className="py-16 md:py-24 relative bg-gradient-to-b from-white to-[#f6fbff] overflow-hidden">
        <GridBackdrop />
        <ECGRibbon />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            <Card className="md:col-span-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{t("missionTitle")}</h2>
              <p className="text-gray-600 mt-3">{t("missionBody")}</p>
              <ul className="mt-5 space-y-2 text-gray-700">
                <li>• JCI/ISO partner hospitals</li>
                <li>• Dedicated care coordinators & medical translation</li>
                <li>• Transparent, upfront treatment packages</li>
              </ul>
            </Card>
            <Card className="flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-36 h-36 text-blue-400">
                <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M30 65 L55 85 L90 40" fill="none" stroke="currentColor" strokeWidth="6" />
              </svg>
            </Card>
          </div>
        </div>
      </section>

      {/* VALUES — orbs + sparkles */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <OrbsBackdrop />
        <SparklesLayer className="opacity-50" seed={108} count={48} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 text-center">
            {t("valuesTitle")}
          </h2>
          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <Card>
                  <div className="text-3xl mb-3" aria-hidden>
                    {v.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{v.title}</h3>
                  <p className="text-gray-600 mt-1">{v.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE — mesh backdrop */}
      <section className="py-16 md:py-24 relative bg-gradient-to-b from-[#f6fbff] to-white overflow-hidden">
        <MeshBackdrop />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 text-center">
            {t("timelineTitle")}
          </h2>
          <ol className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
            {timeline.map((s, i) => (
              <motion.li
                key={s.step}
                initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="bg-white/90 backdrop-blur border border-blue-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-gray-900">{s.title}</h3>
                </div>
                <p className="text-gray-600 mt-2 text-sm">{s.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ACCREDITATIONS — morphing blob behind logos */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <MorphBlob className="right-[-120px] top-[-120px]" color="rgba(20,184,166,0.12)" />
        <MorphBlob className="left-[-140px] bottom-[-160px]" color="rgba(99,102,241,0.10)" />
        <GridBackdrop />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 text-center">
            {t("certsTitle")}
          </h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 items-center">
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="flex items-center justify-center">
                <svg viewBox="0 0 120 40" className="w-32 h-12 text-blue-400">
                  <rect x="1" y="1" width="118" height="38" rx="6" fill="none" stroke="currentColor" />
                  <text x="60" y="25" textAnchor="middle" fontSize="10" fill="currentColor">
                    LOGO
                  </text>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs — orbs again for cohesion */}
      <section className="py-16 md:py-24 relative bg-[#f8fbfe] overflow-hidden">
        <OrbsBackdrop />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 text-center">
            {t("faqTitle")}
          </h2>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group bg-white/90 backdrop-blur border border-blue-100 rounded-xl p-4 shadow-sm">
              <summary className="list-none cursor-pointer flex items-center justify-between">
                <span className="font-medium text-gray-900">{f.q}</span>
                <span className="ml-3 text-blue-600 group-open:rotate-45 transition">＋</span>
              </summary>
              <p className="text-gray-600 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA — mesh again */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <MeshBackdrop />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">{t("ctaTitle")}</h3>
          <p className="text-gray-600 mt-3">{t("ctaLead")}</p>
          <Link
            to="/contact-us"
            className="inline-flex items-center justify-center mt-6 h-11 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            {t("ctaBtn")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} HealthTrip. {t("rights")}
          </p>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link to="/about-us" className="hover:text-blue-700">
              {t("footerAbout")}
            </Link>
            <Link to="/contact-us" className="hover:text-blue-700">
              {t("footerContact")}
            </Link>
            <Link to="/doctors" className="hover:text-blue-700">
              {t("footerDoctors")}
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
};

export default AboutUs;
