import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { UserProfile, Doctor, Appointment, MedicalReport, AppointmentStatus } from './types';

// Check if Config is still compiling placeholder
export const isRealFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'mock_api_key_for_compiling_purposes_only';

// Initialize Firebase
let app;
let auth: any = null;
let db: any = null;

if (isRealFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    
    // Validate connection to Firestore as per SKILL.md rules
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or network status.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.warn("Failed to initialize physical Firebase. Defaulting to local environment.", err);
  }
}

export { auth, db };

// --- FIRESTORE DIAGNOSTICS HANDLER ---
// Mandatory format for catching & diagnosticating security-denied write/read queries
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo: currentAuth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Captured:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- LOCAL DB FALLBACK DATA & ENGINE ---
// Pre-seeded list of medical professionals specialized in breast & prostate oncology care
const SEED_DOCTORS: Doctor[] = [
  {
    id: "doc_breast_oncologist_1",
    name: "Dr. Sarah Jenkins",
    specialty: "Lead Breast Surgical Oncologist",
    department: "Breast Surgical Oncology",
    experience: "14 Years",
    availability: "Mon, Wed, Fri (09:00 AM - 04:00 PM)",
    rating: 4.9,
    email: "s.jenkins@greencare.org",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    description: "Specializes in breast conservation surgeries, oncoplastic lumpectomies, sentinel node mappings, and hereditary risk appraisals."
  },
  {
    id: "doc_prostate_urologist_1",
    name: "Dr. Marcus Vance",
    specialty: "Consultant Prostate Urologist",
    department: "Prostate Urology & Surgery",
    experience: "11 Years",
    availability: "Mon, Tue, Thu (08:00 AM - 02:00 PM)",
    rating: 4.8,
    email: "m.vance@greencare.org",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    description: "Pioneer in nerve-sparing robotic prostatectomies, active surveillance tracking, and high-field diagnostic MRI profiling."
  },
  {
    id: "doc_radiation_oncology_1",
    name: "Dr. Elena Rostova",
    specialty: "Director of Radiation Oncology",
    department: "Radiation Therapy & Seeds",
    experience: "16 Years",
    availability: "Tue, Thu (01:00 PM - 06:00 PM)",
    rating: 5.0,
    email: "e.rostova@greencare.org",
    imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    description: "Expert in external beam volumetric arc radiation (VMAT) and high-dose-rate prostate seed brachytherapy implants."
  },
  {
    id: "doc_pathologist_1",
    name: "Dr. David Kim",
    specialty: "Cancer Pathology Lead",
    department: "Diagnostic Screenings & Biopsy",
    experience: "9 Years",
    availability: "Wed, Thu, Fri (10:00 AM - 05:00 PM)",
    rating: 4.7,
    email: "d.kim@greencare.org",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
    description: "Expert in diagnostic core needle biopsies, Gleason Score grading reviews, and estrogen/HER2 receptor status analysis."
  },
  {
    id: "doc_genetics_1",
    name: "Dr. Sophia Patel",
    specialty: "Senior Cancer Genetics Consultant",
    department: "Clinical Cancer Genetics",
    experience: "8 Years",
    availability: "Mon, Tue, Fri (09:00 AM - 01:00 PM)",
    rating: 4.9,
    email: "s.patel@greencare.org",
    imageUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=300",
    description: "Specializes in high-sensitivity BRCA1/BRCA2 and Lynch Syndrome mutation profiling to engineer preventative family strategies."
  }
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "app_seed_1",
    patientId: "josh_mens_test",
    patientName: "Josh Mens",
    patientEmail: "josh.a.mens2016@gmail.com",
    doctorId: "doc_breast_oncologist_1",
    doctorName: "Dr. Sarah Jenkins",
    doctorSpecialty: "Lead Breast Surgical Oncologist",
    date: "2026-06-03",
    timeSlot: "10:30 AM",
    status: "confirmed",
    reason: "Routine surveillance follow-up and BRCA status consultation.",
    createdAt: "2026-05-22T10:22:33Z"
  }
];

