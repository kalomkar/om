import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Share2, 
  Download, 
  RefreshCw, 
  FileText, 
  Paperclip, 
  Phone, 
  Mail, 
  Eye, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  ExternalLink,
  MessageCircle,
  QrCode,
  Calendar,
  AlertCircle,
  Database,
  UserPlus
} from 'lucide-react';
import { StudentRequest, RequestStatus } from '../types';
import { CATEGORIES, STATUS_CONFIG, URGENCY_CONFIG } from '../utils/categories';
import { DatabaseModal } from './DatabaseModal';
import { AddTeacherModal } from './AddTeacherModal';
import { ProjectReportModal } from './ProjectReportModal';
import { createTeacherStatusUpdateWhatsAppUrl } from '../utils/whatsapp';

interface TeacherDashboardProps {
  requests: StudentRequest[];
  isLoading: boolean;
  onRefresh: () => void;
  onUpdateRequest: (id: string, status: RequestStatus, remarks?: string) => Promise<void>;
  onDeleteRequest: (id: string) => Promise<void>;
  onOpenShareModal: () => void;
  portalUrl: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  requests,
  isLoading,
  onRefresh,
  onUpdateRequest,
  onDeleteRequest,
  onOpenShareModal,
  portalUrl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalStatus, setModalStatus] = useState<RequestStatus>('pending');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const studentShareUrl = portalUrl.includes('?') 
    ? `${portalUrl}&mode=student` 
    : `${portalUrl}?mode=student`;

  // Calculated Stats
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inReview: requests.filter(r => r.status === 'in_review').length,
      approved: requests.filter(r => r.status === 'approved').length,
      resolved: requests.filter(r => r.status === 'resolved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Status filter
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      // Category filter
      if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = req.studentName.toLowerCase().includes(q);
        const matchesRoll = req.rollNumber.toLowerCase().includes(q);
        const matchesId = req.id.toLowerCase().includes(q);
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesClass = req.className.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesId && !matchesTitle && !matchesClass) {
          return false;
        }
      }
      return true;
    });
  }, [requests, statusFilter, categoryFilter, searchQuery]);

  const handleOpenReviewModal = (req: StudentRequest) => {
    setSelectedRequest(req);
    setModalRemarks(req.teacherRemarks || '');
    setModalStatus(req.status);
  };

  const handleSaveModal = async () => {
    if (!selectedRequest) return;
    setIsSaving(true);
    try {
      await onUpdateRequest(selectedRequest.id, modalStatus, modalRemarks);
      setSelectedRequest(null);
    } catch (e) {
      console.error('Failed to update request:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatus = async (id: string, newStatus: RequestStatus) => {
    await onUpdateRequest(id, newStatus);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(studentShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCSV = () => {
    if (requests.length === 0) return;
    const headers = ['Tracking ID', 'Student Name', 'Roll Number', 'Class', 'Category', 'Subject', 'Status', 'Urgency', 'Phone', 'Email', 'Remarks', 'Date'];
    const rows = requests.map(r => [
      `"${r.id}"`,
      `"${r.studentName}"`,
      `"${r.rollNumber}"`,
      `"${r.className} ${r.section || ''}"`,
      `"${r.category}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.urgency}"`,
      `"${r.phone || ''}"`,
      `"${r.email || ''}"`,
      `"${(r.teacherRemarks || '').replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner: Share Link with Class */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-100 text-xs font-medium border border-blue-400/30">
              <Share2 className="w-3.5 h-3.5" />
              Classroom Student Share Link
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Collect Requirements & Documents from Students
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              यह लिंक अपनी क्लास के छात्रों (WhatsApp ग्रुप या क्लासरूम) के साथ शेयर करें। छात्र लिंक खोलकर अपनी जरूरत व दस्तावेज़ भरेंगे और सीधे आपके इस डैशबोर्ड में आ जाएंगे।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex items-center border border-white/20">
              <span className="text-xs font-mono text-blue-100 truncate max-w-[200px] sm:max-w-[240px] px-2">
                {studentShareUrl}
              </span>
              <button
                id="teacher-copy-share-link-btn"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-white text-blue-800 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <button
              id="teacher-open-qr-modal-btn"
              onClick={onOpenShareModal}
              className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold border border-blue-400/40 flex items-center justify-center gap-2 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code & WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            statusFilter === 'all' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Requests</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <span className="text-[10px] text-slate-400">All submissions received</span>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            statusFilter === 'pending' ? 'border-amber-600 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Pending Review</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            {stats.pending > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold animate-pulse">
                Needs Action
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">Waiting for teacher</span>
        </div>

        <div 
          onClick={() => setStatusFilter('in_review')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            statusFilter === 'in_review' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Under Review</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.inReview}</p>
          <span className="text-[10px] text-slate-400">Being processed</span>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            statusFilter === 'approved' ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Approved / Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
          <span className="text-[10px] text-slate-400">Document ready</span>
        </div>

        <div 
          onClick={() => setStatusFilter('resolved')}
          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            statusFilter === 'resolved' ? 'border-teal-600 ring-2 ring-teal-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Resolved</span>
            <Check className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-700">{stats.resolved}</p>
          <span className="text-[10px] text-slate-400">Delivered to student</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="dashboard-search-input"
              type="text"
              placeholder="Search by student name, roll number, tracking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
            />
          </div>

          {/* Quick Category & Export Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              id="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Categories (सभी प्रकार)</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            <button
              id="open-database-explorer-btn"
              onClick={() => setIsDbModalOpen(true)}
              title="Inspect live database, raw JSON file, and API endpoints"
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-blue-200" />
              <span>View Database (डेटाबेस देखें)</span>
            </button>

            <button
              id="open-project-report-btn"
              onClick={() => setIsReportModalOpen(true)}
              title="Open Complete Project Workflow, Architecture & Technical Report"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-blue-300" />
              <span>Project Report (प्रोजेक्ट रिपोर्ट)</span>
            </button>

            <button
              id="open-add-teacher-btn"
              onClick={() => setIsAddTeacherOpen(true)}
              title="Add or manage authorized teacher accounts"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Teacher (शिक्षक जोड़ें)</span>
            </button>

            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              title="Download CSV report"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              id="refresh-requests-btn"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh database"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
          <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'in_review', label: 'Under Review', count: stats.inReview },
            { id: 'approved', label: 'Approved', count: stats.approved },
            { id: 'resolved', label: 'Resolved', count: stats.resolved },
            { id: 'rejected', label: 'Rejected', count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-base">No Requests Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'No student requests in the database yet. Share the portal link with students to receive submissions!'}
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const catObj = CATEGORIES.find(c => c.id === req.category);
            const statusConfig = STATUS_CONFIG[req.status];
            const urgencyConfig = URGENCY_CONFIG[req.urgency];

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all p-5 space-y-4"
              >
                {/* Request Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-100">
                      {req.studentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 text-sm">{req.studentName}</h4>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {req.rollNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.className} {req.section ? `• ${req.section}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 font-semibold">
                      {req.id}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${urgencyConfig.badge}`}>
                      {urgencyConfig.label.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Requirement Subject & Reason */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${catObj?.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                      {catObj?.label || req.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h5 className="text-sm font-semibold text-slate-900 mt-1.5">{req.title}</h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {req.description}
                  </p>
                </div>

                {/* Attached File Preview if available */}
                {req.attachedFile && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        Attached: {req.attachedFile.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({(req.attachedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    {req.attachedFile.dataUrl ? (
                      <a
                        href={req.attachedFile.dataUrl}
                        download={req.attachedFile.name}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Eye className="w-3 h-3" />
                        View / Download
                      </a>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-xs">Uploaded</span>
                    )}
                  </div>
                )}

                {/* Teacher Remarks if added */}
                {req.teacherRemarks && (
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs flex items-start gap-2 text-blue-900">
                    <span className="font-bold shrink-0">Your Remark to Student:</span>
                    <span className="text-blue-950 font-normal">"{req.teacherRemarks}"</span>
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Student Contact links */}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {req.phone && (
                      <a
                        href={`tel:${req.phone}`}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        title="Call Student"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.phone}</span>
                      </a>
                    )}
                    {req.phone && (
                      <a
                        href={createTeacherStatusUpdateWhatsAppUrl(req, req.status, req.teacherRemarks, portalUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        title="Send status update to student on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Student</span>
                      </a>
                    )}
                    {req.email && (
                      <a
                        href={`mailto:${req.email}`}
                        className="hidden sm:flex items-center gap-1 hover:text-blue-600 transition-colors"
                        title="Email Student"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleQuickStatus(req.id, 'in_review')}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Start Review
                      </button>
                    )}

                    {req.status !== 'approved' && req.status !== 'resolved' && (
                      <button
                        onClick={() => handleQuickStatus(req.id, 'approved')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                      >
                        Approve
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenReviewModal(req)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Review & Remarks</span>
                    </button>

                    <button
                      onClick={() => onDeleteRequest(req.id)}
                      title="Delete request"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review / Status Edit Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6 animate-fade-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-white">Review & Update Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Request Ref: {selectedRequest.id} • {selectedRequest.studentName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Update Request Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['pending', 'in_review', 'approved', 'resolved', 'rejected'] as RequestStatus[]).map((st) => {
                    const conf = STATUS_CONFIG[st];
                    const isSelected = modalStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setModalStatus(st)}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between ${
                          isSelected
                            ? `${conf.bg} ${conf.color} ring-2 ring-blue-200 shadow-2xs`
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{conf.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teacher Remarks / Instruction for Student
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Certificate signed. Please collect from Administrative Block Room 102 between 10am to 1pm."
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 This remark will be visible to the student when they track their request.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                {selectedRequest.phone ? (
                  <a
                    href={createTeacherStatusUpdateWhatsAppUrl(selectedRequest, modalStatus, modalRemarks, portalUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                    title="Send updated status directly to student on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Send WhatsApp Update</span>
                  </a>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModal}
                    disabled={isSaving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                  >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Database Explorer Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        portalUrl={portalUrl}
        onRefreshAll={onRefresh}
      />

      {/* Add Teacher Account Modal */}
      <AddTeacherModal
        isOpen={isAddTeacherOpen}
        onClose={() => setIsAddTeacherOpen(false)}
      />

      {/* Project Technical Report & Workflow Documentation Modal */}
      <ProjectReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
