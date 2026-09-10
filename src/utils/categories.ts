import { RequestCategory, RequestUrgency, RequestStatus } from '../types';

export interface CategoryInfo {
  id: RequestCategory;
  label: string;
  hindiLabel: string;
  description: string;
  iconName: string;
  badgeColor: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'document',
    label: 'Document / Marksheet',
    hindiLabel: 'मार्कशीट / दस्तावेज़',
    description: 'Marksheet duplicate, transcript, ID card, syllabus copy',
    iconName: 'FileText',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'certificate',
    label: 'Certificate (Bonafide / Character)',
    hindiLabel: 'बोनाफाइड / चरित्र प्रमाण पत्र',
    description: 'Bonafide, Character, Transfer Certificate, Recommendation',
    iconName: 'Award',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'leave',
    label: 'Leave / Absence Application',
    hindiLabel: 'छुट्टी / मेडिकल अवकाश आवेदन',
    description: 'Medical leave, family function, sports or urgent absence',
    iconName: 'CalendarOff',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'fee',
    label: 'Fee / Payment / Concession',
    hindiLabel: 'फीस / रसीद / रियायत',
    description: 'Fee installment, fee receipt copy, concession, fine waiver',
    iconName: 'Receipt',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'exam_doubt',
    label: 'Exam / Assignment / Hall Ticket',
    hindiLabel: 'परीक्षा / असाइनमेंट / हॉल टिकट',
    description: 'Re-evaluation, assignment extension, hall ticket error',
    iconName: 'HelpCircle',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'library_lab',
    label: 'Library / Lab Equipment',
    hindiLabel: 'लाइब्रेरी / लैब उपकरण',
    description: 'Book requirement, lab apparatus, software access',
    iconName: 'BookOpen',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'special_assistance',
    label: 'Special Assistance / Health',
    hindiLabel: 'विशेष सहायता / स्वास्थ्य',
    description: 'Counseling, attendance review, physical accommodation',
    iconName: 'HeartHandshake',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'other',
    label: 'Other Requirements',
    hindiLabel: 'अन्य आवश्यकताएँ',
    description: 'Any general request or student requirement',
    iconName: 'MessageSquare',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
  },
];

export const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  pending: {
    label: 'Pending Review',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  in_review: {
    label: 'Under Review',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  approved: {
    label: 'Approved / Ready',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  rejected: {
    label: 'Rejected / Incomplete',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
  resolved: {
    label: 'Completed & Delivered',
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
  },
};

export const URGENCY_CONFIG: Record<RequestUrgency, { label: string; color: string; badge: string }> = {
  normal: {
    label: 'Normal (2-4 Days)',
    color: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  high: {
    label: 'High Priority (24-48 Hours)',
    color: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  urgent: {
    label: 'Urgent (Immediate / Today)',
    color: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
  },
};