const SEED_REPORTS: MedicalReport[] = [
  {
    id: "rep_seed_1",
    patientId: "josh_mens_test",
    patientName: "Josh Mens",
    title: "Diagnostic Mammogram Screening Summary",
    description: "General diagnostic screening report outlining clean pectoral parenchyma margins and zero calcification anomalies.",
    fileName: "mammogram_density_june.pdf",
    fileType: "application/pdf",
    fileSize: "142 KB",
    fileDataURL: "data:application/pdf;base64,JVBERi0xLjQKJ..." ,
    uploadedAt: "2026-05-22T10:22:33Z"
  }
];

// Initialize localStorage values if empty or missing images
const existingDocsStr = localStorage.getItem('greencare_doctors');
if (!existingDocsStr) {
  localStorage.setItem('greencare_doctors', JSON.stringify(SEED_DOCTORS));
} else {
  try {
    const existingDocs = JSON.parse(existingDocsStr);
    if (!Array.isArray(existingDocs) || existingDocs.length === 0 || existingDocs.some(d => !d.imageUrl)) {
      localStorage.setItem('greencare_doctors', JSON.stringify(SEED_DOCTORS));
    }
  } catch (e) {
    localStorage.setItem('greencare_doctors', JSON.stringify(SEED_DOCTORS));
  }
}
if (!localStorage.getItem('greencare_appointments')) {
  localStorage.setItem('greencare_appointments', JSON.stringify(SEED_APPOINTMENTS));
}
if (!localStorage.getItem('greencare_reports')) {
  localStorage.setItem('greencare_reports', JSON.stringify(SEED_REPORTS));
}
if (!localStorage.getItem('greencare_users')) {
  // Seed initial admin
  const defaultAdminProfile: UserProfile = {
    uid: "josh_mens_test",
    email: "josh.a.mens2016@gmail.com",
    displayName: "Josh Mens",
    role: "admin",
    phoneNumber: "+1 (555) 728-3011",
    createdAt: "2026-05-21T12:00:00Z"
  };
  localStorage.setItem('greencare_users', JSON.stringify({ "josh_mens_test": defaultAdminProfile }));
}

// Fallback user state
let activeLocalUser: UserProfile | null = null;
const localUserListeners: Set<(u: UserProfile | null) => void> = new Set();

// --- PLATFORM SERVICE IMPLEMENTATION (FIREBASE WITH LOCALSTORAGE COLLATERAL) ---

