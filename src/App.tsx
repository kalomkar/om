import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudentForm } from './components/StudentForm';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherLogin } from './components/TeacherLogin';
import { RequestTracker } from './components/RequestTracker';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { ShareModal } from './components/ShareModal';
import { ProjectReportModal } from './components/ProjectReportModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { Sparkles } from 'lucide-react';
import { StudentRequest, RequestStatus } from './types';
import { 
  subscribeToRequests, 
  updateRequestInFirestore, 
  deleteRequestFromFirestore, 
  saveRequestToFirestore,
  fetchAllRequestsFromFirestore 
} from './lib/requestsService';
import { testConnection } from './lib/firebase';
import { clearActiveTeacherSession, getActiveTeacherSession } from './lib/teacherService';

const INITIAL_SEED_DATA: StudentRequest[] = [
  {
    id: 'REQ-10482',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS-2024-42',
    className: 'B.Tech CS 3rd Year',
    section: 'Section B',
    previousCollegeName: 'Govt PU College, Kalaburagi',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@college.edu',
    category: 'certificate',
    title: 'Bonafide Certificate for National Scholarship Application',
    description: 'Sir, I need a Bonafide Certificate with college stamp to apply for the State Merit Scholarship. The last date of submission is next Monday.',
    urgency: 'high',
    status: 'pending',
    skillRatings: {
      programming: 'Intermediate',
      googleDocsWord: 'Advanced',
      googleSheetsExcel: 'Intermediate',
      googleForms: 'Advanced',
      reportWriting: 'Advanced',
      englishCommunication: 'Intermediate'
    },
    academicRequirements: [
      'Extra Periods / Doubt Classes',
      'Project Work with Report Writing',
      'Interview Preparation'
    ],
    extraRequirementsNote: 'Need extra sessions on data structures and formal report writing formatting.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    notificationSent: true,
    notificationDetails: {
      smsSent: true,
      emailSent: true,
      sentAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    }
  },
  {
    id: 'REQ-10481',
    studentName: 'Priya Verma',
    rollNumber: 'CS-2024-18',
    className: 'B.Tech CS 3rd Year',
    section: 'Section A',
    previousCollegeName: 'St. Xavier Junior College',
    phone: '+91 98123 45678',
    email: 'priya.verma@college.edu',
    category: 'leave',
    title: 'Medical Leave Application (3 Days)',
    description: 'Respected Teacher, I am down with viral fever. Requesting permission for leave from 10th to 12th. Medical prescription is attached.',
    urgency: 'urgent',
    attachedFile: {
      name: 'medical_certificate_prescription.pdf',
      size: 145200,
      type: 'application/pdf',
    },
    status: 'in_review',
    teacherRemarks: 'Prescription noted. Get well soon and submit lab assignments upon return.',
    skillRatings: {
      programming: 'Beginner',
      googleDocsWord: 'Intermediate',
      googleSheetsExcel: 'Beginner',
      googleForms: 'Intermediate',
      reportWriting: 'Beginner',
      englishCommunication: 'Advanced'
    },
    academicRequirements: [
      'Extra Periods / Doubt Classes',
      'English Grammar & Communication',
      'Presentation Slides'
    ],
    extraRequirementsNote: 'Requesting additional doubt clearing periods in Java programming.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    notificationSent: true,
    notificationDetails: {
      smsSent: true,
      emailSent: true,
      sentAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    }
  },
  {
    id: 'REQ-10479',
    studentName: 'Rahul Patel',
    rollNumber: 'CS-2024-55',
    className: 'B.Tech CS 3rd Year',
    section: 'Section B',
    previousCollegeName: 'National Model School & College',
    phone: '+91 97234 56789',
    email: 'rahul.patel@college.edu',
    category: 'document',
    title: 'Official 4th Semester Marksheet Duplicate Copy',
    description: 'Sir, I have misplaced my hardcopy marksheet of 4th Semester and need a verified duplicate copy for internship verification.',
    urgency: 'normal',
    status: 'approved',
    teacherRemarks: 'Verified and signed. You can collect the printed original from Admin Block Counter #3.',
    skillRatings: {
      programming: 'Advanced',
      googleDocsWord: 'Advanced',
      googleSheetsExcel: 'Advanced',
      googleForms: 'Advanced',
      reportWriting: 'Advanced',
      englishCommunication: 'Advanced'
    },
    academicRequirements: [
      'Website Design',
      'Interview Preparation'
    ],
    extraRequirementsNote: 'Looking for mock technical interviews before campus placements.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    notificationSent: true,
    notificationDetails: {
      smsSent: true,
      emailSent: true,
      sentAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    }
  }
];

