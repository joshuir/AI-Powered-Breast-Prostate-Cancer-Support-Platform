import React, { useState, useEffect } from "react";
import { Search, Bookmark, BookmarkCheck, Sparkles, Send, BookOpen, AlertCircle, HelpCircle, Activity } from "lucide-react";

interface ThesaurusTerm {
  id: string;
  name: string;
  definition: string;
  category: "Breast" | "Prostate" | "Treatments" | "General";
  relevance: string;
}

// Pre-seeded terms matching oncology requirements
const CLINICAL_DICTIONARY: ThesaurusTerm[] = [
  {
    id: "mammogram",
    name: "Mammography (Screening & Diagnostic)",
    definition: "A specific type of breast imaging that uses low-dose X-rays to detect early changes in mammalian tissues before physical symptoms develop.",
    category: "Breast",
    relevance: "The leading screening standard for early-stage breast cancer detection in individuals over the age of 40."
  },
  {
    id: "psa",
    name: "PSA (Prostate-Specific Antigen)",
    definition: "A protein produced by both normal and neoplastic cells of the prostate gland. Elevated serum PSA levels are analyzed to quantify prostatic inflammation, hyperplasia, or malignancies.",
    category: "Prostate",
    relevance: "Standard blood test utilized for screening and monitoring treatment response in prostate cancer patients."
  },
  {
    id: "gleason",
    name: "Gleason Score / Grade Group",
    definition: "A histological categorization indicating how aggressively prostate cancer tumors are likely to grow and spread. Pathologists examine microscopic biopsy samples and award a score from 6 to 10.",
    category: "Prostate",
    relevance: "Directly dictates the choice between active surveillance, surgical extraction, or radiation therapy planning."
  },
  {
    id: "brca",
    name: "BRCA1 / BRCA2 Mutations",
    definition: "Tumor suppressor genes that, when affected by pathogenic mutations, fail to repair double-strand DNA breaks properly. This significantly increases risk factors for hereditary breast and ovarian malignancies.",
    category: "Breast",
    relevance: "Informs risk assessment and guides options such as prophylactic mastectomy, intensive surveillance, or PARP inhibitors."
  },
  {
    id: "lumpectomy",
    name: "Lumpectomy (Breast-Conserving Surgery)",
    definition: "Surgical excision of the primary breast tumor along with a healthy margin of surrounding parenchyma, preserving the majority of the remaining breast structure.",
    category: "Breast",
    relevance: "Typically paired with post-operative localized radiotherapy to treat early-stage localized breast cancer."
  },
  {
    id: "prostatectomy",
    name: "Robotic Radical Prostatectomy",
    definition: "A minimally invasive surgical procedure that removes the entire prostate gland, seminal vesicles, and selective surrounding lymph tissues, utilizing robotic-assisted arms for extreme precision.",
    category: "Prostate",
    relevance: "Indicated for localized intermediate or high-risk prostate cancer, prioritizing nerve preservation for urinary and erectile recovery."
  },
  {
    id: "her2",
    name: "HER2 Protein (Human Epidermal Growth Factor Receptor 2)",
    definition: "A receptor protein on cell membranes. Amplification of the HER2 gene leads to protein overexpression, driving aggressive cellular replication.",
    category: "Breast",
    relevance: "Dictates eligibility for highly targeted monoclonal antibody and antibody-drug conjugate (ADC) treatments like Trastuzumab."
  },
  {
    id: "brachytherapy",
    name: "Prostate Brachytherapy",
    definition: "A form of radiation therapy where radioactive isotopes (such as Palladium-103 or Iodine-125 seeds) are physically implanted directly inside the prostate tissue to deliver highly localized therapeutic radiation.",
    category: "Prostate",
    relevance: "Delivers maximum tumor-site radiation dose while protecting surrounding rectal and vesical tissue margins."
  },
  {
    id: "hormone_breast",
    name: "Endocrine / Hormone Receptor Therapy (breast)",
    definition: "Systemic therapy designed to block estrogen and progesterone receptors (using Tamoxifen), or halt estrogen production (using Aromatase Inhibitors), starving receptor-positive tumor cells.",
    category: "Breast",
    relevance: "Standard adjuvant therapy for ER-positive status, drastically reducing the rates of cancer recurrence."
  },
  {
    id: "hormone_prostate",
    name: "ADT (Androgen Deprivation Therapy)",
    definition: "Hormonal blockade (using LHRH agonists/antagonists) designed to suppress testicular androgen production, denying prostate cancer cells the testosterone required for survival and replication.",
    category: "Prostate",
    relevance: "Cornerstone treatment for advanced or high-risk localized prostate tumors, often paired with radiation therapy."
  },
  {
    id: "biopsy",
    name: "Core Needle Biopsy (CNB)",
    definition: "The extraction of a hollow column of tissue from a suspicious nodule or density (often guided by 3D ultrasound or MRI) to determine benign vs. malignant pathological status.",
    category: "General",
    relevance: "The definitive gold standard for cancer diagnosis; establishes grading, hormone receptors, and tissue staging."
  },
  {
    id: "mri",
    name: "3T Multiparametric Prostate MRI (mpMRI)",
    definition: "An advanced, high-field MRI scan combining anatomical and functional sequences, allowing detailed evaluation of prostatic lesions and pelvic node involvement.",
    category: "Prostate",
    relevance: "Excellent tool to guide targeted fusion biopsies and determine eligibility for active surveillance."
  },
  {
    id: "sentinel_node",
    name: "Sentinel Lymph Node Biopsy (SLNB)",
    definition: "A diagnostic surgery to identify, remove, and biopsy the first lymph node(s) to which cancer cells are most likely to spread from a primary breast tumor.",
    category: "Breast",
    relevance: "Accurately maps potential lymphatic metastasis while preventing unnecessary systemic removal of accessory axillary nodes."
  }
];

