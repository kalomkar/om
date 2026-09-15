import React, { useState } from 'react';
import { 
  Lock, 
  UserCheck, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  GraduationCap, 
  Eye, 
  EyeOff,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { authenticateTeacher } from '../lib/teacherService';
import { AddTeacherModal } from './AddTeacherModal';
import { TeacherAccount } from '../types';

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
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const result = await authenticateTeacher(teacherId, password);
      if (result.success) {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMessage(result.error || 'Invalid Teacher ID or Password. Please check your credentials.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Login failed due to an error. Please try again.');
    }
  };

  const handleAccountCreated = (newAcc: TeacherAccount) => {
    setTeacherId(newAcc.teacherId);
    setPassword(newAcc.password);
    setInfoMessage(`New teacher account ${newAcc.name} created successfully! You can now log in.`);
    setIsAddTeacherOpen(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-5 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Teacher / Admin Login
          </h1>
          <p className="text-xs text-slate-500">
            SRN Mehta College • Faculty & Administration Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {infoMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              {infoMessage}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Teacher / Admin ID
              </label>
              <div className="relative">
                <input
                  id="teacher-id-input"
                  type="text"
                  required
                  placeholder="Enter Faculty ID"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password / PIN
              </label>
              <div className="relative">
                <input
                  id="teacher-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter Password"
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
              <span>Back to Student Portal</span>
            </button>
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authorized Faculty Only</span>
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

      {/* Add Teacher Account Modal */}
      <AddTeacherModal
        isOpen={isAddTeacherOpen}
        onClose={() => setIsAddTeacherOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
    </div>
  );
};
