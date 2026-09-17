import React from 'react';
import { 
  X, 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  Check, 
  Star, 
  MapPin, 
  Truck,
  Droplets
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/dispatch';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onQuickOrder,
}) => {
  if (!product) return null;

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500 text-slate-950">
              {product.category}
            </span>
            {product.badge && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                {product.badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Image Preview Stage */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-2 overflow-hidden flex items-center justify-center relative">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-72 object-cover rounded-xl"
              />
              <div className="absolute bottom-4 left-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  100% Genuine Tested Part
                </span>
              </div>
            </div>

            {/* Product Details Overview */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-200 ml-1">
                      {product.rating || 4.9}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">
                    {product.reviewCount || 40}+ Verified Customer Ratings
                  </span>
                </div>
              </div>

              {/* Price block */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black text-white">
                    {formatCurrency(product.price)}
                  </div>
                  {product.originalPrice && (
                    <div className="text-xs text-slate-500 line-through">
                      MRP {formatCurrency(product.originalPrice)}
                    </div>
                  )}
                </div>
                {discount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Save {discount}% Today
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>

              {/* Service Areas Doorstep Note */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-900/60 text-xs text-cyan-200 flex items-start gap-2">
                <Truck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Doorstep delivery & technician support in <strong>Birganj, Raxaul, Laxmipur Noniyadih, Bettiah, Motihari, and Sugauli</strong>.
                </span>
              </div>
            </div>

          </div>

          {/* Detailed Specifications Table */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Technical Specifications & Compatibility
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {product.specs.brand && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Brand / Series</span>
                  <span className="font-semibold text-slate-200">{product.specs.brand}</span>
                </div>
              )}
              {product.specs.model && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Model</span>
                  <span className="font-semibold text-slate-200">{product.specs.model}</span>
                </div>
              )}
              {product.specs.capacity && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Capacity / Flow</span>
                  <span className="font-semibold text-slate-200">{product.specs.capacity}</span>
                </div>
              )}
              {product.specs.voltage && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Voltage / Power</span>
                  <span className="font-semibold text-slate-200">{product.specs.voltage}</span>
                </div>
              )}
              {product.specs.warranty && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Warranty</span>
                  <span className="font-semibold text-emerald-400">{product.specs.warranty}</span>
                </div>
              )}
              {product.specs.compatibility && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 sm:col-span-2">
                  <span className="text-slate-500 block text-[10px]">Compatibility</span>
                  <span className="font-semibold text-slate-200">{product.specs.compatibility}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Features Bullet List */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Key Performance Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product.features.map((feat, index) => (
                  <div key={index} className="flex items-start gap-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onQuickOrder(product);
              }}
              className="py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>1-Click Order Now</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
