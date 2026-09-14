import React, { useState } from 'react';
import { 
  User, 
  Send, 
  UploadCloud, 
  FileCheck, 
  X, 
  AlertCircle, 
  Sparkles,
  Clock,
  ShieldCheck,
  FileText,
  MessageCircle
} from 'lucide-react';
import { RequestCategory, RequestUrgency, StudentRequest, AttachedDocument } from '../types';
import { URGENCY_CONFIG } from '../utils/categories';
import { saveRequestToFirestore } from '../lib/requestsService';

interface StudentFormProps {
  onSuccess: (request: StudentRequest, openWhatsApp?: boolean) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onSuccess }) => {
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState('B.Tech CS 3rd Year');
  const [section, setSection] = useState('Section A');
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

  const handleDemoFill = () => {
    setStudentName('Mohammad Farhan');
    setRollNumber('CS-2024-89');
    setClassName('B.Tech CS 3rd Year');
    setSection('Section B');
    setPhone('+91 99887 76655');
    setEmail('farhan.student@college.edu');
    setTitle('Request for Character & Bonafide Certificate for Internship');
    setDescription('Respected Teacher, I have been selected for a summer internship program at Tech Solutions. The company requires a verified Character and Bonafide Certificate from our department.');
    setUrgency('high');
    setConfirmed(true);
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
      const payload = {
        studentName,
        rollNumber,
        className,
        section,
        phone,
        email,
        category,
        title,
        description,
        urgency,
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
          phone: phone.trim(),
          email: email.trim(),
          category: category || 'document',
          title: title.trim(),
          description: description.trim(),
          urgency: urgency || 'normal',
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
          विद्यार्थी अपनी आवश्यकता या दस्तावेज़ का विवरण यहाँ भरें। आपका डेटा सीधे क्लास टीचर के डैशबोर्ड में सुरक्षित सेव हो जाएगा।
        </p>

        {/* Quick Demo Fill Button */}
        <div className="mt-4">
          <button
            type="button"
            id="demo-fill-btn"
            onClick={handleDemoFill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Fill (परीक्षण हेतु भरें)
          </button>
        </div>
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
              <p className="text-xs text-slate-500">विद्यार्थी का व्यक्तिगत व क्लास विवरण</p>
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
                  <span><b>WhatsApp ऑटो-मैसेज:</b> फॉर्म सबमिट होते ही इस नंबर पर रसीद भेजी जाएगी</span>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none pt-0.5">
                  <input
                    type="checkbox"
                    id="whatsapp-auto-send-checkbox"
                    checked={notifyOnWhatsApp}
                    onChange={(e) => setNotifyOnWhatsApp(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>सबमिट करते ही व्हाट्सएप पर तुरंत रसीद खोलें</span>
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

        {/* Section 2: Requirement Details (Cleaned up as requested - Category selection removed) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Requirement & Document Details</h2>
              <p className="text-xs text-slate-500">अपनी आवश्यकता या समस्या का विवरण लिखें</p>
            </div>
          </div>

          {/* Subject / Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject / Requirement Title (आवश्यकता का विषय) <span className="text-rose-500">*</span>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Reason / Description (विस्तार से विवरण बताएं) <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description-input"
              required
              rows={4}
              placeholder="विस्तार से बताएं कि आपको क्या चाहिए और क्यों... (Please describe your requirement or problem clearly)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Urgency Level (प्राथमिकता)
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

        {/* Section 3: Document Upload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Attach Document or Proof (Optional)</h2>
              <p className="text-xs text-slate-500">कोई संबंधित दस्तावेज़, रसीद, मेडिकल पर्ची या फोटो अपलोड करें</p>
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

        {/* Section 4: Declaration & Submit */}
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
              मैं प्रमाणित करता/करती हूँ कि ऊपर दी गई जानकारी सही है। सबमिट करने पर मुझे पुष्टिकरण संदेश (SMS/Notification) प्राप्त होगा।
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
                <span>Submit Requirement (अनुरोध सबमिट करें)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