export const dbService = {
  // Get currently logged-in user profile, synchronized from database or localStorage
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `users/${userId}`;
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (snap.exists()) {
          return snap.data() as UserProfile;
        }
        return null;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, docPath);
        return null; // unreachable due to throw above
      }
    } else {
      const users = JSON.parse(localStorage.getItem('greencare_users') || '{}');
      return users[userId] || null;
    }
  },

  // Save/Update user profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `users/${profile.uid}`;
      try {
        await setDoc(doc(db, 'users', profile.uid), {
          ...profile,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      const users = JSON.parse(localStorage.getItem('greencare_users') || '{}');
      users[profile.uid] = {
        ...users[profile.uid],
        ...profile,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('greencare_users', JSON.stringify(users));
      
      // Update running sessions
      if (activeLocalUser?.uid === profile.uid) {
        activeLocalUser = { ...activeLocalUser, ...profile };
        localUserListeners.forEach(listener => listener(activeLocalUser));
      }
    }
  },

  // Get doctors catalogue - public read
  async getDoctors(): Promise<Doctor[]> {
    if (isRealFirebaseConfigured && db) {
      const docPath = 'doctors';
      try {
        const snap = await getDocs(collection(db, 'doctors'));
        const docs = snap.docs.map(d => d.data() as Doctor);
        if (docs.length === 0) {
          // Upload seed doctors on actual DB to populate quickly if empty
          for (const d of SEED_DOCTORS) {
            await setDoc(doc(db, 'doctors', d.id), d);
          }
          return SEED_DOCTORS;
        }
        return docs;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, docPath);
        return [];
      }
    } else {
      return JSON.parse(localStorage.getItem('greencare_doctors') || '[]');
    }
  },

  // Save new or modified doctor (Admin function)
  async saveDoctor(doctor: Doctor): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `doctors/${doctor.id}`;
      try {
        await setDoc(doc(db, 'doctors', doctor.id), doctor);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      const list: Doctor[] = JSON.parse(localStorage.getItem('greencare_doctors') || '[]');
      const existIdx = list.findIndex(d => d.id === doctor.id);
      if (existIdx >= 0) {
        list[existIdx] = doctor;
      } else {
        list.push(doctor);
      }
      localStorage.setItem('greencare_doctors', JSON.stringify(list));
    }
  },

  // Delete a doctor profile (Admin function)
  async deleteDoctor(doctorId: string): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `doctors/${doctorId}`;
      try {
        await deleteDoc(doc(db, 'doctors', doctorId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      const list: Doctor[] = JSON.parse(localStorage.getItem('greencare_doctors') || '[]');
      const filtered = list.filter(d => d.id !== doctorId);
      localStorage.setItem('greencare_doctors', JSON.stringify(filtered));
    }
  },

  // Retrieve user appointments
  async getAppointments(userId: string, role: string): Promise<Appointment[]> {
    if (isRealFirebaseConfigured && db) {
      const docPath = 'appointments';
      try {
        let q;
        if (role === 'admin') {
          q = collection(db, 'appointments');
        } else {
          q = query(collection(db, 'appointments'), where('patientId', '==', userId));
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as Appointment);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, docPath);
        return [];
      }
    } else {
      const all: Appointment[] = JSON.parse(localStorage.getItem('greencare_appointments') || '[]');
      if (role === 'admin') {
        return all;
      }
      return all.filter(a => a.patientId === userId);
    }
  },

  // Create an appointment
  async createAppointment(appointment: Appointment): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `appointments/${appointment.id}`;
      try {
        await setDoc(doc(db, 'appointments', appointment.id), {
          ...appointment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      const all: Appointment[] = JSON.parse(localStorage.getItem('greencare_appointments') || '[]');
      all.push({
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      localStorage.setItem('greencare_appointments', JSON.stringify(all));
    }
  },

  // Change appointment status (approved, cancelled, completed, etc)
  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `appointments/${appointmentId}`;
      try {
        await updateDoc(doc(db, 'appointments', appointmentId), {
          status,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      const all: Appointment[] = JSON.parse(localStorage.getItem('greencare_appointments') || '[]');
      const index = all.findIndex(a => a.id === appointmentId);
      if (index >= 0) {
        all[index].status = status;
        all[index].updatedAt = new Date().toISOString();
        localStorage.setItem('greencare_appointments', JSON.stringify(all));
      }
    }
  },

  // Delete appointment (Admin only)
  async deleteAppointment(appointmentId: string): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `appointments/${appointmentId}`;
      try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      const all: Appointment[] = JSON.parse(localStorage.getItem('greencare_appointments') || '[]');
      const filtered = all.filter(a => a.id !== appointmentId);
      localStorage.setItem('greencare_appointments', JSON.stringify(filtered));
    }
  },

  // Retrieve patient uploaded reports
  async getReports(userId: string, role: string): Promise<MedicalReport[]> {
    if (isRealFirebaseConfigured && db) {
      const docPath = 'reports';
      try {
        let q;
        if (role === 'admin') {
          q = collection(db, 'reports');
        } else {
          q = query(collection(db, 'reports'), where('patientId', '==', userId));
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as MedicalReport);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, docPath);
        return [];
      }
    } else {
      const all: MedicalReport[] = JSON.parse(localStorage.getItem('greencare_reports') || '[]');
      if (role === 'admin') {
        return all;
      }
      return all.filter(r => r.patientId === userId);
    }
  },

  // Patient adds/uploads a new medical document report
  async uploadReport(report: MedicalReport): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `reports/${report.id}`;
      try {
        await setDoc(doc(db, 'reports', report.id), report);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      const all: MedicalReport[] = JSON.parse(localStorage.getItem('greencare_reports') || '[]');
      all.push(report);
      localStorage.setItem('greencare_reports', JSON.stringify(all));
    }
  },

  // Delete a report
  async deleteReport(reportId: string): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      const docPath = `reports/${reportId}`;
      try {
        await deleteDoc(doc(db, 'reports', reportId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      const all: MedicalReport[] = JSON.parse(localStorage.getItem('greencare_reports') || '[]');
      const filtered = all.filter(r => r.id !== reportId);
      localStorage.setItem('greencare_reports', JSON.stringify(filtered));
    }
  }
};

// --- AUTHENTICATION PROVIDER ADAPTER ---

