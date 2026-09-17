import React from 'react';
import { MapPin, Truck, Clock, PhoneCall, ShieldCheck } from 'lucide-react';
import { ServiceArea } from '../types';

interface ServiceAreaBannerProps {
  serviceAreas: ServiceArea[];
  selectedArea: ServiceArea | 'all';
  onSelectArea: (area: ServiceArea | 'all') => void;
  onBookRepairForArea: (area: ServiceArea) => void;
}

const AREA_DETAILS: Record<
  ServiceArea,
  { state: string; turnaround: string; landmark: string }
> = {
  Birganj: {
    state: 'Parsa, Nepal (Border Gateway)',
    turnaround: 'within 6hr to one day',
    landmark: 'Adarshnagar / Ghantaghar / Main Road',
  },
  Raxaul: {
    state: 'East Champaran, Bihar',
    turnaround: 'within 6hr to one day',
    landmark: 'Station Road / Customs Chowk / Bank Road',
  },
  'Laxmipur Noniyadih': {
    state: 'East Champaran, Bihar',
    turnaround: 'within 6hr to one day',
    landmark: 'Main Market & Residential Blocks',
  },
  Bettiah: {
    state: 'West Champaran, Bihar',
    turnaround: 'under 1 to 2 days',
    landmark: 'Lal Bazar / Supriya Road / Collectorate Area',
  },
  Motihari: {
    state: 'East Champaran, Bihar',
    turnaround: 'under 1 to 2 days',
    landmark: 'Chhatauni / Balua Chowk / Raja Bazar',
  },
  Sugauli: {
    state: 'East Champaran, Bihar',
    turnaround: 'under 1 to 2 days',
    landmark: 'Railway Junction / Bazaar Road',
  },
  'Other / Nearby': {
    state: 'Indo-Nepal Border Perimeter',
    turnaround: 'under 1 to 2 days',
    landmark: 'Covering nearby villages & towns',
  },
};

export const ServiceAreaBanner: React.FC<ServiceAreaBannerProps> = ({
  serviceAreas,
  selectedArea,
  onSelectArea,
  onBookRepairForArea,
}) => {
  return (
    <section id="service-areas" className="py-12 bg-slate-900/60 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4" />
              <span>Doorstep Delivery & Repair Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Areas Served by Sati International
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              We provide doorstep water purifier installation, emergency filter repair, and genuine spare parts delivery across these key zones:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectArea('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedArea === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Show All Areas
            </button>
          </div>
        </div>

        {/* Grid of Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceAreas.map((area) => {
            const details = AREA_DETAILS[area];
            const isSelected = selectedArea === area;

            return (
              <div
                key={area}
                onClick={() => onSelectArea(isSelected ? 'all' : area)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/50 text-cyan-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {area}
                      </h3>
                      <span className="text-[11px] text-slate-400 block">
                        {details?.state || 'Service Zone'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Doorstep Response:
                    </span>
                    <span className="font-semibold text-cyan-300">{details?.turnaround}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Hub coverage: {details?.landmark}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookRepairForArea(area);
                    }}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    Request Repair in {area} →
                  </button>
                  <span className="text-[10px] text-slate-500">Free Checkup*</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
