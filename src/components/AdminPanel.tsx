import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Doctor, Appointment, AppointmentStatus, MedicalReport } from '../types';
import { dbService } from '../firebase';
import { 
  Calendar, 
  Trash2, 
  Clock, 
  Stethoscope, 
  ShieldCheck, 
  UserCheck,
  DollarSign,
  BriefcaseMedical,
  FileText,
  UploadCloud,
  Download,
  FilePlus,
  AlertCircle,
  FolderOpen
} from 'lucide-react';

interface AdminPanelProps {
  currentUserProfile: UserProfile;
  onAppointmentsChange?: () => void;
}

export default function AdminPanel({ currentUserProfile, onAppointmentsChange }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'patients'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Status filters for appointments tab
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');

  // Form States for registering NEW doctor
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docDepartment, setDocDepartment] = useState('Breast Surgical Oncology');
  const [docExperience, setDocExperience] = useState('10 Years');
  const [docAvailability, setDocAvailability] = useState('Mon to Fri (09:00 AM - 05:00 PM)');
  const [docEmail, setDocEmail] = useState('');
  const [docImageUrl, setDocImageUrl] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [formMessage, setFormMessage] = useState('');

  // Patient Files management states (Admin/Health Professionals)
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
  const [patientReports, setPatientReports] = useState<MedicalReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState('');
  
  // Report upload forms for admin
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState<{ name: string; sizeRef: string; base64Data: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const loadPatientReports = async (patientId: string) => {
    setLoadingReports(true);
    setReportsError('');
    try {
      const allReports = await dbService.getReports(patientId, 'patient');
      allReports.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
      setPatientReports(allReports);
    } catch (err) {
      console.error(err);
      setReportsError("Failed to fetch reports for this patient");
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSelectPatient = async (patient: UserProfile) => {
    setSelectedPatient(patient);
    // Reset uploader states for fresh selection
    setReportTitle('');
    setReportDesc('');
    setSelectedFileObj(null);
    setReportsError('');
    await loadPatientReports(patient.uid);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setReportsError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportsError('');
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setReportsError("File exceeds 2MB limit. Please select a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const formattedSize = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + " MB" 
        : (file.size / 1024).toFixed(0) + " KB";

      setSelectedFileObj({
        name: file.name,
        sizeRef: formattedSize,
        base64Data: uploadEvent.target?.result as string || ''
      });
    };
    reader.onerror = () => {
      setReportsError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleAdminUploadReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!reportTitle.trim()) {
      setReportsError("Please enter an appropriate descriptive title.");
      return;
    }
    if (!selectedFileObj) {
      setReportsError("Please drag and drop or select a file first.");
      return;
    }

    setUploadingReport(true);
    setReportsError('');
    try {
      const generatedId = "rep_" + Date.now();
      const newReport: MedicalReport = {
        id: generatedId,
        patientId: selectedPatient.uid,
        patientName: selectedPatient.displayName,
        title: reportTitle.trim(),
        description: reportDesc.trim() || undefined,
        fileName: selectedFileObj.name,
        fileType: selectedFileObj.name.split('.').pop() || 'Unknown',
        fileSize: selectedFileObj.sizeRef,
        fileDataURL: selectedFileObj.base64Data,
        uploadedAt: new Date().toISOString()
      };

      await dbService.uploadReport(newReport);

      // Reset
      setReportTitle('');
      setReportDesc('');
      setSelectedFileObj(null);
      
      // Reload reports list
      await loadPatientReports(selectedPatient.uid);
    } catch (err) {
      console.error(err);
      setReportsError("Failed to upload report to patient database file.");
    } finally {
      setUploadingReport(false);
    }
  };

  const handleAdminDeleteReport = async (reportId: string) => {
    if (!window.confirm("Do you want to delete this clinical report permanently? This action cannot be undone.")) return;
    if (!selectedPatient) return;

    setReportsError('');
    try {
      await dbService.deleteReport(reportId);
      await loadPatientReports(selectedPatient.uid);
    } catch (err) {
      console.error(err);
      setReportsError("Failed to delete the diagnostic file from database registry.");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const allAppts = await dbService.getAppointments('', 'admin');
      const allDocs = await dbService.getDoctors();
      
      // Get all patients by querying all users registered in system
      const allUsers = JSON.parse(localStorage.getItem('greencare_users') || '{}');
      const usersArray = Object.values(allUsers) as UserProfile[];
      setPatients(usersArray);

      setAppointments(allAppts);
      setDoctors(allDocs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- STATS COMPUTING PANEL ---
  const stats = {
    totalAppointments: appointments.length,
    completedConsults: appointments.filter(a => a.status === 'completed').length,
    pendingConfirmations: appointments.filter(a => a.status === 'pending').length,
    totalDoctors: doctors.length,
    totalPatients: patients.length,
    simulatedRevenue: appointments.filter(a => a.status === 'completed').length * 150 // $150 per consult
  };

  // --- ACTION CONTROLLERS FOR APPOINTMENTS ---
  const handleUpdateStatus = async (appointmentId: string, targetStatus: AppointmentStatus) => {
    try {
      await dbService.updateAppointmentStatus(appointmentId, targetStatus);
      await loadAdminData();
      onAppointmentsChange?.();
    } catch (err) {
      console.error(err);
      alert("Failed to adjust appointment parameters. Access restricted.");
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm("Delete this appointment permanently from server archives?")) return;
    try {
      await dbService.deleteAppointment(appointmentId);
      await loadAdminData();
      onAppointmentsChange?.();
    } catch (err) {
      console.error(err);
    }
  };

  // --- DOCTOR UTILITIES ---
  const handleRegisterDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docSpecialty.trim() || !docEmail.trim()) {
      setFormMessage("Please fill in Doctor Name, specialty, and contact email.");
      return;
    }

    const unspashList = [
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
      "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300"
    ];

    const safeUrl = docImageUrl.trim() || unspashList[Math.floor(Math.random() * unspashList.length)];

    try {
      const generatedDocId = "doc_" + Date.now();
      const newDoctorObj: Doctor = {
        id: generatedDocId,
        name: docName.trim(),
        specialty: docSpecialty.trim(),
        department: docDepartment,
        experience: docExperience.trim(),
        availability: docAvailability.trim(),
        rating: 4.8,
        email: docEmail.trim(),
        imageUrl: safeUrl,
        description: docDescription.trim() || "Experienced hospital medical expert."
      };

      await dbService.saveDoctor(newDoctorObj);
      
      // Reset forms
      setDocName('');
      setDocSpecialty('');
      setDocEmail('');
      setDocImageUrl('');
      setDocDescription('');
      setFormMessage("Doctor credentials successfully added!");
      
      await loadAdminData();
    } catch (err) {
      console.error(err);
      setFormMessage("Failed to write doctor credentials to database server.");
    }
  };

  const handleDeleteDoctorProfile = async (doctorId: string) => {
    if (!window.confirm("Do you want to revoke this doctor's license and delete them from directory list?")) return;
    try {
      await dbService.deleteDoctor(doctorId);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter appointments list based on UI active status pills
  const filteredAppointments = appointments.filter(appt => {
    if (statusFilter === 'All') return true;
    return appt.status === statusFilter;
  });

  return (
    <div className="space-y-10 py-4 text-black font-sans">
      
      {/* 1. BRANDING HEADER SYSTEM */}
      <section className="bg-gradient-to-r from-[#ADD8E6]/20 to-[#F4A6C1]/20 text-black rounded-3xl p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md border border-[#ADD8E6]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#F4A6C1] px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest text-black">
            <ShieldCheck className="h-3.5 w-3.5" />
            Oncology Administration Portal
          </div>
          <h1 className="font-sans text-2xl font-black text-black">
            GreenCare Cancer Center Console
          </h1>
          <p className="text-xs text-black font-semibold">
            Clinic Coordinator Session: logged in as <span className="text-black font-black">{currentUserProfile.displayName}</span>
          </p>
        </div>

        <button 
          onClick={loadAdminData}
          className="rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] border border-black text-black font-sans text-xs font-black px-5 py-3 shadow-md transition cursor-pointer uppercase tracking-wider"
        >
          Refresh Clinical Services
        </button>
      </section>

      {/* 2. STATS OVERVIEW DASHBOARD */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-5 text-black">
        
        <div className="rounded-2xl border border-[#ADD8E6] bg-white p-4 text-center shadow-xxs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1] text-black">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-black">{stats.totalAppointments}</div>
          <div className="text-[9px] uppercase font-black text-black/60 tracking-wider">Total Bookings</div>
        </div>

        <div className="rounded-2xl border border-[#ADD8E6] bg-white p-4 text-center shadow-xxs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#ADD8E6]/20 border border-[#ADD8E6] text-black">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-black">{stats.pendingConfirmations}</div>
          <div className="text-[9px] uppercase font-black text-black/60 tracking-wider">Pending Action</div>
        </div>

        <div className="rounded-2xl border border-[#ADD8E6] bg-white p-4 text-center shadow-xxs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1] text-black">
            <UserCheck className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-black">{stats.completedConsults}</div>
          <div className="text-[9px] uppercase font-black text-black/60 tracking-wider">Consults Done</div>
        </div>

        <div className="rounded-2xl border border-[#ADD8E6] bg-white p-4 text-center shadow-xxs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#ADD8E6]/20 border border-[#ADD8E6] text-black">
            <Stethoscope className="h-4.5 w-4.5" />
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-black">{stats.totalDoctors}</div>
          <div className="text-[9px] uppercase font-black text-black/60 tracking-wider">Licensed Doctors</div>
        </div>

        <div className="col-span-2 lg:col-span-1 border border-[#ADD8E6] bg-[#ADD8E6]/20 rounded-2xl p-4 text-center shadow-xxs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4A6C1]/30 border border-[#F4A6C1] text-black">
            <DollarSign className="h-4.5 w-4.5" />
          </div>
          <div className="mt-2 font-mono text-md font-extrabold text-black">${stats.simulatedRevenue.toLocaleString()}</div>
          <div className="text-[9px] uppercase font-black text-black/80">Simulated Revenue</div>
        </div>

      </section>

      {/* 3. SWITCH TAB NAVIGATOR */}
      <section className="space-y-6 text-black">
        <div className="flex border-b border-[#ADD8E6] pb-px">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`font-sans text-xs font-black uppercase tracking-wider px-5 py-3 border-b-2 transition cursor-pointer ${
              activeTab === 'appointments'
                ? 'border-black text-black'
                : 'border-transparent text-black/60 hover:text-black hover:border-[#ADD8E6]'
            }`}
          >
            Manage Appointments ({appointments.length})
          </button>
          
          <button
            onClick={() => setActiveTab('doctors')}
            className={`font-sans text-xs font-black uppercase tracking-wider px-5 py-3 border-b-2 transition cursor-pointer ${
              activeTab === 'doctors'
                ? 'border-black text-black'
                : 'border-transparent text-black/60 hover:text-black hover:border-[#ADD8E6]'
            }`}
          >
            Coordinate Doctors ({doctors.length})
          </button>
          
          <button
            onClick={() => setActiveTab('patients')}
            className={`font-sans text-xs font-black uppercase tracking-wider px-5 py-3 border-b-2 transition cursor-pointer ${
              activeTab === 'patients'
                ? 'border-black text-black'
                : 'border-transparent text-black/60 hover:text-black hover:border-[#ADD8E6]'
            }`}
          >
            Patient Registry Files ({patients.length})
          </button>
        </div>

        {/* --- TAB CONTENT AREA --- */}

        {/* TAB 1: APPOINTMENTS BROKER */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 text-black">
            
            {/* Status Filter Indicators */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-[10px] uppercase font-black text-black/50 tracking-wider mr-2">
                Filter list:
              </span>
              {(['All', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((filterOpt) => (
                <button
                  key={filterOpt}
                  onClick={() => setStatusFilter(filterOpt)}
                  className={`rounded-lg px-3 py-1.5 font-sans text-xs font-black transition border cursor-pointer ${
                    statusFilter === filterOpt
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black hover:bg-[#ADD8E6]/20 border-[#ADD8E6]'
                  }`}
                >
                  {filterOpt === 'All' ? 'All Bookings' : filterOpt.toUpperCase()}
                </button>
              ))}
            </div>

            {/* APPOINTMENT GRID TABLE representation */}
            {filteredAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#ADD8E6] p-12 text-center text-xs text-black/60 font-semibold bg-white">
                No appointment files match the requested "{statusFilter}" status query.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#ADD8E6] bg-white">
                <table className="w-full border-collapse text-left text-xs text-black">
                  <thead className="bg-[#ADD8E6]/10 font-sans text-[10px] uppercase font-bold tracking-wider border-b border-[#ADD8E6]">
                    <tr>
                      <th className="px-6 py-4">Appt ID & Created</th>
                      <th className="px-6 py-4">Patient Profile</th>
                      <th className="px-6 py-4">Doctor Assigned</th>
                      <th className="px-6 py-4">Date & Slot</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Coordination Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ADD8E6]/30 font-semibold">
                    {filteredAppointments.map((appt) => {
                      let tagStyle = "bg-white border-black text-black";
                      if (appt.status === 'confirmed') tagStyle = "bg-[#ADD8E6]/25 text-black border border-[#ADD8E6]";
                      if (appt.status === 'cancelled') tagStyle = "bg-[#F4A6C1]/30 text-black border border-[#F4A6C1]";
                      if (appt.status === 'completed') tagStyle = "bg-white text-black border border-black/40";

                      return (
                        <tr key={appt.id} className="hover:bg-[#ADD8E6]/10 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono font-black text-black tracking-tight block select-all">{appt.id}</span>
                            <span className="text-[10px] text-black/60 font-mono">
                              {new Date(appt.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-black">{appt.patientName}</div>
                            <div className="font-mono text-[10px] text-black/60">{appt.patientEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-black">{appt.doctorName}</div>
                            <div className="text-[10px] text-black/60">{appt.doctorSpecialty}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-black text-black">{appt.date}</div>
                            <div className="text-[10px] text-black/65">{appt.timeSlot}</div>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className={`inline-block rounded-md px-2 py-0.5 font-mono text-[9px] font-black uppercase ${tagStyle}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                            {appt.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                                className="bg-[#ADD8E6] hover:bg-[#F4A6C1] border border-black text-black font-sans text-[10px] font-black px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                id={`admin_confirm_${appt.id}`}
                              >
                                Approve
                              </button>
                            )}
                            
                            {appt.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                className="bg-black text-white hover:bg-neutral-800 font-sans text-[10px] font-black px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                id={`admin_complete_${appt.id}`}
                              >
                                Complete
                              </button>
                            )}

                            {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                                className="border border-black hover:bg-[#F4A6C1] text-black font-sans text-[10px] font-black px-2 py-1.5 rounded-lg transition cursor-pointer"
                                id={`admin_cancel_${appt.id}`}
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteAppointment(appt.id)}
                              className="text-black/60 hover:text-black p-1 rounded transition inline-block align-middle cursor-pointer"
                              title="Delete Archive"
                              id={`admin_delete_appt_${appt.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCTORS REGISTRY */}
        {activeTab === 'doctors' && (
          <div className="grid gap-8 lg:grid-cols-12 text-black">
            
            {/* Doctors Registration Form (Span 5) */}
            <div className="lg:col-span-5 rounded-2xl border border-[#ADD8E6] bg-white p-5 shadow-xs space-y-4">
              <h3 className="font-sans text-sm font-black text-neutral-900 flex items-center gap-2">
                <BriefcaseMedical className="h-4.5 w-4.5 text-black animate-pulse" />
                Enroll New Medical Doctor
              </h3>

              <form onSubmit={handleRegisterDoctor} className="space-y-4.5">
                
                {formMessage && (
                  <div className="rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1] p-3 font-sans text-xs text-black font-black leading-relaxed">
                    ℹ️ {formMessage}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase font-black text-black/60 tracking-wider block">Doctor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alexander Cross"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full rounded-xl border border-[#ADD8E6] py-3 px-4 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                    id="admin_doc_name"
                  />
                </div>

                {/* Department */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase font-black text-black/60 tracking-wider block">Specialty Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Breast Specialist Physician"
                      value={docSpecialty}
                      onChange={(e) => setDocSpecialty(e.target.value)}
                      className="w-full rounded-xl border border-[#ADD8E6] py-3 px-4 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                      id="admin_doc_specialty"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase font-black text-black/55 tracking-wide block">Clinic Department</label>
                    <select
                      value={docDepartment}
                      onChange={(e) => setDocDepartment(e.target.value)}
                      className="w-full rounded-xl border border-[#ADD8E6] bg-white py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                      id="admin_doc_dept"
                    >
                      <option value="Breast Surgical Oncology">Breast Surgical Oncology</option>
                      <option value="Prostate Urology & Surgery">Prostate Urology & Surgery</option>
                      <option value="Radiation Therapy & Seeds">Radiation Therapy & Seeds</option>
                      <option value="Diagnostic Screenings & Biopsy">Diagnostic Screenings & Biopsy</option>
                      <option value="Clinical Cancer Genetics">Clinical Cancer Genetics</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Experience */}
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase font-black text-black/60 block">Years of Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Years"
                      value={docExperience}
                      onChange={(e) => setDocExperience(e.target.value)}
                      className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] uppercase font-black text-black/60 block">Doctor Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. a.cross@greencare.org"
                      value={docEmail}
                      onChange={(e) => setDocEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                      id="admin_doc_email"
                    />
                  </div>
                </div>

                {/* Working hours availability */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase font-black text-black/60 block">Weekly availability hours String</label>
                  <input
                    type="text"
                    value={docAvailability}
                    onChange={(e) => setDocAvailability(e.target.value)}
                    className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                  />
                </div>

                {/* Image URL of doc */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase font-black text-black/60 block">Photo file URL string</label>
                  <input
                    type="text"
                    placeholder="Photo URL (optional)"
                    value={docImageUrl}
                    onChange={(e) => setDocImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-[#ADD8E6] py-2.5 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                  />
                </div>

                {/* Bio Description */}
                <div className="space-y-1">
                  <label className="font-sans text-[10px] uppercase font-black text-black/60 block">Doctor overview biography</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of achievements or specialty..."
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] border border-black text-black font-sans text-xs font-black py-3 shadow-md transform transition duration-100 active:scale-95 cursor-pointer uppercase tracking-wider"
                  id="admin_doc_submit_btn"
                >
                  Enroll Specialist Profile
                </button>
              </form>
            </div>

            {/* Doctors Registry List (Span 7) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-sans text-sm font-black text-neutral-900">Active Staff Registry</h3>
              
              <div className="overflow-x-auto rounded-xl border border-[#ADD8E6] bg-white">
                <table className="w-full border-collapse text-left text-xs text-black">
                  <thead className="bg-[#ADD8E6]/15 font-sans text-[10px] uppercase font-bold tracking-wider border-b border-[#ADD8E6]">
                    <tr>
                      <th className="px-5 py-3">Doctor</th>
                      <th className="px-5 py-3">Specialty/Dept</th>
                      <th className="px-5 py-3">Experience</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ADD8E6]/30 font-semibold">
                    {doctors.map(doc => (
                      <tr key={doc.id} className="hover:bg-[#ADD8E6]/10">
                        <td className="px-5 py-3 flex items-center gap-2.5">
                          <img 
                            src={doc.imageUrl} 
                            alt={doc.name} 
                            referrerPolicy="no-referrer"
                            className="h-8 w-8 rounded-full object-cover border border-[#ADD8E6]" 
                          />
                          <div>
                            <span className="font-bold text-black block">{doc.name}</span>
                            <span className="text-[10px] font-mono text-black/60">{doc.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-black font-bold block">{doc.specialty}</span>
                          <span className="text-[10px] uppercase font-black text-black/65">{doc.department}</span>
                        </td>
                        <td className="px-5 py-3 text-black font-bold">{doc.experience}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDeleteDoctorProfile(doc.id)}
                            className="text-black/55 hover:text-black p-1 rounded transition cursor-pointer"
                            title="De-license Doctor"
                            id={`admin_del_doc_btn_${doc.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: PATIENTS LIST */}
        {activeTab === 'patients' && (
          <div className="grid gap-8 lg:grid-cols-12 text-black font-sans">
            
            {/* Left Column (Patients Table) */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-sans text-sm font-black text-neutral-900">Synced Patient Profiles</h3>
              <p className="text-xs text-black/60 font-semibold mb-2">
                Select a patient below to manage, upload, download, or delete their diagnostic records, photos, and file charts.
              </p>
              
              <div className="overflow-x-auto rounded-xl border border-[#ADD8E6] bg-white">
                <table className="w-full border-collapse text-left text-xs text-black">
                  <thead className="bg-[#ADD8E6]/15 font-sans text-[10px] uppercase font-bold tracking-wider border-b border-[#ADD8E6]">
                    <tr>
                      <th className="px-4 py-3">Patient Account</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ADD8E6]/30 font-semibold">
                    {patients.map(pat => {
                      const isSelected = selectedPatient?.uid === pat.uid;
                      return (
                        <tr 
                          key={pat.uid} 
                          onClick={() => handleSelectPatient(pat)}
                          className={`hover:bg-[#ADD8E6]/10 cursor-pointer transition ${
                            isSelected ? 'bg-[#ADD8E6]/20 border-l-4 border-[#F4A6C1]' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span className="font-black text-black block">{pat.displayName}</span>
                            <span className="font-mono text-[9px] text-black/60">{pat.email}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-block font-mono text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              pat.role === 'admin' 
                                ? 'bg-[#F4A6C1]/30 text-black border-[#F4A6C1]' 
                                : 'bg-[#ADD8E6]/25 text-black border-[#ADD8E6]'
                            }`}>
                              {pat.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectPatient(pat);
                              }}
                              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase transition border cursor-pointer ${
                                isSelected 
                                  ? 'bg-black text-white border-black' 
                                  : 'bg-white text-black border-[#ADD8E6] hover:bg-[#ADD8E6]/20'
                              }`}
                            >
                              📂 View Vault
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column (Files and Upload Manager for Selected Patient) */}
            <div className="lg:col-span-6 space-y-6">
              {selectedPatient ? (
                <div className="space-y-6">
                  
                  {/* File Vault title banner */}
                  <div className="rounded-2xl bg-gradient-to-r from-[#ADD8E6]/10 to-[#F4A6C1]/10 border border-[#ADD8E6] p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-mono font-black uppercase tracking-wider text-[#F4A6C1]">
                        Active Patient Workspace
                      </div>
                      <h4 className="font-sans text-sm font-black text-black">
                        {selectedPatient.displayName}'s Vault
                      </h4>
                      <p className="text-[10px] text-black/60 font-mono">{selectedPatient.email}</p>
                    </div>
                    <FolderOpen className="h-8 w-8 text-black/40 animate-pulse" />
                  </div>

                  {reportsError && (
                    <div className="rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1] p-3 font-sans text-xs text-black font-black flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-black shrink-0" />
                      <span>{reportsError}</span>
                    </div>
                  )}

                  {/* 1. FILE UPLOAD CONTROLLER */}
                  <div className="rounded-2xl border border-[#ADD8E6] bg-white p-5 shadow-xs space-y-4">
                    <h4 className="font-sans text-xs font-black text-black flex items-center gap-1.5">
                      <FilePlus className="h-4 w-4 text-black" />
                      Upload Diagnostic Image or Clinical Report
                    </h4>

                    <form onSubmit={handleAdminUploadReportSubmit} className="space-y-4">
                      
                      {/* Document title input */}
                      <div className="space-y-1">
                        <label className="font-sans text-[10px] uppercase font-black text-black/60">
                          Diagnostic Title / Lab Test Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Prostate Biopsy Report, MRI Breast Images"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                          id="admin_uploader_title"
                        />
                      </div>

                      {/* Document description input */}
                      <div className="space-y-1">
                        <label className="font-sans text-[10px] uppercase font-black text-black/60">
                          Description or Clinical Summary
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Gleason Score reviewed by board pathologist..."
                          value={reportDesc}
                          onChange={(e) => setReportDesc(e.target.value)}
                          className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                          id="admin_uploader_desc"
                        />
                      </div>

                      {/* Drag & Drop zone */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => adminFileInputRef.current?.click()}
                        className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                          dragActive 
                            ? 'border-[#F4A6C1] bg-[#F4A6C1]/10' 
                            : selectedFileObj 
                              ? 'border-[#ADD8E6] bg-neutral-50' 
                              : 'border-[#ADD8E6] hover:border-[#F4A6C1] hover:bg-neutral-50/50'
                        }`}
                        id="admin_uploader_drop_zone"
                      >
                        <input
                          type="file"
                          ref={adminFileInputRef}
                          onChange={handleManualFileChange}
                          accept=".pdf,.png,.jpeg,.jpg,.txt,.doc"
                          className="hidden"
                        />

                        <div className="space-y-2">
                          <UploadCloud className="h-8 w-8 text-black mx-auto animate-pulse" />
                          
                          {selectedFileObj ? (
                            <div>
                              <div className="font-sans text-xs font-black text-black line-clamp-1">
                                ✓ {selectedFileObj.name}
                              </div>
                              <div className="font-mono text-[10px] text-black/70 font-bold">
                                File Size: {selectedFileObj.sizeRef} (Base64 ready)
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-sans text-xs font-black text-black">
                                Drag & Drop or Click to upload
                              </p>
                              <p className="font-sans text-[10px] text-black/60 mt-0.5 font-bold">
                                PDF, JPEG, PNG, or Doc (max 2MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Upload */}
                      <button
                        type="submit"
                        disabled={uploadingReport || !selectedFileObj}
                        className="w-full rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] border border-black text-black font-sans text-xs font-black py-2.5 shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
                        id="admin_uploader_submit_btn"
                      >
                        {uploadingReport ? "Uploading diagnostic file..." : "Upload & Save to Patient Profile"}
                      </button>

                    </form>
                  </div>

                  {/* 2. PATIENT REPORTS VIEWER */}
                  <div className="space-y-4">
                    <h4 className="font-sans text-xs font-black text-black flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-black" />
                      Patient's Diagnostic Reports ({patientReports.length})
                    </h4>

                    {loadingReports ? (
                      <div className="py-8 text-center text-xs text-black/60 font-mono animate-pulse bg-white border border-[#ADD8E6] rounded-xl">
                        Syncing patient documents from database...
                      </div>
                    ) : patientReports.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#ADD8E6] p-6 text-center text-xs text-black/65 font-bold bg-white">
                        No reports or uploaded images recorded for this patient profile yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {patientReports.map((rep) => (
                          <div
                            key={rep.id}
                            className="rounded-xl border border-[#ADD8E6] bg-white p-4 shadow-2xs hover:shadow-xs transition flex items-start gap-3 relative text-black group"
                            id={`admin_report_card_${rep.id}`}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ADD8E6]/25 border border-[#ADD8E6] text-black">
                              <FileText className="h-5 w-5 text-black" />
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="font-sans text-xs font-black text-black truncate">
                                  {rep.title}
                                </h5>
                                
                                <div className="flex items-center gap-2 mb-1 shrink-0">
                                  {/* Download */}
                                  <a
                                    href={rep.fileDataURL}
                                    download={rep.fileName}
                                    title="Download File"
                                    className="text-black hover:scale-110 transition p-1 rounded-md hover:bg-sky-50"
                                    id={`admin_download_btn_${rep.id}`}
                                  >
                                    <Download className="h-3.5 w-3.5 text-black" />
                                  </a>
                                  
                                  {/* Delete */}
                                  <button
                                    onClick={() => handleAdminDeleteReport(rep.id)}
                                    className="text-black hover:text-[#F4A6C1] transition p-1 rounded-md hover:bg-red-50 cursor-pointer"
                                    title="Delete document"
                                    id={`admin_delete_btn_${rep.id}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-black" />
                                  </button>
                                </div>
                              </div>

                              {rep.description && (
                                <p className="font-sans text-[11px] text-black font-semibold leading-snug">
                                  {rep.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono text-black/65 font-bold">
                                <span className="truncate max-w-[120px]" title={rep.fileName}>
                                  📎 {rep.fileName} ({rep.fileSize || 'N/A'})
                                </span>
                                <span>•</span>
                                <span>{new Date(rep.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-[#ADD8E6] bg-white min-h-[350px]">
                  <FolderOpen className="h-12 w-12 text-[#F4A6C1] mb-4 animate-bounce" />
                  <h4 className="font-serif text-md font-bold text-neutral-900 mb-1">No Patient Selected</h4>
                  <p className="text-xs text-black/60 font-semibold max-w-sm leading-relaxed">
                    Select a patient profile checklist row from the synced registry on the left to see, upload, download, and delete their diagnostic medical reports and scanned charts.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </section>

    </div>
  );
}
