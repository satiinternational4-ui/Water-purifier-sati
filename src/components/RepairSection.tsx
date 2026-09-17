import React, { useState } from 'react';
import { 
  Wrench, 
  Upload, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  MessageSquare, 
  Mail, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Phone, 
  Copy, 
  Check,
  AlertTriangle,
  Smartphone,
  ExternalLink,
  Truck,
  Paperclip
} from 'lucide-react';
import { RepairFormData, ServiceArea, ShopContact } from '../types';
import { 
  generateWhatsAppRepairUrl, 
  generateGmailRepairLinks, 
  generateSmsRepairUrl,
  copyToClipboard,
  buildRepairTextMessage 
} from '../utils/dispatch';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface RepairSectionProps {
  shopConfig: ShopContact;
  initialArea?: ServiceArea;
}

const COMMON_ISSUES = [
  '💧 Water Leaking from Machine / Pipe',
  '🚫 Purifier Not Starting / Power Dead',
  '🔊 Booster Pump Loud Noise / Vibration',
  '⚠️ Bad Taste / Foul Odor / High TDS',
  '⏳ Water Flow Very Slow / Choked Filter',
  '🔄 RO Membrane & Annual Filter Replacement',
  '🎛️ TDS Controller Calibration',
  '🚰 Storage Tank Overflowing',
];

