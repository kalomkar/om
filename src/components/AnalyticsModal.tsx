import React, { useMemo } from 'react';
import { 
  X, 
  Download, 
  BarChart3, 
  Award, 
  BookOpen, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { StudentRequest } from '../types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: StudentRequest[];
  onExportCSV: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onExportCSV
}) => {
  // Compute analytics
  const analytics = useMemo(() => {
    const totalStudents = requests.length;

    // Skills breakdown
    const skills = [
      { key: 'programming', label: 'Programming Skills' },
      { key: 'googleDocsWord', label: 'Google Docs & MS Word' },
      { key: 'googleSheetsExcel', label: 'Google Sheets & MS Excel' },
      { key: 'googleForms', label: 'Google Forms' },
      { key: 'reportWriting', label: 'Report Writing Skills' },
      { key: 'englishCommunication', label: 'English Communication' }
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
        count,
        percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Colleges breakdown
    const colleges: Record<string, number> = {};
    requests.forEach(r => {
      if (r.previousCollegeName?.trim()) {
        const name = r.previousCollegeName.trim();
        colleges[name] = (colleges[name] || 0) + 1;
      }
    });

    return {
      totalStudents,
      skills,
      skillCounts,
      sortedRequirements,
      collegesCount: Object.keys(colleges).length
    };
  }, [requests]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="analytics-modal-container"
        className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <BarChart3 className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg sm:text-xl text-white">Automated Student Data Analysis</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                  Live Insights
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Self-rating distributions & present academic requirements across {analytics.totalStudents} student responses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              id="analytics-download-csv-btn"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Analyzed Excel (.csv)</span>
            </button>
            <button
              onClick={onClose}
              id="analytics-close-btn"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider block">
                Total Submissions
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-blue-950">{analytics.totalStudents}</span>
                <span className="text-xs text-slate-500">students</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-[11px] text-indigo-700 font-semibold uppercase tracking-wider block">
                Top Academic Need
              </span>
              <div className="mt-1">
                <span className="text-sm font-bold text-indigo-950 block truncate">
                  {analytics.sortedRequirements[0]?.name || 'N/A'}
                </span>
                <span className="text-xs text-indigo-700 font-semibold">
                  {analytics.sortedRequirements[0]?.count || 0} students ({analytics.sortedRequirements[0]?.percentage || 0}%)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider block">
                Previous Colleges
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-950">{analytics.collegesCount}</span>
                <span className="text-xs text-slate-500">recorded</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-[11px] text-purple-700 font-semibold uppercase tracking-wider block">
                Analysis Mode
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-950">Auto Calculated</span>
              </div>
            </div>
          </div>

          {/* Section 1: Present Academic Requirements Demand */}
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <h4 className="font-bold text-sm text-slate-900">
                  Present Academic Requirements Demand (Ranked by Demand)
                </h4>
              </div>
              <span className="text-xs text-slate-500">Special classes & extra periods requested</span>
            </div>

            <div className="space-y-3">
              {analytics.sortedRequirements.map((item, idx) => {
                const isTop = idx === 0 && item.count > 0;
                return (
                  <div key={item.name} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isTop ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.count} students</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          item.percentage >= 50 ? 'bg-rose-100 text-rose-800' :
                          item.percentage >= 25 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.percentage >= 50 ? 'bg-rose-500' :
                          item.percentage >= 25 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Technical & Software Skills Self-Rating Breakdown */}
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-700" />
                <h4 className="font-bold text-sm text-slate-900">
                  Student Skills Self-Assessment Distribution
                </h4>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Beginner</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Intermediate</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Advanced</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analytics.skills.map((skill) => {
                const data = analytics.skillCounts[skill.key];
                const total = data.totalAssessed || 1;
                const begPct = Math.round((data.beginner / total) * 100);
                const intPct = Math.round((data.intermediate / total) * 100);
                const advPct = Math.round((data.advanced / total) * 100);

                return (
                  <div key={skill.key} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-xs text-slate-900">{skill.label}</h5>
                      <span className="text-[10px] text-slate-400">
                        {data.totalAssessed} responses
                      </span>
                    </div>

                    {/* Stacked bar */}
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                      <div style={{ width: `${begPct}%` }} className="bg-amber-400" title={`Beginner: ${data.beginner} (${begPct}%)`} />
                      <div style={{ width: `${intPct}%` }} className="bg-blue-500" title={`Intermediate: ${data.intermediate} (${intPct}%)`} />
                      <div style={{ width: `${advPct}%` }} className="bg-emerald-500" title={`Advanced: ${data.advanced} (${advPct}%)`} />
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] pt-1">
                      <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/50 text-center">
                        <span className="text-amber-700 block text-[10px] font-medium">Beginner</span>
                        <span className="font-bold text-amber-900">{data.beginner} <span className="text-[10px]">({begPct}%)</span></span>
                      </div>
                      <div className="bg-blue-50/70 p-1.5 rounded-lg border border-blue-200/50 text-center">
                        <span className="text-blue-700 block text-[10px] font-medium">Intermediate</span>
                        <span className="font-bold text-blue-900">{data.intermediate} <span className="text-[10px]">({intPct}%)</span></span>
                      </div>
                      <div className="bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-200/50 text-center">
                        <span className="text-emerald-700 block text-[10px] font-medium">Advanced</span>
                        <span className="font-bold text-emerald-900">{data.advanced} <span className="text-[10px]">({advPct}%)</span></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Insights for Faculty */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Automated Faculty Recommendations & Action Plan</span>
            </div>
            <ul className="text-xs text-indigo-950 space-y-1.5 pl-5 list-disc">
              <li>
                <b>High Priority Needs:</b> Schedule additional periods or workshops for <span className="font-semibold text-blue-800">{analytics.sortedRequirements.slice(0, 2).map(r => r.name).join(' & ')}</span> as requested by the majority of students.
              </li>
              <li>
                <b>Foundational Training:</b> For students rated as <i>Beginner</i> in Programming and Report Writing, organize structured introductory lab sessions.
              </li>
              <li>
                <b>Excel Export:</b> When you click <b>Download Analyzed Excel (.csv)</b>, the exported spreadsheet automatically contains individual student rows followed by these exact aggregated summary tables.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Automated calculations updated dynamically as students submit.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={onExportCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Analyzed Excel (.csv)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
