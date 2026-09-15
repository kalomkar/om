import React, { useMemo, useState } from 'react';
import { 
  X, 
  Download, 
  BarChart3, 
  Award, 
  BookOpen, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  FileSpreadsheet,
  PieChart as PieIcon,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StudentRequest } from '../types';
import { exportStudentDataToExcel } from '../utils/excelExport';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: StudentRequest[];
  onExportCSV: () => void;
}

const COLORS = ['#3B82F6', '#6366F1', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B'];

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onExportCSV
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'requirements'>('overview');
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Compute analytics
  const analytics = useMemo(() => {
    const totalStudents = requests.length;

    // Skills breakdown
    const skills = [
      { key: 'programming', label: 'Programming' },
      { key: 'googleDocsWord', label: 'Docs & Word' },
      { key: 'googleSheetsExcel', label: 'Sheets & Excel' },
      { key: 'googleForms', label: 'Forms' },
      { key: 'reportWriting', label: 'Report Writing' },
      { key: 'englishCommunication', label: 'English Comm' }
    ] as const;

    const skillCounts: Record<string, { beginner: number; intermediate: number; advanced: number; totalAssessed: number }> = {};
    skills.forEach(s => {
      skillCounts[s.key] = { beginner: 0, intermediate: 0, advanced: 0, totalAssessed: 0 };
    });

    requests.forEach(r => {
      if (!r.skillRatings) return;
      skills.forEach(s => {
        const val = r.skillRatings?.[s.key];
        if (val) {
          skillCounts[s.key].totalAssessed += 1;
          if (val === 'Beginner') skillCounts[s.key].beginner += 1;
          else if (val === 'Intermediate') skillCounts[s.key].intermediate += 1;
          else if (val === 'Advanced') skillCounts[s.key].advanced += 1;
        }
      });
    });

    // Prepare chart data for skills
    const skillsChartData = skills.map(s => {
      const data = skillCounts[s.key];
      return {
        name: s.label,
        Beginner: data.beginner,
        Intermediate: data.intermediate,
        Advanced: data.advanced,
        total: data.totalAssessed
      };
    });

    // Requirements breakdown
    const allRequirements = [
      'Extra Periods / Doubt Classes',
      'Website Design',
      'English Grammar & Communication',
      'Project Work with Report Writing',
      'Interview Preparation',
      'Presentation Slides'
    ];

    const reqCounts: Record<string, number> = {};
    allRequirements.forEach(req => { reqCounts[req] = 0; });

    requests.forEach(r => {
      if (r.academicRequirements && Array.isArray(r.academicRequirements)) {
        r.academicRequirements.forEach(req => {
          reqCounts[req] = (reqCounts[req] || 0) + 1;
        });
      }
    });

    const sortedRequirements = Object.entries(reqCounts)
      .map(([name, count]) => ({
        name,
        shortName: name.length > 20 ? name.slice(0, 18) + '...' : name,
        count,
        percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Categories breakdown for Pie chart
    const categoryCounts: Record<string, number> = {};
    requests.forEach(r => {
      const cat = r.category || 'general';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }));

    return {
      totalStudents,
      skills,
      skillCounts,
      skillsChartData,
      sortedRequirements,
      categoryChartData,
      topRequirement: sortedRequirements[0] || { name: 'None', count: 0, percentage: 0 }
    };
  }, [requests]);

  const handleDownloadExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportStudentDataToExcel(requests);
    } catch (err) {
      console.error('Failed to export Excel file:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="analytics-modal-container"
        className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <BarChart3 className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg sm:text-xl text-white">Student Data Analysis & Graphs</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Auto Analyzed
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30">
                  Formatted XLSX Ready
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5">
                Visual charts, skill distributions, and demand summary across {analytics.totalStudents} student submissions
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              id="analytics-download-xlsx-btn"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              title="Download beautifully formatted Excel workbook with styled tables and multi-sheet tabs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExportingExcel ? 'Generating Excel...' : 'Download Formatted Excel (.xlsx)'}</span>
            </button>
            <button
              onClick={onClose}
              id="analytics-close-btn"
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-800 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Visual Graphs & Summary
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'skills'
                ? 'border-blue-600 text-blue-800 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🎯 Technical Skills Breakdown
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'requirements'
                ? 'border-blue-600 text-blue-800 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📚 Academic Requirements Demand
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Overview Tab: Key Metrics & Primary Visual Graphs */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 shadow-2xs">
                  <span className="text-[11px] text-blue-700 font-bold uppercase tracking-wider block">
                    Total Students
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-950">{analytics.totalStudents}</span>
                    <span className="text-xs text-slate-500">records</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 shadow-2xs">
                  <span className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider block">
                    #1 Top Demand
                  </span>
                  <div className="mt-1 truncate">
                    <span className="text-sm font-bold text-indigo-950 block truncate">
                      {analytics.topRequirement.name}
                    </span>
                    <span className="text-xs text-indigo-700 font-semibold">
                      {analytics.topRequirement.count} students ({analytics.topRequirement.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-2xs">
                  <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">
                    Excel Export Mode
                  </span>
                  <div className="mt-1">
                    <span className="text-sm font-bold text-emerald-950 block">Real .XLSX Workbook</span>
                    <span className="text-[11px] text-emerald-700">Multi-sheet + Formatted</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 shadow-2xs">
                  <span className="text-[11px] text-purple-700 font-bold uppercase tracking-wider block">
                    Phone Formatting
                  </span>
                  <div className="mt-1">
                    <span className="text-sm font-bold text-purple-950 block">Protected Text</span>
                    <span className="text-[11px] text-purple-700">No scientific notation</span>
                  </div>
                </div>
              </div>

              {/* Chart 1: Visual Grouped Bar Chart of Skills */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Technical & Software Skills Assessment Graph</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Comparison of Beginner, Intermediate, and Advanced student counts per skill
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-amber-400" /> Beginner</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-blue-500" /> Intermediate</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-emerald-500" /> Advanced</span>
                  </div>
                </div>

                <div className="w-full h-72 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.skillsChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#475569', fontSize: 11 }} 
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fill: '#64748B', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          borderRadius: '12px', 
                          border: 'none', 
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="Beginner" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Intermediate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Advanced" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Academic Requirements Demand Ranking */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>Academic Requirements Demand Breakdown (% of Students Requesting)</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ranked by priority demand for special classes and extra periods
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {analytics.sortedRequirements.map((item, idx) => (
                    <div key={item.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{item.count} students</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            item.percentage >= 50 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            item.percentage >= 25 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {item.percentage}% Demand
                          </span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.percentage >= 50 ? 'bg-rose-500' :
                            item.percentage >= 25 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Summary Card in Hindi & English */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 border border-indigo-200/90 space-y-3">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Executive Analysis Summary & Actionable Recommendations (सारांश)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-100 space-y-1.5">
                    <span className="font-bold text-indigo-900 block">📌 Priority Demands (प्राथमिकता):</span>
                    <p className="leading-relaxed">
                      Sabse zyada students ne <b>{analytics.topRequirement.name}</b> ({analytics.topRequirement.count} students, {analytics.topRequirement.percentage}%) aur interview preparation ki maang ki hai. Faculty iske extra periods schedule kar sakti hai.
                    </p>
                  </div>
                  <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-100 space-y-1.5">
                    <span className="font-bold text-indigo-900 block">📊 Excel Formatting Fix (फॉर्मेट समाधान):</span>
                    <p className="leading-relaxed">
                      Excel sheet ab ek formal <b>.XLSX Workbook</b> format me download hogi jisme 3 alag-alag tabs honge: <i>Analytics & Summary</i>, <i>Student Data Master</i>, aur <i>Subject-wise Batches</i>. Phone number truncate ya scientific notation (8.096E) me nahi aayega!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Technical & Software Skills Deep-Dive</h4>
                  <p className="text-xs text-slate-500">Student self-assessment distribution per question</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analytics.skills.map((skill) => {
                  const data = analytics.skillCounts[skill.key];
                  const total = data.totalAssessed || 1;
                  const begPct = Math.round((data.beginner / total) * 100);
                  const intPct = Math.round((data.intermediate / total) * 100);
                  const advPct = Math.round((data.advanced / total) * 100);

                  return (
                    <div key={skill.key} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs text-slate-900">{skill.label}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {data.totalAssessed} responded
                        </span>
                      </div>

                      {/* Stacked visually */}
                      <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                        <div style={{ width: `${begPct}%` }} className="bg-amber-400" title={`Beginner: ${data.beginner} (${begPct}%)`} />
                        <div style={{ width: `${intPct}%` }} className="bg-blue-500" title={`Intermediate: ${data.intermediate} (${intPct}%)`} />
                        <div style={{ width: `${advPct}%` }} className="bg-emerald-500" title={`Advanced: ${data.advanced} (${advPct}%)`} />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-center">
                          <span className="text-amber-800 block text-[10px] font-semibold">Beginner</span>
                          <span className="font-bold text-amber-950 text-sm">{data.beginner}</span>
                          <span className="text-[10px] text-amber-700 block">({begPct}%)</span>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-xl border border-blue-200 text-center">
                          <span className="text-blue-800 block text-[10px] font-semibold">Intermediate</span>
                          <span className="font-bold text-blue-950 text-sm">{data.intermediate}</span>
                          <span className="text-[10px] text-blue-700 block">({intPct}%)</span>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center">
                          <span className="text-emerald-800 block text-[10px] font-semibold">Advanced</span>
                          <span className="font-bold text-emerald-950 text-sm">{data.advanced}</span>
                          <span className="text-[10px] text-emerald-700 block">({advPct}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Academic Requirements & Special Class Demand</h4>
                <p className="text-xs text-slate-500">Overview of which subjects require extra periods or practical doubt sessions</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Requirement Area</th>
                      <th className="px-4 py-3 text-center">Student Count</th>
                      <th className="px-4 py-3 text-center">Demand %</th>
                      <th className="px-4 py-3 text-center">Priority</th>
                      <th className="px-4 py-3">Visual Demand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.sortedRequirements.map((item, idx) => (
                      <tr key={item.name} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-900">{item.count}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-700">{item.percentage}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.percentage >= 50 ? 'bg-rose-100 text-rose-800' :
                            item.percentage >= 25 ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.percentage >= 50 ? 'HIGH' : item.percentage >= 25 ? 'MODERATE' : 'NORMAL'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-36 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.percentage >= 50 ? 'bg-rose-500' :
                                item.percentage >= 25 ? 'bg-amber-500' : 'bg-blue-600'
                              }`} 
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer with dual downloads */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Excel file contains 3 formatted worksheets with auto-filter & frozen headers</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Export Plain CSV (.csv)
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              id="footer-download-xlsx-btn"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExportingExcel ? 'Exporting .XLSX...' : 'Download Formatted Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
