import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Wrench, 
  ShoppingCart, 
  MapPin, 
  Phone, 
  Mail, 
  Settings, 
  PlusCircle,
  Menu,
  X,
  Clock,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Key,
  Lock
} from 'lucide-react';
import { ShopContact, ServiceArea } from '../types';

interface HeaderProps {
  shopConfig: ShopContact;
  onUpdateShopConfig: (config: ShopContact) => void;
  cartCount: number;
  onOpenCart: () => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenAddProduct: () => void;
  onSelectAreaFilter: (area: ServiceArea | 'all') => void;
  selectedArea: ServiceArea | 'all';
  isHostMode?: boolean;
  onToggleHostMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shopConfig,
  onUpdateShopConfig,
  cartCount,
  onOpenCart,
  onScrollToSection,
  onOpenAddProduct,
  onSelectAreaFilter,
  selectedArea,
  isHostMode = false,
  onToggleHostMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editWhatsapp, setEditWhatsapp] = useState(shopConfig.whatsappPhone);
  const [editEmail, setEditEmail] = useState(shopConfig.email);
  const [editSms, setEditSms] = useState(shopConfig.smsPhone || '9304643614');
  const [editHours, setEditHours] = useState(shopConfig.hours || '10:00 AM – 7:00 PM (Monday to Sunday)');

  useEffect(() => {
    setEditWhatsapp(shopConfig.whatsappPhone);
    setEditEmail(shopConfig.email);
    setEditSms(shopConfig.smsPhone || '9304643614');
    setEditHours(shopConfig.hours || '10:00 AM – 7:00 PM (Monday to Sunday)');
  }, [shopConfig]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShopConfig({
      ...shopConfig,
      whatsappPhone: editWhatsapp.trim(),
      email: editEmail.trim(),
      smsPhone: editSms.trim() || '9304643614',
      hours: editHours.trim() || '10:00 AM – 7:00 PM (Monday to Sunday)',
    });
    setShowSettingsModal(false);
  };

  return (
    <>
      {/* Top Banner: Service Areas & Emergency Hotline */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-cyan-900/40 text-xs py-2 px-4 text-cyan-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none text-slate-300">
            <span className="inline-flex items-center gap-1 font-semibold text-cyan-400 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Doorstep Service Areas:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {shopConfig.serviceAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => onSelectAreaFilter(area)}
                  className={`px-2 py-0.5 rounded-full text-[11px] transition-all cursor-pointer ${
                    selectedArea === area
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/50'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-cyan-300 border border-slate-700/60'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300 ml-auto shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{shopConfig.hours}</span>
            </div>

            {onToggleHostMode && (
              <button
                onClick={onToggleHostMode}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                  isHostMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm shadow-amber-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Enter 20-digit confidential passcode for Host Mode"
              >
                {isHostMode ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Host: ACTIVE</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Host (20-Digit Lock)</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowSettingsModal(true)}
              title="Shop WhatsApp & Email Settings"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onScrollToSection('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Droplets className="w-7 h-7 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  Sati International
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  RO Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Water Purifiers • Genuine Spare Parts • Doorstep Repairs
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
            <button
              onClick={() => onScrollToSection('products')}
              className="px-3 py-2 rounded-lg hover:text-cyan-400 hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Purifiers & Spare Parts
            </button>
            <button
              onClick={() => onScrollToSection('repair')}
              className="px-3 py-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              Purifier Repair Section
            </button>
            <button
              onClick={() => onScrollToSection('service-areas')}
              className="px-3 py-2 rounded-lg hover:text-cyan-400 hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Service Areas
            </button>
            <button
              onClick={() => onScrollToSection('contact')}
              className="px-3 py-2 rounded-lg hover:text-cyan-400 hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Contact Us
            </button>
          </nav>

          {/* Action Buttons: Add Product, Repair Trigger, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Custom Product Add Button */}
            <button
              onClick={onOpenAddProduct}
              title="Add Custom Product / Photos"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Add Product</span>
            </button>

            {/* Repair CTA button */}
            <button
              onClick={() => onScrollToSection('repair')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span className="hidden xs:inline">Book</span> Repair
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center justify-center p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-950" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/98 border-b border-slate-800 px-4 py-4 space-y-2">
            <button
              onClick={() => {
                onScrollToSection('products');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-900 text-slate-200 font-medium"
            >
              Purifiers & Spare Parts Catalog
            </button>
            <button
              onClick={() => {
                onScrollToSection('repair');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-amber-950/40 border border-amber-900/50 text-amber-300 font-semibold flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Purifier Repair Section
              </span>
              <span className="text-[10px] uppercase font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                Doorstep
              </span>
            </button>
            <button
              onClick={() => {
                onScrollToSection('service-areas');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-900 text-slate-200 font-medium"
            >
              Service Areas (Birganj, Raxaul, Motihari...)
            </button>
            <button
              onClick={() => {
                onScrollToSection('contact');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-900 text-slate-200 font-medium"
            >
              Contact Information
            </button>
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              {onToggleHostMode && (
                <button
                  onClick={() => {
                    onToggleHostMode();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    isHostMode
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {isHostMode ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Host Mode: Active (Manage / Exit)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Unlock Host Mode (20-Digit Passcode)</span>
                    </>
                  )}
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onOpenAddProduct();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-cyan-400 flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Add Product
                </button>
                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Shop Settings / WhatsApp & Gmail Target Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">Shop Contact Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Configure the WhatsApp number and Gmail where customer orders and repair inquiries are routed upon 1-click submission.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Shop WhatsApp Number (Direct 1-Click Destination)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="9979804235755"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Current user set: +997 9804235755 (Opens directly on this chat)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Shop SMS Phone Number (Direct 1-Click SMS)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={editSms}
                    onChange={(e) => setEditSms(e.target.value)}
                    placeholder="9304643614"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dedicated 1-Click SMS number: 9304643614
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Shop Email (Direct 1-Click Gmail Destination)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="satiinternational4@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Direct Gmail recipient: satiinternational4@gmail.com
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Store Working Hours
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    placeholder="10:00 AM – 7:00 PM (Monday to Sunday)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Display hours shown on header and footer
                </span>
              </div>

              {/* Host Management Mode Switch in Settings */}
              {onToggleHostMode && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Host Management Mode</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Enables edit price tags, change photos, add or delete catalog items
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleHostMode}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isHostMode
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {isHostMode ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Active (Exit)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>20-Digit Unlock</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
