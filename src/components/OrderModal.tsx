import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Phone, 
  User, 
  Home, 
  CheckCircle2, 
  Copy, 
  Check, 
  CreditCard,
  Truck,
  Sparkles,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { CartItem, OrderFormData, ServiceArea, ShopContact } from '../types';
import { 
  formatCurrency, 
  generateWhatsAppOrderUrl, 
  generateGmailOrderLinks, 
  generateSmsOrderUrl,
  copyToClipboard,
  buildOrderTextMessage 
} from '../utils/dispatch';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  shopConfig: ShopContact;
  initialArea?: ServiceArea;
  onOrderSuccess: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  items,
  shopConfig,
  initialArea,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    phone: '',
    altPhone: '',
    area: initialArea || 'Raxaul',
    address: '',
    landmark: '',
    notes: '',
    paymentPreference: 'Cash on Delivery / Doorstep',
  });

  const [copied, setCopied] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const isFastZone = 
    formData.area === 'Birganj' || 
    formData.area === 'Raxaul' || 
    formData.area === 'Laxmipur Noniyadih';

  const turnaroundTime = isFastZone ? 'within 6hr to one day' : 'under 1 to 2 days';

  const validate = (): boolean => {
    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Please provide your Name, Mobile Phone Number, and Delivery Address.');
      return false;
    }
    return true;
  };

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const url = generateWhatsAppOrderUrl(
      formData,
      items,
      totalAmount,
      shopConfig.whatsappPhone || '+997 9804235755'
    );
    const displayPhone = (shopConfig.whatsappPhone || '+997 9804235755').startsWith('+')
      ? (shopConfig.whatsappPhone || '+997 9804235755')
      : `+${shopConfig.whatsappPhone}`;
    setSubmittedStatus(`WhatsApp opened directly with Sati International (${displayPhone})! Click Send in WhatsApp to finalize.`);
    window.open(url, '_blank');
    setTimeout(() => {
      onOrderSuccess();
    }, 1500);
  };

  const handleGmailAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { mailtoUrl } = generateGmailOrderLinks(
      formData,
      items,
      totalAmount,
      shopConfig.email || 'satiinternational4@gmail.com'
    );
    setSubmittedStatus(`Opening Gmail app directly with recipient ${shopConfig.email || 'satiinternational4@gmail.com'}!`);
    window.location.href = mailtoUrl;
    setTimeout(() => {
      onOrderSuccess();
    }, 1500);
  };

  const handleGmailWebOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { webUrl } = generateGmailOrderLinks(
      formData,
      items,
      totalAmount,
      shopConfig.email || 'satiinternational4@gmail.com'
    );
    setSubmittedStatus(`Opening Gmail composer web tab directed to ${shopConfig.email || 'satiinternational4@gmail.com'}!`);
    window.open(webUrl, '_blank');
    setTimeout(() => {
      onOrderSuccess();
    }, 1500);
  };

  const handleSmsOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const smsUrl = generateSmsOrderUrl(
      formData,
      items,
      totalAmount,
      shopConfig.smsPhone || '9304643614'
    );
    setSubmittedStatus(`Opening SMS app directly addressed to ${shopConfig.smsPhone || '9304643614'}!`);
    window.location.href = smsUrl;
    setTimeout(() => {
      onOrderSuccess();
    }, 1500);
  };

  const handleCopyOrder = async () => {
    const text = buildOrderTextMessage(formData, items, totalAmount, shopConfig.name);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Direct Order Checkout
            </span>
            <h3 className="text-xl font-black text-white">
              Complete Your Water Purifier &amp; Spares Order
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              1-Click instant dispatch to Sati International via WhatsApp or Gmail.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {submittedStatus && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Order Prepared!</strong>
                <p className="text-xs">{submittedStatus}</p>
              </div>
            </div>
          )}

          {/* Selected Products Breakdown */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Selected Products ({items.length})</span>
              <span className="text-cyan-400 font-bold">{formatCurrency(totalAmount)}</span>
            </h4>
            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0"
                >
                  <div className="flex items-center gap-2 max-w-[75%]">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Qty: {item.quantity} × {formatCurrency(item.product.price)}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-100">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information Form */}
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Customer Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Singh"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile / WhatsApp Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 98XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service Area / Zone *
                </label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value as ServiceArea })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {shopConfig.serviceAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                  <option value="Other / Nearby">Other / Nearby Zone</option>
                </select>
                <div className="mt-1.5 text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-cyan-400" />
                  <span>Doorstep delivery: <strong>{turnaroundTime}</strong></span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Delivery Address (House/Shop/Street) *
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Ward #4, Station Road, Near Central Bank"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.landmark || ''}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Opposite Durga Temple / Main Chowk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Preference
                </label>
                <select
                  value={formData.paymentPreference}
                  onChange={(e) => setFormData({ ...formData, paymentPreference: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Cash on Delivery / Doorstep">Cash on Delivery / Upon Inspection</option>
                  <option value="UPI / Online">UPI / QR Code / Net Banking</option>
                  <option value="Store Pickup">Store Pickup at Sati International Hub</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Order Notes / Special Requests (Optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="e.g. Need installation technician with the purifier, or deliver between 2 PM - 5 PM"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Direct One-Click Dispatch Buttons Section */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="text-center text-xs text-slate-400">
                🚀 <strong>1-Click Instant Dispatch:</strong> Directly opens your selected app addressed to Sati International.
              </div>

              {/* Primary 1-Click Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1-Click WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
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
                  onClick={handleSmsOrder}
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
                  onClick={handleGmailAppOrder}
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

              {/* Auxiliary actions: Gmail Web and Clipboard */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleGmailWebOrder}
                  className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Gmail Web browser tab</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyOrder}
                  className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Order Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Formatted Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
