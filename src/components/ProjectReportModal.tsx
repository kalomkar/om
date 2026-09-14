import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  Layers, 
  Cpu, 
  Workflow, 
  Database, 
  ShieldCheck, 
  Download,
  Terminal
} from 'lucide-react';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'stack' | 'workflow' | 'database' | 'setup'>('overview');

  if (!isOpen) return null;

  const handleCopyText = () => {
    const textContent = `SRN MEHTA COLLEGE, KALBURGI
Student Requirement & Academic Request Management System
Project Report & System Architecture

TECH STACK:
• Frontend: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Vite 6
• Backend: Node.js, Express 4.21, TypeScript (TSX), esbuild
• Database: Google Cloud Firestore (Live Real-time Sync) + Local JSON (data/database.json)

CREDENTIALS:
• Primary Teacher ID: 9771
• Password: 123456

KEY WORKFLOWS:
1. Student submits request without login -> Receives instant Ticket ID (REQ-XXXX).
2. Live WebSocket Push: Teacher laptop receives request in < 1 second.
3. Teacher updates status (Pending -> Under Review -> Approved / Rejected -> Resolved) with official remarks.
4. Student tracks progress via Ticket ID or automated WhatsApp notification.
5. Multi-Teacher Account Creation supported with cloud persistence.`;

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in print:max-h-none print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">System Architecture & Project Report</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/20">
                  Documentation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SRN Mehta College, Kalburgi • Full-Stack Workflow & Technology Specification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy Summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Print Documentation"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-1 overflow-x-auto shrink-0 print:hidden">
          <button
            onClick={() => setActiveSection('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview & Purpose</span>
          </button>
          <button
            onClick={() => setActiveSection('stack')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'stack'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Technology Stack</span>
          </button>
          <button
            onClick={() => setActiveSection('workflow')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'workflow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Complete Workflows</span>
          </button>
          <button
            onClick={() => setActiveSection('database')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'database'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database & Models</span>
          </button>
          <button
            onClick={() => setActiveSection('setup')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'setup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup & Deployment</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
          
          {/* Section: Overview */}
          {(activeSection === 'overview' || window.matchMedia?.('print').matches) && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-blue-950 text-sm">SRN Mehta College Kalburgi — Project Mission</h4>
                  <p className="text-xs text-blue-800">
                    This platform replaces physical inquiry queues and paper applications with a high-speed, 
                    multi-device digital desk. Students submit requirements from any mobile phone, and teachers review, approve, 
                    and notify students in real time.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Zero Login for Students</span>
                  <p className="font-semibold text-slate-900 text-xs">Instant Submission</p>
                  <p className="text-[11px] text-slate-500">
                    Students submit applications for Leave, Bonafide certificates, Fee concessions, Lab gear, and Library books immediately.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Sub-Second Sync</span>
                  <p className="font-semibold text-slate-900 text-xs">Cloud Real-time</p>
                  <p className="text-[11px] text-slate-500">
                    Teacher's laptop receives student submissions within 1 second via Google Cloud Firestore live websockets.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Multi-Teacher Access</span>
                  <p className="font-semibold text-slate-900 text-xs">Faculty Portal</p>
                  <p className="text-[11px] text-slate-500">
                    Primary ID 9771 with on-demand "+ Add New Teacher" account creation saved persistently in the cloud.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h5 className="font-bold text-slate-900 text-xs">Quick Access Credentials</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Primary Teacher ID</span>
                    <strong className="font-mono text-slate-900 text-sm">9771</strong>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Password / PIN</span>
                    <strong className="font-mono text-slate-900 text-sm">123456</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Tech Stack */}
          {activeSection === 'stack' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Modern Full-Stack Technology Architecture</span>
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-blue-700">1. Client / Frontend UI</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">React 19 + TypeScript</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    <li><strong>React 19 (19.0.1):</strong> Modern functional component architecture with hooks and state.</li>
                    <li><strong>Tailwind CSS v4:</strong> Ultra-fast responsive utility styling designed for both mobile and widescreen desktop.</li>
                    <li><strong>Motion (Framer Motion):</strong> Smooth transitions for state changes, toast banners, and modals.</li>
                    <li><strong>Lucide React Icons:</strong> Clean, universally recognizable icon system.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-indigo-700">2. Backend / Server Layer</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">Node.js + Express 4.21</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    <li><strong>Express.js (4.21.2):</strong> Robust REST API server on Port 3000 handling requests, status, and health metrics.</li>
                    <li><strong>TSX Runtime:</strong> Native execution of TypeScript server files in development without transpilation overhead.</li>
                    <li><strong>esbuild:</strong> Single-bundle compilation outputting production-ready CommonJS (<code className="text-slate-800">dist/server.cjs</code>).</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-emerald-700">3. Cloud Database & Storage Engine</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">Firestore + JSON</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    <li><strong>Google Cloud Firestore:</strong> Live NoSQL database powering real-time websocket synchronization between phones and laptops.</li>
                    <li><strong>Local JSON Store (<code className="text-slate-800">data/database.json</code>):</strong> Redundant file-level disk storage for offline resilience and local inspection.</li>
                    <li><strong>Browser Cache:</strong> LocalStorage session layer for instantaneous UI rendering.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section: Workflows */}
          {activeSection === 'workflow' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Workflow className="w-4 h-4 text-blue-600" />
                <span>End-to-End Application Workflows</span>
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs text-slate-900">Step 1: Student Application Submission</h5>
                  <p className="text-xs text-slate-600">
                    Student opens the portal on smartphone, enters name, roll number, course, category, urgency, description, and WhatsApp number. 
                    A unique ticket code (e.g., <strong>REQ-8492</strong>) is created and instantly sent to Google Cloud Firestore.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs text-slate-900">Step 2: Instant Teacher Notification (Real-Time)</h5>
                  <p className="text-xs text-slate-600">
                    Teacher's dashboard subscribes via Firestore <code className="text-slate-800">onSnapshot()</code>. 
                    As soon as the mobile form is submitted, the teacher's screen updates within 1 second without reloading.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs text-slate-900">Step 3: Faculty Review & Status Lifecycle</h5>
                  <p className="text-xs text-slate-600">
                    Teacher inspects the request, marks it as <em>Under Review</em>, <em>Approved</em>, <em>Rejected</em>, or <em>Resolved</em>, 
                    and adds official instructions or remarks.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs text-slate-900">Step 4: Student Live Tracking & WhatsApp Alert</h5>
                  <p className="text-xs text-slate-600">
                    Student enters their Ticket ID to view a visual 4-step progress timeline and read teacher instructions. 
                    Teachers can also click the 1-Click WhatsApp button to notify students directly.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs text-slate-900">Step 5: Multi-Teacher Account Creation</h5>
                  <p className="text-xs text-slate-600">
                    Using the <strong>+ Add New Teacher</strong> feature, faculty can create new teacher accounts with unique IDs and passwords. 
                    These credentials are saved to Firestore and work instantly on any device.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Database */}
          {activeSection === 'database' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Database Structure & JSON Schemas</span>
              </h4>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <span className="font-bold text-xs text-slate-800">1. Student Request Record Schema (`StudentRequest`)</span>
                  <pre className="bg-slate-900 text-blue-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "id": "REQ-8492",
  "studentName": "Rahul Sharma",
  "rollNumber": "SRN-2024-042",
  "department": "Computer Science (BCA)",
  "semester": "4th Sem",
  "category": "bonafide",
  "urgency": "urgent",
  "title": "Need Bonafide Certificate for Scholarship",
  "description": "Applying for State Post-Matric Scholarship, required urgently.",
  "contactNumber": "9876543210",
  "status": "approved",
  "teacherRemarks": "Verified. Collect from Admin Block Counter #2.",
  "createdAt": "2026-09-14T08:30:00.000Z",
  "updatedAt": "2026-09-14T08:45:00.000Z"
}`}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-xs text-slate-800">2. Teacher Account Schema (`TeacherAccount`)</span>
                  <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "teacherId": "9771",
  "name": "Faculty / Incharge Teacher",
  "password": "123456",
  "department": "SRN Mehta College Kalburgi",
  "role": "admin",
  "createdAt": "2026-09-14T00:00:00.000Z"
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Section: Setup */}
          {activeSection === 'setup' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>Setup & Local Run Instructions (From Extracted ZIP)</span>
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-slate-900 block">Step 1: Open Terminal / CMD in Project Folder</span>
                  <p className="text-xs text-slate-600">
                    ZIP फ़ाइल को Extract करें और उस फ़ोल्डर में Command Prompt या VS Code Terminal खोलें।
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-slate-900 block">Step 2: Install Packages</span>
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-xs">
npm install
                  </pre>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-slate-900 block">Step 3: Start Development Server</span>
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-xs">
npm run dev
                  </pre>
                  <p className="text-xs text-slate-500">
                    ब्राउज़र में खोलें: <strong className="text-slate-800">http://localhost:3000</strong>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-slate-900 block">Step 4: Production Build (For Deployment)</span>
                  <pre className="bg-slate-900 text-blue-300 p-2.5 rounded-lg font-mono text-xs">
npm run build
npm start
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Full Markdown Report saved in root: <code className="font-mono text-slate-700">PROJECT_REPORT_AND_WORKFLOW.md</code>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
