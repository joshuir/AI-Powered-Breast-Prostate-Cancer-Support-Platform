import React from 'react';
import { 
  HeartPulse, 
  Activity, 
  Sparkles, 
  Calendar,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Appointment } from '../types';

interface DepartmentsSectionProps {
  onSelectDepartment: (deptName: string) => void;
  appointments: Appointment[];
}

interface DepartmentItem {
  id: string;
  name: string;
  icon: any;
  lead: string;
  doctorsCount: number;
  description: string;
  treatments: string[];
}

const DEPARTMENTS: DepartmentItem[] = [
  {
    id: "breast_surgery",
    name: "Breast Surgical Oncology",
    icon: HeartPulse,
    lead: "Dr. Sarah Jenkins",
    doctorsCount: 4,
    description: "Our premier clinical breast surgical oncology center facilitates complex diagnostic steps, sentinel lymph node localization, and oncoplastic lumpectomies.",
    treatments: ["Diagnostic Staging & Review", "Sentinel Lymph Node Analysis", "Targeted Breast Examinations", "Oncoplastic Lumpectomy"]
  },
  {
    id: "prostate_urology",
    name: "Prostate Urology & Surgery",
    icon: ShieldCheck,
    lead: "Dr. Marcus Vance",
    doctorsCount: 3,
    description: "Innovative prostate gland care clinic prioritizing nerve-preserving radical prostatectomies, modern active surveillance systems, and high-frequency PSA reviews.",
    treatments: ["Serum PSA Diagnostic Assays", "Active Surveillance Assessments", "Nerve-Sparing Prostatic Extraction", "Urinary Recovery Evaluations"]
  },
  {
    id: "radiation_oncology",
    name: "Radiation Therapy & Seeds",
    icon: Calendar,
    lead: "Dr. Elena Rostova",
    doctorsCount: 2,
    description: "Dual radiation group implementing intensity-modulated volumetric external beam sweeps alongside low-dose-rate brachytherapy seed implantation.",
    treatments: ["Stereotactic Body Radiotherapy", "HDR Brachytherapy Seed Placement", "IMRT Beam Dose Calculations", "Vesical Tissue Protection Margins"]
  },
  {
    id: "diagnostic_screening",
    name: "Diagnostic Screenings & Biopsy",
    icon: Activity,
    lead: "Dr. David Kim",
    doctorsCount: 4,
    description: "Ultra-precision diagnosis division running 3D clinical digital mammograms, diagnostic core needle biopsying, and pathology Gleason score gradings.",
    treatments: ["3D Digital Mammography Sweeps", "Multiparametric Prostatic MRI", "Ultrasound Guided Core biopsy", "Gleason Score Pathological Review"]
  },
  {
    id: "cancer_genetics",
    name: "Clinical Cancer Genetics",
    icon: Sparkles,
    lead: "Dr. Sophia Patel",
    doctorsCount: 2,
    description: "Preventative medicine focus prioritizing BRCA1/BRCA2 and Lynch syndrome sequencing to design family cancer hazard mitigation blueprints.",
    treatments: ["BRCA1/BRCA2 Genetic Mapping", "Hereditary Cancer Risk Appraisals", "Familial Risk Pedigree Mapping", "Lynch Syndrome Risk Assessments"]
  }
];

