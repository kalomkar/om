import React, { useState } from 'react';
import { 
  Lock, 
  UserCheck, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  GraduationCap, 
  Eye, 
  EyeOff,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

interface TeacherLoginProps {
  onLoginSuccess: () => void;
  onGoToStudent: () => void;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({
  onLoginSuccess,
  onGoToStudent,
}) => {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Accepted credentials
  const DEMO_EMAIL = 'teacher@college.edu';
  const DEMO_PASS = 'teacher123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanId = teacherId.trim().toLowerCase();
      // Allow teacher@college.edu, teacher, or admin
      if (
        (cleanId === 'teacher@college.edu' || cleanId === 'teacher' || cleanId === 'admin') &&
        password === DEMO_PASS
      ) {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid credentials. Please use the demo credentials provided below.');
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setTeacherId(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Teacher / Admin Login
          </h1>
          <p className="text-xs text-slate-500">
            शिक्षक पोर्टल में लॉगिन करें और छात्रों के आवेदन देखें
          </p>
        </div>

        {/* Prominent Demo Credentials Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Dummy Credentials (परीक्षण के लिए)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold">
              Ready to Test
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
              <span className="text-[10px] text-slate-400 block">Teacher ID / Email:</span>
              <span className="font-mono font-semibold text-slate-800 text-xs select-all">teacher@college.edu</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
              <span className="text-[10px] text-slate-400 block">Password:</span>
              <span className="font-mono font-semibold text-slate-800 text-xs select-all">teacher123</span>
            </div>
          </div>

          <button
            type="button"
            id="quick-demo-login-btn"
            onClick={handleQuickDemoLogin}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.99]"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>One-Click Quick Login (1-क्लिक में लॉगिन करें)</span>
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Teacher ID or Email Address
              </label>
              <div className="relative">
                <input
                  id="teacher-id-input"
                  type="text"
                  required
                  placeholder="teacher@college.edu"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="teacher-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password (teacher123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="teacher-submit-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onGoToStudent}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Portal (छात्र पोर्टल)</span>
            </button>
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Teacher Area</span>
            </div>
          </div>
        </div>

        {/* Quick Student Switch Card */}
        <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-center space-y-1.5">
          <p className="text-xs text-slate-600">
            Are you a student looking to submit a requirement?
          </p>
          <button
            onClick={onGoToStudent}
            className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Open Student Submission Form (No login required)
          </button>
        </div>
      </div>
    </div>
  );
};
