import React from 'react';
import { 
  ShieldCheck, 
  Wrench, 
  MapPin, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Droplets
} from 'lucide-react';
import { ShopContact } from '../types';

interface HeroProps {
  shopConfig: ShopContact;
  onScrollToSection: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ shopConfig, onScrollToSection }) => {
  const directWhatsappUrl = `https://wa.me/${shopConfig.whatsappPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello Sati International! I am looking for water purifier / spare parts information and doorstep service.`
  )}`;

  return (
    <section id="hero" className="relative overflow-hidden bg-slate-950 pt-6 pb-16 lg:py-20 border-b border-slate-800/80">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sati International • Trusted RO Water Solution Center</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Crystal Pure Water & <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                Genuine Spare Parts
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Serving the entire Indo-Nepal border region with premium home & commercial RO purifiers, authentic booster pumps, membranes, filters, and fast doorstep repair service.
            </p>

            {/* Service Area Highlights Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Active Doorstep Service Coverage</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {shopConfig.serviceAreas.map((area) => (
                  <span 
                    key={area}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700/80 text-slate-200 font-medium flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onScrollToSection('products')}
                className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Droplets className="w-5 h-5 text-slate-950" />
                <span>Explore Products & Spares</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onScrollToSection('repair')}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Wrench className="w-5 h-5 text-slate-950" />
                <span>Book Doorstep Repair</span>
              </button>

              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Us</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>100% Genuine Certified Parts</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>1-Click WhatsApp & Gmail Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Doorstep Installation & AMC</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl p-1 bg-gradient-to-b from-cyan-500/30 via-slate-800/50 to-blue-600/20 shadow-2xl shadow-cyan-950/50">
              <div className="relative rounded-[14px] overflow-hidden bg-slate-900">
                <img
                  src="/images/hero.jpg"
                  alt="Modern RO Water Purifier Sati International"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Floating Product Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 flex items-center justify-between shadow-lg">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-400">
                      Signature Series
                    </div>
                    <div className="text-sm font-bold text-white">
                      AquaPro Copper Alkaline RO
                    </div>
                    <div className="text-xs text-slate-400">
                      12L Tank • Free Installation • Doorstep Support
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs line-through text-slate-500">₹16,500</span>
                    <div className="text-base font-extrabold text-cyan-300">
                      ₹11,500
                    </div>
                  </div>
                </div>

                {/* Top status indicator */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Technicians on Duty Now
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
