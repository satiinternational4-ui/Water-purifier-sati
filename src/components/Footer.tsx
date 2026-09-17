import React from 'react';
import { 
  Droplets, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  Wrench, 
  ShieldCheck, 
  CheckCircle2,
  Smartphone,
  Key,
  Lock
} from 'lucide-react';
import { ShopContact } from '../types';
import { resolveWhatsAppNumber } from '../utils/dispatch';

interface FooterProps {
  shopConfig: ShopContact;
  onScrollToSection: (sectionId: string) => void;
  isHostMode?: boolean;
  onToggleHostMode?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  shopConfig, 
  onScrollToSection,
  isHostMode = false,
  onToggleHostMode,
}) => {
  const directWhatsappUrl = `https://wa.me/${resolveWhatsAppNumber(shopConfig.whatsappPhone)}?text=${encodeURIComponent(
    `Hello Sati International! I need water purifier spare parts / repair service.`
  )}`;

  const directSmsUrl = `sms:${shopConfig.smsPhone || '9304643614'}?body=${encodeURIComponent(
    `Hello Sati International! I need water purifier spare parts / repair service.`
  )}`;

  return (
    <footer id="contact" className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                Need urgent water purifier repair or filters?
              </h4>
              <p className="text-xs text-slate-400">
                Our technicians are equipped with genuine spare parts ready for doorstep dispatch.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onScrollToSection('repair')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-slate-950" />
              <span>Book Doorstep Repair</span>
            </button>

            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>1-Click WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Shop Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-black text-white">
                Sati International
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your premier center for high-grade domestic & commercial RO water purifiers, pure copper booster pumps, 80 GPD membranes, sediment filters, alkaline cartridges, and certified repair technicians.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Genuine Spare Parts Guaranteed</span>
            </div>
          </div>

          {/* Service Area Zones */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Doorstep Service Areas
            </h5>
            <ul className="space-y-2 text-xs">
              {shopConfig.serviceAreas.map((area) => (
                <li key={area} className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{area} (Express Doorstep Visit)</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Catalog Highlights
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onScrollToSection('products')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  • Copper Alkaline RO Water Purifiers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('products')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  • Heavy Duty 100 GPD Booster Pumps
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('products')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  • 80 GPD Thin-Film RO Membranes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('products')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  • 10-Inch Transparent Pre-Filter Bowls
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('products')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  • Bio-Copper Alkaline Mineral Filters
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('repair')}
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  • Water Purifier Doorstep Repair Section
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Orders */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Contact &amp; 1-Click Orders
            </h5>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Direct Order Email</span>
                  <a
                    href={`mailto:${shopConfig.email}`}
                    className="hover:text-cyan-400 font-semibold"
                  >
                    {shopConfig.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Phone &amp; WhatsApp Helpline</span>
                  <a
                    href={directWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:text-cyan-400"
                  >
                    {shopConfig.whatsappPhone.startsWith('+') ? shopConfig.whatsappPhone : `+${shopConfig.whatsappPhone}`}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Direct 1-Click SMS Helpline</span>
                  <a
                    href={directSmsUrl}
                    className="font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    {shopConfig.smsPhone || '9304643614'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Working Hours</span>
                  <span>{shopConfig.hours}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Host Portal access */}
        <div className="mt-12 pt-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} Sati International. All rights reserved. Water Purifiers &amp; Genuine Spare Parts.
          </p>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Birganj</span>
            <span>•</span>
            <span>Raxaul</span>
            <span>•</span>
            <span>Laxmipur Noniyadih</span>
            <span>•</span>
            <span>Bettiah</span>
            <span>•</span>
            <span>Motihari</span>
            <span>•</span>
            <span>Sugauli</span>
          </div>

          {onToggleHostMode && (
            <button
              onClick={onToggleHostMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                isHostMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-400 hover:border-amber-500/40'
              }`}
            >
              {isHostMode ? (
                <>
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Host Portal Active (Manage / Exit)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Host / Owner Mode (20-Digit Passcode)</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </footer>
  );
};