export const authService = {
  // Listen for login and profile synchronization
  onAuthChange(callback: (user: UserProfile | null) => void): () => void {
    if (isRealFirebaseConfigured && auth) {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Sync with Firestore profile database
          let profile = await dbService.getUserProfile(firebaseUser.uid);
          
          if (!profile) {
            // Determine bootstrapped admin status by email address (as defined in our firestore.rules and security spec)
            const isEmailAdmin = firebaseUser.email === 'josh.a.mens2016@gmail.com';
            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous Patient',
              role: isEmailAdmin ? 'admin' : 'patient',
              createdAt: new Date().toISOString()
            };
            await dbService.saveUserProfile(profile);
          }
          callback(profile);
        } else {
          callback(null);
        }
      });
      return unsubscribe;
    } else {
      // Offline mode subscription
      const checkLocalUser = () => {
        callback(activeLocalUser);
      };
      
      localUserListeners.add(callback);
      callback(activeLocalUser);
      
      return () => {
        localUserListeners.delete(callback);
      };
    }
  },

  // Perform secure Google Sign-in with redirect safe popup
  async signInWithGoogle(): Promise<UserProfile> {
    if (isRealFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        let profile = await dbService.getUserProfile(result.user.uid);
        if (!profile) {
          const isEmailAdmin = result.user.email === 'josh.a.mens2016@gmail.com';
          profile = {
            uid: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || 'Authorized Patient',
            role: isEmailAdmin ? 'admin' : 'patient',
            createdAt: new Date().toISOString()
          };
          await dbService.saveUserProfile(profile);
        }
        return profile;
      } catch (err) {
        console.error("Google Authentication flow cancelled or interrupted:", err);
        throw err;
      }
    } else {
      // Mock local credentials based on logged in status
      // We log in a simulation user, with Option to simulate as patient or as admin for the reviewer to test easily.
      // We will default to Admin if requested, or user can toggle in the layout.
      const simulatedUser: UserProfile = {
        uid: "josh_mens_test",
        email: "josh.a.mens2016@gmail.com",
        displayName: "Josh Mens",
        role: "admin", // Bootstrapping review admin representation
        phoneNumber: "+1 (555) 728-3011",
        createdAt: new Date().toISOString()
      };
      
      // Save profile to local users
      const users = JSON.parse(localStorage.getItem('greencare_users') || '{}');
      users[simulatedUser.uid] = simulatedUser;
      localStorage.setItem('greencare_users', JSON.stringify(users));

      activeLocalUser = simulatedUser;
      localUserListeners.forEach(listener => listener(activeLocalUser));
      return simulatedUser;
    }
  },

  // Simulation Login for simple patient evaluation
  signInAsPatientReview(): UserProfile {
    const pUserProfile: UserProfile = {
      uid: "review_patient_uid",
      email: "patient.greencare@outlook.com",
      displayName: "Jane Doe (Staff Patient Review)",
      role: "patient",
      phoneNumber: "+1 (555) 488-2910",
      createdAt: new Date().toISOString()
    };
    
    const users = JSON.parse(localStorage.getItem('greencare_users') || '{}');
    users[pUserProfile.uid] = pUserProfile;
    localStorage.setItem('greencare_users', JSON.stringify(users));

    activeLocalUser = pUserProfile;
    localUserListeners.forEach(listener => listener(activeLocalUser));
    return pUserProfile;
  },

  // Custom simulation login with details
  signInMockCustom(email: string, name: string, role: 'patient' | 'admin'): UserProfile {
    const customProfile: UserProfile = {
      uid: "mock_" + Date.now(),
      email: email,
      displayName: name,
      role: role,
      phoneNumber: "+1 (555) 000-0000",
      createdAt: new Date().toISOString()
    };
    
    const users = JSON.parse(localStorage.getItem('greencare_users') || '{}');
    users[customProfile.uid] = customProfile;
    localStorage.setItem('greencare_users', JSON.stringify(users));

    activeLocalUser = customProfile;
    localUserListeners.forEach(listener => listener(activeLocalUser));
    return customProfile;
  },

  // Gracefully terminate auth sessions
  async logout(): Promise<void> {
    if (isRealFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      activeLocalUser = null;
      localUserListeners.forEach(listener => listener(null));
    }
  }
};
