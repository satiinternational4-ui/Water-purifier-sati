import React from 'react';
import { 
  ShoppingCart, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  Check, 
  Eye, 
  Zap,
  Pencil,
  Trash2
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/dispatch';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isHostMode?: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickOrder,
  onViewDetails,
  isHostMode,
  onEditProduct,
  onDeleteProduct,
}) => {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-cyan-950/40 relative">
      
      {/* Host Controls Banner on Card (Only visible to Host) */}
      {isHostMode && (
        <div className="bg-amber-950/90 border-b border-amber-800/80 px-3 py-1.5 flex items-center justify-between z-20">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Host Controls
          </span>
          <div className="flex items-center gap-1.5">
            {onEditProduct && (
              <button
                type="button"
                onClick={() => onEditProduct(product)}
                className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                title="Edit Product, Image and Price Tag"
              >
                <Pencil className="w-2.5 h-2.5" />
                <span>Edit Price / Image</span>
              </button>
            )}
            {onDeleteProduct && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Host Action: Permanently remove "${product.name}" and its photo?`)) {
                    onDeleteProduct(product.id);
                  }
                }}
                className="px-2 py-0.5 rounded bg-rose-900 hover:bg-rose-800 text-rose-200 border border-rose-700 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                title="Remove Product from Catalog"
              >
                <Trash2 className="w-2.5 h-2.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Badges & Discount */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start mt-8 sm:mt-0">
        {product.badge && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500 text-slate-950 shadow-md">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Stock Status Indicator */}
      <div className="absolute top-3 right-3 z-10">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-sm border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          In Stock
        </span>
      </div>

      {/* Product Image Stage */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative w-full h-56 bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center p-2"
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // fallback placeholder if local image fails
            (e.target as HTMLImageElement).src = '/images/purifier.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

        {/* Hover Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="absolute inset-x-4 bottom-3 py-2 bg-slate-950/90 hover:bg-slate-900 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700/60 shadow-lg cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>View Full Specifications</span>
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-cyan-400">
              {product.category === 'purifiers' ? 'Water Purifier' : product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-slate-200">{product.rating || 4.8}</span>
              <span className="text-slate-500 text-[10px]">({product.reviewCount || 30}+)</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="font-bold text-slate-100 text-sm leading-snug line-clamp-2 hover:text-cyan-400 transition-colors cursor-pointer min-h-[2.5rem]"
          >
            {product.name}
          </h3>

          {/* Short Specs Pills */}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
            {product.specs.warranty && (
              <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                {product.specs.warranty}
              </span>
            )}
            {product.specs.capacity && (
              <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300">
                {product.specs.capacity}
              </span>
            )}
            {product.specs.voltage && (
              <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300">
                {product.specs.voltage}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA Controls */}
        <div className="pt-4 mt-3 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-lg font-black text-white">
                {formatCurrency(product.price)}
              </div>
              {product.originalPrice && (
                <div className="text-xs text-slate-500 line-through">
                  MRP {formatCurrency(product.originalPrice)}
                </div>
              )}
            </div>
            <span className="text-[10px] text-cyan-400/80 font-medium">
              Tax Incl. • Doorstep Available
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={() => onQuickOrder(product)}
              className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer hover:scale-[1.02]"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Order Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
