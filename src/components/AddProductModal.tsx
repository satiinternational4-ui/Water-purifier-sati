import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Check, 
  Sparkles,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { convertDriveLinkToImageUrl } from '../utils/dispatch';
import { optimizeImageFile, ImageOptimizationResult } from '../utils/imageOptimizer';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('filters');
  const [price, setPrice] = useState<number>(850);
  const [originalPrice, setOriginalPrice] = useState<number>(1200);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('Sati International');
  const [warranty, setWarranty] = useState('6 Months Replacement Warranty');
  const [badge, setBadge] = useState('New Arrival');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageStats, setImageStats] = useState<ImageOptimizationResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle local file upload with support for large high-res images up to 50MB (e.g. 30MB camera photos)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setUploadError(null);
    setImageStats(null);

    try {
      const result = await optimizeImageFile(file, {
        maxDimension: 1920,
        quality: 0.86,
        maxSizeMB: 50,
      });

      setImagePreview(result.dataUrl);
      setImageUrl(result.dataUrl);
      setImageStats(result);

      if (!name) {
        // Auto-assign clean title from file name
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setName(`Sati ${cleanName}`);
      }
    } catch (err: any) {
      console.error('Error optimizing image:', err);
      setUploadError(err.message || 'Failed to process image. Please try another file.');
    } finally {
      setIsProcessingImage(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  // Handle URL change (auto-detecting Google Drive links)
  const handleUrlChange = (val: string) => {
    const converted = convertDriveLinkToImageUrl(val.trim());
    setImageUrl(converted);
    setImagePreview(converted);
    setImageStats(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please provide a product title');
      return;
    }

    const newProd: Product = {
      id: `custom-prod-${Date.now()}`,
      name: name.trim(),
      category: (category as ProductCategory) || 'filters',
      price: Number(price) || 500,
      originalPrice: Number(originalPrice) || Number(price) * 1.3,
      image: imagePreview || '/images/purifier.jpg',
      description: description.trim() || `High quality ${name} distributed by Sati International with doorstep installation and genuine parts warranty.`,
      specs: {
        brand: brand.trim() || 'Sati International',
        warranty: warranty.trim() || 'Standard Shop Warranty',
        compatibility: 'Universal RO Compatibility',
      },
      features: [
        '100% Genuine Tested Component',
        'Doorstep delivery available across all 6 service areas',
        'Technician installation available upon request',
      ],
      inStock: true,
      badge: badge.trim() || 'Genuine Part',
      rating: 5.0,
      reviewCount: 1,
    };

    onAddProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Add Product / Upload Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Upload a picture from your device or paste an image link (Google Drive share links are automatically transformed into viewable images).
            </span>
          </div>

          {/* Image input options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Product Photo *
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">
                Supports up to 50MB (e.g. 30MB Camera Photos)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File upload trigger */}
              <label className="border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950 hover:bg-slate-800/50 transition-colors relative">
                <Upload className="w-5 h-5 text-cyan-400 mb-1" />
                <span className="text-xs font-semibold text-slate-200">Upload from Device</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Camera / Gallery (Up to 50MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isProcessingImage}
                  className="hidden"
                />
              </label>

              {/* Paste URL */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-cyan-400" />
                  Paste Image / Drive URL
                </span>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Processing Large Image Loader */}
            {isProcessingImage && (
              <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center gap-3 text-xs text-cyan-300 animate-pulse">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                <div>
                  <p className="font-bold">Optimizing high-resolution photo...</p>
                  <p className="text-[11px] text-slate-400">Scaling large file (up to 50MB) to crystal-clear HD for instant saving.</p>
                </div>
              </div>
            )}

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{uploadError}</p>
                  <p className="text-[10px] text-rose-300 mt-0.5">Please ensure your image file is under 50MB and in standard format (JPG, PNG, WEBP).</p>
                </div>
              </div>
            )}

            {/* Image Stats Badge */}
            {imageStats && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Original:</strong> {imageStats.originalSizeFormatted} ➔ <strong>Optimized:</strong> {imageStats.optimizedSizeFormatted} ({imageStats.savingsPercentage}% reduction)
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Crystal Clear HD
                </span>
              </div>
            )}

            {/* Image Preview Box */}
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-40 flex items-center justify-center p-2">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  referrerPolicy="no-referrer"
                  className="h-full w-auto object-contain rounded-lg"
                  onError={() => {
                    // if remote link fails
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setImageUrl('');
                    setImageStats(null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/90 text-rose-400 hover:text-white border border-slate-700 cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Assigned Product Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sati Heavy Duty 100 GPD Booster Pump or 10 Inch Spun Candle"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Category & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="purifiers">RO Water Purifiers</option>
                <option value="membranes">RO Membranes</option>
                <option value="pumps">Booster Pumps & Power</option>
                <option value="filters">Pre-Filters & Cartridges</option>
                <option value="minerals">Alkaline & Minerals</option>
                <option value="fittings">Valves, Taps & Fittings</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Best Seller / Genuine Part"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Price & MRP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Original MRP (₹)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Warranty & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Sati International"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Warranty Information
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="1 Year Warranty"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Description / Technical Specs
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="High rejection rate, copper winding motor, compatible with domestic RO systems..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Add to Catalog &amp; Store
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
