import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  Home,
  Layers,
  Stethoscope,
  BookOpen,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  activeView: 'home' | 'departments' | 'doctors' | 'dashboard' | 'admin' | 'thesaurus';
  onChangeView: (view: 'home' | 'departments' | 'doctors' | 'dashboard' | 'admin' | 'thesaurus') => void;
  onLoginClick: (role?: 'patient' | 'admin') => void;
  onLogout: () => void;
  isFirebaseCloud: boolean;
}

export default function Navbar({
  user,
  activeView,
  onChangeView,
  onLoginClick,
  onLogout,
  isFirebaseCloud,
}: NavbarProps) {
  
  // State to manage the refined hamburger menu panel
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (view: 'home' | 'departments' | 'doctors' | 'dashboard' | 'admin' | 'thesaurus') => {
    onChangeView(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ADD8E6] bg-white font-sans tracking-wide">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* BRAND LOGO DESIGNED WITH LIGHT BLUE & PINK ACCENTS - WRITING STRICTLY BLACK */}
        <div 
          onClick={() => handleLinkClick('home')} 
          className="flex cursor-pointer items-center gap-3 transition-transform active:scale-95 group"
          id="navbar_logo"
          title="Go to Home"
        >
          {/* WHO Ribbon Emblem combining brand pink (#F4A6C1) and brand blue (#ADD8E6) */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#F4A6C1] to-[#ADD8E6] text-black shadow-sm transition-transform group-hover:rotate-6">
            <svg className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8.5 9 10.5 10.5 12.5L7 19.5C6.5 20.5 7.2 21.5 8.3 21.5C8.8 21.5 9.3 21.2 9.5 20.8L12 15.5L14.5 20.8C14.7 21.2 15.2 21.5 15.7 21.5C16.8 21.5 17.5 20.5 17 19.5L13.5 12.5C15 10.5 16.5 8.5 16.5 6.5C16.5 4 14.5 2 12 2ZM12 11.5C10.5 9.5 9.5 8 9.5 6.5C9.5 5.1 10.6 4 12 4C13.4 4 14.5 5.1 14.5 6.5C14.5 8 13.5 9.5 12 11.5Z" />
            </svg>
          </div>
          <div>
            <span className="font-sans text-lg font-black tracking-tight text-black leading-none block">
              GreenCare <span className="text-black font-black uppercase">Oncology</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F4A6C1] animate-ping"></span>
              <span className="font-mono text-[8px] font-black uppercase tracking-widest text-black">
                {isFirebaseCloud ? "WHO Cloud DB Synced" : "Oncology Sandbox Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLS SECTION: UNIFIED SIGN-IN / SIGN-OUT AND DECK HAMBURGER - ALL WRITING BLACK */}
        <div className="flex items-center gap-4">
          
          {/* REFINED SESSION PORTAL ACCESS */}
          {user ? (
            <div className="flex items-center gap-2">
              
              {/* Profile Shortcut */}
              <button
                onClick={() => handleLinkClick(user.role === 'admin' ? 'admin' : 'dashboard')}
                title={`Logged in as ${user.displayName} (${user.role})`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ADD8E6]/20 hover:bg-[#ADD8E6]/40 text-black border border-[#ADD8E6] transition-all duration-150 hover:scale-105 cursor-pointer relative"
                id="navbar_profile_avatar"
              >
                <User className="h-4 w-4 text-black" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4A6C1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F4A6C1]"></span>
                </span>
              </button>

              {/* REFINED SIGN-OUT ICON (Black writing & icons on pink backdrop) */}
              <button
                onClick={onLogout}
                title="Sign Out of Session"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4A6C1] text-black bg-[#F4A6C1]/20 hover:bg-[#F4A6C1]/40 transition-all duration-150 hover:scale-105 cursor-pointer"
                id="navbar_logout_btn"
              >
                <LogOut className="h-4 w-4 text-black" />
              </button>

            </div>
          ) : (
            /* REFINED SIGN-IN ICON (Black writing/icons on pink backdrop) */
            <button
              onClick={() => onLoginClick('patient')}
              title="Secure Sign In Gateway"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4A6C1]/40 bg-[#F4A6C1]/20 hover:bg-[#F4A6C1]/40 text-black transition-all duration-150 hover:scale-105 cursor-pointer"
              id="navbar_login_patient_btn"
            >
              <LogIn className="h-4.5 w-4.5 text-black" />
            </button>
          )}

          {/* UNIFIED HAMBURGER MENU BUTTON - PINK AND LIGHT BLUE BACKGROUND WITH BLACK ICON */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
              isMenuOpen 
                ? 'bg-[#F4A6C1] text-black border-[#F4A6C1] scale-105 rotate-90' 
                : 'bg-[#ADD8E6]/30 hover:bg-[#ADD8E6]/50 text-black border-[#ADD8E6]'
            }`}
            id="hamburger_menu_trigger"
            aria-label="Toggle Navigation Panel"
            title="Toggle Menu Panel"
          >
            {isMenuOpen ? <X className="h-5 w-5 text-black" /> : <Menu className="h-5 w-5 text-black" />}
          </button>
        </div>

      </div>

      {/* REFINED GLASS-MORPHIC HAMBURGER CONTROL PANEL - ALL WRITING BLACK */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-[#ADD8E6] bg-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 z-50">
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
            
            {/* Minimalist Subtitle - Black text */}
            <div className="text-center space-y-1">
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-black bg-[#F4A6C1]/30 px-3.5 py-1.5 rounded-full border border-[#F4A6C1]/40 inline-block">
                Oncology Navigation Matrix
              </span>
              <p className="text-[10px] text-black font-black uppercase tracking-wide mt-2">
                Select clinical department layout below
              </p>
            </div>

            {/* Navigational LOGOS/ICONS ONLY Grid (Black writing/icons) */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 max-w-2xl mx-auto justify-center items-center">
              
              {/* Icon 1: Home View */}
              <div className="flex flex-col items-center group relative">
                <button
                  onClick={() => handleLinkClick('home')}
                  className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-sm relative ${
                    activeView === 'home' 
                      ? 'bg-[#F4A6C1] border-[#F4A6C1] text-black shadow-lg scale-110' 
                      : 'bg-[#ADD8E6]/20 border-[#ADD8E6]/40 text-black hover:bg-[#F4A6C1]/30 hover:border-[#F4A6C1]/50 hover:-translate-y-1'
                  }`}
                  id="nav_icon_home"
                >
                  <Home className="h-6 w-6 text-black" />
                </button>
                <span className="mt-2 font-mono text-[9px] font-black uppercase tracking-widest text-black">
                  Home
                </span>
                {/* Micro Tooltip */}
                <div className="absolute -top-8 bg-black text-white text-[8px] font-mono uppercase tracking-wider px-2 py-1 rounded shadow-md opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
                  Home Layout
                </div>
              </div>

              {/* Icon 2: Specialties / Divisions */}
              <div className="flex flex-col items-center group relative">
                <button
                  onClick={() => handleLinkClick('departments')}
                  className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-sm relative ${
                    activeView === 'departments' 
                      ? 'bg-[#F4A6C1] border-[#F4A6C1] text-black shadow-lg scale-110' 
                      : 'bg-[#ADD8E6]/20 border-[#ADD8E6]/40 text-black hover:bg-[#F4A6C1]/30 hover:border-[#F4A6C1]/50 hover:-translate-y-1'
                  }`}
                  id="nav_icon_departments"
                >
                  <Layers className="h-6 w-6 text-black" />
                </button>
                <span className="mt-2 font-mono text-[9px] font-black uppercase tracking-widest text-black">
                  Divisions
                </span>
                {/* Micro Tooltip */}
                <div className="absolute -top-8 bg-black text-white text-[8px] font-mono uppercase tracking-wider px-2 py-1 rounded shadow-md opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
                  Clinical Divisions
                </div>
              </div>

              {/* Icon 3: Oncologists Staff */}
              <div className="flex flex-col items-center group relative">
                <button
                  onClick={() => handleLinkClick('doctors')}
                  className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-sm relative ${
                    activeView === 'doctors' 
                      ? 'bg-[#F4A6C1] border-[#F4A6C1] text-black shadow-lg scale-110' 
                      : 'bg-[#ADD8E6]/20 border-[#ADD8E6]/40 text-black hover:bg-[#F4A6C1]/30 hover:border-[#F4A6C1]/50 hover:-translate-y-1'
                  }`}
                  id="nav_icon_doctors"
                >
                  <Stethoscope className="h-6 w-6 text-black" />
                </button>
                <span className="mt-2 font-mono text-[9px] font-black uppercase tracking-widest text-black">
                  Oncologists
                </span>
                {/* Micro Tooltip */}
                <div className="absolute -top-8 bg-black text-white text-[8px] font-mono uppercase tracking-wider px-2 py-1 rounded shadow-md opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
                  Specialist Staff
                </div>
              </div>

              {/* Icon 4: OncoSentry AI Thesaurus */}
              <div className="flex flex-col items-center group relative">
                <button
                  onClick={() => handleLinkClick('thesaurus')}
                  className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-sm relative ${
                    activeView === 'thesaurus' 
                      ? 'bg-[#F4A6C1] border-[#F4A6C1] text-black shadow-lg scale-110' 
                      : 'bg-[#ADD8E6]/20 border-[#ADD8E6]/40 text-black hover:bg-[#F4A6C1]/30 hover:border-[#F4A6C1]/50 hover:-translate-y-1'
                  }`}
                  id="nav_icon_thesaurus"
                >
                  <BookOpen className="h-6 w-6 text-black" />
                </button>
                <span className="mt-2 font-mono text-[9px] font-black uppercase tracking-widest text-black">
                  AI GLOSSARY
                </span>
                {/* Micro Tooltip */}
                <div className="absolute -top-8 bg-black text-white text-[8px] font-mono uppercase tracking-wider px-2 py-1 rounded shadow-md opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
                  OncoSentry AI
                </div>
              </div>

              {/* Icon 5: Patient Dashboard */}
              <div className="flex flex-col items-center group relative">
                <button
                  onClick={() => {
                    if (user) {
                      handleLinkClick('dashboard');
                    } else {
                      onLoginClick('patient');
                      setIsMenuOpen(false);
                    }
                  }}
                  className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-sm relative ${
                    user && activeView === 'dashboard'
                      ? 'bg-[#F4A6C1] border-[#F4A6C1] text-black shadow-lg scale-110'
                      : 'bg-[#ADD8E6]/20 border-[#ADD8E6]/40 text-black hover:bg-[#F4A6C1]/30 hover:border-[#F4A6C1]/50 hover:-translate-y-1'
                  }`}
                  id="nav_icon_dashboard"
                >
                  <LayoutDashboard className="h-6 w-6 text-black" />
                </button>
                <span className="mt-2 font-mono text-[9px] font-black uppercase tracking-widest text-black">
                  {user ? "Portal" : "Sign In"}
                </span>
                {/* Micro Tooltip */}
                <div className="absolute -top-8 bg-black text-white text-[8px] font-mono uppercase tracking-wider px-2 py-1 rounded shadow-md opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
                  Patient Dashboard
                </div>
              </div>

              {/* Icon 6: Admin Gateway Panel */}
              <div className="flex flex-col items-center group relative">
                <button
                  onClick={() => {
                    if (user && user.role === 'admin') {
                      handleLinkClick('admin');
                    } else {
                      onLoginClick('admin');
                      setIsMenuOpen(false);
                    }
                  }}
                  className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-sm relative ${
                    user && user.role === 'admin' && activeView === 'admin'
                      ? 'bg-[#F4A6C1] border-[#F4A6C1] text-black shadow-lg scale-110'
                      : 'bg-[#ADD8E6]/20 border-[#ADD8E6]/40 text-black hover:bg-[#F4A6C1]/30 hover:border-[#F4A6C1]/50 hover:-translate-y-1'
                  }`}
                  id="nav_icon_admin"
                >
                  <Shield className="h-6 w-6 text-black" />
                </button>
                <span className="mt-2 font-mono text-[9px] font-black uppercase tracking-widest text-black">
                  {user && user.role === 'admin' ? "ADMIN" : "STAFF"}
                </span>
                {/* Micro Tooltip */}
                <div className="absolute -top-8 bg-black text-white text-[8px] font-mono uppercase tracking-wider px-2 py-1 rounded shadow-md opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap">
                  Staff Console
                </div>
              </div>

            </div>

            {/* INTEGRATED SOCIAL HANDLES - BLACK TEXT AND ICONS ON BRANDING SHADES */}
            <div className="pt-8 border-t border-[#ADD8E6]/40 flex flex-col items-center gap-4">
              <span className="font-mono text-[8px] font-black uppercase tracking-widest text-black">
                Official Prevention & Screening Channels:
              </span>
              <div className="flex items-center gap-6">
                
                {/* 1. Instagram */}
                <a 
                  href="https://instagram.com/who" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO Instagram Channel" 
                  className="p-3 bg-[#ADD8E6]/20 hover:bg-[#F4A6C1] text-black hover:text-black rounded-full transition-all hover:scale-110 border border-[#ADD8E6]/40"
                >
                  <Instagram className="h-5 w-5 text-black" />
                </a>

                {/* 2. X */}
                <a 
                  href="https://twitter.com/who" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO X Feed" 
                  className="p-3 bg-[#ADD8E6]/20 hover:bg-[#F4A6C1] text-black hover:text-black rounded-full transition-all hover:scale-110 border border-[#ADD8E6]/40"
                >
                  <Twitter className="h-5 w-5 text-black" />
                </a>

                {/* 3. LinkedIn */}
                <a 
                  href="https://linkedin.com/company/world-health-organization" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO LinkedIn Workspace" 
                  className="p-3 bg-[#ADD8E6]/20 hover:bg-[#F4A6C1] text-black hover:text-black rounded-full transition-all hover:scale-110 border border-[#ADD8E6]/40"
                >
                  <Linkedin className="h-5 w-5 text-black" />
                </a>

                {/* 4. YouTube */}
                <a 
                  href="https://youtube.com/@who" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO YouTube broadcast library" 
                  className="p-3 bg-[#ADD8E6]/20 hover:bg-[#F4A6C1] text-black hover:text-black rounded-full transition-all hover:scale-110 border border-[#ADD8E6]/40"
                >
                  <Youtube className="h-5 w-5 text-black" />
                </a>

                {/* 5. Facebook */}
                <a 
                  href="https://facebook.com/who" 
                  target="_blank" 
                  rel="noreferrer" 
                  title="WHO Facebook Directory" 
                  className="p-3 bg-[#ADD8E6]/20 hover:bg-[#F4A6C1] text-black hover:text-black rounded-full transition-all hover:scale-110 border border-[#ADD8E6]/40"
                >
                  <Facebook className="h-5 w-5 text-black" />
                </a>

              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