const formatCleanText = (text: string): string => {
  if (!text) return "";
  const lines = text.split("\n");
  let headingCounter = 1;
  let listCounterIndex = 0;
  const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n"];

  const processedLines = lines.map((line) => {
    let l = line.trim();
    
    // Remove horizontal divider lines
    if (l === "---" || l.startsWith("---") || l.startsWith("___")) {
      return "";
    }

    // Convert "### " headers or other hashes into numerical heads: "1. Heading Text"
    if (l.startsWith("###") || l.startsWith("##") || l.startsWith("#")) {
      const titleText = l.replace(/^[#\s]+/, "").replace(/\*/g, "").trim();
      const output = `${headingCounter}. ${titleText}`;
      headingCounter++;
      listCounterIndex = 0; // reset sublist character index
      return output;
    }

    // Convert lists starting with "*" or "-" or "•" into alphabetical listing points "a. List Text"
    if (l.startsWith("* ") || l.startsWith("- ") || l.startsWith("• ")) {
      const itemText = l.replace(/^[\*\-\•\s]+/, "").replace(/\*/g, "").trim();
      const letter = alphabet[listCounterIndex % alphabet.length];
      const output = `   ${letter}. ${itemText}`;
      listCounterIndex++;
      return output;
    }

    // Clean any inline markdown bold marks
    return line.replace(/\*\*/g, "").replace(/\*/g, "");
  });

  return processedLines.filter(line => line !== null).join("\n");
};

export default function ThesaurusSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Breast" | "Prostate" | "Treatments" | "General">("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // AI Explainer State
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load Bookmarks on mount
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("greencare_thesaurus_bookmarks") || "[]");
    setBookmarks(list);
  }, []);

  const toggleBookmark = (id: string) => {
    const fresh = bookmarks.includes(id) 
      ? bookmarks.filter(b => b !== id) 
      : [...bookmarks, id];
    setBookmarks(fresh);
    localStorage.setItem("greencare_thesaurus_bookmarks", JSON.stringify(fresh));
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse(null);
    setAiError(null);

    try {
      const response = await fetch("/api/thesaurus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiQuery.trim() })
      });

      if (!response.ok) {
        throw new Error("Failure processing request. Please inspect API connections.");
      }

      const data = await response.json();
      setAiResponse(formatCleanText(data.text));
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "Communication offset. Please recompile or check local server console.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyPresetQuestion = (text: string) => {
    setAiQuery(text);
    const input = document.getElementById("ai_query_input");
    if (input) input.focus();
  };

  const filteredTerms = CLINICAL_DICTIONARY.filter(term => {
    const matchCategory = selectedCategory === "All" || term.category === selectedCategory;
    const matchSearch = term.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        term.relevance.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-16 py-6 font-sans tracking-wide text-black">
      
      {/* HEADER SECTION - NO RED - DESIGNED IN PINK, LIGHT BLUE, WHITE WITH BLACK TEXT */}
      <section className="relative overflow-hidden rounded-3xl border border-[#ADD8E6] bg-gradient-to-r from-[#ADD8E6]/20 via-white to-[#F4A6C1]/20 px-8 py-14 text-black shadow-xl sm:px-12">
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-[#ADD8E6]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-[#F4A6C1]/20 blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 max-w-6xl mx-auto">
          <div className="space-y-6 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#F4A6C1] px-4 py-1.5 font-mono text-[10px] uppercase font-black tracking-widest text-black">
              <Sparkles className="h-4 w-4 animate-pulse text-black" />
              World Health Organization (WHO) Clinical Grounding Active
            </div>
            
            <h1 className="font-sans text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-black leading-tight">
              OncoSentry AI <br className="hidden sm:inline" />
              <span className="text-black font-extrabold capitalize">
                Interactive WHO Cancer Thesaurus
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-black leading-relaxed font-semibold max-w-xl">
              Explore medically grounded terminology and pathways aligned directly with WHO estimates and cancer indicators. Translate complex diagnostic parameters into simple, supportive patient resources.
            </p>
          </div>

          {/* BRACKET EMBLEMS WITH PINK AND BLUE RIBBONS */}
          <div className="flex items-center gap-6 bg-white border border-[#ADD8E6] p-6 rounded-2xl shrink-0 shadow-sm">
            {/* Breast Cancer Awareness Section */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4A6C1]/25 text-black shadow-xxs border border-[#F4A6C1]">
                <svg className="h-7 w-7 text-black animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8.5 9 10.5 10.5 12.5L7 19.5C6.5 20.5 7.2 21.5 8.3 21.5C8.8 21.5 9.3 21.2 9.5 20.8L12 15.5L14.5 20.8C14.7 21.2 15.2 21.5 15.7 21.5C16.8 21.5 17.5 20.5 17 19.5L13.5 12.5C15 10.5 16.5 8.5 16.5 6.5C16.5 4 14.5 2 12 2ZM12 11.5C10.5 9.5 9.5 8 9.5 6.5C9.5 5.1 10.6 4 12 4C13.4 4 14.5 5.1 14.5 6.5C14.5 8 13.5 9.5 12 11.5Z" />
                </svg>
              </div>
              <div className="font-mono text-[9px] font-black text-black uppercase tracking-widest leading-none">Breast Focus</div>
            </div>

            <div className="border-l border-[#ADD8E6] h-12"></div>

            {/* Prostate Cancer Blue Ribbon */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ADD8E6]/25 text-black shadow-xxs border border-[#ADD8E6]">
                <svg className="h-7 w-7 text-black animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8.5 9 10.5 10.5 12.5L7 19.5C6.5 20.5 7.2 21.5 8.3 21.5C8.8 21.5 9.3 21.2 9.5 20.8L12 15.5L14.5 20.8C14.7 21.2 15.2 21.5 15.7 21.5C16.8 21.5 17.5 20.5 17 19.5L13.5 12.5C15 10.5 16.5 8.5 16.5 6.5C16.5 4 14.5 2 12 2ZM12 11.5C10.5 9.5 9.5 8 9.5 6.5C9.5 5.1 10.6 4 12 4C13.4 4 14.5 5.1 14.5 6.5C14.5 8 13.5 9.5 12 11.5Z" />
                </svg>
              </div>
              <div className="font-mono text-[9px] font-black text-black uppercase tracking-widest leading-none block">Prostate Focus</div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE INTERACTIVE BLOCKS GRID */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE DICTIONARY BROWSER */}
        <section className="lg:col-span-7 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ADD8E6]/50 pb-5">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5.5 w-5.5 text-black" />
              <h2 className="font-sans text-xl font-black text-black leading-tight">
                WHO Clinical Glossary ({filteredTerms.length})
              </h2>
            </div>

            {/* Micro search bar */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 h-full text-black w-4.5" />
              <input
                type="text"
                placeholder="Search oncology dictionary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#ADD8E6] bg-white py-2.5 pl-10 pr-3.5 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-semibold"
                id="thesaurus_search_input"
              />
            </div>
          </div>

          {/* Category selection filters */}
          <div className="flex flex-wrap gap-2.5">
            {(["All", "Breast", "Prostate", "Treatments", "General"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 font-sans text-xs font-black transition duration-150 cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-[#F4A6C1] text-black border-black shadow-md"
                    : "bg-white text-black hover:bg-[#ADD8E6]/20 border-[#ADD8E6]"
                }`}
                id={`btn_cat_${cat}`}
              >
                {cat === "All" ? "All WHO Terms" : cat === "General" ? "Diagnosis & Pathology" : `${cat} Cancer Focus`}
              </button>
            ))}
          </div>

          {/* List of cards with Pink ribbon on the left for breast and Light Blue for prostate */}
          {filteredTerms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ADD8E6] p-12 text-center text-xs text-black font-bold bg-white shadow-xxs">
              No oncology terms match your search criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTerms.map(term => {
                const isBookmarked = bookmarks.includes(term.id);
                // Categorized shading using our exact boundaries
                const ribbonColor = term.category === "Breast" ? "bg-[#F4A6C1]" : term.category === "Prostate" ? "bg-[#ADD8E6]" : "bg-white border-black/40";
                
                return (
                  <div 
                    key={term.id}
                    className="rounded-2xl border border-[#ADD8E6] bg-white p-7 hover:shadow-lg transition duration-200 relative overflow-hidden group space-y-4"
                    id={`dict_card_${term.id}`}
                  >
                    {/* Visual Category ribbon strip on the left with our constrained colours */}
                    <div className={`absolute top-0 bottom-0 left-0 w-2.5 ${ribbonColor}`}></div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 pl-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest border border-black ${
                            term.category === "Breast" ? "bg-[#F4A6C1]/30" : "bg-[#ADD8E6]/30"
                          }`}>
                            {term.category} Oncology Reference
                          </span>
                          <span className="font-mono text-[9px] text-black/60 uppercase font-black tracking-widest">{term.id}</span>
                        </div>
                        <h3 className="font-sans text-lg font-black text-black leading-tight group-hover:underline transition duration-150">
                          {term.name}
                        </h3>
                      </div>

                      {/* Bookmark icon toggle */}
                      <button
                        onClick={() => toggleBookmark(term.id)}
                        className={`rounded-xl border p-2.5 transition shrink-0 cursor-pointer ${
                          isBookmarked 
                            ? "bg-[#F4A6C1]/35 border-black text-black" 
                            : "bg-white border-[#ADD8E6] text-black hover:bg-[#F4A6C1]/20"
                        }`}
                        id={`bookmark_trigger_${term.id}`}
                        title={isBookmarked ? "Remove from learning stash" : "Bookmark this term for my doctor appointment"}
                      >
                        {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                    </div>

                    <p className="font-sans text-xs leading-relaxed text-black font-semibold pl-2">
                      <strong>WHO Glossary Standard:</strong> {term.definition}
                    </p>

                    <div className="rounded-xl border border-[#ADD8E6] bg-[#ADD8E6]/10 px-4 py-3 ml-2">
                      <p className="font-sans text-[11px] leading-relaxed text-black font-semibold">
                        <strong className="text-black uppercase tracking-widest font-black block mb-0.5">Patient Evaluation Pathway:</strong> {term.relevance}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: AI EXPLORATION PANEL */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* ASK AI PANEL - PINK, WHITE, LIGHT BLUE */}
          <div className="rounded-2xl border border-[#ADD8E6] bg-white p-6 shadow-md relative overflow-hidden space-y-6">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#ADD8E6]/25 blur-xl pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-[#F4A6C1]/20 blur-xl pointer-events-none"></div>

            <div className="relative space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4A6C1]/25 border border-[#F4A6C1] text-black">
                  <Sparkles className="h-5 w-5 animate-pulse text-black" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-black text-black leading-none">OncoSentry AI Advisor</h3>
                  <p className="text-[10px] text-black font-bold tracking-wide mt-1.5">Grounded in World Health Organization standards</p>
                </div>
              </div>

              {/* Recommended Pre-set Queries */}
              <div className="space-y-2">
                <span className="font-sans text-[10px] uppercase font-black text-black tracking-wider block">Recommended Cancer Queries (WHO):</span>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleApplyPresetQuestion("What is the WHO target under the Global Breast Cancer Initiative (GBCI)?")}
                    className="text-[11px] font-black text-left bg-white hover:bg-[#F4A6C1]/20 border border-[#ADD8E6] text-black p-2.5 rounded-lg leading-relaxed transition"
                  >
                    🎗️ WHO Global Breast Initiative Targets
                  </button>
                  <button 
                    onClick={() => handleApplyPresetQuestion("Why are PSA checks and MRI tests listed as early detection standards by WHO for Prostate Care?")}
                    className="text-[11px] font-black text-left bg-white hover:bg-[#F4A6C1]/20 border border-[#ADD8E6] text-black p-2.5 rounded-lg leading-relaxed transition"
                  >
                    🩺 WHO Prostate Detection Guidelines
                  </button>
                  <button 
                    onClick={() => handleApplyPresetQuestion("How do Core Needle Biopsies and Gleason scores define early staging?")}
                    className="text-[11px] font-black text-left bg-white hover:bg-[#F4A6C1]/20 border border-[#ADD8E6] text-black p-2.5 rounded-lg leading-relaxed transition"
                  >
                    🔬 Needle Staging & Progression Definitions
                  </button>
                </div>
              </div>

              {/* Ask Form */}
              <form onSubmit={handleAskAI} className="space-y-4 pt-1">
                <div className="relative">
                  <input
                    type="text"
                    id="ai_query_input"
                    placeholder="Ask about staging guidelines or WHO objectives..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#ADD8E6] bg-white py-3 pl-4 pr-11 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4A6C1] hover:bg-[#ADD8E6] text-black transition border border-black disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4 text-black" />
                  </button>
                </div>
              </form>

              {/* AI Loading state */}
              {aiLoading && (
                <div className="rounded-xl border border-dashed border-[#F4A6C1] bg-[#F4A6C1]/10 p-6 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="font-sans text-xs text-black animate-pulse font-black">OncoSentry is mapping clinical guidelines under WHO and IARC regulations...</p>
                </div>
              )}

              {aiError && (
                <div className="rounded-xl bg-[#F4A6C1]/10 border border-[#F4A6C1] p-4 font-sans text-xs text-black flex items-start gap-2 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-black" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Response Display Box */}
              {aiResponse && (
                <div className="rounded-xl border border-[#ADD8E6] bg-[#ADD8E6]/5 p-5 font-sans text-xs leading-relaxed text-black space-y-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#ADD8E6] pb-2">
                    <span className="font-mono text-[9px] font-black text-black tracking-wider">🔬 WHO BOUNDED GROUNDING</span>
                    <span className="font-sans text-[9px] text-black font-black">Clinical Support</span>
                  </div>
                  <div className="whitespace-pre-line text-black space-y-3 prose prose-xs font-semibold">
                    {aiResponse}
                  </div>
                  <div className="text-[10px] text-black font-black italic pt-2 border-t border-[#ADD8E6]/60 mt-2 block">
                    ⓘ Guidance provided strictly for educational purposes based on current WHO Global Cancer reports. Book a physical biopsy or consultation immediately with Oncology coordinators.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MY BOOKMARKS COMPONENT */}
          <div className="rounded-2xl border border-[#ADD8E6] bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-sans text-sm font-black text-black flex items-center gap-2">
              <Bookmark className="h-4.5 w-4.5 text-black fill-black" />
              Patient Consultation Learning Stash
            </h3>
            <p className="text-[11px] text-black font-bold leading-relaxed">
              Tag technical diagnostic terms during your research. Show them to your urologist, clinical geneticist, or oncologist during physical assessment appointments.
            </p>

            {bookmarks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#ADD8E6] p-6 text-center text-xs text-black/50 font-semibold bg-white">
                Click the bookmark badge 🔖 on any glossary term to collect terms here.
              </div>
            ) : (
              <div className="space-y-3">
                {CLINICAL_DICTIONARY.filter(t => bookmarks.includes(t.id)).map(term => (
                  <div 
                    key={term.id}
                    className="flex items-center justify-between gap-3 border border-[#ADD8E6] bg-[#ADD8E6]/10 px-3.5 py-2.5 rounded-xl hover:bg-[#F4A6C1]/20 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${
                          term.category === "Breast" ? "bg-[#F4A6C1]" : "bg-[#ADD8E6]"
                        }`}></span>
                        <span className="font-sans text-xs font-black text-black">{term.name}</span>
                      </div>
                      <div className="text-[10px] text-black font-black uppercase tracking-wider ml-4">{term.category} Oncology Reference</div>
                    </div>
                    
                    <button
                      onClick={() => toggleBookmark(term.id)}
                      className="text-black hover:scale-110 p-1 cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFORMATIVE EDUCATION CARD */}
          <div className="rounded-2xl bg-[#ADD8E6]/20 p-5 border border-[#ADD8E6] flex gap-3">
            <HelpCircle className="h-5 w-5 text-black shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-sans text-xs font-black text-black">Patient Education Notice</h4>
              <p className="text-[10px] leading-relaxed text-black font-semibold">
                Always prioritize physical oncology examinations. Gleason ratings, biological tissue markers, and genetic mutation profiles vary severely. Use digital metrics for advocacy, and speak to qualified coordinators at your clinic.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Inline replacement for X icon representation to prevent missing imports
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
