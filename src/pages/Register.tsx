import React, { useCallback, useMemo, useState, ChangeEvent, FormEvent, memo } from "react";

/*
  Register — Lightweight 5‑Step Wizard (TypeScript, no Framer Motion)
  • Smooth CSS-only fades (very cheap) — no backdrop-blur / heavy filters
  • Strong field validation per-step with inline errors
  • Steps:
     1) Account
     2) Personal & Medical (incl. pregnancy + medications)
     3) Vitals & Lifestyle
     4) Location & Emergency
     5) Travel Companion (relation + picture)
*/

type Gender = "male" | "female" | "other";
type Relation = "spouse" | "parent" | "child" | "friend" | "caregiver" | "other";

interface AccountStep {
  name: string;
  email: string;
  password: string;
  confirm: string;
  agree: boolean;
}
interface PersonalStep {
  gender: Gender | "";
  birthDate: string; // yyyy-mm-dd
  heightCm?: number | "";
  weightKg?: number | "";
  bloodType?: string | "";
  allergies?: string;
  conditions?: string;
  isPregnant?: boolean;
  pregnancyMonth?: number | ""; // 1..9
  medications: string[]; // free-form list
}
interface VitalsStep {
  heartRate?: number | "";
  bloodPressureSys?: number | "";
  bloodPressureDia?: number | "";
  glucose?: number | "";
  smoke?: boolean;
  alcohol?: boolean;
  exercise?: "none" | "light" | "moderate" | "vigorous";
}
interface LocationStep {
  address: string;
  country: string;
  city: string;
  emergencyName: string;
  emergencyPhone: string;
}
interface CompanionStep {
  hasCompanion: boolean;
  companionName: string;
  relation: Relation | "";
  notes?: string;
  imageFile?: File | null;
  imageUrl?: string; // preview
}

const COUNTRIES = [
  { code: "EG", name: "Egypt", cities: ["Cairo", "Alexandria", "Giza"] },
  { code: "AE", name: "United Arab Emirates", cities: ["Dubai", "Abu Dhabi", "Sharjah"] },
  { code: "TR", name: "Turkey", cities: ["Istanbul", "Ankara", "Izmir"] },
  { code: "TH", name: "Thailand", cities: ["Bangkok", "Chiang Mai", "Phuket"] },
  { code: "SG", name: "Singapore", cities: ["Singapore"] },
];

/* =============== tiny, cheap CSS animations (no heavy blur filters) =============== */
const styles = `
  @keyframes fade { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
  .fade { animation: fade .22s ease-out; }
`;

/* ============================== Small UI helpers ============================== */
function StepBadge({ i, active, done }: { i: number; active: boolean; done: boolean }) {
  const base = "w-9 h-9 grid place-items-center rounded-xl border transition-colors select-none";
  return (
    <div className={
      active
        ? `${base} bg-blue-600 text-white border-blue-600 shadow`
        : done
        ? `${base} bg-blue-50 text-blue-700 border-blue-200`
        : `${base} bg-gray-100 text-gray-400 border-gray-200`
    }>{done ? "✓" : i}</div>
  );
}
const FieldError = ({ msg }: { msg?: string }) => (msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null);
const StepCard = memo(function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="fade bg-white border border-blue-100 rounded-2xl shadow p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </section>
  );
});

