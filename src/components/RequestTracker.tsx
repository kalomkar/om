import React, { useState } from 'react';
import { Search, Clock, CheckCircle, AlertTriangle, FileText, ArrowRight, Printer, RefreshCw, GraduationCap, Award, BookOpen } from 'lucide-react';
import { StudentRequest } from '../types';
import { CATEGORIES, STATUS_CONFIG } from '../utils/categories';

interface RequestTrackerProps {
  initialTrackingId?: string;
  onSelectRequest?: (req: StudentRequest) => void;
}

export const RequestTracker: React.FC<RequestTrackerProps> = ({ initialTrackingId }) => {
  const [searchQuery, setSearchQuery] = useState(initialTrackingId || '');
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<StudentRequest | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setNotFound(false);
    setErrorMessage('');
    setRequest(null);

    try {
      try {
        const res = await fetch(`/api/requests/${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setRequest(data);
          return;
        }
      } catch {
        // Offline / network delay fallback
      }

      // Check local storage cache
      try {
        const cached = localStorage.getItem('student_requests_cache');
        if (cached) {
          const items: StudentRequest[] = JSON.parse(cached);
          const q = searchQuery.trim().toLowerCase();
          const found = items.find(
            (r) => r.id.toLowerCase() === q || r.rollNumber.toLowerCase() === q
          );
          if (found) {
            setRequest(found);
            return;
          }
        }
      } catch {}

      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const catObj = request ? CATEGORIES.find(c => c.id === request.category) : null;
  const statusConfig = request ? STATUS_CONFIG[request.status] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Track Your Submission Status</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter your Tracking Reference ID (e.g., REQ-10482) or student roll number to check progress
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="mb-8">
        <div className="relative flex items-center shadow-sm">
          <input
            id="track-search-input"
            type="text"
            placeholder="Enter Tracking ID (REQ-XXXXX) or Roll Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-28 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all uppercase font-mono"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
          <button
            id="track-search-submit-btn"
            type="submit"
            disabled={loading}
            className="absolute right-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Check Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Not Found Alert */}
      {notFound && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2 animate-fade-in">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-sm font-semibold text-amber-900">No Request Found</h3>
          <p className="text-xs text-amber-700 max-w-sm mx-auto">
            We couldn't find any submission matching "<span className="font-mono">{searchQuery}</span>". Please double check your tracking ID or roll number.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Found Request Display Card */}
      {request && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          {/* Status Header */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-base">{request.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig?.bg} ${statusConfig?.color}`}>
                  {statusConfig?.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Submitted on {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Student:</span>
              <span className="text-sm font-semibold text-slate-800">{request.studentName}</span>
              <span className="text-xs font-mono text-slate-500 block">{request.rollNumber}</span>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="p-6 border-b border-slate-100">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Application Progress Timeline
            </h4>
            
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Step 1 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-emerald-50">
                  <CheckCircle className="w-3 h-3" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">Form Submitted & Saved in Database</h5>
                  <p className="text-[11px] text-slate-500">
                    Received by class portal • Notification dispatched to student
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-3">
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ${
                  request.status !== 'pending'
                    ? 'bg-blue-600 text-white ring-blue-50'
                    : 'bg-slate-200 text-slate-500 ring-slate-100'
                }`}>
                  <Clock className="w-3 h-3" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">Teacher Review & Verification</h5>
                  <p className="text-[11px] text-slate-500">
                    {request.status === 'pending'
                      ? 'Waiting for class teacher to inspect requirement'
                      : 'Class teacher reviewed requirement'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-3">
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ${
                  request.status === 'approved' || request.status === 'resolved'
                    ? 'bg-emerald-600 text-white ring-emerald-50'
                    : request.status === 'rejected'
                    ? 'bg-rose-600 text-white ring-rose-50'
                    : 'bg-slate-200 text-slate-500 ring-slate-100'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-800">Final Outcome / Document Issuance</h5>
                  <p className="text-[11px] text-slate-500">
                    {request.status === 'approved'
                      ? 'Approved! Follow teacher remarks to collect or access document.'
                      : request.status === 'resolved'
                      ? 'Completed and fulfilled.'
                      : request.status === 'rejected'
                      ? 'Request rejected with teacher feedback.'
                      : 'Pending final action.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Remarks Box (Highlighted if available) */}
          {request.teacherRemarks && (
            <div className="p-5 bg-blue-50/70 border-b border-blue-100">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-blue-600 text-white shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Class Teacher Note / Remarks:</span>
                  <p className="text-xs text-blue-950 mt-1 leading-relaxed bg-white/70 p-3 rounded-xl border border-blue-200">
                    "{request.teacherRemarks}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Details Section */}
          <div className="p-6 space-y-3 text-xs text-slate-600">
            <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className="font-semibold text-slate-800">{catObj?.label || request.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Class & Section:</span>
                <span className="font-semibold text-slate-800">{request.className} {request.section}</span>
              </div>
              {request.previousCollegeName && (
                <div className="col-span-2 pt-1">
                  <span className="text-slate-400 block">Previous College / School:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    {request.previousCollegeName}
                  </span>
                </div>
              )}
            </div>

            <div>
              <span className="text-slate-400 block">Requirement Title:</span>
              <span className="font-medium text-slate-900 text-sm">{request.title}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Description:</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                {request.description}
              </p>
            </div>

            {/* Self-Rating Skills Breakdown if present */}
            {request.skillRatings && Object.values(request.skillRatings).some(Boolean) && (
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  Your Self-Rating Assessment:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {request.skillRatings.programming && (
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Programming:</span>
                      <span className="font-semibold text-blue-700">{request.skillRatings.programming}</span>
                    </div>
                  )}
                  {request.skillRatings.googleDocsWord && (
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Docs / Word:</span>
                      <span className="font-semibold text-indigo-700">{request.skillRatings.googleDocsWord}</span>
                    </div>
                  )}
                  {request.skillRatings.googleSheetsExcel && (
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Sheets / Excel:</span>
                      <span className="font-semibold text-emerald-700">{request.skillRatings.googleSheetsExcel}</span>
                    </div>
                  )}
                  {request.skillRatings.googleForms && (
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Forms:</span>
                      <span className="font-semibold text-purple-700">{request.skillRatings.googleForms}</span>
                    </div>
                  )}
                  {request.skillRatings.reportWriting && (
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Report Writing:</span>
                      <span className="font-semibold text-amber-700">{request.skillRatings.reportWriting}</span>
                    </div>
                  )}
                  {request.skillRatings.englishCommunication && (
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">English Comm:</span>
                      <span className="font-semibold text-teal-700">{request.skillRatings.englishCommunication}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Present Academic Requirements Tags & Notes */}
            {((request.academicRequirements && request.academicRequirements.length > 0) || request.extraRequirementsNote) && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/70 space-y-1.5">
                <span className="text-[11px] text-blue-900 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  Your Present Academic Requirements:
                </span>
                {request.academicRequirements && request.academicRequirements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {request.academicRequirements.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white text-blue-800 border border-blue-200 rounded-md text-[11px] font-semibold"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                )}
                {request.extraRequirementsNote && (
                  <p className="text-xs text-slate-700 pt-1">
                    <span className="font-semibold text-slate-900">Your Note:</span> {request.extraRequirementsNote}
                  </p>
                )}
              </div>
            )}

            {request.attachedFile && (
              <div className="pt-1">
                <span className="text-slate-400 block mb-1">Attached Document:</span>
                <div className="inline-flex items-center gap-2 p-2 bg-slate-100 rounded-lg text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-mono text-xs">{request.attachedFile.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