export const RepairSection: React.FC<RepairSectionProps> = ({
  shopConfig,
  initialArea,
}) => {
  const [formData, setFormData] = useState<RepairFormData>({
    customerName: '',
    phone: '',
    area: initialArea || 'Raxaul',
    address: '',
    purifierBrand: '',
    issueType: COMMON_ISSUES[0],
    problemDetails: '',
    urgency: 'Emergency / Same Day',
    photoDataUrl: undefined,
    photoFileName: undefined,
  });

  const [copied, setCopied] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const isFastZone = 
    formData.area === 'Birganj' || 
    formData.area === 'Raxaul' || 
    formData.area === 'Laxmipur Noniyadih';

  const turnaroundTime = isFastZone ? 'within 6hr to one day' : 'under 1 to 2 days';

  // Handle Photo selection & preview with support for large images up to 50MB (e.g. 30MB camera photos)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 50MB.');
      return;
    }

    try {
      const result = await optimizeImageFile(file, {
        maxDimension: 1920,
        quality: 0.85,
        maxSizeMB: 50,
      });

      setFormData((prev) => ({
        ...prev,
        photoDataUrl: result.dataUrl,
        photoFileName: `${file.name} (${result.originalSizeFormatted} ➔ ${result.optimizedSizeFormatted})`,
      }));
    } catch (err: any) {
      console.error('Error optimizing repair photo:', err);
      // Fallback to FileReader if canvas optimization fails
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          photoDataUrl: event.target?.result as string,
          photoFileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photoDataUrl: undefined,
      photoFileName: undefined,
    }));
  };

  const validate = () => {
    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Please fill in Customer Name, Phone Number, and Service Address.');
      return false;
    }
    return true;
  };

  const handleWhatsAppSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const url = generateWhatsAppRepairUrl(formData, shopConfig.whatsappPhone || '+997 9804235755');
    const displayPhone = (shopConfig.whatsappPhone || '+997 9804235755').startsWith('+')
      ? (shopConfig.whatsappPhone || '+997 9804235755')
      : `+${shopConfig.whatsappPhone}`;
    setSubmittedStatus(`WhatsApp opened directly with Sati International (${displayPhone})! Please send the photos in the WhatsApp chat.`);
    window.open(url, '_blank');
  };

  const handleGmailAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { mailtoUrl } = generateGmailRepairLinks(formData, shopConfig.email || 'satiinternational4@gmail.com');
    setSubmittedStatus(`Opening Gmail app directly with recipient ${shopConfig.email || 'satiinternational4@gmail.com'}!`);
    window.location.href = mailtoUrl;
  };

  const handleGmailWebSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { webUrl } = generateGmailRepairLinks(formData, shopConfig.email || 'satiinternational4@gmail.com');
    setSubmittedStatus(`Opening Gmail composer web tab directed to ${shopConfig.email || 'satiinternational4@gmail.com'}!`);
    window.open(webUrl, '_blank');
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const smsUrl = generateSmsRepairUrl(formData, shopConfig.smsPhone || '9304643614');
    setSubmittedStatus(`Opening SMS app directly addressed to ${shopConfig.smsPhone || '9304643614'}!`);
    window.location.href = smsUrl;
  };

  const handleCopy = async () => {
    const text = buildRepairTextMessage(formData, shopConfig.name);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <section id="repair" className="py-16 bg-slate-900 border-b border-slate-800 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Dedicated Service & Repair Department</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Doorstep Water Purifier Repair Service
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Upload a photo of your purifier or problem, explain the fault, and dispatch immediately to Sati International via 1-Click WhatsApp &amp; Gmail.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 1-4 Hours Doorstep Visit
            </span>
            <span className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Genuine Spare Replacement
            </span>
            <span className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Birganj • Raxaul • Bettiah • Motihari • Sugauli • Laxmipur
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          
          {submittedStatus && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Request Dispatched!</strong>
                <p className="text-xs">{submittedStatus}</p>
              </div>
            </div>
          )}

          <form className="space-y-6">
            
            {/* 1. Quick Issue Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Select Purifier Problem
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_ISSUES.map((issue) => (
                  <button
                    type="button"
                    key={issue}
                    onClick={() => setFormData({ ...formData, issueType: issue })}
                    className={`p-2.5 rounded-xl text-left text-xs font-medium transition-all cursor-pointer border ${
                      formData.issueType === issue
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Photo Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>2. Attach Purifier / Leaking Part Photo (Optional but Recommended)</span>
                </label>
                {formData.photoDataUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>

              {!formData.photoDataUrl ? (
                <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400">
                    Click or Drag to Upload Machine Photo
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Supports high-res JPG, PNG, WEBP from phone camera or gallery (Up to 50MB, e.g. 30MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <img
                    src={formData.photoDataUrl}
                    alt="Purifier issue preview"
                    className="w-20 h-20 object-cover rounded-xl border border-slate-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">Photo Attached</span>
                      <span className="text-[10px] text-slate-500">Ready to Send</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate max-w-xs mt-0.5">
                      {formData.photoFileName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Technician can diagnose spare part requirement before visiting!
                    </p>
                  </div>
                </div>
              )}

              {formData.photoDataUrl && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-2.5 text-xs text-cyan-200">
                  <Paperclip className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <p className="font-bold text-cyan-300">
                      How WhatsApp sends photos:
                    </p>
                    <p className="text-slate-300">
                      WhatsApp links automatically prefill your full address &amp; machine issue. When your chat opens with Sati International, simply tap the <strong>📎 Paperclip</strong> or <strong>📷 Camera</strong> button in WhatsApp and send this photo from your gallery!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Problem Description & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Purifier Brand / Model
                </label>
                <input
                  type="text"
                  value={formData.purifierBrand}
                  onChange={(e) => setFormData({ ...formData, purifierBrand: e.target.value })}
                  placeholder="e.g. Kent Grand Plus, Aquaguard, Pureit, Assembled RO"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Service Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Emergency / Same Day">⚡ Emergency / Same-Day Visit (Within 2-4 Hrs)</option>
                  <option value="Standard (Within 24 Hrs)">Standard (Within 24 Hours)</option>
                  <option value="Weekend Service">Weekend Scheduled Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Describe The Issue In Detail *
              </label>
              <textarea
                value={formData.problemDetails}
                onChange={(e) => setFormData({ ...formData, problemDetails: e.target.value })}
                rows={3}
                placeholder="e.g. Water is leaking from the bottom pre-filter, the booster pump makes buzzing sound, and the taste is salty. Need technician to visit with replacement filters."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                required
              />
            </div>

            {/* 4. Customer Contact Details */}
            <div className="pt-2 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Customer Contact & Doorstep Address</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Amit Kumar"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Service Area / Town *
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value as ServiceArea })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {shopConfig.serviceAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                    <option value="Other / Nearby">Other / Nearby Area</option>
                  </select>
                  <div className="mt-1.5 text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-amber-400" />
                    <span>Technician visit: <strong>{turnaroundTime}</strong></span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Complete Street Address & Landmark *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. House #24, Near Kali Mandir, Main Road, Raxaul"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 5. One-Click WhatsApp, SMS & Gmail Dispatch Action Row */}
            <div className="pt-6 border-t border-slate-800/80 space-y-3">
              <div className="text-center text-xs text-slate-400">
                ⚡ <strong>1-Click Instant Dispatch:</strong> Directly opens your selected app addressed to Sati International.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1-Click WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleWhatsAppSubmit}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>1-Click WhatsApp</span>
                  </div>
                  <span className="text-[10px] text-emerald-200 font-normal">
                    To: {shopConfig.whatsappPhone.startsWith('+') ? shopConfig.whatsappPhone : `+${shopConfig.whatsappPhone}`}
                  </span>
                </button>

                {/* 1-Click SMS Button */}
                <button
                  type="button"
                  onClick={handleSmsSubmit}
                  className="py-3 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>1-Click Direct SMS</span>
                  </div>
                  <span className="text-[10px] text-cyan-200 font-normal">
                    To: {shopConfig.smsPhone || '9304643614'}
                  </span>
                </button>

                {/* 1-Click Gmail App Button */}
                <button
                  type="button"
                  onClick={handleGmailAppSubmit}
                  className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 fill-current" />
                    <span>1-Click Gmail App</span>
                  </div>
                  <span className="text-[10px] text-rose-200 font-normal truncate max-w-full">
                    To: {shopConfig.email || 'satiinternational4@gmail.com'}
                  </span>
                </button>
              </div>

              {formData.photoFileName && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 px-3.5 py-2.5 rounded-xl">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Photo ready:</strong> When WhatsApp opens with your request, tap the <strong>📎 paperclip / camera icon</strong> in WhatsApp to attach your purifier photo.
                  </span>
                </div>
              )}

              {/* Auxiliary actions: Gmail Web tab and Clipboard */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleGmailWebSubmit}
                  className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Gmail Web browser tab</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Inquiry Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Formatted Repair Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>
    </section>
  );
};
