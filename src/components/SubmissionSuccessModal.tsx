import React, { useState, useEffect } from 'react';
import { CheckCircle2, Copy, Check, Printer, ArrowRight, BellRing, Smartphone, Mail, FileText, MessageCircle, ExternalLink } from 'lucide-react';
import { StudentRequest } from '../types';
import { CATEGORIES } from '../utils/categories';
import { createStudentReceiptWhatsAppUrl } from '../utils/whatsapp';

interface SubmissionSuccessModalProps {
  request: StudentRequest;
  onClose: () => void;
  onTrack: (id: string) => void;
  portalUrl?: string;
  autoOpenWhatsApp?: boolean;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  request,
  onClose,
  onTrack,
  portalUrl,
  autoOpenWhatsApp = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const siteUrl = portalUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const whatsAppUrl = createStudentReceiptWhatsAppUrl(request, siteUrl);

  // Auto-launch WhatsApp if requested
  useEffect(() => {
    if (autoOpenWhatsApp && request.phone) {
      const timer = setTimeout(() => {
        try {
          window.open(whatsAppUrl, '_blank');
        } catch {}
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoOpenWhatsApp, request.phone, whatsAppUrl]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(request.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=700,height=800');
    if (!printWindow) return;

    const catObj = CATEGORIES.find(c => c.id === request.category);

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Acknowledgment Receipt - ${request.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .badge { display: inline-block; padding: 4px 10px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 12px; font-weight: 600; }
            .title { font-size: 22px; font-weight: bold; margin: 0 0 4px 0; color: #0f172a; }
            .subtitle { font-size: 13px; color: #64748b; margin: 0; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px; }
            .row { display: flex; margin-bottom: 10px; font-size: 14px; }
            .label { width: 180px; color: #64748b; font-weight: 500; }
            .val { flex: 1; color: #0f172a; font-weight: 600; }
            .stamp { margin-top: 30px; padding: 12px; border: 1px dashed #94a3b8; border-radius: 8px; text-align: center; font-size: 12px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Student Requirement Desk</div>
              <div class="subtitle">Official Submission Acknowledgment Slip</div>
            </div>
            <div class="badge">RECEIVED & LOGGED</div>
          </div>

          <div class="box">
            <div class="row"><div class="label">Tracking / Ref ID:</div><div class="val" style="color:#2563eb; font-size:16px;">${request.id}</div></div>
            <div class="row"><div class="label">Submission Date:</div><div class="val">${new Date(request.createdAt).toLocaleString()}</div></div>
            <div class="row"><div class="label">Student Name:</div><div class="val">${request.studentName}</div></div>
            <div class="row"><div class="label">Roll Number / ID:</div><div class="val">${request.rollNumber}</div></div>
            <div class="row"><div class="label">Class & Section:</div><div class="val">${request.className} ${request.section ? `(${request.section})` : ''}</div></div>
            <div class="row"><div class="label">Phone (WhatsApp):</div><div class="val">${request.phone || 'N/A'}</div></div>
            <div class="row"><div class="label">Email:</div><div class="val">${request.email || 'N/A'}</div></div>
          </div>

          <div class="box">
            <div class="row"><div class="label">Requirement Category:</div><div class="val">${catObj?.label || request.category}</div></div>
            <div class="row"><div class="label">Subject / Title:</div><div class="val">${request.title}</div></div>
            <div class="row"><div class="label">Priority Level:</div><div class="val" style="text-transform: capitalize;">${request.urgency}</div></div>
            <div class="row"><div class="label">Description / Reason:</div><div class="val" style="font-weight: normal; line-height: 1.5;">${request.description}</div></div>
            <div class="row"><div class="label">Attached Document:</div><div class="val">${request.attachedFile ? request.attachedFile.name : 'No file attached'}</div></div>
            <div class="row"><div class="label">Current Status:</div><div class="val" style="color:#d97706;">Pending Review by Class Teacher</div></div>
          </div>

          <div class="stamp">
            ✓ Your requirement has been saved to the Teacher's Database.<br>
            Please keep your Tracking ID (<strong>${request.id}</strong>) safe to track updates.
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const catObj = CATEGORIES.find(c => c.id === request.category);

  return (
    <div id="submission-success-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6">
        {/* Top Success Banner */}
        <div className="bg-emerald-600 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs ring-4 ring-white/30 animate-bounce-short">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Submission Successful!</h2>
          <p className="text-emerald-100 text-xs mt-1">
            आपका आवेदन सफलतापूर्वक दर्ज कर लिया गया है
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Tracking ID Callout */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-center">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">
              Your Tracking Reference ID
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-bold text-blue-900 tracking-wider">
                {request.id}
              </span>
              <button
                id="copy-tracking-id-btn"
                onClick={handleCopyId}
                title="Copy Tracking ID"
                className="p-1.5 hover:bg-blue-200/60 rounded-lg text-blue-700 transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-blue-600/80 mt-1">
              {copied ? 'Copied to clipboard!' : 'Save this number to check your status later'}
            </p>
          </div>

          {/* Simulated Notification Confirmation Alert */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <BellRing className="w-4 h-4 text-amber-600" />
              Submission Notification Dispatched:
            </div>
            
            <div className="text-xs space-y-2 text-slate-600">
              {request.phone && (
                <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-800">SMS / WhatsApp: </span>
                    Sent to <span className="font-mono text-slate-900">{request.phone}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      "Dear {request.studentName}, your request #{request.id} has been received by your teacher."
                    </p>
                  </div>
                </div>
              )}

              {request.email && (
                <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-800">Email Confirmation: </span>
                    Sent to <span className="font-mono text-slate-900">{request.email}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receipt and copy of request stored for verification.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-slate-800">Teacher Database: </span>
                  Instantly updated in Class Teacher Review Queue.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary of Submission */}
          <div className="text-xs text-slate-600 space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-400">Student:</span>
              <span className="font-medium text-slate-800">{request.studentName} ({request.rollNumber})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-medium text-slate-800">{catObj?.label || request.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Subject:</span>
              <span className="font-medium text-slate-800 truncate max-w-[240px]">{request.title}</span>
            </div>
            {request.attachedFile && (
              <div className="flex justify-between">
                <span className="text-slate-400">Attached File:</span>
                <span className="font-medium text-emerald-700 truncate max-w-[240px]">📎 {request.attachedFile.name}</span>
              </div>
            )}
          </div>

          {/* WhatsApp Direct Action Box */}
          {request.phone && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">WhatsApp Confirmation Slip</h4>
                    <p className="text-[11px] text-emerald-700">व्हाट्सएप पर आधिकारिक रसीद व ट्रैकिंग लिंक</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                  Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  id="open-whatsapp-receipt-btn"
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </a>

                <button
                  id="copy-whatsapp-text-btn"
                  type="button"
                  onClick={() => {
                    const messageText = decodeURIComponent(whatsAppUrl.split('text=')[1] || '');
                    navigator.clipboard.writeText(messageText);
                    setCopiedMsg(true);
                    setTimeout(() => setCopiedMsg(false), 2000);
                  }}
                  className="w-full py-2.5 px-3 bg-white hover:bg-emerald-100/50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMsg ? 'Message Copied!' : 'Copy WhatsApp Text'}</span>
                </button>
              </div>
              <p className="text-[10px] text-emerald-600 text-center">
                यदि व्हाट्सएप अपने आप नहीं खुला तो ऊपर "Open WhatsApp" बटन दबाएं।
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              id="print-receipt-btn"
              onClick={handlePrintReceipt}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
            >
              <Printer className="w-4 h-4" />
              Download / Print Acknowledgment Slip
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="track-this-submission-btn"
                onClick={() => onTrack(request.id)}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                Track Status
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="submit-another-btn"
                onClick={onClose}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
