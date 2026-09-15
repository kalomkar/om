import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  Trash2,
  X,
  Copy,
  Check,
  BookOpen,
  FileText,
  Calendar,
  Code,
  GraduationCap,
  Layers,
  Lightbulb,
  MessageSquare,
  Zap,
  HelpCircle,
  Database,
  ChevronDown
} from 'lucide-react';
import Markdown from 'react-markdown';
import { StudentRequest } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: StudentRequest[];
  initialRole?: 'faculty_copilot' | 'letter_drafter' | 'doubt_solver' | 'student_guide';
  initialPrompt?: string;
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  requests,
  initialRole = 'faculty_copilot',
  initialPrompt = '',
}) => {
  const [role, setRole] = useState<'faculty_copilot' | 'letter_drafter' | 'doubt_solver' | 'student_guide'>(initialRole);
  const [model, setModel] = useState<string>('gemini-3.8-flash');
  const [includeDbContext, setIncludeDbContext] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showUseCases, setShowUseCases] = useState<boolean>(true);

  // Storage key for multi-turn chat history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('gemini_chat_history_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: `**Namaste! I am your College Academic AI Copilot powered by Google Gemini.** ✨\n\nMujhe is portal me aapke **Academic & Administrative works** ko super-fast aur easy banane ke liye banaya gaya hai.\n\n### 💡 Aap mujhe yahan kaise use kar sakte hain?\n1. **📊 Student Requirements & Skill Analysis**: Portal ke students ka data analyze karke remedial timetable banwana.\n2. **✍️ 1-Click Official Letters & Notices**: Bonafide Certificates, Medical Leave approvals, aur WhatsApp circulars draft karwana.\n3. **📚 Subject Tutor & Doubt Clearing**: Programming, MS Excel, aur Report Writing ke concepts samjhana aur question banks banana.\n4. **📝 Student Application Guide**: Students ko Principal ya HOD ke liye polite application drafts likhna.\n\n*Neeche diye gaye buttons me se kisi par click karein ya apna sawal seedhe type karein!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle initialPrompt if provided
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gemini_chat_history_v2', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build live database context to inject into Gemini
  const buildDbContextSummary = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const categories = requests.reduce((acc: Record<string, number>, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});

    // Count programming beginner
    const programmingBeginners = requests
      .filter(r => r.skillRatings?.programming === 'Beginner')
      .map(r => ({ name: r.studentName, roll: r.rollNumber, class: r.className }));

    // Count students asking for extra periods
    const extraPeriodStudents = requests
      .filter(r => r.academicRequirements?.includes('Extra Periods / Doubt Classes'))
      .map(r => ({ name: r.studentName, roll: r.rollNumber, note: r.extraRequirementsNote }));

    return {
      institution: 'SRN Mehta College Kalburgi',
      totalRecords: total,
      pendingVerification: pending,
      categoryDistribution: categories,
      programmingBeginnersList: programmingBeginners,
      studentsRequestingExtraPeriods: extraPeriodStudents,
      sampleStudentDetails: requests.slice(0, 5).map(r => ({
        id: r.id,
        name: r.studentName,
        roll: r.rollNumber,
        category: r.category,
        title: r.title,
        status: r.status,
        programmingSkill: r.skillRatings?.programming,
        requirements: r.academicRequirements,
      }))
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const contextData = includeDbContext ? buildDbContextSummary() : null;

      // Send to server-side Gemini API
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map(m => ({ role: m.role, text: m.text })),
          role,
          model,
          contextData,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.reply) {
        const modelMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          text: `⚠️ **Could not generate response:** ${data?.details || data?.error || 'Please check GEMINI_API_KEY in Settings > Secrets or try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          text: `⚠️ **Connection Error:** Unable to reach server. (${err?.message || 'Network request failed'})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear current chat conversation history?')) {
      const resetMsg: ChatMessage[] = [
        {
          id: 'msg-welcome-fresh',
          role: 'model',
          text: `Conversation cleared. How can I help you with student academic planning, letter drafting, or study doubts?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ];
      setMessages(resetMsg);
      localStorage.setItem('gemini_chat_history_v2', JSON.stringify(resetMsg));
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Quick prompt cards
  const promptTemplates = [
    {
      title: '📊 Weak Students Remedial Timetable',
      desc: 'Database ke beginner students ke liye 2-week schedule banao',
      prompt: 'Hamare portal database ke un students ko analyze karo jinki programming beginner hai aur jinhone extra periods request kiye hain. Unke liye ek realistic 2-week remedial timetable aur faculty action plan banao.',
      role: 'faculty_copilot' as const,
    },
    {
      title: '✍️ Bonafide Certificate Reply',
      desc: 'Aarav Sharma ke request ka official approved letter draft karo',
      prompt: 'Student Aarav Sharma (CS-2024-42) ne Bonafide Certificate ke liye request bheji hai. College letterhead ke format me official Bonafide Certificate draft karo jisme college stamp aur signature ki jagah ho.',
      role: 'letter_drafter' as const,
    },
    {
      title: '📱 WhatsApp Extra Class Notice',
      desc: 'Students ke WhatsApp group ke liye circular notice banao',
      prompt: 'Class WhatsApp group ke liye ek clear, motivating circular notice draft karo jisme Extra Doubt Clearing Classes (Programming & Excel) ka schedule aur lab timings batayi gayi ho.',
      role: 'letter_drafter' as const,
    },
    {
      title: '💻 Programming Practice Questions',
      desc: 'Beginners ke liye 5 step-by-step coding exercises',
      prompt: 'Jo students Programming me Beginner hain, unke liye 5 simple Python / C programming practice questions aur unke step-by-step solutions explain karo.',
      role: 'doubt_solver' as const,
    },
    {
      title: '📈 Excel VLOOKUP Explained',
      desc: 'Student marksheet example se simple Hindi/English me samjhao',
      prompt: 'MS Excel me VLOOKUP aur IF conditions ko ek college student marksheet ke real example ke sath aasan bhasha me samjhao.',
      role: 'doubt_solver' as const,
    },
    {
      title: '📝 Medical Leave Application Draft',
      desc: 'Student ke liye Principal ko formal leave letter',
      prompt: 'Ek student ke liye Principal ko 3 din ki Medical Leave application draft karo jisme doctor prescription attach karne ka zikr ho.',
      role: 'student_guide' as const,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-5xl h-[92vh] max-h-[860px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-indigo-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>Gemini Academic AI Copilot</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Active
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                College Faculty Analytics, Administrative Letter Drafter & Subject Tutor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="ai-toggle-use-cases-btn"
              onClick={() => setShowUseCases(!showUseCases)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-colors"
              title="Toggle AI use cases explanation"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">{showUseCases ? 'Hide Guide' : 'Where AI is Used?'}</span>
            </button>

            <button
              id="ai-clear-chat-btn"
              onClick={handleClearHistory}
              title="Clear conversation history"
              className="text-xs p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              id="ai-close-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-toolbar: Role Selector & Model & Database Context Toggle */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* 4 Role Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto max-w-full">
            <button
              id="ai-role-faculty-btn"
              onClick={() => setRole('faculty_copilot')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                role === 'faculty_copilot'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculty Copilot</span>
            </button>

            <button
              id="ai-role-letters-btn"
              onClick={() => setRole('letter_drafter')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                role === 'letter_drafter'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notice & Letters</span>
            </button>

            <button
              id="ai-role-tutor-btn"
              onClick={() => setRole('doubt_solver')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                role === 'doubt_solver'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Subject Tutor</span>
            </button>

            <button
              id="ai-role-student-btn"
              onClick={() => setRole('student_guide')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                role === 'student_guide'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Guide</span>
            </button>
          </div>

          {/* Right controls: Model Selector & Live Database Context Sync */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Live Database Context Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
              <input
                id="ai-db-context-checkbox"
                type="checkbox"
                checked={includeDbContext}
                onChange={(e) => setIncludeDbContext(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="flex items-center gap-1 font-medium">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Live Student Data</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {requests.length} records
                </span>
              </span>
            </label>

            {/* Model Selector */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Model:</span>
              <select
                id="ai-model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
                <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Reasoning)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Explainer Banner: "Where & How AI Works in This Portal" */}
        {showUseCases && (
          <div className="px-4 sm:px-6 py-3 bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-slate-50 border-b border-indigo-100 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                  AI Kahan aur Kaise Use Karein? (4 Real-Life College Use Cases)
                </h3>
              </div>
              <button
                onClick={() => setShowUseCases(false)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {promptTemplates.slice(0, 4).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setRole(item.role);
                    handleSendMessage(item.prompt);
                  }}
                  className="p-2.5 bg-white hover:bg-blue-50/80 rounded-xl border border-indigo-100/80 hover:border-blue-300 text-left transition-all shadow-2xs group flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors flex items-center justify-between">
                      <span>{item.title}</span>
                      <Zap className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                  <span className="mt-2 text-[10px] text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                    ⚡ Click to generate now
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-700 to-blue-800 text-amber-300'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-xs border ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-white text-slate-800 border-slate-200'
                }`}
              >
                {/* Header: Role & Timestamp */}
                <div
                  className={`flex items-center justify-between gap-3 text-[11px] pb-1.5 mb-1.5 border-b ${
                    msg.role === 'user'
                      ? 'text-blue-100 border-blue-500/50'
                      : 'text-slate-400 border-slate-100'
                  }`}
                >
                  <span className="font-semibold">
                    {msg.role === 'user' ? 'You' : 'Gemini AI Assistant'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'model' && (
                      <button
                        onClick={() => handleCopy(msg.text, index)}
                        className="hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                        title="Copy response text"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-800 text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 text-sm shadow-xs border border-slate-200 flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-medium ml-1">
                  Gemini ({model}) is analyzing database and formulating response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-100/80 border-t border-slate-200 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide shrink-0">
            Quick Prompts:
          </span>
          {promptTemplates.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setRole(p.role);
                handleSendMessage(p.prompt);
              }}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-full font-medium whitespace-nowrap transition-all shadow-2xs cursor-pointer shrink-0"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <textarea
                id="ai-chat-input-textarea"
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder={`Ask Gemini about student stats, remedial schedules, official letters, or study doubts... (Press Enter to send)`}
                className="w-full bg-transparent border-none resize-none focus:outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                <span>
                  Role: <strong className="text-slate-700 capitalize">{role.replace('_', ' ')}</strong>
                </span>
                <span className="hidden sm:inline">Press Shift+Enter for new line</span>
              </div>
            </div>

            <button
              id="ai-send-message-btn"
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
