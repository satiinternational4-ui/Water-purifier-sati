import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  Trash2, 
  Tag, 
  Sparkles,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { convertDriveLinkToImageUrl } from '../utils/dispatch';
import { optimizeImageFile, ImageOptimizationResult } from '../utils/imageOptimizer';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSaveProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  sessionToken?: string | null;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSaveProduct,
  onDeleteProduct,
  sessionToken,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('filters');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [warranty, setWarranty] = useState('');
  const [badge, setBadge] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageStats, setImageStats] = useState<ImageOptimizationResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savedToFolder, setSavedToFolder] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price);
      setOriginalPrice(product.originalPrice || Math.round(product.price * 1.3));
      setImageUrl(product.image);
      setImagePreview(product.image);
      setDescription(product.description);
      setBrand(product.specs.brand || 'Sati International');
      setWarranty(product.specs.warranty || '6 Months Warranty');
      setBadge(product.badge || '');
      setImageStats(null);
      setUploadError(null);
      setSavedToFolder(Boolean(product.image && product.image.startsWith('/images/')));
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setUploadError(null);
    setImageStats(null);
    setSavedToFolder(false);

    try {
      const result = await optimizeImageFile(file, {
        maxDimension: 1920,
        quality: 0.86,
        maxSizeMB: 50,
      });

      setImagePreview(result.dataUrl);
      setImageUrl(result.dataUrl);
      setImageStats(result);

      // Save directly into website main folder (/public/images/products/)
      if (sessionToken) {
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl: result.dataUrl,
              filenameHint: file.name,
              token: sessionToken,
            }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            setImageUrl(data.url);
            setImagePreview(data.url);
            setSavedToFolder(true);
          }
        } catch (serverErr) {
          console.warn('Direct upload error (will be saved during catalog sync):', serverErr);
        }
      }
    } catch (err: any) {
      console.error('Error optimizing image:', err);
      setUploadError(err.message || 'Failed to process image. Please try another file.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleUrlChange = (val: string) => {
    const converted = convertDriveLinkToImageUrl(val.trim());
    setImageUrl(converted);
    setImagePreview(converted);
    setImageStats(null);
    setUploadError(null);
    setSavedToFolder(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product title is required');
      return;
    }

    const updated: Product = {
      ...product,
      name: name.trim(),
      category,
      price: Number(price) || 0,
      originalPrice: Number(originalPrice) || undefined,
      image: imageUrl || imagePreview || product.image,
      description: description.trim(),
      specs: {
        ...product.specs,
        brand: brand.trim(),
        warranty: warranty.trim(),
      },
      badge: badge.trim() || undefined,
    };

    onSaveProduct(updated);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently remove "${product.name}" and its photo from the website?`)) {
      onDeleteProduct(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Host Management Control
              </span>
              <h3 className="text-lg font-bold text-white">Edit Product Photo &amp; Price Tag</h3>
            </div>
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
          
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              As the website host, you can replace this product&apos;s photo, change its selling price and MRP tag, or delete it completely.
            </span>
          </div>

          {/* Photo management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Product Photo
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">
                Supports up to 50MB (e.g. 30MB Photos)
              </span>
            </div>

            {/* Current / New Image Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-44 flex items-center justify-center p-2">
              <img
                src={imagePreview || product.image}
                alt="Product preview"
                referrerPolicy="no-referrer"
                className="h-full w-auto object-contain rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-950 hover:bg-slate-800/50 transition-colors">
                <Upload className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-xs font-semibold text-slate-200">Replace from Device</span>
                <span className="text-[10px] text-slate-400">Camera / Gallery (Up to 50MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isProcessingImage}
                  className="hidden"
                />
              </label>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-cyan-400" />
                  Paste Image / Drive Link
                </span>
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Processing Large Image Loader */}
            {isProcessingImage && (
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center gap-3 text-xs text-cyan-300 animate-pulse">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                <div>
                  <p className="font-bold">Optimizing high-resolution photo...</p>
                  <p className="text-[11px] text-slate-400">Processing large file (up to 50MB) into high-definition web format.</p>
                </div>
              </div>
            )}

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{uploadError}</p>
                  <p className="text-[10px] text-rose-300 mt-0.5">Please ensure your image is under 50MB and in standard format.</p>
                </div>
              </div>
            )}

            {/* Image Stats Badge */}
            {imageStats && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Original:</strong> {imageStats.originalSizeFormatted} ➔ <strong>Optimized:</strong> {imageStats.optimizedSizeFormatted} ({imageStats.savingsPercentage}% saved)
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  HD Ready
                </span>
              </div>
            )}

            {/* Saved to Website Folder Confirmation */}
            {savedToFolder && (
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-700/50 flex items-center justify-between text-xs text-cyan-300">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate font-mono text-[11px]">
                    Main Folder: {imageUrl.replace('/images/products/', 'public/images/products/')}
                  </span>
                </div>
                <span className="text-[10px] bg-cyan-900/90 text-cyan-200 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                  Ready For Deploy
                </span>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Pricing Tag Controls */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                Selling Price Tag (₹) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-base font-bold text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Original MRP Tag (₹)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-base text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
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
                <option value="pumps">Booster Pumps &amp; Power</option>
                <option value="filters">Pre-Filters &amp; Cartridges</option>
                <option value="minerals">Alkaline &amp; Minerals</option>
                <option value="fittings">Valves, Taps &amp; Fittings</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Badge (Optional)
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

          {/* Brand & Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Warranty
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Remove / Delete Image &amp; Product</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