const MedicationsInput = memo(function MedicationsInput({ values, onAdd, onRemove }: { values: string[]; onAdd: (val: string) => void; onRemove: (idx: number) => void }) {
  const [val, setVal] = useState("");
  const add = useCallback(() => {
    const v = val.trim();
    if (!v) return;
    onAdd(v);
    setVal("");
  }, [val, onAdd]);
  return (
    <div>
      <div className="flex gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add a medication and press +" className="flex-1 h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
        <button type="button" onClick={add} className="h-11 px-4 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">＋</button>
      </div>
      {values.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {values.map((m, i) => (
            <li key={`${m}-${i}`} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-100 flex items-center gap-1">
              <span>{m}</span>
              <button type="button" onClick={() => onRemove(i)} className="text-blue-700/70 hover:text-blue-900">×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

/* ================================== Page ================================== */
export default function Register(): JSX.Element {
  const [step, setStep] = useState<number>(1);

  // state buckets
  const [account, setAccount] = useState<AccountStep>({ name: "", email: "", password: "", confirm: "", agree: false });
  const [personal, setPersonal] = useState<PersonalStep>({ gender: "", birthDate: "", heightCm: "", weightKg: "", bloodType: "", allergies: "", conditions: "", isPregnant: false, pregnancyMonth: "", medications: [] });
  const [vitals, setVitals] = useState<VitalsStep>({ heartRate: "", bloodPressureSys: "", bloodPressureDia: "", glucose: "", smoke: false, alcohol: false, exercise: "none" });
  const [loc, setLoc] = useState<LocationStep>({ address: "", country: "", city: "", emergencyName: "", emergencyPhone: "" });
  const [comp, setComp] = useState<CompanionStep>({ hasCompanion: false, companionName: "", relation: "", notes: "", imageFile: null, imageUrl: undefined });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const cityOptions = useMemo(() => COUNTRIES.find((c) => c.name === loc.country)?.cities ?? [], [loc.country]);

  const validate = useCallback((current: number): boolean => {
    const e: Record<string, string> = {};
    if (current === 1) {
      if (!account.name.trim()) e.name = "Please enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) e.email = "Enter a valid email.";
      if (account.password.length < 6) e.password = "Password must be at least 6 characters.";
      if (account.password !== account.confirm) e.confirm = "Passwords do not match.";
      if (!account.agree) e.agree = "You must agree to the Terms.";
    }
    if (current === 2) {
      if (!personal.gender) e.gender = "Select your gender.";
      if (!personal.birthDate) e.birthDate = "Select your birth date.";
      if (personal.gender === "female" && personal.isPregnant && (!personal.pregnancyMonth || Number(personal.pregnancyMonth) < 1 || Number(personal.pregnancyMonth) > 9)) {
        e.pregnancyMonth = "Enter a month between 1 and 9.";
      }
    }
    if (current === 3) {
      if (vitals.heartRate && Number(vitals.heartRate) <= 0) e.heartRate = "Heart rate must be positive.";
      if ((vitals.bloodPressureSys && Number(vitals.bloodPressureSys) <= 0) || (vitals.bloodPressureDia && Number(vitals.bloodPressureDia) <= 0)) e.bp = "Blood pressure values must be positive.";
    }
    if (current === 4) {
      if (!loc.address.trim()) e.address = "Address is required.";
      if (!loc.country) e.country = "Choose a country.";
      if (!loc.city) e.city = "Choose a city.";
      if (!loc.emergencyName.trim()) e.emergencyName = "Emergency contact name required.";
      if (!/^[+\d][\d\s-]{6,}$/.test(loc.emergencyPhone)) e.emergencyPhone = "Enter a valid phone.";
    }
    if (current === 5 && comp.hasCompanion) {
      if (!comp.companionName.trim()) e.companionName = "Companion name is required.";
      if (!comp.relation) e.relation = "Select a relation.";
      // image optional
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [account, personal, vitals, loc, comp]);

  const next = useCallback(() => { if (validate(step)) setStep((s) => Math.min(5, s + 1)); }, [step, validate]);
  const back = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate(5)) { setStep(5); return; }
    const payload = {
      account: { name: account.name, email: account.email },
      personal, vitals, location: loc,
      companion: comp.hasCompanion ? { name: comp.companionName, relation: comp.relation, notes: comp.notes, hasImage: !!comp.imageFile } : null,
    };
    console.log("Register payload", payload);
    alert("Registration submitted! Check console for payload.");
  };

  const handleMedicationAdd = useCallback((val: string) => {
    const v = val.trim(); if (!v) return;
    setPersonal((p) => ({ ...p, medications: [...p.medications, v] }));
  }, []);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErrors((er) => ({ ...er, image: "Please upload an image file." })); return; }
    const url = URL.createObjectURL(file);
    setComp((c) => ({ ...c, imageFile: file, imageUrl: url }));
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white to-[#f6fbff]">
      <style>{styles}</style>

      <form onSubmit={onSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Header + Stepper */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <StepBadge key={i} i={i + 1} active={step === i + 1} done={step > i + 1} />
          ))}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center text-gray-900">Create your account</h1>
        <p className="text-center text-gray-600 mt-2">Step {step} of 5</p>

        <div className="mt-6 grid gap-5">
          {step === 1 && (
            <StepCard title="Account basics">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700" htmlFor="name">Full name</label>
                  <input id="name" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
                  <FieldError msg={errors.name} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="email">Email</label>
                  <input id="email" type="email" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="password">Password</label>
                  <input id="password" type="password" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
                  <FieldError msg={errors.password} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="confirm">Confirm password</label>
                  <input id="confirm" type="password" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={account.confirm} onChange={(e) => setAccount({ ...account, confirm: e.target.value })} />
                  <FieldError msg={errors.confirm} />
                </div>
              </div>
              <label className="mt-3 flex gap-2 items-center text-sm text-gray-700">
                <input type="checkbox" checked={account.agree} onChange={(e) => setAccount({ ...account, agree: e.target.checked })} />
                I agree to the Terms and Privacy Policy
              </label>
              <FieldError msg={errors.agree} />
            </StepCard>
          )}

          {step === 2 && (
            <StepCard title="Personal & medical">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700" htmlFor="gender">Gender</label>
                  <select id="gender" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={personal.gender} onChange={(e) => setPersonal({ ...personal, gender: e.target.value as Gender })}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <FieldError msg={errors.gender} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="dob">Birth date</label>
                  <input id="dob" type="date" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={personal.birthDate} onChange={(e) => setPersonal({ ...personal, birthDate: e.target.value })} />
                  <FieldError msg={errors.birthDate} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="height">Height (cm)</label>
                  <input id="height" type="number" min={0} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={personal.heightCm} onChange={(e) => setPersonal({ ...personal, heightCm: Number(e.target.value) || "" })} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="weight">Weight (kg)</label>
                  <input id="weight" type="number" min={0} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={personal.weightKg} onChange={(e) => setPersonal({ ...personal, weightKg: Number(e.target.value) || "" })} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="blood">Blood type</label>
                  <select id="blood" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={personal.bloodType} onChange={(e) => setPersonal({ ...personal, bloodType: e.target.value })}>
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="allergies">Allergies</label>
                  <input id="allergies" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={personal.allergies} onChange={(e) => setPersonal({ ...personal, allergies: e.target.value })} />
                </div>
              </div>

              {personal.gender === "female" && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <label className="flex items-center gap-2 text-sm text-orange-800">
                    <input type="checkbox" checked={!!personal.isPregnant} onChange={(e) => setPersonal({ ...personal, isPregnant: e.target.checked })} />
                    Currently pregnant
                  </label>
                  {personal.isPregnant && (
                    <div className="mt-2 grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-700" htmlFor="pregMonth">Pregnancy month (1–9)</label>
                        <input id="pregMonth" type="number" min={1} max={9} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={personal.pregnancyMonth} onChange={(e) => setPersonal({ ...personal, pregnancyMonth: Number(e.target.value) || "" })} />
                        <FieldError msg={errors.pregnancyMonth} />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700" htmlFor="conditions">Conditions</label>
                        <input id="conditions" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={personal.conditions} onChange={(e) => setPersonal({ ...personal, conditions: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <label className="text-sm text-gray-700">Medications</label>
                <MedicationsInput values={personal.medications} onAdd={handleMedicationAdd} onRemove={(i) => setPersonal((p) => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }))} />
              </div>
            </StepCard>
          )}

          {step === 3 && (
            <StepCard title="Vitals & lifestyle">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-700" htmlFor="hr">Heart rate (bpm)</label>
                  <input id="hr" type="number" min={0} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={vitals.heartRate} onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) || "" })} />
                  <FieldError msg={errors.heartRate} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="bps">Blood pressure – systolic</label>
                  <input id="bps" type="number" min={0} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={vitals.bloodPressureSys} onChange={(e) => setVitals({ ...vitals, bloodPressureSys: Number(e.target.value) || "" })} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="bpd">Blood pressure – diastolic</label>
                  <input id="bpd" type="number" min={0} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={vitals.bloodPressureDia} onChange={(e) => setVitals({ ...vitals, bloodPressureDia: Number(e.target.value) || "" })} />
                  <FieldError msg={errors.bp} />
                </div>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="glu">Glucose (mg/dL)</label>
                  <input id="glu" type="number" min={0} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={vitals.glucose} onChange={(e) => setVitals({ ...vitals, glucose: Number(e.target.value) || "" })} />
                </div>
              </div>
              <div className="mt-3 grid sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={!!vitals.smoke} onChange={(e) => setVitals({ ...vitals, smoke: e.target.checked })} /> Smokes</label>
                <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={!!vitals.alcohol} onChange={(e) => setVitals({ ...vitals, alcohol: e.target.checked })} /> Drinks alcohol</label>
                <div>
                  <label className="text-sm text-gray-700" htmlFor="ex">Exercise</label>
                  <select id="ex" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={vitals.exercise} onChange={(e) => setVitals({ ...vitals, exercise: e.target.value as VitalsStep["exercise"] })}>
                    <option value="none">None</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="vigorous">Vigorous</option>
                  </select>
                </div>
              </div>
            </StepCard>
          )}

          {step === 4 && (
            <StepCard title="Location & emergency">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="addr" className="text-sm text-gray-700">Address</label>
                  <input id="addr" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={loc.address} onChange={(e) => setLoc({ ...loc, address: e.target.value })} />
                  <FieldError msg={errors.address} />
                </div>
                <div>
                  <label htmlFor="country" className="text-sm text-gray-700">Country</label>
                  <select id="country" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={loc.country} onChange={(e) => setLoc({ ...loc, country: e.target.value, city: "" })}>
                    <option value="">Select</option>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                  </select>
                  <FieldError msg={errors.country} />
                </div>
                <div>
                  <label htmlFor="city" className="text-sm text-gray-700">City</label>
                  <select id="city" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={loc.city} onChange={(e) => setLoc({ ...loc, city: e.target.value })}>
                    <option value="">Select</option>
                    {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <label htmlFor="ename" className="text-sm text-gray-700">Emergency name</label>
                  <input id="ename" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={loc.emergencyName} onChange={(e) => setLoc({ ...loc, emergencyName: e.target.value })} />
                  <FieldError msg={errors.emergencyName} />
                </div>
                <div>
                  <label htmlFor="ephone" className="text-sm text-gray-700">Emergency phone</label>
                  <input id="ephone" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={loc.emergencyPhone} onChange={(e) => setLoc({ ...loc, emergencyPhone: e.target.value })} />
                  <FieldError msg={errors.emergencyPhone} />
                </div>
              </div>
            </StepCard>
          )}

          {step === 5 && (
            <StepCard title="Travel companion">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={comp.hasCompanion} onChange={(e) => setComp({ ...comp, hasCompanion: e.target.checked })} />
                Someone will accompany me
              </label>

              {comp.hasCompanion && (
                <div className="mt-3 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700" htmlFor="cname">Companion full name</label>
                    <input id="cname" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={comp.companionName} onChange={(e) => setComp({ ...comp, companionName: e.target.value })} />
                    <FieldError msg={errors.companionName} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700" htmlFor="rel">Relation</label>
                    <select id="rel" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={comp.relation} onChange={(e) => setComp({ ...comp, relation: e.target.value as Relation })}>
                      <option value="">Select</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="caregiver">Caregiver</option>
                      <option value="other">Other</option>
                    </select>
                    <FieldError msg={errors.relation} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700" htmlFor="cnotes">Notes (optional)</label>
                    <input id="cnotes" className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400" value={comp.notes ?? ""} onChange={(e) => setComp({ ...comp, notes: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700" htmlFor="cimg">Companion picture (optional)</label>
                    <div className="mt-1 flex items-center gap-3">
                      <input id="cimg" type="file" accept="image/*" onChange={onFile} />
                      {comp.imageUrl && (
                        <img src={comp.imageUrl} alt="Companion preview" className="w-20 h-20 object-cover rounded-lg border" />
                      )}
                      {errors.image && <span className="text-sm text-red-600">{errors.image}</span>}
                    </div>
                  </div>
                </div>
              )}
            </StepCard>
          )}
        </div>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={back} disabled={step === 1} className="h-11 px-5 rounded-lg border border-blue-200 text-blue-700 disabled:opacity-40">Back</button>
          {step < 5 ? (
            <button type="button" onClick={next} className="h-11 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Continue</button>
          ) : (
            <button type="submit" className="h-11 px-6 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Submit</button>
          )}
        </div>
      </form>

      {/* tiny footer */}
      <footer className="border-t bg-white/70 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-gray-600">
          <span>© {new Date().getFullYear()} HealthTrip. All rights reserved.</span>
          <a href="/privacy" className="hover:text-blue-700">Privacy</a>
        </div>
      </footer>
    </main>
  );
}
