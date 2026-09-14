import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  FileJson, 
  Table, 
  HelpCircle, 
  HardDrive, 
  Clock, 
  FileSpreadsheet, 
  Eye, 
  Server
} from 'lucide-react';
import { StudentRequest } from '../types';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalUrl: string;
  onRefreshAll?: () => void;
}

interface DatabaseMetadata {
  status: string;
  storageEngine: string;
  filePath: string;
  fileSizeBytes: number;
  fileSizeKB: string;
  totalRecords: number;
  lastModified: string;
  endpoints: {
    allRequests: string;
    rawDatabase: string;
    exportCsv: string;
    exportJson: string;
  };
  records: StudentRequest[];
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  portalUrl,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'json' | 'guide'>('table');
  const [dbData, setDbData] = useState<DatabaseMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchDatabaseInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/database');
      if (res.ok) {
        const data = await res.json();
        setDbData(data);
      }
    } catch (err) {
      console.error('Failed to load database info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDatabaseInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rawJsonString = dbData?.records 
    ? JSON.stringify(dbData.records, null, 2) 
    : 'Loading database...';

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyEndpoint = (path: string) => {
    const fullUrl = `${portalUrl}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const filteredRecords = (dbData?.records || []).filter(r => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.studentName.toLowerCase().includes(q) ||
      r.rollNumber.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="database-explorer-modal"
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  College Database & Records Explorer
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Dynamic DB
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Storage: <span className="text-blue-300 font-semibold">data/database.json</span> • Flat-file Persistent JSON Document Store
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="db-refresh-btn"
              onClick={() => {
                fetchDatabaseInfo();
                if (onRefreshAll) onRefreshAll();
              }}
              disabled={isLoading}
              title="Refresh database records"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a
              id="db-open-raw-api-btn"
              href="/api/database"
              target="_blank"
              rel="noopener noreferrer"
              title="Open raw API response in new tab"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open /api/database</span>
            </a>
            <button
              id="db-close-modal-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Database Health & Stats Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Cloud Engine</p>
              <p className="font-semibold text-emerald-700">Google Firestore Live</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Multi-Device Sync</p>
              <p className="font-semibold text-slate-800">Phone ⇄ Laptop Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Saved Records</p>
              <p className="font-semibold text-slate-800">{dbData?.totalRecords || 0} Student Forms</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Last DB Sync</p>
              <p className="font-semibold text-slate-800">
                {dbData?.lastModified ? new Date(dbData.lastModified).toLocaleTimeString() : 'Real-time Live'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-4 pb-2 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-1.5 border-b sm:border-b-0 border-slate-200">
            <button
              id="db-tab-table-btn"
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'table'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View ({filteredRecords.length})</span>
            </button>
            <button
              id="db-tab-json-btn"
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Raw JSON File</span>
            </button>
            <button
              id="db-tab-guide-btn"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to View & Export DB</span>
            </button>
          </div>

          {/* Quick Download Buttons */}
          <div className="flex items-center gap-2">
            <a
              id="db-export-csv-btn"
              href="/api/database/export?format=csv"
              download
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV (Excel)</span>
            </a>
            <a
              id="db-export-json-btn"
              href="/api/database/export?format=json"
              download
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </a>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: TABLE VIEW */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Filter records by name, roll no, category, ID..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full sm:max-w-sm px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
                <span className="text-xs text-slate-500 shrink-0">
                  Showing <b>{filteredRecords.length}</b> of <b>{dbData?.records?.length || 0}</b> rows
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3.5 py-2.5">ID</th>
                      <th className="px-3.5 py-2.5">Student Name</th>
                      <th className="px-3.5 py-2.5">Roll No</th>
                      <th className="px-3.5 py-2.5">Class / Section</th>
                      <th className="px-3.5 py-2.5">Category</th>
                      <th className="px-3.5 py-2.5">Subject / Requirement</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5">Phone / Email</th>
                      <th className="px-3.5 py-2.5">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3.5 py-2.5 font-bold text-blue-700">{req.id}</td>
                          <td className="px-3.5 py-2.5 font-sans font-semibold text-slate-900">{req.studentName}</td>
                          <td className="px-3.5 py-2.5 text-slate-700">{req.rollNumber}</td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-600">{req.className} {req.section ? `(${req.section})` : ''}</td>
                          <td className="px-3.5 py-2.5 font-sans">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 capitalize text-[10px]">
                              {req.category}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-800 max-w-[200px] truncate" title={req.title}>
                            {req.title}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans">
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'in_review' ? 'bg-indigo-100 text-indigo-800' :
                              req.status === 'resolved' ? 'bg-teal-100 text-teal-800' :
                              req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500">
                            <div>{req.phone || '—'}</div>
                            <div className="text-[10px] text-slate-400">{req.email || ''}</div>
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400 whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400 font-sans">
                          No matching records found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: RAW JSON CODE VIEW */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Raw File Content:</span>
                  <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                    /data/database.json
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="copy-raw-json-btn"
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied JSON!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto max-h-[500px] border border-slate-800 shadow-inner">
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                  {rawJsonString}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: GUIDE & API ENDPOINTS */}
          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-3xl mx-auto py-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4.5">
                <h4 className="text-sm font-bold text-blue-900 mb-1.5 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-700" />
                  आपका डेटाबेस कैसे काम करता है? (How your dynamic database works)
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  आपका सिस्टम <b>100% डायनामिक (Dynamic)</b> है। जब भी कोई छात्र लिंक खोलकर फॉर्म भरता है, वह तुरंत सर्वर पर मौजूद <code>data/database.json</code> फाइल में सुरक्षित लिख दिया जाता है। आपको सर्वर दोबारा रीस्टार्ट करने या मैनुअल सेव करने की कोई ज़रूरत नहीं है।
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800">डेटाबेस देखने और डाउनलोड करने के 3 आसान तरीके:</h4>

                {/* Method 1 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                    <h5 className="text-xs font-bold text-slate-900">ब्राउज़र में सीधे लाइव JSON डेटा देखना</h5>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    आप अपने ब्राउज़र के एड्रेस बार में कभी भी यह लिंक खोल सकते हैं। यह आपको रियल-टाइम JSON रिकॉर्ड्स दिखाता है:
                  </p>
                  <div className="pl-8 flex items-center gap-2">
                    <code className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-mono text-xs border border-slate-200">
                      {portalUrl}/api/database
                    </code>
                    <a
                      href="/api/database"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Open
                    </a>
                  </div>
                </div>

                {/* Method 2 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">2</span>
                    <h5 className="text-xs font-bold text-slate-900">एक्सेल / गूगल शीट्स में डाउनलोड करना (Excel CSV)</h5>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    ऊपर दिए गए <b>"Export CSV (Excel)"</b> बटन पर क्लिक करें। एक क्लिक में सभी छात्रों के नाम, रोल नंबर, फोन, तारीख और स्टेटस वाली स्प्रेडशीट फाइल डाउनलोड हो जाएगी जिसे आप Excel या Google Sheets में सीधे खोल सकते हैं।
                  </p>
                </div>

                {/* Method 3 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">3</span>
                    <h5 className="text-xs font-bold text-slate-900">प्रोजेक्ट की मूल फ़ाइल (Local File on Server)</h5>
                  </div>
                  <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                    यह फ़ाइल सर्वर के फ़ाइल सिस्टम में <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-semibold">data/database.json</code> के रूप में परमानेंट स्टोर रहती है। जब भी आप इसे GitHub पर एक्सपोर्ट करेंगे या Cloud Run पर डिप्लॉय करेंगे, यह फ़ाइल हमेशा उपलब्ध रहेगी।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Real-time persistence enabled via Express backend</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