export default function DepartmentsSection({ onSelectDepartment, appointments = [] }: DepartmentsSectionProps) {
  
  // Helper to dynamically check if a department has pending appointments
  const getDepartmentQueueStatus = (deptName: string): { isPending: boolean; count: number } => {
    const pendingList = appointments.filter(app => {
      if (app.status !== 'pending') return false;
      
      const docId = app.doctorId;
      // Precise mappings to Seed Specialties and names
      if (docId === 'doc_breast_oncologist_1' && deptName === "Breast Surgical Oncology") return true;
      if (docId === 'doc_prostate_urologist_1' && deptName === "Prostate Urology & Surgery") return true;
      if (docId === 'doc_radiation_oncology_1' && deptName === "Radiation Therapy & Seeds") return true;
      if (docId === 'doc_pathologist_1' && deptName === "Diagnostic Screenings & Biopsy") return true;
      if (docId === 'doc_genetics_1' && deptName === "Clinical Cancer Genetics") return true;

      // Generic fallback
      if (app.doctorSpecialty && app.doctorSpecialty.toLowerCase().includes(deptName.toLowerCase())) return true;
      return false;
    });

    return {
      isPending: pendingList.length > 0,
      count: pendingList.length
    };
  };

  return (
    <div className="space-y-16 py-6 font-sans tracking-wide text-black">
      
      {/* HEADER SEGMENT */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black bg-[#F4A6C1]/30 border border-[#F4A6C1] px-4 py-1.5 rounded-full inline-block">
          Clinical Divisions Status
        </span>
        <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-black leading-tight">
          Specialist Oncology & Urology Departments
        </h1>
        <p className="text-sm text-black font-semibold leading-relaxed">
          Monitor real-time appointment queue status in all divisions. Click to browse specialist urologists, pathologists, and genetic counselors to arrange your screening.
        </p>
      </div>

      {/* DEPARTMENTS CARD GRID */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          const { isPending, count } = getDepartmentQueueStatus(dept.name);

          return (
            <div 
              key={dept.id}
              className="flex flex-col justify-between rounded-2xl border border-[#ADD8E6] bg-white p-7 shadow-xs hover:border-[#F4A6C1] hover:shadow-lg transition duration-200 group relative text-black"
              id={`dept_card_${dept.id}`}
            >
              <div>
                
                {/* CARD TOP BAR */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ADD8E6]/20 border border-[#ADD8E6] shadow-xxs">
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                  <div className="rounded-full bg-[#F4A6C1]/20 px-3 py-1 font-mono text-[10px] font-black uppercase text-black border border-[#F4A6C1]">
                    {dept.doctorsCount} Specialists
                  </div>
                </div>

                {/* DEPARTMENT TITLE */}
                <h3 className="mt-6 font-sans text-xl font-black text-black leading-snug group-hover:underline transition duration-155">
                  {dept.name}
                </h3>
                
                <p className="mt-3 text-xs leading-relaxed text-black font-semibold">
                  {dept.description}
                </p>

                {/* DYNAMIC APPOINTMENT QUEUE STATUS BADGE */}
                <div className="mt-5 p-3.5 rounded-xl border border-[#ADD8E6] flex items-center gap-2.5 transition duration-150 bg-white shadow-xxs font-sans text-black">
                  {isPending ? (
                    <div className="flex items-center gap-2.5 w-full">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#F4A6C1] animate-ping"></div>
                      <div className="flex-1">
                        <span className="text-[11px] font-black text-black uppercase tracking-wider block">
                          Pending Appointment In Queue
                        </span>
                        <span className="text-[9px] text-black block font-semibold leading-none mt-1">
                          {count} active referral request requiring clinical confirmation.
                        </span>
                      </div>
                      <AlertTriangle className="h-4.5 w-4.5 text-black shrink-0 animate-pulse" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 w-full">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#ADD8E6]"></div>
                      <div className="flex-1">
                        <span className="text-[11px] font-black text-black uppercase tracking-wider block">
                          No Pending Appointments
                        </span>
                        <span className="text-[9px] text-black block font-semibold leading-none mt-1">
                          Queue clear. Immediate physical screening dates are open.
                        </span>
                      </div>
                      <CheckCircle2 className="h-4.5 w-4.5 text-black shrink-0" />
                    </div>
                  )}
                </div>

                {/* ESSENTIAL TRIGGER BULLETS */}
                <div className="mt-6 border-t border-[#ADD8E6]/40 pt-5">
                  <span className="font-sans text-[10px] uppercase font-black text-black tracking-widest block mb-3">
                    Common Diagnostic Indicators
                  </span>
                  <ul className="space-y-2">
                    {dept.treatments.map((treat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-black">
                        <span className="h-2 w-2 rounded-full bg-[#F4A6C1]"></span>
                        <span className="font-semibold leading-normal">{treat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-8 pt-4 border-t border-[#ADD8E6]/30">
                <button
                  onClick={() => onSelectDepartment(dept.name)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] border border-black text-black font-sans text-xs font-black py-3 transition cursor-pointer shadow-md uppercase tracking-wider font-sans active:scale-95"
                  id={`dept_book_trigger_${dept.id}`}
                >
                  Browse Doctors
                  <ArrowRight className="h-4 w-4 text-black" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
