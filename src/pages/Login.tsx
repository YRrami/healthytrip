import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ==============================================
// Login — lightweight, creative, RTL-aware
//  • No heavy animation libs; pure CSS + prefers-reduced-motion
//  • i18n (EN/AR) via document.documentElement.lang
//  • Subtle animated background, glass card, password toggle
//  • Basic validation + error messages, loading state
// ==============================================

type Lang = "en" | "ar";
const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    title: "Welcome back",
    lead: "Log in to continue your HealthTrip journey.",
    email: "Email",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    login: "Login",
    or: "or",
    google: "Continue with Google",
    noAccount: "Don't have an account?",
    register: "Register",
    emailRequired: "Enter a valid email.",
    passRequired: "Password must be at least 6 characters.",
  },
  ar: {
    title: "مرحبًا بعودتك",
    lead: "سجّل الدخول لمتابعة رحلتك مع هيلث تريب.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    remember: "تذكرني",
    forgot: "هل نسيت كلمة المرور؟",
    login: "تسجيل الدخول",
    or: "أو",
    google: "المتابعة عبر جوجل",
    noAccount: "ليس لديك حساب؟",
    register: "إنشاء حساب",
    emailRequired: "أدخل بريدًا إلكترونيًا صالحًا.",
    passRequired: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
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

export default function Login() {
  const lang = useDocLang();
  const t = (k: keyof typeof STRINGS.en) => STRINGS[lang][k] ?? (k as string);
  const isRTL = lang === "ar"; // dir should already be set globally, but keep a flag for minor tweaks

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) e.email = t("emailRequired");
    if (password.length < 6) e.password = t("passRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Replace with real API call
      await new Promise((r) => setTimeout(r, 800));
      console.log("LOGIN:", { email, remember });
      // navigate to dashboard etc.
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-64px)] bg-white">
      {/* Animated background (CSS only, respects reduced motion) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        <div className="login-mesh m-[-20%] w-[140%] h-[140%]" />
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-200/30 blur-3xl motion-safe:animate-[blobMove_22s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -right-24 w-[26rem] h-[26rem] rounded-full bg-cyan-200/30 blur-3xl motion-safe:animate-[blobMove_28s_ease-in-out_infinite_reverse]" />
        <style>{`
          .login-mesh{
            background:
              radial-gradient(40% 35% at 20% 20%, rgba(59,130,246,0.16), transparent 60%),
              radial-gradient(35% 35% at 80% 30%, rgba(14,165,233,0.14), transparent 65%),
              radial-gradient(45% 45% at 40% 80%, rgba(99,102,241,0.12), transparent 60%),
              linear-gradient(180deg, #ffffff 0%, #f6fbff 100%);
            filter: blur(8px);
          }
          @keyframes blobMove{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-1.5%,1%,0)}100%{transform:translate3d(0,0,0)}}
        `}</style>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: intro */}
        <section className="order-2 lg:order-1 text-center lg:text-start">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="mt-3 md:mt-5 text-gray-600 max-w-xl mx-auto lg:mx-0">{t("lead")}</p>

          {/* Mini features */}
          <ul className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start text-sm">
            <li className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">🔒 Secure</li>
            <li className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">⚡ Fast</li>
            <li className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">🌍 EN/AR</li>
          </ul>
        </section>

        {/* Right: card */}
        <section className="order-1 lg:order-2">
          <form onSubmit={onSubmit} noValidate className="relative bg-white/80 backdrop-blur border border-blue-100 rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-md mx-auto">
            {/* Decorative corners */}
            <div className="pointer-events-none absolute -z-10 -top-10 -right-10 w-24 h-24 rounded-full bg-blue-200/30 blur-2xl" />
            <div className="pointer-events-none absolute -z-10 -bottom-10 -left-10 w-24 h-24 rounded-full bg-cyan-200/30 blur-2xl" />

            <div className="grid gap-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm text-gray-700">{t("email")}</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full h-11 px-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50"
                    placeholder={lang === "ar" ? "name@example.com" : "name@example.com"}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-err" : undefined}
                  />
                  <span className={`absolute inset-y-0 ${isRTL ? "left-3" : "right-3"} grid place-items-center pointer-events-none text-gray-400`}>✉️</span>
                </div>
                {errors.email && <p id="email-err" className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm text-gray-700">{t("password")}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full h-11 pl-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-gray-50"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "pass-err" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className={`absolute inset-y-0 ${isRTL ? "left-2" : "right-2"} my-auto h-9 px-2 rounded-md text-gray-500 hover:bg-gray-100 active:scale-95`}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <p id="pass-err" className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Row */}
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  {t("remember")}
                </label>
                <Link to="/forgot" className="text-blue-700 hover:text-blue-900">{t("forgot")}</Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <span className="relative z-10">{loading ? "…" : t("login")}</span>
                {/* sheen */}
                <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-white/30" />
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-1">
                <div className="h-px bg-gray-200" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-2 text-xs text-gray-500">{t("or")}</span>
              </div>

              {/* Social */}
              <button type="button" className="h-11 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2">
                <span className="text-xl">🟦</span>
                <span>{t("google")}</span>
              </button>

              {/* Footer row */}
              <p className="text-center text-sm text-gray-600 mt-1">
                {t("noAccount")} {" "}
                <Link to="/register" className="text-blue-700 hover:text-blue-900 font-medium">{t("register")}</Link>
              </p>
            </div>
          </form>
        </section>
      </div>

      {/* Tiny footer */}
      <footer className="border-t bg-white/70 backdrop-blur py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-gray-600">
          <span>© {new Date().getFullYear()} HealthTrip. All rights reserved.</span>
          <nav className="flex gap-4">
            <Link to="/about-us" className="hover:text-blue-700">About</Link>
            <Link to="/contact-us" className="hover:text-blue-700">Contact</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