export default function App() {
  const [portal, setPortal] = useState<'student' | 'teacher'>('student');
  const [studentView, setStudentView] = useState<'form' | 'track'>('form');
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('teacher_logged_in') === 'true';
  });

  const [requests, setRequests] = useState<StudentRequest[]>(() => {
    try {
      const cached = localStorage.getItem('student_requests_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SEED_DATA;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<StudentRequest | null>(null);
  const [autoOpenWhatsApp, setAutoOpenWhatsApp] = useState<boolean>(true);
  const [trackingId, setTrackingId] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiRole, setAiRole] = useState<'faculty_copilot' | 'letter_drafter' | 'doubt_solver' | 'student_guide'>('faculty_copilot');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const portalUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleOpenAiModal = (
    role: 'faculty_copilot' | 'letter_drafter' | 'doubt_solver' | 'student_guide' = 'faculty_copilot',
    prompt: string = ''
  ) => {
    setAiRole(role);
    setAiPrompt(prompt);
    setIsAiModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Check URL query parameters for direct links (e.g. ?mode=teacher or ?mode=student or ?track=REQ-XXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') || params.get('portal');
    const track = params.get('track');

    if (mode === 'teacher') {
      setPortal('teacher');
    } else if (mode === 'student') {
      setPortal('student');
      setStudentView('form');
    } else if (mode === 'track' || track) {
      setPortal('student');
      setStudentView('track');
      if (track) setTrackingId(track);
    }
  }, []);

  // Fetch requests from database with resilient fallback and automatic retries
  const fetchRequests = useCallback(async (retryCount = 0) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch('/api/requests', {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRequests(data);
          try {
            localStorage.setItem('student_requests_cache', JSON.stringify(data));
          } catch {
            // storage limit guard
          }
        }
      } else if (retryCount < 2) {
        setTimeout(() => fetchRequests(retryCount + 1), 2000);
      }
    } catch {
      // Quiet recovery: cached data is already active in state
      if (retryCount < 2) {
        setTimeout(() => fetchRequests(retryCount + 1), 2500);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Realtime Cloud Synchronization with Firestore + Local Fallback
  useEffect(() => {
    // 1. Subscribe to Firestore Realtime Updates (instant cross-device sync)
    const unsubscribe = subscribeToRequests((firestoreItems) => {
      if (Array.isArray(firestoreItems) && firestoreItems.length > 0) {
        setRequests((prev) => {
          // Merge preserving any pending items
          const map = new Map<string, StudentRequest>();
          firestoreItems.forEach((it) => map.set(it.id, it));
          prev.forEach((it) => {
            if (!map.has(it.id)) map.set(it.id, it);
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          try {
            localStorage.setItem('student_requests_cache', JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setIsLoading(false);
      }
    });

    // 2. Also fetch from express server/fallback on initial load
    fetchRequests();

    // 3. Periodic poll as backup
    const interval = setInterval(() => {
      fetchRequests();
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [fetchRequests]);

  // Handle successful student submission
  const handleSubmissionSuccess = (newRequest: StudentRequest, openWhatsApp: boolean = true) => {
    setAutoOpenWhatsApp(openWhatsApp);
    setRequests(prev => {
      const updated = [newRequest, ...prev.filter(r => r.id !== newRequest.id)];
      try {
        localStorage.setItem('student_requests_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSubmittedRequest(newRequest);
    showToast(`🎉 Success! Request #${newRequest.id} saved in database.`);
    // Immediate sync with backend database
    setTimeout(() => fetchRequests(), 500);
  };

  // Handle status update by teacher
  const handleUpdateRequest = async (id: string, status: RequestStatus, remarks?: string) => {
    // Optimistic local update
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status, teacherRemarks: remarks, updatedAt: new Date().toISOString() } : r);
      try {
        localStorage.setItem('student_requests_cache', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 1. Sync to Google Cloud Firestore
    try {
      await updateRequestInFirestore(id, { status, teacherRemarks: remarks });
    } catch (fsErr) {
      console.warn('Firestore update sync note:', fsErr);
    }

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, teacherRemarks: remarks }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.request) {
          setRequests(prev => {
            const next = prev.map(r => r.id === id ? data.request : r);
            try { localStorage.setItem('student_requests_cache', JSON.stringify(next)); } catch {}
            return next;
          });
        }
      }
      showToast(`Updated ${id} to ${status.replace('_', ' ')}`);
    } catch {
      showToast(`Updated ${id} locally`);
    }
  };

  // Handle request deletion
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete request ${id}?`)) return;

    setRequests(prev => {
      const next = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem('student_requests_cache', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      await deleteRequestFromFirestore(id);
      await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      showToast(`Request ${id} deleted.`);
    } catch {
      showToast(`Request ${id} deleted locally.`);
    }
  };

  // Teacher Login handler
  const handleTeacherLoginSuccess = () => {
    setIsTeacherLoggedIn(true);
    localStorage.setItem('teacher_logged_in', 'true');
    setPortal('teacher');
    const session = getActiveTeacherSession();
    showToast(`👨‍🏫 Welcome, ${session?.name || 'Teacher'}! Successfully logged in.`);
  };

  // Teacher Logout handler
  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    clearActiveTeacherSession();
    localStorage.removeItem('teacher_logged_in');
    setPortal('student');
    showToast('Logged out successfully.');
  };

  // Direct track navigation from receipt modal
  const handleTrackDirectly = (id: string) => {
    setSubmittedRequest(null);
    setTrackingId(id);
    setPortal('student');
    setStudentView('track');
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col antialiased">
      {/* Dynamic Navbar */}
      <Navbar
        portal={portal}
        studentView={studentView}
        onSelectStudentView={(v) => {
          setPortal('student');
          setStudentView(v);
        }}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onGoToTeacherLogin={() => {
          setPortal('teacher');
        }}
        onTeacherLogout={handleTeacherLogout}
        onOpenShare={() => setIsShareModalOpen(true)}
        onGoToStudent={() => {
          setPortal('student');
          setStudentView('form');
        }}
        onOpenAiModal={() => handleOpenAiModal(portal === 'teacher' ? 'faculty_copilot' : 'student_guide')}
        pendingCount={pendingCount}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-medium flex items-center gap-2 animate-bounce-short">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {portal === 'student' ? (
          /* Student Portal Views */
          studentView === 'form' ? (
            <StudentForm
              onSuccess={handleSubmissionSuccess}
              onOpenAiAssistant={handleOpenAiModal}
            />
          ) : (
            <RequestTracker initialTrackingId={trackingId} />
          )
        ) : (
          /* Teacher Portal Views */
          !isTeacherLoggedIn ? (
            <TeacherLogin
              onLoginSuccess={handleTeacherLoginSuccess}
              onGoToStudent={() => {
                setPortal('student');
                setStudentView('form');
              }}
            />
          ) : (
            <TeacherDashboard
              requests={requests}
              isLoading={isLoading}
              onRefresh={fetchRequests}
              onUpdateRequest={handleUpdateRequest}
              onDeleteRequest={handleDeleteRequest}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenAiAssistant={handleOpenAiModal}
              portalUrl={portalUrl}
            />
          )
        )}
      </main>

      {/* Submission Success & Receipt Modal */}
      {submittedRequest && (
        <SubmissionSuccessModal
          request={submittedRequest}
          onClose={() => setSubmittedRequest(null)}
          onTrack={handleTrackDirectly}
          portalUrl={portalUrl}
          autoOpenWhatsApp={autoOpenWhatsApp}
        />
      )}

      {/* Share Modal with QR Code and WhatsApp */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        portalUrl={portalUrl}
      />

      {/* Discreet Minimal Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} SRN Mehta College Kalburgi • Student Requirement Desk</p>
          <div className="flex items-center gap-3">
            <button
              id="footer-project-docs-btn"
              onClick={() => setIsReportModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:underline text-[11px] font-medium transition-colors"
            >
              📖 System Workflow & Report
            </button>
            {portal === 'student' && (
              <>
                <span>•</span>
                <button
                  id="footer-staff-access-btn"
                  onClick={() => setPortal('teacher')}
                  className="text-slate-400 hover:text-slate-600 text-[11px] transition-colors"
                >
                  Faculty Access
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Global Project Report & Architecture Modal */}
      <ProjectReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Floating Action Button for Instant Gemini AI Copilot */}
      <button
        id="floating-ai-copilot-btn"
        onClick={() => handleOpenAiModal(portal === 'teacher' ? 'faculty_copilot' : 'student_guide')}
        className="fixed bottom-5 right-5 z-40 px-4 py-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600 hover:from-amber-600 hover:via-indigo-700 hover:to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl border border-white/20 flex items-center gap-2 transition-all active:scale-95 group cursor-pointer"
        title="Ask Gemini Academic AI Copilot"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
        </div>
        <span className="text-xs font-bold tracking-tight pr-1">
          Ask Gemini AI
        </span>
      </button>

      {/* Gemini AI Multi-Turn Academic Chatbot Modal */}
      <GeminiChatModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiPrompt('');
        }}
        requests={requests}
        initialRole={aiRole}
        initialPrompt={aiPrompt}
      />
    </div>
  );
}
