import React, { useState, useEffect } from 'react';
import { Doctor, UserProfile, Appointment } from '../types';
import { dbService } from '../firebase';
import { Calendar, Clock, X, ChevronRight, MessageSquare } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedDoctor: Doctor | null;
  doctors: Doctor[];
  user: UserProfile | null;
  onAuthTrigger: (role?: 'patient' | 'admin') => void;
  onBookingSuccessful: () => void;
}

const HOURS_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", 
  "03:00 PM", "04:00 PM", "05:00 PM"
];

export default function BookingModal({
  isOpen,
  onClose,
  preSelectedDoctor,
  doctors,
  user,
  onAuthTrigger,
  onBookingSuccessful
}: BookingModalProps) {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-05-25'); // default safety start
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Get current date for min-date enforcement (using 2026-05-22 system clock)
  const currentSystemDate = "2026-05-22";

  useEffect(() => {
    if (preSelectedDoctor) {
      setSelectedDocId(preSelectedDoctor.id);
    } else if (doctors.length > 0) {
      setSelectedDocId(doctors[0].id);
    }
  }, [preSelectedDoctor, doctors, isOpen]);

  if (!isOpen) return null;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorText("Authorisation is required to reserve medical time slots.");
      return;
    }

    const selectedDoctorObj = doctors.find(d => d.id === selectedDocId);
    if (!selectedDoctorObj) {
      setErrorText("Please select a practicing doctor.");
      return;
    }

    if (!selectedDate) {
      setErrorText("Please select a consult date.");
      return;
    }

    setSubmitting(true);
    setErrorText('');

    try {
      const generatedAppointment: Appointment = {
        id: "app_" + Date.now(),
        patientId: user.uid,
        patientName: user.displayName,
        patientEmail: user.email,
        doctorId: selectedDoctorObj.id,
        doctorName: selectedDoctorObj.name,
        doctorSpecialty: selectedDoctorObj.specialty,
        date: selectedDate,
        timeSlot: selectedTime,
        status: 'pending',
        reason: reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dbService.createAppointment(generatedAppointment);
      onBookingSuccessful();
      setReason('');
      onClose();
    } catch (err) {
      console.error(err);
      setErrorText("Failed to sync booking parameters. Please inspect cloud rule logs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg rounded-2xl border border-[#ADD8E6] bg-white p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-black"
        id="booking_form_panel"
      >
        {/* CLOSE CONTROL */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-black hover:text-[#F4A6C1] rounded-lg p-1 transition cursor-pointer"
          id="booking_close_btn"
        >
          <X className="h-5 w-5" />
        </button>

        {/* MODAL HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ADD8E6]/20 border border-[#ADD8E6] text-black">
            <Calendar className="h-5 w-5 text-black" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-black text-black">Book Medical Consult</h2>
            <p className="font-sans text-[11px] text-black/75 font-semibold">Secure real-time appointment scheduling slot</p>
          </div>
        </div>

        {/* CONTENT CONDITION: LOGGED OUT REDIRECT GEYSER */}
        {!user ? (
          <div className="space-y-6 text-center py-4">
            <div className="rounded-2xl bg-[#ADD8E6]/10 p-5 border border-[#ADD8E6]/50 inline-block">
              <span className="text-3xl">🔐</span>
              <h3 className="mt-3 font-sans text-sm font-black text-black">Identification Required</h3>
              <p className="mt-1.5 text-xs text-black/80 max-w-sm font-semibold">
                Before booking appointments or reviewing diagnostic charts, you must sign in to generate a secure medical identifier file.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => onAuthTrigger('patient')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] border border-black text-black font-sans text-xs font-black py-3 transition shadow-md uppercase tracking-wider cursor-pointer"
                id="booking_trigger_patient_auth"
              >
                Sign In & Learn More
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-black py-3 text-black font-sans text-xs font-black hover:bg-neutral-50 transition uppercase tracking-wider cursor-pointer"
              >
                Cancel and Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            
            {errorText && (
              <div className="rounded-xl bg-[#F4A6C1]/20 border border-[#F4A6C1] p-3 font-sans text-xs text-black font-bold">
                ⚠️ {errorText}
              </div>
            )}

            {/* DOCTOR SELECTOR INPUT */}
            <div className="space-y-1.5">
              <label className="font-sans text-[11px] uppercase font-black text-black/60 tracking-wider">
                Attending Staff Specialist
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                disabled={!!preSelectedDoctor}
                className="w-full rounded-xl border border-[#ADD8E6] bg-white py-2.5 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold disabled:bg-neutral-50 disabled:text-black/50"
                id="booking_doctor_dropdown"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({d.department})
                  </option>
                ))}
              </select>
            </div>

            {/* CALENDAR DATE SELECTOR (ENFORCING Chronological system minimum date) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-sans text-[11px] uppercase font-black text-black/60 tracking-wider">
                  <Calendar className="h-3 w-3 text-black" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={currentSystemDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#ADD8E6] py-2.5 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                  id="booking_date_input"
                />
              </div>

              {/* TIMEPICKER */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-sans text-[11px] uppercase font-black text-black/60 tracking-wider">
                  <Clock className="h-3 w-3 text-black" />
                  Select Slot
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full rounded-xl border border-[#ADD8E6] bg-white py-2.5 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold"
                  id="booking_time_input"
                >
                  {HOURS_SLOTS.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CLINICAL SYMPTOMS / NOTES */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-sans text-[11px] uppercase font-black text-black/60 tracking-wider">
                <MessageSquare className="h-3.5 w-3.5 text-black" />
                Reason for appointment
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly detail symptoms, active medication, or regular health screening requirements..."
                rows={3}
                maxLength={450}
                className="w-full rounded-xl border border-[#ADD8E6] py-2 px-3 font-sans text-xs focus:border-[#F4A6C1] focus:outline-hidden text-black font-bold placeholder:text-black/40"
                id="booking_reason_textarea"
              ></textarea>
            </div>

            {/* CONFIRMED DETAILS ROW */}
            <div className="rounded-xl bg-neutral-50 p-3 text-[11px] text-black border border-[#ADD8E6]/40 space-y-1 font-semibold">
              <div><strong>Patient Details:</strong> {user.displayName} (<span className="font-mono">{user.email}</span>)</div>
              <div><strong>Security Context:</strong> Access is bound strictly to this verified patient account identifier.</div>
            </div>

            {/* ACTION TRIGGERS */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#ADD8E6]/40">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-black px-4 py-2 text-xs font-black hover:bg-neutral-50 text-black transition uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#F4A6C1] hover:bg-[#ADD8E6] border border-black text-black font-sans text-xs font-black px-6 py-2 shadow-md transition active:scale-95 disabled:opacity-50 uppercase tracking-wider cursor-pointer"
                id="booking_form_submit_btn"
              >
                {submitting ? "Booking Consult..." : "Confirm Consult Slot"}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
