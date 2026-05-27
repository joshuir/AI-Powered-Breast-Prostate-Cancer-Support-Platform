import { useState, useMemo } from 'react';
import { Doctor } from '../types';
import { Search, Star, Clock, GraduationCap, Mail, Calendar } from 'lucide-react';

interface DoctorsSectionProps {
  doctors: Doctor[];
  selectedDeptFilter: string;
  onSelectDeptFilter: (dept: string) => void;
  onInitiateBooking: (doctor: Doctor) => void;
}

export default function DoctorsSection({
  doctors,
  selectedDeptFilter,
  onSelectDeptFilter,
  onInitiateBooking
}: DoctorsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all distinct departments for the filter pills
  const availableDepartments = useMemo(() => {
    const list = new Set<string>();
    doctors.forEach(d => {
      if (d.department) list.add(d.department);
    });
    return ['All', ...Array.from(list)];
  }, [doctors]);

  // Compute filtered search list
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchDept = selectedDeptFilter === 'All' || doc.department === selectedDeptFilter;
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [doctors, selectedDeptFilter, searchQuery]);

  return (
    <div className="space-y-12 py-6 font-sans tracking-wide text-black">
      
      {/* HEADER STATEMENT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <span className="font-mono text-[9px] font-black uppercase tracking-widest text-black bg-[#F4A6C1]/30 border border-[#F4A6C1] px-3.5 py-1.5 rounded-full inline-block">
            Oncology Specialists List
          </span>
          <h1 className="font-sans text-3xl font-black tracking-tight text-black leading-none">
            Meet Our Oncology & Urology Staff
          </h1>
          <p className="text-xs text-black font-semibold max-w-lg leading-relaxed">
            Our medical board consists of double-certified clinical professors and surgeons with years of peer-reviewed practice in breast surgical care, prostate intervention, and genetics.
          </p>
        </div>

        {/* SEARCH BOX CARRIER */}
        <div className="relative w-full max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 h-full">
            <Search className="h-4.5 w-4.5 text-black" />
          </div>
          <input
            type="text"
            placeholder="Search name, specialty, or division..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#ADD8E6] bg-white py-3 pl-10 pr-4 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
            id="doctor_search_input"
          />
        </div>
      </div>

      {/* FILTER CONTROLLER PILLS */}
      <div className="flex flex-wrap gap-2.5 border-b border-[#ADD8E6]/40 pb-5">
        {availableDepartments.map(dept => (
          <button
            key={dept}
            onClick={() => onSelectDeptFilter(dept)}
            className={`rounded-xl px-4 py-2 font-sans text-xs font-black transition duration-150 cursor-pointer border ${
              selectedDeptFilter === dept
                ? 'bg-[#F4A6C1] text-black border-black shadow-md'
                : 'bg-white text-black hover:bg-[#ADD8E6]/25 border-[#ADD8E6]'
            }`}
            id={`filter_pill_${dept.toLowerCase()}`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* RESULT GRID */}
      {filteredDoctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ADD8E6] p-12 text-center space-y-4 bg-white text-black">
          <div className="text-xl">🔍</div>
          <h3 className="font-sans text-sm font-black text-black">No Specialists Matched</h3>
          <p className="text-xs text-black/70 max-w-sm mx-auto leading-relaxed font-semibold">
            We couldn't match any practicing clinician with "{searchQuery}" under the selected division.
          </p>
          <button
            onClick={() => { setSearchQuery(''); onSelectDeptFilter('All'); }}
            className="rounded-xl border border-black bg-white hover:bg-[#ADD8E6]/30 px-5 py-2 font-sans text-xs font-black text-black transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#ADD8E6] bg-white shadow-xs hover:border-[#F4A6C1] hover:shadow-lg transition duration-200"
              id={`doctor_doc_card_${doc.id}`}
            >
              {/* PHOTO AREA FOR EACH SPECIALIST */}
              <div className="relative h-60 w-full overflow-hidden bg-[#ADD8E6]/20">
                <img
                  src={doc.imageUrl}
                  alt={doc.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <div className="inline-block rounded bg-[#F4A6C1] px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest text-black border border-black">
                    {doc.department}
                  </div>
                  <h3 className="font-sans text-lg font-black leading-tight text-white">
                    {doc.name}
                  </h3>
                  <div className="font-sans text-xs text-neutral-100 font-semibold uppercase tracking-wider">
                    {doc.specialty}
                  </div>
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="flex-1 p-6 space-y-5 text-black">
                {doc.description && (
                  <p className="font-sans text-xs leading-relaxed text-black font-semibold">
                    {doc.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-[#ADD8E6]/40 pt-4">
                  <div className="flex items-center gap-2.5 text-black">
                    <GraduationCap className="h-5.5 w-5.5 text-black shrink-0 animate-pulse" />
                    <div>
                      <div className="font-sans text-[10px] uppercase font-black text-black/60 tracking-wider">Experience</div>
                      <div className="font-sans text-xs font-black text-black">{doc.experience}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-black">
                    <Star className="h-5.5 w-5.5 text-black fill-black shrink-0" />
                    <div>
                      <div className="font-sans text-[10px] uppercase font-black text-black/60 tracking-wider">Rating</div>
                      <div className="font-sans text-xs font-black text-black">{doc.rating.toFixed(1)} / 5.0</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl bg-[#ADD8E6]/10 p-3 border border-[#ADD8E6]/30">
                  <Clock className="h-4 w-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <span className="font-sans text-[9px] font-black text-black/60 uppercase tracking-widest block leading-none">Clinical availability</span>
                    <span className="font-sans text-[11px] text-black font-black block mt-1">{doc.availability}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-black/65 text-[10px] font-mono select-all tracking-wider pt-2 border-t border-[#ADD8E6]/30">
                  <Mail className="h-4 w-4 text-black" />
                  {doc.email}
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="border-t border-[#ADD8E6]/30 bg-[#ADD8E6]/5 p-5">
                <button
                  onClick={() => onInitiateBooking(doc)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] border border-black text-black font-sans text-xs font-black py-3 shadow-md hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer uppercase tracking-wider"
                  id={`doctor_card_book_btn_${doc.id}`}
                >
                  <Calendar className="h-4.5 w-4.5 text-black" />
                  Request consultation
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
