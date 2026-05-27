import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Appointment, MedicalReport } from '../types';
import { dbService } from '../firebase';
import { 
  Calendar, 
  FileText, 
  UploadCloud, 
  Clock, 
  Trash2, 
  Download, 
  FilePlus, 
  Clipboard,
  AlertCircle
} from 'lucide-react';

interface PatientDashboardProps {
  user: UserProfile;
  onAppointmentUpdate?: () => void;
}

export default function PatientDashboard({ user, onAppointmentUpdate }: PatientDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  
  // Report Upload Form States
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState<{ name: string; sizeRef: string; base64Data: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPatientData();
  }, [user]);

  const loadPatientData = async () => {
    setLoading(true);
    setErrorText('');
    try {
      const parsedAppointments = await dbService.getAppointments(user.uid, user.role);
      const parsedReports = await dbService.getReports(user.uid, user.role);
      
      // Sort appointments chronologically by date and slot
      parsedAppointments.sort((a, b) => b.date.localeCompare(a.date));
      setAppointments(parsedAppointments);
      
      // Sort reports by uploadedAt timestamp descending
      parsedReports.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
      setReports(parsedReports);
    } catch (err) {
      console.error(err);
      setErrorText("Failed to retrieve medical files. Please inspect database rules.");
    } finally {
      setLoading(false);
    }
  };

  // --- APPOINTMENT STATE ACTIONS ---
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await dbService.updateAppointmentStatus(appointmentId, 'cancelled');
      await loadPatientData();
      onAppointmentUpdate?.();
    } catch (err) {
      console.error(err);
      setErrorText("Failed to cancel booking. Action might be prohibited.");
    }
  };

  // --- DATA FILE UPLOAD DRAG-AND-DROP CONTROLS ---
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
    setFileError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    // Check file size limit (max 2MB for local/cloud base64)
    if (file.size > 2 * 1024 * 1024) {
      setFileError("File exceeds 2MB limit. Please upload compact clinical documents or images.");
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
      setFileError("Failed to parse file binary data.");
    };
    reader.readAsDataURL(file);
  };

  const handleReportUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      setFileError("Please provide an appropriate diagnostic title for the report.");
      return;
    }
    if (!selectedFileObj) {
      setFileError("Please drag or click to select a clinical document first.");
      return;
    }

    setUploading(true);
    setFileError('');

    try {
      const generatedReportId = "rep_" + Date.now();
      const newReport: MedicalReport = {
        id: generatedReportId,
        patientId: user.uid,
        patientName: user.displayName,
        title: reportTitle.trim(),
        description: reportDesc.trim() || undefined,
        fileName: selectedFileObj.name,
        fileType: selectedFileObj.name.split('.').pop() || 'Unknown',
        fileSize: selectedFileObj.sizeRef,
        fileDataURL: selectedFileObj.base64Data,
        uploadedAt: new Date().toISOString()
      };

      await dbService.uploadReport(newReport);
      
      // Reset upload forms
      setReportTitle('');
      setReportDesc('');
      setSelectedFileObj(null);
      
      // Reload lists
      await loadPatientData();
    } catch (err) {
      console.error(err);
      setFileError("Upload failed. Access might be blocked or credentials expired.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm("Are you sure you want to remove this report?")) return;
    try {
      await dbService.deleteReport(reportId);
      await loadPatientData();
    } catch (err) {
      console.error(err);
      setErrorText("Failed to delete report.");
    }
  };

  return (
    <div className="space-y-10 py-4 text-black font-sans">
      
      {/* 1. PORTAL WELCOME ROW */}
      <section className="bg-gradient-to-r from-[#ADD8E6]/20 to-[#F4A6C1]/20 rounded-2xl p-6 border border-[#ADD8E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[9px] font-black uppercase tracking-wider text-black bg-white border border-[#F4A6C1] px-2 py-0.5 rounded inline-block">
            Authorized Patient Session
          </div>
          <h1 className="font-sans text-2xl font-black text-black">
            Welcome Back, <span className="font-medium text-black">{user.displayName}</span>
          </h1>
          <p className="text-xs text-black font-semibold">
            Securely coordinates clinical appointment logs, symptoms, and medical prescription findings.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-3 py-2 rounded-xl border border-[#ADD8E6] text-center min-w-[70px]">
            <div className="font-mono text-xs font-black text-black">{appointments.length}</div>
            <div className="text-[9px] uppercase font-black text-black">Bookings</div>
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-[#F4A6C1] text-center min-w-[70px]">
            <div className="font-mono text-xs font-black text-black">{reports.length}</div>
            <div className="text-[9px] uppercase font-black text-black">Reports</div>
          </div>
        </div>
      </section>

      {/* ERROR MESSAGE STRIP */}
      {errorText && (
        <div className="rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1] p-4 font-sans text-xs text-black flex items-start gap-2 font-bold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-black" />
          <span>Warning: {errorText}</span>
        </div>
      )}

      {/* GRID LAYOUT FOR CORE UTILITIES */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* LEFT COLUMN: ACTIVE BOOKINGS (7 SPANS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-black text-black flex items-center gap-2">
              <Clipboard className="h-4.5 w-4.5 text-black" />
              Appointment Scheduling Timeline
            </h2>
            <button 
              onClick={loadPatientData} 
              className="text-black hover:underline text-xs font-black transition cursor-pointer"
            >
              🔄 Reload List
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-black font-mono animate-pulse">
              Syncing appointment logs from Cloud Firestore...
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ADD8E6]/80 p-12 text-center space-y-3 bg-white">
              <Calendar className="h-8 w-8 text-black mx-auto animate-bounce" />
              <h4 className="font-sans text-sm font-black text-black">No Appointments Booked</h4>
              <p className="text-xs text-black/70 max-w-sm mx-auto font-semibold">
                Select a clinician from our doctors directory and book your diagnostic health scanning consultation today.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((app) => {
                const isPast = new Date(app.date) < new Date("2026-05-22");
                
                // Pure color mapping for status badges
                let badgeColor = "bg-white border-black text-black";
                if (app.status === "confirmed") badgeColor = "bg-[#ADD8E6]/25 border-[#ADD8E6] text-black";
                if (app.status === "cancelled") badgeColor = "bg-[#F4A6C1]/30 border-[#F4A6C1] text-black";
                if (app.status === "completed") badgeColor = "bg-white border-black/40 text-black";

                return (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-[#ADD8E6] bg-white p-5 shadow-xs flex flex-col sm:flex-row justify-between gap-4 relative overflow-hidden group hover:border-[#F4A6C1] hover:shadow-md transition duration-155 text-black"
                    id={`appt_item_${app.id}`}
                  >
                    {/* LEFT CELL DETAILS */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-black uppercase border ${badgeColor}`}>
                          {app.status}
                        </span>
                        {isPast && app.status === 'confirmed' && (
                          <span className="text-[10px] text-black font-black italic">Passed</span>
                        )}
                        <span className="font-mono text-[10px] text-black/60 select-all font-semibold">ID: {app.id}</span>
                      </div>

                      <div>
                        <h4 className="font-sans text-sm font-black text-black">{app.doctorName}</h4>
                        <p className="text-xs text-black font-black uppercase tracking-wider">{app.doctorSpecialty}</p>
                      </div>

                      {app.reason && (
                        <p className="text-xs text-black font-semibold max-w-md pl-2 border-l-2 border-[#F4A6C1] italic">
                          "{app.reason}"
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs font-black text-black">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-black" />
                          {app.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-black" />
                          {app.timeSlot}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT CELL CONTROLS */}
                    <div className="flex sm:flex-col justify-end items-end gap-2">
                      {app.status === 'pending' && (
                        <button
                          onClick={() => handleCancelAppointment(app.id)}
                          className="rounded-xl border border-black hover:bg-[#F4A6C1] text-black font-sans text-xs font-black px-4 py-2 transition tracking-wider uppercase active:scale-95 cursor-pointer"
                          id={`appt_cancel_btn_${app.id}`}
                        >
                          Cancel Booking
                        </button>
                      )}
                      
                      {app.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelAppointment(app.id)}
                          className="rounded-xl border border-black hover:bg-[#F4A6C1] text-black font-sans text-xs font-black px-4 py-2 transition tracking-wider uppercase active:scale-95 cursor-pointer"
                          id={`appt_cancel_btn_${app.id}`}
                        >
                          Cancel Request
                        </button>
                      )}

                      <span className="text-[10px] text-black/60 font-mono font-black mt-auto uppercase">
                        Booked: {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REPORTS STORAGE & UPLOADER (5 SPANS) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* A. REPORT UPLOAD CONTROLLER */}
          <div className="rounded-2xl border border-[#ADD8E6] bg-white p-5 shadow-xs space-y-4 text-black">
            <h3 className="font-sans text-sm font-black text-black flex items-center gap-2">
              <FilePlus className="h-4.5 w-4.5 text-black" />
              Upload Medical Report Code
            </h3>

            <form onSubmit={handleReportUploadSubmit} className="space-y-4">
              {fileError && (
                <div className="rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1] p-2.5 font-sans text-xs text-black font-black">
                  ⚠️ {fileError}
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1">
                <label className="font-sans text-[10px] uppercase font-black text-black/60">
                  Document Title / Lab Test Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. ECG Screen June, Blood Chemistry"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                  id="uploader_title_input"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1">
                <label className="font-sans text-[10px] uppercase font-black text-black/60">
                  Description / General Doctor Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fasting sugar levels within normal index..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                  id="uploader_desc_input"
                />
              </div>

              {/* DRAG AND DROP ZONE */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                  dragActive 
                    ? 'border-[#F4A6C1] bg-[#F4A6C1]/10' 
                    : selectedFileObj 
                      ? 'border-[#ADD8E6] bg-neutral-50' 
                      : 'border-[#ADD8E6] hover:border-[#F4A6C1] hover:bg-neutral-50/50'
                }`}
                id="uploader_drop_zone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
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
                        Accepts PDFs, PNGs, and Doc files up to 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* UPLOAD SUBMIT ACTION */}
              <button
                type="submit"
                disabled={uploading || !selectedFileObj}
                className="w-full rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] border border-black text-black font-sans text-xs font-black py-2.5 shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                id="uploader_submit_btn"
              >
                {uploading ? "Uploading Lab File..." : "Append Report to Medical File"}
              </button>
            </form>
          </div>

          {/* B. HISTORICAL REPORTS VIEWER */}
          <div className="space-y-4 text-black">
            <h3 className="font-sans text-sm font-black text-black flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-black" />
              Your Diagnostic Reports File ({reports.length})
            </h3>

            {reports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#ADD8E6] p-6 text-center text-xs text-black/65 font-bold bg-white">
                No diagnostic files or medical report documents recorded under this user profile ID.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="rounded-xl border border-[#ADD8E6] bg-white p-4 shadow-2xs hover:shadow-xs transition flex items-start gap-3 relative group text-black"
                    id={`report_card_${rep.id}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ADD8E6]/25 border border-[#ADD8E6] text-black">
                      <FileText className="h-5 w-5 text-black" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-sans text-xs font-black text-black truncate">
                          {rep.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Download link simulated from safe Base64 fileDataURL */}
                          <a
                            href={rep.fileDataURL}
                            download={rep.fileName}
                            title="Save report"
                            className="text-black hover:scale-110 transition p-1 hover:bg-[#ADD8E6]/20 rounded-md"
                            id={`report_download_btn_${rep.id}`}
                          >
                            <Download className="h-3.5 w-3.5 text-black" />
                          </a>

                          {/* DELETE CONTROL */}
                          <button
                            onClick={() => handleDeleteReport(rep.id)}
                            className="text-black hover:text-[#F4A6C1] hover:scale-110 transition p-1 hover:bg-red-50 rounded-md"
                            title="Delete document"
                            id={`report_delete_btn_${rep.id}`}
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

      </div>

    </div>
  );
}
