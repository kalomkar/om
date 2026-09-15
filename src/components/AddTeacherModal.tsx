import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Shield, 
  Check, 
  AlertCircle, 
  Users, 
  Trash2, 
  KeyRound, 
  Building2, 
  UserCheck,
  Lock
} from 'lucide-react';
import { TeacherAccount } from '../types';
import { 
  addTeacherAccount, 
  deleteTeacherAccount, 
  fetchTeachersFromFirestore, 
  subscribeToTeachers,
  PRIMARY_TEACHER 
} from '../lib/teacherService';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated?: (newAccount: TeacherAccount) => void;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated
}) => {
  const [teachers, setTeachers] = useState<TeacherAccount[]>([PRIMARY_TEACHER]);
  const [teacherId, setTeacherId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  useEffect(() => {
    if (!isOpen) return;
    fetchTeachersFromFirestore().then(list => setTeachers(list));
    const unsubscribe = subscribeToTeachers(list => setTeachers(list));
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanId = teacherId.trim();
    if (!cleanId) {
      setErrorMsg('Please enter a Teacher ID.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter the teacher\'s full name.');
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    // Check duplicate
    if (teachers.some(t => t.teacherId.toLowerCase() === cleanId.toLowerCase())) {
      setErrorMsg(`Teacher ID "${cleanId}" already exists. Please choose a different ID.`);
      return;
    }

    setIsSaving(true);
    try {
      const newAcc: TeacherAccount = {
        teacherId: cleanId,
        name: name.trim(),
        password: password.trim(),
        department: department.trim() || 'General Faculty',
        role,
        createdAt: new Date().toISOString()
      };

      await addTeacherAccount(newAcc);
      setSuccessMsg(`New teacher account (ID: ${cleanId}) created successfully and synced to cloud!`);
      
      // Reset fields
      setTeacherId('');
      setName('');
      setDepartment('');
      setPassword('');

      if (onAccountCreated) {
        onAccountCreated(newAcc);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create teacher account. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === PRIMARY_TEACHER.teacherId) {
      alert('The primary teacher ID (9771) cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete Teacher ID ${id}?`)) {
      return;
    }

    try {
      await deleteTeacherAccount(id);
      setSuccessMsg(`Teacher ID ${id} account was removed.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting teacher account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6 animate-fade-in">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <span>Teacher Accounts System</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal border border-blue-400/20">
                  Cloud Synced
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add new faculty accounts or manage existing registered teachers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add New Teacher</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Existing Teachers ({teachers.length})</span>
          </button>
        </div>

        {/* Tab 1: Create Form */}
        {activeTab === 'create' && (
          <div className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teacher ID *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9772 or T-102"
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                    <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password / PIN *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123456"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teacher Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Ramesh Patil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Subject
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Access Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'teacher' | 'admin')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  >
                    <option value="teacher">Class Teacher</option>
                    <option value="admin">Administrator / HOD</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving to Cloud Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save & Create Teacher Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Secure Authentication:</span>
              </p>
              <p>
                Newly created teacher accounts sync directly to Google Cloud Firestore and can be accessed from any phone or computer.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Existing Teachers List */}
        {activeTab === 'list' && (
          <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
            <p className="text-xs text-slate-500">
              Registered teachers authorized to access the faculty dashboard:
            </p>

            <div className="space-y-2">
              {teachers.map((t) => {
                const isPrimary = t.teacherId === PRIMARY_TEACHER.teacherId;
                return (
                  <div
                    key={t.teacherId}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isPrimary
                        ? 'bg-blue-50/70 border-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{t.name}</span>
                        {isPrimary ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900 font-semibold">
                            Primary Incharge
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {t.role === 'admin' ? 'Admin' : 'Teacher'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>ID: <strong className="font-mono text-slate-700">{t.teacherId}</strong></span>
                        <span>•</span>
                        <span>Pass: <strong className="font-mono text-slate-700">{t.password}</strong></span>
                        {t.department && (
                          <>
                            <span>•</span>
                            <span>{t.department}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleDelete(t.teacherId)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                        title="Delete this teacher account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
