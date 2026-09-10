import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, QrCode, ExternalLink, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, portalUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const studentUrl = portalUrl.includes('?') 
    ? `${portalUrl}&mode=student` 
    : `${portalUrl}?mode=student`;

  const defaultMessage = `नमस्ते प्रिय विद्यार्थियों! 📚\n\nयदि आपको कॉलेज या क्लास से संबंधित किसी दस्तावेज़ (मार्कशीट, बोनाफाइड सर्टिफिकेट, छुट्टी आवेदन, फीस रसीद या अन्य आवश्यकता) की जरूरत है, तो नीचे दिए गए लिंक को खोलकर अपना विवरण और आवश्यक दस्तावेज़ सबमिट करें।\n\n🔗 छात्र आवेदन लिंक:\n${studentUrl}\n\nसबमिट करते ही आपको ट्रैकिंग नंबर और पुष्टिकरण सूचना मिल जाएगी।`;

  const handleCopy = () => {
    navigator.clipboard.writeText(studentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(defaultMessage);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  // QR Code generator URL using public standard QR service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(studentUrl)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div id="share-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Share Student Form Link</h3>
              <p className="text-blue-100 text-xs">छात्रों के साथ लिंक शेयर करें</p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Copy Box */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Direct Student Portal URL
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-200 rounded-xl">
              <input
                type="text"
                readOnly
                value={studentUrl}
                className="bg-transparent text-sm text-slate-800 w-full outline-hidden font-mono px-2"
              />
              <button
                id="copy-student-link-btn"
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              ✨ Anyone with this link can fill and submit their requirements.
            </p>
          </div>

          {/* WhatsApp Direct Share Button */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                Share on WhatsApp Class Group
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                Pre-written message with instructions and link
              </p>
            </div>
            <button
              id="whatsapp-share-btn"
              onClick={handleWhatsAppShare}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Send to WhatsApp
            </button>
          </div>

          {/* QR Code Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-slate-800 font-medium text-sm mb-3">
              <QrCode className="w-4 h-4 text-blue-600" />
              Classroom QR Code (Display or Project)
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm inline-block">
              <img
                src={qrCodeUrl}
                alt="Student Submission QR Code"
                className="w-36 h-36 rounded-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 max-w-xs">
              Students can scan this QR code with their smartphone camera to open the form directly in class.
            </p>
          </div>

          {/* Test Link Button */}
          <div className="pt-1 flex items-center justify-between">
            <button
              id="open-student-view-btn"
              onClick={() => {
                window.open(studentUrl, '_blank');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Form in New Tab to test
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
