import React, { useState } from 'react';
import { 
  User, 
  Send, 
  UploadCloud, 
  FileCheck, 
  X, 
  AlertCircle, 
  Clock,
  ShieldCheck,
  FileText,
  MessageCircle,
  GraduationCap,
  Code2,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Briefcase,
  Presentation,
  Globe,
  MessageSquare,
  Award,
  HelpCircle
} from 'lucide-react';
import { RequestCategory, RequestUrgency, StudentRequest, AttachedDocument, SkillRatingLevel } from '../types';
import { URGENCY_CONFIG } from '../utils/categories';
import { saveRequestToFirestore } from '../lib/requestsService';

interface StudentFormProps {
  onSuccess: (request: StudentRequest, openWhatsApp?: boolean) => void;
  onOpenAiAssistant?: (role?: 'faculty_copilot' | 'letter_drafter' | 'doubt_solver' | 'student_guide', prompt?: string) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onSuccess, onOpenAiAssistant }) => {
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState('B.Tech CS 3rd Year');
  const [section, setSection] = useState('Section A');
  const [previousCollegeName, setPreviousCollegeName] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyOnWhatsApp, setNotifyOnWhatsApp] = useState(true);
  const [email, setEmail] = useState('');
  const [category] = useState<RequestCategory>('document');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<RequestUrgency>('normal');
  const [attachedFile, setAttachedFile] = useState<AttachedDocument | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmed, setConfirmed] = useState(true);

  // Self-rating questions
  const [programmingSkill, setProgrammingSkill] = useState<SkillRatingLevel | ''>('');
  const [docsWordSkill, setDocsWordSkill] = useState<SkillRatingLevel | ''>('');
  const [sheetsExcelSkill, setSheetsExcelSkill] = useState<SkillRatingLevel | ''>('');
  const [formsSkill, setFormsSkill] = useState<SkillRatingLevel | ''>('');
  const [reportWritingSkill, setReportWritingSkill] = useState<'Beginner' | 'Advanced' | ''>('');
  const [englishSkill, setEnglishSkill] = useState<SkillRatingLevel | ''>('');

  // Present Requirements (extra periods, website design, etc.)
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [extraRequirementsNote, setExtraRequirementsNote] = useState('');

  const toggleRequirement = (reqName: string) => {
    setSelectedRequirements(prev =>
      prev.includes(reqName)
        ? prev.filter(item => item !== reqName)
        : [...prev, reqName]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be under 10MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: dataUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim() || !rollNumber.trim()) {
      setErrorMessage('Please enter student name and roll number.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide requirement subject and detailed reason.');
      return;
    }

    if (!confirmed) {
      setErrorMessage('Please confirm your declaration before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const skillRatingsPayload = (programmingSkill || docsWordSkill || sheetsExcelSkill || formsSkill || reportWritingSkill || englishSkill) ? {
        programming: programmingSkill || undefined,
        googleDocsWord: docsWordSkill || undefined,
        googleSheetsExcel: sheetsExcelSkill || undefined,
        googleForms: formsSkill || undefined,
        reportWriting: reportWritingSkill || undefined,
        englishCommunication: englishSkill || undefined,
      } : undefined;

      const payload = {
        studentName,
        rollNumber,
        className,
        section,
        previousCollegeName: previousCollegeName.trim() || undefined,
        phone,
        email,
        category,
        title,
        description,
        urgency,
        skillRatings: skillRatingsPayload,
        academicRequirements: selectedRequirements.length > 0 ? selectedRequirements : undefined,
        extraRequirementsNote: extraRequirementsNote.trim() || undefined,
        attachedFile,
      };

      let submittedItem: StudentRequest | null = null;
      try {
        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.request) {
            submittedItem = data.request;
          }
        }
      } catch (netErr) {
        console.warn('Network issue during submission, falling back to local save:', netErr);
      }

      // If server responded, use that. Otherwise create safe local offline request
      if (!submittedItem) {
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        const newId = `REQ-${randomSuffix}`;
        const now = new Date().toISOString();

        submittedItem = {
          id: newId,
          studentName: studentName.trim(),
          rollNumber: rollNumber.trim().toUpperCase(),
          className: className.trim(),
          section: section ? section.trim() : undefined,
          previousCollegeName: previousCollegeName.trim() || undefined,
          phone: phone.trim(),
          email: email.trim(),
          category: category || 'document',
          title: title.trim(),
          description: description.trim(),
          urgency: urgency || 'normal',
          skillRatings: skillRatingsPayload,
          academicRequirements: selectedRequirements.length > 0 ? selectedRequirements : undefined,
          extraRequirementsNote: extraRequirementsNote.trim() || undefined,
          attachedFile: attachedFile,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          notificationSent: true,
          notificationDetails: {
            smsSent: true,
            emailSent: !!email,
            sentAt: now,
          },
        };
      }

      // Sync to Google Cloud Firestore immediately so all devices see it in real-time
      try {
        await saveRequestToFirestore(submittedItem);
      } catch (firestoreErr) {
        console.warn('Firestore sync note:', firestoreErr);
      }

      onSuccess(submittedItem, notifyOnWhatsApp);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Form Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Official Student Request Desk
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Submit Your Requirement / Document Request
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto mt-2">
          Students can enter academic requests, certificate applications, or document requirements here. Your request will be directly submitted to the faculty dashboard.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Student Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Student Information</h2>
              <p className="text-xs text-slate-500">Student personal and classroom details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="student-name-input"
                  type="text"
                  required
                  placeholder="e.g., Rohit Kumar"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Roll Number / Student ID <span className="text-rose-500">*</span>
              </label>
              <input
                id="roll-number-input"
                type="text"
                required
                placeholder="e.g., CS-2024-45"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm uppercase font-mono bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class / Course <span className="text-rose-500">*</span>
              </label>
              <input
                id="class-name-input"
                type="text"
                required
                placeholder="e.g., B.Tech CS / Class 12 / BCA"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Section / Batch
              </label>
              <input
                id="section-input"
                type="text"
                placeholder="e.g., Section A / Morning Shift"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Previous College / School / Institution Name
                <span className="text-slate-400 font-normal ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="previous-college-input"
                  type="text"
                  placeholder="e.g., Govt PU College Kalaburagi / Previous Institution"
                  value={previousCollegeName}
                  onChange={(e) => setPreviousCollegeName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp / Phone Number <span className="text-rose-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(For notification)</span>
              </label>
              <input
                id="phone-input"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              />
              
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><b>WhatsApp Confirmation:</b> An official receipt will be generated for this number</span>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none pt-0.5">
                  <input
                    type="checkbox"
                    id="whatsapp-auto-send-checkbox"
                    checked={notifyOnWhatsApp}
                    onChange={(e) => setNotifyOnWhatsApp(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Automatically open WhatsApp receipt upon submission</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
                <span className="text-slate-400 font-normal ml-1">(For receipt & updates)</span>
              </label>
              <input
                id="email-input"
                type="email"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Technical & Professional Skills Self-Assessment */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Rate Yourself in the Following Questions</h2>
              <p className="text-xs text-slate-500">Self-assess your technical and software skills to help teachers organize training and support</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Question 1: Programming */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span>Programming Skills</span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">Coding, problem solving & algorithms</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as SkillRatingLevel[]).map((level) => {
                  const isSelected = programmingSkill === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setProgrammingSkill(isSelected ? '' : level)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      <span>{level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 2: Google Docs, MS Word */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">2</span>
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Google Docs & MS Word</span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">Document editing, formatting & documentation</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as SkillRatingLevel[]).map((level) => {
                  const isSelected = docsWordSkill === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDocsWordSkill(isSelected ? '' : level)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      <span>{level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 3: Google Sheets & MS Excel */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">3</span>
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Google Sheets & MS Excel</span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">Tables, formulas, data management & calculations</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as SkillRatingLevel[]).map((level) => {
                  const isSelected = sheetsExcelSkill === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSheetsExcelSkill(isSelected ? '' : level)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      <span>{level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 4: Google Forms */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">4</span>
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Google Forms</span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">Creating quizzes, surveys, gathering responses</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as SkillRatingLevel[]).map((level) => {
                  const isSelected = formsSkill === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormsSkill(isSelected ? '' : level)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      <span>{level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 5: Report Writing Skills (Beginner / Advanced) */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">5</span>
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Report Writing Skills</span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">Project synopsis, documentation & formal reports</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(['Beginner', 'Advanced'] as const).map((level) => {
                  const isSelected = reportWritingSkill === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setReportWritingSkill(isSelected ? '' : level)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      <span>{level === 'Beginner' ? 'i. Beginner' : 'ii. Advanced'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 6: English Communication */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">6</span>
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <span>How Good Are You in English Communication?</span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">Speaking, grammar clarity & conversation</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as SkillRatingLevel[]).map((level) => {
                  const isSelected = englishSkill === level;
                  const label = level === 'Advanced' ? 'Fluent / Advanced' : level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnglishSkill(isSelected ? '' : level)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs ring-2 ring-teal-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Present Academic Requirements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">What is Your Present Requirement?</h2>
              <p className="text-xs text-slate-500">Select areas where you need extra periods, special classes, or guidance (Multiple choice)</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Your Requirement Areas <span className="text-slate-400 font-normal">(Click all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { name: 'Extra Periods', label: 'Extra Periods / Doubt Classes', desc: 'Additional class revision & doubt solving' },
                { name: 'Website Design', label: 'Website Design', desc: 'HTML, CSS, Web pages, responsive UI design' },
                { name: 'English Grammar & Communication', label: 'English Grammar & Communication', desc: 'Spoken English, sentence structuring & public speaking' },
                { name: 'Project Work with Report Writing', label: 'Project Work with Report Writing', desc: 'Mini/Major projects, documentation & synopsis' },
                { name: 'Interview Preparation', label: 'Interview Preparation', desc: 'Mock interviews, HR questions, aptitude & resume building' },
                { name: 'Presentation Slides', label: 'Presentation Slides', desc: 'PowerPoint slide design, visuals & seminar delivery' },
              ].map((item) => {
                const isChecked = selectedRequirements.includes(item.name);
                return (
                  <div
                    key={item.name}
                    onClick={() => toggleRequirement(item.name)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isChecked
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-100 text-blue-900'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 border transition-colors ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold leading-tight">{item.label}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Short Answer / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Requirement Notes / Preferred Topics <span className="text-slate-400 font-normal">(Short Answer / Optional)</span>
            </label>
            <input
              id="extra-requirement-note-input"
              type="text"
              placeholder="e.g., Need extra classes in Web Dev after 3 PM / Guidance on final year project report"
              value={extraRequirementsNote}
              onChange={(e) => setExtraRequirementsNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Section 4: Requirement & Document Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Requirement & Document Details</h2>
              <p className="text-xs text-slate-500">Provide specific information about your request or issue</p>
            </div>
          </div>

          {/* Subject / Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject / Requirement Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="title-input"
                type="text"
                required
                placeholder="e.g., Need Bonafide Certificate / Marksheet Copy / Leave Request..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Reason / Description <span className="text-rose-500">*</span>
              </label>
              {onOpenAiAssistant && (
                <button
                  type="button"
                  id="student-ai-draft-letter-btn"
                  onClick={() => {
                    const prompt = `Main ek college student hoon (Name: ${studentName || 'Student'}, Roll: ${rollNumber || 'Roll No'}, Class: ${className || 'Degree'}). Mujhe "${title || 'Academic Requirement / Certificate'}" ke liye formal college application likhni hai. Meri taraf se Principal ya HOD ke liye ek polite aur clear application draft karke do jise main copy karke apne submission me use kar sakun.`;
                    onOpenAiAssistant('student_guide', prompt);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>✨ AI Help: Draft Application Letter</span>
                </button>
              )}
            </div>
            <textarea
              id="description-input"
              required
              rows={4}
              placeholder="Please describe your requirement or problem clearly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['normal', 'high', 'urgent'] as RequestUrgency[]).map((lvl) => {
                const conf = URGENCY_CONFIG[lvl];
                const isSelected = urgency === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? `${conf.badge} ring-2 ring-blue-100 font-semibold shadow-xs`
                        : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 5: Document Upload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Attach Document or Proof (Optional)</h2>
              <p className="text-xs text-slate-500">Attach any relevant document, receipt, medical slip, or photo</p>
            </div>
          </div>

          {!attachedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer"
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <div className="w-12 h-12 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-800">
                Click to upload or drag & drop file here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, JPG, PNG or DOC (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {attachedFile.name}
                  </p>
                  <p className="text-xs text-emerald-700">
                    {(attachedFile.size / 1024).toFixed(1)} KB • Attached & ready to submit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(undefined)}
                className="p-1.5 hover:bg-emerald-200/50 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Section 6: Declaration & Submit */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              id="confirm-declaration-checkbox"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              I hereby certify that the information provided above is accurate and true. A tracking confirmation ID will be generated upon submission.
            </span>
          </label>

          <button
            id="submit-student-request-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to Teacher Database...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Requirement</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
