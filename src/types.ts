export type RequestCategory =
  | 'document'
  | 'certificate'
  | 'leave'
  | 'fee'
  | 'exam_doubt'
  | 'library_lab'
  | 'special_assistance'
  | 'other';

export type RequestUrgency = 'normal' | 'high' | 'urgent';

export type RequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'resolved';

export interface AttachedDocument {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

export interface StudentRequest {
  id: string; // e.g. REQ-748291
  studentName: string;
  rollNumber: string;
  className: string;
  section?: string;
  phone: string;
  email: string;
  category: RequestCategory;
  title: string;
  description: string;
  urgency: RequestUrgency;
  attachedFile?: AttachedDocument;
  status: RequestStatus;
  teacherRemarks?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  notificationSent: boolean;
  notificationDetails: {
    smsSent: boolean;
    emailSent: boolean;
    sentAt: string;
  };
}

export interface DashboardStats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  resolved: number;
}
