import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  Award, 
  ThumbsUp, 
  ChevronRight, 
  Activity, 
  CalendarCheck, 
  FileHeart, 
  Sparkles, 
  TrendingUp, 
  Send,
  CheckCircle,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  FileText
} from 'lucide-react';

interface HomeSectionProps {
  onBrowseDoctors: () => void;
  onBrowseDepartments: () => void;
  onBookImmediateAppointment: () => void;
  onJoinStaffReview: (role: 'patient' | 'admin') => void;
  isLoggedIn: boolean;
}

export default function HomeSection({
  onBrowseDoctors,
  onBrowseDepartments,
  onBookImmediateAppointment,
  onJoinStaffReview,
  isLoggedIn
}: HomeSectionProps) {
  
  // Interactive WHO registry trend metric selection state
  const [selectedMetricFocus, setSelectedMetricFocus] = useState<'breast' | 'prostate'>('breast');
  
  // Newsletter subscription simulation
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus("Subscribed! Thank you for joining our community cancer prevention stream.");
    setNewsletterEmail("");
    setTimeout(() => setNewsletterStatus(null), 8005);
  };

  // WHO Registry comparative dataset
  const oncologyData = {
    breast: {
      title: "Breast Neoplasm Registry Statistics",
      color: "#F4A6C1", // Brand Pink
      incidence: "2.3 Million",
      globalRatio: "11.6%",
      earlySurvival: "90%+",
      delayedSurvival: "27%",
      screeningTarget: "60 Days",
      whoTargetYear: "2040 Proj: 3.02M cases",
      chartYears: ["2012", "2018", "2022", "2044(Proj)"],
      preventativeAction: "Self-Exam Monthly & Mammography Tomosynthesis",
    },
    prostate: {
      title: "Prostate Malignancy Registry Statistics",
      color: "#ADD8E6", // Brand Blue
      incidence: "1.41 Million",
      globalRatio: "7.3%",
      earlySurvival: "98%+",
      delayedSurvival: "31%",
      screeningTarget: "90 Days",
      whoTargetYear: "2040 Proj: 2.05M cases",
      chartYears: ["2012", "2018", "2022", "2044(Proj)"],
      preventativeAction: "PSA Blood Assays & Digital Rectal Screening",
    }
  };

  const activeFocus = oncologyData[selectedMetricFocus];

  return (
    <div className="space-y-20 py-8 font-sans tracking-wide text-black">
      
      {/* 1. DYNAMIC DATA ANALYSIS HERO BANNER */}
      {/* Styled in Light Blue (#ADD8E6) and Pink (#F4A6C1) gradients on White, with 100% Black writing */}
      <section className="relative overflow-hidden rounded-3xl border border-[#ADD8E6] bg-gradient-to-br from-white via-[#ADD8E6]/10 to-[#F4A6C1]/10 px-6 py-12 text-black shadow-xl sm:px-12 sm:py-20">
        
        {/* Dynamic decorative backdrop blurs using brand colors */}
        <div className="absolute right-0 top-0 -mr-36 -mt-36 h-96 w-96 rounded-full bg-[#ADD8E6]/30 blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 -ml-36 -mb-36 h-96 w-96 rounded-full bg-[#F4A6C1]/30 blur-3xl pointer-events-none"></div>
        
        <div className="relative mx-auto max-w-7xl grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Descriptive Title & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#F4A6C1] px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-black">
              <Activity className="h-3.5 w-3.5 text-[#F4A6C1] animate-pulse" />
              WHO Screening Protocol V3.5
            </div>
            
            <h1 className="font-sans text-3xl sm:text-5xl font-black tracking-tight leading-none text-black">
              Interactive Cancer <br />
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-black to-[#000000]">
                Metrics & Diagnostic Registry
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm leading-relaxed text-black font-semibold max-w-xl">
              Accredited with World Health Organization Global Targets. Explore comparative, evidence-based biopsy analytics, clinical tomosynthesis tracking, and digital PSA risk mapping tools. Hover over the graphical gauges to analyze survival differentials.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={onBookImmediateAppointment}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] px-6 py-3.5 font-sans text-xs font-black text-black hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer uppercase tracking-wider border border-black"
                id="hero_book_now_btn"
              >
                <CalendarCheck className="h-4.5 w-4.5 text-black" />
                Schedule Screening
              </button>
              
              <button
                onClick={onBrowseDoctors}
                className="inline-flex items-center gap-1.5 rounded-xl border border-black bg-white hover:bg-[#ADD8E6]/40 px-6 py-3.5 font-sans text-xs font-black text-black transition-all hover:scale-105 cursor-pointer shadow-xs"
                id="hero_meet_docs_btn"
              >
                Meet Oncologists
                <ChevronRight className="h-4.5 w-4.5 text-black" />
              </button>
            </div>

            {/* Micro WHO Indicator */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#ADD8E6]/40 max-w-md">
              <div className="h-2 w-2 rounded-full bg-[#F4A6C1] animate-ping"></div>
              <span className="font-mono text-[9px] font-black text-black uppercase tracking-widest">
                Pink-Ribbon Breast Action • Blue-Ribbon Prostate Care
              </span>
            </div>
          </div>

          {/* Right Column: INTERACTIVE DATA ANALYSIS GRAPHICS & WHO METRICS PANEL */}
          {/* Featuring Hover Effects, Charts, Comparative Data */}
          <div className="lg:col-span-6 rounded-2xl border border-[#ADD8E6] bg-white p-6 shadow-2xl relative space-y-6">
            
            {/* Controller toggle buttons */}
            <div className="flex items-center justify-between border-b border-[#ADD8E6]/40 pb-4">
              <span className="font-sans text-[11px] font-black uppercase tracking-wider text-black">
                Data Focus Switcher
              </span>
              <div className="inline-flex rounded-xl bg-[#ADD8E6]/25 p-1 border border-[#ADD8E6]">
                <button
                  onClick={() => setSelectedMetricFocus('breast')}
                  className={`rounded-lg px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-wide transition-all duration-155 cursor-pointer ${
                    selectedMetricFocus === 'breast'
                      ? "bg-[#F4A6C1] text-black border border-black"
                      : "text-black hover:bg-white/50"
                  }`}
                >
                  🎗️ Breast {selectedMetricFocus === 'breast' && "●"}
                </button>
                <button
                  onClick={() => setSelectedMetricFocus('prostate')}
                  className={`rounded-lg px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-wide transition-all duration-155 cursor-pointer ${
                    selectedMetricFocus === 'prostate'
                      ? "bg-[#ADD8E6] text-black border border-black"
                      : "text-black hover:bg-white/50"
                  }`}
                >
                  🩺 Prostate {selectedMetricFocus === 'prostate' && "●"}
                </button>
              </div>
            </div>

            {/* Dynamic Card Container with Hover effects */}
            <div 
              className="space-y-4 p-4 rounded-xl border bg-gradient-to-tr from-white to-[#ADD8E6]/10 hover:to-[#F4A6C1]/20 hover:shadow-md transition-all duration-300 relative border-[#ADD8E6]"
              style={{ borderColor: activeFocus.color }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-xs font-black uppercase tracking-wider text-black">
                  {activeFocus.title}
                </h3>
                <span className="rounded bg-[#F4A6C1]/20 px-2 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-black border border-[#F4A6C1]/40">
                  WHO 2022 dataset
                </span>
              </div>

              {/* Data analysis grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Metric 1 with hover scaling */}
                <div className="p-3 bg-white border border-[#ADD8E6]/30 rounded-xl transition duration-150 hover:scale-105">
                  <span className="font-mono text-[8px] uppercase font-black text-black block tracking-wider">Annual New Cases</span>
                  <span className="font-sans text-xl font-black text-black block mt-1 tracking-tight">
                    {activeFocus.incidence}
                  </span>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        backgroundColor: activeFocus.color, 
                        width: selectedMetricFocus === 'breast' ? '85%' : '65%' 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Metric 2 with hover scaling */}
                <div className="p-3 bg-white border border-[#ADD8E6]/30 rounded-xl transition duration-150 hover:scale-105">
                  <span className="font-mono text-[8px] uppercase font-black text-black block tracking-wider">Early Stage Survival</span>
                  <span className="font-sans text-xl font-black block mt-1 tracking-tight text-black">
                    {activeFocus.earlySurvival}
                  </span>
                  <span className="text-[9px] text-black font-black block mt-1">vs {activeFocus.delayedSurvival} for late staging</span>
                </div>

              </div>

              {/* Live Analytical SVG Graphic/Chart tracing rise up to 2040 and prevention curve */}
              <div className="h-28 w-full bg-white border border-[#ADD8E6] rounded-xl p-3 relative flex flex-col justify-between">
                <span className="font-mono text-[8px] font-black uppercase tracking-wider text-black block border-b border-[#ADD8E6]/35 pb-1">
                  WHO Growth & Target Projection Waveform (2012 - 2040)
                </span>
                
                {/* SVG Curve Graphics */}
                <div className="flex-1 w-full relative h-full mt-2">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 30" fill="none">
                    <line x1="0" y1="10" x2="100" y2="10" stroke="#ADD8E6" strokeWidth="0.25" strokeDasharray="1,1" />
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#ADD8E6" strokeWidth="0.25" strokeDasharray="1,1" />
                    
                    {/* Standard curve */}
                    <path 
                      d={`M 10,25 Q 35,${selectedMetricFocus === 'breast' ? '18' : '22'} 65,${selectedMetricFocus === 'breast' ? '12' : '15'} T 95,${selectedMetricFocus === 'breast' ? '6' : '9'}`} 
                      stroke="#000000" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />

                    {/* Projections */}
                    <path 
                      d={`M 65,${selectedMetricFocus === 'breast' ? '12' : '15'} Q 80,18 95,24`} 
                      stroke="#000000" 
                      strokeWidth="1.5" 
                      strokeDasharray="2,2" 
                      strokeLinecap="round"
                    />

                    <circle cx="10" cy="25" r="1.5" fill="#000000" />
                    <circle cx="65" cy={selectedMetricFocus === 'breast' ? '12' : '15'} r="1.5" fill="#000000" />
                    <circle cx="95" cy={selectedMetricFocus === 'breast' ? '6' : '9'} r="2" fill="#F4A6C1" />
                    <circle cx="95" cy="24" r="2" fill="#ADD8E6" />
                  </svg>

                  {/* Axis labels inside SVG area */}
                  <div className="absolute inset-x-0 bottom-0 top-0 flex justify-between items-end pointer-events-none px-2">
                    {activeFocus.chartYears.map((yr, idx) => (
                      <span key={idx} className="font-mono text-[7px] font-black text-black">
                        {yr}
                      </span>
                    ))}
                  </div>

                  {/* Interactive Dynamic Hover overlay */}
                  <div className="absolute top-1.5 right-1.5 flex flex-col items-end pointer-events-none">
                    <span className="font-mono text-[6.5px] font-black text-black bg-[#F4A6C1] px-1.5 py-0.5 border border-black rounded shadow-xxs">
                      ▲ Critical Growth Gap
                    </span>
                    <span className="font-mono text-[6.5px] font-black text-black bg-[#ADD8E6] px-1.5 py-0.5 border border-black rounded shadow-xxs mt-0.5">
                      ▼ Screened Decline Target
                    </span>
                  </div>
                </div>

              </div>

              {/* Action guideline footer */}
              <div className="bg-white border border-[#ADD8E6]/60 rounded-xl p-3 flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-[#ADD8E6]/40 flex items-center justify-center text-xs shrink-0 text-black font-black">
                  ★
                </div>
                <div>
                  <span className="font-mono text-[7px] font-black uppercase tracking-widest text-black block leading-none">
                    Primary Prevention Mandate
                  </span>
                  <span className="font-sans text-[10px] text-black font-semibold block mt-1 leading-tight">
                    {activeFocus.preventativeAction}
                  </span>
                </div>
              </div>

            </div>

            {/* Simulated Live Queue statistics */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-[#ADD8E6] bg-[#ADD8E6]/20 p-3">
                <div className="font-sans text-xs font-black text-black">
                  Target: 60 Days max
                </div>
                <div className="font-mono text-[8px] uppercase font-black text-black mt-1">
                  Biopsy timeline target
                </div>
              </div>
              <div className="rounded-xl border border-[#F4A6C1] bg-[#F4A6C1]/20 p-3">
                <div className="font-sans text-xs font-black text-black">
                  GBCI Accredited
                </div>
                <div className="font-mono text-[8px] uppercase font-black text-black mt-1">
                  International Standard
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. WORLD HEALTH ORGANIZATION HEALTH METRICS TIMELINE */}
      <section className="bg-white border border-[#ADD8E6] rounded-3xl p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#ADD8E6]/30 pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-[#F4A6C1]/20 text-black font-mono text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-[#F4A6C1]">
              <TrendingUp className="h-3.5 w-3.5 text-black" />
              WHO Registered Trends Analysis
            </span>
            <h2 className="font-sans text-2xl font-black text-black leading-tight">
              Evidence-based WHO Screening Standard
            </h2>
            <p className="text-xs text-black leading-relaxed font-semibold max-w-xl">
              Tracking global breast & prostate risk profiles over consecutive timelines. Clinical initiatives aim to reduce preventable mortality by establishing fast digital coordinate screening pathways.
            </p>
          </div>

          {/* Inline department navigation */}
          <button 
            onClick={onBrowseDepartments}
            className="rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] text-black font-sans text-xs font-black px-5 py-3 border border-black shadow-md hover:scale-105 active:scale-95 transition-all text-center shrink-0 cursor-pointer"
          >
            Review Clinical Divisions
          </button>
        </div>

        {/* COMPARATIVE METRICS GAUGE CARS WITH BOUNCE HOVER EFFECTS - ALL BLACK WRITING */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="rounded-2xl border border-[#ADD8E6]/40 bg-[#ADD8E6]/10 p-6 hover:border-[#F4A6C1] hover:-translate-y-1 transition-all duration-150 cursor-pointer shadow-xxs">
            <div className="flex items-center justify-between border-b border-[#ADD8E6]/40 pb-2 mb-3">
              <span className="font-sans text-xs font-black text-black uppercase tracking-widest">Breast Staging</span>
              <span className="text-[9px] text-black font-black bg-[#F4A6C1]/30 px-1 rounded">90% Cure</span>
            </div>
            <p className="font-sans text-xl font-black text-black tracking-tight">Mammography</p>
            <p className="text-[11px] text-black leading-relaxed font-semibold mt-1.5">
              Early digital tomosynthesis reduces tumor progression indicators.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ADD8E6]/40 bg-[#ADD8E6]/10 p-6 hover:border-[#F4A6C1] hover:-translate-y-1 transition-all duration-150 cursor-pointer shadow-xxs">
            <div className="flex items-center justify-between border-b border-[#ADD8E6]/40 pb-2 mb-3">
              <span className="font-sans text-xs font-black text-black uppercase tracking-widest">Prostate Staging</span>
              <span className="text-[9px] text-black font-black bg-[#ADD8E6]/40 px-1 rounded">98% Cure</span>
            </div>
            <p className="font-sans text-xl font-black text-black tracking-tight">PSA Testing</p>
            <p className="text-[11px] text-black leading-relaxed font-semibold mt-1.5">
              Targeted digital rectal examination paired with blood marker monitoring.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ADD8E6]/40 bg-[#ADD8E6]/10 p-6 hover:border-[#F4A6C1] hover:-translate-y-1 transition-all duration-150 cursor-pointer shadow-xxs">
            <div className="flex items-center justify-between border-b border-[#ADD8E6]/40 pb-2 mb-3">
              <span className="font-sans text-xs font-black text-black uppercase tracking-widest">Genetic Markers</span>
              <span className="text-[9px] text-black font-black bg-[#F4A6C1]/30 px-1 rounded">Mutation Mapped</span>
            </div>
            <p className="font-sans text-xl font-black text-black tracking-tight">BRCA1 & BRCA2</p>
            <p className="text-[11px] text-black leading-relaxed font-semibold mt-1.5">
              Heredary marker diagnostic arrays pinpoint high susceptibility lines.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ADD8E6]/40 bg-[#ADD8E6]/10 p-6 hover:border-[#F4A6C1] hover:-translate-y-1 transition-all duration-150 cursor-pointer shadow-xxs">
            <div className="flex items-center justify-between border-b border-[#ADD8E6]/40 pb-2 mb-3">
              <span className="font-sans text-xs font-black text-black uppercase tracking-widest">Target Timeline</span>
              <span className="text-[9px] text-black font-black bg-[#ADD8E6]/40 px-1 rounded">WHO Protocol</span>
            </div>
            <p className="font-sans text-xl font-black text-black tracking-tight">60 Days To Treatment</p>
            <p className="text-[11px] text-black leading-relaxed font-semibold mt-1.5">
              Ensuring quick specialist transition immediately upon mammography anomaly detection.
            </p>
          </div>

        </div>
      </section>

      {/* 3. MULTIPLE CALL TO ACTIONS (CTAs) BAR */}
      <section className="grid gap-8 md:grid-cols-2">
        
        {/* CTA 1: Hereditary appraisal Risk Assessment */}
        <div className="rounded-2xl border border-[#ADD8E6] bg-white p-8 hover:shadow-lg transition duration-200 hover:border-[#F4A6C1] space-y-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1]/40 transition-transform group-hover:scale-110">
            <HeartPulse className="h-6 w-6 text-black" />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans text-xl font-black text-black leading-tight">Hereditary Gene Mapping (BRCA1 / BRCA2)</h3>
            <p className="text-xs text-black leading-relaxed font-medium">
              Biological cancer genetics represent essential benchmarks. Consult with our board-certified clinical genetics team to review breast and prostate susceptibility lineage.
            </p>
          </div>
          <div>
            <button
              onClick={onBrowseDepartments}
              className="inline-flex items-center gap-1.5 font-sans text-xs font-black text-black hover:underline transition cursor-pointer"
            >
              Analyze Your Genetic Risk Lineage
              <ChevronRight className="h-4 w-4 text-black" />
            </button>
          </div>
        </div>

        {/* CTA 2: Urgent diagnostic screenings screen */}
        <div className="rounded-2xl border border-[#ADD8E6] bg-[#ADD8E6]/10 p-8 hover:shadow-lg transition duration-200 hover:border-[#F4A6C1] space-y-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[#ADD8E6] transition-transform group-hover:scale-110">
            <FileText className="h-6 w-6 text-black" />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans text-xl font-black text-black leading-tight">PSA Screenings & Targeted Mammograms</h3>
            <p className="text-xs text-black leading-relaxed font-medium">
              In cases where clinical indicators are tracked, diagnostic screening processes must run with high urgency. Secure blood sampling and tomosynthesis slots directly.
            </p>
          </div>
          <div>
            <button
              onClick={onBookImmediateAppointment}
              className="rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] text-black border border-black font-sans text-xs font-black px-5 py-3 transition shadow-sm cursor-pointer uppercase tracking-wider"
            >
              Request Fast Screening Visit
            </button>
          </div>
        </div>
      </section>

      {/* 4. SANDBOX EVALUATION GATEWAYS */}
      {!isLoggedIn && (
        <section className="bg-white border border-[#ADD8E6] rounded-2xl p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-28 w-28 bg-[#F4A6C1]/10 rounded-full blur-xl pointer-events-none"></div>
          
          <h3 className="font-sans text-md font-black text-black flex items-center justify-center gap-1.5 leading-none">
            <Sparkles className="h-4.5 w-4.5 text-black" />
            Clinical Staff Certification Gateway
          </h3>
          <p className="text-xs text-black max-w-2xl mx-auto leading-relaxed font-semibold">
            Evaluate biopsy results, diagnostic file reports, and doctor queue lists instantaneously via sandbox profiles.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => onJoinStaffReview('patient')}
              className="inline-flex items-center gap-2 bg-[#ADD8E6]/20 border border-black hover:bg-[#ADD8E6]/40 text-black font-sans text-xs font-black px-5 py-2.5 rounded-xl transition cursor-pointer"
              id="mock_sign_patient_btn"
            >
              <FileHeart className="h-4 w-4 text-black" />
              Sign in as Patient Profile
            </button>
            
            <button
              onClick={() => onJoinStaffReview('admin')}
              className="inline-flex items-center gap-2 bg-[#F4A6C1] border border-black hover:bg-[#ADD8E6] text-black font-sans text-xs font-black px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
              id="mock_sign_admin_btn"
            >
              <ShieldCheck className="h-4 w-4 text-black" />
              Access Coordinator Console
            </button>
          </div>
        </section>
      )}

      {/* 5. COHESIVE BENEFIT GRID */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-2xl font-black text-black leading-tight">
            Registered Oncological Staging Standards
          </h2>
          <p className="mx-auto max-w-xl text-xs text-black leading-relaxed font-bold">
            Full clinical guidance implementing state-of-the-art diagnostic instruments under certified medical guidelines.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <div className="rounded-2xl border border-[#ADD8E6]/40 bg-white p-7 shadow-xxs space-y-3 transition duration hover:-translate-y-1 hover:border-[#F4A6C1] duration-150">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1]/30">
              <ShieldCheck className="h-5.5 w-5.5 text-black" />
            </div>
            <h3 className="font-sans text-md font-black text-black">Tomosynthesis Digital Radiographs</h3>
            <p className="text-xs leading-relaxed text-black font-medium">
              Low-dose breast tomosynthesis technology capturing premium, multi-angle diagnostic layouts to map early symptoms.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ADD8E6]/40 bg-white p-7 shadow-xxs space-y-3 transition duration hover:-translate-y-1 hover:border-[#F4A6C1] duration-150">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ADD8E6]/30 border border-[#ADD8E6]/45">
              <Award className="h-5.5 w-5.5 text-black" />
            </div>
            <h3 className="font-sans text-md font-black text-black">Nerve Preserving Procedures</h3>
            <p className="text-xs leading-relaxed text-black font-medium">
              Highly specialized urology and surgery units aiming to maximize nerve preservation, rapid physical recovery, and pelvic support.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ADD8E6]/40 bg-white p-7 shadow-xxs space-y-3 transition duration hover:-translate-y-1 hover:border-[#F4A6C1] duration-150">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1]/30">
              <ThumbsUp className="h-5.5 w-5.5 text-black" />
            </div>
            <h3 className="font-sans text-md font-black text-black">Clinical OncoSentry AI</h3>
            <p className="text-xs leading-relaxed text-black font-medium">
              Query our state-of-the-art diagnostic terminology parser, synchronized with updated WHO estimates, to translate clinical biopsy formats.
            </p>
          </div>

        </div>
      </section>

      {/* 6. NEWSLETTER SUBSCRIPTION AND SOCIAL HANDLES */}
      <section className="rounded-3xl border border-[#ADD8E6] bg-[#ADD8E6]/10 p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-[#F4A6C1]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-[#ADD8E6]/25 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-md text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 bg-[#F4A6C1] text-black font-mono text-[9px] font-black uppercase tracking-widest px-3 py-1 border border-black rounded">
              Prevention Channel Stream
            </span>
            <h3 className="font-sans text-2xl font-black text-black leading-tight">Registry Updates Notification</h3>
            <p className="text-xs text-black font-bold leading-relaxed">
              Receive monthly briefs on WHO screening advancements, mammogram timetables, and prostate health diagnostics under confidentiality rules.
            </p>
          </div>

          <div className="w-full max-w-md space-y-6">
            <form onSubmit={handleSubscribeNewsletter} className="flex gap-2.5">
              <input
                type="email"
                required
                placeholder="Enter email to get awareness updates..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full rounded-xl border border-[#ADD8E6] bg-white px-4 py-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold shadow-inner"
              />
              <button
                type="submit"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F4A6C1] border border-black p-3.5 text-black hover:bg-[#ADD8E6] transition duration-150 cursor-pointer shadow-md"
                title="Subscribe Email Updates"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>

            {newsletterStatus && (
              <p className="text-xs text-black font-black bg-white p-3 rounded-xl border border-[#F4A6C1] text-center animate-in fade-in">
                ✓ {newsletterStatus}
              </p>
            )}

            {/* INTEGRATED MANDATED SOCIAL MEDIA CHANNELS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#ADD8E6]/30">
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-black">
                WHO active awareness handles:
              </span>
              <div className="flex items-center gap-3">
                
                {/* 1. Instagram */}
                <a 
                  href="https://instagram.com/who" 
                  target="_blank"  
                  rel="noreferrer" 
                  title="WHO Instagram Profile" 
                  className="p-2.5 bg-white rounded-xl text-black border border-[#ADD8E6] hover:bg-[#F4A6C1] transition-all"
                >
                  <Instagram className="h-4 w-4 text-black" />
                </a>

                {/* 2. X / Twitter */}
                <a 
                  href="https://twitter.com/who" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO Twitter Feed" 
                  className="p-2.5 bg-white rounded-xl text-black border border-[#ADD8E6] hover:bg-[#F4A6C1] transition-all"
                >
                  <Twitter className="h-4 w-4 text-black" />
                </a>

                {/* 3. LinkedIn */}
                <a 
                  href="https://linkedin.com/company/world-health-organization" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO LinkedIn Workspace" 
                  className="p-2.5 bg-white rounded-xl text-black border border-[#ADD8E6] hover:bg-[#F4A6C1] transition-all"
                >
                  <Linkedin className="h-4 w-4 text-black" />
                </a>

                {/* 4. YouTube */}
                <a 
                  href="https://youtube.com/@who" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO YouTube Channel" 
                  className="p-2.5 bg-white rounded-xl text-black border border-[#ADD8E6] hover:bg-[#F4A6C1] transition-all"
                >
                  <Youtube className="h-4 w-4 text-black" />
                </a>

                {/* 5. Facebook */}
                <a 
                  href="https://facebook.com/who" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO Facebook Directory" 
                  className="p-2.5 bg-white rounded-xl text-black border border-[#ADD8E6] hover:bg-[#F4A6C1] transition-all"
                >
                  <Facebook className="h-4 w-4 text-black" />
                </a>

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
