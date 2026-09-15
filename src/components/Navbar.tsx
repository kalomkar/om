import React from 'react';
import { 
  GraduationCap, 
  FileEdit, 
  SearchCheck, 
  Share2,
  Database,
  Lock,
  LogOut,
  LayoutDashboard,
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { getActiveTeacherSession } from '../lib/teacherService';

interface NavbarProps {
  portal: 'student' | 'teacher';
  studentView: 'form' | 'track';
  onSelectStudentView: (view: 'form' | 'track') => void;
  isTeacherLoggedIn: boolean;
  onGoToTeacherLogin: () => void;
  onTeacherLogout: () => void;
  onOpenShare: () => void;
  onGoToStudent: () => void;
  onOpenAiModal: () => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  portal,
  studentView,
  onSelectStudentView,
  isTeacherLoggedIn,
  onGoToTeacherLogin,
  onTeacherLogout,
  onOpenShare,
  onGoToStudent,
  onOpenAiModal,
  pendingCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand & Portal Type */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs text-white ${
            portal === 'teacher' 
              ? 'bg-gradient-to-tr from-indigo-700 to-blue-800' 
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
          }`}>
            {portal === 'teacher' ? (
              <LayoutDashboard className="w-5 h-5" />
            ) : (
              <GraduationCap className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                {portal === 'teacher' ? 'Teacher & Admin Console' : 'Student Requirement Desk'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                <Database className="w-2.5 h-2.5" />
                Live DB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {portal === 'teacher' ? 'Classroom Management & Verification Console' : 'Student Request & Status Tracking Desk'}
            </p>
          </div>
        </div>

        {/* Center Navigation - Changes based on Portal */}
        {portal === 'student' ? (
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="student-nav-form-btn"
              onClick={() => onSelectStudentView('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                studentView === 'form'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Submit Form</span>
            </button>

            <button
              id="student-nav-track-btn"
              onClick={() => onSelectStudentView('track')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                studentView === 'track'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5" />
              <span>Track Status</span>
            </button>
          </nav>
        ) : isTeacherLoggedIn ? (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Teacher ID: {getActiveTeacherSession()?.teacherId || '9771'}</span>
              <span className="text-[10px] text-blue-600 font-normal truncate max-w-[120px]">
                ({getActiveTeacherSession()?.name || 'Faculty'})
              </span>
            </span>
            {pendingCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
        ) : null}

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Universal Gemini AI Copilot Button */}
          <button
            id="nav-ai-copilot-btn"
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600 hover:from-amber-600 hover:via-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Open Gemini Academic AI Assistant & Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>AI Copilot</span>
          </button>

          {portal === 'student' ? (
            /* Student Portal -> Clean helpdesk badge (Teacher Login removed as requested) */
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Student Portal</span>
            </div>
          ) : isTeacherLoggedIn ? (
            /* Teacher Portal (Logged In) -> Share & Logout & Switch to Student buttons */
            <div className="flex items-center gap-2">
              <button
                id="nav-share-link-btn"
                onClick={onOpenShare}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
                title="Share Form Link with Class"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Student Link</span>
              </button>

              <button
                id="nav-preview-student-btn"
                onClick={onGoToStudent}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                title="Preview Student Portal"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student View</span>
              </button>

              <button
                id="nav-teacher-logout-btn"
                onClick={onTeacherLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all active:scale-95"
                title="Logout from Teacher Console"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Teacher Login page -> Back to Student Portal button */
            <button
              id="nav-back-to-student-btn"
              onClick={onGoToStudent}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Portal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
