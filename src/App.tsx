import React, { useState, useEffect } from 'react';
import { UserProfile, Doctor, Appointment } from './types';
import { authService, dbService, isRealFirebaseConfigured } from './firebase';

// Subcomponents imports
import Navbar from './components/Navbar';
import HomeSection from './components/HomeSection';
import DepartmentsSection from './components/DepartmentsSection';
import DoctorsSection from './components/DoctorsSection';
import ThesaurusSection from './components/ThesaurusSection';
import BookingModal from './components/BookingModal';
import PatientDashboard from './components/PatientDashboard';
import AdminPanel from './components/AdminPanel';

// Icons for authorization prompts
import { Stethoscope, Calendar, ArrowRight, ShieldCheck, Mail, LogIn, Database, Activity, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'departments' | 'doctors' | 'dashboard' | 'admin' | 'thesaurus'>('home');
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  
  // Filtering and Modal States
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preSelectedDoctor, setPreSelectedDoctor] = useState<Doctor | null>(null);
  const [authFormOpen, setAuthFormOpen] = useState(false);
  
  // Custom manual login forms
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'patient' | 'admin'>('patient');
  const [authError, setAuthError] = useState('');

  // Function to retrieve all appointments so we can calculate live queues
  const loadAppointments = async () => {
    try {
      // Fetching is synchronized across local storage or active firebase settings
      const list = await dbService.getAppointments('josh_mens_test', 'admin');
      setAppointmentsList(list);
    } catch (err) {
      console.error("Failed to load appointments queue", err);
    }
  };

  // 1. CHRONOLOGICAL LISTENER FOR AUTH CHANGES AND DATA INGESTION
  useEffect(() => {
    const unsub = authService.onAuthChange((syncedUser) => {
      setUser(syncedUser);
      if (syncedUser) {
        setAuthFormOpen(false);
      } else {
        if (activeView === 'dashboard' || activeView === 'admin') {
          setActiveView('home');
        }
      }
    });

    // 2. LOAD DIRECTORY OF SPECIALISTS AND ACTIVE QUEUES
    const loadClinicalDirectory = async () => {
      try {
        const docs = await dbService.getDoctors();
        setDoctorsList(docs);
        await loadAppointments();
      } catch (err) {
        console.error("Failed to register live clinical data", err);
      }
    };

    loadClinicalDirectory();
    return () => unsub();
  }, [activeView]);

  // --- ACTIONS ---
  
  const handleSelectDepartmentQuery = (deptName: string) => {
    setSelectedDeptFilter(deptName);
    setActiveView('doctors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitiateBooking = (doctor: Doctor) => {
    setPreSelectedDoctor(doctor);
    setBookingModalOpen(true);
  };

  const handleBookImmediateGeneral = () => {
    setPreSelectedDoctor(null);
    setBookingModalOpen(true);
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      const profile = await authService.signInWithGoogle();
      setUser(profile);
      setAuthFormOpen(false);
      await loadAppointments();
    } catch (err) {
      console.warn("Google authentication trace interrupted. Falling back to sandbox profiles.", err);
      setAuthError("Google Sign-in was not completed. Use the fast Sandbox Credentials below to instantly review the clinical panels.");
    }
  };

  const handleImpersonateUser = async (role: 'patient' | 'admin') => {
    if (role === 'admin') {
      const adminProfile = authService.signInMockCustom("josh.a.mens2016@gmail.com", "Josh Mens", "admin");
      setUser(adminProfile);
      setActiveView('admin');
    } else {
      const patientProfile = authService.signInMockCustom("jane.doe.review@outlook.com", "Jane Doe", "patient");
      setUser(patientProfile);
      setActiveView('dashboard');
    }
    setAuthFormOpen(false);
    await loadAppointments();
  };

  const handleManualSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authName.trim()) {
      setAuthError("Please specify email and display name credentials.");
      return;
    }
    const profile = authService.signInMockCustom(authEmail.trim(), authName.trim(), authRole);
    setUser(profile);
    setAuthFormOpen(false);
    await loadAppointments();
    setActiveView(authRole === 'admin' ? 'admin' : 'dashboard');
  };

  const handleSignOut = async () => {
    await authService.logout();
    setUser(null);
    setActiveView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-sky-50/20 text-neutral-800 antialiased selection:bg-red-100">
      
      {/* NAVIGATION HEADER BAR */}
      <Navbar
        user={user}
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          if (view === 'doctors') setSelectedDeptFilter('All');
        }}
        onLoginClick={(role) => {
          if (role) setAuthRole(role);
          setAuthFormOpen(true);
        }}
        onLogout={handleSignOut}
        isFirebaseCloud={isRealFirebaseConfigured}
      />

      {/* CORE WEB VIEWER CONTAINER WITH GENEROUS SPACING Ratios */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {activeView === 'home' && (
          <HomeSection
            onBrowseDoctors={() => { setSelectedDeptFilter('All'); setActiveView('doctors'); }}
            onBrowseDepartments={() => setActiveView('departments')}
            onBookImmediateAppointment={handleBookImmediateGeneral}
            onJoinStaffReview={handleImpersonateUser}
            isLoggedIn={!!user}
          />
        )}

        {activeView === 'departments' && (
          <DepartmentsSection 
            onSelectDepartment={handleSelectDepartmentQuery} 
            appointments={appointmentsList}
          />
        )}

        {activeView === 'doctors' && (
          <DoctorsSection
            doctors={doctorsList}
            selectedDeptFilter={selectedDeptFilter}
            onSelectDeptFilter={setSelectedDeptFilter}
            onInitiateBooking={handleInitiateBooking}
          />
        )}

        {activeView === 'thesaurus' && (
          <ThesaurusSection />
        )}

        {activeView === 'dashboard' && user && (
          <PatientDashboard user={user} onAppointmentUpdate={loadAppointments} />
        )}

        {activeView === 'admin' && user && user.role === 'admin' && (
          <AdminPanel currentUserProfile={user} onAppointmentsChange={loadAppointments} />
        )}

      </main>

      {/* FOOTER ACCENTS - STRICTLY RED AND LIGHT BLUE AND WHITE */}
      <footer className="border-t border-sky-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-center gap-3">
            {/* Red and light blue ribbons visual emblem */}
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-block h-4.5 w-4.5 rounded-full bg-red-600 border border-white shadow-xxs"></span>
              <span className="inline-block h-4.5 w-4.5 rounded-full bg-sky-400 border border-white shadow-xxs"></span>
            </div>
            <span className="font-sans text-sm font-black tracking-tight text-neutral-900">
              GreenCare Precision Oncology Group
            </span>
          </div>
          
          <p className="text-xs text-sky-950 font-semibold max-w-lg mx-auto leading-relaxed">
            International diagnostic excellence in collaborative breast and prostate healthcare. Aligned fully with WHO estimates, screening markers, and confidential reporting protocols.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest pt-4 border-t border-sky-50 max-w-md mx-auto">
            <span>Breast Cancer Awareness</span>
            <span>•</span>
            <span>Prostate Care Standards</span>
            <span>•</span>
            <span>WHO Aligned Staging</span>
          </div>
        </div>
      </footer>

      {/* --- OVERLAY MODALS --- */}

      {/* 1. DYNAMIC APPOINTMENTS BOOKING FORM */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preSelectedDoctor={preSelectedDoctor}
        doctors={doctorsList}
        user={user}
        onAuthTrigger={(role) => {
          if (role) setAuthRole(role);
          setBookingModalOpen(false);
          setAuthFormOpen(true);
        }}
        onBookingSuccessful={async () => {
          await loadAppointments(); // refresh active app lists immediately
          setActiveView('dashboard');
        }}
      />

      {/* 2. SECURITY SIGN UP & DELEGATED AUTH MODAL */}
      {authFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div 
            className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-155"
            id="auth_modal_panel"
          >
            <button
              onClick={() => setAuthFormOpen(false)}
              className="absolute right-4.5 top-4.5 text-neutral-450 hover:text-red-600 p-1.5 rounded-xl border border-sky-50 transition cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-150">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-sans text-md font-extrabold text-neutral-900 leading-none">Security Access Portal</h3>
                <p className="text-[10px] text-sky-700 font-bold tracking-wide mt-1.5">Configure coordinates and screening pathways</p>
              </div>
            </div>

            {authError && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-150 p-3 text-xs text-red-700 font-sans leading-relaxed font-semibold">
                ⚠️ {authError}
              </div>
            )}

            {/* OAUTH EMULATOR BAR */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-sky-100 bg-white px-4 py-3.5 font-sans text-xs font-bold hover:bg-sky-50 text-neutral-850 transition shadow-sm active:scale-95 cursor-pointer"
                id="google_signin_trigger_btn"
              >
                <Database className="h-4.5 w-4.5 text-red-600 animate-pulse" />
                Authenticate with Google Account
              </button>

              <div className="relative my-5 text-center">
                <div className="absolute inset-y-1/2 left-0 right-0 border-t border-sky-100"></div>
                <span className="relative bg-white px-3 font-sans text-[10px] font-bold text-red-600 uppercase tracking-widest">
                  Sandbox Credentials Entrance
                </span>
              </div>

              {/* CREDENTIALS FORM */}
              <form onSubmit={handleManualSignupSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-sans text-[10px] uppercase font-bold text-neutral-450 tracking-wide block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. josh.a.mens2016@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full rounded-xl border border-sky-100 py-3 px-4 font-sans text-xs focus:border-red-600 focus:outline-hidden text-neutral-800"
                    id="mock_auth_email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-sans text-[10px] uppercase font-bold text-neutral-450 tracking-wide block">Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Josh Mens"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full rounded-xl border border-sky-100 py-3 px-4 font-sans text-xs focus:border-red-600 focus:outline-hidden text-neutral-800"
                    id="mock_auth_name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] uppercase font-bold text-neutral-450 tracking-wide block">Select Account Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAuthRole('patient')}
                      className={`rounded-xl py-3 font-sans text-xs font-bold border transition cursor-pointer ${
                        authRole === 'patient'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'border-sky-100 bg-white text-sky-950 hover:bg-sky-50'
                      }`}
                    >
                      Patient Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('admin')}
                      className={`rounded-xl py-3 font-sans text-xs font-bold border transition cursor-pointer ${
                        authRole === 'admin'
                          ? 'bg-sky-55 border-sky-200 text-sky-850'
                          : 'border-sky-100 bg-white text-sky-950 hover:bg-sky-50'
                      }`}
                    >
                      Admin Gateway
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold py-3.5 transition active:scale-95 shadow-md cursor-pointer uppercase tracking-wider"
                  id="mock_auth_submit_btn"
                >
                  Create Profile & Login
                </button>
              </form>

              {/* Review Impersonates */}
              <div className="pt-4 border-t border-sky-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleImpersonateUser('patient')}
                  className="font-sans text-[11px] font-extrabold text-red-600 hover:underline cursor-pointer"
                >
                  ✓ Demo Patient Account
                </button>
                <button
                  type="button"
                  onClick={() => handleImpersonateUser('admin')}
                  className="font-sans text-[11px] font-extrabold text-sky-800 hover:underline cursor-pointer"
                >
                  ✓ Demo Clinical Admin
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
